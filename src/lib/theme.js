import { useSyncExternalStore } from 'react'

let themeMem = null
let hasLocalStorage = null

function canUseLocalStorage() {
  try {
    const key = '__t__' + String(Date.now())
    localStorage.setItem(key, '1')
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

function getHasLocalStorage() {
  if (hasLocalStorage === null) hasLocalStorage = canUseLocalStorage()
  return hasLocalStorage
}

function readStoredTheme() {
  if (getHasLocalStorage()) {
    try {
      return localStorage.getItem('theme')
    } catch {
      return themeMem
    }
  }
  return themeMem
}

function writeStoredTheme(value) {
  themeMem = value
  if (!getHasLocalStorage()) return
  try {
    localStorage.setItem('theme', value)
  } catch {
    // ignore
  }
}

function systemTheme() {
  const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null
  return mq && mq.matches ? 'dark' : 'light'
}

function initialTheme() {
  const stored = readStoredTheme()
  return stored === 'light' || stored === 'dark' ? stored : systemTheme()
}

const listeners = new Set()
let current = typeof window === 'undefined' ? 'light' : initialTheme()

function apply(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff')
}

if (typeof window !== 'undefined') {
  apply(current)
  const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null
  if (mq) {
    const onChange = (event) => {
      const stored = readStoredTheme()
      if (stored === 'light' || stored === 'dark') return
      setTheme(event.matches ? 'dark' : 'light', false)
    }
    if (mq.addEventListener) mq.addEventListener('change', onChange)
    else mq.addListener(onChange)
  }
}

export function setTheme(next, persist = true) {
  if (next === current) return
  current = next
  if (persist) writeStoredTheme(next)
  apply(next)
  listeners.forEach((fn) => fn())
}

export function toggleTheme() {
  setTheme(current === 'dark' ? 'light' : 'dark')
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useTheme() {
  return useSyncExternalStore(subscribe, () => current, () => 'light')
}

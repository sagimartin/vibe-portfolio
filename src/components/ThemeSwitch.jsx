import { useEffect, useState } from 'react'

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
  if (hasLocalStorage === null) {
    hasLocalStorage = canUseLocalStorage()
  }
  return hasLocalStorage
}

function safeGetTheme() {
  if (getHasLocalStorage()) {
    try {
      return localStorage.getItem('theme')
    } catch {
      return themeMem
    }
  }
  return themeMem
}

function safeSetTheme(value) {
  themeMem = value
  if (getHasLocalStorage()) {
    try {
      localStorage.setItem('theme', value)
    } catch {
      return
    }
  }
}

function getSystemTheme() {
  const mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null
  return mediaQuery && mediaQuery.matches ? 'dark' : 'light'
}

function ThemeSwitch(props) {
  const isVisible = Boolean(props && props.isVisible)
  const initialTheme = safeGetTheme()
  const startTheme = initialTheme === 'light' || initialTheme === 'dark' ? initialTheme : getSystemTheme()
  const [theme, setTheme] = useState(startTheme)

  useEffect(function () {
    document.documentElement.setAttribute('data-theme', theme)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff')
    }
  }, [theme])

  useEffect(function () {
    const mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null
    if (!mediaQuery) return undefined

    function onSystemThemeChange(event) {
      const stored = safeGetTheme()
      const hasUserPreference = stored === 'light' || stored === 'dark'
      if (hasUserPreference) return
      setTheme(event && event.matches ? 'dark' : 'light')
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', onSystemThemeChange)
      return function () {
        mediaQuery.removeEventListener('change', onSystemThemeChange)
      }
    }

    mediaQuery.addListener(onSystemThemeChange)
    return function () {
      mediaQuery.removeListener(onSystemThemeChange)
    }
  }, [])

  function toggleTheme() {
    setTheme(function (current) {
      const next = current === 'dark' ? 'light' : 'dark'
      safeSetTheme(next)
      return next
    })
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleTheme()
    }
  }

  return (
    <div
      className={isVisible ? 'theme-switch is-visible' : 'theme-switch'}
      role="switch"
      aria-checked={theme === 'dark'}
      aria-label="Toggle theme"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      onClick={toggleTheme}
      onKeyDown={handleKeyDown}
    >
      <span className="theme-switch-thumb" aria-hidden="true">
        <svg className="thumb-icon icon-sun" viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor">
          <circle cx="12" cy="12" r="5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="12" y1="1" x2="12" y2="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="12" y1="21" x2="12" y2="23" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="1" y1="12" x2="3" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="21" y1="12" x2="23" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg className="thumb-icon icon-moon" viewBox="0 0 20 20" aria-hidden="true" stroke="currentColor">
          <path
            d="M18.9618 10.79C18.8045 12.4922 18.1657 14.1144 17.1201 15.4668C16.0744 16.8192 14.6653 17.8458 13.0575 18.4266C11.4497 19.0073 9.7098 19.1181 8.04132 18.7461C6.37283 18.3741 4.84481 17.5346 3.63604 16.3258C2.42727 15.117 1.58775 13.589 1.21572 11.9205C0.843691 10.252 0.954531 8.5121 1.53528 6.90431C2.11602 5.29652 3.14265 3.88738 4.49503 2.84177C5.84741 1.79616 7.46961 1.15732 9.17182 1.00002C8.17523 2.34828 7.69566 4.00946 7.82035 5.68143C7.94503 7.35339 8.66568 8.92507 9.85122 10.1106C11.0368 11.2962 12.6084 12.0168 14.2804 12.1415C15.9524 12.2662 17.6135 11.7866 18.9618 10.79Z"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <div className="theme-switch-icons">
        <svg className="icon-sun" viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor">
          <circle cx="12" cy="12" r="5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="12" y1="1" x2="12" y2="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="12" y1="21" x2="12" y2="23" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="1" y1="12" x2="3" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="21" y1="12" x2="23" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg className="icon-moon" viewBox="0 0 20 20" aria-hidden="true" stroke="currentColor">
          <path
            d="M18.9618 10.79C18.8045 12.4922 18.1657 14.1144 17.1201 15.4668C16.0744 16.8192 14.6653 17.8458 13.0575 18.4266C11.4497 19.0073 9.7098 19.1181 8.04132 18.7461C6.37283 18.3741 4.84481 17.5346 3.63604 16.3258C2.42727 15.117 1.58775 13.589 1.21572 11.9205C0.843691 10.252 0.954531 8.5121 1.53528 6.90431C2.11602 5.29652 3.14265 3.88738 4.49503 2.84177C5.84741 1.79616 7.46961 1.15732 9.17182 1.00002C8.17523 2.34828 7.69566 4.00946 7.82035 5.68143C7.94503 7.35339 8.66568 8.92507 9.85122 10.1106C11.0368 11.2962 12.6084 12.0168 14.2804 12.1415C15.9524 12.2662 17.6135 11.7866 18.9618 10.79Z"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}

export default ThemeSwitch

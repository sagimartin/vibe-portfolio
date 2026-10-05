import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion, goToSection } from '../lib/motion.js'

function Hero({ strings, scrollLabel, ariaLabel }) {
  const [line1On, setLine1On] = useState(false)
  const [line2On, setLine2On] = useState(false)
  const [rotOn, setRotOn] = useState(false)
  const [typed, setTyped] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [hintReady, setHintReady] = useState(false)
  const introDone = useRef(false)
  const roles = strings.roles
  const rolesKey = roles.join('|')

  useEffect(() => {
    const timers = []
    const reduce = prefersReducedMotion()

    if (reduce) {
      introDone.current = true
      timers.push(
        setTimeout(() => {
          setLine1On(true)
          setLine2On(true)
          setRotOn(true)
        }, 0)
      )
      return () => timers.forEach(clearTimeout)
    }

    if (!introDone.current) {
      timers.push(setTimeout(() => setLine1On(true), 300))
      timers.push(setTimeout(() => setLine2On(true), 1800))
      timers.push(
        setTimeout(() => {
          introDone.current = true
          setRotOn(true)
        }, 3000)
      )
    } else {
      timers.push(
        setTimeout(() => {
          setLine1On(true)
          setLine2On(true)
          setRotOn(true)
        }, 0)
      )
    }
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (!rotOn) return undefined
    if (prefersReducedMotion()) {
      const t = setTimeout(() => {
        setTyped(roles[0])
        setHintReady(true)
      }, 0)
      return () => clearTimeout(t)
    }

    let timer = 0
    let index = 0
    let text = ''
    let deleting = false

    function step() {
      const current = roles[index % roles.length]
      let delay = 70

      if (!deleting) {
        if (text.length < current.length) {
          text = current.slice(0, text.length + 1)
        } else {
          deleting = true
          delay = 1400
          if (index === roles.length - 1) setHintReady(true)
        }
      } else if (text.length > 0) {
        text = current.slice(0, text.length - 1)
        delay = 38
      } else {
        deleting = false
        index += 1
        delay = 300
      }
      setTyped(text)
      timer = setTimeout(step, delay)
    }

    step()
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotOn, rolesKey])

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className="hero" id="hero" aria-label={ariaLabel}>
      <div className="wrap">
        <div className="hero-block">
          <h1 className="hero-title" aria-label={strings.greeting + ' ' + strings.beforeName + 'Martin' + strings.afterName}>
            <span className={line1On ? 'on' : ''}>{strings.greeting}</span>
            <span className={line2On ? 'on' : ''}>
              {strings.beforeName}
              <span className="hero-name">Martin</span>
              {strings.afterName}
              <span className="hero-ast" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M12 1.5v21M2.9 6.75l18.2 10.5M2.9 17.25l18.2-10.5" />
                </svg>
              </span>
            </span>
          </h1>
          <div className={rotOn ? 'rot on' : 'rot'} aria-live="polite">
            <span>*</span>
            <span className="txt">{typed}</span>
            <span className="caret" aria-hidden="true" />
          </div>
        </div>
      </div>
      <button
        type="button"
        className={'scrollhint' + (hintReady ? ' ready' : '') + (scrolled ? ' gone' : '')}
        tabIndex={scrolled || !hintReady ? -1 : 0}
        aria-hidden={!hintReady}
        onClick={() => goToSection('work')}
      >
        <span>{scrollLabel}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M6 13l6 6 6-6" />
        </svg>
      </button>
    </section>
  )
}

export default Hero

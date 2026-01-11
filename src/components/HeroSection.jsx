import { useEffect, useRef, useState } from 'react'

const EMPTY_ROTATING = []

function HeroSection(props) {
  var greeting = props.greeting
  var beforeName = props.beforeName
  var afterName = props.afterName
  var rotating = Array.isArray(props.rotating) ? props.rotating : EMPTY_ROTATING
  var onIntroDone = props.onIntroDone
  var ariaLabel = props.ariaLabel || 'Home'
  var introDoneRef = useRef(false)
  var lineTimersRef = useRef([])
  var [isVisible, setIsVisible] = useState(false)
  var [isPaused, setIsPaused] = useState(false)
  var [showRotator, setShowRotator] = useState(false)
  var [lineStage, setLineStage] = useState(0)
  var [activeIndex, setActiveIndex] = useState(0)
  var [displayText, setDisplayText] = useState('')
  var [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    var rafId = requestAnimationFrame(function () {
      setIsVisible(true)
    })

    return function () {
      cancelAnimationFrame(rafId)
    }
  }, [])

  useEffect(() => {
    setActiveIndex(0)
    setDisplayText('')
    setIsDeleting(false)
    setShowRotator(false)
    setLineStage(0)
    introDoneRef.current = false
    lineTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
    lineTimersRef.current = []
  }, [rotating])

  useEffect(() => {
    if (!rotating.length) return undefined
    var reduceMotion = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
    if (reduceMotion) {
      setLineStage(2)
      setShowRotator(true)
      if (!introDoneRef.current && typeof onIntroDone === 'function') {
        introDoneRef.current = true
        onIntroDone()
      }
      return undefined
    }

    var helloDelay = 300
    var nameDelay = 1500
    var rotatorDelay = 1200

    lineTimersRef.current = [
      window.setTimeout(function () {
        setLineStage(1)
      }, helloDelay),
      window.setTimeout(function () {
        setLineStage(2)
      }, helloDelay + nameDelay),
      window.setTimeout(function () {
        setShowRotator(true)
      }, helloDelay + nameDelay + rotatorDelay)
    ]

    return function () {
      lineTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
      lineTimersRef.current = []
    }
  }, [rotating, onIntroDone])

  useEffect(() => {
    if (!rotating.length) return undefined
    if (!showRotator || isPaused) return undefined
    var reduceMotion = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
    if (reduceMotion) {
      setDisplayText(rotating[0] || '')
      return undefined
    }

    var typingSpeed = 65
    var deletingSpeed = 40
    var pauseAfterTyped = 900
    var pauseAfterDeleted = 300
    var current = rotating[activeIndex] || ''
    var nextDisplay = displayText
    var nextDeleting = isDeleting
    var nextIndex = activeIndex
    var delay = typingSpeed

    if (!isDeleting) {
      if (displayText.length < current.length) {
        nextDisplay = current.slice(0, displayText.length + 1)
        delay = typingSpeed
      } else {
        if (activeIndex === rotating.length - 1) {
          if (!introDoneRef.current && typeof onIntroDone === 'function') {
            introDoneRef.current = true
            onIntroDone()
          }
        }
        nextDeleting = true
        delay = pauseAfterTyped
      }
    } else if (displayText.length > 0) {
      nextDisplay = current.slice(0, displayText.length - 1)
      delay = deletingSpeed
    } else {
      nextDeleting = false
      nextIndex = (activeIndex + 1) % rotating.length
      delay = pauseAfterDeleted
    }

    var timeoutId = window.setTimeout(function () {
      if (nextIndex !== activeIndex) setActiveIndex(nextIndex)
      if (nextDeleting !== isDeleting) setIsDeleting(nextDeleting)
      if (nextDisplay !== displayText) setDisplayText(nextDisplay)
    }, delay)

    return function () {
      window.clearTimeout(timeoutId)
    }
  }, [rotating, activeIndex, displayText, isDeleting, isPaused, showRotator, onIntroDone])

  return (
    <section id="hero" aria-label={ariaLabel}>
      <div className="container section-inner">
        <div className="hero-text-block">
          <h1
            className={
              isVisible
                ? 'hero-title hero-title-sequence hero-enter is-visible'
                : 'hero-title hero-title-sequence hero-enter'
            }
          >
            <span
              className={
                lineStage >= 1
                  ? 'hero-title-line hero-title-line-1 is-visible'
                  : 'hero-title-line hero-title-line-1'
              }
            >
              {greeting}
            </span>
            <span
              className={
                lineStage >= 2
                  ? 'hero-title-line hero-title-line-2 is-visible'
                  : 'hero-title-line hero-title-line-2'
              }
            >
              {beforeName}
              <span className="hero-name">Martin</span>
              {afterName}
              <span className="hero-asterisk">*</span>
            </span>
          </h1>
          {rotating.length ? (
            <div
              className={showRotator ? 'hero-rotator is-visible' : 'hero-rotator'}
              aria-live="polite"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
            >
              <span className="hero-rotator-mark">*</span>
              <span className="hero-rotator-text">{displayText}</span>
              <span className="hero-rotator-caret" aria-hidden="true" />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default HeroSection

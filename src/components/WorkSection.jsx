import { useEffect, useRef, useState } from 'react'
import WorkCard from './WorkCard.jsx'

const SECONDS_PER_VIEWPORT = 24
const RESUME_DELAY = 2000
const DRAG_THRESHOLD = 6
const SET_COUNT = 3
const MIDDLE_SET_INDEX = 1
const DEFAULT_DURATION = 30
const TRANSITION_DURATION = 280

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4.5c0-.9 1-1.45 1.76-.96l11 6.5a1.13 1.13 0 0 1 0 1.92l-11 6.5A1.13 1.13 0 0 1 7 17.5v-13Z" fill="currentColor" />
    </svg>
  )
}

function WorkSection(props) {
  const cards = props.cards
  const onOpenProject = props.onOpenProject
  const title = props.title || 'Selected Work'
  const ctaLabel = props.ctaLabel
  const ariaLabel = props.ariaLabel || 'Work'
  const trackRef = useRef(null)
  const [viewMode, setViewMode] = useState('carousel')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const pendingModeRef = useRef(null)
  const transitionTimeoutRef = useRef(null)

  function switchView(mode) {
    if (mode === viewMode || isTransitioning) return
    pendingModeRef.current = mode
    setIsTransitioning(true)
    transitionTimeoutRef.current = window.setTimeout(() => {
      setViewMode(pendingModeRef.current)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsTransitioning(false))
      })
    }, TRANSITION_DURATION)
  }

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) window.clearTimeout(transitionTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (viewMode !== 'carousel') return undefined
    const node = trackRef.current
    if (!node || !cards.length) return undefined

    const state = {
      isManual: false,
      isDragging: false,
      hasDragged: false,
      dragStartX: 0,
      dragStartTranslateX: 0,
      resumeTimeoutId: null,
      setWidth: 0,
      duration: DEFAULT_DURATION
    }

    function measure() {
      const fullWidth = node.getBoundingClientRect().width
      state.setWidth = fullWidth / SET_COUNT
      const targetSpeed = window.innerWidth / SECONDS_PER_VIEWPORT
      state.duration = state.setWidth > 0 && targetSpeed > 0 ? state.setWidth / targetSpeed : DEFAULT_DURATION
      node.style.setProperty('--work-track-duration', state.duration + 's')
    }

    function getCurrentTranslateX() {
      const transform = window.getComputedStyle(node).transform
      if (!transform || transform === 'none') return 0
      const match = transform.match(/matrix\(([^)]+)\)/)
      if (!match) return 0
      const parts = match[1].split(',').map(Number)
      return parts.length >= 6 ? parts[4] : 0
    }

    function getManualX() {
      const match = node.style.transform.match(/translateX\(([-\d.]+)px\)/)
      return match ? parseFloat(match[1]) : 0
    }

    function wrapX(x) {
      const setWidth = state.setWidth
      if (setWidth <= 0) return x
      if (x <= -setWidth * 2) return x + setWidth
      if (x > 0) return x - setWidth
      return x
    }

    function enterManual() {
      if (state.isManual) return
      const currentX = getCurrentTranslateX()
      state.isManual = true
      node.style.animation = 'none'
      node.style.transform = 'translateX(' + currentX + 'px)'
    }

    function exitManual() {
      if (!state.isManual) return
      state.isManual = false
      const currentX = getManualX()
      const setWidth = state.setWidth
      const progress = setWidth > 0 ? Math.min(Math.max(-currentX / setWidth, 0), 1) : 0
      node.style.transform = ''
      node.style.animation = ''
      node.style.animationDuration = state.duration + 's'
      node.style.animationDelay = -progress * state.duration + 's'
    }

    measure()

    function clearResumeTimer() {
      if (state.resumeTimeoutId) {
        window.clearTimeout(state.resumeTimeoutId)
        state.resumeTimeoutId = null
      }
    }

    function scheduleResume() {
      clearResumeTimer()
      state.resumeTimeoutId = window.setTimeout(() => {
        state.resumeTimeoutId = null
        if (!state.isDragging) exitManual()
      }, RESUME_DELAY)
    }

    function handleHoverMove() {
      enterManual()
      clearResumeTimer()
    }

    function handleMouseLeave() {
      if (state.isDragging) return
      scheduleResume()
    }

    function handleWheel(event) {
      if (!state.isManual) return
      const isMostlyVertical = Math.abs(event.deltaY) > Math.abs(event.deltaX)
      if (!isMostlyVertical) return
      event.preventDefault()
      clearResumeTimer()
      node.style.transform = 'translateX(' + wrapX(getManualX() - event.deltaY) + 'px)'
    }

    function pointerX(event) {
      return event.touches && event.touches.length ? event.touches[0].clientX : event.clientX
    }

    function startDrag(event) {
      handleHoverMove()
      state.isDragging = true
      state.hasDragged = false
      state.dragStartX = pointerX(event)
      state.dragStartTranslateX = getManualX()
      node.classList.add('is-dragging')
    }

    function handleMouseDown(event) {
      if (event.button !== 0) return
      startDrag(event)
    }

    function handleTouchStart(event) {
      startDrag(event)
    }

    function moveDrag(event) {
      if (!state.isDragging) return
      const deltaX = pointerX(event) - state.dragStartX
      if (!state.hasDragged && Math.abs(deltaX) > DRAG_THRESHOLD) {
        state.hasDragged = true
      }
      node.style.transform = 'translateX(' + wrapX(state.dragStartTranslateX + deltaX) + 'px)'
    }

    function endDrag() {
      if (!state.isDragging) return
      state.isDragging = false
      node.classList.remove('is-dragging')
      scheduleResume()
    }

    function handleClickCapture(event) {
      if (state.hasDragged) {
        event.stopPropagation()
        event.preventDefault()
        state.hasDragged = false
      }
    }

    function handleResize() {
      measure()
    }

    node.addEventListener('mousemove', handleHoverMove)
    node.addEventListener('mouseleave', handleMouseLeave)
    node.addEventListener('wheel', handleWheel, { passive: false })
    node.addEventListener('mousedown', handleMouseDown)
    node.addEventListener('touchstart', handleTouchStart, { passive: true })
    node.addEventListener('click', handleClickCapture, true)
    window.addEventListener('mousemove', moveDrag)
    window.addEventListener('touchmove', moveDrag, { passive: true })
    window.addEventListener('mouseup', endDrag)
    window.addEventListener('touchend', endDrag)
    window.addEventListener('resize', handleResize)

    return () => {
      node.removeEventListener('mousemove', handleHoverMove)
      node.removeEventListener('mouseleave', handleMouseLeave)
      node.removeEventListener('wheel', handleWheel)
      node.removeEventListener('mousedown', handleMouseDown)
      node.removeEventListener('touchstart', handleTouchStart)
      node.removeEventListener('click', handleClickCapture, true)
      window.removeEventListener('mousemove', moveDrag)
      window.removeEventListener('touchmove', moveDrag)
      window.removeEventListener('mouseup', endDrag)
      window.removeEventListener('touchend', endDrag)
      window.removeEventListener('resize', handleResize)
      clearResumeTimer()
    }
  }, [cards, viewMode])

  return (
    <section id="work" aria-label={ariaLabel} className="work-section">
      <div className="container section-inner work-section-inner">
        <h2 className="section-title reveal delay-1">{title}</h2>
        <div className={isTransitioning ? 'work-view-stage is-transitioning' : 'work-view-stage'}>
          {viewMode === 'carousel' ? (
            <div className="work-track-viewport">
              <div className="grid" ref={trackRef}>
                {[0, 1, 2].map(function (setIndex) {
                  return cards.map(function (card) {
                    return (
                      <WorkCard
                        key={setIndex + '-' + card.id}
                        card={card}
                        ctaLabel={ctaLabel}
                        onOpen={onOpenProject}
                        hidden={setIndex !== MIDDLE_SET_INDEX}
                      />
                    )
                  })
                })}
              </div>
            </div>
          ) : (
            <div className="work-bento">
              {cards.map(function (card) {
                return (
                  <WorkCard
                    key={card.id}
                    card={card}
                    ctaLabel={ctaLabel}
                    onOpen={onOpenProject}
                  />
                )
              })}
            </div>
          )}
        </div>
        <div className="work-view-toggle">
          <button
            type="button"
            className="work-view-btn"
            aria-label={viewMode === 'carousel' ? 'Switch to grid view' : 'Switch to autoplay view'}
            onClick={function () {
              switchView(viewMode === 'carousel' ? 'grid' : 'carousel')
            }}
          >
            <span className={viewMode === 'carousel' ? 'work-view-icon is-active' : 'work-view-icon'}>
              <GridIcon />
            </span>
            <span className={viewMode === 'grid' ? 'work-view-icon is-active' : 'work-view-icon'}>
              <PlayIcon />
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}

export default WorkSection

import { useEffect, useRef, useState } from 'react'
import WorkCard from './WorkCard.jsx'

const TARGET_SPEED = 35
const MAX_FRAME_SECONDS = 0.05
const RESUME_DELAY = 2000
const DRAG_THRESHOLD = 6
const SET_COUNT = 3
const MIDDLE_SET_INDEX = 1
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
  const sectionRef = useRef(null)
  const viewportRef = useRef(null)
  const [viewMode, setViewMode] = useState('carousel')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const pendingModeRef = useRef(null)
  const transitionTimeoutRef = useRef(null)

  function switchView(mode) {
    if (mode === viewMode || isTransitioning) return
    pendingModeRef.current = mode
    setIsTransitioning(true)
    transitionTimeoutRef.current = window.setTimeout(() => {
      const nextMode = pendingModeRef.current
      setViewMode(nextMode)
      requestAnimationFrame(() => {
        if (nextMode === 'carousel' && viewportRef.current) {
          viewportRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
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
      isVisible: false,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      x: 0,
      lastTimestamp: null,
      rafId: null
    }

    function measure() {
      const fullWidth = node.getBoundingClientRect().width
      state.setWidth = fullWidth / SET_COUNT
    }

    function applyTransform() {
      node.style.transform = 'translateX(' + state.x + 'px)'
    }

    function wrapX(x) {
      const setWidth = state.setWidth
      if (setWidth <= 0) return x
      if (x <= -setWidth * 2) return x + setWidth
      if (x > 0) return x - setWidth
      return x
    }

    function enterManual() {
      state.isManual = true
    }

    function exitManual() {
      state.isManual = false
    }

    measure()
    applyTransform()

    function tick(timestamp) {
      if (state.lastTimestamp === null) state.lastTimestamp = timestamp
      const dt = Math.min((timestamp - state.lastTimestamp) / 1000, MAX_FRAME_SECONDS)
      state.lastTimestamp = timestamp
      if (!state.isManual && state.isVisible && !state.reducedMotion) {
        state.x = wrapX(state.x - TARGET_SPEED * dt)
        applyTransform()
      }
      state.rafId = requestAnimationFrame(tick)
    }
    state.rafId = requestAnimationFrame(tick)

    const visibilityObserver = new IntersectionObserver((entries) => {
      state.isVisible = entries[entries.length - 1].isIntersecting
    }, { threshold: 0.05 })
    visibilityObserver.observe(node.parentElement || node)

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
      state.x = wrapX(state.x - event.deltaY)
      applyTransform()
    }

    function pointerX(event) {
      return event.touches && event.touches.length ? event.touches[0].clientX : event.clientX
    }

    function startDrag(event) {
      handleHoverMove()
      state.isDragging = true
      state.hasDragged = false
      state.dragStartX = pointerX(event)
      state.dragStartTranslateX = state.x
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
      state.x = wrapX(state.dragStartTranslateX + deltaX)
      applyTransform()
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
      visibilityObserver.disconnect()
      clearResumeTimer()
      if (state.rafId) cancelAnimationFrame(state.rafId)
    }
  }, [cards, viewMode])

  return (
    <section id="work" aria-label={ariaLabel} className="work-section" ref={sectionRef}>
      <div className={'container section-inner work-section-inner' + (viewMode === 'grid' ? ' is-grid' : '')}>
        <h2 className="section-title reveal delay-1">{title}</h2>
        <div className={isTransitioning ? 'work-view-stage is-transitioning' : 'work-view-stage'}>
          {viewMode === 'carousel' ? (
            <div className="work-track-viewport" ref={viewportRef}>
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

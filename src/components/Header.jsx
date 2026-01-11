import { useEffect, useRef } from 'react'

function Header(props) {
  const segments = props.segments
  const activeSection = props.activeSection
  const onSelect = props.onSelect
  const isVisible = props.isVisible !== false
  const navRef = useRef(null)
  const indicatorRef = useRef(null)

  useEffect(function () {
    function moveIndicator() {
      const nav = navRef.current
      const indicator = indicatorRef.current
      if (!nav || !indicator) return

      const activeButton = nav.querySelector('.segmented-item.is-active')
      if (!activeButton) return

      const navRect = nav.getBoundingClientRect()
      const btnRect = activeButton.getBoundingClientRect()
      const left = btnRect.left - navRect.left
      const width = btnRect.width

      indicator.style.width = width + 'px'
      indicator.style.transform = 'translateX(' + left + 'px)'
    }

    const rafId = requestAnimationFrame(moveIndicator)

    function handleResize() {
      moveIndicator()
    }

    window.addEventListener('resize', handleResize)
    return function () {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize)
    }
  }, [activeSection])

  function handleSelect(id) {
    if (typeof onSelect === 'function') {
      onSelect(id)
    }
  }

  return (
    <header className={isVisible ? 'site-header is-visible' : 'site-header'}>
      <div className="container nav">
        <div></div>

        <div
          className="segmented-nav"
          ref={navRef}
          role="navigation"
          aria-label="Primary"
          onMouseMove={function (event) {
            var nav = event.currentTarget
            var rect = nav.getBoundingClientRect()
            var x = event.clientX - rect.left
            var y = event.clientY - rect.top
            nav.style.setProperty('--nav-glow-x', x + 'px')
            nav.style.setProperty('--nav-glow-y', y + 'px')
            nav.style.setProperty('--nav-glow-opacity', '1')
          }}
          onMouseLeave={function (event) {
            event.currentTarget.style.setProperty('--nav-glow-opacity', '0')
          }}
        >
          <span className="segmented-indicator" ref={indicatorRef} aria-hidden="true"></span>
          {segments.map(function (segment) {
            return (
              <button
                key={segment.id}
                className={
                  segment.id === activeSection
                    ? 'segmented-item is-active'
                    : 'segmented-item'
                }
                data-target={segment.id}
                type="button"
                onClick={function () {
                  handleSelect(segment.id)
                }}
              >
                {segment.label}
              </button>
            )
          })}
        </div>

        <div></div>
      </div>

    </header>
  )
}

export default Header

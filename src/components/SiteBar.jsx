import { useEffect, useRef, useState } from 'react'
import LanguageSwitch from './LanguageSwitch.jsx'
import ThemeSwitch from './ThemeSwitch.jsx'

function SiteBar({ language, onLanguageChange, strings }) {
  const [away, setAway] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    lastY.current = window.scrollY
    let sliding = false

    function onSlideStart() {
      sliding = true
      setAway(true)
    }

    function onSlideEnd() {
      sliding = false
      lastY.current = window.scrollY
    }

    function onScroll() {
      const y = window.scrollY
      const delta = y - lastY.current

      if (sliding) return
      if (Math.abs(delta) > 6) {
        setAway(delta > 0 && y > 90)
        lastY.current = y
      }
      if (y <= 40) setAway(false)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('slide:start', onSlideStart)
    window.addEventListener('slide:end', onSlideEnd)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('slide:start', onSlideStart)
      window.removeEventListener('slide:end', onSlideEnd)
    }
  }, [])

  return (
    <div id="navroot">
      <div className={away ? 'nb-top away' : 'nb-top'}>
        <div className="nb-tools">
          <LanguageSwitch language={language} onChange={onLanguageChange} label={strings.language} />
          <ThemeSwitch label={strings.theme} />
        </div>
      </div>
    </div>
  )
}

export default SiteBar

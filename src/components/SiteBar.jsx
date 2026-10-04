import { useEffect, useRef, useState } from 'react'
import LanguageSwitch from './LanguageSwitch.jsx'
import ThemeSwitch from './ThemeSwitch.jsx'
import { ArrowNE } from './icons.jsx'
import { goToSection } from '../lib/motion.js'

function SiteBar({ language, onLanguageChange, strings }) {
  const [away, setAway] = useState(false)
  const [inContact, setInContact] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    lastY.current = window.scrollY

    function onScroll() {
      const y = window.scrollY
      const delta = y - lastY.current

      if (Math.abs(delta) > 6) {
        setAway(delta > 0 && y > 90)
        lastY.current = y
      }
      if (y <= 40) setAway(false)

      const contact = document.getElementById('contact')
      if (contact) setInContact(contact.getBoundingClientRect().top <= window.innerHeight * 0.4)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
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
      <button
        type="button"
        className={inContact ? 'nb-hi gone' : 'nb-hi'}
        tabIndex={inContact ? -1 : 0}
        aria-hidden={inContact}
        onClick={() => goToSection('contact')}
      >
        <span>{strings.sayHi}</span>
        <ArrowNE />
      </button>
    </div>
  )
}

export default SiteBar

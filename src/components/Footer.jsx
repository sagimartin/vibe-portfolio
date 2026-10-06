import LanguageSwitch from './LanguageSwitch.jsx'
import ThemeSwitch from './ThemeSwitch.jsx'
import { ArrowNEOutline, ArrowUp } from './icons.jsx'
import { prefersReducedMotion } from '../lib/motion.js'

const EMAIL = 'hello@sagimartin.com'

function RollLink({ href, label, external }) {
  const extra = external ? { target: '_blank', rel: 'noopener noreferrer' } : {}

  return (
    <a href={href} {...extra}>
      <span>
        {label}
        <ArrowNEOutline />
      </span>
      <span aria-hidden="true">
        {label}
        <ArrowNEOutline />
      </span>
    </a>
  )
}

function Footer({ strings, language, onLanguageChange, barStrings }) {
  const ringText = (strings.top.toUpperCase() + ' • ').repeat(2)
  const credits = strings.credits.replace('{year}', String(new Date().getFullYear()))

  function backToTop(event) {
    event.preventDefault()
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }

  return (
    <footer id="foot">
      <div className="ft-in ft-roll">
        <div className="ft-uphold">
          <button
            type="button"
            className={strings.top.length > 12 ? 'ft-spin long' : 'ft-spin'}
            aria-label={strings.top}
            onClick={backToTop}
          >
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <defs>
                <path id="spinp" d="M60,60 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0" />
              </defs>
              <text>
                <textPath href="#spinp" textLength="285" lengthAdjust="spacing">
                  {ringText}
                </textPath>
              </text>
            </svg>
            <span>
              <ArrowUp />
            </span>
          </button>
        </div>
        <nav>
          <RollLink href={'mailto:' + EMAIL} label="Mail" />
          {strings.socials.map((item) => (
            <RollLink key={item.label} href={item.href} label={item.label} external />
          ))}
        </nav>
      </div>
      <div className="ft-in ft-bar">
        <span>{credits}</span>
        <div className="ft-prefs">
          <LanguageSwitch language={language} onChange={onLanguageChange} label={barStrings.language} />
          <ThemeSwitch label={barStrings.theme} />
        </div>
      </div>
    </footer>
  )
}

export default Footer

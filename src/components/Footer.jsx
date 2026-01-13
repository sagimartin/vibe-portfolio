import LanguageSwitch from './LanguageSwitch.jsx'
import ThemeSwitch from './ThemeSwitch.jsx'

function Footer(props) {
  const year = new Date().getFullYear()
  const rawText = props.text || '© {year} @sagimartin. All rights reserved.'
  const text = rawText.replace('{year}', year)
  const language = props.language || 'en'
  const onLanguageChange = props.onLanguageChange
  const showLanguageSwitch = props.showLanguageSwitch !== false
  const showThemeSwitch = Boolean(props.showThemeSwitch)
  const pills = props.pills || []
  const socials = props.socials || []

  function getSocialIcon(label) {
    if (label === 'GitHub') {
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.4c-5.3 0-9.6 4.3-9.6 9.6 0 4.2 2.7 7.8 6.5 9.1.5.1.7-.2.7-.5v-1.8c-2.6.6-3.2-1.1-3.2-1.1-.4-1.1-1-1.4-1-1.4-.8-.6.1-.6.1-.6.9.1 1.4 1 1.4 1 .8 1.4 2.1 1 2.6.8.1-.6.3-1 .6-1.3-2.1-.2-4.3-1-4.3-4.6 0-1 .4-1.9 1-2.6-.1-.2-.4-1.2.1-2.5 0 0 .8-.3 2.7 1a9.3 9.3 0 0 1 4.9 0c1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.3.1 2.5.6.7 1 1.6 1 2.6 0 3.6-2.2 4.4-4.3 4.6.3.3.7.8.7 1.7v2.5c0 .3.2.6.7.5a9.7 9.7 0 0 0 6.5-9.1c0-5.3-4.3-9.6-9.6-9.6Z" />
        </svg>
      )
    }
    if (label === 'LinkedIn') {
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.1c.5-1 1.8-2.1 3.8-2.1 4.1 0 4.9 2.7 4.9 6.2V21h-4v-5.6c0-1.3 0-3-1.9-3-1.9 0-2.2 1.5-2.2 2.9V21h-4V9Z" />
        </svg>
      )
    }
    return null
  }

  const metaItems = []
  pills.forEach(function (pill, index) {
    const parts = String(pill)
      .split('·')
      .map(function (part) {
        return part.trim()
      })
      .filter(Boolean)
    if (!parts.length) return
    parts.forEach(function (part, partIndex) {
      metaItems.push({ key: 'pill-' + index + '-' + partIndex, type: 'text', label: part })
    })
  })
  socials.forEach(function (item) {
    metaItems.push({ key: 'social-' + item.label, type: 'link', label: item.label, href: item.href })
  })

  return (
    <footer>
      <div className="container footer-stack">
        <div className="footer-preferences">
          <div className="footer-toggles">
            {showLanguageSwitch ? (
              <LanguageSwitch language={language} onChange={onLanguageChange} variant="corner" />
            ) : null}
            {showThemeSwitch ? <ThemeSwitch isVisible={true} /> : null}
          </div>
          {metaItems.length > 0 ? (
            <div className="contact-meta" aria-label="Contact links">
              {metaItems.map(function (item) {
                const icon = item.type === 'link' ? getSocialIcon(item.label) : null
                return (
                  <span className="contact-meta-entry" key={item.key}>
                    {item.type === 'link' ? (
                      <a className="contact-meta-item contact-meta-link" href={item.href} target="_blank" rel="noreferrer">
                        {icon ? <span className="contact-meta-icon">{icon}</span> : null}
                        <span className="contact-meta-label">{item.label}</span>
                      </a>
                    ) : (
                      <span className="contact-meta-item">{item.label}</span>
                    )}
                  </span>
                )
              })}
            </div>
          ) : null}
        </div>
        <span className="site-credits-line">{text}</span>
      </div>
    </footer>
  )
}

export default Footer

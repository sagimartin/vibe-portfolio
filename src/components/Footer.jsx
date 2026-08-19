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
                return (
                  <span className="contact-meta-entry" key={item.key}>
                    {item.type === 'link' ? (
                      <a className="contact-meta-item contact-meta-link" href={item.href} target="_blank" rel="noreferrer">
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

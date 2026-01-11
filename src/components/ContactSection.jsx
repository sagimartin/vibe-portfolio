function ContactSection(props) {
  var eyebrow = props.eyebrow || 'Contact'
  var title = props.title || "Let's build something nice."
  var text = props.text || "Have a project in mind? Let's talk."
  var ctaMessage = props.ctaMessage || 'Send message'
  var ctaCall = props.ctaCall || 'Book a call'
  var replies = props.replies || 'Usually replies in ~2-3h'
  var pills = props.pills || []
  var socials = props.socials || []
  var messageSubject = props.messageSubject || 'Hey Martin 👋'
  var callLink = props.callLink || 'https://meet.google.com/new'
  var metaVisible = Boolean(props.metaVisible)
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
  var metaItems = []
  pills.forEach(function (pill, index) {
    var parts = String(pill)
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
  const handleMouseMove = (event) => {
    const card = event.currentTarget
    const rect = card.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    card.style.setProperty('--glow-x', x + 'px')
    card.style.setProperty('--glow-y', y + 'px')
    card.style.setProperty('--glow-opacity', '1')
  }

  const handleMouseEnter = (event) => {
    const card = event.currentTarget
    card.style.setProperty('--glow-opacity', '1')
  }

  const handleMouseLeave = (event) => {
    const card = event.currentTarget
    card.style.setProperty('--glow-opacity', '0')
  }

  return (
    <section
      id="contact"
      aria-label={eyebrow}
      className="contact-section"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="contact-glow" aria-hidden="true"></div>
      <div className="container section-inner">
        <div className="contact-card reveal delay-1">
            <div className="contact-header">
            <p className="contact-eyebrow">{eyebrow}</p>
            <h2 className="contact-title">{title}</h2>
          </div>
          <p className="contact-text">{text}</p>
          <div className="contact-actions">
            <a
              href={'mailto:hello@sagimartin.com?subject=' + encodeURIComponent(messageSubject || '')}
              className="contact-cta contact-cta-secondary"
            >
              {ctaMessage}
            </a>
            <a
              href={callLink}
              className="contact-cta"
              target="_blank"
              rel="noreferrer"
            >
              {ctaCall}
            </a>
          </div>
          <div className="contact-note">
            <span className="contact-status" aria-hidden="true"></span>
            {replies}
          </div>
        </div>
      </div>
      {metaItems.length > 0 ? (
        <div
          className={metaVisible ? 'contact-meta is-visible' : 'contact-meta'}
          aria-label="Contact links"
        >
          {metaItems.map(function (item) {
            var icon = item.type === 'link' ? getSocialIcon(item.label) : null
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
    </section>
  )
}

export default ContactSection

function ContactSection(props) {
  var eyebrow = props.eyebrow || 'Contact'
  var title = props.title || "Let's build something nice."
  var text = props.text || "Have a project in mind? Let's talk."
  var ctaMessage = props.ctaMessage || 'Send message'
  var ctaCall = props.ctaCall || 'Book a call'
  var replies = props.replies || 'Usually replies in ~2-3h'
  var messageSubject = props.messageSubject || 'Hey Martin 👋'
  var callLink = props.callLink || 'https://meet.google.com/new'
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
    </section>
  )
}

export default ContactSection

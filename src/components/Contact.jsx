import { useEffect, useRef } from 'react'
import { createChat } from '../chat/createChat.js'
import { CHAT_COPY } from '../content/chatCopy.js'

function Contact({ strings, language, ariaLabel }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const node = mountRef.current
    if (!node) return undefined
    return createChat(node, { lang: language, strings: CHAT_COPY })
  }, [language])

  return (
    <section className="contact" id="contact" aria-label={ariaLabel}>
      <div className="wrap">
        <div className="chead">
          <p className="eyebrow">{strings.eyebrow}</p>
          <h2 className="ctitle">{strings.title}</h2>
        </div>
        <div ref={mountRef} />
      </div>
    </section>
  )
}

export default Contact

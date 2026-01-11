function Footer(props) {
  const isVisible = props.isVisible
  const year = new Date().getFullYear()
  const rawText = props.text || '© {year} @sagimartin. All rights reserved.'
  const text = rawText.replace('{year}', year)

  return (
    <div className={isVisible ? 'site-credits is-visible' : 'site-credits'}>
      <span className="site-credits-line">{text}</span>
    </div>
  )
}

export default Footer

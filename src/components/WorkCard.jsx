import shopifyLogoBlack from '../assets/shopify_monotone_black.svg'
import shopifyLogoWhite from '../assets/shopify_monotone_white.svg'

function WorkCard(props) {
  const card = props.card
  const onOpen = props.onOpen
  const ctaLabel = props.ctaLabel || 'View case'
  const badge = card.badge
  const isShopify = typeof badge === 'string' && badge.toLowerCase() === 'shopify'
  const imageLight = card.imageLight || card.image
  const imageDark = card.imageDark
  const displayTitle = card.title

  function handleOpen() {
    if (typeof onOpen === 'function') onOpen(card.id)
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleOpen()
    }
  }

  return (
    <div
      className={'card reveal card-' + card.id + ' ' + card.delayClass}
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-label={'Open ' + card.title}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      onMouseMove={function (event) {
        var target = event.currentTarget
        var rect = target.getBoundingClientRect()
        var x = event.clientX - rect.left
        var y = event.clientY - rect.top
        var mirrorX = rect.width - x
        var mirrorY = rect.height - y
        target.style.setProperty('--card-glow-x', x + 'px')
        target.style.setProperty('--card-glow-y', y + 'px')
        target.style.setProperty('--card-glow-mirror-x', mirrorX + 'px')
        target.style.setProperty('--card-glow-mirror-y', mirrorY + 'px')
        target.style.setProperty('--card-glow-opacity', '1')
      }}
      onMouseLeave={function (event) {
        event.currentTarget.style.setProperty('--card-glow-opacity', '0')
      }}
    >
      <div className="card-media">
        {imageLight && imageDark ? (
          <>
            <img
              className="card-media-image card-media-image-light"
              src={imageLight}
              alt={card.title}
              loading="lazy"
              decoding="async"
            />
            <img
              className="card-media-image card-media-image-dark"
              src={imageDark}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
            />
          </>
        ) : (
          imageLight && (
            <img
              className="card-media-image"
              src={imageLight}
              alt={card.title}
              loading="lazy"
              decoding="async"
            />
          )
        )}
      </div>
      <div className="card-copy">
        <h3>{displayTitle}</h3>
        <p>{card.summary}</p>
      </div>
      <div className="card-footer">
        {badge && (
          <span className="card-badge" aria-label={badge}>
            {isShopify ? (
              <>
                <img className="badge-logo badge-logo-light" src={shopifyLogoBlack} alt="Shopify" />
                <img className="badge-logo badge-logo-dark" src={shopifyLogoWhite} alt="" aria-hidden="true" />
              </>
            ) : (
              <span className="badge-text">{badge}</span>
            )}
          </span>
        )}
        <button
          className="card-link"
          type="button"
          onClick={function (event) {
            event.stopPropagation()
            handleOpen()
          }}
        >
          {ctaLabel}
          <svg className="card-link-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M9.29 6.71a1 1 0 0 0 0 1.41L13.17 12l-3.88 3.88a1 1 0 1 0 1.41 1.41l4.59-4.59a1 1 0 0 0 0-1.41l-4.59-4.59a1 1 0 0 0-1.41 0Z"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default WorkCard

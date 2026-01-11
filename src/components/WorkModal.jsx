import { useEffect } from 'react'

function WorkModal(props) {
  const project = props.project
  const onClose = props.onClose
  const eyebrow = props.eyebrow || 'Selected Work'

  useEffect(() => {
    if (!project) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (typeof onClose === 'function') onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [project, onClose])

  if (!project) return null

  const description = typeof project.description === 'string' ? project.description : ''
  const paragraphs = description.split('\n\n').filter(Boolean)
  const imageLight = project.imageLight || project.image
  const imageDark = project.imageDark
  const linkLabel = props.linkLabel || 'Visit site'

  function handleBackdropClick() {
    if (typeof onClose === 'function') onClose()
  }

  function handleDialogClick(event) {
    event.stopPropagation()
  }

  const modalClassName = project.id ? 'work-modal work-modal-' + project.id : 'work-modal'

  return (
    <div className="work-modal-backdrop" onClick={handleBackdropClick} role="presentation">
      <div
        className={modalClassName}
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        onClick={handleDialogClick}
      >
        <button className="work-modal-close" type="button" onClick={handleBackdropClick} aria-label="Close">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6L18 18" />
            <path d="M18 6L6 18" />
          </svg>
        </button>
        <div className="work-modal-header">
          <p className="work-modal-eyebrow">{eyebrow}</p>
          <div className="work-modal-brand">
            {imageLight && imageDark ? (
              <>
                <img
                  className="work-modal-image work-modal-image-light"
                  src={imageLight}
                  alt={project.title}
                  loading="lazy"
                  decoding="async"
                />
                <img
                  className="work-modal-image work-modal-image-dark"
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
                  className="work-modal-image"
                  src={imageLight}
                  alt={project.title}
                  loading="lazy"
                  decoding="async"
                />
              )
            )}
          </div>
        </div>
        <div className="work-modal-body">
          {project.summary && <p className="work-modal-lead">{project.summary}</p>}
          {paragraphs.map(function (paragraph, index) {
            return <p key={project.id + '-p-' + index}>{paragraph}</p>
          })}
          {project.url ? (
            <a className="work-modal-link" href={project.url} target="_blank" rel="noreferrer">
              {linkLabel}
            </a>
          ) : null}
          {Array.isArray(project.tags) && project.tags.length > 0 && (
            <>
              <div className="work-modal-divider" aria-hidden="true"></div>
              <div className="work-modal-tags">
                {project.tags.map(function (tag) {
                  return (
                    <span className="work-modal-tag" key={tag}>
                      {tag}
                    </span>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default WorkModal

import { Fragment, useCallback, useRef, useState } from 'react'
import { ArrowNE } from './icons.jsx'
import { prefersReducedMotion, slideToNode } from '../lib/motion.js'

const isVector = (src) => /\.svg(\?|$)/.test(src || '') || /^data:image\/svg/.test(src || '')

function Work({ strings, projects, ariaLabel }) {
  const [openId, setOpenId] = useState(null)
  const itemRefs = useRef([])

  const toggle = useCallback(
    (id, index) => {
      const willOpen = openId !== id
      const closing = openId ? document.getElementById('detail-' + openId) : null
      setOpenId(willOpen ? id : null)

      if (willOpen) {
        setTimeout(() => slideToNode(itemRefs.current[index], closing), 0)
      }
    },
    [openId]
  )

  const reduce = prefersReducedMotion()

  return (
    <section className="work" id="work" aria-label={ariaLabel}>
      <div className="wrap whead">
        <div>
          <p className="eyebrow">{strings.eyebrow}</p>
          <h2 className="wtitle">
            <span>{strings.title}</span>
            <sup>{String(projects.length).padStart(2, '0')}</sup>
          </h2>
        </div>
        <p className="whint">
          <i aria-hidden="true">↓</i>
          <span>{strings.hint}</span>
        </p>
      </div>

      <div className="rows">
        {projects.map((project, index) => {
          const open = openId === project.id
          const paragraphs = String(project.description || '')
            .split('\n\n')
            .filter(Boolean)

          return (
            <div
              className="item"
              key={project.id}
              ref={(node) => {
                itemRefs.current[index] = node
              }}
            >
              <button
                type="button"
                className="row"
                id={'row-' + project.id}
                aria-expanded={open}
                aria-controls={'detail-' + project.id}
                aria-label={project.title}
                onClick={() => toggle(project.id, index)}
              >
                <span className="t" aria-hidden="true">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => (
                    <Fragment key={k}>
                      <b>{project.title}</b>
                      {k < 8 ? <i /> : null}
                    </Fragment>
                  ))}
                </span>
              </button>

              <div
                className={open ? 'detail open' : 'detail'}
                id={'detail-' + project.id}
                role="region"
                aria-label={project.title}
                inert={!open}
                data-reduce={reduce ? 'true' : undefined}
              >
                <div className="clip">
                  <div className="wrap dwrap">
                    <div className="dhead">
                      <a
                        className="logolink"
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={project.title}
                      >
                        <div
                          className="logo"
                          data-key={project.imageKey}
                          style={{ '--ar': project.logoRatio, '--ls': project.logoScale }}
                        >
                          {project.imageLight ? (
                            <img
                              className={isVector(project.imageLight) ? 'l vec' : 'l'}
                              src={project.imageLight}
                              alt={project.title}
                              decoding="async"
                              fetchPriority="low"
                            />
                          ) : null}
                          {project.imageDark ? (
                            <img
                              className={isVector(project.imageDark) ? 'd vec' : 'd'}
                              src={project.imageDark}
                              alt=""
                              decoding="async"
                              fetchPriority="low"
                            />
                          ) : null}
                        </div>
                      </a>
                    </div>
                    <div className="dbody">
                      <p className="lead">{project.summary}</p>
                      {paragraphs.map((text, i) => (
                        <p key={i}>{text}</p>
                      ))}
                      <a
                        className="cta fill"
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>{strings.visit}</span>
                        <ArrowNE />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default Work

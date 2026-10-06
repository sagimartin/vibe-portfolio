import { useEffect, useRef, useState } from 'react'
import Odometer from './Odometer.jsx'
import {
  ECB_HUF_PER_EUR,
  formatCompactCurrency,
  formatGroupedNumber,
  getLiveStats
} from '../lib/liveStats.js'
import { prefersReducedMotion } from '../lib/motion.js'

function useVisible(threshold) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(() => prefersReducedMotion() || typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const node = ref.current
    if (!node || visible) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold, visible])

  return [ref, visible]
}

function Snapshot({ strings, language, ariaLabel }) {
  const [stats, setStats] = useState(() => getLiveStats())
  const bigRefs = useRef([])
  const rowRefs = useRef([])
  const [ordersRef, ordersVisible] = useVisible(0.5)
  const [valueRef, valueVisible] = useVisible(0.5)
  const [ratingRef, ratingVisible] = useVisible(0.5)

  useEffect(() => {
    const id = window.setInterval(() => setStats(getLiveStats()), 60000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion()) return undefined

    function slide() {
      const vh = window.innerHeight

      bigRefs.current.forEach((big, i) => {
        const row = rowRefs.current[i]
        if (!big || !row) return
        const rect = row.getBoundingClientRect()
        if (rect.bottom < -50 || rect.top > vh + 50) return
        const progress = (rect.top + rect.height / 2) / vh - 0.5
        big.style.transform = 'translateX(' + progress * (i % 2 ? -1 : 1) * window.innerWidth * 0.06 + 'px)'
      })
    }

    slide()
    window.addEventListener('scroll', slide, { passive: true })
    window.addEventListener('resize', slide)
    return () => {
      window.removeEventListener('scroll', slide)
      window.removeEventListener('resize', slide)
    }
  }, [])

  const ordersText = formatGroupedNumber(stats.orders)
  const valueText =
    language === 'en'
      ? formatCompactCurrency(Math.round(stats.amount / ECB_HUF_PER_EUR), 'en')
      : formatCompactCurrency(stats.amount, 'hu')

  return (
    <section className="stats" id="stats" aria-label={ariaLabel}>
      <div className="wrap">
        <div className="shead">
          <p className="eyebrow">{strings.eyebrow}</p>
          <h2 className="stitle">{strings.title}</h2>
        </div>
        <div className="srows">
          <div
            className="srow"
            ref={(node) => {
              rowRefs.current[0] = node
            }}
          >
            <div className="sgutter">
              <div className="sin">
                <span className="slab">{strings.ordersLabel}</span>
                <strong
                  className="sbig"
                  ref={(node) => {
                    bigRefs.current[0] = node
                    ordersRef.current = node
                  }}
                >
                  <Odometer value={ordersText} active={ordersVisible} />
                  <small>+</small>
                </strong>
              </div>
            </div>
          </div>
          <div
            className="srow"
            ref={(node) => {
              rowRefs.current[1] = node
            }}
          >
            <div className="sgutter">
              <div className="sin">
                <span className="slab">{strings.valueLabel}</span>
                <strong
                  className="sbig"
                  ref={(node) => {
                    bigRefs.current[1] = node
                    valueRef.current = node
                  }}
                >
                  <Odometer value={valueText} active={valueVisible} />
                </strong>
              </div>
            </div>
          </div>
          <div
            className="srow"
            ref={(node) => {
              rowRefs.current[2] = node
            }}
          >
            <div className="sgutter">
              <div className="sin">
                <span className="slab">{strings.ratingLabel}</span>
                <strong
                  className="sbig"
                  ref={(node) => {
                    bigRefs.current[2] = node
                    ratingRef.current = node
                  }}
                >
                  <a
                    className="slink"
                    href={strings.ratingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={strings.ratingNote}
                  >
                    <Odometer value={strings.ratingValue} active={ratingVisible} />
                    <small>★</small>
                  </a>
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Snapshot

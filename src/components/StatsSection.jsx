import { useEffect, useRef, useState } from 'react'

const BUDAPEST_TIME_ZONE = 'Europe/Budapest'
const BASE_DAY_NUMBER = Math.floor(Date.UTC(2026, 2, 26) / 86400000)
const BASE_ORDERS = 13748
const DAILY_ORDER_GROWTH = 111
const AVERAGE_ORDER_VALUE = 10655.77
const ECB_HUF_PER_EUR = 387.83
const DISTRIBUTION_START_MINUTES = 6 * 60 + 30
const DISTRIBUTION_END_MINUTES = 23 * 60
const DISTRIBUTION_STEP_MINUTES = 10
const PEAK_START_MINUTES = 10 * 60
const PEAK_END_MINUTES = 19 * 60

const DISTRIBUTION_SLOTS = []
for (
  let minutes = DISTRIBUTION_START_MINUTES;
  minutes < DISTRIBUTION_END_MINUTES;
  minutes += DISTRIBUTION_STEP_MINUTES
) {
  DISTRIBUTION_SLOTS.push(minutes)
}

function getTimeZoneParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    hourCycle: 'h23'
  }).formatToParts(date)

  const year = Number(parts.find((part) => part.type === 'year')?.value || 0)
  const month = Number(parts.find((part) => part.type === 'month')?.value || 1)
  const day = Number(parts.find((part) => part.type === 'day')?.value || 1)
  const hour = Number(parts.find((part) => part.type === 'hour')?.value || 0)
  const minute = Number(parts.find((part) => part.type === 'minute')?.value || 0)
  const dayNumber = Math.floor(Date.UTC(year, month - 1, day) / 86400000)
  const dateKey =
    year +
    '-' +
    String(month).padStart(2, '0') +
    '-' +
    String(day).padStart(2, '0')

  return {
    year,
    month,
    day,
    hour,
    minute,
    dayNumber,
    dateKey,
    minutesSinceMidnight: hour * 60 + minute
  }
}

function createSeededRandom(seedInput) {
  let seed = 2166136261

  for (let index = 0; index < seedInput.length; index += 1) {
    seed ^= seedInput.charCodeAt(index)
    seed = Math.imul(seed, 16777619)
  }

  return function seededRandom() {
    seed += 0x6d2b79f5
    let value = seed

    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function getDailyGrowthDistribution(dateKey, totalGrowth) {
  const distribution = new Array(DISTRIBUTION_SLOTS.length).fill(0)

  if (totalGrowth <= 0) return distribution

  const guaranteedPerSlot = totalGrowth >= DISTRIBUTION_SLOTS.length ? 1 : 0
  let remaining = totalGrowth

  if (guaranteedPerSlot > 0) {
    for (let index = 0; index < distribution.length; index += 1) {
      distribution[index] = guaranteedPerSlot
      remaining -= guaranteedPerSlot
    }
  }

  if (remaining <= 0) return distribution

  const random = createSeededRandom('stats:' + dateKey)
  const weightedSlots = DISTRIBUTION_SLOTS.map((slotMinutes, index) => {
    const midpoint = Math.min(slotMinutes + DISTRIBUTION_STEP_MINUTES / 2, DISTRIBUTION_END_MINUTES)
    const isPeak = midpoint >= PEAK_START_MINUTES && midpoint <= PEAK_END_MINUTES
    const bandWeight = isPeak ? 1.9 : midpoint < PEAK_START_MINUTES ? 0.9 : 0.7
    const jitter = 0.75 + random() * 0.75

    return {
      index,
      weight: bandWeight * jitter,
      tiebreaker: random()
    }
  })

  const totalWeight = weightedSlots.reduce((sum, slot) => sum + slot.weight, 0)
  let distributed = 0
  const remainders = weightedSlots.map((slot) => {
    const exactShare = totalWeight > 0 ? (remaining * slot.weight) / totalWeight : 0
    const wholeShare = Math.floor(exactShare)

    distribution[slot.index] += wholeShare
    distributed += wholeShare

    return {
      index: slot.index,
      remainder: exactShare - wholeShare,
      tiebreaker: slot.tiebreaker
    }
  })

  const leftover = remaining - distributed

  if (leftover > 0) {
    remainders
      .sort((left, right) => {
        if (right.remainder !== left.remainder) return right.remainder - left.remainder
        return right.tiebreaker - left.tiebreaker
      })
      .slice(0, leftover)
      .forEach((slot) => {
        distribution[slot.index] += 1
      })
  }

  return distribution
}

function getIntradayGrowth(dayParts, totalGrowth) {
  if (dayParts.minutesSinceMidnight < DISTRIBUTION_START_MINUTES) return 0

  const distribution = getDailyGrowthDistribution(dayParts.dateKey, totalGrowth)

  return DISTRIBUTION_SLOTS.reduce((sum, slotMinutes, index) => {
    if (dayParts.minutesSinceMidnight >= slotMinutes) {
      return sum + distribution[index]
    }

    return sum
  }, 0)
}

function getLiveStats() {
  const nowInBudapest = getTimeZoneParts(new Date(), BUDAPEST_TIME_ZONE)
  const completedDays = Math.max(0, nowInBudapest.dayNumber - BASE_DAY_NUMBER)
  const intradayGrowth =
    nowInBudapest.dayNumber >= BASE_DAY_NUMBER
      ? getIntradayGrowth(nowInBudapest, DAILY_ORDER_GROWTH)
      : 0
  const orders = BASE_ORDERS + completedDays * DAILY_ORDER_GROWTH + intradayGrowth

  return {
    orders,
    amount: Math.round(orders * AVERAGE_ORDER_VALUE)
  }
}

function formatGroupedNumber(value) {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function formatCompactCurrency(value, language) {
  if (language === 'en') {
    if (value >= 1000000) {
      return '€' + (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
    }

    return '€' + Math.round(value / 1000) + 'K'
  }

  if (value >= 1000000) {
    return (value / 1000000).toFixed(1).replace('.', ',').replace(/,0$/, '') + 'M Ft'
  }

  return Math.round(value / 1000) + 'K Ft'
}

function StatsSection(props) {
  const strings = props.strings || {}
  const language = props.language || 'en'
  const sectionRef = useRef(null)
  const animationFrameRef = useRef(null)
  const displayedRef = useRef({ orders: 0, amount: 0 })
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return true
    return !('IntersectionObserver' in window)
  })
  const [liveStats, setLiveStats] = useState(() => getLiveStats())
  const [displayedStats, setDisplayedStats] = useState({ orders: 0, amount: 0 })

  useEffect(() => {
    displayedRef.current = displayedStats
  }, [displayedStats])

  useEffect(() => {
    const node = sectionRef.current

    if (!node || !('IntersectionObserver' in window)) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setIsVisible(true)
        })
      },
      { threshold: 0.35 }
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setLiveStats((currentStats) => {
        const nextStats = getLiveStats()

        if (
          currentStats.orders === nextStats.orders &&
          currentStats.amount === nextStats.amount
        ) {
          return currentStats
        }

        return nextStats
      })
    }, 60000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    if (!isVisible) return undefined

    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current)
    }

    const reduceMotion = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
    const fromStats = displayedRef.current
    const toStats = {
      orders: liveStats.orders,
      amount: liveStats.amount
    }

    if (reduceMotion) {
      animationFrameRef.current = window.requestAnimationFrame(() => {
        setDisplayedStats(toStats)
      })

      return () => {
        if (animationFrameRef.current) {
          window.cancelAnimationFrame(animationFrameRef.current)
        }
      }
    }

    const duration = fromStats.orders === 0 && fromStats.amount === 0 ? 2400 : 1200
    const startedAt = performance.now()

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)

      setDisplayedStats({
        orders: Math.round(fromStats.orders + (toStats.orders - fromStats.orders) * eased),
        amount: Math.round(fromStats.amount + (toStats.amount - fromStats.amount) * eased)
      })

      if (progress < 1) {
        animationFrameRef.current = window.requestAnimationFrame(tick)
      }
    }

    animationFrameRef.current = window.requestAnimationFrame(tick)

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isVisible, liveStats.orders, liveStats.amount])

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const displayAmount =
    language === 'en'
      ? Math.round(displayedStats.amount / ECB_HUF_PER_EUR)
      : displayedStats.amount
  const compactAmount = formatCompactCurrency(displayAmount, language)

  const handlePanelMouseMove = (event) => {
    const target = event.currentTarget
    const rect = target.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const mirrorX = rect.width - x
    const mirrorY = rect.height - y

    target.style.setProperty('--card-glow-x', x + 'px')
    target.style.setProperty('--card-glow-y', y + 'px')
    target.style.setProperty('--card-glow-mirror-x', mirrorX + 'px')
    target.style.setProperty('--card-glow-mirror-y', mirrorY + 'px')
    target.style.setProperty('--card-glow-opacity', '1')
  }

  const handlePanelMouseLeave = (event) => {
    event.currentTarget.style.setProperty('--card-glow-opacity', '0')
  }

  return (
    <section id="stats" aria-label={strings.eyebrow || 'Live Estimate'} className="stats-section">
      <div className="container section-inner stats-section-inner">
        <div className="stats-shell reveal delay-1" ref={sectionRef}>
          <div className="stats-copy">
            <p className="contact-eyebrow">{strings.eyebrow || 'Live Estimate'}</p>
            <h2 className="stats-title">{strings.title || 'Storefront scale, in motion.'}</h2>
          </div>
          <article
            className="stats-panel"
            onMouseMove={handlePanelMouseMove}
            onMouseLeave={handlePanelMouseLeave}
          >
            <div className="stats-segment">
              <p className="stats-card-label">{strings.ordersLabel || 'Orders fulfilled'}</p>
              <div className="stats-value" aria-live="polite">
                {formatGroupedNumber(displayedStats.orders)}
                <span className="stats-value-plus" aria-hidden="true">
                  +
                </span>
              </div>
            </div>
            <div className="stats-divider" aria-hidden="true" />
            <div className="stats-segment stats-segment-accent">
              <p className="stats-card-label">{strings.amountLabel || 'Estimated gross value'}</p>
              <div className="stats-value" aria-live="polite">
                {compactAmount}
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

export default StatsSection

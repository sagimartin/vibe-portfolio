export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
}

export function scrollBehavior() {
  return prefersReducedMotion() ? 'auto' : 'smooth'
}

export function goToSection(id) {
  const node = document.getElementById(id)
  if (node) node.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
}

let slideFrame = 0
let stopSlide = null

// a bit longer than the panel's own open/close transition, so the glide never ends before the panel settles
const GLIDE_MS = 1300
const easeInOutSine = (t) => (1 - Math.cos(Math.PI * t)) / 2

/* Glides the page so `node` sits at the top of the viewport (respecting its scroll-margin-top).
   The target is re-measured on every frame, so it stays correct while another panel collapses
   above it, and the glide is time-based so it moves the same on every refresh rate.
   Any wheel / touch / key input hands control back to the user. */
export function slideToNode(node, collapsingNode) {
  if (!node) return

  if (stopSlide) stopSlide()

  const margin = parseFloat(getComputedStyle(node).scrollMarginTop) || 0
  // a panel collapsing above `node` will pull it up by its current height, so aim for the final spot
  const above = () =>
    collapsingNode && collapsingNode.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING
      ? collapsingNode.getBoundingClientRect().height
      : 0
  const targetY = () => Math.max(0, node.getBoundingClientRect().top + window.scrollY - margin - above())

  if (prefersReducedMotion()) {
    window.scrollTo({ top: targetY(), behavior: 'instant' })
    return
  }

  const startedAt = performance.now()
  const startY = window.scrollY

  function cancel() {
    window.dispatchEvent(new Event('slide:end'))
    cancelAnimationFrame(slideFrame)
    window.removeEventListener('wheel', cancel)
    window.removeEventListener('touchstart', cancel)
    window.removeEventListener('keydown', cancel)
    stopSlide = null
  }

  function frame(now) {
    const progress = Math.max(0, Math.min(1, (now - startedAt) / GLIDE_MS))
    const target = targetY()

    window.scrollTo({ top: startY + (target - startY) * easeInOutSine(progress), behavior: 'instant' })

    if (progress >= 1) {
      cancel()
      return
    }
    slideFrame = requestAnimationFrame(frame)
  }

  window.addEventListener('wheel', cancel, { passive: true })
  window.addEventListener('touchstart', cancel, { passive: true })
  window.addEventListener('keydown', cancel)
  stopSlide = cancel
  window.dispatchEvent(new Event('slide:start'))
  slideFrame = requestAnimationFrame(frame)
}

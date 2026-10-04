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

/* Glides the page so `node` sits at the top of the viewport (respecting its scroll-margin-top).
   The target is re-measured on every frame, so it stays correct while another panel collapses
   above it. Any wheel / touch / key input hands control back to the user. */
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
  let settled = 0
  let y = window.scrollY

  function cancel() {
    window.dispatchEvent(new Event('slide:end'))
    cancelAnimationFrame(slideFrame)
    window.removeEventListener('wheel', cancel)
    window.removeEventListener('touchstart', cancel)
    window.removeEventListener('keydown', cancel)
    stopSlide = null
  }

  function frame(now) {
    const target = targetY()
    const diff = target - y

    y += diff * 0.16
    window.scrollTo({ top: y, behavior: 'instant' })

    settled = Math.abs(diff) < 0.6 ? settled + 1 : 0
    if (settled > 6 || now - startedAt > 1600) {
      window.scrollTo({ top: target, behavior: 'instant' })
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

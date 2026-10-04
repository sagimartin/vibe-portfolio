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

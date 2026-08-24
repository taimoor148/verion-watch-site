export function detectCapabilities() {
  const rmQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  const coarseQuery = window.matchMedia('(pointer: coarse)')
  const smallQuery = window.matchMedia('(max-width: 899px)')

  const webgl = (() => {
    try {
      const canvas = document.createElement('canvas')
      return Boolean(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl'))
      )
    } catch (error) {
      return false
    }
  })()

  const cores = navigator.hardwareConcurrency || 4
  const mobile = coarseQuery.matches && smallQuery.matches
  const tier = !webgl ? 'none' : mobile || cores <= 4 ? 'low' : 'high'
  const dpr = Math.min(window.devicePixelRatio || 1, tier === 'high' ? 2 : 1.5)

  return {
    rmQuery,
    reduced: rmQuery.matches,
    coarse: coarseQuery.matches,
    mobile,
    tier,
    webgl,
    dpr,
    finePointer: window.matchMedia('(pointer: fine)').matches
  }
}

let liveReduced = null

export function subscribeReducedMotion(callback) {
  if (!liveReduced) {
    liveReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  }
  const handler = event => callback(event.matches)
  liveReduced.addEventListener('change', handler)
  return () => liveReduced.removeEventListener('change', handler)
}

import * as THREE from 'three'
import { createWatch } from './watch-factory.js'
import { buildEnvScene } from './textures.js'

// Independent, demand-rendered scene: no shared controller with the page's other acts.
export function createAtelier(mount, caps) {
  if (!caps.webgl || caps.reduced) return null
  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: caps.tier === 'high', powerPreference: 'low-power' })
  } catch { return null }
  renderer.setPixelRatio(Math.min(caps.dpr, 1.5))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.35
  renderer.domElement.setAttribute('aria-hidden', 'true')
  mount.appendChild(renderer.domElement)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(35, 1, 1, 600)
  const envScene = buildEnvScene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = pmrem.fromScene(envScene, 0.04)
  scene.environment = env.texture
  envScene.traverse(o => { o.geometry?.dispose(); o.material?.dispose() })
  pmrem.dispose()
  const key = new THREE.DirectionalLight(0xffe8c6, 3)
  key.position.set(20, 40, 60)
  const rim = new THREE.DirectionalLight(0xc2d8ff, 4)
  rim.position.set(-40, 10, -20)
  scene.add(key, rim, new THREE.AmbientLight(0xffffff, .5))
  const watch = createWatch({ tier: caps.tier, aniso: Math.min(4, renderer.capabilities.getMaxAnisotropy()) })
  scene.add(watch.group)
  let progress = 0, visible = false, destroyed = false, queued = false
  const smooth = (a, b, x) => { const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t) }
  function draw() {
    queued = false
    if (destroyed || !visible || document.hidden) return
    const open = smooth(.12, .52, progress) * (1 - smooth(.72, .98, progress))
    watch.setExplode(open)
    watch.group.rotation.set(1.05 - open * .35, -.35 + progress * .7, -.18 + progress * .3)
    watch.group.position.y = -open * 9
    camera.position.z = 118 + open * 32
    renderer.render(scene, camera)
    mount.classList.add('is-rendered')
  }
  function requestDraw() { if (!queued && !destroyed) { queued = true; requestAnimationFrame(draw) } }
  const resize = new ResizeObserver(() => {
    const { width, height } = mount.getBoundingClientRect()
    if (!width || !height) return
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    requestDraw()
  })
  resize.observe(mount)
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; requestDraw() })
  observer.observe(mount)
  const visibility = () => { if (!document.hidden) requestDraw() }
  document.addEventListener('visibilitychange', visibility)
  const lost = e => { e.preventDefault(); mount.classList.remove('is-rendered') }
  renderer.domElement.addEventListener('webglcontextlost', lost)
  renderer.domElement.addEventListener('webglcontextrestored', requestDraw)
  return {
    update(value) { progress = value; requestDraw() },
    destroy() {
      destroyed = true; resize.disconnect(); observer.disconnect()
      document.removeEventListener('visibilitychange', visibility)
      renderer.domElement.removeEventListener('webglcontextlost', lost)
      renderer.domElement.removeEventListener('webglcontextrestored', requestDraw)
      watch.dispose(); env.dispose(); renderer.dispose(); renderer.domElement.remove()
    }
  }
}

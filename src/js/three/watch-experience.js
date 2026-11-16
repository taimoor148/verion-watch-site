import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import gsap from 'gsap'
import { buildEnvScene } from './textures.js'
import { createWatch } from './watch-factory.js'
import { createMovement } from './movement-factory.js'
import { POSTER_SVG } from './poster.js'

const WATCH_URL = `${import.meta.env.BASE_URL}models/verion-watch.glb`
const MOVEMENT_URL = `${import.meta.env.BASE_URL}models/verion-movement.glb`
const MODELS_POSSIBLE = Object.keys(import.meta.glob('/public/models/*.glb')).length > 0 && location.protocol !== 'file:'

function loadGLB(url, timeoutMs) {
  return new Promise(resolve => {
    const timeout = setTimeout(() => resolve(null), timeoutMs)
    new GLTFLoader().load(
      url,
      gltf => {
        clearTimeout(timeout)
        resolve(gltf)
      },
      undefined,
      () => {
        clearTimeout(timeout)
        resolve(null)
      }
    )
  })
}

function normalizeModel(model, targetSize) {
  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const scaleFactor = targetSize / Math.max(size.x, size.y, size.z)
  model.position.sub(center)
  model.scale.setScalar(scaleFactor)
  model.traverse(obj => {
    if (obj.isMesh) {
      obj.castShadow = false
      obj.receiveShadow = false
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
      materials.forEach(mat => {
        if ('envMapIntensity' in mat) mat.envMapIntensity = 1.3
      })
    }
  })
  return model
}

export function createStageExperience(mount, { caps, onReady, heroEl }) {
  if (!caps.webgl) return mountPoster(heroEl || document.body)

  let renderer
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: caps.tier === 'high',
      alpha: true,
      powerPreference: 'high-performance'
    })
  } catch (error) {
    return mountPoster(heroEl || document.body)
  }

  renderer.setPixelRatio(caps.dpr)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.24
  renderer.domElement.setAttribute('aria-hidden', 'true')
  mount.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0x050506, 125, 260)

  const camera = new THREE.PerspectiveCamera(29, 1, 1, 700)
  camera.position.set(0, 0, 84)

  const pmrem = new THREE.PMREMGenerator(renderer)
  const envScene = buildEnvScene()
  const envTexture = pmrem.fromScene(envScene, 0.04).texture
  scene.environment = envTexture
  envScene.traverse(obj => {
    if (obj.geometry) obj.geometry.dispose()
    if (obj.material) obj.material.dispose()
  })

  const key = new THREE.DirectionalLight(0xfff1e0, 1.75)
  key.position.set(40, 60, 50)
  const rim = new THREE.DirectionalLight(0xdfe8ff, 3.3)
  rim.position.set(-55, 25, -65)
  const fill = new THREE.DirectionalLight(0x9aa3b5, 0.35)
  fill.position.set(-30, -15, 60)
  const ambient = new THREE.AmbientLight(0xffffff, 0.14)
  scene.add(key, rim, fill, ambient)

  const stage = new THREE.Group()
  const spinner = new THREE.Group()
  const holder = new THREE.Group()
  holder.rotation.x = Math.PI / 2
  stage.add(spinner)
  spinner.add(holder)
  scene.add(stage)

  const moveRoot = new THREE.Group()
  const moveSpinner = new THREE.Group()
  moveRoot.add(moveSpinner)
  scene.add(moveRoot)
  moveRoot.visible = false

  const aniso = renderer.capabilities.getMaxAnisotropy()
  const proceduralWatch = createWatch({ tier: caps.tier, aniso })
  holder.add(proceduralWatch.group)
  const proceduralMovement = createMovement({ tier: caps.tier, aniso })
  moveSpinner.add(proceduralMovement.group)
  proceduralMovement.group.visible = true

  const state = {
    intro: caps.reduced ? 1 : 0,
    idleAngle: -0.85,
    px: 0,
    py: 0,
    pxt: 0,
    pyt: 0,
    hover: 0,
    hoverTarget: 0,
    scrollRot: 0,
    scrollY: 0,
    scrollTilt: 0,
    scrollScale: 1,
    punch: 0,
    baseX: 13.5,
    baseY: -0.5,
    dist: 84,
    lastSecond: -1,
    tickStart: -10,
    act: null,
    fade: { v: 1 },
    heroOnScreen: true
  }

  const makePose = defaults => ({
    rot: 0,
    x: 0,
    y: 0,
    dist: 84,
    tilt: 0,
    scale: 1,
    ...defaults
  })

  const defaultPose = () => makePose({
    x: state.baseX,
    y: state.baseY,
    dist: state.dist,
    scale: 1
  })

  const controllers = { watch: null, movement: null }
  const currents = {
    watch: { rot: 0, x: 0, y: 0, dist: 84, tilt: 0, scale: 1 },
    movement: { rot: 0, x: 0, y: 0, dist: 150, tilt: 0, scale: 1 }
  }

  function applyLayout(w) {
    if (w >= 1100) {
      state.baseX = 13.5
      state.baseY = -0.5
      state.dist = 84
    } else if (w >= 700) {
      state.baseX = 8
      state.baseY = -2
      state.dist = 94
    } else {
      state.baseX = 0
      state.baseY = -7.5
      state.dist = 100
    }
  }

  function resize() {
    const width = window.innerWidth
    const height = window.innerHeight
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    applyLayout(width)
    if (!running && caps.reduced) renderStatic()
  }

  const lerpTo = (cur, target, k) => {
    cur.rot += (target.rot - cur.rot) * k
    cur.x += (target.x - cur.x) * k
    cur.y += (target.y - cur.y) * k
    cur.dist += (target.dist - cur.dist) * k
    cur.tilt += (target.tilt - cur.tilt) * k
    cur.scale += (target.scale - cur.scale) * k
  }

  const tmpV3 = new THREE.Vector3()

  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05)
    const t = clock.elapsedTime

    const smooth = 1 - Math.exp(-4.5 * dt)
    state.px += (state.pxt - state.px) * smooth
    state.py += (state.pyt - state.py) * smooth
    state.hover += (state.hoverTarget - state.hover) * (1 - Math.exp(-6 * dt))

    const watchCtrl = controllers.watch && state.act === 'watch' ? controllers.watch : null
    const moveCtrl = controllers.movement && state.act === 'movement' ? controllers.movement : null

    if (!watchCtrl) {
      state.idleAngle += dt * 0.11 * state.intro

      spinner.rotation.y = state.idleAngle + state.scrollRot + state.px * 0.07
      spinner.rotation.x = state.py * 0.05
      spinner.rotation.z = 0
      stage.rotation.x = state.scrollTilt
      stage.position.x = state.baseX
      stage.position.y = state.baseY + Math.sin(t * 0.7) * 0.3 * state.intro + state.scrollY

      const scale = (0.86 + 0.14 * state.intro) *
        (1 + state.hover * 0.022 + state.punch * 0.05) * state.scrollScale
      stage.scale.setScalar(scale)

      currents.watch.dist = state.dist
      camera.position.z += (state.dist - camera.position.z) * (1 - Math.exp(-3 * dt))
      updateSecondsHand(t)
    } else {
      const pose = watchCtrl.pose
      lerpTo(currents.watch, pose, 1 - Math.exp(-5 * dt))

      spinner.rotation.y = currents.watch.rot + state.px * 0.04
      spinner.rotation.x = currents.watch.tilt + state.py * 0.025
      spinner.rotation.z = 0
      stage.rotation.x = 0
      stage.position.x = currents.watch.x
      stage.position.y = currents.watch.y + Math.sin(t * 0.6) * 0.22
      stage.scale.setScalar(currents.watch.scale * (1 + state.punch * 0.04))

      camera.position.z += (currents.watch.dist - camera.position.z) * (1 - Math.exp(-3.5 * dt))
      updateSecondsHand(t)
    }

    if (state.act === 'movement') {
      const pose = moveCtrl ? moveCtrl.pose : makePose({ dist: 130, scale: 1 })
      lerpTo(currents.movement, pose, 1 - Math.exp(-4 * dt))

      moveSpinner.rotation.y = currents.movement.rot + state.px * 0.03
      moveSpinner.rotation.x = currents.movement.tilt + state.py * 0.02
      moveSpinner.rotation.z = Math.sin(t * 0.22) * 0.02
      moveRoot.position.x = currents.movement.x
      moveRoot.position.y = currents.movement.y + Math.sin(t * 0.55) * 0.3
      moveRoot.scale.setScalar(currents.movement.scale)

      camera.position.z += (currents.movement.dist - camera.position.z) * (1 - Math.exp(-2.8 * dt))
      proceduralMovement.animate(t)
    }

    renderer.render(scene, camera)
    frameSubscribers.forEach(fn => fn(t))
  }

  const applyFade = () => {
    mount.style.opacity = state.fade.v.toFixed(3)
  }

  function updateSecondsHand(t) {
    const totalSeconds = Math.floor(t)
    if (totalSeconds !== state.lastSecond && state.intro > 0.4) {
      state.lastSecond = totalSeconds
      state.tickStart = t
    }
    const tau = t - state.tickStart
    const settle = tau < 3 ? 0.055 * Math.exp(-6 * tau) * Math.cos(13 * tau) : 0
    const baseAngle = THREE.MathUtils.degToRad(210 + ((totalSeconds + 60) % 60) * 6)
    proceduralWatch.secondPivot.rotation.y = -baseAngle + settle
  }

  function renderStatic() {
    if (state.act === 'movement') {
      moveRoot.visible = true
      stage.visible = false
      moveSpinner.rotation.set(0.32, 0.42, 0)
      moveRoot.position.set(0, 0, 0)
      moveRoot.scale.setScalar(1)
      camera.position.z = 96
      proceduralMovement.animate(1.2)
    } else {
      stage.visible = true
      moveRoot.visible = false
      spinner.rotation.y = 0.42
      spinner.rotation.x = 0
      stage.position.set(state.baseX, state.baseY, 0)
      stage.scale.setScalar(1)
      camera.position.z = state.dist
      proceduralWatch.secondPivot.rotation.y = -THREE.MathUtils.degToRad(210)
    }
    applyFade()
    renderer.render(scene, camera)
  }

  function isNeeded() {
    if (caps.reduced) return false
    if (document.hidden) return false
    if (state.fade.v > 0.005 && state.fade.v < 0.995) return true
    if (state.intro < 1) return true
    if (state.heroOnScreen) return true
    return state.act !== null && state.fade.v > 0.005
  }

  function loop() {
    rafId = requestAnimationFrame(loop)
    if (!isNeeded()) return
    tick()
  }

  let running = false
  let rafId = 0
  let disposed = false
  const clock = new THREE.Clock()
  const frameSubscribers = new Set()
  gsap.ticker.add(applyFade)

  function start() {
    if (running || disposed || caps.reduced) return
    running = true
    clock.getDelta()
    rafId = requestAnimationFrame(loop)
  }

  function stop() {
    running = false
    cancelAnimationFrame(rafId)
  }

  const firstFrame = new Promise(resolve => {
    requestAnimationFrame(() => {
      resize()
      if (caps.reduced) {
        renderStatic()
      } else {
        clock.getDelta()
        tick()
      }
      resolve()
    })
  })

  if (MODELS_POSSIBLE) {
    loadGLB(WATCH_URL, 2600).then(gltf => {
      if (!gltf || disposed) return
      holder.remove(proceduralWatch.group)
      proceduralWatch.dispose()
      holder.rotation.x = 0
      holder.add(normalizeModel(gltf.scene, 46))
      if (caps.reduced && state.act !== 'movement') renderStatic()
    })

    loadGLB(MOVEMENT_URL, 3200).then(gltf => {
      if (!gltf || disposed) return
      moveSpinner.remove(proceduralMovement.group)
      proceduralMovement.dispose()
      moveSpinner.add(normalizeModel(gltf.scene, 58))
      if (caps.reduced && state.act === 'movement') renderStatic()
    })
  }

  window.addEventListener('resize', resize)

  const intersectionObserver = new IntersectionObserver(
    entries => {
      state.heroOnScreen = entries[0].isIntersecting
    },
    { threshold: 0 }
  )
  if (heroEl) intersectionObserver.observe(heroEl)

  const onVisibility = () => {
    if (!document.hidden) start()
  }
  document.addEventListener('visibilitychange', onVisibility)

  let removePointer = () => {}
  if (caps.finePointer && !caps.reduced) {
    const onMove = event => {
      state.pxt = (event.clientX / window.innerWidth) * 2 - 1
      state.pyt = (event.clientY / window.innerHeight) * 2 - 1
    }
    const onEnter = () => { state.hoverTarget = 1 }
    const onLeave = () => { state.hoverTarget = 0 }
    window.addEventListener('mousemove', onMove, { passive: true })
    heroEl?.addEventListener('mouseenter', onEnter)
    heroEl?.addEventListener('mouseleave', onLeave)
    removePointer = () => {
      window.removeEventListener('mousemove', onMove)
      heroEl?.removeEventListener('mouseenter', onEnter)
      heroEl?.removeEventListener('mouseleave', onLeave)
    }
  }

  start()

  const ready = Promise.race([
    firstFrame,
    new Promise(resolve => setTimeout(resolve, 1800))
  ])
  ready.then(() => onReady && onReady())

  const watchAnchors = {
    crystal: new THREE.Vector3(0, 3.6, -15.2),
    crown: new THREE.Vector3(25, 1, 0),
    dial: new THREE.Vector3(-8.5, 3.2, 9),
    back: new THREE.Vector3(0, -4.6, 0)
  }

  return {
    ready,
    get scrollState() {
      return state
    },
    setIntroProgress(value) {
      state.intro = value
    },
    get act() {
      return state.act
    },
    setAct(name) {
      if (disposed || state.act === name) return
      state.act = name
      stage.visible = name !== 'movement'
      moveRoot.visible = name === 'movement'
      const targetOpacity = name ? 1 : 0
      if (caps.reduced) {
        state.fade.v = targetOpacity
        renderStatic()
        return
      }
      gsap.to(state.fade, {
        v: targetOpacity,
        duration: 0.7,
        ease: 'power2.inOut',
        overwrite: true,
        onComplete: () => {
          if (!name && !state.heroOnScreen && state.intro >= 1) stop()
        }
      })
      start()
    },
    setFade(value, silent) {
      if (disposed || caps.reduced) return
      if (silent) {
        gsap.to(state.fade, { v: value, duration: 0.01, overwrite: true })
        if (value > 0.005) start()
        return
      }
      gsap.to(state.fade, {
        v: value,
        duration: 0.7,
        ease: 'power2.inOut',
        overwrite: true,
        onComplete: () => {
          if (value === 0 && !state.heroOnScreen && state.intro >= 1 && state.act === null) stop()
        }
      })
      start()
    },
    setFadeRaw(value) {
      if (disposed || caps.reduced) return
      state.fade.v = Math.max(0, Math.min(1, value))
      if (state.fade.v > 0.005 && !running) start()
    },
    takeControl(act, name) {
      const pose = makePose(act === 'movement' ? { dist: 130 } : {})
      controllers[act] = { name, pose }
      return {
        pose,
        release() {
          if (controllers[act] && controllers[act].name === name) controllers[act] = null
        }
      }
    },
    projectWatchPoint(localPoint, out) {
      tmpV3.copy(localPoint)
      holder.localToWorld(tmpV3)
      tmpV3.project(camera)
      out.x = (tmpV3.x * 0.5 + 0.5) * window.innerWidth
      out.y = (-tmpV3.y * 0.5 + 0.5) * window.innerHeight
      return tmpV3.z < 1
    },
    onFrame(fn) {
      frameSubscribers.add(fn)
      return () => frameSubscribers.delete(fn)
    },
    pulse() {
      if (disposed || caps.reduced) return
      gsap.to(state, {
        duration: 1.8,
        ease: 'power3.out',
        idleAngle: '+=0.38'
      })
      gsap.timeline()
        .to(state, { duration: 0.55, ease: 'power2.out', punch: 1 })
        .to(state, { duration: 1.3, ease: 'power3.out', punch: 0 })
    },
    destroy() {
      disposed = true
      stop()
      gsap.ticker.remove(applyFade)
      window.removeEventListener('resize', resize)
      intersectionObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      removePointer()
      proceduralWatch.dispose()
      proceduralMovement.dispose()
      envTexture.dispose()
      pmrem.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }
}

function mountPoster(container) {
  const wrap = document.createElement('div')
  wrap.className = 'watch-poster'
  wrap.innerHTML = POSTER_SVG
  container.appendChild(wrap)
  requestAnimationFrame(() => wrap.classList.add('is-ready'))
  const stubControl = () => ({ pose: {}, release() {} })
  return {
    ready: Promise.resolve(),
    setIntroProgress() {},
    get act() {
      return null
    },
    setAct() {},
    setFade() {},
    setFadeRaw() {},
    takeControl: stubControl,
    projectWatchPoint(point, out) {
      out.x = window.innerWidth * 0.62
      out.y = window.innerHeight * 0.5
      return true
    },
    onFrame() {
      return () => {}
    },
    pulse() {},
    destroy() {
      wrap.remove()
    }
  }
}

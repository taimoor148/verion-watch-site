import * as THREE from 'three'

export function makeDialTexture(aniso) {
  const size = 1024
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const c = size / 2

  const base = ctx.createRadialGradient(c, c * 0.94, 40, c, c, c)
  base.addColorStop(0, '#181a20')
  base.addColorStop(0.55, '#0c0d11')
  base.addColorStop(1, '#060709')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, size, size)

  ctx.save()
  ctx.translate(c, c)
  for (let i = 0; i < 180; i++) {
    const angle = (i / 180) * Math.PI * 2
    const alpha = 0.012 + Math.abs(Math.sin(i * 1.7)) * 0.038
    ctx.strokeStyle = `rgba(196, 204, 218, ${alpha.toFixed(3)})`
    ctx.lineWidth = 1.6
    ctx.beginPath()
    ctx.moveTo(Math.cos(angle) * 64, Math.sin(angle) * 64)
    ctx.lineTo(Math.cos(angle) * 470, Math.sin(angle) * 470)
    ctx.stroke()
  }
  ctx.restore()

  ctx.strokeStyle = 'rgba(200, 178, 135, 0.28)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(c, c, 468, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = 'rgba(237, 232, 221, 0.16)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(c, c, 430, 0, Math.PI * 2)
  ctx.stroke()

  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * Math.PI * 2
    const major = i % 5 === 0
    const len = major ? 26 : 12
    const inner = major ? 404 : 418
    ctx.save()
    ctx.translate(c, c)
    ctx.rotate(angle)
    ctx.strokeStyle = major ? 'rgba(226, 217, 199, 0.85)' : 'rgba(226, 217, 199, 0.4)'
    ctx.lineWidth = major ? 3 : 1.5
    ctx.beginPath()
    ctx.moveTo(0, -inner)
    ctx.lineTo(0, -(inner + len))
    ctx.stroke()
    ctx.restore()
  }

  ctx.save()
  ctx.translate(c, c)
  ctx.strokeStyle = 'rgba(200, 178, 135, 0.45)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(0, 0, 58, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()

  try { ctx.letterSpacing = '10px' } catch (error) {}
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#e6dcc7'
  ctx.font = '600 54px "Cormorant Garamond", Georgia, serif'
  ctx.fillText('VÉRION', c + 5, c - 148)

  try { ctx.letterSpacing = '7px' } catch (error) {}
  ctx.fillStyle = 'rgba(230, 220, 199, 0.55)'
  ctx.font = '400 19px Inter, Arial, sans-serif'
  ctx.fillText('SWISS MADE', c + 4, c + 330)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = aniso
  return texture
}

export function makeBrushedTexture() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#6a6a6a'
  ctx.fillRect(0, 0, size, size)

  for (let i = 0; i < 1400; i++) {
    const y = Math.random() * size
    const shade = 90 + Math.floor(Math.random() * 70)
    ctx.strokeStyle = `rgba(${shade}, ${shade}, ${shade}, ${0.08 + Math.random() * 0.14})`
    ctx.lineWidth = Math.random() < 0.85 ? 1 : 2
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(size, y)
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

export function makeStripesTexture() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#b9bcc3'
  ctx.fillRect(0, 0, size, size)

  const band = size / 8
  for (let i = 0; i < 8; i++) {
    const shade = i % 2 === 0 ? 205 : 158
    ctx.fillStyle = `rgb(${shade}, ${shade + 2}, ${shade + 6})`
    ctx.fillRect(i * band, 0, band, size)
    const edge = ctx.createLinearGradient(i * band, 0, (i + 1) * band, 0)
    edge.addColorStop(0, 'rgba(30,32,38,0.35)')
    edge.addColorStop(0.08, 'rgba(30,32,38,0)')
    edge.addColorStop(1, 'rgba(255,255,255,0.05)')
    ctx.fillStyle = edge
    ctx.fillRect(i * band, 0, band, size)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1.6, 1.6)
  return texture
}

export function makeShadowTexture() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(c2(size), c2(size), 10, c2(size), c2(size), size / 2)
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.62)')
  gradient.addColorStop(0.55, 'rgba(0, 0, 0, 0.28)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

function c2(v) {
  return v / 2
}

export function buildEnvScene() {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x030304)

  const strip = (w, h, pos, color, intensity) => {
    const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })
    material.color = new THREE.Color(color).multiplyScalar(intensity)
    material.toneMapped = false
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material)
    mesh.position.set(pos[0], pos[1], pos[2])
    mesh.lookAt(0, 0, 0)
    scene.add(mesh)
  }

  strip(34, 16, [-20, 24, 28], [1, 0.93, 0.82], 5.5)
  strip(44, 4, [16, 12, -32], [0.75, 0.82, 1], 8)
  strip(26, 3, [0, 32, 8], [1, 1, 1], 6)
  strip(26, 20, [30, -4, 22], [1, 0.97, 0.93], 1.6)
  strip(6, 30, [-34, 4, -8], [0.9, 0.92, 1], 3)
  strip(44, 44, [0, -30, 0], [1, 0.95, 0.88], 0.35)

  return scene
}

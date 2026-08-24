import * as THREE from 'three'
import { makeStripesTexture } from './textures.js'

function gearGeometry(teeth, rOut, rIn, depth) {
  const shape = new THREE.Shape()
  const step = (Math.PI * 2) / teeth
  for (let i = 0; i < teeth; i++) {
    const a = i * step
    if (i === 0) shape.moveTo(Math.cos(a) * rIn, Math.sin(a) * rIn)
    else shape.lineTo(Math.cos(a) * rIn, Math.sin(a) * rIn)
    shape.lineTo(Math.cos(a + step * 0.12) * rOut, Math.sin(a + step * 0.12) * rOut)
    shape.lineTo(Math.cos(a + step * 0.38) * rOut, Math.sin(a + step * 0.38) * rOut)
    shape.lineTo(Math.cos(a + step * 0.52) * rIn, Math.sin(a + step * 0.52) * rIn)
  }
  shape.closePath()
  const hole = new THREE.Path()
  hole.absarc(0, 0, rIn * 0.22, 0, Math.PI * 2, true)
  shape.holes.push(hole)
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    curveSegments: 6
  })
  geo.translate(0, 0, -depth / 2)
  return geo
}

function stadiumGeometry(w, h, depth) {
  const r = h / 2
  const len = w - h
  const shape = new THREE.Shape()
  shape.moveTo(-len / 2, -r)
  shape.lineTo(len / 2, -r)
  shape.absarc(len / 2, 0, r, -Math.PI / 2, Math.PI / 2, false)
  shape.lineTo(-len / 2, r)
  shape.absarc(-len / 2, 0, r, Math.PI / 2, Math.PI * 1.5, false)
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.35,
    bevelSize: 0.35,
    bevelSegments: 2,
    curveSegments: 24
  })
  geo.translate(0, 0, -depth / 2)
  return geo
}

export function createMovement({ tier }) {
  const group = new THREE.Group()
  const geometries = []
  const materials = []
  const textures = []
  const trackGeo = geo => { geometries.push(geo); return geo }
  const trackMat = mat => { materials.push(mat); return mat }

  const seg = tier === 'high' ? 96 : 56

  const plateMat = trackMat(new THREE.MeshStandardMaterial({
    color: 0x24262c,
    metalness: 0.92,
    roughness: 0.42,
    envMapIntensity: 0.9
  }))

  const stripes = makeStripesTexture()
  textures.push(stripes)

  const bridgeMat = trackMat(new THREE.MeshPhysicalMaterial({
    color: 0x9ea2ab,
    metalness: 1,
    roughness: 0.3,
    map: stripes,
    envMapIntensity: 1.15
  }))

  const brassMat = trackMat(new THREE.MeshPhysicalMaterial({
    color: 0xb9975f,
    metalness: 1,
    roughness: 0.26,
    envMapIntensity: 1.25
  }))

  const steelMat = trackMat(new THREE.MeshPhysicalMaterial({
    color: 0xc7cad0,
    metalness: 1,
    roughness: 0.18,
    envMapIntensity: 1.25
  }))

  const rubyMat = trackMat(new THREE.MeshPhysicalMaterial({
    color: 0x6e1622,
    metalness: 0.1,
    roughness: 0.15,
    clearcoat: 1,
    envMapIntensity: 1.1
  }))

  const screwMat = trackMat(new THREE.MeshStandardMaterial({
    color: 0x22304e,
    metalness: 0.9,
    roughness: 0.3,
    envMapIntensity: 1
  }))

  const rotorDarkMat = trackMat(new THREE.MeshPhysicalMaterial({
    color: 0x3b3e46,
    metalness: 1,
    roughness: 0.34,
    envMapIntensity: 1.1
  }))

  const plate = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(30, 29, 2.4, seg)), plateMat)
  plate.rotation.x = Math.PI / 2
  plate.position.z = -1.4
  group.add(plate)

  const plateRim = new THREE.Mesh(trackGeo(new THREE.TorusGeometry(29.4, 0.9, 12, seg)), steelMat)
  plateRim.position.z = -0.4
  group.add(plateRim)

  const bridgeGeo = trackGeo(stadiumGeometry(27, 10, 1.6))
  const bridges = []
  for (let i = 0; i < 3; i++) {
    const angle = -0.5 + i * ((Math.PI * 2) / 3)
    const bridge = new THREE.Mesh(bridgeGeo, bridgeMat)
    bridge.position.set(Math.cos(angle) * 14, Math.sin(angle) * 14, 0.4)
    bridge.rotation.z = angle + Math.PI / 2
    bridges.push(bridge)
    group.add(bridge)

    const jewel = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(1.05, 1.05, 0.55, 20)), rubyMat)
    jewel.rotation.x = Math.PI / 2
    jewel.position.set(Math.cos(angle) * 14, Math.sin(angle) * 14, 1.35)
    group.add(jewel)

    const screw = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.72, 0.72, 0.34, 16)), screwMat)
    screw.rotation.x = Math.PI / 2
    screw.position.set(Math.cos(angle + 0.34) * 21.5, Math.sin(angle + 0.34) * 21.5, 1.28)
    group.add(screw)
  }

  const gearSpecs = [
    { teeth: 26, r: 8.4, x: 8.5, y: -7, mat: brassMat, speed: 0.16 },
    { teeth: 18, r: 5.6, x: -3.5, y: -13.5, mat: steelMat, speed: -0.24 },
    { teeth: 15, r: 4.4, x: 17, y: 3.5, mat: brassMat, speed: 0.31 },
    { teeth: 12, r: 3.2, x: -15.5, y: -3, mat: steelMat, speed: -0.42 }
  ]
  const gears = []
  for (const spec of gearSpecs) {
    const gear = new THREE.Mesh(
      trackGeo(gearGeometry(spec.teeth, spec.r, spec.r * 0.82, 1.1)),
      spec.mat
    )
    gear.position.set(spec.x, spec.y, -0.2)
    group.add(gear)
    gears.push({ mesh: gear, speed: spec.speed })

    const pinion = new THREE.Mesh(
      trackGeo(gearGeometry(8, spec.r * 0.3, spec.r * 0.24, 1.7)),
      steelMat
    )
    pinion.position.copy(gear.position)
    pinion.position.z += 1.4
    group.add(pinion)
    gears.push({ mesh: pinion, speed: spec.speed * 2.4 })

    const pivotJewel = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.62, 0.62, 0.4, 14)), rubyMat)
    pivotJewel.rotation.x = Math.PI / 2
    pivotJewel.position.set(spec.x, spec.y, 1.55)
    group.add(pivotJewel)
  }

  const escapeWheel = new THREE.Mesh(
    trackGeo(gearGeometry(15, 3.4, 2.9, 0.8)),
    brassMat
  )
  escapeWheel.position.set(11, -12.5, 0.9)
  group.add(escapeWheel)

  const balanceGroup = new THREE.Group()
  balanceGroup.position.set(-13, 11.5, 1)
  const balanceRing = new THREE.Mesh(trackGeo(new THREE.TorusGeometry(5.4, 0.62, 12, 64)), brassMat)
  const spokeA = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(10.2, 0.66, 0.5)), brassMat)
  const spokeB = spokeA.clone()
  spokeB.rotation.z = Math.PI / 2
  const balanceStaff = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.4, 0.4, 2.4, 10)), steelMat)
  balanceStaff.rotation.x = Math.PI / 2
  balanceGroup.add(balanceRing, spokeA, spokeB, balanceStaff)
  group.add(balanceGroup)

  const spring = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(4, 0.075, 6, 80, 4.9)),
    steelMat
  )
  spring.position.set(-13, 11.5, 0.15)
  group.add(spring)

  const rotorGroup = new THREE.Group()
  rotorGroup.position.z = 3.4
  const rotorArc = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(16.5, 2.5, 14, 80, Math.PI)),
    rotorDarkMat
  )
  rotorArc.rotation.z = Math.PI
  const rotorArm = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(33, 3.4, 1.1)), bridgeMat)
  const rotorHub = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(4.2, 4.2, 1.5, seg)), steelMat)
  rotorHub.rotation.x = Math.PI / 2
  const weight = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(3.4, 24, 16)), brassMat)
  weight.scale.set(1, 1.25, 0.55)
  weight.position.set(0, -16.8, 0)
  rotorGroup.add(rotorArc, rotorArm, rotorHub, weight)
  group.add(rotorGroup)

  let escapeTick = 0

  function animate(t) {
    for (const gear of gears) gear.mesh.rotation.z = t * gear.speed
    const tickIndex = Math.floor(t * 5)
    if (tickIndex !== escapeTick) escapeTick = tickIndex
    escapeWheel.rotation.z = -(tickIndex / 5) * ((Math.PI * 2) / 15)
    balanceGroup.rotation.z = Math.sin(t * Math.PI * 2 * 2.5) * 1.4
    spring.scale.setScalar(1 + Math.sin(t * Math.PI * 2 * 2.5) * 0.03)
    rotorGroup.rotation.z = -t * 0.14
  }

  function dispose() {
    geometries.forEach(geo => geo.dispose())
    materials.forEach(mat => mat.dispose())
    textures.forEach(tex => tex.dispose())
  }

  return { group, animate, dispose }
}

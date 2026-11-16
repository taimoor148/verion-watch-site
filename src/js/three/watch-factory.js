import * as THREE from 'three'
import { makeDialTexture, makeBrushedTexture } from './textures.js'

export function createWatch({ tier, aniso }) {
  const group = new THREE.Group()
  const geometries = []
  const materials = []
  const textures = []
  const layers = []
  const layer = (object, x, y, z) => {
    layers.push({ object, origin: object.position.clone(), offset: new THREE.Vector3(x, y, z) })
    return object
  }

  const trackGeo = geo => { geometries.push(geo); return geo }
  const trackMat = mat => { materials.push(mat); return mat }

  const polished = trackMat(new THREE.MeshPhysicalMaterial({
    color: 0xd9dbde,
    metalness: 1,
    roughness: 0.07,
    envMapIntensity: 1.4
  }))

  const brushedMap = makeBrushedTexture()
  brushedMap.repeat.set(6, 1)
  textures.push(brushedMap)

  const brushed = trackMat(new THREE.MeshPhysicalMaterial({
    color: 0xb9bcc2,
    metalness: 1,
    roughness: 1,
    roughnessMap: brushedMap,
    envMapIntensity: 1.15
  }))

  const champagne = trackMat(new THREE.MeshPhysicalMaterial({
    color: 0xd5bd8f,
    metalness: 1,
    roughness: 0.16,
    envMapIntensity: 1.3
  }))

  const darkMetal = trackMat(new THREE.MeshStandardMaterial({
    color: 0x141519,
    metalness: 0.9,
    roughness: 0.45,
    envMapIntensity: 0.8
  }))

  const linkPolished = trackMat(new THREE.MeshPhysicalMaterial({
    color: 0xc4c7cc,
    metalness: 1,
    roughness: 0.16,
    envMapIntensity: 1.2
  }))

  const linkGraphite = trackMat(new THREE.MeshPhysicalMaterial({
    color: 0x1a1b20,
    metalness: 0.92,
    roughness: 0.4,
    envMapIntensity: 1.05
  }))

  const dialTexture = makeDialTexture(aniso)
  textures.push(dialTexture)

  const dialMat = trackMat(new THREE.MeshStandardMaterial({
    map: dialTexture,
    metalness: 0.28,
    roughness: 0.42,
    envMapIntensity: 0.85
  }))

  const seg = tier === 'high' ? 128 : 72

  const caseProfile = [
    [16.6, -4.3], [20.4, -3.7], [21.4, -1.4], [21.4, 1.6], [20.5, 2.9], [17.5, 2.95]
  ].map(p => new THREE.Vector2(p[0], p[1]))
  const caseBand = new THREE.Mesh(trackGeo(new THREE.LatheGeometry(caseProfile, seg)), brushed)
  group.add(caseBand)

  const bezelProfile = [
    [17.5, 2.95], [20.4, 2.95], [21.3, 3.8], [20.6, 4.55], [18.9, 4.75], [17.6, 3.75]
  ].map(p => new THREE.Vector2(p[0], p[1]))
  const bezel = new THREE.Mesh(trackGeo(new THREE.LatheGeometry(bezelProfile, seg)), polished)
  group.add(bezel)
  layer(bezel, 0, 13, 0)

  const caseBack = new THREE.Mesh(trackGeo(new THREE.CircleGeometry(16.8, seg)), darkMetal)
  caseBack.rotation.x = Math.PI / 2
  caseBack.position.y = -4.3
  group.add(caseBack)
  layer(caseBack, 0, -14, 0)

  const rehaut = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(16.9, 17.45, 1.15, seg, 1, true)),
    trackMat(new THREE.MeshStandardMaterial({
      color: 0x101115,
      metalness: 0.7,
      roughness: 0.55,
      side: THREE.DoubleSide,
      envMapIntensity: 0.5
    }))
  )
  rehaut.position.y = 3.45
  group.add(rehaut)
  layer(rehaut, 0, 7, 0)

  const dial = new THREE.Mesh(trackGeo(new THREE.CircleGeometry(17.05, seg)), dialMat)
  dial.rotation.x = -Math.PI / 2
  dial.position.y = 3.02
  group.add(dial)
  layer(dial, 0, 5, 0)

  const indexGeo = trackGeo(new THREE.BoxGeometry(0.85, 0.45, 2.6))
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2
    const isTwelve = i === 0
    const offsets = isTwelve ? [-0.82, 0.82] : [0]
    for (const dx of offsets) {
      const index = new THREE.Mesh(indexGeo, isTwelve ? champagne : polished)
      index.position.set(Math.sin(angle) * 14.2 + dx, 3.28, -Math.cos(angle) * 14.2)
      index.rotation.y = angle
      group.add(index)
      layer(index, 0, 5, 0)
    }
  }

  const handShape = (w, l) => {
    const shape = new THREE.Shape()
    shape.moveTo(0, -1.8)
    shape.lineTo(w, l * 0.3)
    shape.lineTo(0, l)
    shape.lineTo(-w, l * 0.3)
    shape.closePath()
    return shape
  }

  const makeHand = (w, l, y, material, angleDeg) => {
    const pivot = new THREE.Group()
    pivot.position.y = y
    const geo = trackGeo(new THREE.ExtrudeGeometry(handShape(w, l), {
      depth: 0.3,
      bevelEnabled: false
    }))
    const mesh = new THREE.Mesh(geo, material)
    mesh.rotation.x = -Math.PI / 2
    pivot.add(mesh)
    pivot.rotation.y = -THREE.MathUtils.degToRad(angleDeg)
    group.add(pivot)
    layer(pivot, 0, 20, 0)
    return pivot
  }

  makeHand(1.55, 8.8, 3.42, polished, 304.5)
  makeHand(1.2, 13.4, 3.58, polished, 54)

  const secondPivot = new THREE.Group()
  secondPivot.position.y = 3.72
  const needle = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.18, 0.24, 19.4)),
    champagne
  )
  needle.position.z = -5
  const counterweight = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.62, 0.62, 0.26, 24)),
    champagne
  )
  counterweight.position.z = 4.7
  secondPivot.add(needle, counterweight)
  secondPivot.rotation.y = -THREE.MathUtils.degToRad(210)
  group.add(secondPivot)
  layer(secondPivot, 0, 23, 0)

  const cap = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.85, 0.85, 0.5, 32)),
    champagne
  )
  cap.position.y = 3.66
  group.add(cap)
  layer(cap, 0, 23, 0)

  const crystalTheta = Math.asin(18.3 / 139)
  const crystalGeo = trackGeo(new THREE.SphereGeometry(139, tier === 'high' ? 96 : 56, tier === 'high' ? 12 : 8, 0, Math.PI * 2, 0, crystalTheta))
  const crystal =
    tier === 'high'
      ? trackMat(new THREE.MeshPhysicalMaterial({
          transmission: 1,
          thickness: 0.9,
          roughness: 0.03,
          ior: 1.76,
          metalness: 0,
          specularIntensity: 1,
          envMapIntensity: 1.2
        }))
      : trackMat(new THREE.MeshPhysicalMaterial({
          transparent: true,
          opacity: 0.14,
          roughness: 0.04,
          metalness: 0,
          clearcoat: 1,
          envMapIntensity: 1.3
        }))
  const crystalMesh = new THREE.Mesh(crystalGeo, crystal)
  crystalMesh.position.y = 3.35 - 139 * Math.cos(crystalTheta)
  group.add(crystalMesh)
  layer(crystalMesh, 0, 31, 0)

  const crown = new THREE.Group()
  const crownBody = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(2.05, 2.05, 2.3, 48)),
    polished
  )
  crownBody.rotation.z = Math.PI / 2
  const grooveGeo = trackGeo(new THREE.TorusGeometry(2.02, 0.1, 10, 64))
  const grooveA = new THREE.Mesh(grooveGeo, darkMetal)
  grooveA.rotation.y = Math.PI / 2
  grooveA.position.x = -0.5
  const grooveB = new THREE.Mesh(grooveGeo, darkMetal)
  grooveB.rotation.y = Math.PI / 2
  grooveB.position.x = 0.5
  const crownCap = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(1.15, 1.15, 0.22, 48)),
    champagne
  )
  crownCap.rotation.z = Math.PI / 2
  crownCap.position.x = 1.26
  crown.add(crownBody, grooveA, grooveB, crownCap)
  crown.position.set(22.7, 1, 0)
  group.add(crown)
  layer(crown, 12, 0, 0)

  const lugGeo = trackGeo(new THREE.BoxGeometry(2.9, 2.2, 4.6))
  const lugSpecs = [
    [-7.2, -22.3, -0.18],
    [7.2, -22.3, -0.18],
    [-7.2, 22.3, 0.18],
    [7.2, 22.3, 0.18]
  ]
  for (const [lx, lz, lrx] of lugSpecs) {
    const lug = new THREE.Mesh(lugGeo, polished)
    lug.position.set(lx, 0.4, lz)
    lug.rotation.x = lrx
    lug.scale.y = 0.8
    group.add(lug)
  }

  const wristR = 24
  const wristCy = -28.3
  const stepPhi = 4 / wristR
  const links = 13
  for (const side of [1, -1]) {
    for (let i = 1; i <= links; i++) {
      const phi = i * stepPhi
      const progress = phi / (links * stepPhi)
      const width = i === 1 ? 17 : 15.5 - 5.2 * progress
      const link = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(width, 2.3, 3.3)),
        i % 2 === 0 ? linkPolished : linkGraphite
      )
      link.position.set(0, wristCy + wristR * Math.cos(phi), side * wristR * Math.sin(phi))
      link.rotation.x = side === 1 ? phi : Math.PI - phi
      group.add(link)
      layer(link, 0, -5, side * 12)
    }
  }

  const dispose = () => {
    geometries.forEach(geo => geo.dispose())
    materials.forEach(mat => mat.dispose())
    textures.forEach(tex => tex.dispose())
  }

  function setExplode(amount) {
    const progress = THREE.MathUtils.clamp(amount, 0, 1)
    layers.forEach(({ object, origin, offset }) => object.position.copy(origin).addScaledVector(offset, progress))
  }

  return { group, secondPivot, setExplode, dispose }
}

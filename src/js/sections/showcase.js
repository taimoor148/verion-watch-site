import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Vector3 } from 'three'

const HOTSPOTS = [
  {
    id: 'crystal',
    index: '01',
    title: 'Box Crystal',
    text: 'A single block of sapphire, cut and polished for eleven days. Its curved edge bends light twice before it reaches the dial.',
    local: [0, 3.6, -15.2],
    focus: { rot: -0.14, x: 0, y: 2.5, dist: -26, tilt: 0.1 }
  },
  {
    id: 'crown',
    index: '02',
    title: 'Signed Crown',
    text: 'Seventy-two flutes, cut individually and checked by hand. Three turns from open to wound — never more.',
    local: [25, 1, 0],
    focus: { rot: 0.62, x: -9, y: 0.5, dist: -22, tilt: -0.04 }
  },
  {
    id: 'dial',
    index: '03',
    title: 'Grand Feu Dial',
    text: 'Enamel fired at 820 degrees, four times. One in three survives the kiln. The rest are destroyed.',
    local: [-8.5, 3.2, 9],
    focus: { rot: -0.42, x: 10, y: -1.5, dist: -30, tilt: 0.06 }
  },
  {
    id: 'back',
    index: '04',
    title: 'Exhibition Back',
    text: 'The caseback opens a window onto Calibre V-01. Every wheel is bevelled, every screw blued by heat.',
    local: [0, -4.6, 0],
    focus: { rot: Math.PI * 0.96, x: 0, y: 5, dist: -16, tilt: 0.42 }
  }
]

export function initShowcase({ caps, experience }) {
  const section = document.querySelector('.showcase')
  if (!section) return

  const head = section.querySelector('.showcase__head')
  const sub = section.querySelector('.showcase__sub')
  const annotations = section.querySelector('.annotations')
  const hotspotsLayer = section.querySelector('.hotspots')
  const card = section.querySelector('.hotspot-card')
  const cardIndex = card?.querySelector('.hotspot-card__index')
  const cardTitle = card?.querySelector('.hotspot-card__title')
  const cardText = card?.querySelector('.hotspot-card__text')

  const base = { rot: -0.72, x: 0, y: 0, dist: 152, tilt: 0.3, scale: 1 }
  const focus = { rot: 0, x: 0, y: 0, dist: 0, tilt: 0, scale: 0 }
  const ctrl = experience.takeControl('watch', 'showcase')
  experience.onFrame(() => {
    ctrl.pose.rot = base.rot + focus.rot
    ctrl.pose.x = base.x + focus.x
    ctrl.pose.y = base.y + focus.y
    ctrl.pose.dist = base.dist + focus.dist
    ctrl.pose.tilt = base.tilt + focus.tilt
    ctrl.pose.scale = base.scale + focus.scale
  })

  ScrollTrigger.create({
    trigger: section,
    start: 'top 72%',
    end: 'bottom 12%',
    onToggle: self => experience.setAct(self.isActive ? 'watch' : null)
  })

  if (caps.reduced) {
    gsap.set([head, annotations], { opacity: 1 })
    if (card && HOTSPOTS[0]) fillCard(HOTSPOTS[0])
    return
  }

  gsap.set(sub, { opacity: 0, letterSpacing: '0.7em' })
  gsap.set(head.children, { opacity: 0, y: 30 })
  gsap.set(annotations.children, { opacity: 0, y: 24 })

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      onUpdate: self => updatePhase(self.progress)
    }
  })

  tl.to(base, { dist: 118, rot: -0.28, tilt: 0.16, duration: 1 }, 0)
    .to(head.children, { opacity: 1, y: 0, duration: 0.12, stagger: 0.03, ease: 'power2.out' }, 0.02)
    .to(base, { rot: 0.55, x: 9, y: 2, dist: 98, tilt: -0.05, duration: 1 }, 1)
    .to(base, { rot: 0.18, x: -4, dist: 90, tilt: 0.08, duration: 1 }, 2)
    .to(base, { rot: -0.06, x: 0, y: 0, dist: 86, tilt: 0.02, scale: 1.05, duration: 1 }, 3)
    .to(head.children, { opacity: 0, y: -26, duration: 0.14, stagger: 0.02, ease: 'power2.in' }, 3.1)
    .to(sub, { opacity: 1, letterSpacing: '0.42em', duration: 0.22, ease: 'power2.out' }, 3.35)
    .to(annotations.children, { opacity: 1, y: 0, duration: 0.2, stagger: 0.045, ease: 'power3.out' }, 3.45)

  const markers = []
  const point = new Vector3()
  const screen = { x: 0, y: 0 }

  function fillCard(item) {
    if (!card) return
    cardIndex.textContent = `${item.index} / ${item.title.toUpperCase()}`
    cardTitle.textContent = item.title
    cardText.textContent = item.text
  }

  function setActive(id) {
    markers.forEach(m => {
      const on = m.item.id === id
      m.btn.classList.toggle('is-active', on)
      m.btn.setAttribute('aria-expanded', String(on))
    })
    const item = HOTSPOTS.find(h => h.id === id)
    if (!item || !card) return
    fillCard(item)
    card.classList.add('is-open')
    gsap.fromTo(
      card.children,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.55, stagger: 0.06, ease: 'power3.out', overwrite: true }
    )
    gsap.to(focus, { ...item.focus, duration: 1.4, ease: 'power3.inOut', overwrite: true })
  }

  HOTSPOTS.forEach((item, i) => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = `hotspot${i % 2 ? ' hotspot--flip' : ''}`
    btn.setAttribute('aria-expanded', 'false')
    btn.setAttribute('aria-label', item.title)
    btn.innerHTML = `<span class="hotspot__body"><span class="hotspot__dot"></span><span class="hotspot__line"></span><span class="hotspot__tag"><b>${item.index}</b>${item.title.toUpperCase()}</span></span>`
    btn.addEventListener('click', () => setActive(item.id))
    hotspotsLayer.appendChild(btn)
    markers.push({ btn, item })
  })

  let phaseLive = false
  function updatePhase(progress) {
    const live = progress > 0.68
    if (live !== phaseLive) {
      phaseLive = live
      markers.forEach((m, i) => {
        setTimeout(() => m.btn.classList.toggle('is-placed', live), live ? i * 120 : 0)
      })
      if (!live) card.classList.remove('is-open')
    }
  }

  const removeFrame = experience.onFrame(() => {
    markers.forEach(({ btn, item }) => {
      point.set(item.local[0], item.local[1], item.local[2])
      const visible = experience.projectWatchPoint(point, screen)
      btn.style.transform = `translate3d(${screen.x.toFixed(1)}px, ${screen.y.toFixed(1)}px, 0)`
      btn.style.opacity = visible ? '' : '0'
    })
  })

  window.addEventListener('pagehide', removeFrame, { once: true })
}

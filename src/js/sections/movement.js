import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const FORMATTERS = {
  plain: value => String(Math.round(value)),
  thousands: value => Math.round(value).toLocaleString('en-US'),
  pad: (value, el) => String(Math.round(value)).padStart(Number(el.dataset.pad || 2), '0')
}

export function initMovement({ caps, experience }) {
  const section = document.querySelector('.movement')
  if (!section) return

  const head = section.querySelector('.movement__head')
  const specs = section.querySelector('.specs')
  const counters = section.querySelectorAll('[data-count]')

  ScrollTrigger.create({
    trigger: section,
    start: 'top 80%',
    end: 'bottom 20%',
    onToggle: self => experience.setAct(self.isActive ? 'movement' : null)
  })

  if (caps.reduced) return

  const ctrl = experience.takeControl('movement', 'story')
  const pose = ctrl.pose
  gsap.set(pose, { dist: 168, rot: -0.5, tilt: 0.34, y: 4 })

  gsap.set(head.children, { opacity: 0, y: 36 })
  gsap.set(specs.children, { opacity: 0, y: 40 })

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      invalidateOnRefresh: true
    }
  })

  tl.to(head.children, { opacity: 1, y: 0, duration: 0.1, stagger: 0.03, ease: 'power2.out' }, 0)
    .to(pose, { dist: 118, rot: 0.35, tilt: 0.12, y: 0, duration: 1 }, 0)
    .to(pose, { dist: 78, rot: -0.3, x: 8, tilt: -0.08, duration: 1 }, 1)
    .to(pose, { dist: 56, rot: 0.15, x: -6, y: -2, tilt: 0.05, duration: 1 }, 2)
    .to(head.children, { opacity: 0, y: -24, duration: 0.1, stagger: 0.02, ease: 'power2.in' }, 2.55)
    .to(pose, { dist: 46, rot: 0.42, x: 5, y: 1, tilt: 0.22, duration: 1 }, 3)
    .to(specs.children, { opacity: 1, y: 0, duration: 0.18, stagger: 0.04, ease: 'power3.out' }, 3.35)

  counters.forEach(el => {
    const target = Number(el.dataset.count || 0)
    const format = FORMATTERS[el.dataset.format] || FORMATTERS.plain
    const proxy = { v: 0 }
    el.textContent = format(0, el)
    gsap.to(proxy, {
      v: target,
      ease: 'none',
      onUpdate: () => {
        el.textContent = format(proxy.v, el)
      },
      scrollTrigger: {
        trigger: specs,
        start: 'top 95%',
        end: 'top 40%',
        scrub: 0.5
      }
    })
  })
}

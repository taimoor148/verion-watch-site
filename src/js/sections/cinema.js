import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function initCinema({ caps, experience }) {
  const cinema = document.querySelector('.cinema')
  const reveal = document.querySelector('.reveal')
  const summary = document.querySelector('.summary')
  if (!cinema || !reveal || !summary) return

  const whisper = cinema.querySelector('[data-cinema-whisper]')
  const label = reveal.querySelector('.reveal__label')
  const lines = gsap.utils.toArray('.reveal__title .line__inner', reveal)

  ScrollTrigger.create({
    trigger: cinema,
    start: 'top 78%',
    end: 'bottom 100%',
    onToggle: self => experience.setAct(self.isActive ? 'watch' : null)
  })

  ScrollTrigger.create({
    trigger: reveal,
    start: 'top 100%',
    end: 'bottom 25%',
    onToggle: self => experience.setAct(self.isActive ? 'watch' : null)
  })

  ScrollTrigger.create({
    trigger: summary,
    start: 'top 20%',
    onEnter: () => experience.setAct(null),
    onLeaveBack: () => experience.setAct('watch')
  })

  if (caps.reduced) return

  const ctrl = experience.takeControl('watch', 'journey')
  const base = { rot: 2.7, x: 0, y: 0, dist: 196, tilt: 0.24, scale: 1 }
  experience.onFrame(() => {
    ctrl.pose.rot = base.rot
    ctrl.pose.x = base.x
    ctrl.pose.y = base.y
    ctrl.pose.dist = base.dist
    ctrl.pose.tilt = base.tilt
    ctrl.pose.scale = base.scale
  })

  gsap.set(lines, { yPercent: 118 })
  gsap.set(label, { opacity: 0 })

  const mm = gsap.matchMedia()

  mm.add('(min-width: 900px)', () => {
    const drift = gsap.to(base, {
      rot: '+=0.22',
      duration: 11,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    })
    return () => drift.kill()
  })

  const approach = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: cinema,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.7
    }
  })

  approach
    .fromTo(whisper, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: 'power2.out' }, 0.04)
    .to(base, { dist: 150, rot: 2.15, tilt: 0.16, duration: 1 }, 0)
    .to(whisper, { opacity: 0, duration: 0.35, ease: 'power2.in' }, 1.15)
    .to(base, { dist: 118, rot: 1.5, tilt: 0.08, duration: 1 }, 1)

  const unveil = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: reveal,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.7,
      invalidateOnRefresh: true
    }
  })

  unveil
    .to(base, { dist: 84, rot: 0.55, tilt: 0.03, scale: 1.06, duration: 1 }, 0)
    .to(base, { dist: 74, rot: -0.14, tilt: 0, scale: 1.12, duration: 1 }, 1)

  ScrollTrigger.create({
    trigger: reveal,
    start: 'top 34%',
    once: true,
    onEnter: () => {
      gsap.to(label, { opacity: 1, duration: 1, ease: 'power2.out' })
      gsap.to(lines, { yPercent: 0, duration: 1.6, stagger: 0.16, ease: 'power4.out', delay: 0.25 })
    }
  })
}

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function initScrollScenes({ experience, caps }) {
  if (caps.reduced) return

  const state = experience.scrollState

  ScrollTrigger.create({
    trigger: '[data-hero]',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate(self) {
      const p = self.progress
      state.scrollRot = p * Math.PI * 0.55
      state.scrollY = p * 7
      state.scrollScale = 1 + p * 0.09
      state.scrollTilt = p * 0.06
    }
  })

  gsap.to('.hero__content', {
    yPercent: -16,
    ease: 'none',
    scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true }
  })

  gsap.to('.hero__scrollcue', {
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: '[data-hero]', start: '2% top', end: '16% top', scrub: true }
  })
}

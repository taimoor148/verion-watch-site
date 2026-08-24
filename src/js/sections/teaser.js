import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function initTeaser(caps) {
  const section = document.querySelector('.teaser')
  if (!section) return

  const line = section.querySelector('.teaser__line')
  const index = section.querySelector('.teaser__index')
  const title = section.querySelector('.teaser__title')

  if (caps.reduced) return

  if (index) gsap.set(index, { opacity: 0 })
  gsap.set(title, { opacity: 0, y: 40, letterSpacing: '0.24em' })

  gsap.fromTo(
    line,
    { scaleY: 0 },
    {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top 85%', end: 'top 30%', scrub: 0.5 }
    }
  )

  gsap.timeline({
    scrollTrigger: { trigger: section, start: 'top 45%' },
    defaults: { ease: 'power3.out' }
  })
    .to(index, { opacity: 1, duration: 0.8 }, 0)
    .to(title, { opacity: 1, y: 0, letterSpacing: '0.1em', duration: 1.5 }, 0.15)
}

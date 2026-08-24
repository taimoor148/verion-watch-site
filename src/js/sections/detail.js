import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { enhanceAllImages } from '../core/media-placeholder.js'

export function initDetail(caps) {
  const section = document.querySelector('.detail')
  if (!section) return

  enhanceAllImages(section)

  const head = section.querySelector('.detail__head')
  if (head) {
    gsap.fromTo(
      head.children,
      { opacity: 0, y: 44 },
      {
        opacity: 1,
        y: 0,
        duration: 1.1,
        stagger: 0.14,
        ease: 'power3.out',
        scrollTrigger: { trigger: head, start: 'top 78%' }
      }
    )
  }

  if (caps.reduced) return

  gsap.utils.toArray('.detail__panel').forEach(panel => {
    const media = panel.querySelector('.media-frame')
    const label = panel.querySelector('.detail__label')
    if (media) {
      gsap.fromTo(
        media.firstElementChild || media,
        { scale: 1.14, yPercent: -4 },
        {
          scale: 1,
          yPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: true }
        }
      )
      gsap.fromTo(
        media,
        { clipPath: 'inset(6% 4% 6% 4% round 2px)' },
        {
          clipPath: 'inset(0% 0% 0% 0% round 2px)',
          ease: 'none',
          scrollTrigger: { trigger: panel, start: 'top bottom', end: 'top 15%', scrub: true }
        }
      )
    }
    if (label) {
      gsap.fromTo(
        label.children,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: panel, start: 'top 55%' }
        }
      )
    }
  })
}

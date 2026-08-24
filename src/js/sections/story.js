import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { splitWords } from './manifesto.js'

export function initStory(caps) {
  const section = document.querySelector('.story')
  if (!section) return

  const title = section.querySelector('[data-story-title]')
  const verses = section.querySelectorAll('[data-verse]')
  const philosophy = section.querySelector('[data-story-philosophy]')

  const titleWords = title ? splitWords(title) : []
  const verseGroups = []
  verses.forEach(v => verseGroups.push(splitWords(v)))

  if (caps.reduced) return

  gsap.set(titleWords, { yPercent: 118 })
  gsap.set(verseGroups.flat(), { yPercent: 118 })
  gsap.set(philosophy, { opacity: 0, y: 24 })

  if (titleWords.length) {
    gsap.to(titleWords, {
      yPercent: 0,
      ease: 'none',
      stagger: 0.05,
      scrollTrigger: {
        trigger: title,
        start: 'top 88%',
        end: 'top 34%',
        scrub: 0.6
      }
    })
  }

  verseGroups.forEach(inners => {
    gsap.to(inners, {
      yPercent: 0,
      ease: 'none',
      stagger: 0.045,
      scrollTrigger: {
        trigger: inners[0].closest('.story__verse-line'),
        start: 'top 86%',
        end: 'top 48%',
        scrub: 0.6
      }
    })
  })

  gsap.to(philosophy, {
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: 'power3.out',
    scrollTrigger: { trigger: philosophy, start: 'top 82%' },
    immediateRender: false
  })
}

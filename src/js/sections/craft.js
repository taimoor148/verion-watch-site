import gsap from 'gsap'
import { enhanceAllImages } from '../core/media-placeholder.js'

function revealFigures() {
  gsap.utils.toArray('.craft__fig').forEach((fig, i) => {
    const frameEl = fig.querySelector('.media-frame')
    const caption = fig.querySelector('figcaption')
    if (frameEl) {
      gsap.fromTo(
        frameEl,
        { clipPath: 'inset(0 0 100% 0)' },
        {
          clipPath: 'inset(0 0 0% 0)',
          duration: 1.4,
          delay: (i % 2) * 0.08,
          ease: 'power4.out',
          scrollTrigger: { trigger: fig, start: 'top 82%' }
        }
      )
      const inner = frameEl.firstElementChild
      if (inner && !caps_reduced) {
        gsap.fromTo(
          inner,
          { yPercent: -7, scale: 1.12 },
          {
            yPercent: 7,
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true }
          }
        )
      }
    }
    if (caption) {
      gsap.fromTo(
        caption,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: fig, start: 'top 70%' }
        }
      )
    }
  })
}

let caps_reduced = false

export function initCraft(caps) {
  const section = document.querySelector('.craft')
  if (!section) return

  caps_reduced = caps.reduced
  enhanceAllImages(section)

  if (caps.reduced) return

  const head = section.querySelector('.craft__head')
  if (head) {
    gsap.fromTo(
      [head.querySelector('.section-label'), head.querySelector('.craft__title'), head.querySelector('.craft__copy')],
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

  revealFigures()

  const mm = gsap.matchMedia()

  mm.add('(min-width: 900px)', () => {
    const track = document.querySelector('.process__track')
    const progressFill = document.querySelector('.process__progress i')
    if (!track) return

    const drift = gsap.to(track, {
      x: () => -(Math.max(track.scrollWidth - window.innerWidth + parseFloat(getComputedStyle(track).paddingRight || '0'), 0)),
      ease: 'none',
      scrollTrigger: {
        trigger: '.process',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        invalidateOnRefresh: true
      }
    })

    if (progressFill) {
      gsap.to(progressFill, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.process',
          start: 'top top',
          end: 'bottom bottom',
          scrub: true
        }
      })
    }

    gsap.utils.toArray('.process__step').forEach(step => {
      gsap.fromTo(
        step.children,
        { opacity: 0, y: 46 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.09,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: step,
            containerAnimation: drift,
            start: 'left 82%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    })
  })

  mm.add('(max-width: 899px)', () => {
    gsap.utils.toArray('.process__step').forEach(step => {
      gsap.fromTo(
        step.children,
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: step, start: 'top 84%' }
        }
      )
    })
  })
}

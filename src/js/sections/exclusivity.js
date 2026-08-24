import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function initExclusivity(caps) {
  const section = document.querySelector('.exclusivity')
  if (!section) return

  const kicker = section.querySelector('.exclusivity__kicker')
  const numberEl = section.querySelector('[data-exclusive-number]')
  const statement = section.querySelector('.exclusivity__statement')
  const copy = section.querySelector('.exclusivity__copy')
  const plate = section.querySelector('.exclusivity__plate')
  const cta = section.querySelector('.exclusivity .cta')

  if (caps.reduced) {
    numberEl.textContent = '250'
    gsap.set([kicker, statement, copy, plate, cta], { opacity: 1 })
    return
  }

  const proxy = { v: 0 }
  const render = () => {
    numberEl.textContent = String(Math.round(proxy.v))
  }
  render()

  gsap.to(proxy, {
    v: 250,
    ease: 'none',
    onUpdate: render,
    scrollTrigger: {
      trigger: section,
      start: 'top 80%',
      end: 'center center',
      scrub: 0.6
    }
  })

  gsap.fromTo(
    [kicker, statement],
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 1.1,
      stagger: 0.16,
      ease: 'power3.out',
      scrollTrigger: { trigger: section, start: 'top 62%' },
      immediateRender: false
    }
  )

  gsap.fromTo(
    copy,
    { opacity: 0, y: 24 },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: statement, start: 'top 70%' },
      immediateRender: false
    }
  )

  gsap.fromTo(
    plate,
    { opacity: 0, y: 44, rotate: -4 },
    {
      opacity: 1,
      y: 0,
      rotate: -1.6,
      duration: 1.2,
      ease: 'power4.out',
      scrollTrigger: { trigger: plate, start: 'top 88%' },
      immediateRender: false
    }
  )

  gsap.fromTo(
    cta,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: cta, start: 'top 92%' },
      immediateRender: false
    }
  )
}

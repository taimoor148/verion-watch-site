import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function initSummary(caps) {
  const section = document.querySelector('.summary')
  if (!section) return

  const head = section.querySelector('.summary__head')
  const rows = gsap.utils.toArray('.summary__row', section)
  const reserveEl = section.querySelector('[data-count-reserve]')
  const atmEl = section.querySelector('[data-count-atm]')

  if (caps.reduced) {
    if (reserveEl) reserveEl.textContent = '72'
    if (atmEl) atmEl.textContent = '10'
    return
  }

  if (head) {
    gsap.fromTo(
      head.children,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1.1,
        stagger: 0.14,
        ease: 'power3.out',
        scrollTrigger: { trigger: head, start: 'top 80%' }
      }
    )
  }

  rows.forEach(row => {
    gsap.fromTo(
      row,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.95,
        ease: 'power3.out',
        scrollTrigger: { trigger: row, start: 'top 86%' },
        immediateRender: false
      }
    )
  })

  if (reserveEl) {
    countTo(reserveEl, 72, section)
  }
  if (atmEl) {
    countTo(atmEl, 10, section)
  }

  function countTo(el, target, scope) {
    const proxy = { v: 0 }
    el.textContent = '0'
    gsap.to(proxy, {
      v: target,
      ease: 'none',
      onUpdate: () => {
        el.textContent = String(Math.round(proxy.v))
      },
      scrollTrigger: {
        trigger: scope,
        start: 'top 70%',
        end: 'top 20%',
        scrub: 0.5
      }
    })
  }
}

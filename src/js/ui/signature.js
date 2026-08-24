import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const NAV_SECTIONS = [
  ['#story', 'JOURNAL'],
  ['#craft', 'CRAFT'],
  ['#movement', 'MOVEMENT'],
  ['#collection', 'COLLECTION'],
  ['#access', 'PRIVATE ACCESS']
]

export function initSignature(caps) {
  const bar = document.querySelector('[data-progress-bar]')
  const fincta = document.querySelector('.fincta')
  const footerMark = document.querySelector('[data-footer-mark]')

  if (bar) {
    if (caps.reduced) {
      window.addEventListener(
        'scroll',
        () => {
          const max = document.documentElement.scrollHeight - innerHeight
          bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`
        },
        { passive: true }
      )
    } else {
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: self => gsap.set(bar, { scaleX: self.progress })
      })
      gsap.set(bar, { scaleX: 0 })
    }
  }

  const navLinks = new Map()
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href')
    if (href && href.startsWith('#')) navLinks.set(href.slice(1), link)
  })

  const watchers = []
  NAV_SECTIONS.forEach(([sel, key]) => {
    const section = document.querySelector(sel)
    const link = navLinks.get(key) || navLinks.get(sel.slice(1))
    if (!section || !link || caps.reduced) return
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onToggle: self => link.classList.toggle('is-current', self.isActive)
    })
    watchers.push(st)
  })

  if (fincta && !caps.reduced) {
    const lineInner = fincta.querySelector('.fincta__line .line__inner')
    const brand = fincta.querySelector('.fincta__brand')
    const tag = fincta.querySelector('.fincta__tag')
    const explore = fincta.querySelector('.fincta__explore')

    if (lineInner) {
      gsap.set(lineInner, { yPercent: 118 })
      gsap.to(lineInner, {
        yPercent: 0,
        duration: 1.5,
        ease: 'power4.out',
        scrollTrigger: { trigger: fincta, start: 'top 62%' },
        immediateRender: false
      })
    }

    gsap.set([brand, tag, explore], { opacity: 0, y: 26 })
    gsap.to([brand, tag, explore], {
      opacity: 1,
      y: 0,
      duration: 1.1,
      stagger: 0.14,
      ease: 'power3.out',
      scrollTrigger: { trigger: fincta, start: 'top 40%' },
      immediateRender: false
    })
  }

  if (footerMark && !caps.reduced) {
    gsap.set(footerMark, { clipPath: 'inset(0% 0% 100% 0%)' })
    gsap.to(footerMark, {
      clipPath: 'inset(-8% -2% -8% -2%)',
      duration: 1.7,
      ease: 'power4.inOut',
      scrollTrigger: { trigger: '.footer', start: 'top 70%' }
    })
  }

  return () => watchers.forEach(st => st.kill())
}

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function splitWords(el) {
  const nodes = [...el.childNodes]
  el.setAttribute('aria-label', el.textContent)
  el.textContent = ''
  const frag = document.createDocumentFragment()
  const inners = []

  const pushWord = makeContent => {
    const w = document.createElement('span')
    w.className = 'w'
    w.setAttribute('aria-hidden', 'true')
    const wi = document.createElement('span')
    wi.className = 'wi'
    wi.appendChild(makeContent())
    w.appendChild(wi)
    frag.appendChild(w)
    frag.appendChild(document.createTextNode(' '))
    inners.push(wi)
  }

  nodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent.split(' ').forEach(token => {
        if (token.trim()) pushWord(() => document.createTextNode(token))
      })
    } else {
      pushWord(() => node.cloneNode(true))
    }
  })

  el.appendChild(frag)
  return inners
}

export function initManifesto(caps) {
  const section = document.querySelector('.manifesto')
  if (!section) return

  const blocks = section.querySelectorAll('[data-manifesto-main], [data-manifesto-counter]')
  const groups = []
  blocks.forEach(el => groups.push(splitWords(el)))

  if (caps.reduced) {
    gsap.set('.manifesto .wi', { yPercent: 0 })
    return
  }

  gsap.fromTo(
    section.querySelector('.section-label'),
    { opacity: 0, x: -18 },
    {
      opacity: 1,
      x: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: section, start: 'top 78%' }
    }
  )

  section.querySelectorAll('em, i').forEach(em => {
    em.parentElement && (em.style.color = 'var(--c-champagne)')
  })

  groups.forEach(inners => {
    gsap.set(inners, { yPercent: 118 })
    gsap.to(inners, {
      yPercent: 0,
      ease: 'none',
      stagger: 0.06,
      scrollTrigger: {
        trigger: inners[0].closest('.manifesto__statement, .manifesto__counter'),
        start: 'top 82%',
        end: 'bottom 45%',
        scrub: 0.6
      }
    })
  })
}

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { enhanceAllImages, enhanceImage } from '../core/media-placeholder.js'

export const PRODUCTS = {
  obsidian: {
    ref: 'REF. V1-OBS-250',
    name: 'Véron Obsidian',
    tagline: 'The first of two hundred fifty',
    price: '$8,900',
    desc: 'Black grand feu enamel over a titanium case, hand-brushed lugs and the Calibre V-1 visible through sapphire on both faces.',
    media: 'watch-obsidian',
    specs: [
      ['CASE', 'Titanium, 39mm'],
      ['DIAL', 'Grand feu enamel, black'],
      ['MOVEMENT', 'Calibre V-1, automatic'],
      ['RESERVE', '72 hours'],
      ['WATER', '5 ATM'],
      ['EDITION', '250 pieces']
    ]
  },
  titanium: {
    ref: 'REF. V1-TIT-250',
    name: 'Véron Titanium',
    tagline: 'Light made permanent',
    price: '$9,800',
    desc: 'Fully brushed grade-5 titanium with a silvered opaline dial. The quiet one — read at a glance, remembered for years.',
    media: 'watch-titanium',
    specs: [
      ['CASE', 'Titanium, 39mm'],
      ['DIAL', 'Silvered opaline'],
      ['MOVEMENT', 'Calibre V-1, automatic'],
      ['RESERVE', '72 hours'],
      ['WATER', '5 ATM'],
      ['EDITION', '250 pieces']
    ]
  },
  champagne: {
    ref: 'REF. V1-CHM-250',
    name: 'Véron Champagne',
    tagline: 'For evenings that outlast you',
    price: '$11,500',
    desc: 'Champagne gilt dial under a double-domed crystal, heat-blued hands and an alligator strap stitched in our atelier.',
    media: 'watch-champagne',
    specs: [
      ['CASE', 'Titanium, 39mm, gilt accents'],
      ['DIAL', 'Champagne gilt'],
      ['MOVEMENT', 'Calibre V-1, automatic'],
      ['RESERVE', '72 hours'],
      ['WATER', '5 ATM'],
      ['EDITION', '250 pieces']
    ]
  }
}

function populateModal(product) {
  const modal = document.getElementById('product-modal')
  if (!modal) return
  const media = modal.querySelector('.modal__media')
  modal.querySelector('[data-modal-ref]').textContent = product.ref
  modal.querySelector('#modal-title').textContent = product.name
  modal.querySelector('[data-modal-tagline]').textContent = product.tagline
  modal.querySelector('[data-modal-price]').textContent = product.price
  modal.querySelector('[data-modal-desc]').textContent = product.desc
  const specs = modal.querySelector('[data-modal-specs]')
  specs.innerHTML = product.specs
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
    .join('')
  media.innerHTML = ''
  const img = document.createElement('img')
  img.alt = ''
  img.setAttribute('aria-hidden', 'true')
  img.dataset.media = product.media
  media.appendChild(img)
  enhanceImage(img)
}

let openState = null

function openModal(key, ctx) {
  const modal = document.getElementById('product-modal')
  if (!modal || openState) return
  const product = PRODUCTS[key]
  if (!product) return

  populateModal(product)
  modal.style.visibility = 'visible'
  document.documentElement.classList.add('modal-open')

  if (ctx.lenis) ctx.lenis.stop()
  else document.body.style.overflow = 'hidden'

  gsap.fromTo(
    modal.querySelector('.modal__backdrop'),
    { opacity: 0 },
    { opacity: 1, duration: 0.45, ease: 'power2.out' }
  )
  gsap.fromTo(
    modal.querySelector('.modal__panel'),
    { clipPath: 'inset(10% 6% 10% 6% round 3px)', y: 26 },
    { clipPath: 'inset(0% 0% 0% 0% round 3px)', y: 0, duration: 0.7, ease: 'power4.out' }
  )
  gsap.fromTo(
    modal.querySelectorAll('.modal__body > *'),
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, delay: 0.18, ease: 'power3.out' }
  )

  const closeBtn = modal.querySelector('.modal__close')
  const backdrop = modal.querySelector('.modal__backdrop')
  const returnFocus = document.activeElement
  closeBtn.focus({ preventScroll: true })

  function onKey(event) {
    if (event.key === 'Escape') closeModal()
    if (event.key === 'Tab') trapFocus(event)
  }

  function trapFocus(event) {
    const focusables = modal.querySelectorAll(
      'button, [href], input, [tabindex]:not([tabindex="-1"])'
    )
    if (!focusables.length) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  function closeModal() {
    if (openState !== api) return
    document.removeEventListener('keydown', onKey)
    closeBtn.removeEventListener('click', closeModal)
    backdrop.removeEventListener('click', closeModal)
    openState = null
    document.documentElement.classList.remove('modal-open')
    gsap.to(modal.querySelector('.modal__backdrop'), {
      opacity: 0,
      duration: 0.35,
      ease: 'power2.in'
    })
    gsap.to(modal.querySelector('.modal__panel'), {
      y: 18,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        modal.style.visibility = 'hidden'
        gsap.set(modal.querySelector('.modal__panel'), { clearProps: 'all' })
        if (ctx.lenis) ctx.lenis.start()
        else document.body.style.overflow = ''
        if (returnFocus && returnFocus.focus) returnFocus.focus({ preventScroll: true })
      }
    })
  }

  const api = {}
  openState = api
  document.addEventListener('keydown', onKey)
  closeBtn.addEventListener('click', closeModal)
  backdrop.addEventListener('click', closeModal)
}

export function initCollection(caps, ctx = {}) {
  const section = document.querySelector('.collection')
  if (!section) return

  enhanceAllImages(section)

  const head = section.querySelector('.collection__head')
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
        scrollTrigger: { trigger: head, start: 'top 78%' },
        immediateRender: false
      }
    )
  }

  if (caps.reduced) {
    section.querySelectorAll('[data-explore-product]').forEach(btn => {
      btn.addEventListener('click', () => openModal(btn.dataset.exploreProduct, ctx))
    })
    return
  }

  gsap.utils.toArray('.product', section).forEach(product => {
    const frameEl = product.querySelector('.product__media')
    if (frameEl) {
      gsap.fromTo(
        frameEl,
        { clipPath: 'inset(0 0 100% 0)' },
        {
          clipPath: 'inset(0 0 0% 0)',
          duration: 1.3,
          ease: 'power4.out',
          scrollTrigger: { trigger: product, start: 'top 80%' }
        }
      )
    }
    const info = product.querySelector('.product__info')
    if (info) {
      gsap.fromTo(
        info.children,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.07,
          ease: 'power3.out',
          scrollTrigger: { trigger: product, start: 'top 68%' }
        }
      )
    }
  })

  section.querySelectorAll('[data-explore-product]').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.exploreProduct, ctx))
  })
}

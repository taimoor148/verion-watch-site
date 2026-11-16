import '../styles/base.css'
import '../styles/loader.css'
import '../styles/chrome.css'
import '../styles/hero.css'
import '../styles/sections.css'
import '../styles/tempo.css'
import { initTempo } from './sections/tempo.js'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { detectCapabilities, subscribeReducedMotion } from './core/capabilities.js'
import { createStageExperience } from './three/watch-experience.js'
import { initLoader } from './ui/loader.js'
import { initChrome } from './ui/navigation.js'
import { initCursor, initMagnetic } from './ui/cursor.js'
import { initEntrance } from './hero/entrance.js'
import { initScrollScenes } from './hero/scroll-scenes.js'
import { initManifesto } from './sections/manifesto.js'
import { initShowcase } from './sections/showcase.js'
import { initCraft } from './sections/craft.js'
import { initMovement } from './sections/movement.js'
import { initDetail } from './sections/detail.js'
import { initCollection } from './sections/collection.js'
import { initExclusivity } from './sections/exclusivity.js'
import { initTeaser } from './sections/teaser.js'
import { initStory } from './sections/story.js'
import { initCinema } from './sections/cinema.js'
import { initSummary } from './sections/summary.js'
import { initReservations } from './sections/reservations.js'
import { initSignature } from './ui/signature.js'

gsap.registerPlugin(ScrollTrigger)

async function boot() {
  const caps = detectCapabilities()
  if (caps.reduced) document.documentElement.classList.add('reduced-motion')

  subscribeReducedMotion(reduced => {
    if (reduced !== caps.reduced) window.location.reload()
  })

  let lenis = null
  if (!caps.reduced) {
    lenis = new Lenis({ duration: 0.8, smoothWheel: !caps.coarse })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(time => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)
  }

  initCursor(caps)
  initMagnetic()

  const chrome = initChrome({ caps })
  chrome.setLenis(lenis)

  const fontsReady = Promise.race([
    (document.fonts && document.fonts.ready) || Promise.resolve(),
    new Promise(resolve => setTimeout(resolve, 2600))
  ])
  await fontsReady

  const heroEl = document.querySelector('.hero')
  const stageMount = document.querySelector('[data-stage]')
  if (caps.reduced && stageMount && heroEl && stageMount.parentElement !== heroEl) {
    heroEl.appendChild(stageMount)
    stageMount.style.position = 'absolute'
  }

  const experience = createStageExperience(stageMount, {
    caps,
    heroEl,
    onReady: () => ScrollTrigger.refresh()
  })

  if (!caps.reduced && window.location.search.includes('debug')) {
    ;['setAct', 'setFade', 'setFadeRaw'].forEach(method => {
      const original = experience[method].bind(experience)
      experience[method] = (...args) => {
        ;(window.__VDBG = window.__VDBG || []).push([
          method,
          ...args,
          Math.round(window.scrollY),
          method === 'setAct' ? new Error().stack.split('\n')[2] : ''
        ])
        return original(...args)
      }
    })
  }

  const exploreButton = document.querySelector('[data-explore-watch]')
  if (exploreButton) {
    exploreButton.addEventListener('click', () => {
      const target = document.querySelector('#watch')
      if (!target) return
      if (lenis) lenis.scrollTo(target, { duration: 1.7 })
      else target.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => experience.pulse(), 1800)
    })
  }

  const entrance = initEntrance({ caps, experience, canvasWrap: stageMount })

  initLoader({
    caps,
    ready: experience.ready,
    minTime: caps.reduced ? 0 : 650,
    onComplete: () => {
      entrance.play()
      if (!caps.reduced) {
        requestAnimationFrame(() => ScrollTrigger.refresh())
      }
    }
  })

  initScrollScenes({ experience, caps })

  const ctx = { caps, lenis, experience }

  initTempo(caps)
  initManifesto(caps)
  initShowcase(ctx)
  initCraft(caps)
  initMovement(ctx)
  initDetail(caps)
  initCollection(caps, { lenis })
  initExclusivity(caps)
  initTeaser(caps)
  initStory(caps)
  initCinema(ctx)
  initSummary(caps)
  initReservations(caps, { lenis })
  initSignature(caps)

  if (!caps.reduced) {
    ScrollTrigger.create({
      trigger: '[data-hero]',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: self => experience.setFadeRaw(1 - self.progress * 1.25)
    })
  }

  window.addEventListener('pagehide', () => {
    experience.destroy()
    if (lenis) lenis.destroy()
  })
}

boot()

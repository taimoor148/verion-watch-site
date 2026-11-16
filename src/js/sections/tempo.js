import gsap from 'gsap'
import { POSTER_SVG } from '../three/poster.js'
import { createAtelier } from '../three/atelier.js'

export function initTempo(caps) {
  const section = document.querySelector('.tempo')
  if (!section) return
  const visual = section.querySelector('.tempo__visual')
  section.querySelector('.tempo__dial').innerHTML = POSTER_SVG
  if (caps.reduced) return
  const panels = [...section.querySelectorAll('.tempo__chapter')]
  const markers = [...section.querySelectorAll('.tempo__marker')]
  const scene = createAtelier(visual, caps)
  if (!scene) return // All chapters remain readable without WebGL.
  section.classList.add('tempo--animated')
  gsap.set(panels.slice(1), { autoAlpha: 0, y: 35 })
  const state = { progress: 0 }
  const timeline = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: section, start: 'top top', end: 'bottom bottom', scrub: .3,
      invalidateOnRefresh: true
    }
  })
  timeline.to(state, { progress: 1, duration: 3, onUpdate() {
    scene.update(state.progress)
    const index = state.progress < .36 ? 0 : state.progress < .7 ? 1 : 2
    markers.forEach((marker, i) => marker.classList.toggle('is-active', i === index))
  } }, 0)
    .to('.tempo__progress', { scaleX: 1, duration: 3 }, 0)
    .to(panels[0], { autoAlpha: 0, y: -30, duration: .2 }, .85)
    .to(panels[1], { autoAlpha: 1, y: 0, duration: .25 }, 1.05)
    .to(panels[1], { autoAlpha: 0, y: -30, duration: .2 }, 1.85)
    .to(panels[2], { autoAlpha: 1, y: 0, duration: .25 }, 2.1)
  window.addEventListener('pagehide', () => scene.destroy(), { once: true })
}

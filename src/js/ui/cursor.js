import gsap from 'gsap'

export function initCursor(caps) {
  if (!caps.finePointer || caps.coarse) return

  const root = document.querySelector('.cursor')
  const dot = root.querySelector('.cursor__dot')
  const ring = root.querySelector('.cursor__ring')
  const label = root.querySelector('.cursor__label')

  const dotX = gsap.quickTo(dot, 'x', { duration: 0.14, ease: 'power3.out' })
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.14, ease: 'power3.out' })
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3.out' })
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3.out' })

  let activated = false
  window.addEventListener(
    'mousemove',
    event => {
      if (!activated) {
        activated = true
        root.classList.add('is-active')
      }
      dotX(event.clientX)
      dotY(event.clientY)
      ringX(event.clientX)
      ringY(event.clientY)
    },
    { passive: true }
  )

  document.addEventListener('mouseleave', () => {
    activated = false
    root.classList.remove('is-active')
  })

  document.addEventListener('mouseover', event => {
    const target = event.target.closest && event.target.closest('a, button, [data-cursor]')
    root.classList.toggle('is-link', Boolean(target))
    const labelText = target ? target.getAttribute('data-cursor-label') : null
    root.classList.toggle('is-label', Boolean(labelText))
    if (labelText) label.textContent = labelText
  })
}

export function initMagnetic() {
  if (!window.matchMedia('(pointer: fine)').matches) return

  document.querySelectorAll('[data-magnetic]').forEach(element => {
    const strength = 9
    element.addEventListener('mousemove', event => {
      const rect = element.getBoundingClientRect()
      const relX = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2)
      const relY = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2)
      gsap.to(element, {
        x: relX * strength,
        y: relY * strength * 0.7,
        duration: 0.55,
        ease: 'power3.out'
      })
    })
    element.addEventListener('mouseleave', () => {
      gsap.to(element, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' })
    })
  })
}

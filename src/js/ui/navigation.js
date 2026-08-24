import gsap from 'gsap'

export function initChrome({ caps }) {
  const nav = document.querySelector('[data-nav]')
  const menu = document.getElementById('menu')
  const openBtn = document.querySelector('[data-menu-open]')
  const closeBtn = document.querySelector('[data-menu-close]')
  const items = Array.from(menu.querySelectorAll('.menu__item'))
  let lenis = null
  let menuOpen = false

  const setLenis = instance => {
    lenis = instance
  }

  const onScrollFlag = () => nav.classList.toggle('is-scrolled', window.scrollY > 30)
  window.addEventListener('scroll', onScrollFlag, { passive: true })
  onScrollFlag()

  const menuTl = gsap.timeline({
    paused: true,
    onReverseComplete() {
      menu.style.visibility = 'hidden'
      menu.setAttribute('aria-hidden', 'true')
    }
  })
  menuTl
    .set(menu, { visibility: 'visible' }, 0)
    .fromTo(menu, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'power2.out' }, 0)
    .fromTo(
      items,
      { y: 48, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out', stagger: 0.07 },
      0.12
    )
    .fromTo(
      menu.querySelectorAll('.menu__head, .menu__foot'),
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: 'power2.out' },
      0.28
    )

  const openMenu = () => {
    if (menuOpen) return
    menuOpen = true
    menu.setAttribute('aria-hidden', 'false')
    menuTl.timeScale(1).play()
    openBtn.setAttribute('aria-expanded', 'true')
    document.body.classList.add('is-locked')
    lenis && lenis.stop()
    setTimeout(() => closeBtn.focus(), 350)
  }

  const closeMenu = () => {
    if (!menuOpen) return
    menuOpen = false
    menu.setAttribute('aria-hidden', 'true')
    menuTl.timeScale(1.5).reverse()
    openBtn.setAttribute('aria-expanded', 'false')
    document.body.classList.remove('is-locked')
    lenis && lenis.start()
    openBtn.focus()
  }

  openBtn.addEventListener('click', openMenu)
  closeBtn.addEventListener('click', closeMenu)

  document.addEventListener('keydown', event => {
    if (!menuOpen) return
    if (event.key === 'Escape') {
      closeMenu()
      return
    }
    if (event.key === 'Tab') {
      const focusables = [closeBtn, ...items.map(item => item.querySelector('a'))]
      const index = focusables.indexOf(document.activeElement)
      const next = event.shiftKey
        ? (index - 1 + focusables.length) % focusables.length
        : (index + 1) % focusables.length
      event.preventDefault()
      focusables[next].focus()
    }
  })

  const anchorLinks = document.querySelectorAll('a[href^="#"]:not([data-soon])')
  anchorLinks.forEach(link => {
    link.addEventListener('click', event => {
      const targetId = link.getAttribute('href').slice(1)
      const target = targetId && document.getElementById(targetId)
      if (!target) return
      event.preventDefault()
      if (menuOpen && !link.hasAttribute('data-menu-close-link')) closeMenu()
      if (menuOpen && link.hasAttribute('data-menu-close-link')) {
        closeMenu()
        setTimeout(() => scrollTo(target), 420)
        return
      }
      scrollTo(target)
    })
  })

  function scrollTo(target) {
    if (lenis) lenis.scrollTo(target, { duration: 1.6 })
    else target.scrollIntoView({ behavior: caps.reduced ? 'auto' : 'smooth' })
  }

  const soonLinks = document.querySelectorAll('[data-soon]')
  soonLinks.forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault()
      link.classList.add('is-denied')
      gsap.fromTo(link, { x: 0 }, { x: -4, duration: 0.07, repeat: 3, yoyo: true, clearProps: 'x' })
      setTimeout(() => link.classList.remove('is-denied'), 600)
    })
  })

  return { setLenis, closeMenu }
}

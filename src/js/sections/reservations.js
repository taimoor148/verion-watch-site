import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function initReservations(caps, ctx = {}) {
  const section = document.querySelector('.access')
  const modal = document.getElementById('access-modal')

  const openers = document.querySelectorAll('[data-open-access]')
  openers.forEach(btn => btn.addEventListener('click', () => modal && openModal()))

  if (!modal) return

  const form = modal.querySelector('.access-form')
  const successView = modal.querySelector('[data-success-view]')
  const panel = modal.querySelector('.modal__panel')
  let open = false
  let returnFocus = null

  function fieldWrap(name) {
    return form.querySelector(`[name="${name}"]`)?.closest('.field') || null
  }

  function setError(name, on) {
    const wrap = fieldWrap(name)
    if (wrap) wrap.classList.toggle('is-error', on)
    const input = form.querySelector(`[name="${name}"]`)
    if (input) input.setAttribute('aria-invalid', String(on))
  }

  function validate() {
    let firstBad = null
    const check = (name, ok) => {
      setError(name, !ok)
      if (!ok && !firstBad) firstBad = name
      return ok
    }
    check('firstName', form.firstName.value.trim().length > 0)
    check('lastName', form.lastName.value.trim().length > 0)
    check('email', EMAIL_RE.test(form.email.value.trim()))
    check('country', form.country.value.trim().length > 0)
    return firstBad
  }

  ;['firstName', 'lastName', 'email', 'country'].forEach(name => {
    const input = form.querySelector(`[name="${name}"]`)
    input.addEventListener('input', () => setError(name, false))
  })

  form.addEventListener('submit', event => {
    event.preventDefault()
    const firstBad = validate()
    if (firstBad) {
      const bad = form.querySelector(`[name="${firstBad}"]`)
      bad.focus({ preventScroll: true })
      gsap.fromTo(panel, { x: -5 }, { x: 0, duration: 0.4, ease: 'power2.out' })
      return
    }
    form.hidden = true
    successView.hidden = false
    gsap.fromTo(
      successView.children,
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: 0.85, stagger: 0.09, ease: 'power3.out' }
    )
    modal.querySelector('.access-success [data-access-close]')?.focus({ preventScroll: true })
  })

  function resetForm() {
    form.reset()
    form.hidden = false
    successView.hidden = true
    ;['firstName', 'lastName', 'email', 'country'].forEach(name => setError(name, false))
  }

  function openModal() {
    if (open) return
    open = true
    resetForm()
    modal.style.visibility = 'visible'
    modal.setAttribute('aria-hidden', 'false')
    document.documentElement.classList.add('modal-open')

    if (ctx.lenis) ctx.lenis.stop()
    else document.body.style.overflow = 'hidden'

    returnFocus = document.activeElement
    document.addEventListener('keydown', onKey)
    gsap.fromTo(
      modal.querySelector('.modal__backdrop'),
      { opacity: 0 },
      { opacity: 1, duration: 0.45, ease: 'power2.out' }
    )
    gsap.fromTo(
      panel,
      { clipPath: 'inset(8% 5% 8% 5% round 3px)', y: 24 },
      { clipPath: 'inset(0% 0% 0% 0% round 3px)', y: 0, duration: 0.7, ease: 'power4.out' }
    )
    setTimeout(() => form.querySelector('input')?.focus({ preventScroll: true }), 480)
  }

  function closeModal() {
    if (!open) return
    open = false
    modal.setAttribute('aria-hidden', 'true')
    document.removeEventListener('keydown', onKey)
    document.documentElement.classList.remove('modal-open')
    gsap.to(modal.querySelector('.modal__backdrop'), {
      opacity: 0,
      duration: 0.35,
      ease: 'power2.in'
    })
    gsap.to(panel, {
      y: 16,
      opacity: 0,
      duration: 0.38,
      ease: 'power2.in',
      onComplete: () => {
        modal.style.visibility = 'hidden'
        gsap.set(panel, { clearProps: 'all' })
        if (ctx.lenis) ctx.lenis.start()
        else document.body.style.overflow = ''
        if (returnFocus && returnFocus.focus) returnFocus.focus({ preventScroll: true })
      }
    })
  }

  function onKey(event) {
    if (!open) return
    if (event.key === 'Escape') {
      closeModal()
      return
    }
    if (event.key === 'Tab') {
      const focusables = [
        ...panel.querySelectorAll(
          'button:not([hidden]), input:not([hidden]), textarea:not([hidden]), a[href]'
        )
      ].filter(el => el.offsetParent !== null || el === document.activeElement)
      if (!focusables.length) return
      const index = focusables.indexOf(document.activeElement)
      const next = event.shiftKey
        ? (index - 1 + focusables.length) % focusables.length
        : (index + 1) % focusables.length
      event.preventDefault()
      focusables[next].focus()
    }
  }

  modal.querySelectorAll('[data-access-close]').forEach(el => {
    el.addEventListener('click', closeModal)
  })

  if (!caps.reduced && section) {
    gsap.fromTo(
      '.access__inner > *',
      { opacity: 0, y: 34 },
      {
        opacity: 1,
        y: 0,
        duration: 1.05,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 68%' },
        immediateRender: false
      }
    )
  } else if (section) {
    gsap.set('.access__inner > *', { opacity: 1 })
  }
}

import gsap from 'gsap'

const STATUS_MESSAGES = ['WINDING THE CALIBRE', 'SETTING THE HANDS', 'ADJUSTING THE BEAT']

export function initLoader({ caps, ready, minTime = 1500, onComplete }) {
  const el = document.getElementById('loader')
  if (!el) {
    onComplete()
    return
  }

  const wordmark = el.querySelector('.loader__wordmark')
  const tagline = el.querySelector('.loader__tagline')
  const bar = el.querySelector('.loader__bar')
  const progress = el.querySelector('.loader__progress')
  const meta = el.querySelector('.loader__meta')
  const status = el.querySelector('[data-loader-status]')
  const eyebrow = el.querySelector('.loader__eyebrow')

  const finish = () => {
    el.style.display = 'none'
    onComplete && onComplete()
  }

  if (caps.reduced) {
    ready.then(finish)
    return
  }

  gsap.from(eyebrow, { opacity: 0, duration: 0.8, ease: 'power2.out', delay: 0.1 })
  gsap.from(wordmark, { opacity: 0, y: 16, duration: 1.1, ease: 'power3.out', delay: 0.18 })
  gsap.from(tagline, { opacity: 0, duration: 0.9, ease: 'power2.out', delay: 0.6 })
  gsap.from(bar, { scaleX: 0, transformOrigin: 'left center', duration: 1.1, ease: 'power3.inOut', delay: 0.55 })

  let messageIndex = 0
  const statusTimer = setInterval(() => {
    messageIndex = (messageIndex + 1) % STATUS_MESSAGES.length
    status.textContent = STATUS_MESSAGES[messageIndex]
  }, 1000)

  const counterValue = { v: 0 }
  const renderProgress = () => gsap.set(progress, { scaleX: counterValue.v / 100 })

  gsap.to(counterValue, { v: 86, duration: 1.8, ease: 'power2.out', onUpdate: renderProgress })

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

  Promise.all([ready, wait(minTime)]).then(() => {
    clearInterval(statusTimer)
    status.textContent = 'READY'
    gsap.to(counterValue, {
      v: 100,
      duration: 0.45,
      ease: 'power2.inOut',
      onUpdate: renderProgress,
      onComplete: () => {
        gsap
          .timeline({ onComplete: finish })
          .to([eyebrow, tagline, meta, bar], { opacity: 0, duration: 0.45, ease: 'power2.in' }, 0.1)
          .to(wordmark, { yPercent: -36, opacity: 0, duration: 0.75, ease: 'power3.in' }, 0.16)
          .to(el, { yPercent: -100, duration: 1.05, ease: 'power4.inOut' }, 0.5)
      }
    })
  })
}

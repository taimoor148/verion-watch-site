import gsap from 'gsap'

export function initEntrance({ caps, experience, canvasWrap }) {
  if (caps.reduced) {
    gsap.set(canvasWrap, { opacity: 1 })
    experience.setIntroProgress(1)
    return { play() {} }
  }

  const navInners = document.querySelectorAll('.nav .mask__inner')
  const eyebrowInner = document.querySelector('.hero__eyebrow .mask__inner')
  const lineInners = gsap.utils.toArray('.hero__title .line__inner')
  const copy = document.querySelector('.hero__copy')
  const ctas = document.querySelector('.hero__ctas')
  const aside = document.querySelector('.hero__aside')
  const cue = document.querySelector('.hero__scrollcue')

  const intro = { p: 0 }
  const pushIntro = () => experience.setIntroProgress(intro.p)

  gsap.set(navInners, { yPercent: -130 })
  gsap.set(eyebrowInner, { yPercent: 130 })
  lineInners.forEach(line => gsap.set(line, { yPercent: 118 }))
  gsap.set([copy, ctas], { opacity: 0, y: 26 })
  gsap.set(aside, { opacity: 0, x: 14 })
  gsap.set(cue, { opacity: 0 })

  const tl = gsap.timeline({
    paused: true,
    defaults: { ease: 'power4.out' },
    onComplete: () => {
      gsap.set([copy, ctas], { clearProps: 'transform' })
    }
  })

  tl.to(navInners, { yPercent: 0, duration: 0.9, stagger: 0.06 }, 0)
    .to(eyebrowInner, { yPercent: 0, duration: 1 }, 0.08)
    .to(
      intro,
      { p: 1, duration: 2.7, ease: 'power3.inOut', onUpdate: pushIntro },
      0.3
    )
    .to(canvasWrap, { opacity: 1, duration: 1.5, ease: 'power2.out' }, 0.38)
    .to(lineInners, { yPercent: 0, duration: 1.55, stagger: 0.14 }, 0.24)
    .to(copy, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 0.66)
    .to(ctas, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 0.8)
    .to(aside, { opacity: 1, x: 0, duration: 1, ease: 'power3.out' }, 1.05)
    .to(cue, { opacity: 1, duration: 1.3, ease: 'power2.out' }, 1.35)

  return {
    play() {
      tl.play()
    }
  }
}

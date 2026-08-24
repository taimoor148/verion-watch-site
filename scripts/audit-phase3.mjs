import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const URL = process.env.AUDIT_URL || 'http://localhost:4173/'
mkdirSync('shots', { recursive: true })

const results = []
const check = (name, ok, extra = '') => {
  results.push([ok ? 'PASS' : 'FAIL', name, extra])
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  [' + extra + ']' : ''}`)
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function newPage(browser, vp) {
  const page = await browser.newPage()
  await page.setViewport(vp)
  const errors = []
  page.on('pageerror', e => errors.push('pageerror: ' + e.message))
  page.on('console', m => {
    if (m.type() === 'error') errors.push('console: ' + m.text())
  })
  page.errors = errors
  return page
}

async function settle(page, y, label) {
  await page.evaluate(yy => window.scrollTo(0, yy), y)
  await sleep(1400)
  await page.screenshot({ path: `shots/p3-${label}.png` })
}

async function state(page) {
  return page.evaluate(() => {
    const vis = sel => {
      const el = document.querySelector(sel)
      if (!el) return null
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      return {
        top: Math.round(r.top),
        opacity: Number(cs.opacity),
        display: cs.display,
        visibility: cs.visibility
      }
    }
    const bar = document.querySelector('[data-progress-bar]')
    const current = [...document.querySelectorAll('.nav__link.is-current')].map(a =>
      a.textContent.trim()
    )
    const mark = document.querySelector('[data-footer-mark]')
    return {
      scrollY: Math.round(window.scrollY),
      maxScroll: document.documentElement.scrollHeight - innerHeight,
      docH: document.documentElement.scrollHeight,
      fade: window.__VDBG?.filter(d => d[0] === 'setAct').slice(-1)[0]?.[1] ?? null,
      lastFadeRaw: window.__VDBG?.filter(d => d[0] === 'setFadeRaw').slice(-1)?.[0]?.[1],
      whisperVis: vis('.cinema__whisper'),
      revealTitleTop: document.querySelector('.reveal__title .line__inner')
        ? Math.round(
            document.querySelector('.reveal__title .line__inner').getBoundingClientRect().top
          )
        : null,
      reserveTxt: document.querySelector('[data-count-reserve]')?.textContent,
      atmTxt: document.querySelector('[data-count-atm]')?.textContent,
      progressBar: bar ? getComputedStyle(bar).transform : null,
      navCurrent: current,
      footerMarkClip: mark ? getComputedStyle(mark).clipPath : null,
      overflowX:
        document.documentElement.scrollWidth > innerWidth + 1
          ? document.documentElement.scrollWidth - innerWidth
          : 0
    }
  })
}

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--hide-scrollbars']
})

/* ---------------- DESKTOP PASS ---------------- */
{
  const page = await newPage(browser, { width: 1440, height: 900 })
  await page.goto(URL + '?debug', { waitUntil: 'networkidle2' })
  await sleep(4500)

  check('desktop: loader gone', await page.evaluate(() => !document.querySelector('[data-loader]')))
  check('desktop: canvas alive', await page.evaluate(() => !!document.querySelector('canvas')))

  const total = await page.evaluate(() => document.documentElement.scrollHeight)
  const tops = await page.evaluate(() => {
    const t = {}
    ;['#story', '#cinema', '#reveal', '#summary', '#access', '.fincta'].forEach(s => {
      const el = document.querySelector(s)
      t[s] = el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : null
    })
    return t
  })
  console.log('docHeight:', total, JSON.stringify(tops))

  // story section
  let s = await state(page)
  await settle(page, tops['#story'] + 500, 'd80-story')
  s = await state(page)
  check('desktop: story title words revealed', await page.evaluate(() => {
    const w = document.querySelector('.story__title .wi')
    return w && Math.abs(parseFloat(getComputedStyle(w).transform.split(',')[5])) < 4
  }), `y=${s.scrollY}`)

  // cinema mid — watch act + whisper visible
  await settle(page, tops['#cinema'] + 800, 'd84-cinema')
  s = await state(page)
  check('desktop: cinema act=watch', s.fade === 'watch', `act=${s.fade} whisperOp=${s.whisperVis?.opacity}`)
  check('desktop: whisper visible mid-cinema', s.whisperVis && s.whisperVis.opacity > 0.05, `${s.whisperVis?.opacity}`)

  // reveal — close-up pose + headline
  await settle(page, tops['#reveal'] + 900, 'd88-reveal')
  s = await state(page)
  check('desktop: reveal act=watch', s.fade === 'watch', `act=${s.fade}`)
  await settle(page, tops['#reveal'] + 1900, 'd90-reveal-end')
  s = await state(page)
  check('desktop: reveal headline lines up', await page.evaluate(() => {
    const l = document.querySelector('.reveal__title .line__inner')
    return l && Math.abs(parseFloat(getComputedStyle(l).transform.split(',')[5])) < 6
  }))
  check('desktop: reveal still act=watch near end', s.fade === 'watch', `act=${s.fade}`)

  // summary — act released, counters counted
  await settle(page, tops['#summary'] + 400, 'd94-summary')
  s = await state(page)
  check('desktop: act released at summary', s.fade === null || s.fade === false, `act=${s.fade}`)
  check('desktop: power reserve counted', s.reserveTxt === '72', `got=${s.reserveTxt}`)
  check('desktop: atm counted', s.atmTxt === '10', `got=${s.atmTxt}`)

  // access + fincta + footer
  await settle(page, tops['#access'] + 200, 'd97-access')
  s = await state(page)
  check('desktop: access visible', await page.evaluate(() => {
    const t = document.querySelector('.access__title')
    return t.getBoundingClientRect().top < 900 && getComputedStyle(t).opacity !== '0'
  }))
  await settle(page, total, 'd100-fincta')
  s = await state(page)
  check('desktop: fincta line revealed', await page.evaluate(() => {
    const l = document.querySelector('.fincta__line .line__inner')
    return l && Math.abs(parseFloat(getComputedStyle(l).transform.split(',')[5])) < 6
  }))
  check('desktop: progress bar ~1', /matrix\(1, 0, 0, 1/.test(s.progressBar || ''), `${s.progressBar}`)
  check('desktop: no horizontal overflow', s.overflowX === 0, `ox=${s.overflowX}`)

  // footer wordmark clip after scrolling to legal
  await settle(page, total, 'd100b-footer')
  s = await state(page)
  check('desktop: footer wordmark unclipped', s.footerMarkClip && !/100%/.test(s.footerMarkClip), `${s.footerMarkClip}`)

  /* --- ACCESS MODAL FLOW --- */
  await page.evaluate(() => document.querySelector('#access [data-open-access]').scrollIntoView({ block: 'center' }))
  await sleep(1200)
  await page.click('#access [data-open-access]')
  await sleep(1000)
  check('modal: opens visible', await page.evaluate(() => {
    const m = document.getElementById('access-modal')
    return m.getAttribute('aria-hidden') === 'false' && getComputedStyle(m).visibility === 'visible'
  }))
  await page.screenshot({ path: 'shots/p3-modal-open.png' })

  // empty submit -> errors
  await page.click('.access-form__submit')
  await sleep(500)
  const errCount = await page.evaluate(() => document.querySelectorAll('.field.is-error').length)
  check('modal: validation blocks empty submit', errCount >= 4, `errors=${errCount}`)
  await page.screenshot({ path: 'shots/p3-modal-errors.png' })

  // bad email kept as error
  await page.type('input[name="email"]', 'not-an-email')
  await page.type('input[name="firstName"]', 'Aarav')
  await page.type('input[name="lastName"]', 'Sharma')
  await page.type('input[name="country"]', 'India')
  await page.click('.access-form__submit')
  await sleep(400)
  const emailErr = await page.evaluate(() =>
    document.querySelector('[name="email"]').closest('.field').classList.contains('is-error')
  )
  check('modal: invalid email flagged', emailErr)

  // fix email -> success
  await page.evaluate(() => (document.querySelector('input[name="email"]').value = ''))
  await page.type('input[name="email"]', 'aarav@example.com')
  await page.click('.access-form__submit')
  await sleep(900)
  check('modal: success view shown', await page.evaluate(() => {
    const v = document.querySelector('[data-success-view]')
    return v.hidden === false && /REQUEST RECEIVED/i.test(v.textContent)
  }))
  check('modal: form hidden after success', await page.evaluate(() => document.querySelector('.access-form').hidden === true))
  await page.screenshot({ path: 'shots/p3-modal-success.png' })

  // escape closes
  await page.keyboard.press('Escape')
  await sleep(800)
  check('modal: Escape closes', await page.evaluate(() => {
    const m = document.getElementById('access-modal')
    return m.getAttribute('aria-hidden') === 'true'
  }))
  check('modal: reopen shows fresh form', await page.evaluate(async () => {
    document.querySelector('#exclusivity [data-open-access], #access [data-open-access]').click()
    await new Promise(r => setTimeout(r, 700))
    return (
      document.querySelector('.access-form').hidden === false &&
      document.querySelector('[data-success-view]').hidden === true &&
      document.querySelector('input[name="firstName"]').value === ''
    )
  }))
  await page.keyboard.press('Escape')
  await sleep(700)

  /* --- NAV ACTIVE STATE --- */
  await page.evaluate(() => document.querySelector('#craft').scrollIntoView({ block: 'center' }))
  await sleep(1300)
  s = await state(page)
  check('nav: CRAFT is-current at craft', s.navCurrent.includes('CRAFT'), JSON.stringify(s.navCurrent))

  /* --- exclusivity CTA now opens modal --- */
  const exBtn = await page.$('#exclusivity [data-open-access]')
  check('exclusivity: RESERVE button is data-open-access', !!exBtn)

  const errsD = page.errors.filter(e => !/favicon/i.test(e))
  check('desktop: zero errors', errsD.length === 0, errsD.slice(0, 3).join(' | '))
  await page.close()
}

/* ---------------- MOBILE PASS ---------------- */
{
  const page = await newPage(browser, { width: 390, height: 844 })
  await page.goto(URL, { waitUntil: 'networkidle2' })
  await sleep(4000)
  const totalM = await page.evaluate(() => document.documentElement.scrollHeight)
  const stops = [0.82, 0.87, 0.9, 0.93, 0.96, 1]
  for (let i = 0; i < stops.length; i++) {
    await settle(page, totalM * stops[i], `m${Math.round(stops[i] * 100)}`)
  }
  const sm = await state(page)
  check('mobile: journey sections present', await page.evaluate(() =>
    ['.story', '.cinema', '.reveal', '.summary', '.access', '.fincta', '.footer'].every(s => document.querySelector(s))
  ))
  check('mobile: summary rows stack (no nowrap)', await page.evaluate(() => {
    const big = document.querySelector('.summary__big')
    return getComputedStyle(big).whiteSpace !== 'nowrap'
  }))
  check('mobile: no horizontal overflow', sm.overflowX === 0, `ox=${sm.overflowX}`)
  check('mobile: progress bar exists', sm.progressBar !== null)

  // mobile modal
  await page.evaluate(() => document.querySelector('#access [data-open-access]').click())
  await sleep(900)
  check('mobile: modal fits viewport', await page.evaluate(() => {
    const p = document.querySelector('#access-modal .modal__panel')
    const r = p.getBoundingClientRect()
    return r.width <= 391 && r.height <= 846 && r.left >= -1
  }), '')
  await page.screenshot({ path: 'shots/p3-m-modal.png' })
  await page.mouse.click(6, 420)
  await sleep(700)
  check('mobile: backdrop click closes', await page.evaluate(() =>
    document.getElementById('access-modal').getAttribute('aria-hidden') === 'true'
  ))

  const errsM = page.errors.filter(e => !/favicon/i.test(e))
  check('mobile: zero errors', errsM.length === 0, errsM.slice(0, 3).join(' | '))
  await page.close()
}

/* ---------------- REDUCED MOTION PASS ---------------- */
{
  const page = await newPage(browser, { width: 1440, height: 900 })
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await page.goto(URL, { waitUntil: 'networkidle2' })
  await sleep(2500)
  const totalR = await page.evaluate(() => document.documentElement.scrollHeight)
  await page.evaluate(y => window.scrollTo(0, y), totalR * 0.92)
  await sleep(900)
  check('reduced: content readable', await page.evaluate(() => {
    const t = document.querySelector('.summary__title')
    const c = getComputedStyle(t)
    return c.display !== 'none' && c.visibility !== 'hidden'
  }))
  check('reduced: static counters correct', await page.evaluate(() =>
    document.querySelector('[data-count-reserve]').textContent === '72' &&
    document.querySelector('[data-count-atm]').textContent === '10'
  ))
  const errsR = page.errors.filter(e => !/favicon/i.test(e))
  check('reduced: zero errors', errsR.length === 0, errsR.slice(0, 3).join(' | '))
  await page.close()
}

await browser.close()

const fails = results.filter(r => r[0] === 'FAIL')
console.log(`\n==== PHASE 3 AUDIT: ${results.length - fails.length}/${results.length} passed ====`)
if (fails.length) {
  console.log('FAILURES:')
  fails.forEach(f => console.log(' -', f[1], f[2]))
  process.exit(1)
}

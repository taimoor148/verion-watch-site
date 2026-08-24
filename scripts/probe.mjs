import puppeteer from 'puppeteer-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--hide-scrollbars']
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
const errors = []
page.on('pageerror', e => errors.push(e.message))
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
await page.goto('http://localhost:4173/?debug', { waitUntil: 'networkidle0', timeout: 45000 })
await new Promise(r => setTimeout(r, 5200))

const STOPS = [0, 0.085, 0.21, 0.33, 0.53, 0.6, 0.68, 0.76, 0.84, 0.925, 0.97, 1]

for (const d of STOPS) {
  await page.evaluate(d => {
    window.scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) * d, behavior: 'instant' })
  }, d)
  await new Promise(r => setTimeout(r, 1600))
  const probe = await page.evaluate(() => {
    const specsItem = document.querySelector('.specs__item')
    const head = document.querySelector('.movement__head')
    return {
      y: Math.round(scrollY),
      fade: document.querySelector('[data-stage]').style.opacity,
      dbg: (window.__VDBG || []).splice(0).map(x => x.join(':')).join(' | ').slice(-300),
      specOpacity: specsItem ? getComputedStyle(specsItem).opacity : 'none',
      mvHeadOp: head ? getComputedStyle(head.children[0]).opacity : 'none',
      vph: document.querySelector('[data-count="28800"]')?.textContent,
      exNum: document.querySelector('[data-exclusive-number]')?.textContent ?? 'MISSING',
      procBar: getComputedStyle(document.querySelector('.process__progress i')).transform.slice(0, 26)
    }
  })
  console.log(JSON.stringify(probe))
}
console.log('ERRORS:', errors.slice(0, 8).join(' | ') || 'none')
await browser.close()

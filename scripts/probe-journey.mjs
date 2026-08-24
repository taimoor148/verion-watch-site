import puppeteer from 'puppeteer-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader']
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.goto('http://localhost:4173/?debug', { waitUntil: 'networkidle2' })
await new Promise(r => setTimeout(r, 4500))

// instrument setAct to record scroll position
await page.evaluate(() => {
  window.__ACTLOG = []
  const orig = window.__VDBG // wrapped setter exists; wrap again
})
// simpler: patch via Object.defineProperty on experience isn't reachable; instead log alongside
await page.evaluate(() => {
  window.addEventListener('scroll', () => { window.__LASTY = Math.round(window.scrollY) }, { passive: true })
})

const stops = [26000, 28000, 29500, 30000, 30400, 30600, 30800, 31000, 31200, 31500]
for (const y of stops) {
  await page.evaluate(yy => window.scrollTo(0, yy), y)
  await new Promise(r => setTimeout(r, 1100))
  const log = await page.evaluate(() => ({
    y: Math.round(window.scrollY),
    hist: window.__VDBG.filter(d => d[0] === 'setAct').map(d => `${d[1]}@${d[2]} ${d[3] || ''}`).slice(-6)
  }))
  console.log(`y=${log.y}  ${log.hist.join(' -> ')}`)
}
await browser.close()

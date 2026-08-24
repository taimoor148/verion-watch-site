import puppeteer from 'puppeteer-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader']
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
page.on('pageerror', e => console.log('PAGEERROR:', e.message))
page.on('console', m => m.type() === 'error' && console.log('CONSOLE:', m.text()))
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle2' })
await new Promise(r => setTimeout(r, 4500))

const cTop = await page.evaluate(() =>
  Math.round(document.querySelector('#cinema').getBoundingClientRect().top + window.scrollY)
)

for (const dy of [200, 500, 800, 1100, 1500]) {
  await page.evaluate(y => window.scrollTo(0, y), cTop + dy)
  await new Promise(r => setTimeout(r, 1600))
  const st = await page.evaluate(() => {
    const w = document.querySelector('.cinema__whisper')
    const cs = getComputedStyle(w)
    return {
      op: cs.opacity,
      inline: w.style.opacity,
      disp: cs.display,
      vis: cs.visibility,
      rectTop: Math.round(w.getBoundingClientRect().top),
      txt: w.textContent.trim()
    }
  })
  console.log(`dy=${dy}`, JSON.stringify(st))
}
await browser.close()

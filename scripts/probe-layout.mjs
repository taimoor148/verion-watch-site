import puppeteer from 'puppeteer-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--hide-scrollbars']
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.goto('http://localhost:4173', { waitUntil: 'networkidle0', timeout: 45000 })
await new Promise(r => setTimeout(r, 5000))

const SELS = ['.hero', '.manifesto', '.showcase', '.craft', '.process', '.movement', '.detail', '.collection', '.exclusivity', '.teaser']

async function measure(label) {
  return page.evaluate(sels => {
    const out = { docH: document.documentElement.scrollHeight }
    sels.forEach(s => {
      const el = document.querySelector(s)
      out[s] = el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : null
    })
    return out
  }, SELS)
}

const early = await measure('early')
console.log('EARLY', JSON.stringify(early))

await page.evaluate(() => window.scrollTo({ top: 999999, behavior: 'instant' }))
await new Promise(r => setTimeout(r, 1800))
const late = await measure('late')
console.log('LATE ', JSON.stringify(late))
console.log('DELTA', JSON.stringify(Object.fromEntries(SELS.map(s => [s, (late[s] ?? 0) - (early[s] ?? 0)]))))
await browser.close()

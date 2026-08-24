import puppeteer from 'puppeteer-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const BASE = process.env.BASE_URL || 'http://localhost:4173'
const OUT = process.env.OUT_DIR || 'shots'

import { mkdirSync } from 'node:fs'
mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars']
})

const errors = []
async function runSession(name, viewport, actions) {
  const page = await browser.newPage()
  await page.setViewport(viewport)
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`[${name}] console.error: ${msg.text()}`)
  })
  page.on('pageerror', err => errors.push(`[${name}] pageerror: ${err.message}`))
  await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 45000 })
  await new Promise(r => setTimeout(r, 5200))
  if (actions) await actions(page)
  await page.screenshot({ path: `${OUT}/${name}.png` })
  await page.close()
}

await runSession('desktop-hero', { width: 1440, height: 900 })
await runSession('laptop-hero', { width: 1280, height: 800 })
await runSession('tablet', { width: 768, height: 1024 })
await runSession('mobile', { width: 390, height: 844 })

await runSession('desktop-scrolled', { width: 1440, height: 900 }, async page => {
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.55))
  await new Promise(r => setTimeout(r, 1800))
})

await runSession('menu-open', { width: 390, height: 844 }, async page => {
  await page.click('[data-menu-open]')
  await new Promise(r => setTimeout(r, 1400))
})

console.log(errors.length ? errors.join('\n') : 'NO RUNTIME ERRORS')
await browser.close()

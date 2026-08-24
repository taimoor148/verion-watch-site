import puppeteer from 'puppeteer-core'
import { PNG } from 'pngjs'
import { mkdirSync } from 'node:fs'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const BASE = 'http://localhost:4173'
mkdirSync('shots', { recursive: true })

function overallMean(png) {
  let sum = 0
  let count = 0
  for (let y = 0; y < png.height; y += 3) {
    for (let x = 0; x < png.width; x += 3) {
      const i = (y * png.width + x) * 4
      sum += (0.2126 * png.data[i] + 0.7152 * png.data[i + 1] + 0.0722 * png.data[i + 2]) / 255
      count++
    }
  }
  return sum / count
}

async function snap(page, name, report) {
  const b64 = await page.screenshot({ encoding: 'base64' })
  const png = PNG.sync.read(Buffer.from(b64, 'base64'))
  const mean = overallMean(png)
  report.push(`${name}: meanLum=${mean.toFixed(4)}${mean < 0.008 ? '  <-- SUSPICIOUSLY BLACK' : ''}`)
  await page.screenshot({ path: `shots/p2-${name}.png` })
}

async function goToDepth(page, depth) {
  await page.evaluate(d => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({ top: Math.max(0, Math.round(max * d)), behavior: 'instant' })
  }, depth)
  await new Promise(r => setTimeout(r, 1400))
}

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--hide-scrollbars']
})

const errors = []
const report = []

async function newPage(viewport) {
  const page = await browser.newPage()
  await page.setViewport(viewport)
  page.on('pageerror', err => errors.push(`PAGEERROR: ${err.message}`))
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`CONSOLE: ${msg.text()}`)
  })
  await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 45000 })
  await new Promise(r => setTimeout(r, 5200))
  return page
}

const DESKTOP_STOPS = [
  ['d00-hero', 0],
  ['d06-manifesto', 0.085],
  ['d14-manifesto-end', 0.145],
  ['d20-showcase-a', 0.21],
  ['d32-showcase-b', 0.33],
  ['d44-showcase-c', 0.45],
  ['d52-showcase-d', 0.53]
]

{
  const page = await newPage({ width: 1440, height: 900 })

  for (const [name, depth] of DESKTOP_STOPS) {
    await goToDepth(page, depth)
    await snap(page, name, report)
    const probe = await page.evaluate(() => ({
      y: Math.round(window.scrollY),
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      hotspotsPlaced: document.querySelectorAll('.hotspot.is-placed').length,
      cardOpen: document.querySelector('.hotspot-card')?.classList.contains('is-open') || false,
      actFade: Number(document.querySelector('[data-stage]').style.opacity || '1')
    }))
    report.push(`  ${name} ${JSON.stringify(probe)}`)
  }

  await goToDepth(page, 0.53)
  const clicked = await page.evaluate(() => {
    const btn = document.querySelector('.hotspot.is-placed')
    if (!btn) return false
    btn.click()
    return true
  })
  await new Promise(r => setTimeout(r, 1100))
  const hs = await page.evaluate(() => ({
    cardOpen: document.querySelector('.hotspot-card')?.classList.contains('is-open'),
    cardText: document.querySelector('.hotspot-card__title')?.textContent,
    activeCount: document.querySelectorAll('.hotspot.is-active').length
  }))
  report.push(`hotspot-click clicked=${clicked} ${JSON.stringify(hs)}`)
  await snap(page, 'd53-hotspot-open', report)

  await goToDepth(page, 0.6)
  await snap(page, 'd60-craft-grid', report)
  const craftProbe = await page.evaluate(() => ({
    figs: document.querySelectorAll('.craft__fig').length,
    placeholders: document.querySelectorAll('.media-placeholder').length,
    imgsBroken: [...document.querySelectorAll('.craft__fig img')].filter(i => i.src && !i.complete).length
  }))
  report.push(`  craft ${JSON.stringify(craftProbe)}`)

  await goToDepth(page, 0.68)
  await snap(page, 'd68-process-mid', report)
  const procProbe = await page.evaluate(() => {
    const track = document.querySelector('.process__track')
    return {
      trackX: getComputedStyle(track).transform.slice(0, 40),
      progressScale: getComputedStyle(document.querySelector('.process__progress i')).transform
    }
  })
  report.push(`  process ${JSON.stringify(procProbe)}`)

  await goToDepth(page, 0.76)
  await snap(page, 'd76-movement-early', report)
  const specEarly = await page.evaluate(() =>
    document.querySelector('[data-count="28800"]')?.textContent ?? 'MISSING'
  )
  report.push(`  spec-early=${specEarly}`)

  await goToDepth(page, 0.84)
  await snap(page, 'd84-movement-late', report)
  const mvLate = await page.evaluate(() => ({
    vph: document.querySelector('[data-count="28800"]')?.textContent ?? 'MISSING',
    reserve: document.querySelector('[data-count="72"]')?.textContent ?? 'MISSING',
    comps: document.querySelector('[data-count="168"]')?.textContent ?? 'MISSING',
    cal: document.querySelector('[data-count="1"]')?.textContent ?? 'MISSING',
    stageOpacity: document.querySelector('[data-stage]')?.style.opacity
  }))
  report.push(`  movement-late ${JSON.stringify(mvLate)}`)

  await goToDepth(page, 0.885)
  await snap(page, 'd89-detail', report)

  await goToDepth(page, 0.925)
  await snap(page, 'd93-collection', report)
  await page.evaluate(() => document.querySelector('[data-explore-product="obsidian"]')?.click())
  await new Promise(r => setTimeout(r, 1100))
  const modalOpen = await page.evaluate(() => ({
    visible: getComputedStyle(document.getElementById('product-modal')).visibility === 'visible',
    title: document.getElementById('modal-title').textContent,
    price: document.querySelector('[data-modal-price]').textContent,
    focusInModal: document.getElementById('product-modal').contains(document.activeElement)
  }))
  report.push(`modal-open ${JSON.stringify(modalOpen)}`)
  await snap(page, 'd93-modal', report)
  await page.keyboard.press('Escape')
  await new Promise(r => setTimeout(r, 900))
  const modalClosed = await page.evaluate(
    () => getComputedStyle(document.getElementById('product-modal')).visibility === 'hidden'
  )
  report.push(`modal-closed=${modalClosed}`)

  await goToDepth(page, 0.97)
  await snap(page, 'd97-exclusivity', report)
  const ex = await page.evaluate(() => ({
    number: document.querySelector('[data-exclusive-number]')?.textContent ?? 'MISSING'
  }))
  report.push(`  exclusivity ${JSON.stringify(ex)}`)

  await goToDepth(page, 1)
  await snap(page, 'd100-teaser', report)
  const teaser = await page.evaluate(() => ({
    titleOpacity: getComputedStyle(document.querySelector('.teaser__title')).opacity
  }))
  report.push(`  teaser ${JSON.stringify(teaser)}`)

  await page.close()
}

{
  const page = await newPage({ width: 390, height: 844 })
  const stops = [
    ['m10-hero', 0],
    ['m30-craft', 0.42],
    ['m55-movement', 0.62],
    ['m80-collection', 0.86],
    ['m100-teaser', 1]
  ]
  for (const [name, depth] of stops) {
    await goToDepth(page, depth)
    await snap(page, name, report)
    const probe = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      processDir: getComputedStyle(document.querySelector('.process__track')).flexDirection,
      specsCols: getComputedStyle(document.querySelector('.specs')).gridTemplateColumns.split(' ').length
    }))
    report.push(`  ${name} ${JSON.stringify(probe)}`)
  }
  await page.close()
}

console.log(report.join('\n'))
console.log(errors.length ? `\nERRORS (${errors.length}):\n${errors.join('\n')}` : '\nNO CONSOLE/PAGE ERRORS')
await browser.close()
process.exit(errors.length ? 1 : 0)

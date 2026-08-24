import puppeteer from 'puppeteer-core'
import { PNG } from 'pngjs'
import { mkdirSync } from 'node:fs'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const BASE = 'http://localhost:4173'
mkdirSync('shots', { recursive: true })

function regionStats(png, x0, y0, x1, y1) {
  let sum = 0
  let bright = 0
  let mid = 0
  let count = 0
  for (let y = y0; y < y1; y += 2) {
    for (let x = x0; x < x1; x += 2) {
      const i = (y * png.width + x) * 4
      const lum = (0.2126 * png.data[i] + 0.7152 * png.data[i + 1] + 0.0722 * png.data[i + 2]) / 255
      sum += lum
      if (lum > 0.55) bright++
      else if (lum > 0.12) mid++
      count++
    }
  }
  return { mean: sum / count, brightRatio: bright / count, midRatio: mid / count }
}

async function analyze(page, name) {
  const b64 = await page.screenshot({ encoding: 'base64' })
  const png = PNG.sync.read(Buffer.from(b64, 'base64'))
  const W = png.width
  const H = png.height
  return {
    name,
    headlineZone: regionStats(png, Math.round(W * 0.05), Math.round(H * 0.3), Math.round(W * 0.5), Math.round(H * 0.62)),
    watchZoneDesktop: regionStats(png, Math.round(W * 0.55), Math.round(H * 0.18), Math.round(W * 0.95), Math.round(H * 0.85)),
    watchZoneMobile: regionStats(png, Math.round(W * 0.15), Math.round(H * 0.45), Math.round(W * 0.85), Math.round(H * 0.92)),
    overall: regionStats(png, 0, 0, W, H)
  }
}

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--hide-scrollbars']
})

const report = []
const push = lines => report.push(...lines)

async function session(name, viewport, isMobileLayout) {
  const page = await browser.newPage()
  await page.setViewport(viewport)
  page.on('pageerror', err => push([`ERROR ${name}: ${err.message}`]))
  await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 45000 })
  await new Promise(r => setTimeout(r, 5500))

  const dom = await page.evaluate(() => ({
    loaderGone: getComputedStyle(document.getElementById('loader')).display === 'none',
    canvasExists: Boolean(document.querySelector('[data-watch-canvas] canvas, .watch-poster')),
    hOverflow: document.documentElement.scrollWidth > window.innerWidth,
    titleFont: getComputedStyle(document.querySelector('.hero__title')).fontFamily.slice(0, 30),
    titleSizePx: getComputedStyle(document.querySelector('.hero__title')).fontSize,
    navScrolled: document.querySelector('[data-nav]').classList.contains('is-scrolled')
  }))
  push([`--- ${name} ---`, JSON.stringify(dom)])

  const stats = await analyze(page, name)
  const wz = isMobileLayout ? stats.watchZoneMobile : stats.watchZoneDesktop
  push([
    `headline mean=${stats.headlineZone.mean.toFixed(3)} bright=${stats.headlineZone.brightRatio.toFixed(4)}`,
    `watchzone mean=${wz.mean.toFixed(3)} mid=${wz.midRatio.toFixed(4)} bright=${wz.brightRatio.toFixed(4)}`,
    `overall mean=${stats.overall.mean.toFixed(4)}`
  ])

  await page.screenshot({ path: `shots/${name}.png` })

  if (isMobileLayout) {
    await page.click('[data-menu-open]')
    await new Promise(r => setTimeout(r, 1300))
    const menuState = await page.evaluate(() => ({
      visible: getComputedStyle(document.getElementById('menu')).visibility === 'visible' && Number(getComputedStyle(document.getElementById('menu')).opacity) > 0.9,
      firstItemOpacity: Number(getComputedStyle(document.querySelector('.menu__item a')).opacity),
      ariaHidden: document.getElementById('menu').getAttribute('aria-hidden')
    }))
    push(['menu', JSON.stringify(menuState)])
    await page.screenshot({ path: `shots/${name}-menu.png` })
  } else {
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.6))
    await new Promise(r => setTimeout(r, 1600))
    const scrolled = await page.evaluate(() => ({
      navScrolledNow: document.querySelector('[data-nav]').classList.contains('is-scrolled'),
      scrollY: window.scrollY
    }))
    push(['scrolled', JSON.stringify(scrolled)])
    await page.screenshot({ path: `shots/${name}-scrolled.png` })
  }
  await page.close()
}

await session('desktop', { width: 1440, height: 900 }, false)
await session('mobile', { width: 390, height: 844 }, true)

console.log(report.join('\n'))
await browser.close()

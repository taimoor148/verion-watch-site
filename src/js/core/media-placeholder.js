const BASE = import.meta.env.BASE_URL || '/'

let uid = 0

function defs(vh, ch) {
  return `<defs>
    <radialGradient id="bg${uid}" cx="32%" cy="22%" r="105%">
      <stop offset="0" stop-color="#14161c"/>
      <stop offset="0.55" stop-color="#0a0b0f"/>
      <stop offset="1" stop-color="#060608"/>
    </radialGradient>
    <linearGradient id="ch${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${ch}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${ch}" stop-opacity="0.25"/>
    </linearGradient>
    <linearGradient id="sh${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#e8e4da" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#e8e4da" stop-opacity="${vh}"/>
      <stop offset="1" stop-color="#e8e4da" stop-opacity="0"/>
    </linearGradient>
  </defs>`
}

function frame(inner, w = 800, h = 600) {
  uid += 1
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">
    ${defs(0.05, '#c8b287')}
    <rect width="${w}" height="${h}" fill="url(#bg${uid})"/>
    ${inner}
    <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="none" stroke="#ffffff" stroke-opacity="0.04"/>
  </svg>`
}

const ART = {
  'craft-machining': () => {
    let lines = ''
    for (let i = 0; i < 26; i++) {
      const y = 90 + i * 17
      lines += `<line x1="-60" y1="${y}" x2="880" y2="${y - 130}" stroke="#9aa0aa" stroke-opacity="${i % 3 ? 0.06 : 0.12}" stroke-width="1.4"/>`
    }
    return frame(`${lines}
      <circle cx="565" cy="300" r="150" fill="none" stroke="#c8b287" stroke-opacity="0.35"/>
      <circle cx="565" cy="300" r="118" fill="none" stroke="#e8e4da" stroke-opacity="0.1"/>
      <circle cx="565" cy="300" r="7" fill="#c8b287" fill-opacity="0.8"/>
      <path d="M 565 300 L 700 210" stroke="url(#sh${uid})" stroke-width="2"/>`, 800, 520)
  },
  'craft-polishing': () => frame(`
      <ellipse cx="400" cy="330" rx="290" ry="120" fill="url(#sh${uid})" transform="rotate(-18 400 330)"/>
      <ellipse cx="400" cy="250" rx="200" ry="64" fill="none" stroke="#e8e4da" stroke-opacity="0.14" transform="rotate(-18 400 250)"/>
      <ellipse cx="400" cy="282" rx="150" ry="44" fill="none" stroke="#e8e4da" stroke-opacity="0.09" transform="rotate(-18 400 282)"/>
      <circle cx="620" cy="180" r="3" fill="#c8b287"/><circle cx="180" cy="420" r="2.4" fill="#c8b287" fill-opacity="0.7"/>`, 800, 520),
  'craft-engraving': () => {
    let rings = ''
    for (let r = 26; r <= 240; r += 18) {
      rings += `<circle cx="400" cy="260" r="${r}" fill="none" stroke="#c8b287" stroke-opacity="${r % 36 === 26 ? 0.34 : 0.13}" stroke-width="${r % 36 === 26 ? 1.6 : 0.9}"/>`
    }
    return frame(`${rings}<circle cx="400" cy="260" r="9" fill="none" stroke="#c8b287" stroke-opacity="0.8"/>`, 800, 520)
  },
  'craft-dial': () => {
    let rays = ''
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2
      const x = 400 + Math.cos(a) * 235
      const y = 260 + Math.sin(a) * 235
      const x2 = 400 + Math.cos(a) * 40
      const y2 = 260 + Math.sin(a) * 40
      rays += `<line x1="${x2.toFixed(1)}" y1="${y2.toFixed(1)}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#e8e4da" stroke-opacity="${i % 4 === 0 ? 0.13 : 0.05}" stroke-width="1.2"/>`
    }
    return frame(`<circle cx="400" cy="260" r="238" fill="none" stroke="#c8b287" stroke-opacity="0.4"/>${rays}`, 800, 520)
  },
  'craft-assembly': () => frame(`
      <g stroke="#e8e4da" stroke-opacity="0.16" fill="none">
        <circle cx="230" cy="300" r="88"/><circle cx="230" cy="300" r="58"/>
        <rect x="430" y="220" width="190" height="160" rx="10"/>
        <circle cx="650" cy="380" r="46"/>
        <path d="M 120 140 L 300 140 M 120 128 L 300 128" stroke="#c8b287" stroke-opacity="0.45"/>
      </g>
      <circle cx="230" cy="300" r="10" fill="#c8b287" fill-opacity="0.55"/>
      <line x1="620" y1="120" x2="700" y2="120" stroke="url(#sh${uid})" stroke-width="2"/>`, 800, 520),
  'detail-case': () => frame(`
      <path d="M 150 320 Q 150 170 400 165 Q 650 170 650 320 Q 650 430 400 438 Q 150 430 150 320 Z" fill="none" stroke="#e8e4da" stroke-opacity="0.28" stroke-width="2"/>
      <path d="M 185 320 Q 185 205 400 200 Q 615 205 615 320" fill="none" stroke="url(#sh${uid})" stroke-width="3"/>
      <path d="M 648 300 q 42 -14 42 22 t -42 22" fill="none" stroke="#c8b287" stroke-opacity="0.6" stroke-width="2"/>
      <line x1="150" y1="360" x2="650" y2="360" stroke="#e8e4da" stroke-opacity="0.07"/>`, 800, 600),
  'detail-dial': () => {
    let idx = ''
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2
      const x1 = 400 + Math.cos(a) * 195
      const y1 = 300 + Math.sin(a) * 195
      const x2 = 400 + Math.cos(a) * 225
      const y2 = 300 + Math.sin(a) * 225
      idx += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#c8b287" stroke-opacity="0.75" stroke-width="3"/>`
    }
    return frame(`<circle cx="400" cy="300" r="238" fill="#0c0d11" stroke="#c8b287" stroke-opacity="0.3"/>
      ${idx}
      <line x1="400" y1="300" x2="400" y2="150" stroke="#e8e4da" stroke-opacity="0.85" stroke-width="4"/>
      <line x1="400" y1="300" x2="500" y2="350" stroke="#e8e4da" stroke-opacity="0.6" stroke-width="3"/>
      <circle cx="400" cy="300" r="6" fill="#c8b287"/>`, 800, 600)
  },
  'detail-crown': () => {
    let ridges = ''
    for (let i = 0; i < 22; i++) {
      const x = 330 + i * 7
      ridges += `<line x1="${x}" y1="215" x2="${x}" y2="395" stroke="#e8e4da" stroke-opacity="${i % 2 ? 0.3 : 0.12}" stroke-width="2.4"/>`
    }
    return frame(`<ellipse cx="400" cy="305" rx="92" ry="96" fill="#101218" stroke="#c8b287" stroke-opacity="0.4"/>
      ${ridges}
      <ellipse cx="400" cy="305" rx="92" ry="96" fill="none" stroke="url(#sh${uid})" stroke-width="2"/>`, 800, 600)
  },
  'detail-engraving': () => {
    let strokes = ''
    for (let i = 0; i < 9; i++) {
      const y = 200 + i * 26
      strokes += `<path d="M 180 ${y} q 60 -22 120 0 t 120 0 t 120 0 t 100 0" fill="none" stroke="#e8e4da" stroke-opacity="${0.4 - i * 0.03}" stroke-width="1.6"/>`
    }
    return frame(`${strokes}
      <text x="400" y="440" text-anchor="middle" font-family="Georgia, serif" font-size="30" letter-spacing="10" fill="#c8b287" fill-opacity="0.75">VERION</text>`, 800, 600)
  },
  'detail-bracelet': () => {
    let links = ''
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        const x = 250 + c * 108
        const y = 150 + r * 82
        links += `<rect x="${x}" y="${y}" width="94" height="66" rx="12" fill="#11131a" stroke="#e8e4da" stroke-opacity="0.18"/>
          <line x1="${x + 14}" y1="${y + 33}" x2="${x + 80}" y2="${y + 33}" stroke="url(#sh${uid})" stroke-width="2"/>`
      }
    }
    return frame(links, 800, 600)
  },
  'detail-movement': () => {
    let teeth = ''
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2
      const x = 400 + Math.cos(a) * 168
      const y = 300 + Math.sin(a) * 168
      teeth += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="#e8e4da" fill-opacity="0.2"/>`
    }
    return frame(`
      <circle cx="400" cy="300" r="168" fill="none" stroke="#e8e4da" stroke-opacity="0.25" stroke-width="2"/>
      ${teeth}
      <circle cx="400" cy="300" r="112" fill="none" stroke="#c8b287" stroke-opacity="0.4"/>
      <circle cx="400" cy="300" r="52" fill="none" stroke="#c8b287" stroke-opacity="0.6"/>
      <circle cx="560" cy="200" r="56" fill="none" stroke="#e8e4da" stroke-opacity="0.2"/>
      <circle cx="250" cy="390" r="40" fill="none" stroke="#e8e4da" stroke-opacity="0.16"/>`, 800, 600)
  },
  'watch-obsidian': () => watchArt('#1a1c22', '#2a2d35'),
  'watch-titanium': () => watchArt('#3a3f47', '#585f69'),
  'watch-champagne': () => watchArt('#8d7648', '#c8b287')
}

function watchArt(caseFill, dialFill) {
  let ticks = ''
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2
    const x1 = 400 + Math.cos(a) * 148
    const y1 = 300 + Math.sin(a) * 148
    const x2 = 400 + Math.cos(a) * 166
    const y2 = 300 + Math.sin(a) * 166
    ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#e8e4da" stroke-opacity="0.55" stroke-width="${i % 3 === 0 ? 3 : 1.6}"/>`
  }
  return frame(`
    <path d="M 310 158 l -52 -46 v 90 z M 490 158 l 52 -46 v 90 z M 310 442 l -52 46 v -90 z M 490 442 l 52 46 v -90 z"
      fill="none" stroke="#e8e4da" stroke-opacity="0.2" stroke-width="2"/>
    <circle cx="400" cy="300" r="182" fill="${caseFill}" stroke="#e8e4da" stroke-opacity="0.35" stroke-width="2"/>
    <circle cx="400" cy="300" r="176" fill="url(#sh${uid})" fill-opacity="0.5"/>
    <circle cx="400" cy="300" r="152" fill="${dialFill}"/>
    ${ticks}
    <line x1="400" y1="300" x2="400" y2="188" stroke="#ede8dd" stroke-opacity="0.9" stroke-width="4"/>
    <line x1="400" y1="300" x2="478" y2="340" stroke="#ede8dd" stroke-opacity="0.7" stroke-width="3"/>
    <circle cx="400" cy="300" r="5.5" fill="#c8b287"/>
    <rect x="586" y="286" width="30" height="28" rx="7" fill="${caseFill}" stroke="#e8e4da" stroke-opacity="0.3"/>
    <text x="400" y="248" text-anchor="middle" font-family="Georgia, serif" font-size="19" letter-spacing="7" fill="#e8e4da" fill-opacity="0.7">VERION</text>`, 800, 600)
}

export function placeholderSVG(kind) {
  const make = ART[kind] || ART['craft-machining']
  return make()
}

export function mountPlaceholder(container, kind) {
  const wrap = document.createElement('div')
  wrap.className = 'media-placeholder'
  wrap.innerHTML = placeholderSVG(kind)
  container.appendChild(wrap)
  return wrap
}

export function enhanceImage(img, fallbackKind) {
  const kind = img.dataset.media || fallbackKind
  if (!kind) return
  if (typeof location !== 'undefined' && location.protocol === 'file:') {
    swapToPlaceholder(img, kind)
    return
  }
  img.addEventListener('error', () => swapToPlaceholder(img, kind), { once: true })
  img.src = `${BASE}images/${kind}.webp`
}

function swapToPlaceholder(img, kind) {
  const wrap = document.createElement('div')
  wrap.className = 'media-placeholder'
  wrap.setAttribute('aria-hidden', 'true')
  wrap.innerHTML = placeholderSVG(kind)
  img.replaceWith(wrap)
}

export function enhanceAllImages(root = document) {
  root.querySelectorAll('img[data-media]').forEach(img => enhanceImage(img))
}

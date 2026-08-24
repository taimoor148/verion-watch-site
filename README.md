# VÃ‰RION â€” TIME, REFINED.

Phases 1â€“2 of the VÃ‰RION luxury watch website: loading experience, navigation,
cinematic 3D hero (Phase 1), then the full editorial narrative â€” manifesto,
interactive product showcase with projected hotspots, craftsmanship story with
horizontal process sequence, mechanical movement act, extreme-detail macro
stack, collection with product modal, exclusivity finale, and a teaser toward
the next chapter. Three.js, GSAP + ScrollTrigger, and Lenis smooth scrolling
on a Vite foundation.

## Quickstart

```bash
npm install
npm run build    # production build + VERION.html at project root
npm run dev      # local dev server (http://localhost:5173)
npm run preview  # serve the production build
```

**No server needed:** after building, just double-click **`VERION.html`**
in the project root â€” it is fully self-contained (all JS/CSS inlined).
Without a server it automatically uses the procedural watch and crafted SVG
imagery; drop real assets in `public/` and serve via `npm run preview`
to see them.

Node 18+ required.

## Structure

```
public/
  models/verion-watch.glb      <- drop the real watch model here (auto-detected)
  models/verion-movement.glb   <- optional movement model for the 04 act
  images/*.webp                <- optional real photography (placeholders swap)
src/
  styles/                      base tokens Â· loader Â· chrome Â· hero Â· sections
  js/
    core/capabilities.js       WebGL support, device tier, DPR clamp, reduced-motion
    core/media-placeholder.js  crafted SVG plates used until real photos land
    three/textures.js          procedural dial / brushed metal / Geneva stripes
    three/watch-factory.js     procedural fallback watch (case, dial, hands)
    three/movement-factory.js  procedural Calibre V-1 (bridges, train, balance)
    three/watch-experience.js  single fixed WebGL stage: two-act engine
                               (watch / movement), pose controllers, projection,
                               GLB auto-swaps, poster fallback, cleanup
    ui/loader.js               progress choreography -> reveal handoff
    ui/navigation.js           nav states, fullscreen menu, anchors, focus trap
    ui/cursor.js               custom dot+ring cursor, magnetic elements
    hero/entrance.js           choreographed hero reveal timeline
    hero/scroll-scenes.js      ScrollTrigger scrubbed watch + copy motion
    sections/manifesto.js      word-mask scroll statements (01)
    sections/showcase.js       sticky pose journey + projected hotspots (02)
    sections/craft.js          asymmetric grid + horizontal process pin (03)
    sections/movement.js       movement act story + spec counters (04)
    sections/detail.js         stacking macro panels (05)
    sections/collection.js     collection layout + product modal data/logic (06)
    sections/exclusivity.js    scrub-linked 250 counter + plate (07)
    sections/teaser.js         THE STORY teaser reveal (08)
scripts/
  audit.mjs                    Phase 1 headless runtime audit (Edge CDP)
  audit-phase2.mjs             full-depth Phase 2 audit: acts, fades, hotspots,
                               modal, counters, mobile layout, screenshots
```

## Swapping in real assets

- 3D watch: `public/models/verion-watch.glb` â€” late-swapped over the
  procedural watch; see `public/models/README.md`.
- Movement close-up: `public/models/verion-movement.glb` â€” replaces the
  procedural calibre during the movement act.
- Photography: drop `*.webp` files into `public/images/` named after the
  `data-media` keys in `index.html` (e.g. `craft-machining.webp`,
  `detail-crown.webp`, `watch-obsidian.webp`). Until a file exists, a crafted
  dark-luxury SVG plate renders in its place automatically.

## Design language

BLACK + METAL + LIGHT. Obsidian `#050506`, graphite, warm ivory `#EDE8DD`,
champagne `#C8B287` used sparingly. Cormorant Garamond display serif over
Inter technical sans. Luxury through composition, spacing, and restrained
motion â€” not effects.

## Behavior notes

- Reduced motion (`prefers-reduced-motion`): loader shortens, all scrubs/pins/
  parallax disable, sections render as static compositions, the 3D stage lives
  inside the hero only, hotspot markers are replaced by static annotation
  cards. Changes are picked up live.
- No WebGL: an editorial hairline SVG watch poster renders instead of breaking.
- Low-end/mobile tier: lower pixel ratio, cheaper crystal material, fewer
  segments; the process sequence becomes vertical and specs reflow to two
  columns rather than shrinking.
- Rendering pauses when the tab is hidden, when nothing is on screen that
  needs it, and during fully-faded gaps between acts.
- The product modal traps focus, restores it on close, and freezes page
  scroll while open.



## Phase 3 - The Journey Finale

- **Story (09)**: "TIME SHOULD LEAVE A MARK." word-mask reveal, verse lines and
  the philosophy statement.
- **Cinematic transition**: the single canvas watch returns for a slow approach
  ("TIME, SUSPENDED.") that flows without a cut into
- **Final reveal (10)**: full-frame close-up with "THE WATCH THAT DEFINES THE
  MOMENT." headline, then releases to normal scrolling at the summary.
- **Summary (11)**: editorial specification sheet - V-01, 72H, SAPPHIRE,
  GRADE 5 TITANIUM, 10 ATM - with scrubbed count-ups.
- **Limited edition, enhanced**: kicker now reads LIMITED SERIES; the reserve
  button opens the private access modal.
- **Access (12)**: RESERVE YOUR VERION. plus REQUEST PRIVATE ACCESS opening a
  validated reservation form (first/last/email/phone/country/message) with an
  inline success state. Frontend-only by design - no data is sent anywhere.
- **Finale + footer**: TIME IS LIMITED. sign-off, clip-reveal wordmark,
  navigation columns, social links and legal row.
- **Navigation**: JOURNAL anchors to #story, DISCOVER is now PRIVATE ACCESS;
  menu overlay lists all chapters; the current section is subtly highlighted;
  a hairline scroll-progress bar sits above the header.

## Verification

Run the audits against a running preview (`npm run preview`):

```
node scripts/audit-phase2.mjs   # phases 1-2 functional/responsive checks
node scripts/audit-phase3.mjs   # journey, modal flow, nav state, reduced motion
```

`AUDIT_URL=file:///...VERION.html node scripts/audit-phase3.mjs` verifies the
standalone file directly over file://. Screenshots land in `shots/`.

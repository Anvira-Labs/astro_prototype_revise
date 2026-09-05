# Aurora Bloom

A light-mode-first, warm, optimistic "sunrise wellness" reinterpretation of
Zodiac Bee — the deliberate counterpoint to a moody night-sky direction
being explored elsewhere for the same pitch. Where that direction leans on
mysticism and shadow, Aurora Bloom borrows its polish level from top-tier
wellness and fintech apps: daylight instead of dusk, a coral-to-amber
sunrise as the signature "alive" gradient instead of gold-on-plum, and a
cool teal counterweight so the palette never reads as one-note warm. Every
motion moment — the drifting hero blobs, the pulsing sun orb, the
magnetic CTA, the scroll-reveal cards — is built from real CSS/JS on top of
the existing vanilla architecture, with no new dependency and no shortcut
around `prefers-reduced-motion`. It is the same working product underneath
(routing, localStorage, validation, the real sun-sign calculation); only the
presentation layer changed.

## Palette

Every pairing below was checked against WCAG AA with a relative-luminance
contrast calculation (not eyeballed) before being locked in — see the
comment block at the top of `styles/app.css` for the pairs that needed a
*different* value than the obvious brand hue to actually pass.

**Light theme (primary experience)**
| Swatch | Hex | Role |
|---|---|---|
| 🟤 `#33261c` | `--ink` | Primary text |
| 🟤 `#6b5847` | `--ink-soft` | Secondary text (lede, labels) |
| 🟤 `#786450` | `--ink-faint` | Tertiary/fine text |
| 🟡 `#fdf6ec` | `--paper` | Warm ivory/cream ground |
| ⚪ `#fffdf9` | `--paper-raised` | Cards, topbar, tabbar |
| 🟨 `#f6e9d7` | `--paper-sunken` | Composer, inset surfaces |
| 🟠 `#ff8a65` | `--sunrise-coral` | Signature gradient, start stop |
| 🟡 `#ffc453` | `--sunrise-amber` | Signature gradient, end stop |
| 🟠 `#ff9d52` | `--brass` | Solid CTA / badge fill |
| 🟤 `#8a4416` | `--brass-ink` | Text/icon on light tint (contrast-safe) |
| 🟢 `#2bb3a3` | `--accent-teal` | Secondary accent — badges, backgrounds |
| 🟢 `#0e6a5f` | `--accent-violet` | Deep teal ink — secondary-button text/border |
| 🔴 `#b8362a` | `--warning` | Errors, cancel actions |
| 🟢 `#217a4c` | `--positive` | Success, credits |

**Dark theme (coherent, still-warm variant)**
| Swatch | Hex | Role |
|---|---|---|
| 🟡 `#f5ece1` | `--ink` | Primary text |
| 🟫 `#241a13` | `--paper` | Deep warm espresso ground (not cold navy) |
| 🟫 `#2f231a` | `--paper-raised` | Cards, topbar, tabbar |
| 🟠 `#ff9d76` / `#ffd27a` | `--sunrise-coral` / `--sunrise-amber` | Signature gradient, brightened for dark |
| 🟢 `#4fd9c8` | `--accent-teal` | Secondary accent, brightened for dark |

## Motion & animation

- **Aurora blobs** — soft, slow-drifting blurred gradient-mesh shapes (`::before`/`::after`, `filter: blur()`, `transform`/`opacity`-only keyframes) behind the Home and Onboarding heroes. Compositor-only, no layout properties touched.
- **Pulsing sunrise orb** — the onboarding chart-reveal `.sun-glyph` (now the sunrise gradient, with a teal+coral "aurora" orbit ring) plus a smaller `.hero-orb` reprising the same motif on Home. Replaces the sheet's earlier moon icon on the Daily Reading screen too (`icon.sun` swapped in for `icon.moon`).
- **Scroll-reveal cards** — `scripts/effects/bloom.js`'s `initScrollReveal()` fades/slides in `[data-reveal]` cards via `IntersectionObserver` on Wallet, Subscription and Products; one-shot (unobserves after reveal), falls back to instantly-visible with no observer or under reduced motion.
- **Magnetic hover** — `initMagneticCTAs()` in the same module: a subtle pointer-following nudge on every `.btn-primary`, delegated at the document level, skipped entirely on coarse/touch pointers and under reduced motion.
- **Card accent + shadow** — every card gets `box-shadow: var(--shadow-sm)` plus a thin gradient top-border (`var(--card-accent, var(--gradient-sunrise))`); the onboarding reveal card overrides `--card-accent` per the sun sign's classical element (fire/earth/air/water) rather than glass-morphism.
- **Route transitions** — `replayViewTransition()` (called from `app.js` on every route mount) replays a fade + slight-slide `.view-transition` class on `#appMain`/`#onboardShell`.
- All of the above respect `prefers-reduced-motion: reduce` — the CSS-driven effects via the existing global rule that zeroes every animation/transition duration, the JS-driven ones (scroll-reveal timing, magnetic hover) via an explicit `matchMedia` check.

## Files touched

- `styles/app.css` — full token retint (light + dark), Fraunces swap, card accent/shadow system, blob keyframes, scroll-reveal and route-transition CSS, magnetic-hover CSS variables, retinted balance-hero/card-glyph/product-art/phone-frame decorative gradients.
- `scripts/effects/bloom.js` — **new**. `initScrollReveal`, `initMagneticCTAs`, `replayViewTransition`.
- `scripts/app.js` — wires `initMagneticCTAs()` at boot and `replayViewTransition()` into every route mount.
- `scripts/views/home.js` — adds the `.hero-orb` motif.
- `scripts/views/onboarding.js` — per-element `--card-accent` on the chart-reveal card.
- `scripts/views/wallet.js`, `scripts/views/subscription.js`, `scripts/views/products.js` — `data-reveal` on cards + scroll-reveal wiring (combined into each view's existing cleanup function).
- `index.html` — Fraunces font link, retinted `theme-color` meta.
- `manifest.webmanifest` — retinted `background_color`/`theme_color` to match (install splash / task-switcher chrome).

# SiteReviveSA demos

Concept websites by [SiteReviveSA](https://siterevivesa.com), one folder per demo, plain HTML and CSS with a little JavaScript where a demo needs it. Every business here is fictional: invented names, placeholder graphics, sample prices and hours. They exist to show what a rebuild can look like; nothing on them is a real offer.

| Demo | What it shows | Live |
|---|---|---|
| `stofpad-biltong/` | A bilingual roadside biltong shop with a phone admin: catalogue by weight and pack, an order that opens in WhatsApp, products, prices, stock, specials and hours edited on the phone (React, Vite build; rebuilt 28 Sep 2026) | [stofpad-biltong-demo](https://stofpad-biltong-demo.revivewebsitedev.workers.dev/) (the earlier static version until redeployed) |
| `copperkloof-plumbing/` | A plumber's website with a phone admin: add a job photo on the phone and it shows on the site at once; nothing leaves the visitor's browser (React, Vite build) | not deployed |
| `greenhearth-home/` | A home-services company: cleaning and garden pages, enquiry form | not deployed |
| `petal-polish-nails/` | A nail and beauty studio, one page | not deployed |
| `brackenridge-horse-trails/` | Horse trails, one page | not deployed |
| `fernridge-outdoor-park/` | An outdoor park, one page | not deployed |
| `fernway-garden-studio/` | A garden studio, one page | not deployed |
| `sweet-crown-bakery/` | A bakery, one page | not deployed |
| `willowdam-lifestyle-farm/` | A lifestyle farm, one page | not deployed |

`_shared/polish.css` and `polish.js` are the interaction layer a demo can load: reveal on scroll, cursor glow, magnetic buttons, a scrolled header, a menu toggle. Reduced motion respected, no network calls, nothing stored.

## Run one locally

A demo is static, but its modules need a server rather than `file://`:

```bash
cd fernway-garden-studio && python3 -m http.server 4190 --bind 127.0.0.1
```

Then open http://127.0.0.1:4190/. The React demos (`copperkloof-plumbing/`, `stofpad-biltong/`) build with Vite instead: run `npm install` once in this folder (an npm workspace with the code they share in `_core/`), then `npm run dev` in the demo's folder. Deploying one is `npx wrangler deploy` in its folder (a Cloudflare account, logged in with `wrangler login`).

## Rights

© Waldo Trytsman trading as Code Waldo. Published to be looked at. No licence is granted to copy, reuse or adapt the code, designs or copy; ask first.

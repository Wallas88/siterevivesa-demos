# Stofpad Biltong — shop demo with a phone admin

A fictional roadside biltong shop in English and Afrikaans: catalogue by weight and by pack, an order that opens in WhatsApp, and the owner's phone admin (products, prices, out of stock, specials and events, opening hours).
Status: rebuilt in TypeScript and React on 28 Sep 2026 with the static demo's look; deployed as `stofpad-biltong-demo` from its earlier static version (redeploy is Waldo's).
Made for SiteReviveSA as a product-shop sales demo; every business detail is invented.

The one demo allowed to contact anyone (DEVELOPMENT.md, Waldo, 21 Sep 2026): the order button is a real WhatsApp link to SiteReviveSA's own number, with the message labelled as a demo order. Its wording is unchanged from the static demo, checked character for character against the old outputs (`tests/order-message.test.ts`, `tests/fixtures/order-messages.json`). Courier: R110, label and charge alike (Waldo, 28 Sep 2026; the static demo said R175 but charged R165).

Everything the owner changes stays in the visitor's own browser (IndexedDB); the admin sits behind a mock of the real sign-in with "What's different in your real site" under it. The order itself is not saved, as before.

## Run it

Node 24. Install once at `demos/` (an npm workspace with `_core` and Copperkloof), then in this folder:

```bash
npm run dev                          # http://localhost:5173 — ?view=admin opens the admin on a phone
npm run build && npm run preview     # the built site, with the production security headers
```

## Checks

| Script | What it proves |
|---|---|
| `npm run check` | format, lint, the code check, unit tests (including the order-message equality test), typecheck and build |
| `npm run ux-check` | the seven enforced UX principles at 360 and 1440, measured per page section like every demo |
| `npm run flow-check` | Nothing hops at 360×640, 360×780, 768, 1024, 1440 and 1900, and the eases sampled |
| `npm run sandbox-check` | sign-in; a product added with a real photo; out of stock; a price reaching the WhatsApp link; R110; Afrikaans; specials and hours; reload and Reset; no request off the page's origin; blocked storage |
| `npm run verify` | all of the above |

## Deploy

`npm run deploy` (Waldo runs it): refuses unless committed, on `main` and pushed, then installs from the lock file, runs `npm run check` and deploys `dist/` as `stofpad-biltong-demo`. The CSP adds `blob:` to `img-src` (the owner's photos) and sets `connect-src 'none'`; the WhatsApp order is a link the visitor opens, which the CSP does not govern.

## Where to edit

| To change | Edit |
|---|---|
| Products, prices, categories, weights, courier charge, WhatsApp number | `src/content/catalogue.ts` |
| Every word on the shop, English and Afrikaans | `src/content/i18n.ts` |
| Admin, sign-in, hours and specials words, English and Afrikaans | `src/content/words.ts`, `src/content/admin-words.ts` |
| Title and description per language | `src/content/seo.ts` (English also in `index.html`) |
| Sample specials and example hours (what Reset brings back) | `src/content/seed.ts` |
| The WhatsApp message's wording | `src/features/order/order-message.ts` (the fixture test will fail on any change: update the fixture only on purpose) |
| Order rules (merging, the 99 limit, out of stock) | `src/features/order/order.ts`, `order-lines.ts` |
| Product rules (checks, limits, pack sizes) | `src/features/catalogue/products.ts` |
| Rail dragging and snapping | `src/features/rail/` |
| Header scroll and menu sheet | `src/features/header/` |
| Error codes and their words | `shared/error-codes.ts` |
| Colours and type | `src/styles/tokens.css` |
| Security headers | `public/_headers` and `vite.config.ts` (kept identical by a test) |
| What the browser checks open and measure | `scripts/check-setup.ts` |

## Style map

| Section | Component | Stylesheet | Root class |
|---|---|---|---|
| Header and phone menu | `src/components/ShopHeader.tsx`, `LanguageSwitch.tsx` | `src/styles/shop.css` | `.shop-header`, `.shop-nav` |
| Hero and the glowing mark | `src/components/Hero.tsx`, `StofpadMark.tsx` | `src/styles/shop.css` | `.hero` |
| Specials rail | `src/components/SpecialsSection.tsx`, `CardRail.tsx` | `src/styles/shop.css` | `.specials`, `.special-card` |
| Catalogue and product cards | `src/components/CatalogueSection.tsx`, `ProductCard.tsx` | `src/styles/shop.css` | `.catalogue`, `.product` |
| Order | `src/components/OrderSection.tsx`, `OrderLines.tsx`, `OrderSummary.tsx`, `MessageFold.tsx`, `QuantityField.tsx` | `src/styles/shop-order.css` | `.order-section`, `.order-panel` |
| How to order | `src/components/HowSection.tsx` | `src/styles/shop.css` | `.how` |
| Opening hours | `src/components/ShopHours.tsx` | `src/styles/shop.css` | `.hours-section` |
| Footer and toast | `src/components/ShopFooter.tsx`, `Toast.tsx` | `src/styles/shop.css` | `.shop-footer`, `.toast` |
| Admin: add a product | `src/components/ProductForm.tsx`, `PricingFields.tsx` | `src/styles/admin.css` | `.product-form` |
| Admin: products, prices, stock | `src/components/ProductList.tsx`, `ProductRow.tsx`, `PriceInput.tsx` | `src/styles/admin.css` | `.product-row` |
| Admin frame, sign-in, specials, hours | `../_core/` (shared) | `../_core/styles/admin.css` | `.admin`, `.sign-in` |

## Rights

© Waldo Trytsman trading as Code Waldo. Published to be looked at. No licence is granted to copy, reuse or adapt the code, designs or copy; ask first.

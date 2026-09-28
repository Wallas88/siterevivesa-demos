# Copperkloof Plumbing — phone admin demo

A fictional plumber's website with its own phone admin: add a job photo on the phone and it is on the website straight away. The admin holds the business's own content only: services and prices, specials and events, opening hours and job photos.
Status: built, not deployed (would deploy as `copperkloof-plumbing-demo`).
Made for SiteReviveSA as a reusable sales demo; every business detail is invented.

The admin sits behind a mock of the real sign-in (Cloudflare Access: email, then a one-time code, no password). The email is a fixed demo address and the code is shown on screen; nothing is collected or sent. Under the sign-in, "What's different in your real site" lists each difference from the real version and why it keeps the owner safe. Signed in lasts for the browser tab only (sessionStorage). The website stays public.

Everything a visitor does stays in their own browser. There is no server, no upload and no network call: photos are shrunk on the device and kept in IndexedDB, so each visitor sees only their own changes. If the browser refuses storage (some private windows), the demo keeps working for that tab and says so.

## Run it

Node 24 (`.nvmrc`). Install once at `demos/` (an npm workspace with `_core` and Stofpad), then in this folder:

```bash
npm run dev                  # http://localhost:5173 — add ?view=admin to open the admin on a phone
npm run build && npm run preview   # the built site, with the production security headers
```

## Checks

| Script | What it proves |
|---|---|
| `npm run check` | format, lint, the code check (function length, nesting, empty catch, no arrow functions, no storage in components), unit tests, typecheck and build |
| `npm run ux-check` | the seven enforced UX principles at 360 and 1440 |
| `npm run flow-check` | Nothing hops: a touch tap-through at 360×640 and 360×780, then 768, 1024, 1440 and 1900, and the eases sampled |
| `npm run sandbox-check` | the mock sign-in (demo email, fresh code, wrong code refused, right code in, tab-only, Sign out); specials and hours edits showing on the site (an ended special refused); a real image added on the phone shows on the website, survives a reload, Reset restores the seed, nothing leaves the page, and blocked storage falls back with a notice |
| `npm run verify` | all of the above |

The flow-check taps every control once (a control re-created in the same place with the same words counts as the same one, Sign out last) and prints how many it tapped; it fails if it runs out of taps. The flow-check and ux-check open three pages: the website, the admin's sign-in, and the admin signed in. The browser checks need a build first and `CHROME_PATH` pointing at Chrome or Chromium.

## Deploy

`npm run deploy` (Waldo runs it): refuses unless the code is committed, on `main` and pushed, then installs from the lock file, runs `npm run check` and deploys `dist/` as the `copperkloof-plumbing-demo` Worker. `public/_headers` ships inside the build; its CSP adds only `blob:` to `img-src` (the visitor's own photos) and sets `connect-src 'none'`. Check after a deploy:

```
curl -sI https://copperkloof-plumbing-demo.revivewebsitedev.workers.dev/ | grep -i "content-security-policy\|x-frame-options\|x-robots-tag"
```

## Where to edit

| To change | Edit |
|---|---|
| Business name, words, areas, services, demo notice, sign-in key | `src/content/business.ts` |
| Words passed to the shared parts (sign-in and its differences list, hours, specials, Reset, admin bar, photo picker) | `src/content/words.ts` |
| Sample jobs, example prices, hours and specials (what Reset brings back) | `src/content/seed.ts` and the drawings in `public/images/jobs/` |
| Brand colours and type | `src/styles/tokens.css` |
| Job rules (limit, lengths, order, featuring) | `src/features/jobs/jobs.ts` |
| Price list rules and how rand is shown | `src/features/prices/price-list.ts` |
| What is saved and how it is checked | `src/features/storage/saved-demo.ts` |
| What each job and price button does | `src/features/demo/demo-actions.ts` |
| Error codes and their messages | `shared/error-codes.ts` (the shared core's codes plus Copperkloof's) |
| Security headers | `public/_headers` and `vite.config.ts` (kept identical by a test) |
| What the browser checks open and measure | `scripts/check-setup.ts` |
| Anything shared with Stofpad (store, photos, sign-in, hours, specials, lists, shell, checks) | `../_core/` — see its README |

## Style map

| Section | Component | Stylesheet | Root class |
|---|---|---|---|
| Website / Admin switch and panes | `../_core/shell/DemoShell.tsx`, `../_core/view/ViewSwitch.tsx` | `../_core/styles/shell.css` | `.demo-shell`, `.view-switch` |
| Website header and hero | `src/components/SiteView.tsx` | `src/styles/site.css` | `.site-header`, `.site-hero` |
| What we do | `src/components/ServiceList.tsx` | `src/styles/site.css` | `.service-grid` |
| Specials and events (website) | `src/components/SpecialsSection.tsx` | `src/styles/site.css` | `.special-grid` |
| Recent jobs | `src/components/JobGallery.tsx` | `src/styles/site.css` | `.job-gallery` |
| Opening hours (website) | `src/components/HoursSection.tsx` | `src/styles/site.css` | `.hours-list` |
| Ask for a quote | `src/components/EnquiryForm.tsx` | `src/styles/site.css` | `.enquiry-form` |
| Admin frame, sign-in, specials, hours | `src/components/AdminPanel.tsx` and `../_core/` | `../_core/styles/admin.css` | `.admin`, `.sign-in` |
| Add a job | `src/components/JobForm.tsx` | `src/styles/admin.css` | `.job-form` |
| Your jobs | `src/components/JobList.tsx`, `JobSlot.tsx` | `src/styles/admin.css` | `.job-row`, `.job-actions` |
| Example prices | `src/components/PriceEditor.tsx`, `PriceRow.tsx` | `src/styles/admin.css` | `.price-list`, `.price-row` |
| Buttons and fields | `../_core/controls/` | `../_core/styles/controls.css` | `.button`, `.field` |

## Rights

© Waldo Trytsman trading as Code Waldo. Published to be looked at. No licence is granted to copy, reuse or adapt the code, designs or copy; ask first.

# SiteReviveSA demos

Fictional concept sites, one folder per demo, static HTML (some with `.mjs` modules). `_shared/polish.css` + `polish.js` is the interaction layer every demo can load: `[data-reveal]`, `[data-glow]`, `[data-magnet]`, `.site-header.is-scrolled`, `[data-nav-toggle]`. It respects reduced motion, makes no network calls and stores nothing.

## Deploy

Each demo is its own Worker, `<name>-demo`, from a `wrangler.jsonc` in its folder (`assets.directory: "./"`, schema via `../../site/node_modules`). No `account_id` in the file: wrangler deploys to the account you are logged in to. This repo is public. Only demos with a `wrangler.jsonc` are deployed; the rest are exported and not yet polished or live — their README says which. Production: `cd <demo> && npx wrangler deploy`, Waldo runs it. Preview link: `npx wrangler versions upload`. Never `wrangler pages`.

**A demo is hosted safe and secure or not at all (Waldo, 22 Sep 2026).** Before a demo's first deploy, copy `_shared/_headers.template` into its folder as `_headers` and widen the CSP only for what that demo actually loads (`greenhearth-home` allows Google Fonts; `stofpad-biltong` needs nothing extra). Every demo also carries a `noindex` meta tag and the `X-Robots-Tag: noindex, nofollow` header from that file: a demo business must never appear in a search result. Check after deploying:

```
curl -sI https://<name>-demo.revivewebsitedev.workers.dev/ | grep -i "content-security-policy\|x-frame-options\|x-robots-tag"
```


## Rules

- Fictional-first, always: an invented name, web-searched first (one earlier pick turned out to be a real shop), placeholder or licensed graphics, original copy, no reviews, no real address/phone/map/social/booking links, forms that send nothing, prices and hours labelled as examples, and on every page verbatim: "Demo website by SiteReviveSA. Branding, imagery and service details are illustrative."
- One exception, decided by Waldo on 21 September 2026: the Stofpad Biltong order button is a real WhatsApp link to SiteReviveSA's own number (`settings.whatsapp` in its catalogue), with the message labelled as a demo order, so a visitor sees the whole flow work. No other demo contacts anyone.
- Nothing about a real business goes in this repo — not in a page, not in a README. A concept for a business that said yes (B2B exception or written consent) is not a demo; it lives outside this repo as a private link. Rules: `../compliance/runbooks/client-concepts-and-outreach.md`; order of operations: `working-with-clients.md`.
- Each demo has a three-line README: what it is, status (exported / polished / deployed as `<name>-demo`), where it came from.
- `images/` holds web-sized files only. Masters and source photos are not kept here.
- A demo can be shown on siterevivesa.com as-is; that is what these are for.

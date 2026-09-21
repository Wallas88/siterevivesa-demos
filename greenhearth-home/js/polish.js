/* SiteReviveSA demo polish layer — shared by every concept demo.
   Adds the studio's current interaction standard without touching a demo's
   own palette, type or layout:
     [data-reveal]        fade/rise in once when scrolled into view
     [data-glow]          soft highlight that follows the pointer (cards)
     [data-magnet]        primary CTA nudges toward the pointer
     .site-header         gets .is-scrolled after 24px of scroll
     [data-nav-toggle]    opens/closes [data-nav] on small screens
   Everything respects prefers-reduced-motion. No network, no storage. */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Reveal on scroll — elements start visible if IO is missing or motion is reduced.
  const revealers = document.querySelectorAll('[data-reveal]')
  if (reduce || !('IntersectionObserver' in window)) {
    revealers.forEach((el) => el.classList.add('is-visible'))
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target) } })
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 })
    revealers.forEach((el) => io.observe(el))
  }

  // Cursor glow — writes CSS variables the stylesheet reads in a ::before gradient.
  if (!reduce) {
    document.querySelectorAll('[data-glow]').forEach((el) => {
      el.addEventListener('pointermove', (ev) => {
        const r = el.getBoundingClientRect()
        el.style.setProperty('--glow-x', `${((ev.clientX - r.left) / r.width) * 100}%`)
        el.style.setProperty('--glow-y', `${((ev.clientY - r.top) / r.height) * 100}%`)
      })
    })
  }

  // Magnetic CTA — small translate toward the pointer, reset on leave.
  if (!reduce) {
    document.querySelectorAll('[data-magnet]').forEach((el) => {
      const strength = parseFloat(el.dataset.magnet) || 0.22
      el.addEventListener('pointermove', (ev) => {
        const r = el.getBoundingClientRect()
        const dx = ev.clientX - (r.left + r.width / 2)
        const dy = ev.clientY - (r.top + r.height / 2)
        el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`
      })
      el.addEventListener('pointerleave', () => { el.style.transform = '' })
    })
  }

  // Header scrolled state.
  const header = document.querySelector('.site-header')
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24)
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true })
  }

  // Mobile nav.
  const toggle = document.querySelector('[data-nav-toggle]')
  const nav = document.querySelector('[data-nav]')
  if (toggle && nav) {
    const set = (open) => { toggle.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open); document.body.classList.toggle('nav-open', open) }
    toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'))
    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => set(false)))
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false) })
  }
})()

/* Palette switch — a round button in the nav cycles the demo's colour
   palettes (defined per demo as :root[data-palette="…"] token overrides).
   Layout never changes, only tokens. Nothing is stored: a visitor's choice
   lives for the page view only, per the demo rules. */
(() => {
  const btn = document.querySelector('[data-theme-toggle]')
  if (!btn) return
  const palettes = (btn.dataset.palettes || '').split(',').map((s) => s.trim()).filter(Boolean)
  if (palettes.length < 2) return
  const root = document.documentElement
  let i = Math.max(0, palettes.indexOf(root.dataset.palette || palettes[0]))
  const paint = () => {
    const next = palettes[(i + 1) % palettes.length]
    // Read the next palette's accent by probing a hidden element.
    const probe = document.createElement('span')
    probe.setAttribute('data-palette-probe', next)
    probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none'
    document.body.appendChild(probe)
    const accent = getComputedStyle(probe).getPropertyValue('--accent').trim() || getComputedStyle(root).getPropertyValue('--accent').trim()
    probe.remove()
    btn.style.setProperty('--swatch', accent)
    btn.setAttribute('aria-label', `Change colour theme (next: ${next})`)
    btn.title = `Colour theme: ${palettes[i]} — click for ${next}`
  }
  btn.addEventListener('click', () => {
    i = (i + 1) % palettes.length
    root.dataset.palette = palettes[i]
    root.classList.add('is-repainting')
    setTimeout(() => root.classList.remove('is-repainting'), 500)
    paint()
  })
  root.dataset.palette = palettes[i]
  paint()
})()

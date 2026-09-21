// Header behaviour: the menu button (phone widths), closing the menu on a
// link tap, outside click, Escape or focus leaving the header, and the
// compact header on scroll. The layout never rearranges on scroll; CSS owns
// which controls show at which width (style.css, header rules).
const SCROLLED_AFTER_PX = 8;
const header = document.querySelector('header');
const nav = header.querySelector('nav');
const toggle = document.createElement('button');
toggle.className = 'menu-toggle';
toggle.type = 'button';
toggle.innerHTML = '<span aria-hidden="true">☰</span>';
toggle.setAttribute('aria-controls', nav.id);
header.append(toggle);

function labelToggle() {
  const af = document.documentElement.lang === 'af';
  const open = header.classList.contains('menu-open');
  toggle.setAttribute('aria-label', open ? (af ? 'Sluit kieslys' : 'Close menu') : (af ? 'Maak kieslys oop' : 'Open menu'));
}

function closeMenu(returnFocus = false) {
  header.classList.remove('menu-open');
  toggle.setAttribute('aria-expanded', 'false');
  labelToggle();
  if (returnFocus) toggle.focus();
}

function openMenu() {
  header.classList.add('menu-open');
  toggle.setAttribute('aria-expanded', 'true');
  labelToggle();
}

function toggleMenu() {
  if (header.classList.contains('menu-open')) closeMenu();
  else openMenu();
}

function closeOnLinkTap(event) {
  if (event.target.closest('a[href]')) closeMenu();
}

function closeOnOutsideClick(event) {
  if (!header.contains(event.target)) closeMenu();
}

function closeOnEscape(event) {
  if (event.key === 'Escape' && header.classList.contains('menu-open')) closeMenu(true);
}

function closeWhenFocusLeaves(event) {
  if (!header.contains(event.relatedTarget)) closeMenu();
}

function updateScrollState() {
  header.classList.toggle('is-scrolled', window.scrollY > SCROLLED_AFTER_PX);
}

function publishHeaderHeight() {
  document.documentElement.style.setProperty('--header-height', `${header.getBoundingClientRect().height}px`);
}

toggle.addEventListener('click', toggleMenu);
nav.addEventListener('click', closeOnLinkTap);
document.addEventListener('click', closeOnOutsideClick);
document.addEventListener('keydown', closeOnEscape);
header.addEventListener('focusout', closeWhenFocusLeaves);
window.addEventListener('scroll', updateScrollState, { passive: true });
window.addEventListener('pageshow', updateScrollState);
new MutationObserver(labelToggle).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
new ResizeObserver(publishHeaderHeight).observe(header);
closeMenu();
updateScrollState();

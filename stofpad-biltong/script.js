import { products, categories, weights, settings, specials } from './catalogue.mjs';
import { updateMetadata } from './seo.mjs';
import { translations } from './i18n.mjs';
import { money, weight, linePrice, addLine, totals, orderMessage, productFor } from './order.mjs';

const $ = selector => document.querySelector(selector);
let language = 'en';
try { if (localStorage.getItem('stofpad-language') === 'af') language = 'af'; } catch { /* Storage is optional. */ }
let category = 'all';
const lines = [];
const selections = new Map(products.map(product => [product.id, {
  id: product.id, grams: product.packs ? 5000 : 250, option: product.options[0] ?? '', quantity: 1,
}]));
const t = key => translations[language][key];
// Interpolated content comes from our local catalogue, never user input.
function renderProducts() {
  $('#filters').innerHTML = Object.entries(categories).map(([id, label]) => `<button type="button" data-category="${id}" aria-pressed="${id === category}" aria-controls="product-list">${label[language]}</button>`).join('');
  const visible = products.filter(product => category === 'all' || product.category === category);
  $('#product-count').textContent = `${visible.length} ${t('allCount')}`;
  $('#product-list').innerHTML = visible.map(product => {
    const selection = selections.get(product.id);
    return `<article class="product" data-id="${product.id}">
      <img src="${product.image}" alt="${product.name[language]}" width="480" height="360" loading="lazy" decoding="async">
      <div class="product-body"><p class="eyebrow">${categories[product.category][language]}</p>
        <h3>${product.name[language]}</h3><p class="product-description">${product.description[language]}</p>
        ${product.pricePerKg === null ? '' : `<p class="rate">${money(product.pricePerKg)} / kg</p>`}
        <label for="size-${product.id}">${t('size')}</label>
        <select id="size-${product.id}" data-selection="grams">${(product.packs ?? weights.map(grams => ({ grams }))).map(pack => `<option value="${pack.grams}" ${selection.grams === pack.grams ? 'selected' : ''}>${weight(pack.grams)}${product.packs ? ` — ${pack.cents === null ? t('pending') : money(pack.cents)}` : ''}</option>`).join('')}</select>
        ${product.options.length ? `<label for="option-${product.id}">${t('preparation')}</label><select id="option-${product.id}" data-selection="option">${product.options.map(option => `<option ${selection.option === option ? 'selected' : ''}>${option}</option>`).join('')}</select>` : ''}
        <div class="product-bottom"><p class="product-price" aria-live="polite">${priceText(selection)}</p><button class="button" type="button" data-add>${t('add')}</button></div>
      </div></article>`;
  }).join('');
}
function priceText(selection) {
  const cents = linePrice(selection);
  return cents === null ? t('pending') : `${t('estimate')}: ${money(cents)}`;
}
function renderOrder(focusIndex = null) {
  $('#order-lines').innerHTML = lines.length ? lines.map((line, index) => {
    const product = productFor(line);
    const price = linePrice(line);
    return `<article class="order-line"><div><h3>${product.name[language]}</h3><p>${weight(line.grams)}${line.option ? ` · ${line.option}` : ''}</p><strong>${price === null ? t('pending') : money(price)}</strong></div>
      <div class="line-controls"><label for="quantity-${index}">${t('quantity')}</label><input id="quantity-${index}" data-quantity="${index}" type="number" min="1" max="99" step="1" value="${line.quantity}" aria-label="${t('quantity')}: ${product.name[language]}, ${weight(line.grams)} ${line.option}"><button type="button" data-remove="${index}" aria-label="${t('remove')}: ${product.name[language]}, ${weight(line.grams)} ${line.option}">${t('remove')}</button></div></article>`;
  }).join('') : `<p class="empty-order">${t('empty')}</p>`;
  updateOrderSummary();
  if (focusIndex !== null) {
    const target = $(`[data-remove="${Math.min(focusIndex, lines.length - 1)}"]`);
    if (target) target.focus();
    else { $('#order-heading').tabIndex = -1; $('#order-heading').focus(); }
  }
}
function updateOrderSummary() {
  $('#order-count').textContent = lines.reduce((sum, line) => sum + line.quantity, 0);
  $('#order-summary').hidden = !lines.length;
  if (!lines.length) $('#courier').checked = false;
  const courier = $('#courier').checked;
  const summary = totals(lines, courier);
  $('#total-label').textContent = t(summary.pending ? 'known' : 'total');
  $('#total').textContent = money(summary.cents);
  $('#pending-note').hidden = !summary.pending;
  const message = orderMessage(lines, courier, language);
  $('#message').textContent = message;
  const link = $('#whatsapp-order');
  // A real WhatsApp link (Waldo, 21 Sep 2026): opens a chat to SiteReviveSA's
  // own number with the order prefilled, so a visitor sees the whole flow
  // work. Nothing is sent until they press Send in WhatsApp.
  link.href = whatsappLink(message);
  link.target = '_blank';
  link.rel = 'noreferrer';
}

function whatsappLink(message) {
  return `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(message)}`;
}
function translate() {
  document.documentElement.lang = language;
  updateMetadata(language);
  document.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = t(element.dataset.i18n); });
  document.querySelectorAll('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
  $('nav').setAttribute('aria-label', t('nav'));
  $('#filters').setAttribute('aria-label', t('filter'));
  $('#status').textContent = '';
  $('#special-list').innerHTML = specials.map(special => {
    const message = `${t('specialMessage')} ${special[language]}. ${t('specialConfirm')}`;
    return `<article class="special-card"><p class="eyebrow">${t('specialBadge')}</p><h3>${special[language]}</h3><p class="small-note">${t('pending')}</p><a href="#order" class="button-link">${t('specialEnquire')}</a></article>`;
  }).join('');
  renderProducts();
  renderOrder();
}
$('#filters').addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  category = button.dataset.category;
  renderProducts();
  $(`[data-category="${category}"]`).focus();
  $('#product-list').scrollLeft = 0;
});
$('#product-list').addEventListener('change', event => {
  const control = event.target.closest('[data-selection]');
  if (!control) return;
  const card = control.closest('[data-id]');
  const selection = selections.get(card.dataset.id);
  selection[control.dataset.selection] = control.dataset.selection === 'grams' ? Number(control.value) : control.value;
  card.querySelector('.product-price').textContent = priceText(selection);
});
let statusTimer;
$('#product-list').addEventListener('click', event => {
  const button = event.target.closest('[data-add]');
  if (!button) return;
  const selection = selections.get(button.closest('[data-id]').dataset.id);
  const added = addLine(lines, selection);
  renderOrder();
  $('#status').textContent = t(added ? 'added' : 'limit');
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => { $('#status').textContent = ''; }, 3500);
});
$('#order-lines').addEventListener('click', event => {
  const button = event.target.closest('[data-remove]');
  if (!button) return;
  const index = Number(button.dataset.remove);
  lines.splice(index, 1);
  renderOrder(index);
});
$('#order-lines').addEventListener('change', event => {
  const input = event.target.closest('[data-quantity]');
  if (!input) return;
  const index = Number(input.dataset.quantity);
  if (input.validity.valid && Number.isInteger(input.valueAsNumber)) lines[index].quantity = input.valueAsNumber;
  input.value = lines[index].quantity;
  const price = linePrice(lines[index]);
  input.closest('.order-line').querySelector('strong').textContent = price === null ? t('pending') : money(price);
  updateOrderSummary();
});
$('#courier').addEventListener('change', updateOrderSummary);
$('.language-switch').addEventListener('click', event => {
  const button = event.target.closest('[data-language]');
  if (!button) return;
  language = button.dataset.language;
  try { localStorage.setItem('stofpad-language', language); } catch { /* Storage is optional. */ }
  translate();
});
// Touch uses native scrolling; mouse dragging starts only after a deliberate move.
function enableCardDragging(rail, railName) {
let drag = null;
let suppressClick = false;
const cardStep = () => {
  const card = rail.firstElementChild;
  return card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).gap) : 0;
};
const scrollMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
const controls = document.createElement('div');
controls.className = 'rail-controls';
controls.innerHTML = '<button type="button" data-direction="-1">←</button><button type="button" data-direction="1">→</button>';
rail.after(controls);
const [previous, next] = controls.querySelectorAll('button');
function updateControls() {
  const af = document.documentElement.lang === 'af';
  previous.setAttribute('aria-label', `${af ? 'Vorige' : 'Previous'} ${railName[af ? 'af' : 'en']}`);
  next.setAttribute('aria-label', `${af ? 'Volgende' : 'Next'} ${railName[af ? 'af' : 'en']}`);
  previous.disabled = rail.scrollLeft <= 2;
  next.disabled = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2;
}
for (const button of [previous, next]) {
  button.setAttribute('aria-controls', rail.id);
  button.addEventListener('click', () => rail.scrollBy({left: Number(button.dataset.direction) * cardStep(), behavior: scrollMotion()}));
}
rail.addEventListener('scroll', updateControls, {passive:true});
new ResizeObserver(updateControls).observe(rail);
new MutationObserver(updateControls).observe(rail, {childList:true});
new MutationObserver(updateControls).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
updateControls();
rail.addEventListener('keydown', event => {
  if (event.target !== rail || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  rail.scrollBy({ left: cardStep() * (event.key === 'ArrowRight' ? 1 : -1), behavior: scrollMotion() });
});
rail.addEventListener('dragstart', event => event.preventDefault());
rail.addEventListener('pointerdown', event => {
  suppressClick = false;
  if (event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('select, input, textarea, label')) return;
  drag = { id: event.pointerId, x: event.clientX, scroll: rail.scrollLeft, moved: false };
});
rail.addEventListener('pointermove', event => {
  if (!drag || drag.id !== event.pointerId) return;
  const distance = event.clientX - drag.x;
  if (!drag.moved && Math.abs(distance) < 6) return;
  if (!drag.moved) {
    drag.moved = true;
    rail.classList.add('is-dragging');
    rail.setPointerCapture(event.pointerId);
  }
  event.preventDefault();
  rail.scrollLeft = drag.scroll - distance;
});
function endDrag(event) {
  if (!drag || drag.id !== event.pointerId) return;
  const moved = drag.moved;
  drag = null;
  suppressClick = moved;
  rail.classList.remove('is-dragging');
  if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
  if (moved && cardStep()) {
    const end = rail.scrollWidth - rail.clientWidth;
    const destination = rail.scrollLeft >= end - 2 ? end : Math.round(rail.scrollLeft / cardStep()) * cardStep();
    rail.scrollTo({ left: destination, behavior: scrollMotion() });
  }
}
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => rail.addEventListener(type, endDrag));
rail.addEventListener('pointerleave', event => { if (drag && !drag.moved) endDrag(event); });
rail.addEventListener('click', event => {
  if (!suppressClick || event.detail === 0) return;
  suppressClick = false;
  event.preventDefault();
  event.stopImmediatePropagation();
}, true);
}
enableCardDragging($('#special-list'), { en: 'specials', af: 'aanbiedinge' });
enableCardDragging($('#product-list'), { en: 'products', af: 'produkte' });
translate();


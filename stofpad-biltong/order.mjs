import { products, weights, settings } from './catalogue.mjs';

export const money = cents => `R${(cents / 100).toFixed(2)}`;
export const weight = grams => grams >= 1000 ? `${grams / 1000} kg` : `${grams} g`;
export function productFor(line) {
  const product = products.find(item => item.id === line.id);
  if (!product || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 99) throw new Error('Invalid order quantity');
  if (!(product.packs ? product.packs.some(pack => pack.grams === line.grams) : weights.includes(line.grams))) throw new Error('Invalid weight');
  if (product.options.length ? !product.options.includes(line.option) : line.option !== '') throw new Error('Invalid preparation');
  return product;
}
export function linePrice(line) {
  const product = productFor(line);
  const cents = product.packs ? product.packs.find(pack => pack.grams === line.grams).cents : Math.round(product.pricePerKg * line.grams / 1000);
  return cents === null ? null : cents * line.quantity;
}
const lineKey = line => JSON.stringify([line.id, line.grams, line.option]);
export function addLine(lines, selection) {
  productFor(selection);
  const existing = lines.find(line => lineKey(line) === lineKey(selection));
  if (existing) {
    if (existing.quantity + selection.quantity > 99) return false;
    existing.quantity += selection.quantity;
  } else lines.push({ ...selection });
  return true;
}
export function totals(lines, courier) {
  const prices = lines.map(linePrice);
  return { cents: prices.reduce((sum, price) => sum + (price ?? 0), 0) + (courier && lines.length ? settings.courierCents : 0), pending: prices.includes(null) };
}
export function orderMessage(lines, courier, language) {
  const af = language === 'af';
  const summary = totals(lines, courier);
  const details = lines.map(line => {
    const product = productFor(line);
    const price = linePrice(line);
    return `${line.quantity} × ${weight(line.grams)} ${product.name[language]}${line.option ? ` — ${line.option}` : ''} — ${price === null ? (af ? 'Prys moet bevestig word' : 'Price to be confirmed') : money(price)}`;
  });
  return [af ? 'Hallo Stofpad Biltong (demo), ek wil graag bestel:' : 'Hi Stofpad Biltong (demo), I would like to order:', '', ...details, '',
    courier ? `${af ? 'Koerier (onderhewig aan bevestiging)' : 'Courier (subject to confirmation)'} — ${money(settings.courierCents)}` : (af ? 'Afhaal / reël direk met die winkel' : 'Collection / arrange directly with the shop'),
    `${summary.pending ? (af ? 'Bekende subtotaal' : 'Known subtotal') : (af ? 'Geskatte totaal' : 'Estimated total')}: ${money(summary.cents)}`,
    ...(summary.pending ? [af ? 'Sluit produkte uit waarvan pryse nog bevestig moet word.' : 'Excludes products with prices still to be confirmed.'] : []),
    af ? 'Bevestig asseblief beskikbaarheid, finale gewig, aflewering en betaling.' : 'Please confirm availability, final packed weight, delivery and payment.',
    '',
    af ? 'Gestuur vanaf die Stofpad Biltong-demo op siterevivesa.com.' : 'Sent from the Stofpad Biltong demo on siterevivesa.com.',
  ].join('\n');
}

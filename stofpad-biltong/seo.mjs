// The English metadata is the static HTML's; the Afrikaans set replaces it
// when that language is chosen, and the English is put back on switching.
const english = {
  title: document.title,
  description: document.querySelector('meta[name="description"]').content,
};
const afrikaans = {
  title: 'Stofpad Biltong | Biltong & Droëwors in Klipkraal',
  description: 'Besoek Stofpad Biltong op die R30, net buite Klipkraal. Kies biltong, droëwors en happies in jou voorkeurgewig en reël jou bestelling op WhatsApp.',
};
export function updateMetadata(language) {
  const { title, description } = language === 'af' ? afrikaans : english;
  document.title = title;
  document.querySelector('meta[name="description"]').content = description;
  document.querySelector('meta[property="og:title"]').content = title;
  document.querySelector('meta[property="og:description"]').content = description;
  document.querySelector('meta[property="og:locale"]').content = language === 'af' ? 'af_ZA' : 'en_ZA';
}

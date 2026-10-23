import { heroImage, properties, zones, type Property } from '../data/properties';

/**
 * Slides of the home hero: the original photo first (no listing attached), then listings.
 * TODO: in production the editor picks which listings appear here (Sanity: "Imagens do topo").
 */
const heroListingSlugs = [
  'oliveiras-residence-quarteira',
  't2-vista-mar-forte-novo-quarteira',
  'casuarinas-residences-vilamoura',
];

export function heroSlides() {
  const intro = {
    image: heroImage,
    alt: 'Piscina rodeada de palmeiras, com o campo de golfe ao fundo',
    property: undefined as Property | undefined,
  };
  const withListing = heroListingSlugs
    .map((slug) => properties.find((p) => p.slug === slug))
    .filter((p): p is Property => Boolean(p))
    .map((p) => ({
      image: p.images[0],
      alt: `${p.title}, ${zones[p.zone].name}`,
      property: p as Property | undefined,
    }));
  return [intro, ...withListing];
}

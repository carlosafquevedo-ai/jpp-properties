import { heroImage, properties, zones, type Property } from '../data/properties';
import { homePage, MAX_FEATURED, MAX_HERO_LISTINGS } from '../data/home';

/** Listings that can be shown on the site (sold ones drop out). */
const showable = (list: Property[]) => list.filter((p) => p.availability !== 'sold');

/**
 * The editor's ordered choice of listings. Safety rules: unknown or sold listings are skipped,
 * the list is capped, and if nothing usable is left the newest listings are shown instead,
 * so a section is never empty.
 */
function pick(slugs: string[], max: number, list: Property[] = properties): Property[] {
  const chosen = slugs
    .map((slug) => list.find((p) => p.slug === slug))
    .filter((p): p is Property => Boolean(p))
    .filter((p) => p.availability !== 'sold')
    .slice(0, max);
  if (chosen.length > 0) return chosen;
  return [...showable(list)].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, max);
}

export const featuredProperties = () => pick(homePage.featuredSlugs, MAX_FEATURED);

/**
 * Slides of the home hero: only the chosen listings, each with its card. The generic photo (no listing) is
 * used only as a safety net when none of the chosen listings is available, so the hero is never empty.
 */
export function heroSlides() {
  const withListing = pick(homePage.heroSlugs, MAX_HERO_LISTINGS).map((p) => ({
    image: p.images[0],
    alt: `${p.title}, ${zones[p.zone].name}`,
    property: p as Property | undefined,
  }));
  if (withListing.length) return withListing;
  return [
    {
      image: heroImage,
      alt: 'Piscina rodeada de palmeiras, com o campo de golfe ao fundo',
      property: undefined as Property | undefined,
    },
  ];
}

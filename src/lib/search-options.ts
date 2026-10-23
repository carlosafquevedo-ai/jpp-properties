import { properties, propertyTypeLabels, zones } from '../data/properties';

/**
 * Options for the search fields. Nothing here is typed by hand per option:
 * - zones and property types come from the editable lists (Sanity documents in production),
 *   so a new zone or type appears in every dropdown after the next publish;
 * - bedrooms and the price slider are derived from the published listings.
 */
export interface Option {
  value: string;
  label: string;
}

/**
 * Price slider range, always taken from the listings that are on the site: the slider can
 * never go below the cheapest listing or above the dearest one, and it starts at the exact
 * middle between the two. Listings without a price ("preço sob consulta") are ignored.
 */
export function getPriceRange(list = properties) {
  const prices = list.map((p) => p.price).filter((n) => n > 0);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function getSearchOptions(list = properties) {
  const zoneOptions: Option[] = Object.entries(zones).map(([value, z]) => ({
    value,
    label: z.name,
  }));
  const typeOptions: Option[] = Object.entries(propertyTypeLabels).map(([value, label]) => ({
    value,
    label,
  }));

  const maxBeds = Math.min(Math.max(1, ...list.map((p) => p.bedrooms)), 10);
  const bedroomOptions: Option[] = Array.from({ length: maxBeds }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1} ou mais`,
  }));

  return { zoneOptions, typeOptions, bedroomOptions };
}

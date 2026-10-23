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
 * Price slider range, always taken from the listings that are on the site:
 * the top of the slider is the dearest listing, the bottom the cheapest (rounded down).
 * Listings without a price ("preço sob consulta") are ignored.
 */
export function getPriceRange(list = properties) {
  const prices = list.map((p) => p.price).filter((n) => n > 0);
  const max = Math.max(...prices);
  const min = Math.min(...prices);
  const step =
    max >= 3_000_000 ? 100_000 : max >= 1_000_000 ? 50_000 : max >= 300_000 ? 10_000 : 5_000;
  return { min: Math.floor(min / step) * step, max, step };
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

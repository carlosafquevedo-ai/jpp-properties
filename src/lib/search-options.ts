import { formatPrice, properties, propertyTypeLabels, zones } from '../data/properties';

/**
 * Options for the search fields. Nothing here is typed by hand per option:
 * - zones and property types come from the editable lists (Sanity documents in production),
 *   so a new zone or type appears in every dropdown after the next publish;
 * - bedrooms and price steps are derived from the published listings.
 */
export interface Option {
  value: string;
  label: string;
}

const PRICE_STEPS = [
  100_000, 150_000, 200_000, 250_000, 300_000, 400_000, 500_000, 600_000, 750_000, 1_000_000,
  1_500_000, 2_000_000, 3_000_000, 5_000_000, 7_500_000, 10_000_000,
];

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

  // Price steps up to the first step that covers the dearest listing.
  const maxPrice = Math.max(0, ...list.map((p) => p.price));
  const cover = PRICE_STEPS.findIndex((s) => s >= maxPrice);
  const steps = PRICE_STEPS.slice(0, (cover === -1 ? PRICE_STEPS.length - 1 : cover) + 1);
  const priceOptions: Option[] = steps.map((s) => ({ value: String(s), label: formatPrice(s) }));

  return { zoneOptions, typeOptions, bedroomOptions, priceOptions };
}

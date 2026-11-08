/**
 * PROTOTYPE DATA. The listings are imported from the current public site (jppproperties.com) by
 * scripts/migrate-old-site.py + scripts/build-properties.py (see imported-properties.ts). Photos are hot-linked from
 * the old site and are NOT stored in this repository. In production everything comes from Sanity.
 */
import { importedProperties } from './imported-properties';
const OLD = 'https://jppproperties.com/wp-content/uploads';

export type ZoneId =
  'vilamoura' | 'quarteira' | 'vilasol' | 'vale-do-lobo' | 'quinta-do-lago' | 'loule' | 'carvoeiro';
export type ListingType = 'sale' | 'rent';
export type PropertyType = 'apartment' | 'villa' | 'plot' | 'shop';

export interface Property {
  slug: string;
  reference?: string;
  title: string;
  listingType: ListingType;
  propertyType: PropertyType;
  /** Null when the old site does not say. */
  condition: 'new' | 'used' | null;
  zone: ZoneId;
  locality?: string;
  /**
   * The house on Google Maps, pasted by the team in Sanity ("Link do Google Maps"); short links are fine. It places
   * the pin on the property page map. Without it the map shows the zone.
   */
  mapsUrl?: string;
  /** Responsible consultant: position in the team list (in Sanity, a reference to a team member). */
  agent?: number;
  /** Gross and plot areas in m², when they apply. */
  grossArea?: number;
  plotArea?: number;
  /** Floor plan images and a video or virtual tour link, when the team adds them. */
  floorPlans?: string[];
  videoUrl?: string;
  /** Distances to nearby places, typed by the team (e.g. { place: 'Praia da Falésia', distance: '5 min de carro' }). */
  nearby?: { place: string; distance: string }[];
  price: number;
  /** Null when the listing does not say (shown as nothing, never as 0). TODO (client): fill them in. */
  bedrooms: number | null;
  bathrooms: number | null;
  garageSpaces: number | null;
  usableArea: number | null;
  yearBuilt: number | null;
  energyClass: string | null;
  /** Sold listings drop out of every list on the site; reserved ones stay. */
  availability: 'available' | 'reserved' | 'sold';
  addedAt: string;
  images: string[];
  description: string[];
  features: string[];
  /** The listing on the old site it was imported from (for the client's review; not shown). */
  source?: string;
}

export const zones: Record<ZoneId, { name: string; blurb: string }> = {
  vilamoura: { name: 'Vilamoura', blurb: 'Marina, golfe e a praia da Falésia a poucos minutos.' },
  quarteira: {
    name: 'Quarteira',
    blurb: 'Vida junto ao mar, com passeio marítimo, comércio e serviços.',
  },
  'vale-do-lobo': { name: 'Vale do Lobo', blurb: 'Golfe, praia e privacidade.' },
  'quinta-do-lago': {
    name: 'Quinta do Lago',
    blurb: 'Junto à Ria Formosa, entre os endereços mais exclusivos.',
  },
  vilasol: { name: 'Vilasol', blurb: 'Zona residencial tranquila, rodeada de golfe.' },
  loule: { name: 'Loulé', blurb: 'O centro histórico e o dia a dia do concelho.' },
  // TODO (client): confirm the line for Carvoeiro (Lagoa), added for the imported Primelife and The Court listings.
  carvoeiro: { name: 'Carvoeiro', blurb: 'Aldeia à beira-mar no concelho de Lagoa, entre falésias e praias.' },
};

export const propertyTypeLabels: Record<PropertyType, string> = {
  apartment: 'Apartamento',
  villa: 'Moradia',
  plot: 'Terreno',
  shop: 'Loja / negócio',
};

export const heroImage = `${OLD}/2020/07/930747_v8.jpeg`;
export const logoImage = '/brand/logo-black.png';
export const logoWhiteImage = '/brand/logo-white.png';

export const properties: Property[] = importedProperties;

/** Listings shown in lists, filters and counts. Sold ones drop out (their page can still exist). */
export const visibleProperties = properties.filter((p) => p.availability !== 'sold');

export const findProperty = (slug: string) => properties.find((p) => p.slug === slug);

/** "65,68 m²" (Portuguese decimals); empty when the area is unknown. */
export const formatArea = (m2: number | null | undefined) =>
  m2 ? `${m2.toLocaleString('pt-PT', { maximumFractionDigits: 2 })} m²` : '';

const eur = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});
export const formatPrice = (price: number) => eur.format(price).replace(/ /g, ' ');

/** Price per m², always grouped (e.g. 6 269 €/m²). */
const grouped = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0, useGrouping: 'always' });
export const formatPerSqm = (n: number) => `${grouped.format(n).replace(/\u00a0/g, ' ')} €/m²`;

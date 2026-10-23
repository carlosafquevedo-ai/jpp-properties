/**
 * Single source of truth for translated URL slugs.
 * Used by the language switcher, hreflang links, sitemap and page generation.
 * PT lives at the root; EN and FR are prefixed with /en/ and /fr/.
 *
 * TODO: confirm EN/FR slugs with the client before launch.
 */
export const locales = ['pt', 'en', 'fr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'pt';

export const routes = {
  home: { pt: '', en: '', fr: '' },
  properties: { pt: 'imoveis', en: 'properties', fr: 'proprietes' },
  buy: { pt: 'imoveis/comprar', en: 'properties/buy', fr: 'proprietes/acheter' },
  rent: { pt: 'imoveis/arrendar', en: 'properties/rent', fr: 'proprietes/louer' },
  zones: { pt: 'zonas', en: 'areas', fr: 'zones' },
  sell: { pt: 'vender', en: 'sell', fr: 'vendre' },
  requestProperty: {
    pt: 'pedir-imovel',
    en: 'request-property',
    fr: 'demander-un-bien',
  },
  services: { pt: 'servicos', en: 'services', fr: 'services' },
  about: { pt: 'sobre-nos', en: 'about-us', fr: 'a-propos' },
  contact: { pt: 'contactos', en: 'contacts', fr: 'contacts' },
  privacy: {
    pt: 'politica-de-privacidade',
    en: 'privacy-policy',
    fr: 'politique-de-confidentialite',
  },
  disputes: {
    pt: 'resolucao-de-litigios',
    en: 'dispute-resolution',
    fr: 'reglement-des-litiges',
  },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteKey = keyof typeof routes;

/** Path for a route in a locale, always with leading and trailing slash. */
export function localizedPath(route: RouteKey, locale: Locale, slug?: string): string {
  const parts = [locale === defaultLocale ? '' : locale, routes[route][locale], slug ?? '']
    .filter(Boolean)
    .join('/');
  return parts ? `/${parts}/` : '/';
}

/** Alternate-language versions of a page, for hreflang and the language switcher. */
export function alternateLinks(route: RouteKey, slugs?: Partial<Record<Locale, string>>) {
  return locales.map((locale) => ({
    locale,
    href: localizedPath(route, locale, slugs?.[locale]),
  }));
}

/** Locale of a URL path (anything without /en/ or /fr/ prefix is PT). */
export function localeFromPath(pathname: string): Locale {
  const first = pathname.split('/').filter(Boolean)[0];
  return first === 'en' || first === 'fr' ? first : defaultLocale;
}

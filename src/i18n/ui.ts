import type { Locale } from './routes';
import pt from './ui/pt.json';
import en from './ui/en.json';
import fr from './ui/fr.json';

const dictionaries: Record<Locale, Record<string, string>> = { pt, en, fr };

export type UiKey = keyof typeof pt;

/** Returns a translate function; falls back to PT if a key is missing. */
export function useTranslations(locale: Locale) {
  return (key: UiKey): string => dictionaries[locale][key] ?? pt[key];
}

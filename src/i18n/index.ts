import sl from './sl.json';
import en from './en.json';
import de from './de.json';

export const locales = ['sl', 'en', 'de'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'sl';

export type Dict = typeof sl;

const dictionaries: Record<Locale, Dict> = { sl, en, de };

export function getDict(locale: Locale): Dict {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export function localeLabel(locale: Locale): string {
  return locale.toUpperCase();
}

/**
 * Returns the path on the target locale for the current page.
 * Default locale (sl) lives at "/", others at "/en/", "/de/".
 */
export function localizedPath(target: Locale, currentPath: string): string {
  const cleaned = currentPath.replace(/^\/(en|de)(\/|$)/, '/');
  if (target === defaultLocale) return cleaned || '/';
  const tail = cleaned === '/' ? '' : cleaned;
  return `/${target}${tail}`;
}

export function detectLocaleFromPath(pathname: string): Locale {
  const match = pathname.match(/^\/(en|de)(\/|$)/);
  return (match?.[1] as Locale) ?? defaultLocale;
}

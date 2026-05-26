import type { Locale } from './index';

export const routes = {
  home:     { sl: '/',                    en: '/en/',                   de: '/de/' },
  services: { sl: '/storitve/',           en: '/en/services/',          de: '/de/dienstleistungen/' },
  milling:  { sl: '/storitve/rezkanje/',  en: '/en/services/milling/',  de: '/de/dienstleistungen/fraesen/' },
  turning:  { sl: '/storitve/struzenje/', en: '/en/services/turning/',  de: '/de/dienstleistungen/drehen/' },
  grinding: { sl: '/storitve/brusenje/',  en: '/en/services/grinding/', de: '/de/dienstleistungen/schleifen/' },
} as const;

export type RouteKey = keyof typeof routes;

export function localizedRoute(key: RouteKey, locale: Locale): string {
  return routes[key][locale];
}

export function routeKeyForPath(path: string): RouteKey | null {
  for (const key of Object.keys(routes) as RouteKey[]) {
    const r = routes[key];
    if (r.sl === path || r.en === path || r.de === path) return key;
  }
  return null;
}

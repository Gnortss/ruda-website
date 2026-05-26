import { describe, it, expect } from 'vitest';
import { routes, localizedRoute, routeKeyForPath } from '~/i18n/routes';

describe('routes table', () => {
  it('home route exists for each locale', () => {
    expect(routes.home.sl).toBe('/');
    expect(routes.home.en).toBe('/en/');
    expect(routes.home.de).toBe('/de/');
  });

  it('milling subpage has localized slugs per locale', () => {
    expect(routes.milling.sl).toBe('/storitve/rezkanje/');
    expect(routes.milling.en).toBe('/en/services/milling/');
    expect(routes.milling.de).toBe('/de/dienstleistungen/fraesen/');
  });

  it('localizedRoute returns the right path for a given key + locale', () => {
    expect(localizedRoute('turning', 'sl')).toBe('/storitve/struzenje/');
    expect(localizedRoute('turning', 'de')).toBe('/de/dienstleistungen/drehen/');
  });

  it('routeKeyForPath maps a URL path back to its route key', () => {
    expect(routeKeyForPath('/storitve/rezkanje/')).toBe('milling');
    expect(routeKeyForPath('/de/dienstleistungen/schleifen/')).toBe('grinding');
    expect(routeKeyForPath('/')).toBe('home');
    expect(routeKeyForPath('/unknown/path/')).toBeNull();
  });
});

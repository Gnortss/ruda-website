import { describe, it, expect } from 'vitest';
import { buildLocalBusinessSchema } from '~/lib/schema';

describe('LocalBusiness schema', () => {
  const schema = buildLocalBusinessSchema('sl') as any;

  it('uses LocalBusiness type with stable @id', () => {
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('LocalBusiness');
    expect(schema['@id']).toBe('https://orodjarstvoruda.com/#organization');
  });

  it('includes name, alternateName, and contact fields', () => {
    expect(schema.name).toBe('RUDA Orodjarstvo');
    expect(schema.alternateName).toBe('Damjan Rupnik s.p.');
    expect(schema.telephone).toEqual(['+38651664374', '+38641495661']);
    expect(schema.email).toBe('ruda.orodjarstvo@gmail.com');
    expect(schema.vatID).toBe('SI52946398');
  });

  it('includes precise geo coordinates', () => {
    expect(schema.geo['@type']).toBe('GeoCoordinates');
    expect(schema.geo.latitude).toBe(46.03957569239691);
    expect(schema.geo.longitude).toBe(14.049149609342338);
  });

  it('includes Slovenia in addressCountry', () => {
    expect(schema.address.addressCountry).toBe('SI');
    expect(schema.address.postalCode).toBe('5281');
    expect(schema.address.streetAddress).toBe('Ledine 34');
  });

  it('lists DACH + Italy in areaServed', () => {
    const names = schema.areaServed.map((c: any) => c.name);
    expect(names).toContain('Slovenia');
    expect(names).toContain('Germany');
    expect(names).toContain('Austria');
    expect(names).toContain('Italy');
  });
});

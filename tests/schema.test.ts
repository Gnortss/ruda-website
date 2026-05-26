import { describe, it, expect } from 'vitest';
import { buildLocalBusinessSchema, buildServiceSchema, buildBreadcrumbSchema, buildFAQSchema } from '~/lib/schema';

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

describe('Service schema', () => {
  it('cross-references the central organization', () => {
    const s = buildServiceSchema({ key: 'milling', locale: 'sl', name: 'Rezkanje', description: 'CNC rezkanje...', offers: ['5-osno', 'do 65 HRC'] }) as any;
    expect(s['@type']).toBe('Service');
    expect(s.provider['@id']).toBe('https://orodjarstvoruda.com/#organization');
    expect(s.name).toBe('Rezkanje');
    expect(s.hasOfferCatalog.itemListElement).toHaveLength(2);
  });
});

describe('BreadcrumbList schema', () => {
  it('numbers items starting at 1', () => {
    const b = buildBreadcrumbSchema([
      { name: 'Domov', url: 'https://orodjarstvoruda.com/' },
      { name: 'Storitve', url: 'https://orodjarstvoruda.com/storitve/' },
      { name: 'Rezkanje', url: 'https://orodjarstvoruda.com/storitve/rezkanje/' },
    ]) as any;
    expect(b['@type']).toBe('BreadcrumbList');
    expect(b.itemListElement[0].position).toBe(1);
    expect(b.itemListElement[2].position).toBe(3);
    expect(b.itemListElement[2].name).toBe('Rezkanje');
  });
});

describe('FAQPage schema', () => {
  it('wraps each Q/A in Question + Answer types', () => {
    const f = buildFAQSchema([
      { q: 'Do kakšne trdote?', a: 'Do 65 HRC.' },
      { q: 'Ali ponujate 5-osno?', a: 'Da.' },
    ]) as any;
    expect(f['@type']).toBe('FAQPage');
    expect(f.mainEntity).toHaveLength(2);
    expect(f.mainEntity[0]['@type']).toBe('Question');
    expect(f.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
    expect(f.mainEntity[0].acceptedAnswer.text).toBe('Do 65 HRC.');
  });
});

import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://orodjarstvoruda.com',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  adapter: cloudflare({
    imageService: 'compile',
    platformProxy: { enabled: true },
  }),
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'sl',
        locales: {
          sl: 'sl-SI',
          en: 'en',
          de: 'de-DE',
        },
      },
    }),
  ],
  i18n: {
    defaultLocale: 'sl',
    locales: ['sl', 'en', 'de'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
});

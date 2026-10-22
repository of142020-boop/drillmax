import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://drilmax.com',
  integrations: [
    sitemap({
      // Priority weights for key pages (1.0 = highest)
      serialize(item) {
        const url = item.url;
        let priority = 0.7;
        let changefreq = 'monthly';

        if (url === 'https://drilmax.com/' || url.endsWith('/services/') || url.endsWith('/prices/')) {
          priority = 1.0;
          changefreq = 'weekly';
        } else if (url.endsWith('/contact/') || url.endsWith('/projects/') || url.endsWith('/service-areas/')) {
          priority = 0.9;
          changefreq = 'monthly';
        } else if (url.includes('-concrete-cutting-core-') || url.includes('/blog/')) {
          priority = 0.8;
          changefreq = 'weekly';
        } else if (url.includes('/privacy-policy/') || url.includes('/terms-condition/')) {
          priority = 0.3;
          changefreq = 'yearly';
        } else if (url.includes('/404/')) {
          priority = 0.1;
          changefreq = 'yearly';
        }

        return {
          ...item,
          priority,
          changefreq,
        };
      },
    }),
  ],
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  build: {
    assets: '_assets',
  },
  redirects: {
    // WordPress Category Archives -> Main Services/Prices
    '/category/اسعار-فتحات-الكور': '/prices/',
    '/category/قص-وتخريم-الخرسانة-المسلحة': '/قص-الخرسانة-بالواير/',
    '/category/فني-شفاطات': '/فني-شفاطات/',
  },
});


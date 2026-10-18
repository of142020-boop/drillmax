import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://drilmax.com',
  integrations: [sitemap()],
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  build: {
    assets: '_assets',
  },
  redirects: {
    // WordPress Category Archives -> Main Services/Prices
    '/category/اسعار-فتحات-الكور': '/prices/',
    '/category/قص-وتخريم-الخرسانة-المسلحة': '/saw-cutting%d9%82%d8%b5-%d8%ae%d8%b1%d8%b3%d8%a7%d9%86%d8%a9/',
    '/category/فني-شفاطات': '/فني-شفاطات/',
  }
});

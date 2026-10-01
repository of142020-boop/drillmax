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
    // الشفاطات
    '/مقارنة-الشفاط-الهرمي-والمسطح': '/فني-شفاطات/',
    '/صيانة-اعطال-شفاط-المطبخ': '/فني-شفاطات/',
    '/أسعار-شفاطات-المطبخ-افضل-انواع': '/فني-شفاطات/',
    '/تركيب-شفاط-المطبخ': '/فني-شفاطات/',
    '/category/فني-شفاطات': '/فني-شفاطات/',
    
    // الكور
    '/أسعار-ماكينة-كور-تخريم-الخرسانة': '/core-drilling-صنايعي-كور/',
    '/فتحات-كور': '/core-drilling-صنايعي-كور/',
    '/تخريم-الخرسانة-المسلحة': '/core-drilling-صنايعي-كور/',
    '/category/اسعار-فتحات-الكور': '/prices/',

    // المنشار والقص
    '/الدليل-الشامل-لقص-وتخريم-الخرسانة-كيف': '/saw-cuttingقص-خرسانة/',
    '/قص-وتخريم-الخرسانة-المسلحة': '/saw-cuttingقص-خرسانة/',
    '/category/قص-وتخريم-الخرسانة-المسلحة': '/saw-cuttingقص-خرسانة/',

    // الأسعار
    '/اسعار-فتحات-الكور': '/prices/',
  }
});

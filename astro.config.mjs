import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  vite: { build: { assetsInlineLimit: 0 } },
  site: 'https://drilmax.com',
  integrations: [
    sitemap({
      filter: (page) => !new URL(page).pathname.startsWith('/category/') && !new URL(page).pathname.startsWith('/404'),
      // Priority weights for key pages (1.0 = highest)
      serialize(item) {
        const url = item.url;
        const modifiedPages = {
          '/': '2026-11-23',
          '/فني-شفاطات/': '2026-11-23',
          '/تركيب-شفاط-المطبخ/': '2026-11-23',
          '/مقاس-شفاط-الحمام/': '2026-11-23',
          '/core-drilling-صنايعي-كور/': '2026-11-23',
          '/saw-cuttingقص-خرسانة/': '2026-11-23',
          '/مقاول-هدم/': '2026-11-23',
          '/prices/': '2026-11-23',
          '/services/': '2026-11-23',
          '/مقارنة-الشفاط-الهرمي-والمسطح/': '2026-11-23',
          '/صيانة-اعطال-شفاط-المطبخ/': '2026-11-23',
          '/اسعار-فتحات-الكور/': '2026-11-23',
          '/سعر-تخريم-مدخنة-سخان-الغاز-بدرجة-عالية/': '2026-11-23',
          '/تأجير-منشار-خرسانة-لجميع-أعمال-التقطي/': '2026-11-23',
          '/service-areas/': '2026-11-23',
          '/مادة-تزريع-الحديد-كيمابوكسي-165/': '2026-11-23',
          '/new-cairo-tagamoa-concrete-cutting-core/': '2026-11-23',
          '/new-capital-shorouk-madinaty-core/': '2026-11-23',
          '/تكسير-حوائط-وخرسانة-شقق/': '2026-11-23',
          '/شفاط-مركزي-وشفاطات-مطاعم/': '2026-11-23',
          '/تركيب-شفاط-سقفي-جبس-بورد/': '2026-11-23',
          '/عمل-فتحات-الغاز/': '2026-11-23',
          '/قص-جدران-بالليزر-وفتح-ابواب/': '2026-11-23',
          '/تأسيس-مدخنة-شفاط-المطبخ-بلت-ان/': '2026-11-23',
          '/فتحات-كور-التكييف-والسباكة/': '2026-11-23',
        };
        const lastmod = modifiedPages[decodeURIComponent(new URL(url).pathname)];
        let priority = 0.7;
        let changefreq = 'monthly';

        if (url === 'https://drilmax.com/' || url.endsWith('/services/') || url.endsWith('/prices/')) {
          priority = 1.0;
          changefreq = 'weekly';
        } else if (url.endsWith('/contact/') || url.endsWith('/projects/') || url.endsWith('/service-areas/')) {
          priority = 0.9;
          changefreq = 'monthly';
        } else if (url.includes('-concrete-cutting-core/') || url.includes('/blog/')) {
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
          ...(lastmod ? { lastmod } : {}),
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
    '/category/اسعار-فتحات-الكور/': '/prices/',
    '/category/قص-وتخريم-الخرسانة-المسلحة/': '/قص-وتخريم-الخرسانة-المسلحة/',
    '/category/فني-شفاطات/': '/فني-شفاطات/',
    '/category/أسعار-ماكينة-تخريم-الخرسانية/': '/أسعار-ماكينة-كور-تخريم-الخرسانة/',
    '/category/uncategorized/': '/blog/',
    '/category/خدمات-الكور-دريل/': '/core-drilling-صنايعي-كور/',
    '/category/صنايعي-الكور/': '/core-drilling-صنايعي-كور/',
    '/category/تخريم-الخرسانة-المسلحة/': '/تخريم-الخرسانة-المسلحة/',
    '/صنايعي-كور-في-الاسكندرية/': '/alexandria-concrete-cutting-core/',
    '/اسعار-ماكينة-كور-تخريم-الخرسانة/': '/أسعار-ماكينة-كور-تخريم-الخرسانة/',
    '/افضل-صنايعي-كور/': '/core-drilling-صنايعي-كور/',
    '/قصه-وتخريم-الخرسانه-2/': '/قصه-وتخريم-الخرسانه/',
    '/شركات-تخريم-الخرسانة-بالكور-2/': '/',
    // Wave 2 Keyword Consolidation (2026-11-23)
    '/اسعار-كور-التخريم/': '/اسعار-فتحات-الكور/',
    '/عمل-فتحات-كور/': '/core-drilling-صنايعي-كور/',
    '/فتحات-كور/': '/core-drilling-صنايعي-كور/',
    '/خدمات-تخريم-الخرسانة-المسلحة-بالكور-د/': '/تخريم-الخرسانة-المسلحة/',
    '/أفضل-صنايعي-كور/': '/core-drilling-صنايعي-كور/',
    '/شركات-تخريم-الخرسانة-بالكور/': '/',
    '/أسعار-ماكينة-تخريم-الخرسانية/': '/أسعار-ماكينة-كور-تخريم-الخرسانة/',
    '/تقطيع-خرسانة-خدمة-خرسانة-مسلحة-باحترا/': '/saw-cuttingقص-خرسانة/',
    '/قص-الخرسانة-بدون-تكسير-تقنيات-حديثة-تض/': '/saw-cuttingقص-خرسانة/',
    '/الدليل-الشامل-لقص-وتخريم-الخرسانة-كيف/': '/قص-وتخريم-الخرسانة-المسلحة/',
  },
});


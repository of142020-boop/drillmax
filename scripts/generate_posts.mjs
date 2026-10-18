import fs from 'node:fs';
import path from 'node:path';

const posts = JSON.parse(fs.readFileSync('posts.json', 'utf8'));
const pagesDir = 'src/pages';

// Available images in public/images
const publicImgs = new Set(fs.readdirSync('public/images'));

function cleanText(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '')
    .replace(/&#8220;/g, '')
    .replace(/&#8221;/g, '')
    .replace(/&#8211;/g, '-')
    .replace(/&#8217;/g, "'")
    .replace(/&hellip;/g, '...')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveImage(url) {
  if (!url) return '/images/core-drill-hero.webp';
  const base = path.basename(url).replace(/-[0-9]+x[0-9]+/, '');
  const cleanBase = decodeURIComponent(base);
  
  if (publicImgs.has(cleanBase)) return `/images/${cleanBase}`;
  if (publicImgs.has(base)) return `/images/${base}`;
  
  // Try finding without -scaled
  const noScaled = cleanBase.replace(/-scaled/, '');
  if (publicImgs.has(noScaled)) return `/images/${noScaled}`;

  // Fallback to default hero
  return '/images/core-drill-hero.webp';
}

function cleanHtml(html) {
  if (!html) return '';
  let h = html;
  
  // Fix images
  h = h.replace(/https?:\/\/drilmax\.com\/wp-content\/uploads\/[0-9]{4}\/[0-9]{2}\/([^"'\s>]+)/g, (match, p1) => {
    return resolveImage(p1);
  });

  // Strip thumbnail suffixes
  h = h.replace(/\/images\/([^"'\s>]+)-[0-9]+x[0-9]+\.(webp|jpg|png|jpeg)/g, '/images/$1.$2');

  // Strip data-path-to-node
  h = h.replace(/\s*data-path-to-node="[^"]*"/g, '');

  // Fix internal links
  h = h.replace(/https?:\/\/drilmax\.com\//g, '/');

  // Downgrade any h1 inside body content to h2
  h = h.replace(/<h1(\s|>)/gi, '<h2$1').replace(/<\/h1>/gi, '</h2>');

  // Remove empty paragraphs
  h = h.replace(/<p>\s*(&nbsp;|\s)*<\/p>/gi, '');

  return h;
}

let generated = 0;

for (const p of posts) {
  const rawSlug = p.slug;
  const slug = decodeURIComponent(rawSlug);
  const rawTitle = p.title?.rendered || p.title || '';
  const title = cleanText(rawTitle);
  
  const excerptRaw = p.excerpt?.rendered || '';
  let description = cleanText(excerptRaw);
  if (!description || description.length < 30) {
    description = cleanText(p.content?.rendered || '').slice(0, 155);
  } else if (description.length > 165) {
    description = description.slice(0, 160) + '...';
  }

  const rawFeat = p.uagb_featured_image_src?.full?.[0] || '';
  const firstImg = (p.content?.rendered || '').match(/src=["']([^"']+)["']/)?.[1] || '';
  const ogImage = resolveImage(rawFeat || firstImg);

  const cleanContent = cleanHtml(p.content?.rendered || '');
  const dateStr = p.date ? p.date.split('T')[0] : '2026-02-15';
  const modifiedStr = p.modified ? p.modified.split('T')[0] : dateStr;

  // Approximate reading time
  const wordsCount = cleanText(cleanContent).split(/\s+/).length;
  const readTime = Math.max(2, Math.round(wordsCount / 180));

  const schemaObj = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `https://drilmax.com/${slug}/#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "الرئيسية", "item": "https://drilmax.com/" },
          { "@type": "ListItem", "position": 2, "name": "المدونة", "item": "https://drilmax.com/blog/" },
          { "@type": "ListItem", "position": 3, "name": title, "item": `https://drilmax.com/${slug}/` }
        ]
      },
      {
        "@type": "BlogPosting",
        "@id": `https://drilmax.com/${slug}/#article`,
        "isPartOf": { "@id": "https://drilmax.com/#website" },
        "headline": title,
        "description": description,
        "image": `https://drilmax.com${ogImage}`,
        "datePublished": `${dateStr}T10:00:00+02:00`,
        "dateModified": `${modifiedStr}T12:00:00+02:00`,
        "inLanguage": "ar",
        "mainEntityOfPage": `https://drilmax.com/${slug}/`,
        "author": { "@type": "Organization", "name": "Drill Max دريل ماكس", "url": "https://drilmax.com" },
        "publisher": { "@id": "https://drilmax.com/#organization" }
      }
    ]
  };

  const fileContent = `---
import MainLayout from '../layouts/MainLayout.astro';

const seo = {
  title: "${title.replace(/"/g, '\\"')} | دريل ماكس",
  description: "${description.replace(/"/g, '\\"')}",
  canonical: "/${slug}/",
  ogImage: "${ogImage}",
  schema: JSON.stringify(${JSON.stringify(schemaObj, null, 2)})
};

const contentHtml = ${JSON.stringify(cleanContent)};
---

<MainLayout {...seo}>
  <article class="post-single">
    <header class="post-hero">
      <div class="container">
        <nav class="breadcrumb-trail" aria-label="Breadcrumb">
          <a href="/">الرئيسية</a> &raquo; <a href="/blog/">المدونة</a> &raquo; <span>${title}</span>
        </nav>
        <h1 class="entry-title">${title}</h1>
        <div class="entry-meta-info">
          <span>📅 ${dateStr}</span>
          <span>⏱️ قراءة: ${readTime} دقائق</span>
          <span>👷‍♂️ فريق دريل ماكس</span>
        </div>
      </div>
    </header>

    <div class="container post-container">
      <div class="post-grid">
        <div class="post-content-area">
          ${ogImage ? `
          <div class="post-featured-media">
            <img src="${ogImage}" alt="${title}" class="featured-img" loading="eager" />
          </div>` : ''}

          <div class="post-body-text" set:html={contentHtml} />

          <div class="post-cta-box">
            <h3>جاهزون لخدمتكم على مدار 24 ساعة</h3>
            <p>سواء كنت تحتاج تخريم فتحات كور للغاز والتكييف، أو قص خرسانة مسلحة بالمنشار والواير، فريق دريل ماكس في خدمتكم بأحدث المعدات وأفضل الأسعار.</p>
            <div class="cta-buttons">
              <a href="tel:+2001070046464" class="btn btn-call">📞 اتصل الآن: 01070046464</a>
              <a href="https://wa.me/+201070046464" class="btn btn-wa" target="_blank" rel="noopener">💬 محادثة واتساب سريعة</a>
            </div>
          </div>
        </div>

        <aside class="post-sidebar">
          <div class="widget">
            <h3 class="widget-title">خدمات دريل ماكس</h3>
            <ul class="service-links">
              <li><a href="/core-drilling-%d8%b5%d9%86%d8%a7%d9%8a%d8%b9%d9%8a-%d9%83%d9%88%d8%b1/">فتحات كور دريل</a></li>
              <li><a href="/saw-cutting%d9%82%d8%b5-%d8%ae%d8%b1%d8%b3%d8%a7%d9%86%d8%a9/">قص خرسانة بالمنشار</a></li>
              <li><a href="/%d9%82%d8%b5-%d8%a7%d9%84%d8%ae%d8%b1%d8%b3%d8%a7%d9%86%d8%a9-%d8%a8%d8%a7%d9%84%d9%88%d8%a7%d9%8a%d8%b1/">قص بالواير الماسي</a></li>
              <li><a href="/%d8%aa%d8%b2%d8%b1%d9%8a%d8%b9-%d8%a7%d9%84%d8%a7%d8%b4%d8%a7%d9%8a%d8%b1/">تزريع أشاير حديد</a></li>
              <li><a href="/%d9%81%d9%86%d9%8a-%d8%b4%d9%81%d8%a7%d8%b7%d8%a7%d8%aa/">فني شفاطات ومطابخ</a></li>
              <li><a href="/%d9%85%d9%82%d8%a7%d9%88%d9%84-%d9%87%d8%af%d9%85/">أعمال التكسير والهدم</a></li>
              <li><a href="/prices/">قائمة الأسعار وعروضنا</a></li>
            </ul>
          </div>

          <div class="widget direct-contact">
            <h3 class="widget-title">طلب استشارة مجانية</h3>
            <p>تواصل مع مهندس مختص لمناقشة أبعاد الفتحات وتكاليف المشروع فوراً.</p>
            <a href="tel:+2001070046464" class="btn btn-primary" style="display:block; text-align:center; margin-top:15px;">01070046464</a>
          </div>
        </aside>
      </div>
    </div>
  </article>
</MainLayout>

<style>
  .post-hero {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    color: #fff;
    padding: 45px 0 35px;
    border-bottom: 3px solid var(--accent, #eab308);
  }
  .breadcrumb-trail {
    font-size: 0.95rem;
    color: #94a3b8;
    margin-bottom: 15px;
  }
  .breadcrumb-trail a {
    color: #cbd5e1;
    text-decoration: none;
  }
  .breadcrumb-trail a:hover {
    color: #eab308;
  }
  .entry-title {
    font-size: 2.2rem;
    font-weight: 800;
    line-height: 1.4;
    color: #fff;
    margin-bottom: 15px;
  }
  .entry-meta-info {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    color: #94a3b8;
    font-size: 0.95rem;
  }
  .post-container {
    padding: 50px 20px;
  }
  .post-grid {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 40px;
    align-items: start;
  }
  .post-featured-media {
    margin-bottom: 35px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
  .featured-img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
  }
  .post-body-text {
    font-size: 1.15rem;
    line-height: 2;
    color: #334155;
  }
  .post-body-text :global(h2) {
    font-size: 1.7rem;
    font-weight: 700;
    color: #0f172a;
    margin: 35px 0 15px;
    padding-bottom: 8px;
    border-bottom: 2px solid #e2e8f0;
  }
  .post-body-text :global(h3) {
    font-size: 1.35rem;
    font-weight: 700;
    color: #1e293b;
    margin: 25px 0 12px;
  }
  .post-body-text :global(p) {
    margin-bottom: 20px;
  }
  .post-body-text :global(ul), .post-body-text :global(ol) {
    margin: 15px 0 25px 25px;
    padding-right: 20px;
  }
  .post-body-text :global(li) {
    margin-bottom: 8px;
  }
  .post-body-text :global(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 20px 0;
  }
  .post-body-text :global(a) {
    color: #d97706;
    font-weight: 600;
    text-decoration: underline;
  }
  .post-body-text :global(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 25px 0;
  }
  .post-body-text :global(th), .post-body-text :global(td) {
    border: 1px solid #cbd5e1;
    padding: 12px;
    text-align: right;
  }
  .post-body-text :global(th) {
    background: #f1f5f9;
    font-weight: 700;
  }
  .post-cta-box {
    margin-top: 50px;
    padding: 30px;
    background: #f8fafc;
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    text-align: center;
  }
  .post-cta-box h3 {
    font-size: 1.5rem;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 10px;
  }
  .post-cta-box p {
    color: #64748b;
    margin-bottom: 25px;
    line-height: 1.7;
  }
  .cta-buttons {
    display: flex;
    justify-content: center;
    gap: 15px;
    flex-wrap: wrap;
  }
  .btn-call {
    background: #eab308;
    color: #000 !important;
    padding: 12px 25px;
    border-radius: 8px;
    font-weight: 700;
    text-decoration: none !important;
  }
  .btn-wa {
    background: #25d366;
    color: #fff !important;
    padding: 12px 25px;
    border-radius: 8px;
    font-weight: 700;
    text-decoration: none !important;
  }
  .post-sidebar .widget {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 25px;
    margin-bottom: 25px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }
  .widget-title {
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 18px;
    padding-bottom: 10px;
    border-bottom: 2px solid #eab308;
    color: #0f172a;
  }
  .service-links {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .service-links li {
    margin-bottom: 12px;
    border-bottom: 1px dashed #f1f5f9;
    padding-bottom: 8px;
  }
  .service-links a {
    color: #334155;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s;
  }
  .service-links a:hover {
    color: #eab308;
  }
  @media (max-width: 900px) {
    .post-grid {
      grid-template-columns: 1fr;
    }
    .entry-title {
      font-size: 1.6rem;
    }
  }
</style>
`;

  const targetPath = path.join(pagesDir, `${slug}.astro`);
  fs.writeFileSync(targetPath, fileContent, 'utf8');
  generated++;
}

console.log(`Successfully generated ${generated} blog post Astro pages.`);

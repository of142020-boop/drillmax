import fs from 'fs';
import path from 'path';

const pagesDir = 'src/pages';
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.astro'));

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Regex to find <img> tags
  content = content.replace(/<img([^>]*)>/g, (match, attributes) => {
    
    const getAttr = (name) => {
      const regex = new RegExp(`\\s${name}=(['"])(.*?)\\1`, 'i');
      const m = attributes.match(regex);
      return m ? m[2] : null;
    };

    let src = getAttr('src') || getAttr('data-src') || '';
    // If src is a base64 placeholder and data-src exists, use data-src
    if (src.startsWith('data:image') && getAttr('data-src')) {
        src = getAttr('data-src');
    }
    
    let alt = getAttr('alt') || '';
    let className = getAttr('class') || '';
    let style = getAttr('style') || '';
    let width = getAttr('width') || '';
    let height = getAttr('height') || '';

    // Clean up WordPress classes
    className = className.replace(/wp-image-\d+|attachment-\w+|size-\w+|wp-post-image|entered|litespeed-loaded|alignnone/g, '').replace(/\s+/g, ' ').trim();

    // Fix alt text
    if (!alt || alt.trim() === '' || alt === 'الشروط والأحكام' || alt === 'Logo') {
      const filename = src.split('/').pop().replace(/\.[^/.]+$/, '').replace(/-|_/g, ' ');
      alt = decodeURIComponent(filename);
      if (alt.includes('logo') || alt.includes('Site Logo')) {
          alt = 'دريل ماكس';
      }
    }

    let newImg = `<img src="${src}" alt="${alt}"`;
    if (className) newImg += ` class="${className}"`;
    if (style) newImg += ` style="${style}"`;
    if (width) newImg += ` width="${width}"`;
    if (height) newImg += ` height="${height}"`;
    newImg += ` />`;

    return newImg;
  });
  
  // also clean up wp-caption-text and figure classes if any
  content = content.replace(/class="widget-image-caption wp-caption-text"/g, 'class="image-caption" style="text-align: center; color: var(--gray); font-size: 0.9rem; margin-top: 10px;"');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Cleaned images in ${file}`);
  }
}

const fs = require('fs');
const path = require('path');

const RAW_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';
const files = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.html'));

// Elementor stores background images in data-settings attribute as JSON
// Pattern: data-settings="{...\"background_image\":{\"url\":\"URL\"...}"
// We need to extract these and add inline style

let totalFixed = 0;

files.forEach(filename => {
  let html = fs.readFileSync(path.join(RAW_DIR, filename), 'utf8');
  let fixCount = 0;

  // Find all elements with data-settings containing background_image
  // The data-settings value uses &quot; for JSON quotes
  let pos = 0;
  const parts = [];
  let lastPos = 0;

  while (pos < html.length) {
    // Find elements that have data-settings with background
    const dsIdx = html.indexOf('data-settings="{', pos);
    if (dsIdx === -1) break;

    // Find the end of data-settings value
    const dsStart = dsIdx + 'data-settings="'.length;
    let dsEnd = dsStart;
    let depth = 0;
    while (dsEnd < html.length) {
      if (html[dsEnd] === '{') depth++;
      else if (html[dsEnd] === '}') {
        depth--;
        if (depth === 0) { dsEnd++; break; }
      }
      dsEnd++;
    }
    // dsEnd now points past the closing }
    // dsEnd+1 to skip the closing "
    const settingsRaw = html.slice(dsStart, dsEnd);

    // Decode HTML entities to parse as JSON
    const settingsDecoded = settingsRaw
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&#039;/g, "'");

    let settings;
    try {
      settings = JSON.parse(settingsDecoded);
    } catch (e) {
      pos = dsEnd;
      continue;
    }

    // Check if this element has a background_image
    const bgImg = settings.background_image;
    if (bgImg && bgImg.url && bgImg.url.trim() !== '') {
      const imgUrl = bgImg.url;

      // Find the element tag that contains this data-settings
      // Look backwards from dsIdx to find the opening <
      let tagStart = dsIdx;
      while (tagStart > 0 && html[tagStart] !== '<') tagStart--;
      const tagEnd = html.indexOf('>', dsIdx);

      // Get current style of this element
      const tagContent = html.slice(tagStart, tagEnd + 1);
      let newTag;

      if (tagContent.includes('style="')) {
        // Append to existing style
        newTag = tagContent.replace(/style="([^"]*)"/, (m, existing) => {
          if (existing.includes('background-image')) return m; // already set
          return `style="${existing}; background-image: url('${imgUrl}'); background-size: cover; background-position: center center;"`;
        });
      } else {
        // Add new style attribute before the closing >
        newTag = tagContent.replace('>', ` style="background-image: url('${imgUrl}'); background-size: cover; background-position: center center;">`);
      }

      if (newTag !== tagContent) {
        parts.push(html.slice(lastPos, tagStart));
        parts.push(newTag);
        lastPos = tagEnd + 1;
        fixCount++;
      }
    }

    pos = dsEnd + 1;
  }

  if (fixCount > 0) {
    parts.push(html.slice(lastPos));
    html = parts.join('');
    fs.writeFileSync(path.join(RAW_DIR, filename), html);
    totalFixed += fixCount;
    console.log('[FIXED] ' + filename + ': ' + fixCount + ' background images injected');
  } else {
    console.log('[OK]    ' + filename + ': no data-settings backgrounds found');
  }
});

console.log('\n✅ Done! Injected ' + totalFixed + ' background images across all pages.');

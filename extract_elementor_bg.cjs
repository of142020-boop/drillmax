const fs = require('fs');
const path = require('path');

const RAW_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';
const files = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.html'));

let totalFixed = 0;

files.forEach(filename => {
  let html = fs.readFileSync(path.join(RAW_DIR, filename), 'utf8');
  const before = html;
  let fixCount = 0;

  // Elementor stores background images in JSON inside data-settings attribute
  // The JSON is HTML-entity encoded (&quot; = ", &amp; = &)
  // Find all data-settings attributes and look for background_image.url
  
  // We process the HTML as a string, looking for the pattern
  const result = [];
  let pos = 0;

  while (pos < html.length) {
    // Find opening tag with class containing "elementor-element"
    const tagOpen = html.indexOf('data-settings="', pos);
    if (tagOpen === -1) break;

    // Find end of the data-settings value
    const valStart = tagOpen + 'data-settings="'.length;
    const valEnd = html.indexOf('"', valStart);
    if (valEnd === -1) { pos = valStart; continue; }

    const rawVal = html.slice(valStart, valEnd);
    
    // Decode HTML entities
    const decoded = rawVal
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&#039;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');

    let settings;
    try {
      settings = JSON.parse(decoded);
    } catch (e) {
      pos = valEnd + 1;
      continue;
    }

    // Check if there's a background_image with a url
    let bgUrl = null;
    if (settings.background_image && settings.background_image.url) {
      bgUrl = settings.background_image.url;
    } else if (settings._background_image && settings._background_image.url) {
      bgUrl = settings._background_image.url;
    }

    if (bgUrl && bgUrl.trim() !== '' && !bgUrl.includes('data:')) {
      // Find the opening < for this tag (search backwards from tagOpen)
      let elemStart = tagOpen;
      while (elemStart > 0 && html[elemStart] !== '<') elemStart--;
      
      // Find the > that closes this opening tag
      const elemEnd = html.indexOf('>', tagOpen);
      if (elemEnd === -1) { pos = valEnd + 1; continue; }

      const tagContent = html.slice(elemStart, elemEnd + 1);
      
      // Add inline style with background-image
      let newTag;
      const bgStyle = `background-image: url('${bgUrl}'); background-size: cover; background-position: center center; background-repeat: no-repeat;`;
      
      if (tagContent.includes('style="')) {
        // Append to existing style attribute (avoid if already has background-image)
        if (!tagContent.includes('background-image')) {
          newTag = tagContent.replace(/style="([^"]*)"/, (m, existing) => {
            return `style="${existing}; ${bgStyle}"`;
          });
        } else {
          newTag = tagContent;
        }
      } else {
        // Insert style attribute before the closing >
        newTag = tagContent.slice(0, -1) + ` style="${bgStyle}">`;
      }

      if (newTag !== tagContent) {
        // Replace in html
        html = html.slice(0, elemStart) + newTag + html.slice(elemEnd + 1);
        fixCount++;
        // Adjust pos
        pos = elemStart + newTag.length;
        continue;
      }
    }

    pos = valEnd + 1;
  }

  if (fixCount > 0) {
    fs.writeFileSync(path.join(RAW_DIR, filename), html);
    totalFixed += fixCount;
    console.log('[FIXED] ' + filename + ': injected ' + fixCount + ' background images from data-settings');
  } else {
    console.log('[OK]    ' + filename + ': no data-settings backgrounds found');
  }
});

console.log('\n✅ Total: ' + totalFixed + ' background images injected from Elementor data-settings');

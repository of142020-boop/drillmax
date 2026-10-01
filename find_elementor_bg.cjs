const fs = require('fs');
const path = require('path');

const RAW_DIR = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw';
const html = fs.readFileSync(path.join(RAW_DIR, 'saw-cutting.html'), 'utf8');

// Find style tags with background-image in them
const styleMatches = [];
let pos = 0;
while (pos < html.length) {
  const s = html.indexOf('<style', pos);
  if (s === -1) break;
  const e = html.indexOf('</style>', s) + '</style>'.length;
  const block = html.slice(s, e);
  if (block.includes('background-image')) {
    styleMatches.push({ size: block.length, snippet: block.substring(0, 200) });
  }
  pos = e;
}

console.log('Style blocks with background-image: ' + styleMatches.length);
styleMatches.forEach((m, i) => {
  console.log('\n[' + i + '] ' + Math.round(m.size/1024) + 'KB:');
  console.log(m.snippet);
});

// Also find Elementor section elements that should have background images
// They have class "elementor-element" with specific IDs and background set via JS
// Let's check what data-id attributes exist and look for corresponding styles
const elementorIds = [];
const idMatches = html.match(/class="elementor-element elementor-element-([a-z0-9]+)/g) || [];
idMatches.slice(0, 10).forEach(m => {
  const id = m.match(/elementor-element-([a-z0-9]+)/)[1];
  elementorIds.push(id);
});

console.log('\nSome Elementor element IDs: ' + elementorIds.slice(0, 8).join(', '));

// Check if any of these IDs appear in style blocks with background-image
const lastStyle = html.lastIndexOf('<style');
const lastStyleEnd = html.indexOf('</style>', lastStyle) + '</style>'.length;
const lastStyleBlock = html.slice(lastStyle, lastStyleEnd);

console.log('\nLast style block (likely has bg images):');
if (lastStyleBlock.includes('background-image')) {
  const bgMatches = lastStyleBlock.match(/\.elementor-element-[a-z0-9]+[^{]*\{[^}]*background-image[^}]*\}/g) || [];
  bgMatches.slice(0, 5).forEach(m => console.log(m.substring(0, 150)));
} else {
  console.log('No background-image in last style block');
  console.log('First 300 chars: ' + lastStyleBlock.substring(0, 300));
}

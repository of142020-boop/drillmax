const fs = require('fs');
const path = require('path');

const PUBLIC_IMAGES = 'C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/public/images';

// The missing background images
const needed = [
  'تخريم-بالكور-دريل.webp',
  'تقطيع-بمنشار-الخرسانة.webp',
  'منشار-خرسانة.webp',
  'كور-دريل-1.webp',
  'فتحات-كور.webp',
];

needed.forEach(f => {
  const exists = fs.existsSync(path.join(PUBLIC_IMAGES, f));
  console.log((exists ? '✓ EXISTS' : '✗ MISSING') + ': ' + f);
});

// Also check total count and list similar files
const allFiles = fs.readdirSync(PUBLIC_IMAGES);
console.log('\nFiles with "كور" in name:');
allFiles.filter(f => f.includes('كور')).forEach(f => console.log(' ', f));
console.log('\nFiles with "منشار" in name:');
allFiles.filter(f => f.includes('منشار')).forEach(f => console.log(' ', f));

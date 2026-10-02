const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

const typos = [
  { regex: /\bافضل\b/g, message: "افضل (بدون همزة، الصواب: أفضل)" },
  { regex: /\bاهم\b/g, message: "اهم (بدون همزة، الصواب: أهم)" },
  { regex: /\bانشاء\b/g, message: "انشاء (بدون همزة، الصواب: إنشاء)" },
  { regex: /\bكور دريل\b/g, message: "تحذير: هل هي 'كور دريل' أم 'كوردريل'؟ (فقط للتأكد من التوحيد)" }
];

function checkText(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  let errors = [];

  typos.forEach(typo => {
    const matches = content.match(typo.regex);
    if (matches) {
      errors.push(`- [${typo.message}]: وجدت ${matches.length} مرة`);
    }
  });

  if (errors.length > 0) {
    console.log(`\n❌ [${fileName}]`);
    errors.forEach(e => console.log(`   ${e}`));
  }
}

fs.readdirSync(pagesDir).forEach(file => {
  if (file.endsWith('.astro')) {
    checkText(path.join(pagesDir, file));
  }
});

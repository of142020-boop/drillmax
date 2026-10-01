const fs = require('fs');
const path = require('path');

const replacements = {
  'صنايعي-كور-دريل-1.webp': 'core-drill-hero.webp',
  'فتحة-مدخنة-غاز.webp': 'gas-hole.webp',
  'منشار.webp': 'saw.webp',
  'قص-الخرسانة-بالواير.webp': 'wire-saw.webp',
  'تكسير.webp': 'demolition.webp',
  'تركيب-شفاط-مطبخ.webp': 'kitchen-fan.webp',
  'كور-دريل-1.webp': 'core-1.webp'
};

function getAstroFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAstroFiles(filePath, fileList);
    } else if (filePath.endsWith('.astro')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = getAstroFiles('src/pages');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  for (const [arabicName, englishName] of Object.entries(replacements)) {
    // using split and join to replace all occurrences
    content = content.split(arabicName).join(englishName);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});

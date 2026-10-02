const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

function fixSEO(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  let changed = false;

  // 1. Fix multiple H1s
  let h1Count = 0;
  content = content.replace(/<h1(.*?)>(.*?)<\/h1>/gs, (match, p1, p2) => {
    h1Count++;
    if (h1Count > 1) {
      changed = true;
      return `<h2${p1}>${p2}</h2>`;
    }
    return match;
  });

  // 2. Add H1 if missing and it's a specific file
  if (h1Count === 0) {
    let title = "";
    if (fileName === 'alexandria-concrete-cutting-core.astro') {
      title = "قص وتخريم خرسانة بالإسكندرية";
    } else if (fileName === 'minya-concrete-cutting-core.astro') {
      title = "قص وتخريم خرسانة بالمنيا";
    } else if (fileName === 'blog.astro') {
      title = "المدونة - Drill Max";
    }

    if (title !== "") {
      content = content.replace(/<div class="page-content"/, `<h1 style="text-align:center; color:var(--primary); margin-bottom:20px;">${title}</h1>\n      <div class="page-content"`);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed SEO in ${fileName}`);
  }
}

fs.readdirSync(pagesDir).forEach(file => {
  if (file.endsWith('.astro')) {
    fixSEO(path.join(pagesDir, file));
  }
});

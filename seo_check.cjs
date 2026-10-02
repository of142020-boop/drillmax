const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

function checkSEO(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  let errors = [];

  // Check title prop
  const layoutMatch = content.match(/<MainLayout([^>]*)>/);
  if (!layoutMatch) {
    if (fileName !== '404.astro') {
      errors.push("Missing <MainLayout>");
    }
  } else {
    const props = layoutMatch[1];
    if (!props.includes('title=')) errors.push("Missing title in MainLayout");
    if (!props.includes('description=')) errors.push("Missing description in MainLayout");
  }

  // Check H1
  const h1Matches = content.match(/<h1[^>]*>.*?<\/h1>/gs);
  if (!h1Matches) {
    errors.push("Missing <h1> tag");
  } else if (h1Matches.length > 1) {
    errors.push(`Multiple <h1> tags found (${h1Matches.length})`);
  }

  // Check image alt tags
  const imgMatches = content.match(/<img[^>]+>/g) || [];
  let missingAlt = 0;
  imgMatches.forEach(img => {
    if (!img.includes('alt=')) missingAlt++;
  });
  if (missingAlt > 0) {
    errors.push(`${missingAlt} images missing alt attributes`);
  }

  if (errors.length > 0) {
    console.log(`\n❌ [${fileName}]`);
    errors.forEach(e => console.log(`   - ${e}`));
  } else {
    console.log(`✅ [${fileName}] No basic SEO errors found.`);
  }
}

fs.readdirSync(pagesDir).forEach(file => {
  if (file.endsWith('.astro')) {
    checkSEO(path.join(pagesDir, file));
  }
});

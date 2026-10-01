const fs = require('fs');
const html = fs.readFileSync('C:/Users/omar/.gemini/antigravity-ide/scratch/drilmax-astro/src/raw/home.html', 'utf8');

// Show all lines with drilmax.com that remain
const lines = html.split('\n');
const matchingLines = [];
lines.forEach((line, i) => {
  if (line.includes('drilmax.com')) {
    matchingLines.push({ line: i + 1, content: line.trim().substring(0, 120) });
  }
});

matchingLines.slice(0, 15).forEach(m => {
  console.log('Line ' + m.line + ': ' + m.content);
});

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = 'C:/Users/omar/.gemini/antigravity-ide/brain/9005b48e-9527-437a-a4c0-dd3cb971de87/screenshots';
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const pages = [
  { url: 'http://localhost:4321/', name: 'home' },
  { url: 'http://localhost:4321/core-drilling-%d8%b5%d9%86%d8%a7%d9%8a%d8%b9%d9%8a-%d9%83%d9%88%d8%b1/', name: 'core-drilling' },
  { url: 'http://localhost:4321/saw-cutting%d9%82%d8%b5-%d8%ae%d8%b1%d8%b3%d8%a7%d9%86%d8%a9/', name: 'saw-cutting' },
  { url: 'http://localhost:4321/services/', name: 'services' },
];

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
  });

  for (const page of pages) {
    const tab = await browser.newPage();
    await tab.setViewport({ width: 1536, height: 800 });
    
    try {
      await tab.goto(page.url, { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise(r => setTimeout(r, 2000)); // Wait for JS to run
      
      const screenshotPath = path.join(SCREENSHOTS_DIR, page.name + '_after_fix.png');
      await tab.screenshot({ path: screenshotPath, fullPage: false });
      console.log('✓ Screenshot: ' + page.name + ' -> ' + screenshotPath);
    } catch (e) {
      console.log('✗ Error for ' + page.name + ': ' + e.message);
    }
    
    await tab.close();
  }

  await browser.close();
  console.log('\nDone!');
}

run();

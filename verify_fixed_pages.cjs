const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = 'C:/Users/omar/.gemini/antigravity-ide/brain/9005b48e-9527-437a-a4c0-dd3cb971de87/screenshots';

const pages = [
  { url: 'http://localhost:4321/prices/', name: 'local_prices' },
  { url: 'http://localhost:4321/%d9%81%d9%86%d9%8a-%d8%b4%d9%81%d8%a7%d8%b7%d8%a7%d8%aa/', name: 'local_exhaust_fans' }
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
      
      const screenshotPath = path.join(SCREENSHOTS_DIR, page.name + '.png');
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

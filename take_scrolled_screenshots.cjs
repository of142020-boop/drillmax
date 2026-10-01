const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = 'C:/Users/omar/.gemini/antigravity-ide/brain/9005b48e-9527-437a-a4c0-dd3cb971de87/screenshots';

const pages = [
  { url: 'http://localhost:4321/', name: 'home', scrollY: 800 },
  { url: 'http://localhost:4321/core-drilling-%d8%b5%d9%86%d8%a7%d9%8a%d8%b9%d9%8a-%d9%83%d9%88%d8%b1/', name: 'core-drilling-scroll', scrollY: 900 },
  { url: 'http://localhost:4321/saw-cutting%d9%82%d8%b5-%d8%ae%d8%b1%d8%b3%d8%a7%d9%86%d8%a9/', name: 'saw-cutting-scroll', scrollY: 900 },
];

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  for (const page of pages) {
    const tab = await browser.newPage();
    await tab.setViewport({ width: 1536, height: 800 });
    
    try {
      await tab.goto(page.url, { waitUntil: 'networkidle2', timeout: 20000 });
      await new Promise(r => setTimeout(r, 3000)); // Wait 3s for JS and backgrounds
      
      // Scroll to target position
      await tab.evaluate((y) => window.scrollTo(0, y), page.scrollY);
      await new Promise(r => setTimeout(r, 1000));
      
      const screenshotPath = path.join(SCREENSHOTS_DIR, page.name + '_scroll.png');
      await tab.screenshot({ path: screenshotPath });
      console.log('✓ ' + page.name + ': ' + screenshotPath);
    } catch (e) {
      console.log('✗ ' + page.name + ': ' + e.message);
    }
    
    await tab.close();
  }

  await browser.close();
}

run();

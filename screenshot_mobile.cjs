const puppeteer = require('puppeteer');
const path = require('path');

const SCREENSHOTS_DIR = 'C:/Users/omar/.gemini/antigravity-ide/brain/9005b48e-9527-437a-a4c0-dd3cb971de87/screenshots';

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const tab = await browser.newPage();
  // Set to mobile viewport (iPhone 12 Pro)
  await tab.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  
  try {
    await tab.goto('http://localhost:4321/', { waitUntil: 'networkidle0', timeout: 15000 });
    
    await tab.screenshot({ path: path.join(SCREENSHOTS_DIR, 'mobile_astro_home.png'), fullPage: true });
    console.log('✓ Mobile screenshot saved');
  } catch (e) {
    console.log('✗ Error: ' + e.message);
  }
  
  await browser.close();
}

run();

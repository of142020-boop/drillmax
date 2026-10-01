const puppeteer = require('puppeteer');
const path = require('path');

const SCREENSHOTS_DIR = 'C:/Users/omar/.gemini/antigravity-ide/brain/9005b48e-9527-437a-a4c0-dd3cb971de87/screenshots';

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const tab = await browser.newPage();
  await tab.setViewport({ width: 1536, height: 1800 }); // High height to capture more of the new design
  
  try {
    await tab.goto('https://drilmax.com/prices/', { waitUntil: 'networkidle0', timeout: 30000 });
    
    await tab.screenshot({ path: path.join(SCREENSHOTS_DIR, 'live_prices.png') });
    console.log('✓ Screenshot saved as live_prices.png');
  } catch (e) {
    console.log('✗ Error: ' + e.message);
  }
  
  await browser.close();
}

run();

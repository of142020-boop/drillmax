const puppeteer = require('puppeteer');
const path = require('path');

const SCREENSHOTS_DIR = 'C:/Users/omar/.gemini/antigravity-ide/brain/9005b48e-9527-437a-a4c0-dd3cb971de87/screenshots';

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
  });

  const tab = await browser.newPage();
  await tab.setViewport({ width: 1536, height: 800 });
  
  try {
    console.log('Fetching live exhaust fans page...');
    await tab.goto('https://drilmax.com/%d9%81%d9%86%d9%8a-%d8%b4%d9%81%d8%a7%d8%b7%d8%a7%d8%aa/', { waitUntil: 'networkidle0', timeout: 30000 });
    
    await tab.screenshot({ path: path.join(SCREENSHOTS_DIR, 'live_exhaust_fans.png') });
    console.log('Screenshot saved!');
  } catch (e) {
    console.log('Error: ' + e.message);
  }
  
  await browser.close();
}

run();

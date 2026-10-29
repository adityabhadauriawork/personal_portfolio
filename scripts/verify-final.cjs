const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.join(__dirname, '..', 'public', 'verify-final');

async function run() {
  fs.mkdirSync(outDir, { recursive: true });
  console.log('Launching browser for FINAL comprehensive verification...');

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
  });

  const page = await browser.newPage();
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[console.error] ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // 1. Check Home route '/'
  console.log('1. Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await sleep(1500);
  await page.screenshot({ path: path.join(outDir, '01_home_3d_hero.png') });
  console.log('Captured 01_home_3d_hero.png');

  // 2. Direct navigation to /about
  console.log('2. Navigating to http://localhost:5173/about ...');
  await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle0' });
  await sleep(1500);

  // 3. Check Achievements & LeetCode / DSA card
  console.log('3. Scrolling to #achievements ...');
  await page.evaluate(() => {
    document.querySelector('#achievements')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(1200);
  await page.screenshot({ path: path.join(outDir, '02_achievements_and_dsa.png') });
  console.log('Captured 02_achievements_and_dsa.png');

  const dsaCardCheck = await page.evaluate(() => {
    const dsaCard = document.querySelector('[class*="dsaCard"]');
    const dsaText = dsaCard ? dsaCard.textContent : '';
    const hasFlip = dsaCard?.classList.contains('isFlipped') || false;
    const leetcodeLink = document.querySelector('a[href*="leetcode.com/u/"]');
    return {
      hasDsaCard: Boolean(dsaCard),
      hasFlip,
      contains400: dsaText.includes('400+ DSA problems solved'),
      leetcodeHref: leetcodeLink?.getAttribute('href'),
      leetcodeTarget: leetcodeLink?.getAttribute('target'),
    };
  });
  console.log('DSA Card Check:', JSON.stringify(dsaCardCheck, null, 2));

  // 4. Check Certificates section (#certificates)
  console.log('4. Scrolling to #certificates ...');
  await page.evaluate(() => {
    document.querySelector('#certificates')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(1200);
  await page.screenshot({ path: path.join(outDir, '03_certificates_layout.png') });
  console.log('Captured 03_certificates_layout.png');

  // 5. Check Activities section (#activities)
  console.log('5. Scrolling to #activities ...');
  await page.evaluate(() => {
    document.querySelector('#activities')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(1200);
  await page.screenshot({ path: path.join(outDir, '04_activities_section.png') });
  console.log('Captured 04_activities_section.png');

  const activitiesCheck = await page.evaluate(() => {
    const section = document.querySelector('#activities');
    const cards = section?.querySelectorAll('[class*="activityCard"]') || [];
    return {
      hasSection: Boolean(section),
      cardCount: cards.length,
      firstTitle: cards[0]?.querySelector('h3')?.textContent?.trim(),
    };
  });
  console.log('Activities Check:', JSON.stringify(activitiesCheck, null, 2));

  // 6. Check CV section (#cv)
  console.log('6. Scrolling to #cv ...');
  await page.evaluate(() => {
    document.querySelector('#cv')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(1000);
  await page.screenshot({ path: path.join(outDir, '05_cv_section.png') });
  console.log('Captured 05_cv_section.png');

  // 7. Check Contact section (#contact)
  console.log('7. Scrolling to #contact ...');
  await page.evaluate(() => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(1200);
  await page.screenshot({ path: path.join(outDir, '06_contact_flower_window.png') });
  console.log('Captured 06_contact_flower_window.png');

  const contactCheck = await page.evaluate(() => {
    const section = document.querySelector('#contact');
    const flowerImg = section?.querySelector('img[src*="contact-flower.gif"]');
    const hasCat = Boolean(document.querySelector('canvas[class*="cat"]') || document.querySelector('[class*="catStage"]'));
    const closingLine = section?.querySelector('[class*="closingLine"]')?.textContent?.trim();
    return {
      hasFlowerGif: Boolean(flowerImg),
      flowerSrc: flowerImg?.getAttribute('src'),
      hasCat,
      closingLine,
    };
  });
  console.log('Contact Check:', JSON.stringify(contactCheck, null, 2));

  // 8. Mobile Responsiveness Check (390x844)
  console.log('8. Testing Mobile Responsiveness (390x844)...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  await page.evaluate(() => {
    document.querySelector('#certificates')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(800);
  await page.screenshot({ path: path.join(outDir, '07_mobile_certificates.png') });

  await page.evaluate(() => {
    document.querySelector('#activities')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(800);
  await page.screenshot({ path: path.join(outDir, '08_mobile_activities.png') });

  await page.evaluate(() => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(800);
  await page.screenshot({ path: path.join(outDir, '09_mobile_contact.png') });

  const overflowCheck = await page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const bodyScrollWidth = document.body.scrollWidth;
    const docScrollWidth = document.documentElement.scrollWidth;
    return {
      docWidth,
      bodyScrollWidth,
      docScrollWidth,
      hasHorizontalOverflow: bodyScrollWidth > docWidth || docScrollWidth > docWidth,
    };
  });
  console.log('Mobile Overflow Check:', JSON.stringify(overflowCheck, null, 2));

  console.log('Captured Console Errors:', errors);
  await browser.close();
  console.log('FINAL VERIFICATION COMPLETED SUCCESSFULLY.');
}

run().catch((e) => {
  console.error('FINAL VERIFICATION FAILED:', e);
  process.exit(1);
});

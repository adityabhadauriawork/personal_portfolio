const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.join(__dirname, '..', 'public', 'verify-phase3-2');

async function run() {
  fs.mkdirSync(outDir, { recursive: true });
  console.log('Launching browser to verify Phase 3.2...');

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

  // 1. Direct navigation to /about
  console.log('1. Navigating to http://localhost:5173/about ...');
  await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle0' });
  await sleep(1500);

  // 2. Navigate to Certificates section (#certificates)
  console.log('2. Scrolling to #certificates ...');
  await page.evaluate(() => {
    document.querySelector('#certificates')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(1200);
  await page.screenshot({ path: path.join(outDir, '01_desktop_certificates_layout.png') });
  console.log('Saved 01_desktop_certificates_layout.png');

  // Check Certificates metrics
  const certMetrics = await page.evaluate(() => {
    const section = document.querySelector('#certificates');
    const header = section?.querySelector('[class*="header"]');
    const h2 = header?.querySelector('h2');
    const nav = document.querySelector('header');
    const navRect = nav ? nav.getBoundingClientRect() : null;
    const headerRect = header ? header.getBoundingClientRect() : null;
    const h2Rect = h2 ? h2.getBoundingClientRect() : null;
    return {
      navBottom: navRect ? navRect.bottom : null,
      headerTop: headerRect ? headerRect.top : null,
      h2Top: h2Rect ? h2Rect.top : null,
      h2Text: h2?.textContent?.trim(),
      clearance: headerRect && navRect ? headerRect.top - navRect.bottom : null,
    };
  });
  console.log('Certificates Metrics:', JSON.stringify(certMetrics, null, 2));

  // 3. Navigate to Contact section (#contact)
  console.log('3. Scrolling to #contact ...');
  await page.evaluate(() => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(1200);
  await page.screenshot({ path: path.join(outDir, '02_desktop_contact_composition.png') });
  console.log('Saved 02_desktop_contact_composition.png');

  // Check Contact metrics & content
  const contactMetrics = await page.evaluate(() => {
    const section = document.querySelector('#contact');
    const nav = document.querySelector('header');
    const navRect = nav ? nav.getBoundingClientRect() : null;
    const h2 = section?.querySelector('h2');
    const h2Rect = h2 ? h2.getBoundingClientRect() : null;
    const closingLine = section?.querySelector('[class*="closingLine"]')?.textContent?.trim();
    const links = Array.from(section?.querySelectorAll('[class*="linkTile"]') || []).map((t) => {
      const label = t.querySelector('[class*="tileLabel"]')?.textContent?.trim();
      const val = t.querySelector('[class*="tileValue"]')?.textContent?.trim();
      return { label, val };
    });
    const hasCat = Boolean(document.querySelector('canvas[class*="cat"]') || document.querySelector('[class*="catStage"]'));
    const botanicalWindow = Boolean(section?.querySelector('[class*="windowFrame"]'));
    const svgFlower = Boolean(section?.querySelector('svg[class*="botanicalSvg"]'));

    return {
      navBottom: navRect?.bottom,
      h2Top: h2Rect?.top,
      clearance: h2Rect && navRect ? h2Rect.top - navRect.bottom : null,
      h2Text: h2?.textContent?.trim(),
      closingLine,
      links,
      hasCat,
      botanicalWindow,
      svgFlower,
    };
  });
  console.log('Contact Metrics:', JSON.stringify(contactMetrics, null, 2));

  // 4. Test Mobile Viewport (iPhone 14 / modern phone width: 390x844)
  console.log('4. Testing Mobile Viewport (390x844)...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.evaluate(() => {
    document.querySelector('#certificates')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(1000);
  await page.screenshot({ path: path.join(outDir, '03_mobile_certificates.png') });
  console.log('Saved 03_mobile_certificates.png');

  await page.evaluate(() => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(1000);
  await page.screenshot({ path: path.join(outDir, '04_mobile_contact.png') });
  console.log('Saved 04_mobile_contact.png');

  // 5. Test Copy Email interaction
  console.log('5. Testing Copy Email button...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
  await page.evaluate(() => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(600);
  const copyBtn = await page.$('#contact [class*="copyInlineBtn"]');
  if (copyBtn) {
    await copyBtn.click();
    await sleep(400);
  }
  await page.screenshot({ path: path.join(outDir, '05_contact_copy_toast.png') });
  console.log('Saved 05_contact_copy_toast.png');

  console.log('Console Errors captured:', errors);
  await browser.close();
  console.log('Verification script completed successfully.');
}

run().catch((e) => {
  console.error('FAILED', e);
  process.exit(1);
});

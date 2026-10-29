import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 }
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle0' });

  // 1. Check Education Footers
  const eduCheck = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#education [class*="academicIdCard"]'));
    return cards.map(c => {
      const h3 = c.querySelector('h3')?.textContent?.trim();
      const footer = c.querySelector('[class*="securityFooter"]')?.textContent?.trim() || 'NO_FOOTER';
      return { institution: h3, footer };
    });
  });
  console.log('EDUCATION CHECK:', JSON.stringify(eduCheck, null, 2));

  // 2. Scroll directly to #contact
  await page.evaluate(() => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'public/verify-phase3-1/contact_cat_direct.png' });
  console.log('Saved: contact_cat_direct.png');

  await browser.close();
}

run().catch(console.error);

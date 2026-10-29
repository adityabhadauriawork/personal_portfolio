import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  const rules = await page.evaluate(async () => {
    const mod = await import('/src/components/narrative/Chapter11_Contact.module.css');
    return Object.keys(mod.default || mod);
  });

  console.log('EXPORTED KEYS FROM Chapter11_Contact.module.css:\n', rules);
  await browser.close();
}

run();

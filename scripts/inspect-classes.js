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
  await new Promise(r => setTimeout(r, 2500));

  const contactChildren = await page.evaluate(() => {
    const contact = document.querySelector('#contact');
    return contact ? contact.innerHTML : 'no contact';
  });

  console.log('CONTACT INNER HTML:\n', contactChildren.slice(0, 1500));
  await browser.close();
}

run();

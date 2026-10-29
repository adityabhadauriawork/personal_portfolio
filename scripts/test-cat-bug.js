import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testCatBug() {
  console.log('Testing cat interaction & pointer/space bug reproduction...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: false, // run with window to observe visual state
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => {
    console.error('PAGE ERROR CAUGHT:', err);
    errors.push(err);
  });

  await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  console.log('Scrolling to contact section...');
  await page.evaluate(() => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1000));

  // Find cat canvas position
  const catRect = await page.evaluate(() => {
    const canvas = document.querySelector('canvas') || document.querySelector('[class*="webglCanvas"]');
    if (!canvas) return null;
    const r = canvas.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, width: r.width, height: r.height };
  });

  console.log('Cat Rect:', catRect);

  if (catRect) {
    console.log('Moving mouse around cat canvas...');
    for (let i = 0; i < 20; i++) {
      const offsetX = (Math.random() - 0.5) * catRect.width;
      const offsetY = (Math.random() - 0.5) * catRect.height;
      await page.mouse.move(catRect.x + offsetX, catRect.y + offsetY, { steps: 5 });
      await new Promise(r => setTimeout(r, 50));
    }

    console.log('Pressing Space over cat...');
    await page.keyboard.press('Space');
    await new Promise(r => setTimeout(r, 200));

    console.log('Rapid mouse movement between cat and contact links...');
    for (let i = 0; i < 10; i++) {
      await page.mouse.move(catRect.x, catRect.y, { steps: 3 });
      await page.mouse.move(catRect.x + 400, catRect.y, { steps: 5 }); // to links
      await page.mouse.move(catRect.x, catRect.y, { steps: 3 });
    }

    console.log('Moving pointer outside viewport...');
    await page.mouse.move(-50, -50);
    await new Promise(r => setTimeout(r, 500));

    console.log('Returning pointer to cat and pressing Space and Tab...');
    await page.mouse.move(catRect.x, catRect.y, { steps: 5 });
    await page.keyboard.press('Space');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 500));
  }

  // Check if root is empty or error exists
  const rootStatus = await page.evaluate(() => {
    const root = document.getElementById('root');
    const hasCanvas = !!document.querySelector('canvas');
    const bodyChildren = document.body.children.length;
    return {
      rootEmpty: !root || root.innerHTML.trim() === '',
      hasCanvas,
      bodyChildren,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    };
  });

  console.log('Root status after tests:', rootStatus);
  console.log('Total errors caught:', errors.length);

  await page.screenshot({ path: 'public/test-cat-bug.png' });
  await browser.close();
}

testCatBug().catch(console.error);

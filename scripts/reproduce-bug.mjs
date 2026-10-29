import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function reproduce() {
  console.log('Launching browser for WebGL / Music / Cursor reproduction test...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle'],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    if (type === 'error' || type === 'warning' || text.includes('WebGL') || text.includes('THREE') || text.includes('GL_')) {
      console.log(`[CONSOLE ${type.toUpperCase()}]: ${text}`);
    }
  });

  page.on('pageerror', err => {
    console.error('[PAGEERROR]:', err);
  });

  console.log('Navigating to http://localhost:5173/about...');
  await page.goto('http://localhost:5173/about', { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#contact', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 1000));

  // Toggle sound ON
  console.log('Enabling background music...');
  const soundButton = await page.$('button[aria-label*="sound" i], button[aria-label*="audio" i], [class*="sound" i] button');
  if (soundButton) {
    await soundButton.click();
    console.log('Clicked sound button');
  } else {
    // Or evaluate in window to activate sound
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.toLowerCase().includes('sound'));
      if (btn) btn.click();
    });
  }

  await new Promise(r => setTimeout(r, 1000));

  console.log('Scrolling down to Contact section...');
  await page.evaluate(() => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 1000));

  console.log('Beginning cursor leave / enter loop (30 iterations)...');
  for (let i = 0; i < 30; i++) {
    // Move outside content
    await page.mouse.move(-100, -100);
    // Trigger window blur / mouseleave if needed
    await page.evaluate(() => {
      document.dispatchEvent(new MouseEvent('mouseleave'));
    });
    await new Promise(r => setTimeout(r, 80));

    // Move back inside
    await page.mouse.move(700, 450);
    await page.evaluate(() => {
      document.dispatchEvent(new MouseEvent('mouseenter'));
    });
    await new Promise(r => setTimeout(r, 120));
  }

  console.log('Finished 30 iterations. Checking page health...');
  const health = await page.evaluate(() => {
    const root = document.getElementById('root');
    const canvases = document.querySelectorAll('canvas');
    return {
      rootHasChildren: root ? root.children.length : 0,
      canvasCount: canvases.length,
      bodyTextLength: document.body.innerText.length,
    };
  });
  console.log('Health report:', health);

  await browser.close();
  console.log('Reproduction run finished.');
}

reproduce().catch(console.error);

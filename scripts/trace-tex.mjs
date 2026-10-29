import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function traceTexStorage() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle'],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('DETAIL:') || text.includes('immutable')) {
      console.log('TRACE:', text);
    }
  });

  await page.evaluateOnNewDocument(() => {
    // Intercept texStorage2D and inspect active texture
    if (typeof WebGL2RenderingContext !== 'undefined') {
      const orig = WebGL2RenderingContext.prototype.texStorage2D;
      WebGL2RenderingContext.prototype.texStorage2D = function(target, levels, internalformat, width, height) {
        console.log(`DETAIL: texStorage2D target=${target}, levels=${levels}, format=${internalformat}, size=${width}x${height}`);
        return orig.apply(this, arguments);
      };
    }
  });

  console.log('Navigating...');
  await page.goto('http://localhost:5173/about', { waitUntil: 'load', timeout: 20000 });
  
  // Inspect Three.js textures in window
  const textureInfo = await page.evaluate(() => {
    // Traverse scenes or renderers if accessible
    return window.__THREE__;
  });
  console.log('window.__THREE__:', textureInfo);

  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
}

traceTexStorage().catch(console.error);

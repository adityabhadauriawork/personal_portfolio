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
    console.log('CONSOLE:', msg.text());
  });

  await page.evaluateOnNewDocument(() => {
    const contextIds = new WeakMap();
    let nextCtxId = 1;
    const texStorageCalls = new WeakMap();

    if (typeof WebGL2RenderingContext !== 'undefined') {
      const origTexStorage2D = WebGL2RenderingContext.prototype.texStorage2D;
      const origBindTexture = WebGL2RenderingContext.prototype.bindTexture;
      const currentBoundTex = new WeakMap();

      WebGL2RenderingContext.prototype.bindTexture = function(target, texture) {
        if (target === this.TEXTURE_2D) {
          currentBoundTex.set(this, texture);
        }
        return origBindTexture.apply(this, arguments);
      };

      WebGL2RenderingContext.prototype.texStorage2D = function(target, levels, internalformat, width, height) {
        if (!contextIds.has(this)) contextIds.set(this, nextCtxId++);
        const ctxId = contextIds.get(this);
        const boundTex = currentBoundTex.get(this);
        const prevCount = texStorageCalls.get(boundTex) || 0;
        texStorageCalls.set(boundTex, prevCount + 1);
        const isImmutable = Boolean(this.getTexParameter(target, this.TEXTURE_IMMUTABLE_FORMAT));
        console.log(`[texStorage2D] Ctx #${ctxId}, Tex: ${boundTex ? 'ID_' + (boundTex.__id || (boundTex.__id = Math.random().toString(36).slice(2, 7))) : 'null'}, callCount=${prevCount + 1}, isImmutable=${isImmutable}, size=${width}x${height}`);
        if (isImmutable) {
          console.warn(`[SKIPPING redundant texStorage2D on immutable texture]`);
          return;
        }
        return origTexStorage2D.apply(this, arguments);
      };
    }
  });

  console.log('Navigating to /about...');
  await page.goto('http://localhost:5173/about', { waitUntil: 'load', timeout: 20000 });
  await new Promise(r => setTimeout(r, 2000));

  await browser.close();
}

traceTexStorage().catch(console.error);

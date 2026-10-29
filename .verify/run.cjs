const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  fs.mkdirSync('shots', { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'],
    defaultViewport: { width: 1600, height: 900 },
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) errors.push(`[${m.type()}] ${m.text().slice(0, 400)}`); });
  page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message.slice(0, 400)));
  page.on('requestfailed', (r) => errors.push('[requestfailed] ' + r.url().slice(0, 120)));

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  await page.goto('http://localhost:5173/', { waitUntil: 'load' });
  await sleep(9000);
  await page.screenshot({ path: 'shots/01_hero.png' });

  // fps sample (software GL: NOT representative of real GPU)
  const fps = await page.evaluate(() => new Promise((res) => {
    let n = 0; const t0 = performance.now();
    const f = () => { n++; if (performance.now() - t0 > 3000) res(n / 3); else requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }));

  // heartbeat frames: 4 shots across 1.5s
  for (let i = 0; i < 4; i++) { await sleep(380); await page.screenshot({ path: `shots/02_beat_${i}.png` }); }

  const info = await page.evaluate(() => ({
    docH: document.documentElement.scrollHeight, vh: innerHeight,
    track: document.getElementById('hero-pinned-track')?.offsetHeight,
    zone: document.getElementById('home-transition-zone')?.offsetHeight,
  }));

  const total = info.docH - info.vh;
  const stops = [0.08, 0.2, 0.34, 0.5, 0.64, 0.78, 0.9, 0.97];
  let k = 0;
  for (const s of stops) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(total * s));
    await sleep(1800);
    await page.screenshot({ path: `shots/03_scroll_${String(k++).padStart(2, '0')}_${Math.round(s * 100)}.png` });
  }
  const ring = await page.evaluate(() => document.querySelector('button[aria-label^="Continue to About"]')?.getAttribute('aria-label'));

  // complete transition
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await sleep(500);
  await page.screenshot({ path: 'shots/04_portal_closing.png' });
  await sleep(1100);
  await page.screenshot({ path: 'shots/05_portal_opening.png' });
  await sleep(1800);
  const path1 = await page.evaluate(() => location.pathname);
  await page.screenshot({ path: 'shots/06_about.png' });

  // reverse
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /Return to 3D World/i.test(b.textContent))?.click());
  await sleep(2600);
  const path2 = await page.evaluate(() => location.pathname);
  await page.screenshot({ path: 'shots/07_back_home.png' });

  console.log(JSON.stringify({ fps, info, ring, path1, path2, errors: [...new Set(errors)].slice(0, 25) }, null, 2));
  await browser.close();
})().catch((e) => { console.error('SCRIPT FAIL', e); process.exit(1); });

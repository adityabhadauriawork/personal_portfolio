import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('public', 'verify-screenshots');
fs.mkdirSync(outDir, { recursive: true });

async function run() {
  console.log('Launching Chrome from:', chromePath);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
  });

  const page = await browser.newPage();
  
  // Listen for console logs
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for 3D world to render and loader to dismiss
  await new Promise(r => setTimeout(r, 2500));

  // 1. Full Hero Opening View (Beat 1)
  const heroPath = path.join(outDir, '01_hero_opening.png');
  await page.screenshot({ path: heroPath });
  console.log('Saved:', heroPath);

  // 2. Close-up of Crystalline Heart
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await new Promise(r => setTimeout(r, 600));
  const closeUpPath = path.join(outDir, '02_heart_closeup.png');
  await page.screenshot({
    path: closeUpPath,
    clip: { x: 420, y: 120, width: 600, height: 550 }
  });
  console.log('Saved:', closeUpPath);

  // 3. Mouse Movement Over Heart (Simulate pointer transport & wake)
  console.log('Simulating mouse movement over heart...');
  await page.mouse.move(720, 360);
  await page.mouse.move(760, 340, { steps: 10 });
  await page.mouse.move(680, 380, { steps: 15 });
  await new Promise(r => setTimeout(r, 100));
  const kineticPath = path.join(outDir, '03_heart_kinetic_wake.png');
  await page.screenshot({
    path: kineticPath,
    clip: { x: 420, y: 120, width: 600, height: 550 }
  });
  console.log('Saved:', kineticPath);

  // 4. Scroll Journey: Beat 2 (Who I am)
  console.log('Scrolling to Beat 2...');
  await page.evaluate(() => {
    const track = document.getElementById('hero-pinned-track');
    if (track) {
      window.scrollTo(0, window.innerHeight * 1.2);
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  const beat2Path = path.join(outDir, '04_narrative_beat2.png');
  await page.screenshot({ path: beat2Path });
  console.log('Saved:', beat2Path);

  // 5. Scroll Journey: Beat 3 (How I work)
  console.log('Scrolling to Beat 3...');
  await page.evaluate(() => {
    window.scrollTo(0, window.innerHeight * 1.85);
  });
  await new Promise(r => setTimeout(r, 1000));
  const beat3Path = path.join(outDir, '05_narrative_beat3.png');
  await page.screenshot({ path: beat3Path });
  console.log('Saved:', beat3Path);

  // 6. Scroll Journey: Beat 4 (Engineering philosophy)
  console.log('Scrolling to Beat 4...');
  await page.evaluate(() => {
    window.scrollTo(0, window.innerHeight * 2.75);
  });
  await new Promise(r => setTimeout(r, 1000));
  const beat4Path = path.join(outDir, '06_narrative_beat4.png');
  await page.screenshot({ path: beat4Path });
  console.log('Saved:', beat4Path);

  // 7. Scroll Journey: Beat 5 (Work preview + circular transition)
  console.log('Scrolling to Beat 5...');
  await page.evaluate(() => {
    window.scrollTo(0, window.innerHeight * 3.55);
  });
  await new Promise(r => setTimeout(r, 1000));
  const beat5Path = path.join(outDir, '07_narrative_beat5.png');
  await page.screenshot({ path: beat5Path });
  console.log('Saved:', beat5Path);

  await browser.close();
  console.log('All verification captures completed successfully!');
}

run().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});

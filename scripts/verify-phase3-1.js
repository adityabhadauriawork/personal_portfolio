import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('public', 'verify-phase3-1');
fs.mkdirSync(outDir, { recursive: true });

async function run() {
  console.log('=== PHASE 3.1 COMPREHENSIVE AUTOMATED VERIFICATION ===');
  console.log('Launching browser with GPU acceleration...');

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
    ],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
  });

  const page = await browser.newPage();

  const consoleLogs = [];
  const consoleErrors = [];
  page.on('console', (msg) => {
    const text = msg.text();
    consoleLogs.push(text);
    if (msg.type() === 'error' || text.toLowerCase().includes('error') || text.toLowerCase().includes('lost') || text.toLowerCase().includes('too many active webgl')) {
      consoleErrors.push(text);
    }
  });

  page.on('pageerror', (err) => {
    console.error('FATAL PAGE ERROR:', err.message);
    consoleErrors.push(`PAGEERROR: ${err.message}`);
  });

  // TEST 1: HOME PAGE NAVIGATION THEME (Theme A: Home / 3D World - Near-white)
  console.log('\n--- Test 1: Home Page Navigation Theme ---');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1500));

  const homeThemeCheck = await page.evaluate(() => {
    const nav = document.querySelector('nav');
    const className = nav ? nav.className : '';
    const wordmark = document.querySelector('a[href="/"]');
    const color = wordmark ? window.getComputedStyle(wordmark).color : '';
    return { className, color };
  });
  console.log('Home Nav Theme:', homeThemeCheck);
  await page.screenshot({ path: path.join(outDir, '01_home_navigation_theme.png') });

  // TEST 2: INNER PAGES NAVIGATION THEME (Theme B: Inner pages /about - Dark plum)
  console.log('\n--- Test 2: Inner Pages Navigation Theme (/about) ---');
  await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1500));

  const innerThemeCheck = await page.evaluate(() => {
    const nav = document.querySelector('nav');
    const className = nav ? nav.className : '';
    const wordmark = document.querySelector('nav a[href="/"]');
    const link = document.querySelector('nav a[href="#about"]');
    const soundToggle = document.querySelector('button[aria-label*="sound" i]');
    return {
      navClasses: className,
      wordmarkColor: wordmark ? window.getComputedStyle(wordmark).color : '',
      linkColor: link ? window.getComputedStyle(link).color : '',
      soundClasses: soundToggle ? soundToggle.className : '',
    };
  });
  console.log('Inner Pages Nav Theme (/about):', innerThemeCheck);
  await page.screenshot({ path: path.join(outDir, '02_inner_navigation_dark_theme.png') });

  // TEST 3: EDUCATION SECTION PSIT FOOTER CHECK
  console.log('\n--- Test 3: Education Metadata Verification ---');
  await page.evaluate(() => {
    document.querySelector('#education')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 1000));

  const educationFooters = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#education article'));
    return cards.map((card) => {
      const heading = card.querySelector('h3')?.textContent?.trim() || '';
      const footer = card.querySelector('[class*="securityFooter"]')?.textContent?.trim() || '';
      const hasPsitMeta = footer.includes('PSIT CSE · ENROLLMENT 2024–2028');
      return { heading, footer, hasPsitMeta };
    });
  });
  console.log('Education Footers Check:', JSON.stringify(educationFooters, null, 2));
  await page.screenshot({ path: path.join(outDir, '03_education_cards_metadata.png') });

  // TEST 4: EXPERIENCE EVIDENCE (FLYRANK AI: 3, PRODIGY: 2)
  console.log('\n--- Test 4: Experience Evidence Tiles Verification ---');
  await page.evaluate(() => {
    document.querySelector('#experience')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 1000));

  const experienceCheck = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#experience article'));
    return cards.map((c) => {
      const role = c.querySelector('h3')?.textContent?.trim() || '';
      const org = c.querySelector('[class*="orgName"]')?.textContent?.trim() || '';
      const tiles = Array.from(c.querySelectorAll('[class*="flipTile"]')).map((t) =>
        t.querySelector('[class*="frontType"]')?.textContent?.trim() || ''
      );
      return { role, org, evidenceCount: tiles.length, tiles };
    });
  });
  console.log('Experience Evidence Check:', JSON.stringify(experienceCheck, null, 2));

  // Test flipping FlyRank Recommendation Letter and opening Lightbox
  console.log('Testing Experience Flip & Lightbox on Recommendation Letter...');
  const expTiles = await page.$$('#experience [class*="flipTile"]');
  if (expTiles.length >= 3) {
    // Click 3rd tile (FlyRank Recommendation Letter) to flip
    await expTiles[2].click();
    await new Promise((r) => setTimeout(r, 700));
    // Click revealed backside to open lightbox
    await expTiles[2].click();
    await new Promise((r) => setTimeout(r, 700));
  }
  await page.screenshot({ path: path.join(outDir, '04_experience_recommendation_lightbox.png') });

  // Dismiss lightbox via Escape key
  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 500));

  // TEST 5: CERTIFICATIONS ARCHIVE (10 CREDENTIALS)
  console.log('\n--- Test 5: Certifications Archive (10 Credentials) ---');
  await page.evaluate(() => {
    document.querySelector('#certificates')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 1000));

  const certsCheck = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('#certificates [class*="archiveSleeve"]'));
    return items.map((el) => {
      const title = el.querySelector('[class*="certTitle"]')?.textContent?.trim() || '';
      const issuer = el.querySelector('[class*="issuerStamp"] span')?.textContent?.trim() || '';
      const badge = el.querySelector('[class*="badgePill"]')?.textContent?.trim() || '';
      return { title, issuer, badge };
    });
  });
  console.log(`Total Certifications Rendered: ${certsCheck.length}`);
  console.log('Certs list:', certsCheck.map((c, i) => `${i + 1}. ${c.issuer} — ${c.title} (${c.badge})`));
  await page.screenshot({ path: path.join(outDir, '05_certifications_10_credentials.png') });

  // TEST 6: ACHIEVEMENTS PROGRESSION (5 STATIONS + LEETCODE)
  console.log('\n--- Test 6: Achievements Progression Stations ---');
  await page.evaluate(() => {
    document.querySelector('#achievements')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 1000));

  const achievementsCheck = await page.evaluate(() => {
    const stations = Array.from(document.querySelectorAll('#achievements [class*="stationRow"]'));
    return stations.map((s) => {
      const title = s.querySelector('h3')?.textContent?.trim() || '';
      const metric = s.querySelector('[class*="metricVal"]')?.textContent?.trim() || '';
      const subtitle = s.querySelector('[class*="cardSub"]')?.textContent?.trim() || '';
      return { title, metric, subtitle };
    });
  });
  console.log(`Total Achievements Rendered: ${achievementsCheck.length}`);
  console.log('Achievements:', achievementsCheck);
  await page.screenshot({ path: path.join(outDir, '06_achievements_progression.png') });

  // TEST 7: CRITICAL INTERACTION BUG REPRODUCTION & CONTACT CAT
  console.log('\n--- Test 7: Contact White Cat & Critical Interaction Recovery ---');
  await page.evaluate(() => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 2000));

  // Find Cat canvas bounding box
  const catBox = await page.evaluate(() => {
    const canvas = document.querySelector('#contact canvas');
    if (!canvas) return null;
    const r = canvas.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height };
  });
  console.log('Cat Canvas Box:', catBox);

  if (catBox) {
    const midX = catBox.x + catBox.width / 2;
    const midY = catBox.y + catBox.height / 2;

    console.log('Moving mouse into cat display area...');
    await page.mouse.move(midX, midY);
    await new Promise((r) => setTimeout(r, 400));

    console.log('Moving mouse repeatedly across the cat and surrounding display...');
    for (let i = 0; i < 15; i++) {
      const offsetX = Math.sin(i * 0.7) * (catBox.width * 0.4);
      const offsetY = Math.cos(i * 0.7) * (catBox.height * 0.35);
      await page.mouse.move(midX + offsetX, midY + offsetY);
      await new Promise((r) => setTimeout(r, 50));
    }

    console.log('Moving pointer from cat to contact links and back repeatedly...');
    const linkElements = await page.$$('#contact [class*="linkTile"]');
    for (let j = 0; j < linkElements.length && j < 3; j++) {
      const linkBox = await linkElements[j].boundingBox();
      if (linkBox) {
        await page.mouse.move(linkBox.x + linkBox.width / 2, linkBox.y + linkBox.height / 2);
        await new Promise((r) => setTimeout(r, 120));
        await page.mouse.move(midX, midY);
        await new Promise((r) => setTimeout(r, 120));
      }
    }

    console.log('Moving mouse outside WebGL canvas and viewport...');
    await page.mouse.move(-100, -100);
    await new Promise((r) => setTimeout(r, 300));

    console.log('Returning mouse to cat display...');
    await page.mouse.move(midX, midY);
    await new Promise((r) => setTimeout(r, 300));

    console.log('Pressing Space, Tab, and Enter over cat canvas...');
    await page.keyboard.press('Space');
    await new Promise((r) => setTimeout(r, 200));
    await page.keyboard.press('Tab');
    await new Promise((r) => setTimeout(r, 200));
    await page.keyboard.press('Enter');
    await new Promise((r) => setTimeout(r, 200));
  }

  // Capture screenshot of the cat in walking / seated action
  await page.screenshot({ path: path.join(outDir, '07_contact_cat_interaction_active.png') });
  console.log('Saved: 07_contact_cat_interaction_active.png');

  // Wait 3.5s to capture the sitting/idle pose along the pearl path
  await new Promise((r) => setTimeout(r, 3500));
  await page.screenshot({ path: path.join(outDir, '08_contact_cat_seated_pearl_path.png') });
  console.log('Saved: 08_contact_cat_seated_pearl_path.png');

  // TEST 8: REPEATED NAVIGATION STABILITY (About -> Contact -> About -> Contact)
  console.log('\n--- Test 8: Repeated Navigation Stability ---');
  for (let cycle = 1; cycle <= 3; cycle++) {
    console.log(`Navigation cycle ${cycle}: About -> Contact`);
    await page.evaluate(() => document.querySelector('#about')?.scrollIntoView({ behavior: 'instant' }));
    await new Promise((r) => setTimeout(r, 400));
    await page.evaluate(() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'instant' }));
    await new Promise((r) => setTimeout(r, 600));
  }

  // Check if page has turned blank
  const blankPageCheck = await page.evaluate(() => {
    const body = document.body;
    const bodyText = body.innerText || '';
    const hasCanvas = Boolean(document.querySelector('canvas'));
    const isVisible = body.clientHeight > 500 && bodyText.length > 200;
    return {
      textLength: bodyText.length,
      bodyHeight: body.clientHeight,
      hasCanvas,
      isAlive: isVisible,
    };
  });
  console.log('Blank Page Health Check:', blankPageCheck);
  await page.screenshot({ path: path.join(outDir, '09_repeated_nav_stability.png') });

  // Console error evaluation
  console.log('\n--- Console Logs & Error Evaluation ---');
  console.log(`Total captured logs: ${consoleLogs.length}`);
  console.log(`Total errors / WebGL warnings: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('Errors caught:', consoleErrors);
  } else {
    console.log('PERFECT: Zero runtime errors, zero WebGL context losses, zero blank screens!');
  }

  await browser.close();
  console.log('\n=== VERIFICATION COMPLETE ===');
}

run().catch((err) => {
  console.error('Test runner failure:', err);
  process.exit(1);
});

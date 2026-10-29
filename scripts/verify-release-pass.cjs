const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.join(__dirname, '..', 'public', 'verify-release');

async function run() {
  fs.mkdirSync(outDir, { recursive: true });
  console.log('====================================================');
  console.log('STARTING FINAL RELEASE VERIFICATION AUDIT');
  console.log('====================================================');

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  const networkErrors = [];

  page.on('console', (m) => {
    if (m.type() === 'error') {
      consoleErrors.push(`[console.error] ${m.text()}`);
    }
  });

  page.on('pageerror', (e) => {
    consoleErrors.push(`[pageerror] ${e.message}`);
  });

  page.on('requestfailed', (req) => {
    networkErrors.push(`[requestfailed] ${req.url()} (${req.failure()?.errorText})`);
  });

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // --- 1. Load Page ---
  console.log('\n[1/7] Navigating to http://localhost:5173/about ...');
  const navResponse = await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle0', timeout: 15000 });
  console.log(`Page HTTP status: ${navResponse.status()}`);
  await sleep(1500);

  // Take Hero Screenshot
  await page.screenshot({ path: path.join(outDir, '01-hero-desktop.png') });
  console.log('Captured 01-hero-desktop.png');

  // --- 2. Cursor Sparkle Effect Verification ---
  console.log('\n[2/7] Testing Cursor Sparkle Trail and Mouse Movement...');
  // Move mouse across several points to simulate natural human motion
  const mousePoints = [
    { x: 300, y: 300 },
    { x: 350, y: 310 },
    { x: 420, y: 330 },
    { x: 500, y: 370 },
    { x: 600, y: 420 },
    { x: 750, y: 480 },
    { x: 850, y: 520 },
  ];

  for (const pt of mousePoints) {
    await page.mouse.move(pt.x, pt.y, { steps: 5 });
    await sleep(40);
  }

  // Check sparkle canvas state and cursor overlay
  const cursorAudit = await page.evaluate(() => {
    const root = document.querySelector('[class*="cursorRoot"]');
    const canvases = document.querySelectorAll('[class*="cursorCanvas"]');
    const isVisible = root && !root.className.includes('hidden');
    return {
      rootExists: Boolean(root),
      canvasCount: canvases.length,
      isVisible: Boolean(isVisible),
      pointerEvents: root ? window.getComputedStyle(root).pointerEvents : null,
      zIndex: root ? window.getComputedStyle(root).zIndex : null,
    };
  });
  console.log('Cursor overlay check:', JSON.stringify(cursorAudit));

  await page.screenshot({ path: path.join(outDir, '02-cursor-interaction.png') });
  console.log('Captured 02-cursor-interaction.png');

  // --- 3. Section Navigation & Header Clearance Audit ---
  console.log('\n[3/7] Auditing All Sections and Navigation Header Clearance...');
  const sectionIds = [
    'about',
    'approach',
    'projects',
    'experience',
    'achievements',
    'certificates',
    'activities',
    'skills',
    'cv',
    'contact',
  ];

  const sectionAuditResults = [];

  for (const id of sectionIds) {
    const res = await page.evaluate((secId) => {
      const el = document.getElementById(secId);
      if (!el) return { id: secId, found: false };

      el.scrollIntoView({ behavior: 'instant', block: 'start' });
      const nav = document.querySelector('header');
      const navBottom = nav ? nav.getBoundingClientRect().bottom : 0;
      const heading = el.querySelector('h2, h1');
      const headingTop = heading ? heading.getBoundingClientRect().top : el.getBoundingClientRect().top;

      return {
        id: secId,
        found: true,
        headingTop,
        navBottom,
        isObscured: headingTop < navBottom - 2, // 2px margin of error
      };
    }, id);

    sectionAuditResults.push(res);
    await sleep(250);
  }

  console.log('Section Header Clearance Audit:');
  sectionAuditResults.forEach((r) => {
    console.log(`  #${r.id}: found=${r.found}, headingTop=${Math.round(r.headingTop)}px, navBottom=${Math.round(r.navBottom)}px, obscured=${r.isObscured}`);
  });

  // --- 4. Deep Inspection of Critical Components ---
  console.log('\n[4/7] Deep Inspecting Achievements, Certificates, Experience, and Contact...');

  // A. Achievements & DSA Audit
  await page.evaluate(() => {
    document.getElementById('achievements')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(600);

  const achievementsAudit = await page.evaluate(() => {
    const sec = document.getElementById('achievements');
    const cards = Array.from(sec?.querySelectorAll('[class*="flipCard"]') || []);
    const dsaCard = sec?.querySelector('[class*="dsaCard"]');
    const dsaHeadline = dsaCard?.querySelector('h3')?.textContent || '';
    const dsaLink = dsaCard?.querySelector('a')?.href || '';

    // Check Samsung AI rank distinction
    const samsungCard = cards.find((c) => c.textContent?.includes('Samsung'));
    const samsungText = samsungCard ? samsungCard.textContent : '';

    return {
      cardCount: cards.length,
      hasDsaCard: Boolean(dsaCard),
      dsaHeadline,
      dsaLink,
      samsungTextSnippet: samsungText ? samsungText.substring(0, 160) : 'none',
    };
  });
  console.log('Achievements Audit:', JSON.stringify(achievementsAudit, null, 2));
  await page.screenshot({ path: path.join(outDir, '03-achievements-dsa.png') });

  // B. Certificates Audit
  await page.evaluate(() => {
    document.getElementById('certificates')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(600);

  const certsAudit = await page.evaluate(() => {
    const sec = document.getElementById('certificates');
    const cards = Array.from(sec?.querySelectorAll('[class*="archiveSleeve"]') || []);
    let anyOverflow = false;

    cards.forEach((c) => {
      const front = c.querySelector('[class*="sleeveFront"]');
      const footer = c.querySelector('[class*="folioBottom"]');
      if (front && footer) {
        if (footer.getBoundingClientRect().bottom > front.getBoundingClientRect().bottom + 1) {
          anyOverflow = true;
        }
      }
    });

    return {
      certificateCardCount: cards.length,
      anyOverflow,
    };
  });
  console.log('Certificates Audit:', JSON.stringify(certsAudit));
  await page.screenshot({ path: path.join(outDir, '04-certificates.png') });

  // C. Experience Audit
  await page.evaluate(() => {
    document.getElementById('experience')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(600);

  const expAudit = await page.evaluate(() => {
    const sec = document.getElementById('experience');
    const orgs = Array.from(sec?.querySelectorAll('[class*="orgTitle"]') || []).map((o) => o.textContent);
    const docButtons = Array.from(sec?.querySelectorAll('[class*="docTab"], [class*="evidenceTab"]') || []).map((b) => b.textContent?.trim());
    return {
      organizations: orgs,
      docButtonCount: docButtons.length,
      docButtons,
    };
  });
  console.log('Experience Audit:', JSON.stringify(expAudit));
  await page.screenshot({ path: path.join(outDir, '05-experience.png') });

  // D. Contact & Botanical Display Audit
  await page.evaluate(() => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(800);

  const contactAudit = await page.evaluate(() => {
    const sec = document.getElementById('contact');
    const quote = sec?.querySelector('[class*="botanicalQuote"]')?.textContent?.trim();
    const flowerImg = sec?.querySelector('[class*="flowerGif"]');
    const emailLink = sec?.querySelector('a[href^="mailto:"]')?.getAttribute('href');
    const copyBtn = sec?.querySelector('[class*="copyInlineBtn"]');

    // Check for unwanted debug labels
    const textContent = sec ? sec.textContent : '';
    const unwantedTokens = ['BOTANICAL WINDOW', 'LIVING FLORA', 'contact-flower.gif', 'expectedFile', 'Luminous Asset Active'];
    const leakedTokens = unwantedTokens.filter((token) => textContent.includes(token));

    return {
      quote,
      flowerImgSrc: flowerImg ? flowerImg.getAttribute('src') : null,
      emailLink,
      hasCopyBtn: Boolean(copyBtn),
      leakedTokens,
    };
  });
  console.log('Contact & Botanical Audit:', JSON.stringify(contactAudit, null, 2));
  await page.screenshot({ path: path.join(outDir, '06-contact-botanical.png') });

  // Test email copy button click
  await page.evaluate(() => {
    const btn = document.querySelector('#contact [class*="copyInlineBtn"]');
    if (btn) btn.click();
  });
  await sleep(500);

  // E. CV Request Audit
  const cvAudit = await page.evaluate(() => {
    const sec = document.getElementById('cv');
    const requestBtn = sec?.querySelector('a[href*="mail.google.com"]');
    const href = requestBtn ? requestBtn.getAttribute('href') : '';
    const hasDownloadLink = Boolean(sec?.querySelector('a[download], a[href*=".pdf"]'));
    return {
      hasRequestBtn: Boolean(requestBtn),
      hrefSnippet: href ? href.substring(0, 80) + '...' : '',
      hasDownloadLink,
    };
  });
  console.log('CV Request Audit:', JSON.stringify(cvAudit, null, 2));

  // --- 5. Mobile Responsiveness Audit (390px iPhone width) ---
  console.log('\n[5/7] Testing Mobile Responsive Layout at 390px ...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle0' });
  await sleep(1500);

  // Check horizontal overflow throughout the page
  const mobileAudit = await page.evaluate(() => {
    const bodyWidth = document.body.offsetWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    const clientWidth = document.documentElement.clientWidth;
    const hasHorizontalOverflow = scrollWidth > clientWidth + 1;

    // Check all sections
    const sections = Array.from(document.querySelectorAll('section'));
    const overflowingSections = [];
    sections.forEach((s) => {
      const rect = s.getBoundingClientRect();
      if (rect.right > clientWidth + 2 || rect.left < -2) {
        overflowingSections.push({ id: s.id, right: rect.right, left: rect.left, clientWidth });
      }
    });

    return {
      clientWidth,
      scrollWidth,
      hasHorizontalOverflow,
      overflowingSections,
    };
  });
  console.log('Mobile 390px Audit:', JSON.stringify(mobileAudit, null, 2));

  await page.screenshot({ path: path.join(outDir, '07-mobile-390px-hero.png') });

  // Scroll to contact on mobile
  await page.evaluate(() => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(600);
  await page.screenshot({ path: path.join(outDir, '08-mobile-390px-contact.png') });

  // --- 6. Security & Console Error Verification ---
  console.log('\n[6/7] Auditing Console & Network Errors...');
  console.log(`Total console errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error('Console Errors:', consoleErrors);
  }
  console.log(`Total network errors: ${networkErrors.length}`);
  if (networkErrors.length > 0) {
    console.error('Network Errors:', networkErrors);
  }

  // --- 7. Final Summary ---
  console.log('\n====================================================');
  console.log('FINAL AUDIT SUMMARY:');
  console.log(`- Sections Verified: ${sectionAuditResults.length} / ${sectionIds.length}`);
  console.log(`- Obscured Headings: ${sectionAuditResults.filter((r) => r.isObscured).length}`);
  console.log(`- Achievements Cards: ${achievementsAudit.cardCount}`);
  console.log(`- Certificates Cards: ${certsAudit.certificateCardCount} (Overflow: ${certsAudit.anyOverflow})`);
  console.log(`- Leaked Debug Tokens: ${contactAudit.leakedTokens.length}`);
  console.log(`- Mobile Horizontal Overflow: ${mobileAudit.hasHorizontalOverflow}`);
  console.log(`- Public PDF Download in CV: ${cvAudit.hasDownloadLink ? 'LEAKED' : 'SECURE (Zero Public PDF)'}`);
  console.log(`- Console Errors: ${consoleErrors.length}`);
  console.log(`- Network Failures: ${networkErrors.length}`);
  console.log('====================================================');

  await browser.close();
}

run().catch((err) => {
  console.error('FATAL AUDIT ERROR:', err);
  process.exit(1);
});

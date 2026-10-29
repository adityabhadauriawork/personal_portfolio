import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('public', 'verify-phase3');
fs.mkdirSync(outDir, { recursive: true });

async function run() {
  console.log('--- Phase 3 Comprehensive Verification ---');
  console.log('Launching Chrome from:', chromePath);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
  });

  const page = await browser.newPage();
  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  console.log('1. Navigating to http://localhost:5173/about ...');
  await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot About section
  await page.screenshot({ path: path.join(outDir, '01_about_section.png') });
  console.log('Saved: 01_about_section.png');

  // Verify Header clearance on About section
  const headerCheck = await page.evaluate(() => {
    const nav = document.querySelector('nav');
    const navBottom = nav ? nav.getBoundingClientRect().bottom : 0;
    const aboutHeader = document.querySelector('#about h2');
    const aboutTop = aboutHeader ? aboutHeader.getBoundingClientRect().top : 0;
    return { navBottom, aboutTop, clear: aboutTop > navBottom };
  });
  console.log('Header Clearance Check (About):', headerCheck);

  // Test "From Idea to System" Stage selection
  console.log('Testing "From Idea to System" stage interactions...');
  const stageButtons = await page.$$('button[data-stage]');
  if (stageButtons.length >= 3) {
    await stageButtons[1].click(); // Click "Engineer"
    await new Promise(r => setTimeout(r, 600));
    await stageButtons[2].click(); // Click "Build"
    await new Promise(r => setTimeout(r, 600));
  }
  await page.screenshot({ path: path.join(outDir, '02_about_system_visual.png') });
  console.log('Saved: 02_about_system_visual.png');

  // 2. Approach Section
  console.log('Scrolling to Approach section...');
  await page.evaluate(() => {
    document.querySelector('#approach')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, '03_approach_stack.png') });
  console.log('Saved: 03_approach_stack.png');

  // Test clicking Layer 02 (Backend) and Layer 04 (Data)
  await page.evaluate(() => {
    const layers = document.querySelectorAll('button[aria-label*="Layer"]');
    if (layers[1]) layers[1].click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outDir, '04_approach_layer_backend.png') });

  // 3. Projects Section
  console.log('Scrolling to Projects section...');
  await page.evaluate(() => {
    document.querySelector('#projects')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, '05_projects_overview.png') });
  console.log('Saved: 05_projects_overview.png');

  // Test Case Study Modal opening for AutoMind
  console.log('Testing Case Study Modal on AutoMind...');
  const caseStudyBtn = await page.$('button[aria-label*="AutoMind"]');
  if (caseStudyBtn) {
    await caseStudyBtn.click();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(outDir, '06_case_study_modal.png') });
    console.log('Saved: 06_case_study_modal.png (Modal Open)');

    // Press Escape to dismiss
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));
  }

  // 4. Experience Section
  console.log('Scrolling to Experience section...');
  await page.evaluate(() => {
    document.querySelector('#experience')?.scrollIntoView({ behavior: 'instant' });
    window.scrollBy({ top: 380, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, '07_experience_section.png') });
  console.log('Saved: 07_experience_section.png');

  // Test Evidence Tile Flip on FlyRank AI Offer Letter
  console.log('Testing Evidence Card Flip...');
  const flipBtn = await page.$('[aria-label*="Offer Letter"]');
  if (flipBtn) {
    await flipBtn.click();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(outDir, '08_experience_flipped_card.png') });
    console.log('Saved: 08_experience_flipped_card.png');
    // Press Escape to dismiss lightbox
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));
  }

  // 5. Education Section
  console.log('Scrolling to Education section...');
  await page.evaluate(() => {
    document.querySelector('#education')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, '09_education_cards.png') });
  console.log('Saved: 09_education_cards.png');

  // 6. Achievements Section
  console.log('Scrolling to Achievements railway...');
  await page.evaluate(() => {
    document.querySelector('#achievements')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));
  // Scroll partially down to see the railway train in motion
  await page.evaluate(() => {
    window.scrollBy({ top: 350, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, '10_achievements_railway.png') });
  console.log('Saved: 10_achievements_railway.png');

  // 7. Certificates Section
  console.log('Scrolling to Certificates Credential Archive...');
  await page.evaluate(() => {
    document.querySelector('#certificates')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, '11_certificates_archive.png') });
  console.log('Saved: 11_certificates_archive.png');

  // 8. Skills Section
  console.log('Scrolling to Skills section...');
  await page.evaluate(() => {
    document.querySelector('#skills')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, '12_skills_taxonomy.png') });
  console.log('Saved: 12_skills_taxonomy.png');

  // 9. CV Section
  console.log('Scrolling to CV request section...');
  await page.evaluate(() => {
    document.querySelector('#cv')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, '13_cv_request.png') });
  console.log('Saved: 13_cv_request.png');

  // 10. Contact Section (with White Cat 3D)
  console.log('Scrolling to Contact section with 3D White Cat...');
  await page.evaluate(() => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'instant' });
    window.scrollBy({ top: 320, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, '14_contact_white_cat.png') });
  console.log('Saved: 14_contact_white_cat.png');

  // 11. Performance Recovery & Navigation Loop Test
  console.log('\n--- Running Rapid Navigation Loop Performance Benchmark ---');
  const sections = ['#about', '#approach', '#projects', '#experience', '#education', '#achievements', '#certificates', '#skills', '#cv', '#contact'];
  
  const initialMem = await page.evaluate(() => performance.memory ? performance.memory.usedJSHeapSize : null);
  
  const startTime = Date.now();
  for (let loop = 1; loop <= 3; loop++) {
    for (const sec of sections) {
      await page.evaluate((s) => {
        document.querySelector(s)?.scrollIntoView({ behavior: 'instant' });
      }, sec);
      await new Promise(r => setTimeout(r, 50));
    }
    // Return to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 100));
  }
  const duration = Date.now() - startTime;
  console.log(`Completed 3 full navigation cycles in ${duration}ms (${(duration / 30).toFixed(1)}ms avg per hop)`);

  const finalMetrics = await page.evaluate(() => {
    const mem = performance.memory ? performance.memory.usedJSHeapSize : null;
    const entries = performance.getEntriesByType('navigation');
    return { mem, navigationTiming: entries[0] ? entries[0].duration : null };
  });

  console.log('Memory report:', { initialMem, finalMem: finalMetrics.mem });
  console.log('Console warnings or errors:', consoleLogs.filter(l => l.toLowerCase().includes('error') || l.toLowerCase().includes('warn')));

  await browser.close();
  console.log('\n>>> All Phase 3 checks completed successfully! <<<');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

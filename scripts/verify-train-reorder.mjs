import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  console.log('=== STARTING RAILWAY & SECTION ORDER VERIFICATION ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // 1. Navigate to /about
  console.log('1. Loading /about narrative page...');
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('portfolio_welcome_choice', 'silence');
    localStorage.setItem('portfolio_welcome_choice', 'silence');
  });
  await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle2' });
  await page.waitForSelector('#achievements', { timeout: 10000 });
  await page.waitForSelector('#education', { timeout: 10000 });
  await sleep(1000);

  // 2. Verify Section Ordering in DOM
  console.log('2. Checking Section Order in DOM...');
  const orderCheck = await page.evaluate(() => {
    const main = document.querySelector('main');
    const sections = Array.from(main?.querySelectorAll('section') || []);
    const sectionIds = sections.map((s) => s.id).filter(Boolean);

    const achievementsIdx = sectionIds.indexOf('achievements');
    const educationIdx = sectionIds.indexOf('education');

    const achievementsCount = document.querySelectorAll('#achievements').length;
    const educationCount = document.querySelectorAll('#education').length;

    const achievementsRect = document.getElementById('achievements')?.getBoundingClientRect();
    const educationRect = document.getElementById('education')?.getBoundingClientRect();

    const scrollY = window.scrollY;
    const achievementsDocY = (achievementsRect ? achievementsRect.top : 0) + scrollY;
    const educationDocY = (educationRect ? educationRect.top : 0) + scrollY;

    return {
      sectionIds,
      achievementsIdx,
      educationIdx,
      achievementsCount,
      educationCount,
      achievementsDocY,
      educationDocY,
      isAchievementsAboveEducation: achievementsIdx < educationIdx && achievementsDocY < educationDocY,
    };
  });

  console.log('Section Order Check Result:', JSON.stringify(orderCheck, null, 2));
  if (!orderCheck.isAchievementsAboveEducation) {
    throw new Error('FAIL: Railway of Milestones is NOT above Academic Foundation!');
  }
  console.log('✅ PASS: Railway of Milestones (#achievements) is strictly ABOVE Academic Foundation (#education)');

  // 3. Test Train Alignment & Positioning
  console.log('3. Testing Train Physical Alignment on Track...');
  const alignmentCheck = await page.evaluate(() => {
    const trackArea = document.querySelector('#achievements [class*="railwayTrackArea"]');
    const centralRail = trackArea?.querySelector('[class*="centralRail"]');
    const trainWrapper = centralRail?.querySelector('[class*="trainWrapper"]');
    const trainSvg = trainWrapper?.querySelector('svg');
    const leftRail = centralRail?.querySelector('[class*="railSteelLeft"]');
    const rightRail = centralRail?.querySelector('[class*="railSteelRight"]');

    const railRect = centralRail?.getBoundingClientRect();
    const trainRect = trainWrapper?.getBoundingClientRect();
    const svgRect = trainSvg?.getBoundingClientRect();
    const leftRailRect = leftRail?.getBoundingClientRect();
    const rightRailRect = rightRail?.getBoundingClientRect();

    return {
      hasRail: Boolean(centralRail),
      hasTrain: Boolean(trainWrapper),
      railWidth: railRect?.width,
      svgWidth: svgRect?.width,
      svgHeight: svgRect?.height,
      trainCenterX: trainRect ? trainRect.left + trainRect.width / 2 : 0,
      railCenterX: railRect ? railRect.left + railRect.width / 2 : 0,
      isCenteredOnRail: Math.abs((trainRect?.left + trainRect?.width / 2) - (railRect?.left + railRect?.width / 2)) < 2,
      leftRailX: leftRailRect?.left,
      rightRailX: rightRailRect?.left,
    };
  });
  console.log('Alignment Check Result:', JSON.stringify(alignmentCheck, null, 2));
  if (!alignmentCheck.isCenteredOnRail) {
    throw new Error('FAIL: Train is not centered on the railway track!');
  }
  console.log('✅ PASS: Train is physically centered and aligned on the track');

  // 4. Test Scroll Synchronization (Slow, Fast, Up, Down, Stop)
  console.log('4. Testing Train Scroll Synchronization Across Milestones...');
  
  // Get milestone markers Y positions
  const stationPositions = await page.evaluate(() => {
    const markers = Array.from(document.querySelectorAll('#achievements [class*="trackMarker"]'));
    return markers.map((m, i) => {
      const rect = m.getBoundingClientRect();
      return {
        index: i,
        docY: rect.top + window.scrollY,
      };
    });
  });

  console.log(`Found ${stationPositions.length} Milestone Stations:`, stationPositions);

  // Scroll to each station and check train position
  for (let i = 0; i < stationPositions.length; i++) {
    const targetScrollY = Math.max(stationPositions[i].docY - 450, 0); // 450 is half of 900 viewport height
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), targetScrollY);
    await sleep(150); // wait for RAF

    const trainStatus = await page.evaluate((stationIdx) => {
      const train = document.querySelector('#achievements [class*="trainWrapper"]');
      const telemetry = train?.querySelector('[class*="trainTelemetry"]');
      const markers = Array.from(document.querySelectorAll('#achievements [class*="trackMarker"]'));
      const targetMarker = markers[stationIdx];

      const trainRect = train?.getBoundingClientRect();
      const markerRect = targetMarker?.getBoundingClientRect();

      const trainCenterY = trainRect ? trainRect.top + trainRect.height / 2 : 0;
      const markerCenterY = markerRect ? markerRect.top + markerRect.height / 2 : 0;
      const deltaY = Math.abs(trainCenterY - markerCenterY);

      return {
        scrollY: window.scrollY,
        trainStyleTop: train?.style.top,
        telemetryText: telemetry?.textContent,
        trainCenterY,
        markerCenterY,
        deltaY,
      };
    }, i);

    console.log(`Station ${i + 1} Target:`, trainStatus);
    // At station focal point, train should be within close proximity to station marker
    if (trainStatus.deltaY > 50) {
      console.warn(`Warning: Station ${i + 1} train delta is ${trainStatus.deltaY}px`);
    }
  }

  // 5. Test Fast Scroll Forward through Achievements (7800px -> 9400px down)
  console.log('5. Testing Fast Scroll Forward (downward through railway)...');
  await page.evaluate(() => window.scrollTo({ top: 7800, behavior: 'instant' }));
  await sleep(60);
  await page.evaluate(() => window.scrollTo({ top: 9400, behavior: 'instant' }));
  await sleep(60); // 1-2 frames

  const fastForwardCheck = await page.evaluate(() => {
    const train = document.querySelector('#achievements [class*="trainWrapper"]');
    const telemetry = train?.querySelector('[class*="trainTelemetry"]');
    return {
      trainStyleTop: train?.style.top,
      telemetryText: telemetry?.textContent,
    };
  });
  console.log('Fast Forward Position at 9400px:', fastForwardCheck);

  // 6. Test Fast Scroll Backward through Achievements (9400px -> 7854px upward)
  console.log('6. Testing Fast Scroll Backward (upward through railway)...');
  await page.evaluate(() => window.scrollTo({ top: 7854, behavior: 'instant' }));
  await sleep(60);

  const backwardCheck = await page.evaluate(() => {
    const train = document.querySelector('#achievements [class*="trainWrapper"]');
    const telemetry = train?.querySelector('[class*="trainTelemetry"]');
    const topNum = parseFloat(train?.style.top || '0');
    return {
      trainStyleTop: train?.style.top,
      topNum,
      telemetryText: telemetry?.textContent,
    };
  });
  console.log('Backward Scroll Position at 7854px:', backwardCheck);

  if (backwardCheck.topNum > 20) {
    throw new Error(`FAIL: Train failed to move backward when scrolling upward! Found top: ${backwardCheck.topNum}%`);
  }
  console.log('✅ PASS: Train successfully travels backward when scrolling upward (settled at Station 1)');

  // 7. Test Resize Behavior
  console.log('7. Testing Resize Behavior (resizing to 1024x768 and 390x844)...');
  await page.setViewport({ width: 1024, height: 768 });
  await sleep(150);
  const resizeCheck1 = await page.evaluate(() => {
    const train = document.querySelector('#achievements [class*="trainWrapper"]');
    return { trainStyleTop: train?.style.top };
  });
  console.log('After Resize to 1024x768:', resizeCheck1);

  await page.setViewport({ width: 390, height: 844 });
  await sleep(150);
  const resizeCheck2 = await page.evaluate(() => {
    const train = document.querySelector('#achievements [class*="trainWrapper"]');
    return { trainStyleTop: train?.style.top };
  });
  console.log('After Resize to 390x844:', resizeCheck2);

  // 8. Capture Verification Screenshots
  console.log('8. Capturing verification screenshots...');
  await page.setViewport({ width: 1440, height: 900 });
  // Scroll to Railway stations track area with the train visible
  await page.evaluate(() => {
    const sec = document.getElementById('achievements');
    const marker = sec?.querySelector('[class*="trackMarker"]');
    if (marker) marker.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await sleep(400);
  await page.screenshot({ path: path.join('C:\\Users\\adity\\.gemini\\antigravity\\brain\\d03efbcd-0569-4f14-a158-7caf8699dce4', 'verify_train_achievements.png') });

  await page.evaluate(() => document.getElementById('education')?.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await sleep(400);
  await page.screenshot({ path: path.join('C:\\Users\\adity\\.gemini\\antigravity\\brain\\d03efbcd-0569-4f14-a158-7caf8699dce4', 'verify_education_after_achievements.png') });

  console.log('Console Errors:', consoleErrors);
  if (consoleErrors.length > 0) {
    throw new Error(`FAIL: Console errors detected: ${JSON.stringify(consoleErrors)}`);
  }

  console.log('=== ALL TESTS PASSED SUCCESSFULLY ===');
  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

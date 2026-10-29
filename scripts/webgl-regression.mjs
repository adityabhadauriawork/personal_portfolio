/**
 * WebGL Regression Test — puppeteer-core
 * Tests: canvas count, context-loss event handlers (preventDefault),
 *        20+ pointer exit/re-entry cycles, tab-hide/show, scroll navigation,
 *        console error/warning collection.
 */
import puppeteer from 'puppeteer-core';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL    = 'http://localhost:5173';
const PASS   = '\x1b[32m✅ PASS\x1b[0m';
const FAIL   = '\x1b[31m❌ FAIL\x1b[0m';
const WARN   = '\x1b[33m⚠️  WARN\x1b[0m';
const INFO   = '\x1b[36mℹ️  INFO\x1b[0m';

const results = [];
const consoleMessages = [];

function record(label, passed, detail = '') {
  const icon = passed ? PASS : FAIL;
  console.log(`${icon}  ${label}${detail ? '  →  ' + detail : ''}`);
  results.push({ label, passed, detail });
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  WebGL Regression Test  —  portfolio @ ' + URL);
  console.log('══════════════════════════════════════════════════════════\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--enable-webgl2',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
    ],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();

  // ── Collect all console output ──────────────────────────────────────────
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    consoleMessages.push({ type, text });
    // Print anything suspicious immediately
    if (
      type === 'error' ||
      text.includes('WebGL') ||
      text.includes('GL_') ||
      text.includes('THREE') ||
      text.includes('context') ||
      text.includes('lost') ||
      text.includes('restored') ||
      text.includes('Error')
    ) {
      console.log(`  ${INFO} [console.${type}] ${text}`);
    }
  });

  page.on('pageerror', err => {
    consoleMessages.push({ type: 'pageerror', text: err.message });
    console.log(`  ${FAIL} [pageerror] ${err.message}`);
  });

  page.on('requestfailed', req => {
    consoleMessages.push({ type: 'requestfailed', text: req.url() + ' — ' + req.failure()?.errorText });
    console.log(`  ${WARN} [requestfailed] ${req.url()}`);
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TEST 1 — Page loads without errors
  // ═══════════════════════════════════════════════════════════════════════
  console.log('\n── Test 1: Initial page load ─────────────────────────────');
  try {
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(3000); // allow Three.js to init
    record('Page loaded without navigation error', true);
  } catch (e) {
    record('Page loaded without navigation error', false, e.message);
    await browser.close();
    printSummary();
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TEST 2 — Canvas count (expect exactly 2)
  // ═══════════════════════════════════════════════════════════════════════
  console.log('\n── Test 2: Canvas count ──────────────────────────────────');
  const canvasInfo = await page.evaluate(() => {
    const cs = [...document.querySelectorAll('canvas')];
    return cs.map((c, i) => ({
      index: i,
      width: c.width,
      height: c.height,
      engine: c.getAttribute('data-engine') || null,
      className: c.className,
    }));
  });
  console.log('  Canvases found:', JSON.stringify(canvasInfo, null, 2));
  record('Exactly 3 canvases present (fluid + sparkle + Three.js)', canvasInfo.length === 3,
    `found ${canvasInfo.length}`);

  // ═══════════════════════════════════════════════════════════════════════
  // TEST 3 — webglcontextlost: e.preventDefault() called on BOTH canvases
  // ═══════════════════════════════════════════════════════════════════════
  console.log('\n── Test 3: Context-loss handler / preventDefault ─────────');
  const preventDefaultResults = await page.evaluate(() => {
    const canvases = [...document.querySelectorAll('canvas')];
    return canvases.map((c, i) => {
      const evt = new WebGLContextEvent('webglcontextlost', { bubbles: false, cancelable: true });
      c.dispatchEvent(evt);
      return { index: i, defaultPrevented: evt.defaultPrevented };
    });
  });
  console.log('  preventDefault results:', preventDefaultResults);
  for (const r of preventDefaultResults) {
    record(
      `Canvas[${r.index}] webglcontextlost → e.preventDefault() called`,
      r.defaultPrevented,
      r.defaultPrevented ? 'browser will fire contextrestored' : 'browser will NOT fire contextrestored — context unrecoverable',
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TEST 4 — 20 pointer exit/re-entry cycles
  //           Uses real mouse.move out-of-viewport + back, plus synthetic
  //           PointerEvents matching our pointerState.ts listeners.
  // ═══════════════════════════════════════════════════════════════════════
  console.log('\n── Test 4: 20 cursor exit/re-entry cycles ────────────────');
  let whiteScreenDetected = false;

  for (let i = 0; i < 20; i++) {
    // Real mouse movement to outside viewport
    await page.mouse.move(-5, -5);
    // Fire synthetic pointer events our listeners track
    await page.evaluate(() => {
      document.dispatchEvent(new PointerEvent('pointerleave', { bubbles: false }));
    });
    await sleep(60);

    // Move back onto page at a varied position
    const x = 300 + (i % 5) * 200;
    const y = 200 + (i % 4) * 150;
    await page.mouse.move(x, y);
    await page.evaluate((cx, cy) => {
      document.dispatchEvent(new PointerEvent('pointerenter', { clientX: cx, clientY: cy, bubbles: false }));
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: cx, clientY: cy, bubbles: true }));
    }, x, y);
    await sleep(100);

    // Spot-check: page content should still be present (not white)
    if (i % 5 === 4) {
      const bodyLen = await page.evaluate(() => document.body.innerText.length);
      if (bodyLen < 100) {
        whiteScreenDetected = true;
        console.log(`  ${FAIL} White screen detected after cycle ${i + 1} (body text: ${bodyLen} chars)`);
      }
    }
  }
  record('20 cursor exit/re-entry cycles — no white screen', !whiteScreenDetected);

  // ═══════════════════════════════════════════════════════════════════════
  // TEST 5 — Tab visibility simulation (5 hide/show cycles)
  // ═══════════════════════════════════════════════════════════════════════
  console.log('\n── Test 5: Tab hide/show cycles ──────────────────────────');
  let tabSwitchFailed = false;
  for (let i = 0; i < 5; i++) {
    // Simulate page hidden
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await sleep(500);

    // Simulate page visible
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: false, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await sleep(300);

    const len = await page.evaluate(() => document.body.innerText.length);
    if (len < 100) {
      tabSwitchFailed = true;
      console.log(`  ${FAIL} Page broken after tab-switch cycle ${i + 1}`);
    }
  }
  record('5 tab hide/show cycles — page stays rendered', !tabSwitchFailed);

  // ═══════════════════════════════════════════════════════════════════════
  // TEST 6 — Scroll to Contact (Chapter 11) and back (3 cycles)
  // ═══════════════════════════════════════════════════════════════════════
  console.log('\n── Test 6: Scroll Hero ↔ Contact × 3 ────────────────────');
  let scrollFailed = false;
  for (let i = 0; i < 3; i++) {
    // Scroll to page bottom — contact is always the final section
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    await sleep(1200);
    const contactOk = await page.evaluate(() => {
      const el = document.getElementById('contact');
      return el !== null && el.children.length > 0;
    });
    if (!contactOk) {
      scrollFailed = true;
      console.log(`  ${FAIL} Contact section missing/empty in scroll cycle ${i + 1}`);
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await sleep(800);
  }
  record('Scroll Hero↔Contact ×3 — contact section in DOM', !scrollFailed);

  // ═══════════════════════════════════════════════════════════════════════
  // TEST 7 — Screenshot verification (hero and contact)
  // ═══════════════════════════════════════════════════════════════════════
  console.log('\n── Test 7: Screenshot capture ────────────────────────────');
  try {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await sleep(1000);
    await page.screenshot({
      path: 'scripts/reg-hero.png',
      fullPage: false,
      type: 'png',
    });
    console.log(`  ${INFO} Hero screenshot → scripts/reg-hero.png`);

    await page.evaluate(() =>
      document.getElementById('contact')?.scrollIntoView({ behavior: 'instant', block: 'center' })
    );
    await sleep(1000);
    await page.screenshot({
      path: 'scripts/reg-contact.png',
      fullPage: false,
      type: 'png',
    });
    console.log(`  ${INFO} Contact screenshot → scripts/reg-contact.png`);
    record('Screenshots captured successfully', true);
  } catch (e) {
    record('Screenshots captured successfully', false, e.message);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TEST 8 — Console error audit
  // ═══════════════════════════════════════════════════════════════════════
  console.log('\n── Test 8: Console error audit ───────────────────────────');
  const webglContextWarnings = consoleMessages.filter(m =>
    m.text.includes('Too many active WebGL contexts') || m.text.includes('oldest context'));
  const glInvalidOp = consoleMessages.filter(m => m.text.includes('GL_INVALID_OPERATION'));
  const threeClockWarn = consoleMessages.filter(m => m.text.includes('THREE.Clock') || m.text.includes('DEPRECATED'));
  const uncaught = consoleMessages.filter(m => m.type === 'pageerror');
  const errors = consoleMessages.filter(m => m.type === 'error');
  const reqFailed = consoleMessages.filter(m => m.type === 'requestfailed');

  record('"Too many active WebGL contexts" absent', webglContextWarnings.length === 0,
    webglContextWarnings.length > 0 ? webglContextWarnings.map(m => m.text).join(' | ') : 'none');
  record('"GL_INVALID_OPERATION" errors absent', glInvalidOp.length === 0,
    glInvalidOp.length > 0 ? glInvalidOp.map(m => m.text).join(' | ') : 'none');
  record('"THREE.Clock" deprecation warnings absent', threeClockWarn.length === 0,
    threeClockWarn.length > 0 ? threeClockWarn.map(m => m.text).join(' | ') : 'none');
  record('No uncaught page errors', uncaught.length === 0,
    uncaught.length > 0 ? uncaught.map(m => m.text).join(' | ') : 'none');
  record('No console.error calls', errors.length === 0,
    errors.length > 0 ? errors.map(m => m.text).slice(0, 3).join(' | ') : 'none');
  record('No failed network requests', reqFailed.length === 0,
    reqFailed.length > 0 ? reqFailed.map(m => m.text).slice(0, 3).join(' | ') : 'none');

  await browser.close();

  printSummary();
}

function printSummary() {
  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  REGRESSION TEST SUMMARY');
  console.log('══════════════════════════════════════════════════════════');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  for (const r of results) {
    const icon = r.passed ? '✅' : '❌';
    console.log(`  ${icon}  ${r.label}${r.detail ? ' — ' + r.detail : ''}`);
  }
  console.log(`\n  Total: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log('\x1b[32m\n  ALL TESTS PASSED\x1b[0m\n');
  } else {
    console.log('\x1b[31m\n  SOME TESTS FAILED — see details above\x1b[0m\n');
    process.exitCode = 1;
  }
}

run().catch(e => {
  console.error('\nFatal error running test:', e);
  process.exit(1);
});

import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = process.env.TEST_URL || 'http://localhost:5173';
const ARTIFACT_DIR = 'C:/Users/adity/.gemini/antigravity/brain/d03efbcd-0569-4f14-a158-7caf8699dce4';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runVerification() {
  console.log('=== STARTING MASTER RELEASE VERIFICATION ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  const consoleWarnings = [];
  const consoleErrors = [];
  const webglContextWarnings = [];

  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('Too many active WebGL contexts')) {
      webglContextWarnings.push(text);
    }
    if (msg.type() === 'warning') {
      consoleWarnings.push(text);
    } else if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  // Track WebGL getContext calls at browser level
  await page.evaluateOnNewDocument(() => {
    window.__webglContextsCreated = 0;
    const origGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      const ctx = origGetContext.call(this, type, ...args);
      if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
        if (!this.__countedWebGL) {
          this.__countedWebGL = true;
          window.__webglContextsCreated++;
        }
      }
      return ctx;
    };
  });

  console.log('1. Loading homepage:', URL);
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(3200); // wait for branded loader to finish and welcome modal to appear

  const initialWebGLCount = await page.evaluate(() => window.__webglContextsCreated);
  console.log('   Initial WebGL contexts created:', initialWebGLCount);

  // Screenshot Welcome Modal in Light Mode
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_01_welcome_modal_light.png') });

  // Verify audio has NOT started before user choice
  const preChoiceAudio = await page.evaluate(() => ({
    instanceCount: window.__portfolioAudioInstanceCount || 0,
    hasElement: Boolean(window.__portfolioAudioElement),
  }));
  console.log('2. Audio state before Welcome Modal choice:', preChoiceAudio);

  // Click "Explore with music"
  const musicBtn = await page.$('button[aria-label="Explore with music"]');
  if (!musicBtn) {
    throw new Error('Welcome Music Modal "Explore with music" button not found!');
  }
  await musicBtn.click();
  await sleep(1200);

  const postChoiceAudio = await page.evaluate(() => {
    const el = window.__portfolioAudioElement;
    return {
      instanceCount: window.__portfolioAudioInstanceCount || 0,
      src: el ? el.src : null,
      loop: el ? el.loop : false,
      paused: el ? el.paused : true,
      duration: el ? el.duration : 0,
      currentTime: el ? el.currentTime : 0,
      readyState: el ? el.readyState : 0,
    };
  });
  console.log('3. Audio state after clicking "Explore with music":', postChoiceAudio);

  // 4. Test 25 cycles of cursor exit and re-entry + pointer movement
  console.log('4. Running 25 cycles of cursor exit/re-entry and movement...');
  for (let i = 0; i < 25; i++) {
    await page.evaluate(() => {
      document.dispatchEvent(new MouseEvent('mouseleave'));
      window.dispatchEvent(new Event('blur'));
    });
    await sleep(30);
    await page.mouse.move(100 + (i * 40) % 1100, 150 + (i * 25) % 600, { steps: 4 });
    await sleep(30);
  }

  const afterCursorCyclesWebGLCount = await page.evaluate(() => window.__webglContextsCreated);
  console.log('   WebGL contexts after 25 cursor exit/re-entry cycles:', afterCursorCyclesWebGLCount);

  // 5. Screenshot Hero in Light Mode & Dark Mode
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_02_hero_light.png') });

  const themeBtn = await page.$('button[aria-label*="theme"]');
  if (!themeBtn) throw new Error('Theme toggle button not found in Navigation');
  await themeBtn.click();
  await sleep(600);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_03_hero_dark.png') });

  // Rapid theme toggling (10 toggles)
  for (let t = 0; t < 10; t++) {
    await themeBtn.click();
    await sleep(80);
  }
  // Ensure we are in Light mode first
  await page.evaluate(() => {
    if (document.documentElement.getAttribute('data-theme') !== 'light') {
      const btn = document.querySelector('button[aria-label*="theme"]');
      if (btn) btn.click();
    }
  });
  await sleep(400);

  const afterThemeTogglesWebGLCount = await page.evaluate(() => window.__webglContextsCreated);
  console.log('   WebGL contexts after 10 rapid theme toggles:', afterThemeTogglesWebGLCount);

  // 6. Navigate to /about and audit all sections in Light Mode and Dark Mode
  console.log('5. Navigating to /about narrative chapters...');
  await page.goto(`${URL}/about`, { waitUntil: 'networkidle2' });
  await sleep(2500);

  // Function to run automated WCAG contrast audit across all visible text in current theme
  async function runContrastAudit(themeName) {
    return await page.evaluate((mode) => {
      function parseRgba(str) {
        if (!str) return { r: 0, g: 0, b: 0, a: 0 };
        const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (!m) return { r: 0, g: 0, b: 0, a: 0 };
        return {
          r: Number(m[1]),
          g: Number(m[2]),
          b: Number(m[3]),
          a: m[4] !== undefined ? Number(m[4]) : 1,
        };
      }

      function blend(fg, bg) {
        const a = fg.a + bg.a * (1 - fg.a);
        if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
        return {
          r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a,
          g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a,
          b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a,
          a,
        };
      }

      function getEffectiveBg(el) {
        const layers = [];
        let cur = el;
        while (cur && cur !== document.documentElement) {
          const style = window.getComputedStyle(cur);
          const bg = parseRgba(style.backgroundColor);
          if (bg.a > 0) {
            layers.unshift(bg);
          } else if (style.backgroundImage && style.backgroundImage.includes('gradient')) {
            // Extract first rgba/rgb stop from gradient
            const gradMatch = style.backgroundImage.match(/rgba?\(\d+,\s*\d+,\s*\d+(?:,\s*[\d.]+)?\)/);
            if (gradMatch) {
              const gCol = parseRgba(gradMatch[0]);
              if (gCol.a > 0) layers.unshift(gCol);
            }
          }
          cur = cur.parentElement;
        }
        const rootBg = mode === 'dark' ? { r: 18, g: 11, b: 29, a: 1 } : { r: 247, g: 244, b: 252, a: 1 };
        return layers.reduce((acc, layer) => blend(layer, acc), rootBg);
      }

      function luminance({ r, g, b }) {
        const a = [r, g, b].map((v) => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
      }

      function contrastRatio(c1, c2) {
        const l1 = luminance(c1);
        const l2 = luminance(c2);
        const brightest = Math.max(l1, l2);
        const darkest = Math.min(l1, l2);
        return (brightest + 0.05) / (darkest + 0.05);
      }

      const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, p, span, a, button, li'));
      const lowContrast = [];
      let checked = 0;

      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        const style = window.getComputedStyle(el);
        if (style.visibility === 'hidden' || Number(style.opacity) < 0.2) continue;
        // Skip back-faces of unflipped 3D cards
        if (String(el.className).includes('Back') || el.closest('[class*="Back"]')) continue;
        // Skip decorative watermark
        if (String(el.className).includes('Watermark')) continue;

        const directText = Array.from(el.childNodes)
          .filter((n) => n.nodeType === Node.TEXT_NODE)
          .map((n) => n.textContent.trim())
          .join('');
        if (!directText || directText.length < 2) continue;

        const fgRaw = parseRgba(style.color);
        const bg = getEffectiveBg(el);
        const fg = blend(fgRaw, bg);
        const ratio = contrastRatio(fg, bg);
        const fontSize = parseFloat(style.fontSize);
        const isBold = parseInt(style.fontWeight, 10) >= 600;
        const isLarge = fontSize >= 24 || (fontSize >= 18.5 && isBold);
        const minRequired = isLarge ? 3.0 : 4.5;

        checked++;
        if (ratio < minRequired) {
          lowContrast.push({
            text: directText.slice(0, 40),
            tag: el.tagName,
            className: String(el.className).slice(0, 50),
            ratio: Number(ratio.toFixed(2)),
            minRequired,
            fg: `rgb(${Math.round(fg.r)},${Math.round(fg.g)},${Math.round(fg.b)})`,
            bg: `rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})`,
          });
        }
      }

      return { checked, lowContrastCount: lowContrast.length, lowContrast: lowContrast.slice(0, 15) };
    }, themeName);
  }

  // Ensure Light Theme on /about
  await page.evaluate(() => {
    if (document.documentElement.getAttribute('data-theme') !== 'light') {
      const btn = document.querySelector('button[aria-label*="theme"]');
      if (btn) btn.click();
    }
  });
  await sleep(500);

  // Scroll through all sections so RevealBlock elements become visible
  const sections = ['about', 'approach', 'projects', 'experience', 'education', 'achievements', 'certificates', 'activities', 'skills', 'cv', 'contact'];
  for (const id of sections) {
    await page.evaluate((secId) => {
      const el = document.getElementById(secId);
      if (el) el.scrollIntoView({ behavior: 'instant' });
    }, id);
    await sleep(250);
  }

  const lightAudit = await runContrastAudit('light');
  console.log('6. Light Theme Contrast Audit:', JSON.stringify(lightAudit, null, 2));

  // Capture Light theme section screenshots
  await page.evaluate(() => document.getElementById('approach')?.scrollIntoView({ behavior: 'instant' }));
  await sleep(300);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_04_approach_light.png') });

  await page.evaluate(() => document.getElementById('education')?.scrollIntoView({ behavior: 'instant' }));
  await sleep(300);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_05_education_light.png') });

  // Switch to Dark Theme on /about
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label*="theme"]');
    if (btn) btn.click();
  });
  await sleep(600);

  const darkAudit = await runContrastAudit('dark');
  console.log('7. Dark Theme Contrast Audit:', JSON.stringify(darkAudit, null, 2));

  // Capture Dark theme section screenshots
  await page.evaluate(() => document.getElementById('about')?.scrollIntoView({ behavior: 'instant' }));
  await sleep(300);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_06_about_dark.png') });

  await page.evaluate(() => document.getElementById('approach')?.scrollIntoView({ behavior: 'instant' }));
  await sleep(300);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_07_approach_dark.png') });

  await page.evaluate(() => document.getElementById('education')?.scrollIntoView({ behavior: 'instant' }));
  await sleep(300);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_08_education_dark.png') });

  await page.evaluate(() => document.getElementById('certificates')?.scrollIntoView({ behavior: 'instant' }));
  await sleep(300);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_09_certificates_dark.png') });

  await page.evaluate(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'instant' }));
  await sleep(300);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_10_contact_dark.png') });

  const finalWebGLCount = await page.evaluate(() => window.__webglContextsCreated);
  console.log('8. Final Summary:');
  console.log('   Total WebGL contexts created across entire session:', finalWebGLCount);
  console.log('   WebGL "Too many active WebGL contexts" warnings:', webglContextWarnings.length);
  console.log('   Console Errors:', consoleErrors);

  await browser.close();

  if (webglContextWarnings.length > 0 || consoleErrors.length > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});

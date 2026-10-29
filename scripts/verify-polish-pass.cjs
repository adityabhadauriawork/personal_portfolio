const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.join(__dirname, '..', 'public', 'verify-polish');

async function run() {
  fs.mkdirSync(outDir, { recursive: true });
  console.log('Starting Polish Pass Browser Verification...');

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
  });

  const page = await browser.newPage();
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[console.error] ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // 1. Navigate to /about
  console.log('1. Navigating to http://localhost:5173/about ...');
  await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle0' });
  await sleep(1500);

  // 2. Test Certificates section (#certificates)
  console.log('2. Scrolling to #certificates ...');
  await page.evaluate(() => {
    document.querySelector('#certificates')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(1000);

  const certCardMetrics = await page.evaluate(() => {
    const section = document.querySelector('#certificates');
    const nav = document.querySelector('header');
    const navBottom = nav ? nav.getBoundingClientRect().bottom : 0;
    const headerH2 = section?.querySelector('h2');
    const headerTop = headerH2 ? headerH2.getBoundingClientRect().top : 0;

    const cards = Array.from(section?.querySelectorAll('[class*="archiveSleeve"]') || []);
    const cardResults = cards.map((card, i) => {
      const cardRect = card.getBoundingClientRect();
      const front = card.querySelector('[class*="sleeveFront"]');
      const frontRect = front ? front.getBoundingClientRect() : cardRect;
      const footer = card.querySelector('[class*="folioBottom"]');
      const footerRect = footer ? footer.getBoundingClientRect() : null;

      const isFooterContained = footerRect ? footerRect.bottom <= frontRect.bottom + 1 : true;
      return {
        cardIndex: i,
        cardHeight: cardRect.height,
        frontHeight: frontRect.height,
        footerBottom: footerRect ? footerRect.bottom : null,
        frontBottom: frontRect.bottom,
        isFooterContained,
      };
    });

    const allContained = cardResults.every((c) => c.isFooterContained);
    const navClearance = headerTop - navBottom;

    return {
      navClearance,
      allContained,
      cardCount: cards.length,
      sampleCard: cardResults[0],
    };
  });

  console.log('Certificates Metrics:', JSON.stringify(certCardMetrics, null, 2));
  await page.screenshot({ path: path.join(outDir, '01_certificates_cards_contained.png') });
  console.log('Captured 01_certificates_cards_contained.png');

  // 3. Test Contact Botanical Window (#contact)
  console.log('3. Scrolling to #contact ...');
  await page.evaluate(() => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(1000);

  const botanicalMetrics = await page.evaluate(() => {
    const contactSec = document.querySelector('#contact');
    const textContent = contactSec ? contactSec.textContent : '';

    const hasBotanicalWindow = textContent.includes('BOTANICAL WINDOW');
    const hasLivingFlora = textContent.includes('LIVING FLORA');
    const hasLuminousAsset = textContent.includes('Luminous Asset Active');
    const hasContactFlowerGif = textContent.includes('contact-flower.gif');
    const hasBloomQuote = textContent.includes('Bloom at your own pace.');

    const mediaStage = contactSec?.querySelector('[class*="mediaStage"]');
    const stageRect = mediaStage ? mediaStage.getBoundingClientRect() : null;
    const stageAspect = stageRect ? stageRect.width / stageRect.height : null;

    const flowerImg = contactSec?.querySelector('img[src*="contact-flower.gif"]');
    const imgComputed = flowerImg ? window.getComputedStyle(flowerImg) : null;

    return {
      hasBotanicalWindow,
      hasLivingFlora,
      hasLuminousAsset,
      hasContactFlowerGif,
      hasBloomQuote,
      stageWidth: stageRect?.width,
      stageHeight: stageRect?.height,
      stageAspect,
      imgObjectFit: imgComputed?.objectFit,
    };
  });

  console.log('Botanical Window Check:', JSON.stringify(botanicalMetrics, null, 2));
  await page.screenshot({ path: path.join(outDir, '02_contact_botanical_quote.png') });
  console.log('Captured 02_contact_botanical_quote.png');

  // 4. Test Mobile Responsiveness (390x844)
  console.log('4. Testing Mobile Responsiveness (390x844)...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  await page.evaluate(() => {
    document.querySelector('#certificates')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(800);
  await page.screenshot({ path: path.join(outDir, '03_mobile_certificates_390px.png') });
  console.log('Captured 03_mobile_certificates_390px.png');

  await page.evaluate(() => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(800);
  await page.screenshot({ path: path.join(outDir, '04_mobile_contact_390px.png') });
  console.log('Captured 04_mobile_contact_390px.png');

  const mobileCheck = await page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const bodyScroll = document.body.scrollWidth;
    const docScroll = document.documentElement.scrollWidth;

    const cards = Array.from(document.querySelectorAll('#certificates [class*="archiveSleeve"]'));
    const cardsContained = cards.every((card) => {
      const front = card.querySelector('[class*="sleeveFront"]');
      const footer = card.querySelector('[class*="folioBottom"]');
      if (!front || !footer) return true;
      return footer.getBoundingClientRect().bottom <= front.getBoundingClientRect().bottom + 2;
    });

    return {
      docWidth,
      bodyScroll,
      hasOverflow: bodyScroll > docWidth || docScroll > docWidth,
      mobileCardsContained: cardsContained,
    };
  });

  console.log('Mobile Check:', JSON.stringify(mobileCheck, null, 2));
  console.log('Console Errors:', errors);

  await browser.close();
  console.log('Polish Pass Verification Completed Successfully!');
}

run().catch((e) => {
  console.error('Verification failed:', e);
  process.exit(1);
});

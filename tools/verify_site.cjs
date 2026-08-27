const { chromium } = require('playwright');
const fs = require('fs');

const base = 'http://127.0.0.1:4173';
const outDir = 'tmp/browser';
fs.mkdirSync(outDir, { recursive: true });

const results = [];
const errors = [];

function check(condition, name, detail = '') {
  results.push({ name, passed: Boolean(condition), detail });
  if (!condition) errors.push(`${name}${detail ? `: ${detail}` : ''}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const consoleErrors = [];
  const failedRequests = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`));

  const response = await page.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
  check(response?.status() === 200, 'Homepage returns 200', String(response?.status()));
  check((await page.locator('body').innerText()).trim().length > 1000, 'Homepage has meaningful content');
  check(await page.locator('h1').getByText('Exceptional bathrooms.', { exact: false }).isVisible(), 'Hero heading is visible');
  check((await page.locator('.gallery-card').count()) === 23, 'All 23 gallery photographs are present');
  check((await page.locator('.gallery-extra:visible').count()) === 0, 'Extra gallery photographs start collapsed');
  check((await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)), 'Desktop homepage has no horizontal overflow');

  const assetFailures = await page.evaluate(async () => {
    const values = [...document.querySelectorAll('[src], link[href]')]
      .map((node) => node.getAttribute('src') || node.getAttribute('href'))
      .filter((value) => value && !value.startsWith('http') && !value.startsWith('data:'));
    const urls = [...new Set(values.map((value) => new URL(value, location.href).href))];
    const statuses = await Promise.all(urls.map(async (url) => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        return { url, status: response.status };
      } catch (error) {
        return { url, status: 0 };
      }
    }));
    return statuses.filter((item) => item.status < 200 || item.status >= 400);
  });
  check(assetFailures.length === 0, 'Homepage assets load', JSON.stringify(assetFailures));

  await page.locator('#gallery-toggle').click();
  check((await page.locator('.gallery-extra:visible').count()) === 13, 'Gallery expands to all 23 photographs');
  check((await page.locator('#gallery-toggle').innerText()) === 'Show Fewer Photographs', 'Gallery toggle label updates');
  await page.locator('.gallery-card').first().click();
  check(await page.locator('#lightbox').isVisible(), 'Gallery lightbox opens');
  check((await page.locator('#lightbox-count').innerText()) === '1 of 23', 'Lightbox count starts correctly');
  await page.locator('#lightbox-next').click();
  check((await page.locator('#lightbox-count').innerText()) === '2 of 23', 'Lightbox next control works');
  await page.keyboard.press('Escape');
  check(!(await page.locator('#lightbox').isVisible()), 'Escape closes the lightbox');
  await page.screenshot({ path: `${outDir}/homepage-desktop.png`, fullPage: true });

  const routes = [
    ['quote.html', 'Get a Quote'],
    ['video-estimate.html', 'Remote Video Estimate'],
    ['terms.html', 'Terms & Conditions'],
    ['privacy.html', 'Privacy Policy'],
    ['robots.txt', null],
    ['sitemap.xml', null],
  ];
  for (const [route, titleText] of routes) {
    const routeResponse = await page.goto(`${base}/${route}`, { waitUntil: 'networkidle' });
    check(routeResponse?.status() === 200, `${route} returns 200`, String(routeResponse?.status()));
    if (titleText) check((await page.title()).includes(titleText), `${route} has the correct title`, await page.title());
  }

  await page.goto(`${base}/quote.html`, { waitUntil: 'networkidle' });
  check((await page.locator('form').getAttribute('data-whatsapp')) === '447539037841', 'Standard quote continues to the business WhatsApp');
  await page.getByText('Full bathroom renovation', { exact: true }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  check(await page.getByText('Tell us about the room.', { exact: true }).isVisible(), 'Standard quote form advances to step 2');
  check(await page.locator('a[href="/privacy"]').count() > 0, 'Standard quote links to privacy notice');

  await page.goto(`${base}/video-estimate.html`, { waitUntil: 'networkidle' });
  check(await page.getByRole('link', { name: 'Continue to the Enquiry' }).isVisible(), 'Video estimate continues to the main enquiry');
  check(await page.getByText('Start with a clear video.', { exact: true }).isVisible(), 'Video estimate guidance is visible');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
  check((await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)), 'Mobile homepage has no horizontal overflow');
  check(await page.locator('.mobile-cta').isVisible(), 'Mobile call-to-action bar is visible');
  check(!(await page.locator('.site-header nav').isVisible()), 'Desktop navigation is hidden on mobile');
  await page.screenshot({ path: `${outDir}/homepage-mobile.png`, fullPage: true });

  for (const route of ['quote.html', 'video-estimate.html', 'terms.html', 'privacy.html']) {
    await page.goto(`${base}/${route}`, { waitUntil: 'networkidle' });
    check((await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)), `${route} has no mobile overflow`);
    await page.screenshot({ path: `${outDir}/${route.replace('.html', '')}-mobile.png`, fullPage: true });
  }

  check(consoleErrors.length === 0, 'No browser console errors', JSON.stringify(consoleErrors));
  check(failedRequests.length === 0, 'No failed browser requests', JSON.stringify(failedRequests));

  await browser.close();
  console.log(JSON.stringify({ results, consoleErrors, failedRequests, passed: errors.length === 0 }, null, 2));
  if (errors.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

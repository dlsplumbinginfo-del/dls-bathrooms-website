const { chromium } = require('playwright');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { URL } = require('url');

const root = path.resolve(__dirname, '..');
const base = 'http://127.0.0.1:4173';
const outDir = path.join(root, 'tmp', 'browser');
fs.mkdirSync(outDir, { recursive: true });

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.vtt': 'text/vtt; charset=utf-8',
  '.pdf': 'application/pdf',
};

function localFileFor(pathname) {
  let clean = decodeURIComponent(pathname.split('?')[0]);
  if (clean === '/') clean = '/index.html';

  const direct = path.join(root, clean.replace(/^\//, ''));
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;

  if (!path.extname(clean)) {
    const html = `${direct}.html`;
    if (fs.existsSync(html) && fs.statSync(html).isFile()) return html;
  }
  return null;
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, base);

  if (requestUrl.pathname.startsWith('/_vercel/insights/')) {
    response.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8' });
    response.end('');
    return;
  }

  const file = localFileFor(requestUrl.pathname);
  if (!file) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  const type = contentTypes[path.extname(file).toLowerCase()] || 'application/octet-stream';
  response.writeHead(200, {
    'content-type': type,
    'cache-control': 'no-store',
  });
  if (request.method === 'HEAD') {
    response.end();
    return;
  }
  fs.createReadStream(file).pipe(response);
});

const checks = [];
const failures = [];
function check(condition, name, detail = '') {
  const passed = Boolean(condition);
  checks.push({ name, passed, detail });
  if (!passed) failures.push(`${name}${detail ? `: ${detail}` : ''}`);
}

async function checkLocalAssets(page, label) {
  const failed = await page.evaluate(async () => {
    const values = [...document.querySelectorAll('[src], link[href], source[src]')]
      .map((node) => node.getAttribute('src') || node.getAttribute('href'))
      .filter(Boolean)
      .filter((value) => !value.startsWith('data:'))
      .filter((value) => !value.startsWith('mailto:'))
      .filter((value) => !value.startsWith('tel:'))
      .filter((value) => !value.startsWith('#'))
      .filter((value) => !value.startsWith('http'))
      .filter((value) => !value.startsWith('/_vercel/insights/'));

    const urls = [...new Set(values.map((value) => new URL(value, location.href).href))];
    const results = await Promise.all(urls.map(async (url) => {
      try {
        const response = await fetch(url, { method: 'GET' });
        return { url, status: response.status };
      } catch (error) {
        return { url, status: 0, error: String(error) };
      }
    }));
    return results.filter((result) => result.status < 200 || result.status >= 400);
  });
  check(failed.length === 0, `${label} local assets load`, JSON.stringify(failed));
}

async function noOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  check(
    dimensions.scrollWidth <= dimensions.clientWidth + 1,
    `${label} has no horizontal overflow`,
    JSON.stringify(dimensions),
  );
}

(async () => {
  await new Promise((resolve) => server.listen(4173, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true });

  const consoleErrors = [];
  const failedRequests = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(String(error)));
  page.on('requestfailed', (request) => {
    if (!request.url().includes('/_vercel/insights/')) {
      failedRequests.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    }
  });

  const homepageResponse = await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  check(homepageResponse?.status() === 200, 'Homepage returns 200', String(homepageResponse?.status()));
  check((await page.title()).includes('DLS Bathrooms'), 'Homepage title identifies DLS Bathrooms', await page.title());
  check((await page.locator('h1').first().innerText()).trim().length > 10, 'Homepage hero heading is visible');

  const bodyText = await page.locator('body').innerText();
  check(bodyText.includes('Worldpay'), 'Worldpay information is present');
  check(bodyText.includes('07539 037841'), 'Correct business phone is present');
  check(bodyText.includes('info@dlsbathrooms.co.uk'), 'Correct business email is present');
  check(!bodyText.includes('07304 056595'), 'Old personal phone is absent');
  check(!bodyText.toLowerCase().includes('klarna'), 'Unverified Klarna wording is absent');

  check((await page.locator('.gallery-card').count()) === 10, 'Homepage starts with 10 featured gallery photographs');
  const galleryButton = page.getByRole('button', { name: /View All 75 Photographs/i });
  check((await galleryButton.count()) === 1, '75-photo gallery control is present');
  await galleryButton.click();
  await page.waitForFunction(() => document.querySelectorAll('.gallery-card').length >= 75);
  check((await page.locator('.gallery-card').count()) === 75, 'Gallery expands to all 75 photographs');
  check((await page.locator('.gallery-card img').count()) === 75, 'All 75 gallery images are rendered');

  await checkLocalAssets(page, 'Homepage');
  await noOverflow(page, 'Desktop homepage');
  await page.screenshot({ path: path.join(outDir, 'homepage-desktop.png'), fullPage: true });

  const routeChecks = [
    ['quote', 'DLS Bathrooms'],
    ['video-estimate', 'Remote Video Estimate'],
    ['terms', 'Terms'],
    ['privacy', 'Privacy'],
    ['areas/stockport', 'Stockport'],
    ['areas/manchester', 'Manchester'],
    ['areas/cheadle', 'Cheadle'],
  ];

  for (const [route, titlePart] of routeChecks) {
    const response = await page.goto(`${base}/${route}`, { waitUntil: 'networkidle' });
    check(response?.status() === 200, `/${route} returns 200`, String(response?.status()));
    check((await page.title()).includes(titlePart), `/${route} has the expected title`, await page.title());
    check((await page.locator('h1').first().innerText()).trim().length > 5, `/${route} has a visible heading`);
    const text = await page.locator('body').innerText();
    check(!text.includes('07304 056595'), `/${route} excludes the old phone number`);
    check(!text.toLowerCase().includes('klarna'), `/${route} excludes unverified Klarna wording`);
    await checkLocalAssets(page, `/${route}`);
    await noOverflow(page, `Desktop /${route}`);
  }

  await page.goto(`${base}/video-estimate`, { waitUntil: 'networkidle' });
  check((await page.locator('form').getAttribute('action')).includes('formsubmit.co/'), 'Video estimate form has a delivery endpoint');
  check((await page.locator('input[type="file"]').getAttribute('accept')).includes('video/mp4'), 'Video estimate accepts MP4 uploads');

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mobile.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(`mobile: ${message.text()}`);
  });
  mobile.on('pageerror', (error) => consoleErrors.push(`mobile: ${String(error)}`));
  mobile.on('requestfailed', (request) => {
    if (!request.url().includes('/_vercel/insights/')) {
      failedRequests.push(`mobile ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    }
  });

  await mobile.goto(`${base}/`, { waitUntil: 'networkidle' });
  await noOverflow(mobile, 'Mobile homepage');
  check(await mobile.getByRole('link', { name: /Get a Quote/i }).first().isVisible(), 'Mobile quote action is visible');
  await mobile.screenshot({ path: path.join(outDir, 'homepage-mobile.png'), fullPage: true });

  for (const route of ['quote', 'video-estimate', 'terms', 'privacy', 'areas/stockport', 'areas/manchester', 'areas/cheadle']) {
    await mobile.goto(`${base}/${route}`, { waitUntil: 'networkidle' });
    await noOverflow(mobile, `Mobile /${route}`);
  }

  check(consoleErrors.length === 0, 'No browser console errors', JSON.stringify(consoleErrors));
  check(failedRequests.length === 0, 'No failed browser requests', JSON.stringify(failedRequests));

  await mobile.close();
  await page.close();
  await browser.close();
  await new Promise((resolve) => server.close(resolve));

  const summary = { passed: failures.length === 0, checks, consoleErrors, failedRequests, failures };
  fs.writeFileSync(path.join(outDir, 'results.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  if (failures.length) process.exitCode = 1;
})().catch(async (error) => {
  console.error(error);
  try { await new Promise((resolve) => server.close(resolve)); } catch (_) {}
  process.exitCode = 1;
});

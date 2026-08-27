const { chromium } = require('playwright');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { URL } = require('url');

const root = path.resolve(__dirname, '..');
const base = 'http://127.0.0.1:4173';
const output = path.join(root, 'tmp', 'browser');
fs.mkdirSync(output, { recursive: true });

const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.mp4': 'video/mp4', '.vtt': 'text/vtt; charset=utf-8', '.pdf': 'application/pdf',
};

function fileFor(urlPath) {
  let clean = decodeURIComponent(urlPath.split('?')[0]);
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
  const parsed = new URL(request.url, base);
  if (parsed.pathname.startsWith('/_vercel/insights/')) {
    response.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8' });
    response.end('');
    return;
  }
  const file = fileFor(parsed.pathname);
  if (!file) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }
  response.writeHead(200, {
    'content-type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'cache-control': 'no-store',
  });
  if (request.method === 'HEAD') return response.end();
  fs.createReadStream(file).pipe(response);
});

const checks = [];
const failures = [];
function check(value, name, detail = '') {
  const passed = Boolean(value);
  checks.push({ name, passed, detail });
  if (!passed) failures.push(`${name}${detail ? `: ${detail}` : ''}`);
}

function productionTextFiles() {
  const roots = ['index.html', 'quote.html', 'video-estimate.html', 'terms.html', 'privacy.html', 'areas', 'assets', 'media', 'projects'];
  const allowed = new Set(['.html', '.js', '.css', '.json', '.svg', '.vtt', '.xml', '.txt']);
  const found = [];
  function walk(item) {
    const full = path.join(root, item);
    if (!fs.existsSync(full)) return;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(full)) walk(path.join(item, name));
    } else if (allowed.has(path.extname(full).toLowerCase())) {
      found.push(full);
    }
  }
  roots.forEach(walk);
  return found;
}

function localReferences(html) {
  const refs = [];
  const attribute = /(?:src|href)=["']([^"']+)["']/gi;
  let match;
  while ((match = attribute.exec(html))) {
    const value = match[1];
    if (value.startsWith('/') && !value.startsWith('/_vercel/insights/')) refs.push(value.split('?')[0]);
  }
  return [...new Set(refs)];
}

async function open(page, route) {
  const response = await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(250);
  return response;
}

async function overflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  check(dimensions.scrollWidth <= dimensions.clientWidth + 1, `${label} has no horizontal overflow`, JSON.stringify(dimensions));
}

(async () => {
  const requiredPages = [
    'index.html', 'quote.html', 'video-estimate.html', 'terms.html', 'privacy.html',
    'areas/stockport.html', 'areas/manchester.html', 'areas/cheadle.html',
  ];
  requiredPages.forEach((page) => check(fs.existsSync(path.join(root, page)), `${page} exists`));

  const projectImages = fs.readdirSync(path.join(root, 'projects')).filter((name) => name.endsWith('.webp'));
  check(projectImages.length >= 77, 'All 75 gallery images and two design images are stored', String(projectImages.length));

  const textFiles = productionTextFiles();
  const allText = textFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n').toLowerCase();
  for (const forbidden of [
    '07304 056595', '447304056595', 'dlsplumbinginfo@gmail.com',
    'dlstilingandplumbing30@gmail.com', 'klarna', '/_vinext/image', '/cdn-cgi/challenge-platform',
  ]) {
    check(!allText.includes(forbidden.toLowerCase()), `Legacy value is absent: ${forbidden}`);
  }

  for (const pageName of requiredPages) {
    const html = fs.readFileSync(path.join(root, pageName), 'utf8');
    const missing = localReferences(html).filter((reference) => !fileFor(reference));
    check(missing.length === 0, `${pageName} static references exist`, JSON.stringify(missing));
  }

  await new Promise((resolve) => server.listen(4173, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(10000);

  const consoleErrors = [];
  const failedRequests = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => consoleErrors.push(String(error)));
  page.on('requestfailed', (request) => {
    const type = request.resourceType();
    if (!['image', 'media'].includes(type) && !request.url().includes('/_vercel/insights/')) {
      failedRequests.push(`${type} ${request.url()} - ${request.failure()?.errorText}`);
    }
  });

  const response = await open(page, '/');
  check(response?.status() === 200, 'Homepage returns 200', String(response?.status()));
  check((await page.title()).includes('DLS Bathrooms'), 'Homepage title is correct', await page.title());
  check((await page.locator('h1').first().innerText()).trim().length > 10, 'Homepage heading is visible');
  const text = await page.locator('body').innerText();
  check(text.includes('Worldpay'), 'Worldpay information is visible');
  check(text.includes('07539 037841'), 'Correct phone is visible');
  check(text.includes('info@dlsbathrooms.co.uk'), 'Correct email is visible');
  check(!text.includes('07304 056595'), 'Old phone is not visible');

  check((await page.locator('.gallery-card').count()) === 10, 'Homepage initially shows 10 featured gallery cards');
  const galleryButton = page.getByRole('button', { name: /View All 75 Photographs/i });
  await galleryButton.waitFor({ state: 'visible' });
  await galleryButton.click();
  await page.waitForFunction(() => document.querySelectorAll('.gallery-card').length === 75, null, { timeout: 10000 });
  check((await page.locator('.gallery-card').count()) === 75, 'Gallery expands to exactly 75 photographs');
  const gallerySources = await page.locator('.gallery-card img').evaluateAll((images) => images.map((image) => image.getAttribute('src')));
  const missingGallery = gallerySources.filter((source) => !source || !fileFor(source));
  check(gallerySources.length === 75, 'All 75 gallery image elements are rendered', String(gallerySources.length));
  check(missingGallery.length === 0, 'All 75 gallery image files exist', JSON.stringify(missingGallery));
  await overflow(page, 'Desktop homepage');
  await page.screenshot({ path: path.join(output, 'homepage-desktop.png'), fullPage: false });

  const routes = [
    ['/quote', 'DLS Bathrooms'], ['/video-estimate', 'Remote Video Estimate'],
    ['/terms', 'Terms'], ['/privacy', 'Privacy'], ['/areas/stockport', 'Stockport'],
    ['/areas/manchester', 'Manchester'], ['/areas/cheadle', 'Cheadle'],
  ];
  for (const [route, titlePart] of routes) {
    const routeResponse = await open(page, route);
    check(routeResponse?.status() === 200, `${route} returns 200`, String(routeResponse?.status()));
    check((await page.title()).includes(titlePart), `${route} title is correct`, await page.title());
    check((await page.locator('h1').first().innerText()).trim().length > 5, `${route} heading is visible`);
    await overflow(page, `Desktop ${route}`);
  }

  await open(page, '/video-estimate');
  check((await page.locator('form').getAttribute('action')).includes('formsubmit.co/'), 'Video estimate form has a delivery endpoint');
  check((await page.locator('input[type="file"]').getAttribute('accept')).includes('video/mp4'), 'Video estimate accepts MP4 files');

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mobile.setDefaultTimeout(10000);
  mobile.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(`mobile: ${message.text()}`); });
  mobile.on('pageerror', (error) => consoleErrors.push(`mobile: ${String(error)}`));
  mobile.on('requestfailed', (request) => {
    const type = request.resourceType();
    if (!['image', 'media'].includes(type) && !request.url().includes('/_vercel/insights/')) {
      failedRequests.push(`mobile ${type} ${request.url()} - ${request.failure()?.errorText}`);
    }
  });

  await open(mobile, '/');
  await overflow(mobile, 'Mobile homepage');
  check(await mobile.getByRole('link', { name: /Get a Quote/i }).first().isVisible(), 'Mobile quote button is visible');
  await mobile.screenshot({ path: path.join(output, 'homepage-mobile.png'), fullPage: false });
  for (const [route] of routes) {
    await open(mobile, route);
    await overflow(mobile, `Mobile ${route}`);
  }

  check(consoleErrors.length === 0, 'No browser console errors', JSON.stringify(consoleErrors));
  check(failedRequests.length === 0, 'No failed script or stylesheet requests', JSON.stringify(failedRequests));

  await mobile.close();
  await page.close();
  await browser.close();
  await new Promise((resolve) => server.close(resolve));

  const result = { passed: failures.length === 0, checks, failures, consoleErrors, failedRequests };
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  if (failures.length) process.exitCode = 1;
})().catch(async (error) => {
  console.error(error);
  try { await new Promise((resolve) => server.close(resolve)); } catch (_) {}
  process.exitCode = 1;
});

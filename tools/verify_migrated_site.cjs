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

function productionText() {
  const roots = [
    'index.html', 'quote.html', 'video-estimate.html', 'terms.html',
    'privacy.html', 'areas', 'site-static.js', 'static-overrides.css'
  ];
  const allowed = new Set(['.html', '.js', '.css', '.json', '.svg', '.vtt', '.xml', '.txt']);
  const files = [];
  function walk(relative) {
    const full = path.join(root, relative);
    if (!fs.existsSync(full)) return;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(full)) walk(path.join(relative, name));
    } else if (allowed.has(path.extname(full).toLowerCase())) {
      files.push(full);
    }
  }
  roots.forEach(walk);
  return files.map((file) => fs.readFileSync(file, 'utf8')).join('\n').toLowerCase();
}

function localReferences(html) {
  const refs = [];
  const pattern = /(?:src|href)=["']([^"']+)["']/gi;
  let match;
  while ((match = pattern.exec(html))) {
    const value = match[1];
    if (value.startsWith('/') && !value.startsWith('/_vercel/insights/')) {
      refs.push(value.split('?')[0]);
    }
  }
  return [...new Set(refs)];
}

async function open(page, route) {
  const response = await page.goto(`${base}${route}`, {
    waitUntil: 'domcontentloaded',
    timeout: 8000,
  });
  await page.waitForTimeout(150);
  return response;
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
  let browser;
  try {
    const requiredPages = [
      'index.html', 'quote.html', 'video-estimate.html', 'terms.html',
      'privacy.html', 'areas/stockport.html', 'areas/manchester.html',
      'areas/cheadle.html',
    ];
    requiredPages.forEach((page) => {
      check(fs.existsSync(path.join(root, page)), `${page} exists`);
    });

    const projectImages = fs.readdirSync(path.join(root, 'projects'))
      .filter((name) => name.endsWith('.webp'));
    check(
      projectImages.length >= 82,
      'All 80 gallery images and two design images are stored',
      String(projectImages.length),
    );

    const allText = productionText();
    for (const forbidden of [
      '07304 056595', '447304056595', 'dlsplumbinginfo@gmail.com',
      'dlstilingandplumbing30@gmail.com', 'klarna', '__vinext_rsc_',
      'rsc_chunks', 'id="_r_"', 'same-day', '41 reviews', '98%'
      , 'bathroom fitters', 'bathroom fitting', '>cheadle<', '"name":"cheadle"'
    ]) {
      check(!allText.includes(forbidden), `Unsupported value is absent: ${forbidden}`);
    }

    for (const pageName of requiredPages) {
      const html = fs.readFileSync(path.join(root, pageName), 'utf8');
      const missing = localReferences(html).filter((reference) => !fileFor(reference));
      check(missing.length === 0, `${pageName} local references exist`, JSON.stringify(missing));
    }

    await new Promise((resolve) => server.listen(4173, '127.0.0.1', resolve));
    browser = await chromium.launch({ headless: true });

    const consoleErrors = [];
    const failedRequests = [];
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    desktop.setDefaultTimeout(8000);
    desktop.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    desktop.on('pageerror', (error) => consoleErrors.push(String(error)));
    desktop.on('requestfailed', (request) => {
      const type = request.resourceType();
      const url = request.url();
      if (
        !['image', 'media'].includes(type) &&
        !url.includes('/_vercel/insights/') &&
        !url.startsWith('https://wa.me/')
      ) {
        failedRequests.push(`${type} ${url} - ${request.failure()?.errorText}`);
      }
    });

    let response = await open(desktop, '/');
    check(response?.status() === 200, 'Homepage returns 200', String(response?.status()));
    check((await desktop.title()).includes('DLS Bathrooms'), 'Homepage title is correct', await desktop.title());
    check((await desktop.locator('h1').first().innerText()).trim().length > 10, 'Homepage heading is visible');
    const homeText = await desktop.locator('body').innerText();
    check(homeText.includes('Worldpay'), 'Worldpay information is visible');
    check(homeText.includes('07539 037841'), 'Correct phone is visible');
    check(
      (await desktop.locator('a[href="mailto:info@dlsbathrooms.co.uk"]').count()) >= 1,
      'Correct business email link is present',
    );

    check((await desktop.locator('.gallery-card').count()) === 80, 'All 80 gallery cards are in the page');
    check((await desktop.locator('.gallery-card:visible').count()) === 10, 'Ten featured photographs show initially');
    const galleryButton = desktop.getByRole('button', { name: /View All 80 Photographs/i });
    await galleryButton.click();
    check((await desktop.locator('.gallery-card:visible').count()) === 80, 'Gallery expands to all 80 photographs');
    const sources = await desktop.locator('.gallery-card img')
      .evaluateAll((images) => images.map((image) => image.getAttribute('src')));
    check(
      sources.slice(0, 5).every((source) => source?.startsWith('/projects/enhanced-')),
      'Five enhanced project photographs lead the gallery',
      JSON.stringify(sources.slice(0, 5)),
    );
    const missingGallery = sources.filter((source) => !source || !fileFor(source));
    check(sources.length === 80, 'All 80 gallery image elements are present', String(sources.length));
    check(missingGallery.length === 0, 'All 80 gallery image files exist', JSON.stringify(missingGallery));
    check(!homeText.includes('Cheadle'), 'Homepage only names Stockport and Manchester');
    check(homeText.includes('Your local bathroom specialist'), 'Personal bathroom specialist wording is visible');
    check(
      (await desktop.locator('a[href="https://www.instagram.com/dlstilingand/"]').count()) === 1,
      'Instagram profile link is present',
    );

    await desktop.locator('.gallery-card').nth(20).click();
    check(await desktop.locator('.lightbox').isVisible(), 'Gallery lightbox opens');
    await desktop.keyboard.press('Escape');
    check(!(await desktop.locator('.lightbox').isVisible()), 'Gallery lightbox closes');
    await noOverflow(desktop, 'Desktop homepage');
    await desktop.screenshot({ path: path.join(output, 'homepage-desktop.png'), fullPage: false });

    const routes = [
      ['/quote', 'DLS Bathrooms'],
      ['/video-estimate', 'Remote Video Estimate'],
      ['/terms', 'Terms'],
      ['/privacy', 'Privacy'],
      ['/areas/stockport', 'Stockport'],
      ['/areas/manchester', 'Manchester'],
    ];
    for (const [route, titlePart] of routes) {
      response = await open(desktop, route);
      check(response?.status() === 200, `${route} returns 200`, String(response?.status()));
      check((await desktop.title()).includes(titlePart), `${route} title is correct`, await desktop.title());
      check((await desktop.locator('h1').first().innerText()).trim().length > 5, `${route} heading is visible`);
      await noOverflow(desktop, `Desktop ${route}`);
    }

    await open(desktop, '/quote');
    await desktop.route('https://wa.me/**', (route) => route.abort());
    await desktop.locator('[name="name"]').fill('Website Test');
    await desktop.locator('[name="postcode"]').fill('SK4 4DP');
    await desktop.locator('[name="details"]').fill('Test bathroom enquiry');
    const whatsappRequest = desktop.waitForRequest(
      (request) => request.url().startsWith('https://wa.me/447539037841?text='),
      { timeout: 8000 },
    );
    await desktop.locator('form.quote-form button[type="submit"]').click();
    const request = await whatsappRequest;
    check(request.url().includes('Website%20Test'), 'Quote form builds a WhatsApp enquiry');

    await open(desktop, '/video-estimate');
    check(
      (await desktop.locator('form').getAttribute('action')).includes('formsubmit.co/'),
      'Video estimate form has a delivery endpoint',
    );
    check(
      (await desktop.locator('input[type="file"]').getAttribute('accept')).includes('video/mp4'),
      'Video estimate accepts MP4 files',
    );

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
    mobile.setDefaultTimeout(8000);
    mobile.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(`mobile: ${message.text()}`);
    });
    mobile.on('pageerror', (error) => consoleErrors.push(`mobile: ${String(error)}`));

    await open(mobile, '/');
    await noOverflow(mobile, 'Mobile homepage');
    const comparisonColumns = await mobile.locator('.design-proof-grid').evaluate(
      (element) => getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean).length,
    );
    check(comparisonColumns === 2, 'AI preview and finished bathroom stay side by side on mobile', String(comparisonColumns));
    check(
      await mobile.getByRole('link', { name: /Get a Quote/i }).first().isVisible(),
      'Mobile quote button is visible',
    );
    await mobile.screenshot({ path: path.join(output, 'homepage-mobile.png'), fullPage: false });
    for (const [route] of routes) {
      await open(mobile, route);
      await noOverflow(mobile, `Mobile ${route}`);
    }

    check(consoleErrors.length === 0, 'No browser console errors', JSON.stringify(consoleErrors));
    check(failedRequests.length === 0, 'No failed script or stylesheet requests', JSON.stringify(failedRequests));

    await mobile.close();
    await desktop.close();
    await browser.close();
    browser = undefined;
    server.closeAllConnections?.();
    await new Promise((resolve) => server.close(resolve));

    const result = { passed: failures.length === 0, checks, failures, consoleErrors, failedRequests };
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
    if (failures.length) process.exitCode = 1;
  } catch (error) {
    console.error(error);
    if (browser) await browser.close().catch(() => {});
    server.closeAllConnections?.();
    server.close();
    process.exitCode = 1;
  }
})();

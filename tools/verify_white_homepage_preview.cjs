const { chromium } = require('playwright');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { URL } = require('url');

const root = path.resolve(__dirname, '..');
const base = 'http://127.0.0.1:4174';
const output = path.join(root, 'tmp', 'white-homepage-preview');
fs.mkdirSync(output, { recursive: true });

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.vtt': 'text/vtt; charset=utf-8',
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

function assert(value, message, detail = '') {
  if (!value) throw new Error(`${message}${detail ? `: ${detail}` : ''}`);
  console.log(`PASS: ${message}${detail ? ` — ${detail}` : ''}`);
}

async function inspect(page, label, screenshot) {
  await page.goto(`${base}/original-homepage-white`, {
    waitUntil: 'domcontentloaded',
    timeout: 10000,
  });
  await page.locator('#hero-title').waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForTimeout(400);

  assert((await page.title()).includes('Private White Homepage Colour Test'), `${label} preview title is correct`);
  assert((await page.locator('meta[name="robots"]').getAttribute('content')) === 'noindex,nofollow', `${label} preview is noindex`);
  assert((await page.locator('.site-header').count()) === 1, `${label} keeps the original DLS header`);
  assert((await page.locator('.gallery-card').count()) === 80, `${label} keeps all 80 original gallery cards`);

  const text = await page.locator('body').innerText();
  const textLower = text.toLowerCase();
  for (const phrase of ['Exceptional bathrooms.', 'One specialist team.', 'Worldpay', 'Real DLS work']) {
    assert(textLower.includes(phrase.toLowerCase()), `${label} keeps original homepage wording`, phrase);
  }

  const colours = await page.evaluate(() => ({
    body: getComputedStyle(document.body).backgroundColor,
    header: getComputedStyle(document.querySelector('.site-header')).backgroundColor,
    heading: getComputedStyle(document.querySelector('#hero-title')).color,
    trust: getComputedStyle(document.querySelector('.trust-strip')).backgroundColor,
  }));
  assert(colours.body === 'rgb(255, 255, 255)', `${label} body is white`, colours.body);
  assert(colours.header.includes('255, 255, 255'), `${label} header is white`, colours.header);
  assert(colours.heading !== 'rgb(247, 244, 237)', `${label} hero wording is dark for the light background`, colours.heading);
  assert(colours.trust.includes('255, 255, 255'), `${label} trust strip is white`, colours.trust);

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  assert(dimensions.scrollWidth <= dimensions.clientWidth + 1, `${label} has no sideways page movement`, JSON.stringify(dimensions));
  await page.screenshot({ path: path.join(output, screenshot), fullPage: false });
}

(async () => {
  let browser;
  try {
    for (const file of ['index.html', 'original-homepage-white.html', 'original-homepage-white.css']) {
      assert(fs.existsSync(path.join(root, file)), `${file} exists`);
    }

    await new Promise((resolve) => server.listen(4174, '127.0.0.1', resolve));
    browser = await chromium.launch({ headless: true });

    const errors = [];
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    desktop.on('pageerror', (error) => errors.push(`desktop: ${String(error)}`));
    desktop.on('console', (message) => {
      if (message.type() === 'error') errors.push(`desktop: ${message.text()}`);
    });
    await inspect(desktop, 'Desktop', 'desktop.png');

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
    mobile.on('pageerror', (error) => errors.push(`mobile: ${String(error)}`));
    mobile.on('console', (message) => {
      if (message.type() === 'error') errors.push(`mobile: ${message.text()}`);
    });
    await inspect(mobile, 'Mobile', 'mobile.png');

    assert(errors.length === 0, 'No browser errors were found', JSON.stringify(errors));
    await mobile.close();
    await desktop.close();
    await browser.close();
    server.closeAllConnections?.();
    await new Promise((resolve) => server.close(resolve));
    console.log('White homepage preview verification complete.');
  } catch (error) {
    console.error(error);
    if (browser) await browser.close().catch(() => {});
    server.closeAllConnections?.();
    server.close();
    process.exitCode = 1;
  }
})();

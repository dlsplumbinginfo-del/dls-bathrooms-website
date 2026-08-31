const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 4173;
const OUTPUT_DIR = path.join(ROOT, 'tmp', 'bathroom-builder-mobile');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp'
};

function startServer() {
  const server = http.createServer((request, response) => {
    try {
      const requestedPath = decodeURIComponent(new URL(request.url, `http://127.0.0.1:${PORT}`).pathname);
      const relativePath = requestedPath === '/' ? '/bathroom-builder-next.html' : requestedPath;
      let filePath = path.resolve(ROOT, `.${relativePath}`);

      if (!filePath.startsWith(ROOT)) {
        response.writeHead(403).end('Forbidden');
        return;
      }

      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }

      fs.readFile(filePath, (error, data) => {
        if (error) {
          response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          response.end('Not found');
          return;
        }
        response.writeHead(200, {
          'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
          'Cache-Control': 'no-store'
        });
        response.end(data);
      });
    } catch (error) {
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(error.message);
    }
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

async function inspectViewport(browser, viewport) {
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: viewport.width <= 430,
    hasTouch: viewport.width <= 430
  });

  const consoleErrors = [];
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', error => consoleErrors.push(error.message));

  await page.goto(`http://127.0.0.1:${PORT}/bathroom-builder-next.html`, {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  await page.waitForFunction(() => {
    return !document.getElementById('load') && document.body && document.body.innerText.length > 800;
  }, { timeout: 20000 });

  await page.waitForTimeout(1500);

  const metrics = await page.evaluate(() => {
    const root = document.documentElement;
    const body = document.body;
    const viewportWidth = root.clientWidth;

    const overflowingElements = Array.from(body.querySelectorAll('*'))
      .map(element => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          className: typeof element.className === 'string' ? element.className.slice(0, 160) : '',
          position: style.position,
          display: style.display,
          left: Math.round(rect.left * 10) / 10,
          right: Math.round(rect.right * 10) / 10,
          width: Math.round(rect.width * 10) / 10,
          scrollWidth: element.scrollWidth
        };
      })
      .filter(item => item.display !== 'none')
      .filter(item => item.position !== 'absolute' && item.position !== 'fixed')
      .filter(item => item.left < -1 || item.right > viewportWidth + 1 || item.width > viewportWidth + 1)
      .slice(0, 20);

    window.scrollTo(10000, 0);

    return {
      viewportWidth,
      documentScrollWidth: root.scrollWidth,
      bodyScrollWidth: body.scrollWidth,
      horizontalScrollPosition: window.scrollX,
      title: document.title,
      textLength: body.innerText.length,
      overflowingElements
    };
  });

  await page.screenshot({
    path: path.join(OUTPUT_DIR, `${viewport.name}.png`),
    fullPage: true
  });

  await page.close();

  const widthFailure = metrics.documentScrollWidth > metrics.viewportWidth + 1 ||
    metrics.bodyScrollWidth > metrics.viewportWidth + 1 ||
    metrics.horizontalScrollPosition > 0 ||
    metrics.overflowingElements.length > 0;

  return {
    viewport,
    metrics,
    consoleErrors,
    passed: !widthFailure && consoleErrors.length === 0
  };
}

(async () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const server = await startServer();
  const browser = await chromium.launch({ headless: true });

  try {
    const viewports = [
      { name: 'phone-360', width: 360, height: 800 },
      { name: 'phone-390', width: 390, height: 844 },
      { name: 'tablet-768', width: 768, height: 1024 }
    ];

    const results = [];
    for (const viewport of viewports) {
      results.push(await inspectViewport(browser, viewport));
    }

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'report.json'),
      JSON.stringify(results, null, 2)
    );

    console.log(JSON.stringify(results, null, 2));

    const failures = results.filter(result => !result.passed);
    if (failures.length) {
      throw new Error(`Bathroom builder mobile flow failed at: ${failures.map(item => item.viewport.name).join(', ')}`);
    }
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});

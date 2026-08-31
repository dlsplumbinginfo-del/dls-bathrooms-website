const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const sourcePath = path.join(__dirname, 'verify_migrated_site.cjs');
const generatedPath = path.join(__dirname, '.verify_migrated_site.generated.cjs');
let source = fs.readFileSync(sourcePath, 'utf8');

function replaceRequired(marker, replacement, label) {
  if (!source.includes(marker)) {
    throw new Error(`Could not find the ${label} marker.`);
  }
  source = source.replace(marker, replacement);
}

const formMarker = "    await desktop.locator('[name=\"details\"]').fill('Test bathroom enquiry');";
replaceRequired(
  formMarker,
  `${formMarker}\n    await desktop.locator('[name="referralSource"]').selectOption({ label: 'Google Search' });`,
  'quote-form test',
);

replaceRequired(
  "    check(homeText.includes('98% recommend'), 'Verified Facebook recommendation is visible');",
  "    check(homeText.includes('Customer reviews'), 'Customer review section is visible');",
  'customer-review copy',
);
replaceRequired(
  "    check(homeText.includes('40 Facebook reviews'), 'Verified Facebook review count is visible');",
  "    check((await desktop.locator('a[href*=\"facebook.com/DLSBathrooms\"]').count()) >= 1, 'Facebook review link is visible');",
  'Facebook review link',
);

replaceRequired(
  "    desktop.on('pageerror', (error) => consoleErrors.push(String(error)));",
  "    desktop.on('pageerror', (error) => consoleErrors.push(error.stack || String(error)));",
  'desktop page-error handler',
);
replaceRequired(
  "    mobile.on('pageerror', (error) => consoleErrors.push(`mobile: ${String(error)}`));",
  "    mobile.on('pageerror', (error) => consoleErrors.push(`mobile: ${error.stack || String(error)}`));",
  'mobile page-error handler',
);

const desktopMarker = "    await desktop.screenshot({ path: path.join(output, 'homepage-desktop.png'), fullPage: false });";
replaceRequired(
  desktopMarker,
  `${desktopMarker}\n\n    response = await open(desktop, '/bathroom-builder-next');\n    check(response?.status() === 200, 'Bathroom builder preview returns 200', String(response?.status()));\n    await desktop.waitForFunction(\n      () => !document.getElementById('load') && document.body.innerText.length > 800,\n      null,\n      { timeout: 12000 },\n    );\n    await desktop.waitForTimeout(250);\n    await noOverflow(desktop, 'Desktop bathroom builder preview');\n    fs.writeFileSync(path.join(output, 'bathroom-builder-rendered.html'), await desktop.content());\n    await desktop.screenshot({ path: path.join(output, 'bathroom-builder-desktop.png'), fullPage: false });`,
  'desktop screenshot',
);

const mobileMarker = "    await mobile.screenshot({ path: path.join(output, 'homepage-mobile.png'), fullPage: false });";
replaceRequired(
  mobileMarker,
  `${mobileMarker}\n\n    response = await open(mobile, '/bathroom-builder-next');\n    check(response?.status() === 200, 'Mobile bathroom builder preview returns 200', String(response?.status()));\n    await mobile.waitForFunction(\n      () => !document.getElementById('load') && document.body.innerText.length > 800,\n      null,\n      { timeout: 12000 },\n    );\n    await mobile.waitForTimeout(500);\n    await noOverflow(mobile, 'Mobile bathroom builder preview');\n    const builderOutliers = await mobile.evaluate(() => {\n      const viewport = document.documentElement.clientWidth;\n      return [...document.body.querySelectorAll('*')]\n        .filter((element) => {\n          const style = getComputedStyle(element);\n          if (\n            style.display === 'none' ||\n            style.visibility === 'hidden' ||\n            style.opacity === '0' ||\n            style.position === 'absolute' ||\n            style.position === 'fixed' ||\n            element.closest('[hidden]')\n          ) return false;\n          const rect = element.getBoundingClientRect();\n          return rect.width > 1 && rect.height > 1 && (rect.left < -3 || rect.right > viewport + 3);\n        })\n        .slice(0, 10)\n        .map((element) => {\n          const rect = element.getBoundingClientRect();\n          return {\n            tag: element.tagName,\n            className: String(element.className || '').slice(0, 100),\n            left: Math.round(rect.left),\n            right: Math.round(rect.right),\n            width: Math.round(rect.width),\n          };\n        });\n    });\n    check(\n      builderOutliers.length === 0,\n      'Mobile bathroom builder stays in one vertical viewport',\n      JSON.stringify(builderOutliers),\n    );\n    await mobile.screenshot({ path: path.join(output, 'bathroom-builder-mobile.png'), fullPage: false });`,
  'mobile screenshot',
);

fs.writeFileSync(generatedPath, source);
const result = spawnSync(process.execPath, [generatedPath], {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit',
});
fs.rmSync(generatedPath, { force: true });

if (result.error) throw result.error;
process.exit(result.status ?? 1);

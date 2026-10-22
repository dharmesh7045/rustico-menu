// Renders each design HTML to a PDF in ../ using headless Chromium.
// Usage: node render.cjs [design-file.html ...]
const path = require("path");
const { chromium } = require("playwright");

const designs = process.argv.slice(2).length ? process.argv.slice(2) : [
  "design-a-heritage.html",
  "design-b-midnight.html",
  "design-c-pocket.html",
];

(async () => {
  const browser = await chromium.launch();
  for (const file of designs) {
    const page = await browser.newPage();
    page.on("console", (m) => console.log(`[${file}]`, m.text()));
    page.on("pageerror", (e) => console.error(`[${file}] error:`, e.message));
    await page.goto("file://" + path.join(__dirname, file), { waitUntil: "networkidle" });
    await page.waitForSelector("body[data-ready]", { timeout: 30000 });
    const out = path.join(__dirname, "..", file.replace(/\.html$/, ".pdf").replace(/^design-/, "rustico-menu-"));
    await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
    const pages = await page.locator(".page").count();
    console.log(`${file} -> ${path.basename(out)} (${pages} pages)`);
    await page.close();
  }
  await browser.close();
})();

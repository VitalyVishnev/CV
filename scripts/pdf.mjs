import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
try {
  const page = await browser.newPage();
  for (const lang of ['ru','en']) {
    await page.goto(pathToFileURL(path.join(root, 'dist', `${lang}.html`)).href);
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({path:path.join(root,'dist',`vitaliy-vishnev-${lang}.pdf`),format:'A4',printBackground:true,preferCSSPageSize:true,tagged:true});
    console.log(`Generated ${lang.toUpperCase()} PDF`);
  }
} finally { await browser.close(); }

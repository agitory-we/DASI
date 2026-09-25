import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/audit_screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const auditLogs = [];

  const pagesToTest = [
    { name: '01_home', url: 'http://localhost:3000/' },
    { name: '02_explore', url: 'http://localhost:3000/explore' },
    { name: '03_map', url: 'http://localhost:3000/map' },
    { name: '04_rent', url: 'http://localhost:3000/rent' },
    { name: '05_clinic', url: 'http://localhost:3000/clinic' },
    { name: '06_cabinet_coupons', url: 'http://localhost:3000/cabinet?tab=coupons' },
    { name: '07_cabinet_points', url: 'http://localhost:3000/cabinet?tab=points' },
    { name: '08_pro', url: 'http://localhost:3000/pro' },
    { name: '09_experiences', url: 'http://localhost:3000/experiences' },
    { name: '10_ai_appraisal', url: 'http://localhost:3000/ai-appraisal' },
    { name: '11_meter', url: 'http://localhost:3000/meter' },
    { name: '12_partner', url: 'http://localhost:3000/partner' },
    { name: '13_films', url: 'http://localhost:3000/films' },
    { name: '14_studios', url: 'http://localhost:3000/studios' },
    { name: '15_golden_hour', url: 'http://localhost:3000/golden-hour' },
  ];

  for (const item of pagesToTest) {
    try {
      console.log('Auditing: ' + item.name + ' (' + item.url + ')');
      await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await page.waitForTimeout(2500);

      const overflowInfo = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        };
      });

      const shotPath = path.join(outDir, item.name + '.png');
      await page.screenshot({ path: shotPath });
      auditLogs.push(Object.assign({}, item, overflowInfo, { shotPath }));

      if (item.name === '03_map') {
        const spotBtn = page.locator('button').filter({ hasText: /QR|상세|확인/ }).first();
        if (await spotBtn.count() > 0) {
          await spotBtn.click();
          await page.waitForTimeout(600);
          await page.screenshot({ path: path.join(outDir, '03_map_modal.png') });
          console.log('Captured 03_map_modal.png');
        }
      }

      if (item.name === '04_rent') {
        const bulkBtn = page.locator('button').filter({ hasText: /벌크|신청/ }).first();
        if (await bulkBtn.count() > 0) {
          await bulkBtn.click();
          await page.waitForTimeout(600);
          await page.screenshot({ path: path.join(outDir, '04_rent_bulk_modal.png') });
          console.log('Captured 04_rent_bulk_modal.png');
        }
      }

      if (item.name === '06_cabinet_coupons') {
        const couponBtn = page.locator('button').filter({ hasText: /바코드|현장/ }).first();
        if (await couponBtn.count() > 0) {
          await couponBtn.click();
          await page.waitForTimeout(600);
          await page.screenshot({ path: path.join(outDir, '06_cabinet_coupon_modal.png') });
          console.log('Captured 06_cabinet_coupon_modal.png');
        }
      }

    } catch (err) {
      console.error('Error on ' + item.name + ':', err.message);
      auditLogs.push(Object.assign({}, item, { error: err.message }));
    }
  }

  console.log('Auditing Mobile Viewport (390x844)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, 'mobile_home.png') });

  await page.goto('http://localhost:3000/map', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, 'mobile_map.png') });

  await page.goto('http://localhost:3000/rent', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, 'mobile_rent.png') });

  await page.goto('http://localhost:3000/films', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, 'mobile_films.png') });

  await page.goto('http://localhost:3000/studios', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, 'mobile_studios.png') });

  await page.goto('http://localhost:3000/golden-hour', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, 'mobile_golden_hour.png') });

  await browser.close();
  fs.writeFileSync(path.join(outDir, 'audit_report.json'), JSON.stringify(auditLogs, null, 2));
  console.log('Audit completed successfully. Report saved.');
}

run();
const { expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { root, week } = require('./settings.cjs');
const receiptFile = path.join(root, '.auth/e4-receipt.json');
const screenshots = path.join(root, 'docs/e4/screenshots');
function digest(report) { return createHash('sha256').update(JSON.stringify(report)).digest('hex'); }
function receipt() {
  if (!fs.existsSync(receiptFile)) throw new Error('Falta la preparación E2E real y su recibo local .auth/e4-receipt.json. No se generará IA automáticamente.');
  const value = JSON.parse(fs.readFileSync(receiptFile, 'utf8'));
  if (value.week !== week) throw new Error('La semana configurada no coincide con el recibo real de preparación.');
  return value;
}
function connect(page) {
  let authorization; let apiURL;
  page.on('request', request => {
    if (new URL(request.url()).pathname.startsWith('/api/') && request.headers().authorization) {
      authorization = request.headers().authorization; apiURL = new URL('/api/', request.url()).href;
    }
  });
  return async function api(route) {
    await expect.poll(() => Boolean(authorization), { message: 'La UI debe autenticar una sesión Firebase real' }).toBe(true);
    const response = await page.request.get(`${apiURL}${route}`, { headers: { Authorization: authorization } });
    if (!response.ok()) throw new Error(`Consulta real ${route.split('?')[0]}: HTTP ${response.status()}`);
    return response.json();
  };
}
async function ready(page) {
  await page.locator('.dashboard-view').waitFor();
  await page.locator('.dashboard-loading').waitFor({ state: 'hidden' });
  await expect(page.locator('.form-error:visible, .dashboard-error:visible, .backend-connection.is-visible')).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);
}
async function capture(page, filename, options = {}) {
  await ready(page);
  await page.addStyleTag({ content: '.training-notice,.backend-connection { visibility:hidden !important; } * { scrollbar-width:none !important; }' });
  // Apply capture styles before positioning: scrollbar/font reflow must not move
  // the heading out of frame via browser scroll anchoring during screenshot().
  if (options.anchor) await options.anchor.evaluate(element => window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 28, behavior: 'instant' }));
  else await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  fs.mkdirSync(screenshots, { recursive: true });
  await page.screenshot({ path: path.join(screenshots, filename), type: 'png', fullPage: false,
    animations: 'disabled', caret: 'hide',
    mask: options.mask || [], maskColor: '#e5eadf',
  });
}
async function calendarWeek(page) {
  await page.goto('/app/entrenamiento/calendario'); await ready(page);
  const title = page.locator('.calendar-toolbar h2');
  // Navigate by actual week responses, never by the execution date or browser clock.
  for (let i = 0; i < 100; i++) {
    const selected = await page.locator('.calendar-day').first().getAttribute('aria-label');
    const year = Number(week.slice(0, 4)), month = Number(week.slice(5, 7)), day = Number(week.slice(8, 10));
    const label = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day)));
    if (selected?.includes(label)) return;
    const response = page.waitForResponse(r => r.url().includes('/api/training/calendar?') && r.ok());
    const previous = page.getByRole('button', { name: 'Semana anterior', exact: true });
    const text = await title.innerText();
    // The test starts from current week; demo week is explicitly required to be historical.
    if (!text) throw new Error('Calendario sin período visible');
    await previous.click(); await response;
  }
  throw new Error('No se pudo seleccionar la semana demo estable.');
}
module.exports = { ready, capture, calendarWeek, connect, receipt, receiptFile, screenshots, digest };

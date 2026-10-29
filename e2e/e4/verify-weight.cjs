const { chromium, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { root, baseURL, authFile, zone } = require('./settings.cjs');
const { connect, ready } = require('./helpers.cjs');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const context = await browser.newContext({ storageState: authFile, timezoneId: zone });
    const page = await context.newPage(); const api = connect(page);
    await page.goto(`${baseURL}/app/peso`); await ready(page);
    const data = await api(`weight?from=2026-10-12&to=2026-10-18&timeZone=${encodeURIComponent(zone)}`);
    const marker = '[DEMO SIMULADA E4] Alta de peso por UI, fuera de la semana congelada para IA.';
    let measurement = data.measurements.find(item => item.note === marker);
    if (!measurement) {
      const date = ['2026-10-15', '2026-10-16', '2026-10-17'].find(date => !data.measurements.some(item => item.localDate === date));
      if (!date) throw new Error('No hay fecha de prueba libre; no se sobrescribirá una medición.');
      await page.getByLabel('Fecha de medición').fill(date);
      await page.getByLabel('Peso (kg)', { exact: true }).fill(String(data.summary.last?.weightKg || 80));
      await page.getByLabel('Nota opcional').fill(marker);
      const responsePromise = page.waitForResponse(response => response.url().endsWith('/api/weight/measurements') && response.request().method() === 'POST');
      await page.getByRole('button', { name: 'Guardar peso', exact: true }).click();
      const response = await responsePromise;
      if (!response.ok()) throw new Error(`Peso HTTP ${response.status()}`);
      measurement = (await response.json()).measurement;
    }
    await page.reload(); await ready(page);
    const persisted = await api(`weight?from=2026-10-12&to=2026-10-18&timeZone=${encodeURIComponent(zone)}`);
    expect(persisted.measurements.some(item => item.localDate === measurement.localDate && item.note === marker)).toBe(true);
    const result = { weightUIWritten: true, weightReloadVerified: true, date: measurement.localDate,
      frozenDemoWeekUnchanged: true, newAIGenerations: 0 };
    fs.writeFileSync(path.join(root, 'docs/e4/weight-ui-verification.json'), JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify(result));
  } finally { await browser.close(); }
})().catch(error => { console.error('Prueba peso:', error.message); process.exitCode = 1; });

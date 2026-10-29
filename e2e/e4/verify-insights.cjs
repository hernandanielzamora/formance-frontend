const { chromium, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { root, baseURL, authFile, zone, week } = require('./settings.cjs');
const { connect, ready } = require('./helpers.cjs');

// Explicit live validation, not part of the screenshot suite. At most one new
// weekly generation; it never resets quotas, creates accounts or touches photo AI.
(async () => {
  const evidenceFile = path.join(root, '.auth/insights-live-receipt.json');
  const old = fs.existsSync(evidenceFile) ? JSON.parse(fs.readFileSync(evidenceFile, 'utf8')) : null;
  const previousResultFile = path.join(root, '.auth/weekly-insights-result.json');
  const previousGenerationCount = old?.totalNewGenerations ?? (fs.existsSync(previousResultFile) && JSON.parse(fs.readFileSync(previousResultFile, 'utf8')).cached === false ? 1 : 0);
  if (old?.attempted && !old.complete) throw new Error('Ya hubo un intento real: revisar su resultado/caché antes de volver a gastar cupo.');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const context = await browser.newContext({ baseURL, storageState: authFile, timezoneId: zone, viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage(); const api = connect(page);
    await page.goto('/app/reportes'); await ready(page);
    await page.getByLabel('Elegir fecha de la semana').fill(week);
    const report = await api(`reports/weekly?weekStart=${week}&timeZone=${encodeURIComponent(zone)}`);
    expect(report.current.training.totalSessions).toBeGreaterThan(0);
    expect(report.previous.training.totalSessions).toBeGreaterThan(0);
    const button = page.getByRole('button', { name: 'Analizar semana con IA', exact: true });
    await expect(button).toBeEnabled();
    fs.writeFileSync(evidenceFile, JSON.stringify({ attempted: true, week }));
    const pending = page.waitForResponse(response => response.url().endsWith('/api/reports/weekly-analysis') && response.request().method() === 'POST', { timeout: 90000 });
    await button.click(); const response = await pending;
    if (!response.ok()) { const body = await response.json(); throw new Error(`Validación real rechazada: HTTP ${response.status()} ${body.error?.code || ''}`); }
    const value = await response.json();
    const number = value => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(value);
    expect(value.analysis.comparison).toContain(`Sesiones completadas: ${number(report.current.training.sessions.completed)} frente a ${number(report.previous.training.sessions.completed)}`);
    expect(value.analysis.comparison).toContain(`diferencia: ${report.comparison.completedSessionsDelta > 0 ? '+' : ''}${number(report.comparison.completedSessionsDelta)}`);
    expect(JSON.stringify(value.analysis)).not.toMatch(/\bfat\b|\bcarbohydrates\b/);
    for (const name of ['Resumen', 'Comparación con la semana anterior', 'Entrenamiento', 'Alimentación', 'Peso y evolución', 'Tendencias', 'Aspectos a revisar', 'Foco para la próxima semana']) {
      await expect(page.locator('.weekly-analysis').getByRole('heading', { name, exact: true })).toBeVisible();
    }
    expect(value.analysis.nextWeekFocus.length).toBeGreaterThanOrEqual(1);
    expect(value.analysis.nextWeekFocus.length).toBeLessThanOrEqual(3);
    await expect(page.locator('.weekly-analysis')).toContainText('No constituye una recomendación médica, nutricional ni profesional.');
    fs.writeFileSync(path.join(root, '.auth/weekly-insights-result.json'), JSON.stringify(value, null, 2));
    // Persist a successful generation before the cache check so a later inspection
    // can resume safely without blindly consuming another request.
    const totalNewGenerations = previousGenerationCount + (value.cached ? 0 : 1);
    fs.writeFileSync(evidenceFile, JSON.stringify({ attempted: true, complete: true, week, fingerprint: value.fingerprint, totalNewGenerations }));
    await page.reload(); await ready(page); await page.getByLabel('Elegir fecha de la semana').fill(week);
    await expect(button).toBeEnabled();
    const pendingCache = page.waitForResponse(response => response.url().endsWith('/api/reports/weekly-analysis') && response.request().method() === 'POST');
    await button.click(); const responseCache = await pendingCache;
    expect(responseCache.ok()).toBe(true); const cached = await responseCache.json();
    expect(cached.cached).toBe(true); expect(cached.fingerprint).toBe(value.fingerprint);
    await page.locator('.weekly-analysis').screenshot({ path: path.join(root, '.auth/weekly-insights-preview.png'), animations: 'disabled' });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.locator('.weekly-domain-insights').evaluate(element => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length)).toBe(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const evidence = { analysisVersion: 2, week, realProviderVerified: true, allSectionsRendered: true,
      previousWeekWithRecords: true, cacheAfterReloadVerified: true, newGenerationsThisRun: value.cached ? 0 : 1,
      totalNewGenerationsValidated: totalNewGenerations, photoGenerations: 0, quotaReset: false, focusItems: value.analysis.nextWeekFocus.length,
      mobileSingleColumnVerified: true, numericComparisonVerified: true };
    fs.writeFileSync(path.join(root, 'docs/weekly-insights-verification.json'), JSON.stringify(evidence, null, 2) + '\n');
    console.log(JSON.stringify(evidence));
  } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });

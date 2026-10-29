const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { week, zone } = require('./settings.cjs');
const { ready, capture, calendarWeek, connect, receipt, digest } = require('./helpers.cjs');
test.beforeEach(async ({ page }) => {
  receipt(); // Fail closed: captures never prepare data or generate new AI implicitly.
  await page.goto('/app'); await ready(page);
  await page.addStyleTag({ content: fs.readFileSync(path.join(__dirname, 'composition.css'), 'utf8') });
});
test('01 Perfil y objetivo persistidos, identidad oculta', async ({ page }) => {
  await expect(page.locator('.profile-banner h2')).not.toBeEmpty();
  await expect(page.getByRole('heading', { name: 'Objetivo diario', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Macronutrientes diarios', exact: true })).toBeVisible();
  await expect(page.locator('.cards')).toContainText('kcal');
  // Explicit redaction labels replace identity only; no profile/reference values change.
  await page.addStyleTag({ content: `.intro h1 { font-size:0 !important; } .intro h1::after { content:'Perfil del usuario · identidad oculta'; font-size:32px; }
    .account-chip { font-size:0; position:relative; width:218px; height:32px; } .account-chip>* { visibility:hidden; }
    .account-chip::after { content:'Identidad protegida para la presentación'; font-size:11px; position:absolute; right:0; }` });
  await page.evaluate(() => window.scrollTo(0, 0));
  await capture(page, '01-perfil-objetivo.png');
});
test('02 Plan y series realizadas de una sesión real guardada', async ({ page }) => {
  await calendarWeek(page);
  const day = Number(receipt().trainingDate.slice(-2));
  await page.locator('.calendar-day').filter({ has: page.locator('strong', { hasText: new RegExp(`^${day}$`) }) }).click();
  await expect(page.locator('.session-history-item')).not.toHaveCount(0);
  await page.locator('.session-history-item').first().click();
  const recorder = page.locator('.session-recorder');
  await expect(recorder).toBeVisible();
  await expect(recorder.locator('.logged-exercise')).not.toHaveCount(0);
  await expect(recorder.locator('.set-prescription').first()).toContainText('Plan:');
  await expect(recorder.locator('.logged-set input[type=number]').first()).not.toHaveValue('');
  await page.addStyleTag({ content: fs.readFileSync(path.join(__dirname, 'composition.css'), 'utf8') });
  await page.evaluate(() => window.scrollTo(0, 0));
  await capture(page, '02-entrenamiento.png');
});
test('03 Diario con comida proveniente de Gemini real', async ({ page }) => {
  const api = connect(page);
  await page.goto('/app/alimentacion'); await ready(page);
  await page.getByLabel('Fecha del diario').fill(week);
  const diary = await api(`food/diary?date=${week}&timeZone=${encodeURIComponent(zone)}`);
  const photo = diary.meals.find(meal => meal.id === receipt().photoMealId);
  expect(photo?.items.some(item => item.source === 'gemini')).toBe(true);
  await expect(page.locator('.food-meal-card').filter({ hasText: 'Estimación IA' })).toBeVisible();
  await expect(page.locator('.food-daily-totals')).toContainText('Objetivo');
  await page.addStyleTag({ content: fs.readFileSync(path.join(__dirname, 'composition.css'), 'utf8') });
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.locator('.food-meal-card').filter({ hasText: 'Estimación IA' })).toBeInViewport({ ratio: 1 });
  await capture(page, '03-alimentacion-ia.png');
});
test('04 Peso: indicadores, gráfico e historial con varias fechas', async ({ page }) => {
  await page.goto('/app/peso'); await ready(page);
  await page.getByLabel('Desde', { exact: true }).fill('2026-09-28');
  await page.getByLabel('Hasta', { exact: true }).fill('2026-10-11');
  await expect(page.locator('.weight-history > article')).not.toHaveCount(0);
  expect(await page.locator('.weight-history > article').count()).toBeGreaterThanOrEqual(4);
  await expect(page.locator('.weight-chart svg')).toBeVisible();
  await page.addStyleTag({ content: fs.readFileSync(path.join(__dirname, 'composition.css'), 'utf8') });
  await page.getByRole('heading', { name: 'Historial y evolución', exact: true }).evaluate(element => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 28));
  await capture(page, '04-peso-progreso.png', { anchor: page.getByRole('heading', { name: 'Historial y evolución', exact: true }) });
});
test('05 Reporte integrado y análisis real recuperado de caché', async ({ page }) => {
  const api = connect(page);
  await page.goto('/app/reportes'); await ready(page);
  await page.getByLabel('Elegir fecha de la semana').fill(week);
  const report = await api(`reports/weekly?weekStart=${week}&timeZone=${encodeURIComponent(zone)}`);
  expect(digest(report), 'Datos distintos: detenerse en vez de generar IA nueva').toBe(receipt().reportDigest);
  expect(report.current.training.totalSessions).toBeGreaterThan(0);
  expect(report.current.food.meals).toBeGreaterThan(0);
  expect(report.current.weight.count).toBeGreaterThanOrEqual(2);
  const button = page.getByRole('button', { name: 'Analizar semana con IA', exact: true });
  await expect(button).toBeEnabled();
  const responsePromise = page.waitForResponse(response => response.url().endsWith('/api/reports/weekly-analysis') && response.request().method() === 'POST');
  await button.click(); const response = await responsePromise;
  expect(response.ok()).toBe(true); const value = await response.json();
  expect(value.cached).toBe(true); expect(value.fingerprint).toBe(receipt().fingerprint);
  for (const name of ['Resumen', 'Tendencias', 'Aspectos a revisar']) await expect(page.locator('.weekly-analysis').getByRole('heading', { name, exact: true })).toBeVisible();
  await expect(page.locator('.weekly-analysis')).toContainText('No constituye una recomendación médica, nutricional ni profesional.');
  await page.addStyleTag({ content: fs.readFileSync(path.join(__dirname, 'composition.css'), 'utf8') });
  await page.evaluate(() => window.scrollTo(0, 0));
  const disclaimer = page.locator('.weekly-analysis > .food-hint');
  await expect(disclaimer).toBeInViewport({ ratio: 1 });
  await expect(page.locator('.report-metrics').getByRole('heading', { name: 'Sesiones completadas', exact: true })).toBeInViewport();
  await expect(page.locator('.reports-page > .report-metrics > article').last()).toBeInViewport({ ratio: 1 });
  await capture(page, '05-reporte-ia.png');
});

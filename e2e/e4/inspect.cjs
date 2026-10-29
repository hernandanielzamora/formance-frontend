const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { root, baseURL, authFile, zone, week } = require('./settings.cjs');
const { connect, ready } = require('./helpers.cjs');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const context = await browser.newContext({ storageState: authFile, timezoneId: zone });
    const page = await context.newPage(); const api = connect(page);
    await page.goto(`${baseURL}/app`); await ready(page);
    const report = await api(`reports/weekly?weekStart=${week}&timeZone=${encodeURIComponent(zone)}`);
    const weights = await api(`weight?from=2026-09-16&to=2026-10-15&timeZone=${encodeURIComponent(zone)}`);
    const calendar = await api(`training/calendar?from=${week}&to=${report.period.to}&timeZone=${encodeURIComponent(zone)}`);
    const diary = await api(`food/diary?date=${week}&timeZone=${encodeURIComponent(zone)}`);
    const profile = await api('profile'); const identity = await api('auth/me');
    const summary = { authenticated: true, emailVerified: identity.emailVerified, onboardingCompleted: profile.profile?.onboardingCompleted,
      activeRoutine: !!calendar.routine, trainingSessions: report.current.training.totalSessions, meals: report.current.food.meals,
      weightDates: weights.measurements.length, weeklyWeightDates: report.current.weight.count,
      existingPhotoMeal: diary.meals.some(meal => meal.items.some(item => item.source === 'gemini')) };
    fs.writeFileSync(path.join(root, '.auth/e4-inspection.json'), JSON.stringify({ identity, profile, report, weights, calendar, diary }, null, 2));
    console.log(JSON.stringify(summary));
  } finally { await browser.close(); }
})().catch(error => { console.error('Inspección E2E falló:', error.message.replace(/Bearer\s+\S+/g, '[oculto]')); process.exitCode = 1; });

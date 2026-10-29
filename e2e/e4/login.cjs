const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { root, baseURL, authFile, zone } = require('./settings.cjs');
(async () => {
  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  const browser = process.env.E4_CDP_URL
    ? await chromium.connectOverCDP(process.env.E4_CDP_URL)
    : await chromium.launch({ channel: 'chrome', headless: false });
  const context = process.env.E4_CDP_URL ? browser.contexts()[0] : await browser.newContext({ timezoneId: zone });
  const page = await context.newPage();
  await page.goto(`${baseURL}/login`);
  if (process.env.E4_DEMO_EMAIL && process.env.E4_DEMO_PASSWORD) {
    await page.getByLabel('Correo electrónico').fill(process.env.E4_DEMO_EMAIL);
    await page.locator('input[name=password]').fill(process.env.E4_DEMO_PASSWORD);
    await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  } else console.log('Iniciá sesión con Google en Chrome. Se guardará solo la sesión local, sin imprimir credenciales.');
  await page.waitForURL(url => url.pathname === '/app' || url.pathname === '/admin', { timeout: 900000 });
  await page.goto(`${baseURL}/app`);
  await page.getByRole('heading', { name: 'Objetivo diario', exact: true }).waitFor({ timeout: 120000 });
  await context.storageState({ path: authFile, indexedDB: true });
  console.log('Sesión real guardada en .auth/e4.json (excluida de Git).');
  await browser.close();
})().catch(() => { console.error('No se guardó sesión: completar login/onboarding o revisar conectividad.'); process.exitCode = 1; });

const { defineConfig } = require('@playwright/test');
const { baseURL, authFile, zone } = require('./settings.cjs');
module.exports = defineConfig({
  testDir: __dirname, testMatch: 'screenshots.spec.cjs', workers: 1, retries: 0,
  timeout: 180000, expect: { timeout: 30000 }, reporter: 'line',
  outputDir: '../../.auth/test-results',
  use: { baseURL, channel: 'chrome', headless: true, storageState: authFile,
    viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1,
    colorScheme: 'light', timezoneId: zone, locale: 'es-AR',
    trace: 'off', video: 'off', screenshot: 'off', reducedMotion: 'reduce' },
});

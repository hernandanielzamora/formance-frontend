const { defineConfig } = require('../e4/node_modules/@playwright/test');
const baseURL = process.env.PRESENTATION_LIVE_URL;
if (!baseURL || !baseURL.startsWith('https://')) throw new Error('Set PRESENTATION_LIVE_URL to the existing Vercel preview or production HTTPS URL.');
module.exports = defineConfig({testDir:__dirname,testMatch:'live.smoke.cjs',workers:1,retries:0,reporter:'line',outputDir:'../../.auth/presentation-live-results',use:{baseURL,channel:'chrome',headless:true,viewport:{width:1440,height:900},reducedMotion:'no-preference',storageState:{cookies:[],origins:[]}}});

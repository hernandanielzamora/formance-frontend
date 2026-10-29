const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const local = path.join(root, '.env.e4.local');
if (fs.existsSync(local)) process.loadEnvFile(local);
module.exports = { root, baseURL: process.env.E4_BASE_URL || 'http://localhost:3000',
  authFile: path.join(root, '.auth/e4.json'),
  week: process.env.E4_DEMO_WEEK_START || '2026-10-05',
  zone: 'America/Argentina/Buenos_Aires' };

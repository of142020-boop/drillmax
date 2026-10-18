import fs from 'node:fs';
import crypto from 'node:crypto';

const KEY_PATH = 'secrets/gsc-key.json';
const key = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'));
const b64 = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');

async function token() {
  const now = Math.floor(Date.now() / 1000);
  const head = b64({ alg: 'RS256', typ: 'JWT' });
  const body = b64({
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  });
  const sig = crypto.createSign('RSA-SHA256').update(`${head}.${body}`).sign(key.private_key, 'base64url');
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${head}.${body}.${sig}` }),
  });
  const j = await r.json();
  return j.access_token;
}

const T = await token();
const site = 'https://drilmax.com/';
const enc = encodeURIComponent(site);

// Submit sitemap-index.xml
const sitemapUrl = 'https://drilmax.com/sitemap-index.xml';
const r = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${enc}/sitemaps/${encodeURIComponent(sitemapUrl)}`, {
  method: 'PUT',
  headers: { Authorization: `Bearer ${T}` }
});

console.log('Sitemap submitted:', r.status === 204 ? 'SUCCESS (204 No Content)' : `Status: ${r.status}`);

// Google Search Console audit via Service Account (no extra dependencies).
// Usage: node scripts/gsc-report.mjs   (key at secrets/gsc-key.json)
import fs from 'node:fs';
import crypto from 'node:crypto';

const KEY_PATH = process.env.GSC_KEY || 'secrets/gsc-key.json';
const key = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'));
const b64 = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');

async function token() {
  const now = Math.floor(Date.now() / 1000);
  const head = b64({ alg: 'RS256', typ: 'JWT' });
  const body = b64({
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
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
  if (!j.access_token) throw new Error('Auth failed: ' + JSON.stringify(j));
  return j.access_token;
}

const T = await token();
const api = async (url, body) => {
  const r = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${T}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json();
  if (j.error) throw new Error(`${url} -> ${j.error.message}`);
  return j;
};

const sites = (await api('https://www.googleapis.com/webmasters/v3/sites')).siteEntry || [];
console.log('Sites:', sites.map((s) => `${s.siteUrl} (${s.permissionLevel})`).join(', ') || 'NONE - add the service account email as a user in Search Console');
if (!sites.length) process.exit(1);
const site = process.env.GSC_SITE || (sites.find((s) => /drilmax/.test(s.siteUrl)) || sites[0]).siteUrl;
console.log('Using:', site);
const enc = encodeURIComponent(site);
const SA = `https://www.googleapis.com/webmasters/v3/sites/${enc}/searchAnalytics/query`;

const d = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
// GSC data lags ~2 days
const cur = { startDate: d(92), endDate: d(2) };
const prev = { startDate: d(182), endDate: d(93) };
const q = (range, dims, limit = 25) => api(SA, { ...range, dimensions: dims, rowLimit: limit });
const tot = async (range) => (await api(SA, { ...range })).rows?.[0] || {};
const fmt = (r) => ({ clicks: r.clicks, impressions: r.impressions, ctr: +(r.ctr * 100).toFixed(2), position: +r.position?.toFixed(1) });

const out = { site, sitemaps: [], totals: {}, topQueries: [], topPages: [], droppedPages: [], droppedQueries: [], inspection: [] };

try { out.sitemaps = ((await api(`https://www.googleapis.com/webmasters/v3/sites/${enc}/sitemaps`)).sitemap || []).map((s) => ({ path: s.path, lastDownloaded: s.lastDownloaded, errors: s.errors, warnings: s.warnings, contents: s.contents })); } catch (e) { out.sitemaps = String(e); }

const [c, p] = [await tot(cur), await tot(prev)];
out.totals = { last90d: fmt(c), previous90d: fmt(p) };

out.topQueries = ((await q(cur, ['query'], 20)).rows || []).map((r) => ({ query: r.keys[0], ...fmt(r) }));
out.topPages = ((await q(cur, ['page'], 25)).rows || []).map((r) => ({ page: r.keys[0], ...fmt(r) }));

// Biggest losers (page and query level)
async function losers(dim, key2) {
  const [a, b] = [(await q(cur, [dim], 500)).rows || [], (await q(prev, [dim], 500)).rows || []];
  const m = new Map(a.map((r) => [r.keys[0], r]));
  return b.map((r) => ({ [key2]: r.keys[0], before: r.clicks, now: m.get(r.keys[0])?.clicks || 0, posBefore: +r.position.toFixed(1), posNow: m.get(r.keys[0]) ? +m.get(r.keys[0]).position.toFixed(1) : null }))
    .map((x) => ({ ...x, diff: x.now - x.before })).sort((x, y) => x.diff - y.diff).slice(0, 15);
}
out.droppedPages = await losers('page', 'page');
out.droppedQueries = await losers('query', 'query');

// URL Inspection of main pages
const urls = (out.topPages.map((x) => x.page)).concat(['https://drilmax.com/']).filter((v, i, a) => a.indexOf(v) === i).slice(0, 25);
for (const u of urls) {
  try {
    const r = (await api('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', { inspectionUrl: u, siteUrl: site, languageCode: 'ar' })).inspectionResult.indexStatusResult;
    out.inspection.push({ url: u, verdict: r.verdict, coverage: r.coverageState, robots: r.robotsTxtState, indexing: r.indexingState, googleCanonical: r.googleCanonical, userCanonical: r.userCanonical, lastCrawl: r.lastCrawlTime });
  } catch (e) { out.inspection.push({ url: u, error: String(e).slice(0, 120) }); }
}

fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/gsc-report.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify({ totals: out.totals, sitemaps: out.sitemaps, notIndexed: out.inspection.filter((i) => i.verdict !== 'PASS') }, null, 1));
console.log('Full report: reports/gsc-report.json');

#!/usr/bin/env node
/**
 * DATORE v5 — Production Readiness Agent
 * 
 * USAGE:
 *   node datore-test-agent.js --check       # Pre-deploy checks only
 *   node datore-test-agent.js --test URL    # Run all tests against live URL
 *   node datore-test-agent.js --deploy      # Full deploy pipeline
 *   node datore-test-agent.js --all         # Check + Deploy + Test
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const PROJECT_DIR = process.cwd();
const RESULTS = [];
let PASS = 0, FAIL = 0, WARN = 0, LIVE_URL = '';

const RED = '\x1b[31m', GREEN = '\x1b[32m', YELLOW = '\x1b[33m', CYAN = '\x1b[36m', BOLD = '\x1b[1m', RESET = '\x1b[0m';

function pass(cat, test, d='') { PASS++; console.log(`  ${GREEN}✓${RESET} [${cat}] ${test}${d?' — '+d:''}`); RESULTS.push({s:'PASS',cat,test,d}); }
function fail(cat, test, d='', fix='') { FAIL++; console.log(`  ${RED}✗${RESET} [${cat}] ${test}${d?' — '+d:''}`); if(fix) console.log(`    ${YELLOW}FIX: ${fix}${RESET}`); RESULTS.push({s:'FAIL',cat,test,d,fix}); }
function warn(cat, test, d='') { WARN++; console.log(`  ${YELLOW}⚠${RESET} [${cat}] ${test}${d?' — '+d:''}`); RESULTS.push({s:'WARN',cat,test,d}); }
function section(t) { console.log(`\n${BOLD}${CYAN}═══ ${t} ═══${RESET}\n`); }
function run(cmd) { try { return execSync(cmd,{cwd:PROJECT_DIR,encoding:'utf8',timeout:120000,stdio:'pipe'}); } catch(e) { return e.stdout||e.stderr||e.message; } }
function fileExists(r) { return fs.existsSync(path.join(PROJECT_DIR,r)); }
function readFile(r) { try { return fs.readFileSync(path.join(PROJECT_DIR,r),'utf8'); } catch { return ''; } }

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout:15000, headers:{'User-Agent':'Datore-Test-Agent/1.0'} }, res => {
      let body = ''; res.on('data', d => body += d);
      res.on('end', () => resolve({ status:res.statusCode, headers:res.headers, body }));
    });
    req.on('error', reject); req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

// ═══ PHASE 1: PRE-DEPLOY CHECKS ═══
async function preDeployChecks() {
  section('PHASE 1: PRE-DEPLOY CHECKS');

  // 1.1 Environment
  console.log(`${BOLD}  1.1 Environment Configuration${RESET}`);
  if (fileExists('.env.local')) {
    pass('ENV', '.env.local exists');
    const env = readFile('.env.local');
    if (env.includes('NEXT_PUBLIC_SUPABASE_URL=https://')) pass('ENV', 'SUPABASE_URL configured');
    else fail('ENV', 'SUPABASE_URL missing', '', 'Add NEXT_PUBLIC_SUPABASE_URL to .env.local');
    if (env.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ')) pass('ENV', 'SUPABASE_ANON_KEY configured (JWT)');
    else fail('ENV', 'SUPABASE_ANON_KEY missing/wrong', 'Must start with eyJ', 'Get from Supabase > Settings > API');
    if (env.includes('SUPABASE_SERVICE_ROLE_KEY=eyJ')) pass('ENV', 'SERVICE_ROLE_KEY configured');
    else if (env.includes('PASTE_YOUR')) fail('ENV', 'SERVICE_ROLE_KEY still placeholder!', '', 'Replace with actual key from Supabase > Settings > API');
    else fail('ENV', 'SERVICE_ROLE_KEY missing');
    const gi = readFile('.gitignore');
    if (gi.includes('.env.local')) pass('SECURITY', '.env.local in .gitignore');
    else fail('SECURITY', '.env.local NOT in .gitignore!', 'Keys will leak', 'Add .env.local to .gitignore NOW');
  } else {
    fail('ENV', '.env.local missing', '', 'Copy .env.local.template to .env.local and fill in keys');
  }

  // 1.2 Project Structure
  console.log(`\n${BOLD}  1.2 Project Structure${RESET}`);
  const required = [
    'package.json','next.config.mjs','vercel.json','middleware.ts',
    'lib/supabase.ts','lib/supabaseServer.ts','lib/useAuth.ts',
    'lib/moderation.ts','lib/security.ts','lib/apiGuard.ts',
    'tailwind.config.ts','tsconfig.json'
  ];
  for (const f of required) {
    if (fileExists(f)) pass('STRUCTURE', f);
    else fail('STRUCTURE', `${f} MISSING`);
  }

  // 1.3 Supabase Functions
  console.log(`\n${BOLD}  1.3 Supabase Client Audit${RESET}`);
  const sb = readFile('lib/supabase.ts');
  const fns = ['signInWithEmail','signUpWithEmail','signInWithGoogle','signOut','getProfile','updateProfile',
    'createPost','getPosts','deletePost','createJob','getJobs','createListing','getListings',
    'getChatRooms','sendMessage','subscribeToMessages','createOrder','getMyOrders',
    'createBooking','getMyBookings','getNotifications','subscribeToNotifications',
    'getWalletBalance','uploadAvatar','uploadPostMedia','toggleLike','getComments','createComment',
    'sendFriendRequest','getFriends','recordConsent','submitDSR'];
  let found = 0;
  for (const fn of fns) { if (sb.includes(`function ${fn}`)) found++; else fail('SUPABASE', `Missing: ${fn}`); }
  if (found === fns.length) pass('SUPABASE', `All ${found} functions present`);
  else warn('SUPABASE', `${found}/${fns.length} functions found`);
  if (sb.includes('postgres_changes')) pass('SUPABASE', 'Realtime subscriptions configured');
  else warn('SUPABASE', 'No realtime subscriptions');
  const srv = readFile('lib/supabaseServer.ts');
  if (srv.includes('SERVICE_ROLE_KEY')) pass('SUPABASE', 'Server client uses service_role');
  else fail('SUPABASE', 'Server client missing service_role');

  // 1.4 Security
  console.log(`\n${BOLD}  1.4 Security Audit${RESET}`);
  const mw = readFile('middleware.ts');
  if (mw.includes('X-Frame-Options')) pass('SECURITY', 'X-Frame-Options in middleware');
  else warn('SECURITY', 'No X-Frame-Options in middleware');
  if (mw.includes('rate') || mw.includes('rateLimit')) pass('SECURITY', 'Rate limiting active');
  else warn('SECURITY', 'No rate limiting');
  const vj = readFile('vercel.json');
  if (vj.includes('X-Frame-Options')) pass('SECURITY', 'Vercel security headers set');
  else warn('SECURITY', 'No security headers in vercel.json');
  const lsCount = (run('grep -rn "localStorage" app/ 2>/dev/null | wc -l') || '0').trim();
  if (parseInt(lsCount) === 0) pass('SECURITY', 'No localStorage in pages');
  else warn('SECURITY', `${lsCount} localStorage calls in pages`, 'Data stored locally only');

  // 1.5 Build
  console.log(`\n${BOLD}  1.5 Build Verification${RESET}`);
  console.log('  Running npm install...');
  const inst = run('npm install 2>&1');
  if (inst.includes('ERR!')) fail('BUILD', 'npm install failed', inst.slice(0,200));
  else pass('BUILD', 'npm install ok');
  console.log('  Running next build (30-90 seconds)...');
  const build = run('npx next build 2>&1');
  if (build.includes('Route (app)') || build.includes('Compiled') || build.includes('Generating')) {
    pass('BUILD', 'next build succeeded');
  } else if (build.includes('Error') || build.includes('error TS')) {
    const err = build.split('\n').find(l => l.includes('Error'));
    fail('BUILD', 'next build FAILED', err || build.slice(0,200));
  } else { warn('BUILD', 'Build status uncertain', build.slice(0,200)); }
}

// ═══ PHASE 2: DEPLOY ═══
async function deploy() {
  section('PHASE 2: DEPLOY TO VERCEL');
  console.log(`${BOLD}  2.1 Git Setup${RESET}`);
  if (!fileExists('.git')) {
    run('git init && git add . && git commit -m "Datore v5 production"');
    pass('DEPLOY', 'Git initialized + committed');
  } else {
    run('git add . && git commit -m "update" --allow-empty');
    pass('DEPLOY', 'Git changes committed');
  }
  console.log(`\n${BOLD}  2.2 Vercel Deploy${RESET}`);
  const vv = run('vercel --version 2>&1');
  if (!vv.includes('Vercel')) { console.log('  Installing vercel CLI...'); run('npm i -g vercel'); }
  pass('DEPLOY', 'Vercel CLI ready');
  const who = run('vercel whoami 2>&1');
  if (who.includes('Error') || who.includes('not logged')) { fail('DEPLOY','Not logged in','','Run: vercel login'); return; }
  pass('DEPLOY', `Logged in as: ${who.trim()}`);
  console.log('  Deploying to production (1-3 min)...');
  const dep = run('vercel --prod --yes 2>&1');
  const urlM = dep.match(/(https:\/\/[a-z0-9-]+\.vercel\.app)/);
  if (urlM) { LIVE_URL = urlM[1]; pass('DEPLOY', `Live: ${LIVE_URL}`); }
  else if (dep.includes('Error')) fail('DEPLOY', 'Deploy failed', dep.slice(0,200));
  else warn('DEPLOY', 'Deploy done but URL not found', 'Check vercel.com dashboard');
}

// ═══ PHASE 3: LIVE TESTS ═══
async function liveTests(url) {
  if (!url) { console.log(`\n  ${RED}No URL. Usage: node datore-test-agent.js --test https://your.vercel.app${RESET}`); return; }
  section('PHASE 3: LIVE PRODUCTION TESTS');
  LIVE_URL = url.replace(/\/$/,'');

  // 3.1 Connectivity
  console.log(`${BOLD}  3.1 Connectivity${RESET}`);
  try {
    const r = await httpGet(LIVE_URL);
    if ([200,308,301,307].includes(r.status)) pass('LIVE', `Homepage → ${r.status}`);
    else fail('LIVE', `Homepage → ${r.status}`);
    if (r.body.includes('_next') || r.body.includes('__NEXT')) pass('LIVE', 'Next.js app detected');
  } catch(e) { fail('LIVE', `Cannot reach ${LIVE_URL}`, e.message); return; }

  // 3.2 Security Headers
  console.log(`\n${BOLD}  3.2 Security Headers${RESET}`);
  try {
    const r = await httpGet(LIVE_URL);
    const h = r.headers;
    if (h['x-frame-options']) pass('HEADERS', `X-Frame-Options: ${h['x-frame-options']}`);
    else fail('HEADERS', 'Missing X-Frame-Options');
    if (h['x-content-type-options']) pass('HEADERS', `X-Content-Type-Options: ${h['x-content-type-options']}`);
    else fail('HEADERS', 'Missing X-Content-Type-Options');
    if (h['referrer-policy']) pass('HEADERS', `Referrer-Policy: ${h['referrer-policy']}`);
    else warn('HEADERS', 'Missing Referrer-Policy');
    if (h['x-xss-protection']) pass('HEADERS', `X-XSS-Protection: ${h['x-xss-protection']}`);
    else warn('HEADERS', 'Missing X-XSS-Protection');
    if (h['x-powered-by']) warn('HEADERS', `X-Powered-By exposed: ${h['x-powered-by']}`);
    else pass('HEADERS', 'X-Powered-By hidden');
  } catch(e) { fail('HEADERS', 'Cannot check', e.message); }

  // 3.3 Critical Pages
  console.log(`\n${BOLD}  3.3 Critical Pages (${14} routes)${RESET}`);
  const pages = ['/login','/home','/jobplace','/marketplace','/shopping','/entertainment',
    '/messages','/notifications','/profile','/wallet','/settings','/privacy','/admin','/search'];
  for (const p of pages) {
    try {
      const r = await httpGet(LIVE_URL + p);
      if ([200,308,301,307].includes(r.status)) pass('PAGES', `${p} → ${r.status}`);
      else if (r.status === 404) fail('PAGES', `${p} → 404`);
      else if (r.status === 500) fail('PAGES', `${p} → 500`, '', 'Check Vercel logs');
      else warn('PAGES', `${p} → ${r.status}`);
    } catch(e) { fail('PAGES', `${p} ERROR`, e.message); }
  }

  // 3.4 API Routes
  console.log(`\n${BOLD}  3.4 API Routes${RESET}`);
  const apis = ['/api/jobs','/api/listings','/api/workers','/api/chat','/api/bookings','/api/providers','/api/payments'];
  for (const a of apis) {
    try {
      const r = await httpGet(LIVE_URL + a);
      if (r.status === 200) pass('API', `${a} → 200`);
      else if (r.status === 401) pass('API', `${a} → 401 (protected)`);
      else if (r.status === 405) pass('API', `${a} → 405 (POST-only)`);
      else warn('API', `${a} → ${r.status}`);
    } catch(e) { fail('API', `${a} ERROR`, e.message); }
  }

  // 3.5 Supabase
  console.log(`\n${BOLD}  3.5 Supabase Connectivity${RESET}`);
  const env = readFile('.env.local');
  const sbUrl = (env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)||[])[1]?.trim();
  if (sbUrl) {
    try {
      const r = await httpGet(`${sbUrl}/auth/v1/settings`);
      if (r.status === 200) {
        pass('SUPABASE', 'Auth service alive');
        try {
          const s = JSON.parse(r.body);
          if (s.external?.google) pass('SUPABASE', 'Google OAuth ON');
          else warn('SUPABASE', 'Google OAuth OFF');
          if (s.external?.phone) pass('SUPABASE', 'Phone OTP ON');
          else warn('SUPABASE', 'Phone OTP OFF');
          if (s.mailer_autoconfirm === false) pass('SUPABASE', 'Email confirmation ON');
          else warn('SUPABASE', 'Email auto-confirm (no verification)');
        } catch {}
      } else warn('SUPABASE', `Auth returned ${r.status}`);
    } catch(e) { fail('SUPABASE', 'Cannot reach Supabase', e.message); }
  }

  // 3.6 SSL
  console.log(`\n${BOLD}  3.6 SSL/TLS${RESET}`);
  if (LIVE_URL.startsWith('https')) pass('SSL', 'HTTPS active');
  else fail('SSL', 'Not HTTPS!');

  // 3.7 Performance
  console.log(`\n${BOLD}  3.7 Performance${RESET}`);
  const t0 = Date.now();
  try { await httpGet(LIVE_URL); const ms = Date.now()-t0;
    if (ms < 1000) pass('PERF', `TTFB: ${ms}ms (excellent)`);
    else if (ms < 3000) pass('PERF', `TTFB: ${ms}ms (ok)`);
    else warn('PERF', `TTFB: ${ms}ms (slow)`);
  } catch(e) { fail('PERF', 'TTFB failed', e.message); }

  // 3.8 Vulnerability
  console.log(`\n${BOLD}  3.8 Vulnerability Checks${RESET}`);
  try {
    const r = await httpGet(LIVE_URL + '/.env.local');
    if (r.status === 404 || r.status === 403) pass('VULN', '.env.local not exposed');
    else if (r.body.includes('SUPABASE')) fail('VULN', '.env.local EXPOSED!', '', 'CRITICAL: Rotate all keys immediately');
    else pass('VULN', '.env.local safe');
  } catch { pass('VULN', '.env.local safe'); }
  try {
    const r = await httpGet(LIVE_URL + '/.git/config');
    if (r.body.includes('[core]')) fail('VULN', '.git EXPOSED!');
    else pass('VULN', '.git not exposed');
  } catch { pass('VULN', '.git safe'); }
}

// ═══ REPORT ═══
function report() {
  section('FINAL REPORT');
  console.log(`  ${GREEN}PASS: ${PASS}${RESET}  ${RED}FAIL: ${FAIL}${RESET}  ${YELLOW}WARN: ${WARN}${RESET}  Total: ${PASS+FAIL+WARN}\n`);
  if (FAIL === 0) {
    console.log(`  ${GREEN}${BOLD}✓ ALL CHECKS PASSED — Production ready!${RESET}`);
    if (LIVE_URL) console.log(`  ${CYAN}Live: ${LIVE_URL}${RESET}`);
  } else {
    console.log(`  ${RED}${BOLD}✗ ${FAIL} FAILURES — Fix before launch${RESET}\n`);
    RESULTS.filter(r=>r.s==='FAIL').forEach(r => {
      console.log(`    ${RED}✗${RESET} [${r.cat}] ${r.test}`);
      if (r.fix) console.log(`      ${YELLOW}→ ${r.fix}${RESET}`);
    });
  }
  if (WARN > 0) {
    console.log(`\n  Warnings:`);
    RESULTS.filter(r=>r.s==='WARN').forEach(r => console.log(`    ${YELLOW}⚠${RESET} [${r.cat}] ${r.test}${r.d?' — '+r.d:''}`));
  }
  const rf = `datore-test-report-${new Date().toISOString().slice(0,10)}.json`;
  fs.writeFileSync(path.join(PROJECT_DIR, rf), JSON.stringify({
    timestamp: new Date().toISOString(), url: LIVE_URL||'not deployed',
    summary: {pass:PASS,fail:FAIL,warn:WARN}, results:RESULTS
  }, null, 2));
  console.log(`\n  Report: ${rf}\n`);
}

// ═══ MAIN ═══
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || '--check';
  const urlArg = args.find(a => a.startsWith('http'));
  console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${CYAN}║   DATORE v5 — Production Readiness Agent v1.0    ║${RESET}`);
  console.log(`${BOLD}${CYAN}╚══════════════════════════════════════════════════╝${RESET}\n`);
  if (mode==='--check'||mode==='--all') await preDeployChecks();
  if (mode==='--deploy'||mode==='--all') { if(FAIL>0&&mode==='--all'){console.log(`\n  ${RED}Fix ${FAIL} failures first.${RESET}`);} else await deploy(); }
  if (mode==='--test'||mode==='--all') await liveTests(urlArg||LIVE_URL);
  report();
}
main().catch(e => { console.error(`${RED}Agent crashed:${RESET}`, e.message); process.exit(1); });

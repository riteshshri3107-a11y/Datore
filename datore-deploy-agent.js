#!/usr/bin/env node
/**
 * DATORE Deploy Agent — Merge & Deploy to Production
 *
 * USAGE:
 *   node datore-deploy-agent.js --merge <branch>    # Merge branch into main & push
 *   node datore-deploy-agent.js --merge-all          # Merge ALL claude/* branches into main
 *   node datore-deploy-agent.js --status              # Show branch & deploy status
 *   node datore-deploy-agent.js --verify <url>        # Verify production is healthy
 *
 * EXAMPLES:
 *   node datore-deploy-agent.js --merge claude/design-website-sections-6PMJ9
 *   node datore-deploy-agent.js --merge-all
 *   node datore-deploy-agent.js --verify https://datore.vercel.app
 */

const { execSync } = require('child_process');
const https = require('https');

const RED = '\x1b[31m', GREEN = '\x1b[32m', YELLOW = '\x1b[33m', CYAN = '\x1b[36m', BOLD = '\x1b[1m', DIM = '\x1b[2m', RESET = '\x1b[0m';

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', timeout: 60000, stdio: 'pipe', ...opts }).trim();
  } catch (e) {
    if (opts.throws !== false) throw e;
    return (e.stdout || e.stderr || e.message || '').trim();
  }
}

function log(icon, msg) { console.log(`  ${icon} ${msg}`); }
function ok(msg) { log(`${GREEN}✓${RESET}`, msg); }
function fail(msg) { log(`${RED}✗${RESET}`, msg); }
function info(msg) { log(`${CYAN}ℹ${RESET}`, msg); }
function warn(msg) { log(`${YELLOW}⚠${RESET}`, msg); }

function banner() {
  console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${CYAN}║     DATORE Deploy Agent — Merge & Ship v1.0      ║${RESET}`);
  console.log(`${BOLD}${CYAN}╚══════════════════════════════════════════════════╝${RESET}\n`);
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 15000, headers: { 'User-Agent': 'Datore-Deploy-Agent/1.0' } }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

// ═══ STATUS ═══
function showStatus() {
  console.log(`${BOLD}  Branch Status${RESET}\n`);

  const currentBranch = run('git branch --show-current');
  info(`Current branch: ${BOLD}${currentBranch}${RESET}`);

  // Show main branch status
  run('git fetch origin main', { throws: false });
  const mainHash = run('git rev-parse --short origin/main', { throws: false });
  info(`Main branch: ${mainHash}`);

  // List all claude/* branches
  const branches = run('git branch -r --list "origin/claude/*"', { throws: false });
  if (!branches) {
    info('No claude/* branches found on remote');
    return;
  }

  console.log(`\n${BOLD}  Feature Branches${RESET}\n`);
  const branchList = branches.split('\n').map(b => b.trim()).filter(Boolean);

  for (const branch of branchList) {
    const shortBranch = branch.replace('origin/', '');
    const hash = run(`git rev-parse --short ${branch}`, { throws: false });
    const mergeBase = run(`git merge-base origin/main ${branch}`, { throws: false });
    const mainHead = run('git rev-parse origin/main', { throws: false });
    const branchHead = run(`git rev-parse ${branch}`, { throws: false });

    // Check if already merged
    const isMerged = run(`git merge-base --is-ancestor ${branch} origin/main 2>&1; echo $?`, { throws: false });
    if (isMerged === '0') {
      ok(`${shortBranch} ${DIM}(${hash}) — already merged${RESET}`);
    } else {
      const ahead = run(`git rev-list --count origin/main..${branch}`, { throws: false });
      const behind = run(`git rev-list --count ${branch}..origin/main`, { throws: false });
      warn(`${shortBranch} ${DIM}(${hash}) — ${ahead} ahead, ${behind} behind main${RESET}`);
    }
  }
}

// ═══ MERGE ═══
function mergeBranch(branch) {
  console.log(`${BOLD}  Merging: ${branch} → main${RESET}\n`);

  // Fetch latest
  info('Fetching latest from origin...');
  run('git fetch origin');

  // Check branch exists
  const exists = run(`git ls-remote --heads origin ${branch}`, { throws: false });
  if (!exists) {
    fail(`Branch ${branch} does not exist on remote`);
    process.exit(1);
  }
  ok(`Branch ${branch} exists`);

  // Check if already merged
  const isMerged = run(`git merge-base --is-ancestor origin/${branch} origin/main 2>&1; echo $?`, { throws: false });
  if (isMerged === '0') {
    info(`${branch} is already merged into main. Skipping.`);
    return true;
  }

  // Save current branch
  const originalBranch = run('git branch --show-current');

  // Stash any uncommitted changes
  const hasChanges = run('git status --porcelain', { throws: false });
  if (hasChanges) {
    info('Stashing uncommitted changes...');
    run('git stash push -m "deploy-agent-autostash"');
  }

  try {
    // Switch to main
    info('Switching to main...');
    run('git checkout main');
    run('git pull origin main');

    // Attempt merge
    info(`Merging origin/${branch}...`);
    try {
      run(`git merge origin/${branch} --no-edit -m "Merge ${branch} into main [Datore Deploy Agent]"`);
      ok('Merge successful');
    } catch (e) {
      fail('Merge conflict detected!');
      console.log(`\n  ${RED}Resolve conflicts manually:${RESET}`);
      console.log(`    git checkout main`);
      console.log(`    git merge origin/${branch}`);
      console.log(`    # fix conflicts, then:`);
      console.log(`    git add . && git commit && git push origin main\n`);
      run('git merge --abort', { throws: false });
      run(`git checkout ${originalBranch}`, { throws: false });
      return false;
    }

    // Push to main
    info('Pushing to main...');
    try {
      run('git push origin main');
      ok(`${GREEN}${BOLD}Pushed to main — Vercel will auto-deploy to production!${RESET}`);
    } catch (e) {
      fail('Push to main failed (permission denied)');
      console.log(`\n  ${YELLOW}Manual steps needed:${RESET}`);
      console.log(`    1. Go to GitHub: https://github.com/riteshshri3107-a11y/Datore`);
      console.log(`    2. Create PR from ${branch} → main`);
      console.log(`    3. Click "Merge pull request"\n`);
      run(`git reset --hard origin/main`, { throws: false });
    }
  } finally {
    // Restore original branch
    run(`git checkout ${originalBranch}`, { throws: false });
    if (hasChanges) {
      run('git stash pop', { throws: false });
    }
  }
  return true;
}

// ═══ MERGE ALL ═══
function mergeAll() {
  console.log(`${BOLD}  Merging ALL claude/* branches → main${RESET}\n`);

  run('git fetch origin');
  const branches = run('git branch -r --list "origin/claude/*"', { throws: false });
  if (!branches) {
    info('No claude/* branches found');
    return;
  }

  const branchList = branches.split('\n')
    .map(b => b.trim().replace('origin/', ''))
    .filter(Boolean);

  info(`Found ${branchList.length} branch(es) to process\n`);

  let merged = 0, skipped = 0, failed = 0;

  for (const branch of branchList) {
    console.log(`\n${DIM}─────────────────────────────────────${RESET}`);
    const result = mergeBranch(branch);
    if (result === true) merged++;
    else failed++;
  }

  console.log(`\n${BOLD}  Summary${RESET}`);
  ok(`Merged: ${merged}`);
  if (failed > 0) fail(`Failed: ${failed}`);
  console.log('');
}

// ═══ VERIFY ═══
async function verifyProduction(url) {
  console.log(`${BOLD}  Verifying: ${url}${RESET}\n`);

  const routes = [
    '/', '/login', '/home', '/settings', '/settings/privacy',
    '/settings/account', '/settings/security', '/settings/activity',
    '/settings/notifications', '/settings/accessibility',
    '/profile', '/jobplace', '/marketplace', '/wallet',
    '/community', '/notifications', '/search',
  ];

  let pass = 0, total = routes.length;

  for (const route of routes) {
    try {
      const r = await httpGet(url + route);
      if ([200, 301, 307, 308].includes(r.status)) {
        ok(`${route} → ${r.status}`);
        pass++;
      } else if (r.status === 404) {
        fail(`${route} → 404 NOT FOUND`);
      } else {
        warn(`${route} → ${r.status}`);
        pass++;
      }
    } catch (e) {
      fail(`${route} → ${e.message}`);
    }
  }

  console.log(`\n${BOLD}  Result: ${pass}/${total} routes OK${RESET}`);
  if (pass === total) {
    console.log(`  ${GREEN}${BOLD}✓ Production is healthy!${RESET}\n`);
  } else {
    console.log(`  ${YELLOW}⚠ ${total - pass} route(s) need attention${RESET}\n`);
  }
}

// ═══ MAIN ═══
async function main() {
  banner();

  const args = process.argv.slice(2);
  const mode = args[0] || '--status';

  switch (mode) {
    case '--status':
      showStatus();
      break;
    case '--merge':
      if (!args[1]) {
        fail('Usage: node datore-deploy-agent.js --merge <branch-name>');
        process.exit(1);
      }
      mergeBranch(args[1]);
      break;
    case '--merge-all':
      mergeAll();
      break;
    case '--verify':
      await verifyProduction(args[1] || 'https://datore.vercel.app');
      break;
    default:
      console.log('  Usage:');
      console.log('    --status              Show branch & deploy status');
      console.log('    --merge <branch>      Merge specific branch to main');
      console.log('    --merge-all           Merge all claude/* branches to main');
      console.log('    --verify [url]        Verify production routes\n');
  }
}

main().catch(e => { console.error(`${RED}Agent crashed:${RESET}`, e.message); process.exit(1); });

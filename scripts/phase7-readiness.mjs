import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const checks = [
  ['Project entry point exists', existsSync(resolve(root, 'index.html')) && existsSync(resolve(root, 'src/main.tsx'))],
  ['Latest Phase 6 audit script exists', existsSync(resolve(root, 'scripts/phase6-audit.mjs'))],
  ['Firebase rules are present', existsSync(resolve(root, 'firestore.rules'))],
  ['Teacher workspace is present', existsSync(resolve(root, 'src/pages/admin/TeacherWorkspacePage.tsx'))],
  ['Reviewer queue is present', existsSync(resolve(root, 'src/pages/admin/ReportReviewPage.tsx'))],
  ['Review service is present', existsSync(resolve(root, 'src/services/reportReviewService.ts'))],
  ['TypeScript config is present', existsSync(resolve(root, 'tsconfig.json'))],
  ['Vite config is present', existsSync(resolve(root, 'vite.config.ts'))],
  ['Build and lint scripts are defined', (() => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
    return Boolean(pkg.scripts?.build && pkg.scripts?.lint && pkg.scripts?.['audit:phase6']);
  })()],
  ['Dependencies are installed', existsSync(resolve(root, 'node_modules/.bin/vite')) && existsSync(resolve(root, 'node_modules/.bin/tsc'))],
];

let failed = 0;
for (const [label, pass] of checks) {
  console.log(`${pass ? 'PASS' : 'BLOCKED'}  ${label}`);
  if (!pass) failed++;
}
if (existsSync(resolve(root, 'node_modules/.bin/vite')) && existsSync(resolve(root, 'node_modules/.bin/tsc'))) {
  const build = spawnSync(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js'), 'build'], { cwd: root, stdio: 'inherit' });
  const lint = spawnSync(process.execPath, [resolve(root, 'node_modules/typescript/bin/tsc'), '--noEmit'], { cwd: root, stdio: 'inherit' });
  console.log(`BUILD ${build.status === 0 ? 'PASS' : 'FAIL'}`);
  console.log(`LINT  ${lint.status === 0 ? 'PASS' : 'FAIL'}`);
  if (build.status !== 0 || lint.status !== 0) failed++;
} else {
  console.log('\nBUILD/LINT NOT RUN: project dependencies are not installed.');
}
console.log(`\nPhase 7 readiness: ${checks.length - failed}/${checks.length} checks passed or unblocked.`);
if (failed) process.exitCode = 1;

#!/usr/bin/env node
/**
 * Phase 11: local, read-only Firebase access readiness audit.
 * Does not contact Firebase, use credentials, or read/write remote data.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const configPath = path.join(root, 'firebase-applet-config.json');
const rulesPath = path.join(root, 'firestore.rules');
const schemaPath = path.join(root, 'src/services/registryDataSchema.ts');
const authPath = path.join(root, 'src/services/firebaseAuth.ts');

const findings = [];
const check = (status, area, detail) => findings.push({ status, area, detail });

let config = null;
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if (typeof config.projectId === 'string' && config.projectId.trim()) {
    check('INFO', 'Firebase client config', `Configured projectId: ${config.projectId}`);
    if (/^darebpp$/i.test(config.projectId)) {
      check('PASS', 'Requested project identity', 'Client config projectId matches DAREbpp (case-insensitive). Confirm this is the intended Firebase project in Console/MCP.');
    } else {
      check('BLOCKER', 'Requested project identity', `Requested project label is DAREbpp, but client config points to "${config.projectId}". Do not query or write until the target project is confirmed.`);
    }
  } else {
    check('BLOCKER', 'Firebase client config', 'projectId is missing or empty.');
  }
} catch {
  check('BLOCKER', 'Firebase client config', 'Cannot read or parse firebase-applet-config.json.');
}

let rules = '';
try {
  rules = fs.readFileSync(rulesPath, 'utf8');
  const collections = ['organizations', 'personnel', 'schools', 'assignments', 'activities', 'news'];
  const explicitlyMatched = collections.filter(name => new RegExp(`match\\s+/${name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\s*\\\\?\\{`).test(rules));
  if (explicitlyMatched.length === 0) {
    check('PASS', 'Registry Firestore Rules', 'No explicit allow rule for registry collections found in local firestore.rules; the catch-all deny rule is present.');
  } else {
    check('REVIEW', 'Registry Firestore Rules', `Explicit registry matches found: ${explicitlyMatched.join(', ')}. Review their allow conditions manually.`);
  }
  if (/match\s+\/\{document=\*\*\}\s*\{\s*allow\s+read,\s*write:\s*if\s+false\s*;?\s*\}/s.test(rules)) {
    check('PASS', 'Default deny', 'Local rules include a catch-all deny for unspecified documents.');
  } else {
    check('REVIEW', 'Default deny', 'Could not confirm the expected catch-all deny pattern. Review firestore.rules manually.');
  }
  if (/match\s+\/teachingRecords\/\{recordId\}/.test(rules)) {
    check('INFO', 'teachingRecords', 'A specific teachingRecords rule exists; its effective access still depends on deployed rules and authenticated claims.');
  } else {
    check('REVIEW', 'teachingRecords', 'No teachingRecords rule found in local rules.');
  }
} catch {
  check('BLOCKER', 'Firestore Rules', 'Cannot read firestore.rules.');
}

for (const [file, label] of [[schemaPath, 'Registry schema'], [authPath, 'Firebase client initialization']]) {
  check(fs.existsSync(file) ? 'PASS' : 'BLOCKER', label, fs.existsSync(file) ? `Found ${path.relative(root, file)}.` : `Missing ${path.relative(root, file)}.`);
}

check('NOT TESTED', 'Live MCP / IAM access', 'This local audit does not connect to Firebase or MCP and cannot prove project access, IAM permissions, deployed Rules, or collection contents.');
check('NOT TESTED', 'Remote reads/writes', 'No remote read or write was attempted. This script is safe to run offline.');

console.log('\nD.A.R.E. Phase 11 — Firebase Access Readiness Audit (LOCAL / READ-ONLY)\n');
for (const item of findings) console.log(`[${item.status}] ${item.area}: ${item.detail}`);
console.log('\nNext: verify the exact Firebase project in Firebase Console/MCP, then perform a read-only metadata/document test using an explicitly authorized connector. Do not change Rules/IAM or import data during this audit.\n');
if (findings.some(item => item.status === 'BLOCKER')) process.exitCode = 2;

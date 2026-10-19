import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const rules = read('firestore.rules');
const records = read('src/services/teachingRecordsService.ts');
const review = read('src/services/reportReviewService.ts');
const reviewPage = read('src/pages/admin/ReportReviewPage.tsx');
const teacherPage = read('src/pages/admin/TeacherWorkspacePage.tsx');
const auth = read('src/services/firebaseAuth.ts');

const checks = [
  ['Firebase Firestore is initialized', /getFirestore\(app\)/.test(auth)],
  ['Teacher records are scoped by owner UID', /where\('ownerUid',\s*'==',\s*uid\)/.test(records)],
  ['Reviewer queue filters submitted pending reports', /where\('status',\s*'==',\s*'submitted'\)/.test(review) && /where\('reviewStatus',\s*'==',\s*'pending'\)/.test(review)],
  ['Review decisions record reviewer UID and timestamp', /reviewedBy:\s*user\.uid/.test(review) && /reviewedAt:\s*serverTimestamp\(\)/.test(review)],
  ['Revision request requires a comment', /revision_requested.*comment\.trim\(\)/s.test(reviewPage)],
  ['Rules define verified reviewer custom claims', /request\.auth\.token\.role in \['unit_admin',\s*'central_admin'\]/.test(rules)],
  ['Reviewer update is restricted to review fields', /hasOnly\(\['reviewStatus','reviewComment','reviewedBy','reviewedAt','updatedAt'\]\)/.test(rules)],
  ['Teacher resubmission resets review status to pending', /reviewStatus:\s*'pending'/.test(records) && /updateTeachingRecordForResubmission/.test(teacherPage)],
  ['Submitted reports cannot be deleted by the UI', /disabled=\{r\.status==='submitted'\}/.test(teacherPage)],
  ['Teacher UI shows review outcome and feedback', /ข้อเสนอแนะจากผู้ตรวจ/.test(teacherPage) && /อนุมัติแล้ว/.test(teacherPage) && /รอตรวจสอบ/.test(teacherPage)],
  ['Local records clear when no user is signed in', /setRecords\(raw \? JSON\.parse\(raw\) : \[\]\)/.test(teacherPage)],
  ['Project entry files exist', existsSync(resolve(root, 'index.html')) && existsSync(resolve(root, 'src/App.tsx'))],
];

let failed = 0;
for (const [name, pass] of checks) {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}`);
  if (!pass) failed++;
}
console.log(`\nPhase 6 static audit: ${checks.length - failed}/${checks.length} checks passed.`);
if (failed) process.exitCode = 1;

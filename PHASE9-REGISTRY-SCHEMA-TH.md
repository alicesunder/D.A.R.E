# D.A.R.E. Phase 9 — Registry Schema & Validation

## ใช้ฐานเวอร์ชัน
Phase 9 ต่อจาก `D.A.R.E. Phase 8 — Dashboard Data Audit` ซึ่งต่อจาก Phase 7 Media Fix โดยตรง ไม่ใช้ฐานเก่ากว่า

## สิ่งที่ทำจริง
- เพิ่ม `src/services/registryDataSchema.ts`
- กำหนดชื่อคอลเลกชันทะเบียนกลางอย่างเป็นทางการ: `organizations`, `personnel`, `schools`, `assignments`, `activities`, `news`
- เพิ่ม runtime validators สำหรับโครงสร้าง Organization, Personnel, School, Assignment, Activity และ MediaNews
- เพิ่มคู่มือการทดสอบ schema และข้อกำหนดก่อนเชื่อม Firestore

## เหตุผลที่ยังไม่เปิดอ่าน/เขียน Firestore
Firestore Rules ปัจจุบันปฏิเสธคอลเลกชันทะเบียนเหล่านี้ทั้งหมด และอนุญาตเฉพาะ workflow `teachingRecords` ที่กำหนดไว้ การเพิ่ม query ใน frontend โดยไม่เปลี่ยน rules จะไม่ทำงาน; การเปิด rules แบบกว้างจะเสี่ยงให้ผู้ใช้เข้าถึงหรือแก้ข้อมูลทะเบียนที่ไม่ควรมีสิทธิ์

## ขั้นตอนต่อไปก่อนเชื่อมข้อมูลจริง
1. กำหนดบทบาทและขอบเขตข้อมูล: central_admin, unit_admin, dare_instructor, report_viewer
2. ตัดสินใจว่าครูเห็น/แก้ได้เฉพาะข้อมูลของโรงเรียนหรือหน่วยงานใด
3. สร้าง rules แบบ least-privilege พร้อม test cases ด้วย Firebase Emulator
4. ทำเครื่องมือ import ที่มี preview, validation errors, duplicate ID check และ dry-run
5. ทดสอบ Firebase Emulator ก่อนเผยแพร่ rules ไปยังโปรเจกต์จริง

## ข้อจำกัดที่แจ้งตรงไปตรงมา
- ยังไม่ได้เชื่อม collections เหล่านี้กับ Firebase
- ยังไม่ได้ migrate mock data ไป Firestore
- ยังไม่ได้รัน TypeScript/build ใน environment นี้
- validators เป็นการตรวจรูปแบบเบื้องต้น ไม่แทน Firestore Security Rules

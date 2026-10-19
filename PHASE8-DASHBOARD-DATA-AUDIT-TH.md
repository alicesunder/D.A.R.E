# D.A.R.E. Phase 8 — Dashboard Data Audit

## ฐานเวอร์ชัน
Phase 8 ใช้ `D.A.R.E. Phase 7 — Media Fix` เป็นฐานเดียวต่อเนื่อง รักษาไฟล์แก้ภาพสื่อทั้ง 3 ใบและโครงสร้าง Dashboard เดิมไว้

## สิ่งที่แก้จริง
- เพิ่มป้ายแจ้งแหล่งข้อมูลใต้การ์ดสถิติ เพื่อบอกผู้ใช้ตรง ๆ ว่าตัวเลขปัจจุบันมาจาก `AppContext` และ `LocalStorage` ในเบราว์เซอร์
- ไม่เปลี่ยนหน้าตา/จำนวนการ์ดสถิติเดิม และไม่สร้างตัวเลขใหม่ขึ้นมา
- เพิ่มเอกสารตรวจสอบแหล่งข้อมูลก่อนเชื่อม Firebase

## ผลการตรวจจากซอร์ส
- `DareNewDashboard.tsx` อ่าน `schools`, `personnel`, `activities`, `news` จาก `useApp()`
- `AppContext.tsx` โหลดค่าเริ่มต้นจาก `INITIAL_*` ใน `src/data/mockData.ts` และบันทึกการเปลี่ยนแปลงใน `LocalStorage`
- `firebase-applet-config.json` มี Firebase project configuration แต่ไม่ได้ทำให้ข้อมูลทะเบียนหลักเชื่อม Firestore โดยอัตโนมัติ
- `firestore.rules` อนุญาตเฉพาะ `teachingRecords` และปฏิเสธ collection อื่นทั้งหมด ดังนั้นไม่ควรเพิ่มการอ่าน collections โรงเรียน/ครู/กิจกรรม/ข่าวจากไคลเอนต์จนกว่าจะออกแบบ schema และกฎสิทธิ์ที่ปลอดภัย

## สิ่งที่ยังไม่เสร็จ
การเชื่อมข้อมูลกลางจริงยังไม่เสร็จ เพราะต้องตกลง/ตรวจ schema สำหรับ `schools`, `personnel`, `activities`, `news`, การย้ายข้อมูลเริ่มต้น และบทบาทผู้ใช้ แล้วจึงแก้ Firestore Rules อย่างจำกัดและทดสอบด้วยบัญชีจริง การเพิ่ม query ตอนนี้จะถูกปฏิเสธตามกฎปัจจุบันหรือเสี่ยงเปิดข้อมูลโดยไม่เหมาะสม

## ตรวจสอบหลังแก้
- คงการ์ด 4 ใบและค่าที่คำนวณจาก state เดิม
- เพิ่มข้อความแจ้งแหล่งข้อมูลอย่างชัดเจน
- ต้องรัน `npm run build` และ `npx tsc --noEmit` ในเครื่องที่ติดตั้ง dependencies เพื่อยืนยันคอมไพล์; ยังไม่ได้ทดสอบ Firebase จริงในขั้นตอนนี้

## ขั้นตอนต่อไปที่แนะนำ
1. กำหนด schema และกฎสิทธิ์ของ collections ทะเบียนหลัก
2. สร้าง migration/import ที่ตรวจสอบได้จากข้อมูลปัจจุบัน
3. เชื่อม Firestore แบบอ่านสด พร้อม loading/error/fallback states
4. ทดสอบบัญชี central admin, unit admin, ครู และผู้ดูรายงาน ก่อน deploy rules

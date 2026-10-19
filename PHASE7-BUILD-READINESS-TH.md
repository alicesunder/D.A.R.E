# D.A.R.E. Phase 7 — Build Readiness & Verification

## ฐานโค้ด
Phase 7 ต่อจากโปรเจกต์ Phase 6 ล่าสุดโดยตรง ไม่ได้ย้อนกลับไปใช้ Phase เก่า

## สิ่งที่เพิ่ม
- เพิ่ม `npm run verify:phase7` เพื่อตรวจไฟล์สำคัญของระบบครู ระบบตรวจรายงาน กฎ Firebase และเครื่องมือ build
- สคริปต์จะตรวจว่ามี dependencies พร้อมหรือไม่ และจะรัน build/lint เฉพาะเมื่อ dependencies ติดตั้งครบแล้ว
- คงสคริปต์ `npm run audit:phase6` ไว้สำหรับตรวจ static audit เดิม

## ผลตรวจในสภาพแวดล้อมนี้
- Phase 6 static audit: ผ่าน 12/12
- `npm run lint`: ยังรันไม่ได้เพราะไม่มี dependency `vite/client`
- `npm install --no-audit --no-fund`: หมดเวลาระหว่างติดตั้ง จึงไม่สามารถยืนยัน build ได้
- Firebase live / Emulator: ยังไม่ได้ทดสอบ
- Firestore Rules: ไม่ได้เผยแพร่ไปยังโปรเจกต์ Firebase

## วิธีทดสอบบนเครื่องของผู้พัฒนา
1. เปิด Terminal ที่โฟลเดอร์โปรเจกต์
2. รัน `npm install`
3. รัน `npm run verify:phase7`
4. ถ้าสคริปต์รายงาน build/lint fail ให้แก้ error ที่แสดงก่อนนำไป deploy
5. ทดสอบบัญชีครูและผู้ตรวจคนละบัญชี รวมถึงการส่งรายงาน อนุมัติ ส่งกลับแก้ไข และการป้องกันการอ่านข้อมูลข้ามบัญชี

## ข้อควรทราบ
การผ่าน static audit ไม่เท่ากับการยืนยันว่าระบบใช้งานจริงปลอดภัยหรือทำงานครบถ้วน ต้องทดสอบ Build, Firebase Rules และ role claims ในสภาพแวดล้อมจริงก่อน

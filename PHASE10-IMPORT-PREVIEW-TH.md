# D.A.R.E. Phase 10 — Import Preview / Dry Run

## ฐานเวอร์ชัน
ต่อจาก `D.A.R.E. Phase 9 — Registry Schema & Validation` ซึ่งต่อเนื่องจาก Phase 8 และ Phase 7 Media Fix ล่าสุด

## สิ่งที่เพิ่ม
- เพิ่มเมนูผู้ดูแล `นำเข้าข้อมูลทะเบียน`
- เพิ่มหน้า `src/pages/admin/RegistryImportPage.tsx`
- รองรับไฟล์ JSON (array หรือ `{ "records": [...] }`) และ CSV
- เลือกประเภท: หน่วยงาน, บุคลากร/ครู, โรงเรียน, การมอบหมาย, กิจกรรม, ข่าวและสื่อ
- ตรวจโครงสร้างด้วย validators ของ Phase 9
- แจ้ง ID ที่ขาดหรือซ้ำภายในไฟล์ พร้อม Preview JSON รายแถว
- มีปุ่มยืนยันผล Preview ที่ระบุชัดว่าไม่บันทึกข้อมูล

## ข้อจำกัด/ความปลอดภัย
- นี่คือ Dry Run เท่านั้น ไม่เขียนข้อมูลลง Firebase หรือ LocalStorage
- ยังไม่ได้ตรวจ ID ซ้ำกับฐานข้อมูลกลาง เพราะ Firestore Rules ปัจจุบันปฏิเสธ registry collections
- CSV เหมาะกับข้อมูลแบบแบน; ฟิลด์ array/object ควรใช้ JSON
- ก่อนทำ Import จริง ต้องออกแบบ rules ตาม role, ทำ migration ที่มี dry-run/rollback และทดสอบ Firebase Emulator

## วิธีทดสอบ
1. รัน `npm install` แล้ว `npm run dev`
2. เปิด `#/admin/registry-import`
3. เลือกคอลเลกชัน `โรงเรียน`
4. ทดสอบไฟล์ JSON ที่มี `id`, `code`, `name`, `type`, `province`, `district`, `subdistrict`, `organizationId`, `assignedPersonnelIds`, `assignmentStatus`, `totalStudents`, `totalActivities`
5. ลองเพิ่มรายการที่ ID ซ้ำ และลบ field บังคับเพื่อดู error
6. ยืนยันผล Preview แล้วตรวจว่าหน้าแจ้งว่าไม่ได้เขียนข้อมูลลงฐานข้อมูล
7. ทดสอบไฟล์ CSV ที่มีหัวคอลัมน์และค่าพื้นฐาน โดยควรใช้ JSON สำหรับ arrays

## การยืนยันคุณภาพ
- ZIP integrity ตรวจสอบหลังแพ็ก
- ยังไม่ได้รัน Vite Build/TypeScript หรือ browser test ในสภาพแวดล้อมการสร้างไฟล์นี้

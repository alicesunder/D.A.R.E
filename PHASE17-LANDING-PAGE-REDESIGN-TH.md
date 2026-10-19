# Phase 17 — Landing Page Redesign (Image Hero)

## ฐานเวอร์ชัน
ต่อยอดจาก `D.A.R.E-phase16-navigation-cleanup.zip` ซึ่งเป็นเวอร์ชันล่าสุดที่มีให้ใช้งานในงานนี้ โดยเก็บระบบหน้า Admin และหน้าสาธารณะอื่น ๆ ไว้

## การเปลี่ยนแปลง
- เปลี่ยนหน้า Landing Page (`HomePage`) เป็น Hero แบบเต็มจอใหม่
- ใช้ภาพโรงเรียนที่ผู้ใช้แนบเป็นภาพพื้นหลังจาก `public/images/dare-landing-school.png` แทนวิดีโอ
- เพิ่ม Hero Badge, headline, คำอธิบาย และปุ่มนำทางภาษาไทย
- เพิ่ม Navbar สำหรับหน้า Hero และเชื่อมปุ่มไปยังคลังความรู้ กิจกรรม โรงเรียน และ Admin
- เพิ่มการ์ดมุมซ้ายล่างและมุมขวาล่าง พร้อม SVG masks ตามแนวคิด cutout
- ใช้ `lucide-react` และ `motion/react` ซึ่งมีอยู่ใน dependencies ของโปรเจกต์
- ซ่อน Navbar/Footer เดิมเฉพาะหน้าแรก เพื่อไม่ให้มี navigation ซ้อนกัน หน้าอื่นและ Admin คงการทำงานเดิม
- เพิ่ม CSS ที่ scope ด้วย `.dare-hero-*` เพื่อหลีกเลี่ยงการเปลี่ยนธีม global ของหน้า Admin
- มี responsive styles และรองรับ `prefers-reduced-motion`

## หมายเหตุการตรวจสอบ
- ไม่ได้ใช้ video URL เนื่องจากผู้ใช้ระบุชัดว่าต้องการเปลี่ยนจากวิดีโอเป็นภาพที่แนบมา
- คงเนื้อหาและแบรนด์ D.A.R.E. Thailand ให้ตรงกับโปรเจกต์เดิม แทนข้อความ RIVR/DeFi ในตัวอย่างต้นแบบ
- ยังไม่สามารถยืนยันผล Build ได้: `npm install --ignore-scripts --no-audit --no-fund` หมดเวลาในสภาพแวดล้อมนี้
- ไม่มีการแก้ไข Firebase, Firestore Rules, IAM หรือ deploy

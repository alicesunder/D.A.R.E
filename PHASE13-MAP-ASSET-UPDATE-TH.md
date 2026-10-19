# Phase 13 — เปลี่ยนแผนที่ Dashboard

- ใช้ `public/images/thailand-six-regions-map.png` จากภาพอ้างอิงที่ผู้ใช้ส่งมา
- เปลี่ยนแผนที่ SVG เดิมใน `src/pages/admin/DareNewDashboard.tsx` เป็นภาพจริง
- ใช้ `object-contain` และขนาด responsive เพื่อรักษาสัดส่วนภาพและลดการครอป
- คงการ์ดข้อมูลภูมิภาคเดิมไว้ โดยไม่ได้เปลี่ยนตัวเลขตัวอย่างหรือเชื่อมข้อมูล Firebase
- ฐานโครงการ: `D.A.R.E-phase12-dashboard-map-icons.zip` เท่านั้น

## ตรวจสอบ
ZIP ถูกสร้างจาก Phase 12 และมีไฟล์ภาพกับ component ที่อัปเดตแล้ว ยังไม่ได้รัน build หรือทดสอบในเบราว์เซอร์

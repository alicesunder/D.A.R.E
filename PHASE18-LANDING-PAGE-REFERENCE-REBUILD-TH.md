# Phase 18 — Landing Page Visual Rebuild (TH)

ยึด D.A.R.E. Phase 17 เป็นฐานล่าสุดเพียงชุดเดียว และปรับหน้า Landing Page ให้ใกล้เคียงภาพอ้างอิงที่ผู้ใช้ส่งมา

## สิ่งที่เปลี่ยน
- เปลี่ยนโครงสร้างหน้าแรกเป็น Hero ภาพโรงเรียนเต็มพื้นที่ พร้อมชั้นสีเข้มด้านซ้ายเพื่อให้ข้อความภาษาไทยอ่านได้
- ใช้ภาพมาสคอตช้างตำรวจและเด็กนักเรียนเป็น foreground
- ใช้โลโก้คู่ ตชด. และ D.A.R.E. ในแถบนำทางสีขาวแบบลอย
- เพิ่มหัวข้อสีขาว/แดง ปุ่ม CTA สีแดง และปุ่มชมสื่อ
- เพิ่มแถวการ์ดสถิติ 4 รายการ และการ์ดเรียนรู้ D.A.R.E. 3 หัวข้อ
- ปรับเมนูให้เป็น mobile navigation บนจอเล็ก
- ใช้ Motion สำหรับ entrance/hover animation และ lucide-react สำหรับไอคอน
- ไม่เปลี่ยน App routing, Firebase, Security Rules หรือข้อมูลฐานข้อมูล

## ไฟล์ภาพที่เพิ่ม
- `public/images/dare-school-hero-reference.png`
- `public/images/bpp-dare-logo-pair.png`
- `public/images/dare-purple-police-elephant.png`

## หมายเหตุ
ค่าตัวเลข 368 / 250 / 490 / 3 เป็นตัวเลขตัวอย่างตามภาพอ้างอิง และยังไม่ได้เชื่อมกับข้อมูล Firebase จริงใน Phase นี้
ควรตรวจสอบตัวเลขและทดสอบ `npm run build` ในสภาพแวดล้อมที่ติดตั้ง dependencies ครบก่อนเผยแพร่จริง.

# Phase 4 — คิวตรวจรายงานการสอน

## เพิ่มอะไรในเวอร์ชันนี้
- เพิ่มเมนู `ตรวจรายงานการสอน` ใน Sidebar ของ Admin และเปิดเป็นโมดูลภายใน Dashboard เดิม
- แสดงคิวรายงานที่ส่งแล้วและมี `reviewStatus: pending`
- ค้นหารายงานตามโรงเรียน บทเรียน หรืออีเมลผู้ส่ง
- ผู้ตรวจสามารถอนุมัติ (`approved`) หรือส่งกลับแก้ไข (`revision_requested`) พร้อมข้อเสนอแนะ
- เพิ่ม `reviewedBy`, `reviewedAt`, `reviewComment` และ `reviewStatus` ในเอกสารรายงาน
- รายงานที่ส่งใหม่จากพื้นที่ทำงานครูจะถูกตั้งสถานะรอตรวจ (`pending`)

## ความปลอดภัยที่ต้องตั้งค่าก่อนเปิดใช้
Firestore Rules ใช้ Firebase custom claim `role` โดยผู้ตรวจต้องมี `role: "unit_admin"` หรือ `role: "central_admin"` ใน ID token ที่ออกโดยระบบที่เชื่อถือได้เท่านั้น ห้ามให้ผู้ใช้ตั้ง custom claim เองจากหน้าเว็บ

ตัวอย่างการกำหนด claim ต้องทำจาก trusted server/Admin SDK หลังตรวจสอบตัวตนและการอนุมัติของหน่วยงานแล้ว เช่น:

```js
await getAuth().setCustomUserClaims(uid, { role: 'unit_admin' });
```

หลังเปลี่ยน custom claim ให้ผู้ใช้ sign out/sign in ใหม่หรือ refresh ID token ก่อนทดสอบ

## ขั้นตอนเปิดใช้
1. เปิด Firebase Console ของโปรเจกต์ที่ถูกต้อง
2. ตรวจสอบ Authentication และยืนยันบัญชีผู้ตรวจ
3. กำหนด custom claim จาก Admin SDK บน trusted environment เท่านั้น
4. Deploy `firestore.rules` จากไฟล์นี้ไปยัง Firebase project ที่ถูกต้อง
5. ส่งรายงานทดสอบจากบัญชีครู แล้วเปิดเมนูตรวจรายงานด้วยบัญชีผู้ตรวจ
6. ทดสอบว่าครูทั่วไปอ่านคิวรวม/ตัดสินผลไม่ได้ และผู้ตรวจที่ไม่มี claim ถูกปฏิเสธ

## หมายเหตุ
- โค้ดนี้ไม่ได้กำหนด custom claims, deploy rules หรือเชื่อมบัญชีจริงให้โดยอัตโนมัติ
- รายงานเดิมที่ไม่มี `reviewStatus: pending` จะไม่ปรากฏในคิวนี้ ต้องตรวจและ migrate อย่างปลอดภัยโดยผู้ดูแลก่อน
- Firestore อาจขอ composite index สำหรับ `status` + `reviewStatus`; ให้สร้างจากลิงก์ error ของ Firebase Console หรือกำหนด index ในไฟล์ `firestore.indexes.json`
- ควรทดสอบใน Firebase Emulator หรือ staging ก่อนใช้ข้อมูลจริง

# D.A.R.E. Phase 11 — Firebase Access Audit (Read-only)

## ฐานเวอร์ชัน
ต่อจาก `D.A.R.E-phase10-import-preview.zip` ที่ผู้ใช้แนบมาในรอบนี้เท่านั้น คงงาน Phase 7–10 ไว้ และไม่ย้อนกลับไปใช้ฐานเก่า

## สิ่งที่เพิ่ม
- `scripts/phase11-firebase-access-audit.mjs` — ตรวจความพร้อมจากไฟล์ในเครื่องเท่านั้น
- คำสั่ง `npm run audit:phase11`
- รายงานนี้สำหรับแยกสิ่งที่ยืนยันจากโค้ดออกจากสิ่งที่ต้องตรวจผ่าน Firebase MCP/Console จริง

## ข้อค้นพบจากไฟล์ใน ZIP
- Firebase client config ใน `firebase-applet-config.json` ระบุ `projectId` เป็น `gen-lang-client-0671437450` ไม่ใช่ชื่อ `DAREbpp` ตามที่ผู้ใช้ระบุ จึงต้องยืนยันว่าเป็นโปรเจกต์เป้าหมายเดียวกันก่อนดำเนินการใด ๆ ห้ามเปลี่ยน projectId โดยคาดเดา
- `firestore.rules` ใน ZIP ระบุ workflow เฉพาะ `teachingRecords` และมี catch-all deny สำหรับเอกสารที่ไม่ได้กำหนดกฎไว้
- คอลเลกชันทะเบียน `organizations`, `personnel`, `schools`, `assignments`, `activities`, `news` ยังไม่มี allow rule เฉพาะในไฟล์ rules ที่ตรวจ
- การอ่านไฟล์ local ไม่ได้พิสูจน์ว่า rules เหล่านี้ถูก deploy อยู่บน Firebase จริง
- ไม่มีการเรียก MCP, ไม่มีการอ่านข้อมูล remote และไม่มีการเขียนข้อมูล

## วิธีรัน local audit
```bash
npm run audit:phase11
```
ผลลัพธ์ระบุ projectId ที่ตั้งค่าไว้, สถานะ rules ในไฟล์ local และรายการที่ยังไม่ได้ทดสอบกับระบบจริง สคริปต์จะจบด้วย exit code `2` หากพบ blocker เช่น projectId ไม่ตรงกับชื่อเป้าหมาย

## ขั้นตอนที่ต้องทำผ่าน Firebase MCP/Console
1. เปิดรายการ Firebase MCP tools และตรวจว่าเครื่องมือใดรองรับการดู project metadata และ Firestore read-only
2. ยืนยัน project ID จริงของ `DAREbpp` โดยเทียบกับ `projectId` ใน client config
3. ใช้ read-only call เพื่ออ่าน metadata หรือเอกสารทดสอบที่ได้รับอนุญาตเท่านั้น ห้าม list/export ข้อมูลส่วนบุคคลจริงเกินจำเป็น
4. ตรวจ IAM/connector permission แยกจาก Firestore Security Rules: MCP/IAM อาจอนุญาตให้เครื่องมือเรียก API แต่ client SDK ยังถูก Rules ปฏิเสธได้ และในทางกลับกัน
5. ทดสอบคอลเลกชัน `teachingRecords`, `organizations`, `personnel`, `schools`, `assignments`, `activities`, `news` ทีละรายการโดยใช้ข้อมูลทดสอบที่ไม่มีข้อมูลส่วนบุคคล และบันทึกผล allow/deny กับ error code
6. ก่อนทำ integration ให้ผู้ใช้ยืนยัน project ID และขอบเขตสิทธิ์ จากนั้นออกแบบ least-privilege Rules และทดสอบ Firebase Emulator แยกต่างหาก

## สถานะ
- [x] ตรวจไฟล์ project config และ local Firestore Rules
- [x] เพิ่ม local read-only audit script
- [ ] ยืนยัน Firebase project identity ผ่าน MCP/Console
- [ ] ทดสอบ remote read-only access ผ่าน MCP
- [ ] ตรวจ effective IAM permissions และ deployed Firestore Rules
- [ ] ยังไม่ทำ integration / import / writes / deployment

**ข้อจำกัดสำคัญ:** ในสภาพแวดล้อมที่จัดทำไฟล์นี้ ไม่มีเครื่องมือ Firebase MCP ที่เรียกใช้งานได้โดยตรง จึงไม่กล่าวอ้างว่าเชื่อมต่อ `DAREbpp` หรือทดสอบสิทธิ์ remote สำเร็จ

## เพิ่มเติม: Firebase MCP server แบบ Read-only

เพิ่มต้นแบบ MCP server ที่ `tools/firebase-readonly-mcp/` สำหรับติดตั้งในเครื่องที่ผู้ใช้ควบคุม มีเครื่องมือ `firebase_project_identity`, `firestore_list_collection_ids`, `firestore_collection_document_count` และ `firestore_check_collection_access` เท่านั้น

ดูวิธีติดตั้งและข้อจำกัดใน `tools/firebase-readonly-mcp/README-TH.md` โดยเฉพาะข้อสำคัญที่ Admin SDK ข้าม Firestore Security Rules และอาศัย IAM ของ Google identity แทน การสร้างไฟล์ยังไม่ถือว่าเชื่อมต่อหรือทดสอบกับโปรเจกต์ `darebpp` สำเร็จ

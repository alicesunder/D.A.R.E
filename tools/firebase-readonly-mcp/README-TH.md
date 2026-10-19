# Firebase MCP แบบ Read-only สำหรับ D.A.R.E.

MCP server นี้เพิ่มเครื่องมืออ่านอย่างเดียวสำหรับตรวจสอบโปรเจกต์ `darebpp` และ metadata ของ Firestore ไม่มีเครื่องมือเขียน/แก้ไข/ลบข้อมูล และไม่มีเครื่องมือแก้ IAM, Security Rules หรือ Deploy

## เครื่องมือที่มี

- `firebase_project_identity` — ตรวจ Project ID, project number, display name และสถานะผ่าน Cloud Resource Manager API
- `firestore_list_collection_ids` — แสดงเฉพาะชื่อ top-level collections ไม่อ่านเนื้อหาเอกสาร
- `firestore_collection_document_count` — นับจำนวนเอกสารใน collection ที่ระบุ โดยไม่คืนค่าฟิลด์
- `firestore_check_collection_access` — ทดสอบ aggregate count แบบ read-only และคืนผล allow/deny

## ข้อควรเข้าใจก่อนใช้งาน

**สำคัญ:** เซิร์ฟเวอร์นี้ใช้ Firebase Admin SDK / Application Default Credentials (ADC) ดังนั้นการเรียก Firestore จะ **ข้าม Firestore Security Rules** และถูกควบคุมโดย IAM ของ Google identity ที่ล็อกอินไว้ เครื่องมือนี้จึงใช้ตรวจสิทธิ์ IAM/การเข้าถึง API ไม่ใช่ทดสอบว่าผู้ใช้หน้าเว็บผ่าน Firestore Rules ได้หรือไม่

อย่าใช้บัญชีเจ้าของโปรเจกต์โดยไม่จำเป็น แนะนำบัญชี/Service Account แยกที่มีสิทธิ์อ่านเท่านั้น เช่น role ที่เหมาะสมสำหรับดู metadata และอ่าน Firestore โดยตรวจสอบ least privilege กับผู้ดูแลระบบก่อนให้สิทธิ์ ห้ามใส่ service-account JSON key ลงใน repo หรือส่งผ่านแชต

## เตรียมใช้งานในเครื่องที่คุณควบคุม

1. ติดตั้ง Node.js รุ่น LTS ที่รองรับ dependencies
2. เปิด Terminal ในโฟลเดอร์นี้ แล้วรัน `npm install`
3. ล็อกอินด้วย Google identity ที่ได้รับอนุญาตผ่าน Application Default Credentials:
   `gcloud auth application-default login`
4. กำหนด Project ID ใน environment:
   - PowerShell: `$env:FIREBASE_PROJECT_ID="darebpp"`
   - macOS/Linux: `export FIREBASE_PROJECT_ID=darebpp`
5. เริ่ม server: `npm start`

ต้องเปิด API ที่จำเป็นใน Google Cloud และ identity ต้องมี IAM permissions ที่พอสำหรับการอ่านที่ต้องการ หากได้รับ `PERMISSION_DENIED` ให้บันทึก error แล้วให้ผู้ดูแลตรวจ IAM; อย่าแก้ Security Rules เพื่อแก้ปัญหาที่เกิดจาก IAM

## ตั้งค่าใน MCP host

เพิ่ม MCP server แบบ `stdio` ในการตั้งค่าของ host ที่คุณใช้ โดยให้ `command` เป็น `node`, `args` เป็น path เต็มไปยัง `server.mjs`, และ `env` มี `FIREBASE_PROJECT_ID=darebpp` ตัวอย่างรูปแบบทั่วไป:

```json
{
  "mcpServers": {
    "darebpp-firebase-readonly": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/tools/firebase-readonly-mcp/server.mjs"],
      "env": { "FIREBASE_PROJECT_ID": "darebpp" }
    }
  }
}
```

เปลี่ยน path ให้ตรงกับเครื่องและ MCP host ของคุณ รูปแบบตำแหน่งไฟล์ตั้งค่าแตกต่างกันตามแอป จึงไม่ควรวาง JSON นี้ในตำแหน่งสุ่ม

## ขอบเขตและข้อจำกัด

- ยังไม่มีการเชื่อมต่อกับ Firebase ของคุณจากการสร้างไฟล์นี้เพียงอย่างเดียว
- MCP host ต้องติดตั้ง/เปิดใช้ server และมี credentials ในเครื่องที่รัน server
- ไม่ใช้ API key ของ Firebase client config เป็นข้อมูลยืนยันตัวตนฝั่ง Admin
- ไม่มี tool สำหรับ create/update/delete documents, เปลี่ยน rules/IAM หรือ deploy โดยเจตนา
- หากต้องทดสอบ Security Rules จริง ต้องทำแยกผ่าน client SDK/Emulator ด้วยผู้ใช้ทดสอบที่เหมาะสม

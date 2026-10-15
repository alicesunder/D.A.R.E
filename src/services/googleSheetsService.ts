import { getAccessToken } from './firebaseAuth';

export interface ExportResult {
  success: boolean;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  rowCount?: number;
  message: string;
}

/**
 * Creates a new Google Spreadsheet and writes data rows
 */
export async function createAndExportToGoogleSheets(
  title: string,
  headers: string[],
  rows: (string | number)[][]
): Promise<ExportResult> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('ยังไม่ได้เข้าสู่ระบบ Google หรือ Session หมดอายุ กรุณาลงชื่อเข้าใช้ด้วย Google');
  }

  // 1. Create Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: `D.A.R.E. บช.ตชด. - ${title}`,
      },
      sheets: [
        {
          properties: {
            title: 'ข้อมูลระบบ',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `เกิดข้อผิดพลาดในการสร้างสเปรดชีต (HTTP ${createRes.status})`);
  }

  const createData = await createRes.json();
  const spreadsheetId = createData.spreadsheetId;
  const spreadsheetUrl = createData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Append header and rows
  const allRows = [headers, ...rows];
  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'ข้อมูลระบบ'!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: "'ข้อมูลระบบ'!A1",
        majorDimension: 'ROWS',
        values: allRows,
      }),
    }
  );

  if (!appendRes.ok) {
    const appendErr = await appendRes.json().catch(() => ({}));
    throw new Error(appendErr?.error?.message || `เกิดข้อผิดพลาดในการบันทึกข้อมูล (HTTP ${appendRes.status})`);
  }

  return {
    success: true,
    spreadsheetId,
    spreadsheetUrl,
    rowCount: rows.length,
    message: `ส่งออกข้อมูลสำเร็จ ${rows.length} รายการ ไปยัง Google Sheets เรียบร้อยแล้ว`,
  };
}

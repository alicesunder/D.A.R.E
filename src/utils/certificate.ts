/** สร้างเกียรติบัตร "ครูแดร์ดีเด่นประจำเดือน" เป็นไฟล์ PNG (A4 แนวนอน) ด้วย canvas — ไม่ต้องใช้ไลบรารีเพิ่ม
 *  เป็นแบบร่างอัตโนมัติ: ผู้มีอำนาจต้องลงนามเองก่อนนำไปใช้จริง (มีข้อความกำกับท้ายใบ) */
export interface CertificateInput {
  name: string;
  unit: string;
  monthLabel: string;
  xp: number;
  rank: number;
  levelName: string;
  sessions: number;
  students: number;
  isDemo: boolean;
}

const W = 1754, H = 1240;
const FONT = '"Prompt","Sarabun","Noto Sans Thai",sans-serif';

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function center(ctx: CanvasRenderingContext2D, text: string, y: number, font: string, color: string) {
  ctx.font = font; ctx.fillStyle = color; ctx.textAlign = 'center';
  ctx.fillText(text, W / 2, y);
}

export async function downloadCertificate(c: CertificateInput) {
  try { await Promise.all([document.fonts.load(`800 40px "Prompt"`), document.fonts.load(`500 28px "Prompt"`)]); } catch { /* ใช้ฟอนต์สำรอง */ }
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // พื้นหลังกระดาษ
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#FFFDF6'); bg.addColorStop(1, '#F6EEFF');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // ลายวงกลมจาง ๆ
  for (let i = 0; i < 9; i++) {
    ctx.beginPath(); ctx.arc(W * (0.1 + 0.11 * i), H * (i % 2 ? 0.93 : 0.07), 60 + (i % 3) * 25, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 ? 'rgba(168,85,247,.07)' : 'rgba(255,176,32,.09)'; ctx.fill();
  }

  // กรอบสองชั้น
  ctx.lineWidth = 14; ctx.strokeStyle = '#5B21B6'; ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.lineWidth = 4; ctx.strokeStyle = '#D6A92E'; ctx.strokeRect(68, 68, W - 136, H - 136);
  const corner = (x: number, y: number, sx: number, sy: number) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(sx, sy);
    ctx.fillStyle = '#D6A92E'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(120, 0); ctx.lineTo(0, 120); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5B21B6'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(80, 0); ctx.lineTo(0, 80); ctx.closePath(); ctx.fill();
    ctx.restore();
  };
  corner(40, 40, 1, 1); corner(W - 40, 40, -1, 1); corner(40, H - 40, 1, -1); corner(W - 40, H - 40, -1, -1);

  // โลโก้
  const logo = await loadImage('/images/bpp-dare-combined-logo.png');
  if (logo) {
    const h = 150, w = (logo.width / logo.height) * h;
    ctx.drawImage(logo, W / 2 - w / 2, 105, w, h);
  }

  center(ctx, 'เกียรติบัตร', 400, `800 110px ${FONT}`, '#4C1D95');
  center(ctx, 'ครูแดร์ดีเด่นประจำเดือน', 480, `700 52px ${FONT}`, '#B45309');
  center(ctx, `ประจำเดือน${c.monthLabel}`, 548, `500 36px ${FONT}`, '#6B5B8C');

  center(ctx, 'ขอมอบเกียรติบัตรฉบับนี้ให้ไว้เพื่อแสดงว่า', 640, `500 34px ${FONT}`, '#3F3358');
  // ชื่อ (ย่อขนาดอัตโนมัติถ้ายาว)
  let size = 96;
  ctx.font = `800 ${size}px ${FONT}`;
  while (ctx.measureText(c.name).width > W - 360 && size > 44) { size -= 4; ctx.font = `800 ${size}px ${FONT}`; }
  center(ctx, c.name, 760, `800 ${size}px ${FONT}`, '#2B1B5A');
  ctx.strokeStyle = '#D6A92E'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(W / 2 - 420, 790); ctx.lineTo(W / 2 + 420, 790); ctx.stroke();

  center(ctx, c.unit, 850, `600 38px ${FONT}`, '#5B21B6');
  center(ctx, `ได้รับอันดับที่ ${c.rank} ในระบบจัดอันดับครู D.A.R.E. ด้วยคะแนน ${c.xp.toLocaleString('th-TH')} XP`, 930, `500 34px ${FONT}`, '#3F3358');
  center(ctx, `สอนรวม ${c.sessions} ครั้ง · นักเรียนที่ได้เรียนรู้ ${c.students.toLocaleString('th-TH')} คน · ระดับ ${c.levelName}`, 985, `500 30px ${FONT}`, '#6B5B8C');
  center(ctx, 'ขอบคุณที่ร่วมสร้างภูมิคุ้มกันให้เด็กไทย ห่างไกลยาเสพติด', 1060, `600 32px ${FONT}`, '#B45309');

  // ช่องลงนาม (เว้นว่างให้ผู้มีอำนาจลงนาม)
  ctx.strokeStyle = '#9C8FB8'; ctx.lineWidth = 2;
  [W * 0.27, W * 0.73].forEach(x => { ctx.beginPath(); ctx.moveTo(x - 190, 1135); ctx.lineTo(x + 190, 1135); ctx.stroke(); });
  center(ctx, '', 1135, `500 22px ${FONT}`, '#9C8FB8');
  ctx.font = `500 22px ${FONT}`; ctx.fillStyle = '#7C6F96'; ctx.textAlign = 'center';
  ctx.fillText('(ผู้มีอำนาจลงนาม)', W * 0.27, 1170); ctx.fillText('(ผู้มีอำนาจลงนาม)', W * 0.73, 1170);

  ctx.font = `500 18px ${FONT}`; ctx.fillStyle = '#A99BC4'; ctx.textAlign = 'center';
  ctx.fillText(c.isDemo ? 'แบบร่างจากข้อมูลตัวอย่างสาธิต — ไม่ใช่เอกสารทางการ' : 'แบบร่างสร้างอัตโนมัติจากระบบ — ต้องให้ผู้มีอำนาจลงนามก่อนใช้งานจริง', W / 2, H - 92);

  const blob: Blob | null = await new Promise(res => canvas.toBlob(res, 'image/png'));
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `เกียรติบัตร-ครูแดร์ดีเด่น-${c.monthLabel.replace(/\s/g, '-')}.png`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

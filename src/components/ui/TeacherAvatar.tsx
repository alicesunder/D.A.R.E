import React from 'react';
import type { Personnel } from '../../types';
import teacherPhotoMap from '../../data/teacherPhotoMap.json';

export const teacherPhotoOf = (p: Personnel): string | undefined =>
  p.sourceRow != null ? (teacherPhotoMap as Record<string, string>)[String(p.sourceRow)] : undefined;

/** รูปครู (ถ้ามี) หรือตัวอักษรแรกของชื่อ — ใช้ class ที่ครอบเป็นผู้กำหนดขนาด/กรอบ */
export const TeacherFace: React.FC<{ person: Personnel }> = ({ person }) => {
  const photo = teacherPhotoOf(person);
  return photo
    ? <img src={photo} alt={`${person.firstName} ${person.lastName}`} loading="lazy" decoding="async" draggable={false} />
    : <b>{(person.firstName || '?').charAt(0)}</b>;
};

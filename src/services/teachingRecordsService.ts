import {
  addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, updateDoc, where,
  type Unsubscribe,
} from 'firebase/firestore';
import { auth, db } from './firebaseAuth';

export type TeachingRecord = {
  id: string;
  date: string;
  school: string;
  lesson: string;
  students: number;
  note: string;
  status: 'draft' | 'submitted';
  ownerUid?: string;
  updatedAt?: unknown;
  submittedAt?: unknown;
  ownerEmail?: string | null;
  reviewStatus?: 'pending' | 'approved' | 'revision_requested';
  reviewComment?: string;
  reviewedBy?: string;
  reviewedAt?: unknown;
};

const recordsCollection = collection(db, 'teachingRecords');

/** Subscribe only to records owned by the currently authenticated user. */
export function subscribeToTeachingRecords(
  uid: string,
  onRecords: (records: TeachingRecord[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(recordsCollection, where('ownerUid', '==', uid));
  return onSnapshot(q, snapshot => {
    onRecords(snapshot.docs.map(item => ({ id: item.id, ...item.data() } as TeachingRecord))
      .sort((a, b) => b.date.localeCompare(a.date)));
  }, error => onError(error));
}

export async function createTeachingRecord(input: Omit<TeachingRecord, 'id' | 'ownerUid' | 'updatedAt'>) {
  const user = auth.currentUser;
  if (!user) throw new Error('กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูลลงฐานข้อมูลกลาง');
  return addDoc(recordsCollection, { ...input, ownerUid: user.uid, ownerEmail: user.email ?? null, updatedAt: serverTimestamp(), ...(input.status === 'submitted' ? { submittedAt: serverTimestamp(), reviewStatus: 'pending' } : {}) });
}

export async function updateTeachingRecordStatus(id: string, status: 'draft' | 'submitted') {
  const user = auth.currentUser;
  if (!user) throw new Error('กรุณาเข้าสู่ระบบก่อนแก้ไขบันทึก');
  await updateDoc(doc(db, 'teachingRecords', id), { status, updatedAt: serverTimestamp(), ...(status === 'submitted' ? { submittedAt: serverTimestamp(), reviewStatus: 'pending' } : {}) });
}

export async function deleteTeachingRecord(id: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('กรุณาเข้าสู่ระบบก่อนลบบันทึก');
  return deleteDoc(doc(db, 'teachingRecords', id));
}

export async function updateTeachingRecordForResubmission(
  id: string,
  input: Pick<TeachingRecord, 'date' | 'school' | 'lesson' | 'students' | 'note'>,
) {
  const user = auth.currentUser;
  if (!user) throw new Error('กรุณาเข้าสู่ระบบก่อนส่งรายงานแก้ไข');
  await updateDoc(doc(db, 'teachingRecords', id), {
    ...input,
    status: 'submitted',
    reviewStatus: 'pending',
    submittedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

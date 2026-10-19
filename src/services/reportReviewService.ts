import {
  collection, onSnapshot, query, where, doc, updateDoc, serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { auth, db } from './firebaseAuth';
import type { TeachingRecord } from './teachingRecordsService';

export type ReviewStatus = 'pending' | 'approved' | 'revision_requested';
export type ReviewRecord = TeachingRecord & {
  reviewStatus?: ReviewStatus;
  reviewComment?: string;
  reviewedBy?: string;
  reviewedAt?: unknown;
};

/** Reviewer queue is deliberately limited to submitted records. Firestore rules must grant reviewer claims. */
export function subscribeToReviewQueue(
  onRecords: (records: ReviewRecord[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(collection(db, 'teachingRecords'), where('status', '==', 'submitted'), where('reviewStatus', '==', 'pending'));
  return onSnapshot(q, snapshot => {
    onRecords(snapshot.docs
      .map(item => ({ id: item.id, ...item.data() } as ReviewRecord))
      .sort((a, b) => b.date.localeCompare(a.date)));
  }, error => onError(error));
}

export async function reviewTeachingRecord(
  id: string,
  reviewStatus: Exclude<ReviewStatus, 'pending'>,
  reviewComment: string,
) {
  const user = auth.currentUser;
  if (!user) throw new Error('กรุณาเข้าสู่ระบบก่อนตรวจรายงาน');
  await updateDoc(doc(db, 'teachingRecords', id), {
    reviewStatus,
    reviewComment: reviewComment.trim(),
    reviewedBy: user.uid,
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

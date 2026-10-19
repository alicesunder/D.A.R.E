export type UserRole = 'central_admin' | 'unit_admin' | 'dare_instructor' | 'report_viewer';

export interface UserProfile {
  id: string;
  name: string;
  rank: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  email: string;
  avatarUrl?: string;
  personnelId?: string;
}

export interface Organization {
  id: string;
  code: string;
  name: string;
  shortName: string;
  level: 'hq' | 'region' | 'subdivision' | 'company';
  parentId: string | null;
  province: string;
  active: boolean;
  phone?: string;
}

export type PersonnelStatus = 'active' | 'leave' | 'transferred' | 'inactive';

export interface Personnel {
  id: string;
  rank: string;
  firstName: string;
  lastName: string;
  policeId: string;
  organizationId: string;
  organizationName: string;
  province: string;
  phone: string;
  email: string;
  status: PersonnelStatus;
  certifiedYear: number;
  batchNumber: string; // เช่น D.A.R.E. รุ่นที่ 24
  assignedSchoolCount: number;
  assignedSchoolIds: string[];
  totalActivitiesConducted: number;
  updatedAt: string;
  // Supplemental fields imported from the official D.A.R.E. status workbook
  fullName?: string;
  position?: string;
  schools?: string;
  studentCount?: number;
  retirementYear?: number;
  trainingHours?: number;
  badgeLevel?: string;
  sourceRow?: number;
}

export type SchoolType = 'bpp_school' | 'obec_primary' | 'obec_expansion' | 'private' | 'municipal';

export interface School {
  id: string;
  code: string;
  name: string;
  type: SchoolType;
  province: string;
  district: string;
  subdistrict: string;
  organizationId: string;
  organizationName: string;
  assignedPersonnelIds: string[];
  assignmentStatus: 'assigned' | 'unassigned' | 'pending';
  totalStudents: number;
  gradeLevels: string;
  lastActivityDate?: string;
  totalActivities: number;
  contactPerson?: string;
  contactPhone?: string;
  notes?: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  personnelId: string;
  personnelName: string;
  personnelRank: string;
  schoolId: string;
  schoolName: string;
  organizationId: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'ended' | 'transferred';
  academicYear: string;
  note?: string;
  assignedBy: string;
  createdAt: string;
}

export type ActivityStatus = 
  | 'draft'               // ร่าง
  | 'submitted'           // ส่งตรวจสอบ
  | 'pending_approval'    // รออนุมัติ
  | 'approved'            // อนุมัติแล้ว
  | 'in_progress'         // กำลังดำเนินการ
  | 'completed'           // เสร็จสิ้น
  | 'revision_requested'  // ส่งกลับแก้ไข
  | 'cancelled';          // ยกเลิก

export type ActivityCategory = 
  | 'dare_standard'       // หลักสูตร D.A.R.E. 10 สัปดาห์
  | 'special_camp'        // ค่ายเยาวชนต้านยาเสพติด
  | 'drug_free_school'    // โครงการสถานศึกษาสีขาว
  | 'parent_workshop'     // อบรมผู้ปกครองและชุมชน
  | 'refresher_training'; // ทบทวนครูตำรวจตระเวนชายแดน

export interface Activity {
  id: string;
  code: string;
  title: string;
  category: ActivityCategory;
  organizationId: string;
  organizationName: string;
  schoolId: string;
  schoolName: string;
  date: string;
  time: string;
  location: string;
  instructorIds: string[];
  instructorNames: string[];
  studentCount: number;
  lessonNumber?: number; // เช่น บทที่ 1-10
  targetGrade?: string; // เช่น ป.5
  description: string;
  summary: string;
  photoUrls: string[];
  reportSubmittedAt?: string;
  status: ActivityStatus;
  fiscalYear: string;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewComment?: string;
}

export interface MediaNews {
  id: string;
  title: string;
  category: 'news' | 'activity' | 'knowledge' | 'announcement';
  summary: string;
  content: string;
  imageUrl: string;
  publishedAt: string;
  status: 'draft' | 'published' | 'archived';
  author: string;
  views: number;
  isFeatured?: boolean;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: 'refusal_skills' | 'decision_making' | 'life_skills' | 'drug_awareness' | 'parent_guide';
  categoryLabel: string;
  summary: string;
  content: string;
  readTime: string;
  iconName: string;
  targetAudience: 'students' | 'parents' | 'teachers' | 'general';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  category: 'auth' | 'personnel' | 'school' | 'assignment' | 'activity' | 'system' | 'sheets_export';
  details: string;
}

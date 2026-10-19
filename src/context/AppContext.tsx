import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Organization, 
  Personnel, 
  School, 
  Assignment, 
  Activity, 
  MediaNews, 
  AuditLog, 
  UserProfile, 
  UserRole,
  ActivityStatus
} from '../types';
import { 
  INITIAL_ORGANIZATIONS, 
  INITIAL_PERSONNEL, 
  INITIAL_SCHOOLS, 
  INITIAL_ASSIGNMENTS, 
  INITIAL_ACTIVITIES, 
  INITIAL_NEWS, 
  INITIAL_AUDIT_LOGS, 
  CURRENT_DEMO_USERS 
} from '../data/mockData';
import { 
  initAuth, 
  googleSignIn, 
  logout as authLogout, 
  getAccessToken 
} from '../services/firebaseAuth';
import { createAndExportToGoogleSheets } from '../services/googleSheetsService';

interface AppContextType {
  // Data
  organizations: Organization[];
  personnel: Personnel[];
  schools: School[];
  assignments: Assignment[];
  activities: Activity[];
  news: MediaNews[];
  auditLogs: AuditLog[];
  
  // Auth & Roles
  currentUser: UserProfile;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  googleUser: any | null;
  googleToken: string | null;
  isLoggingIn: boolean;
  handleGoogleSignIn: () => Promise<void>;
  handleGoogleSignOut: () => Promise<void>;

  // Personnel actions
  addPersonnel: (person: Omit<Personnel, 'id' | 'updatedAt' | 'assignedSchoolCount' | 'assignedSchoolIds' | 'totalActivitiesConducted'>) => void;
  updatePersonnel: (id: string, person: Partial<Personnel>) => void;
  deletePersonnel: (id: string) => void;

  // School actions
  addSchool: (school: Omit<School, 'id' | 'updatedAt' | 'assignedPersonnelIds' | 'totalActivities'>) => void;
  updateSchool: (id: string, school: Partial<School>) => void;
  deleteSchool: (id: string) => void;

  // Assignment actions
  createAssignment: (personnelId: string, schoolIds: string[], academicYear: string, note?: string) => { success: boolean; message: string };
  removeAssignment: (id: string) => void;

  // Activity actions
  createActivity: (activity: Omit<Activity, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => void;
  updateActivity: (id: string, activity: Partial<Activity>) => void;
  updateActivityStatus: (id: string, newStatus: ActivityStatus, reviewComment?: string) => void;
  deleteActivity: (id: string) => void;

  // News actions
  addNews: (item: Omit<MediaNews, 'id' | 'views'>) => void;
  updateNews: (id: string, item: Partial<MediaNews>) => void;
  deleteNews: (id: string) => void;

  // Google Sheets Export
  exportRosterToGoogleSheets: () => Promise<{ success: boolean; url?: string; message: string }>;
  exportSchoolsToGoogleSheets: () => Promise<{ success: boolean; url?: string; message: string }>;
  exportActivitiesToGoogleSheets: () => Promise<{ success: boolean; url?: string; message: string }>;

  // Reset to original mock data
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Browser storage is only a demo persistence layer; corrupted or unavailable storage
// must not prevent the public site and dashboard from rendering.
const readLocalState = <T,>(key: string, fallback: T): T => {
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
};

const persistLocalState = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Keep the current session usable if browser storage is blocked or full.
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State with LocalStorage persistence for demo interactivity
  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    return readLocalState('dare_bpp_organizations', INITIAL_ORGANIZATIONS);
  });

  const [personnel, setPersonnel] = useState<Personnel[]>(() => {
    const saved = readLocalState<Personnel[]>('dare_bpp_personnel', INITIAL_PERSONNEL);
    const savedById = new Map(saved.map((person) => [person.id, person]));
    const officialRoster = INITIAL_PERSONNEL.map((person) => savedById.get(person.id) ?? person);
    // Keep user-added records, but discard the old placeholder demo roster.
    const customRecords = saved.filter((person) =>
      !person.id.startsWith('per-') && !INITIAL_PERSONNEL.some((seed) => seed.id === person.id)
    );
    return [...officialRoster, ...customRecords];
  });

  const [schools, setSchools] = useState<School[]>(() => {
    const saved = readLocalState<School[]>('dare_bpp_schools', INITIAL_SCHOOLS);
    const savedById = new Map(saved.map((school) => [school.id, school]));
    const officialSchools = INITIAL_SCHOOLS.map((school) => savedById.get(school.id) ?? school);
    const customSchools = saved.filter((school) =>
      !school.id.startsWith('sch-') && !INITIAL_SCHOOLS.some((seed) => seed.id === school.id)
    );
    return [...officialSchools, ...customSchools];
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    return readLocalState('dare_bpp_assignments', INITIAL_ASSIGNMENTS);
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    return readLocalState('dare_bpp_activities', INITIAL_ACTIVITIES);
  });

  const [news, setNews] = useState<MediaNews[]>(() => {
    return readLocalState('dare_bpp_news', INITIAL_NEWS);
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    return readLocalState('dare_bpp_audit_logs', INITIAL_AUDIT_LOGS);
  });

  // User and Role
  const [currentRole, setCurrentRole] = useState<UserRole>('central_admin');
  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_DEMO_USERS['central_admin']);
  const [googleUser, setGoogleUser] = useState<any | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Sync to local storage
  useEffect(() => {
    persistLocalState('dare_bpp_organizations', organizations);
  }, [organizations]);

  useEffect(() => {
    persistLocalState('dare_bpp_personnel', personnel);
  }, [personnel]);

  useEffect(() => {
    persistLocalState('dare_bpp_schools', schools);
  }, [schools]);

  useEffect(() => {
    persistLocalState('dare_bpp_assignments', assignments);
  }, [assignments]);

  useEffect(() => {
    persistLocalState('dare_bpp_activities', activities);
  }, [activities]);

  useEffect(() => {
    persistLocalState('dare_bpp_news', news);
  }, [news]);

  useEffect(() => {
    persistLocalState('dare_bpp_audit_logs', auditLogs);
  }, [auditLogs]);

  // Firebase auth initialization listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const logAction = (action: string, category: AuditLog['category'], details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentRole,
      action,
      category,
      details,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    setCurrentUser(CURRENT_DEMO_USERS[role] || CURRENT_DEMO_USERS['central_admin']);
    logAction('เปลี่ยนบทบาทการทำงาน', 'system', `สลับบทบาทเป็น: ${role}`);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoggingIn(true);
      const res = await googleSignIn();
      setGoogleUser(res.user);
      setGoogleToken(res.accessToken);
      logAction('ลงชื่อเข้าใช้ Google Workspace', 'auth', `เข้าสู่ระบบด้วยบัญชี: ${res.user.email}`);
    } catch (err: any) {
      console.error('Google Sign In Failed:', err);
      throw err;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await authLogout();
    setGoogleUser(null);
    setGoogleToken(null);
    logAction('ออกจากระบบ Google', 'auth', 'ออกจากระบบการเชื่อมต่อ Google Workspace');
  };

  // Personnel actions
  const addPersonnel = (personData: Omit<Personnel, 'id' | 'updatedAt' | 'assignedSchoolCount' | 'assignedSchoolIds' | 'totalActivitiesConducted'>) => {
    const newId = `per-${Date.now().toString().slice(-4)}`;
    const newPerson: Personnel = {
      ...personData,
      id: newId,
      assignedSchoolCount: 0,
      assignedSchoolIds: [],
      totalActivitiesConducted: 0,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setPersonnel(prev => [newPerson, ...prev]);
    logAction('เพิ่มครู D.A.R.E.', 'personnel', `เพิ่ม ${newPerson.rank} ${newPerson.firstName} ${newPerson.lastName} (${newPerson.organizationName})`);
  };

  const updatePersonnel = (id: string, updated: Partial<Personnel>) => {
    setPersonnel(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, ...updated, updatedAt: new Date().toISOString().split('T')[0] };
      }
      return p;
    }));
    logAction('แก้ไขข้อมูลครู D.A.R.E.', 'personnel', `แก้ไขรหัสบุคลากร: ${id}`);
  };

  const deletePersonnel = (id: string) => {
    const target = personnel.find(p => p.id === id);
    setPersonnel(prev => prev.filter(p => p.id !== id));
    // Clean assignments
    setAssignments(prev => prev.filter(a => a.personnelId !== id));
    // Update schools
    setSchools(prev => prev.map(s => {
      if (s.assignedPersonnelIds.includes(id)) {
        const remaining = s.assignedPersonnelIds.filter(pid => pid !== id);
        return {
          ...s,
          assignedPersonnelIds: remaining,
          assignmentStatus: remaining.length === 0 ? 'unassigned' : 'assigned',
        };
      }
      return s;
    }));
    if (target) {
      logAction('ลบข้อมูลครู D.A.R.E.', 'personnel', `ลบข้อมูล: ${target.rank} ${target.firstName} ${target.lastName}`);
    }
  };

  // School actions
  const addSchool = (schoolData: Omit<School, 'id' | 'updatedAt' | 'assignedPersonnelIds' | 'totalActivities'>) => {
    const newId = `sch-${Date.now().toString().slice(-4)}`;
    const newSchool: School = {
      ...schoolData,
      id: newId,
      assignedPersonnelIds: [],
      assignmentStatus: 'unassigned',
      totalActivities: 0,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setSchools(prev => [newSchool, ...prev]);
    logAction('เพิ่มสถานศึกษา', 'school', `เพิ่มสถานศึกษา: ${newSchool.name} จ.${newSchool.province}`);
  };

  const updateSchool = (id: string, updated: Partial<School>) => {
    setSchools(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, ...updated, updatedAt: new Date().toISOString().split('T')[0] };
      }
      return s;
    }));
    logAction('แก้ไขข้อมูลสถานศึกษา', 'school', `แก้ไขโรงเรียนรหัส: ${id}`);
  };

  const deleteSchool = (id: string) => {
    const target = schools.find(s => s.id === id);
    setSchools(prev => prev.filter(s => s.id !== id));
    setAssignments(prev => prev.filter(a => a.schoolId !== id));
    // Recalculate personnel school counts
    setPersonnel(prev => prev.map(p => {
      if (p.assignedSchoolIds.includes(id)) {
        const remaining = p.assignedSchoolIds.filter(sid => sid !== id);
        return {
          ...p,
          assignedSchoolIds: remaining,
          assignedSchoolCount: remaining.length,
        };
      }
      return p;
    }));
    if (target) {
      logAction('ลบสถานศึกษา', 'school', `ลบสถานศึกษา: ${target.name}`);
    }
  };

  // Assignment actions
  const createAssignment = (
    personnelId: string, 
    schoolIds: string[], 
    academicYear: string, 
    note?: string
  ): { success: boolean; message: string } => {
    const officer = personnel.find(p => p.id === personnelId);
    if (!officer) return { success: false, message: 'ไม่พบบุคลากรที่เลือก' };

    if (officer.status !== 'active') {
      return { success: false, message: `ไม่สามารถมอบหมายได้เนื่องจากสถานะของบุคลากรคือ "${officer.status}"` };
    }

    const newAssignments: Assignment[] = [];
    const today = new Date().toISOString().split('T')[0];

    for (const sid of schoolIds) {
      const sch = schools.find(s => s.id === sid);
      if (!sch) continue;

      // Duplicate check for active assignment
      const exists = assignments.some(
        a => a.personnelId === personnelId && a.schoolId === sid && a.status === 'active'
      );
      if (exists) continue;

      newAssignments.push({
        id: `asg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        personnelId,
        personnelName: `${officer.firstName} ${officer.lastName}`,
        personnelRank: officer.rank,
        schoolId: sid,
        schoolName: sch.name,
        organizationId: officer.organizationId,
        startDate: today,
        status: 'active',
        academicYear,
        note: note || `มอบหมายประจำปีการศึกษา ${academicYear}`,
        assignedBy: currentUser.name,
        createdAt: today,
      });
    }

    if (newAssignments.length === 0) {
      return { success: false, message: 'ไม่มีโรงเรียนใหม่ที่มอบหมาย หรือโรงเรียนถูกมอบหมายไปแล้ว' };
    }

    setAssignments(prev => [...newAssignments, ...prev]);

    // Update School records
    setSchools(prev => prev.map(s => {
      if (schoolIds.includes(s.id)) {
        const merged = Array.from(new Set([...s.assignedPersonnelIds, personnelId]));
        return {
          ...s,
          assignedPersonnelIds: merged,
          assignmentStatus: 'assigned',
          updatedAt: today,
        };
      }
      return s;
    }));

    // Update Personnel record
    setPersonnel(prev => prev.map(p => {
      if (p.id === personnelId) {
        const mergedSchools = Array.from(new Set([...p.assignedSchoolIds, ...schoolIds]));
        return {
          ...p,
          assignedSchoolIds: mergedSchools,
          assignedSchoolCount: mergedSchools.length,
          updatedAt: today,
        };
      }
      return p;
    }));

    logAction(
      'บันทึกการมอบหมายครู D.A.R.E.',
      'assignment',
      `มอบหมาย ${officer.rank} ${officer.firstName} ประจำ ${schoolIds.length} โรงเรียน (ปีการศึกษา ${academicYear})`
    );

    return { success: true, message: `มอบหมายสำเร็จ ${newAssignments.length} โรงเรียน` };
  };

  const removeAssignment = (id: string) => {
    const asg = assignments.find(a => a.id === id);
    if (!asg) return;

    setAssignments(prev => prev.filter(a => a.id !== id));

    // Update school
    setSchools(prev => prev.map(s => {
      if (s.id === asg.schoolId) {
        const remaining = s.assignedPersonnelIds.filter(pid => pid !== asg.personnelId);
        return {
          ...s,
          assignedPersonnelIds: remaining,
          assignmentStatus: remaining.length === 0 ? 'unassigned' : 'assigned',
        };
      }
      return s;
    }));

    // Update personnel
    setPersonnel(prev => prev.map(p => {
      if (p.id === asg.personnelId) {
        const remaining = p.assignedSchoolIds.filter(sid => sid !== asg.schoolId);
        return {
          ...p,
          assignedSchoolIds: remaining,
          assignedSchoolCount: remaining.length,
        };
      }
      return p;
    }));

    logAction('ยกเลิกการมอบหมาย', 'assignment', `ยกเลิกการมอบหมาย ${asg.personnelRank} ${asg.personnelName} ที่ ${asg.schoolName}`);
  };

  // Activity actions
  const createActivity = (data: Omit<Activity, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => {
    const [activityYear, activityMonth] = data.date.split('-').map(Number);
    const fiscalYear = activityYear + (activityMonth >= 10 ? 544 : 543);
    const code = `ACT-${String(fiscalYear).slice(-2)}-${(activities.length + 1).toString().padStart(3, '0')}`;
    const now = new Date().toISOString().split('T')[0];
    const newAct: Activity = {
      ...data,
      id: `act-${Date.now()}`,
      code,
      createdAt: now,
      updatedAt: now,
    };
    setActivities(prev => [newAct, ...prev]);

    // Update school last activity date
    setSchools(prev => prev.map(s => {
      if (s.id === data.schoolId) {
        return {
          ...s,
          lastActivityDate: data.date,
          totalActivities: s.totalActivities + 1,
        };
      }
      return s;
    }));

    // Update instructors total activities
    setPersonnel(prev => prev.map(p => {
      if (data.instructorIds.includes(p.id)) {
        return {
          ...p,
          totalActivitiesConducted: p.totalActivitiesConducted + 1,
        };
      }
      return p;
    }));

    logAction('สร้างกิจกรรม D.A.R.E.', 'activity', `สร้างกิจกรรม ${code}: ${data.title} (${data.schoolName})`);
  };

  const updateActivity = (id: string, updated: Partial<Activity>) => {
    const now = new Date().toISOString().split('T')[0];
    setActivities(prev => prev.map(a => (a.id === id ? { ...a, ...updated, updatedAt: now } : a)));
    logAction('แก้ไขกิจกรรม', 'activity', `แก้ไขกิจกรรมรหัส ${id}`);
  };

  const updateActivityStatus = (id: string, newStatus: ActivityStatus, reviewComment?: string) => {
    const now = new Date().toISOString().split('T')[0];
    setActivities(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: newStatus,
          reviewComment: reviewComment || a.reviewComment,
          reviewedBy: newStatus === 'approved' || newStatus === 'revision_requested' ? currentUser.name : a.reviewedBy,
          updatedAt: now,
        };
      }
      return a;
    }));
    logAction('ปรับสถานะกิจกรรม', 'activity', `ปรับสถานะกิจกรรม ${id} เป็น "${newStatus}" โดย ${currentUser.name}`);
  };

  const deleteActivity = (id: string) => {
    const act = activities.find(a => a.id === id);
    setActivities(prev => prev.filter(a => a.id !== id));
    if (act) {
      logAction('ลบกิจกรรม', 'activity', `ลบกิจกรรม ${act.code}: ${act.title}`);
    }
  };

  // News actions
  const addNews = (item: Omit<MediaNews, 'id' | 'views'>) => {
    const newItem: MediaNews = {
      ...item,
      id: `news-${Date.now()}`,
      views: 0,
    };
    setNews(prev => [newItem, ...prev]);
    logAction('สร้างข่าวประชาสัมพันธ์', 'system', `สร้างข่าว: ${item.title}`);
  };

  const updateNews = (id: string, item: Partial<MediaNews>) => {
    setNews(prev => prev.map(n => (n.id === id ? { ...n, ...item } : n)));
    logAction('แก้ไขข่าวสาร', 'system', `แก้ไขข่าวรหัส: ${id}`);
  };

  const deleteNews = (id: string) => {
    const target = news.find(n => n.id === id);
    setNews(prev => prev.filter(n => n.id !== id));
    if (target) {
      logAction('ลบข่าวสาร', 'system', `ลบข่าว: ${target.title}`);
    }
  };

  // Google Sheets Export Operations
  const exportRosterToGoogleSheets = async () => {
    const headers = [
      'ลำดับ',
      'ยศ',
      'ชื่อ-นามสกุล',
      'หมายเลขข้าราชการ',
      'หน่วยต้นสังกัด',
      'จังหวัด',
      'สถานะ',
      'รุ่น D.A.R.E.',
      'จำนวนโรงเรียนรับผิดชอบ',
      'กิจกรรมที่สอนแล้ว (ครั้ง)',
      'เบอร์โทรศัพท์',
      'อีเมล',
    ];

    const rows = personnel.map((p, idx) => [
      idx + 1,
      p.rank,
      `${p.firstName} ${p.lastName}`,
      p.policeId,
      p.organizationName,
      p.province,
      p.status === 'active' ? 'ปฏิบัติหน้าที่ปกติ' : p.status === 'leave' ? 'ลาพัก/ศึกษาต่อ' : 'ย้าย/พ้นหน้าที่',
      p.batchNumber,
      p.assignedSchoolCount,
      p.totalActivitiesConducted,
      p.phone,
      p.email,
    ]);

    const title = `ทำเนียบครู D.A.R.E. บช.ตชด. (${new Date().toLocaleDateString('th-TH')})`;
    const result = await createAndExportToGoogleSheets(title, headers, rows);
    logAction('ส่งออก Google Sheets (ครู D.A.R.E.)', 'sheets_export', `สร้างเอกสาร: ${result.spreadsheetUrl}`);
    return { success: true, url: result.spreadsheetUrl, message: result.message };
  };

  const exportSchoolsToGoogleSheets = async () => {
    const headers = [
      'ลำดับ',
      'รหัสสถานศึกษา',
      'ชื่อโรงเรียน',
      'ประเภทโรงเรียน',
      'จังหวัด',
      'อำเภอ',
      'ตำบล',
      'สังกัด ตชด.',
      'สถานะการมอบหมาย',
      'จำนวนนักเรียน',
      'กิจกรรมที่บันทึก',
      'วันที่จัดกิจกรรมล่าสุด',
    ];

    const rows = schools.map((s, idx) => [
      idx + 1,
      s.code,
      s.name,
      s.type === 'bpp_school' ? 'รร.ตชด.' : 'สพฐ. ร่วมโครงการ',
      s.province,
      s.district,
      s.subdistrict,
      s.organizationName,
      s.assignmentStatus === 'assigned' ? 'มีครูรับผิดชอบแล้ว' : 'ยังไม่มีครูรับผิดชอบ',
      s.totalStudents,
      s.totalActivities,
      s.lastActivityDate || 'ยังไม่มีข้อมูล',
    ]);

    const title = `ทะเบียนสถานศึกษา D.A.R.E. (${new Date().toLocaleDateString('th-TH')})`;
    const result = await createAndExportToGoogleSheets(title, headers, rows);
    logAction('ส่งออก Google Sheets (สถานศึกษา)', 'sheets_export', `สร้างเอกสาร: ${result.spreadsheetUrl}`);
    return { success: true, url: result.spreadsheetUrl, message: result.message };
  };

  const exportActivitiesToGoogleSheets = async () => {
    const headers = [
      'ลำดับ',
      'รหัสกิจกรรม',
      'หัวข้อกิจกรรม/บทเรียน',
      'ประเภทกิจกรรม',
      'สถานศึกษา',
      'หน่วย ตชด.',
      'วันที่',
      'เวลา',
      'ครูผู้สอน',
      'จำนวนนักเรียน',
      'สถานะการดำเนินงาน',
    ];

    const rows = activities.map((a, idx) => [
      idx + 1,
      a.code,
      a.title,
      a.category,
      a.schoolName,
      a.organizationName,
      a.date,
      a.time,
      a.instructorNames.join(', '),
      a.studentCount,
      a.status,
    ]);

    const title = `รายงานผลการจัดกิจกรรม D.A.R.E. (${new Date().toLocaleDateString('th-TH')})`;
    const result = await createAndExportToGoogleSheets(title, headers, rows);
    logAction('ส่งออก Google Sheets (กิจกรรม)', 'sheets_export', `สร้างเอกสาร: ${result.spreadsheetUrl}`);
    return { success: true, url: result.spreadsheetUrl, message: result.message };
  };

  const resetDemoData = () => {
    localStorage.removeItem('dare_bpp_organizations');
    localStorage.removeItem('dare_bpp_personnel');
    localStorage.removeItem('dare_bpp_schools');
    localStorage.removeItem('dare_bpp_assignments');
    localStorage.removeItem('dare_bpp_activities');
    localStorage.removeItem('dare_bpp_news');
    localStorage.removeItem('dare_bpp_audit_logs');
    setOrganizations(INITIAL_ORGANIZATIONS);
    setPersonnel(INITIAL_PERSONNEL);
    setSchools(INITIAL_SCHOOLS);
    setAssignments(INITIAL_ASSIGNMENTS);
    setActivities(INITIAL_ACTIVITIES);
    setNews(INITIAL_NEWS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    logAction('รีเซ็ตข้อมูลตัวอย่าง', 'system', 'คืนค่าข้อมูลสาธิตเริ่มต้นทั้งหมด');
  };

  return (
    <AppContext.Provider
      value={{
        organizations,
        personnel,
        schools,
        assignments,
        activities,
        news,
        auditLogs,
        currentUser,
        currentRole,
        switchRole,
        googleUser,
        googleToken,
        isLoggingIn,
        handleGoogleSignIn,
        handleGoogleSignOut,
        addPersonnel,
        updatePersonnel,
        deletePersonnel,
        addSchool,
        updateSchool,
        deleteSchool,
        createAssignment,
        removeAssignment,
        createActivity,
        updateActivity,
        updateActivityStatus,
        deleteActivity,
        addNews,
        updateNews,
        deleteNews,
        exportRosterToGoogleSheets,
        exportSchoolsToGoogleSheets,
        exportActivitiesToGoogleSheets,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

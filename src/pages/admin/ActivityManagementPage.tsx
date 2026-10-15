import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Activity, ActivityStatus, ActivityCategory } from '../../types';
import { 
  Activity as ActivityIcon, 
  Search, 
  Plus, 
  FileSpreadsheet, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  X, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  Users, 
  Image as ImageIcon,
  Check,
  RotateCcw
} from 'lucide-react';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

export const ActivityManagementPage: React.FC = () => {
  const { 
    activities, 
    schools, 
    personnel, 
    organizations, 
    createActivity, 
    updateActivity, 
    updateActivityStatus, 
    deleteActivity,
    exportActivitiesToGoogleSheets,
    currentRole 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [pendingStatusChange, setPendingStatusChange] = useState<{ id: string; status: ActivityStatus } | null>(null);

  const [showSheetsConfirm, setShowSheetsConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [sheetsNotice, setSheetsNotice] = useState<{ url?: string; message: string } | null>(null);

  // Form Data
  const [formData, setFormData] = useState({
    title: '',
    category: 'dare_standard' as ActivityCategory,
    schoolId: schools[0]?.id || '',
    schoolName: schools[0]?.name || '',
    organizationId: organizations[2]?.id || organizations[0]?.id || '',
    organizationName: organizations[2]?.name || organizations[0]?.name || '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00 - 11:00 น.',
    location: 'ห้องประชุมโรงเรียน',
    instructorIds: [personnel[0]?.id || ''],
    studentCount: 45,
    lessonNumber: 1,
    description: '',
    summary: '',
    photoUrls: ['https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80'],
    status: 'draft' as ActivityStatus,
    fiscalYear: '2568',
  });

  const statusBadges: Record<ActivityStatus, { label: string; color: string }> = {
    draft: { label: 'ร่าง', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    submitted: { label: 'ส่งตรวจสอบ', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    pending_approval: { label: 'รออนุมัติ', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    approved: { label: 'อนุมัติแล้ว', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    in_progress: { label: 'กำลังดำเนินการ', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    completed: { label: 'เสร็จสิ้น', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    revision_requested: { label: 'ส่งกลับแก้ไข', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    cancelled: { label: 'ยกเลิก', color: 'bg-red-100 text-red-800 border-red-200' },
  };

  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      const matchSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.schoolName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchCategory = categoryFilter === 'all' || a.category === categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [activities, searchQuery, statusFilter, categoryFilter]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    const firstSchool = schools[0];
    const firstOfficer = personnel[0];
    setFormData({
      title: '',
      category: 'dare_standard',
      schoolId: firstSchool?.id || '',
      schoolName: firstSchool?.name || '',
      organizationId: firstSchool?.organizationId || organizations[0]?.id || '',
      organizationName: firstSchool?.organizationName || organizations[0]?.name || '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00 - 11:30 น.',
      location: `ห้องเรียน D.A.R.E. ${firstSchool?.name || ''}`,
      instructorIds: [firstOfficer?.id || ''],
      studentCount: 40,
      lessonNumber: 1,
      description: 'จัดการเรียนการสอนหลักสูตร D.A.R.E. เสริมสร้างทักษะชีวิต',
      summary: 'นักเรียนร่วมกิจกรรมอย่างตั้งใจและมีส่วนร่วมอย่างดี',
      photoUrls: ['https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80'],
      status: 'draft',
      fiscalYear: '2568',
    });
    setShowEditModal(true);
  };

  const handleOpenEdit = (act: Activity) => {
    setIsEditing(true);
    setSelectedActivity(act);
    setFormData({
      title: act.title,
      category: act.category,
      schoolId: act.schoolId,
      schoolName: act.schoolName,
      organizationId: act.organizationId,
      organizationName: act.organizationName,
      date: act.date,
      time: act.time,
      location: act.location,
      instructorIds: act.instructorIds,
      studentCount: act.studentCount,
      lessonNumber: act.lessonNumber || 1,
      description: act.description,
      summary: act.summary,
      photoUrls: act.photoUrls,
      status: act.status,
      fiscalYear: act.fiscalYear,
    });
    setShowEditModal(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const targetSchool = schools.find(s => s.id === formData.schoolId);
    const targetInstructors = personnel.filter(p => formData.instructorIds.includes(p.id));

    const payload = {
      ...formData,
      schoolName: targetSchool ? targetSchool.name : formData.schoolName,
      instructorNames: targetInstructors.map(p => `${p.rank} ${p.firstName} ${p.lastName}`),
      photoUrls: formData.photoUrls.filter(Boolean),
    };

    if (isEditing && selectedActivity) {
      updateActivity(selectedActivity.id, payload);
    } else {
      createActivity(payload);
    }
    setShowEditModal(false);
  };

  const handleConfirmDelete = () => {
    if (targetDeleteId) {
      deleteActivity(targetDeleteId);
      setTargetDeleteId(null);
      setShowDeleteModal(false);
    }
  };

  const handleConfirmReview = () => {
    if (pendingStatusChange) {
      updateActivityStatus(pendingStatusChange.id, pendingStatusChange.status, reviewComment);
      setPendingStatusChange(null);
      setReviewComment('');
      setShowReviewModal(false);
    }
  };

  const handleExportGoogleSheets = async () => {
    try {
      setIsExporting(true);
      const res = await exportActivitiesToGoogleSheets();
      setSheetsNotice({ url: res.url, message: res.message });
      setShowSheetsConfirm(false);
    } catch (err: any) {
      alert(err.message || 'ส่งออก Google Sheets ไม่สำเร็จ');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#32145C] flex items-center gap-2">
            <ActivityIcon className="w-6 h-6 text-[#5B2A86]" />
            <span>จัดการกิจกรรมการเรียนการสอน D.A.R.E.</span>
          </h1>
          <p className="text-xs text-[#756B80]">
            บันทึกการสอน ติดตามสถานะการส่งรายงาน และกระบวนการอนุมัติกิจกรรมทั่วประเทศ
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowSheetsConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#168A62] hover:bg-[#0f6b4b] rounded-lg shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>ส่งออก Google Sheets</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#211A2B] bg-[#D6B15E] hover:bg-[#c49f48] rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#32145C]" />
            <span>สร้างกิจกรรมใหม่</span>
          </button>
        </div>
      </div>

      {/* Sheets Notice */}
      {sheetsNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{sheetsNotice.message}</span>
          </div>
          {sheetsNotice.url && (
            <a href={sheetsNotice.url} target="_blank" rel="noreferrer" className="font-bold underline text-emerald-800">
              เปิดดูสเปรดชีต
            </a>
          )}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E0EF] shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#756B80]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อกิจกรรม, รหัส, หรือโรงเรียน..."
            className="w-full pl-9 pr-3 py-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
          >
            <option value="all">ทุกสถานะกิจกรรม</option>
            <option value="draft">ร่าง (Draft)</option>
            <option value="submitted">ส่งตรวจสอบ (Submitted)</option>
            <option value="pending_approval">รออนุมัติ (Pending Approval)</option>
            <option value="approved">อนุมัติแล้ว (Approved)</option>
            <option value="completed">เสร็จสิ้น (Completed)</option>
          </select>
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full py-2 px-3 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
          >
            <option value="all">ทุกประเภทกิจกรรม</option>
            <option value="dare_standard">หลักสูตรมาตรฐาน 10 สัปดาห์</option>
            <option value="special_camp">ค่ายเยาวชนต้านยาเสพติด</option>
            <option value="drug_free_school">สถานศึกษาสีขาว</option>
            <option value="parent_workshop">อบรมผู้ปกครอง/ชุมชน</option>
          </select>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-xl border border-[#E7E0EF] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5FB] text-[#756B80] font-semibold border-b border-[#E7E0EF]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">ลำดับ</th>
                <th className="py-3 px-4">รหัส</th>
                <th className="py-3 px-4">หัวข้อกิจกรรม / โรงเรียน</th>
                <th className="py-3 px-4">วัน-เวลา</th>
                <th className="py-3 px-4">ครูผู้สอน</th>
                <th className="py-3 px-4 text-center">นักเรียน</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
                <th className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E0EF] text-[#211A2B]">
              {filteredActivities.map((act, idx) => (
                <tr key={act.id} className="hover:bg-purple-50/50 transition-colors">
                  <td className="py-3 px-4 text-center text-[#756B80] font-mono">{idx + 1}</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#5B2A86]">{act.code}</td>
                  <td className="py-3 px-4 font-medium max-w-xs">
                    <div className="font-bold text-[#211A2B] truncate">{act.title}</div>
                    <div className="text-[11px] text-[#756B80]">{act.schoolName}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div>{act.date}</div>
                    <div className="text-[10px] text-[#756B80]">{act.time}</div>
                  </td>
                  <td className="py-3 px-4 text-xs">
                    {act.instructorNames.join(', ')}
                  </td>
                  <td className="py-3 px-4 text-center font-bold">
                    {act.studentCount} คน
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${statusBadges[act.status]?.color}`}>
                      {statusBadges[act.status]?.label || act.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedActivity(act);
                          setShowDetailModal(true);
                        }}
                        className="p-1 text-[#5B2A86] hover:bg-purple-100 rounded"
                        title="ดูรายละเอียด"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Commander Approval Quick Buttons */}
                      {(currentRole === 'central_admin' || currentRole === 'unit_admin') && (
                        <>
                          {act.status === 'pending_approval' && (
                            <button
                              onClick={() => {
                                setPendingStatusChange({ id: act.id, status: 'approved' });
                                setShowReviewModal(true);
                              }}
                              className="px-2 py-0.5 text-[10px] font-bold bg-[#168A62] text-white rounded hover:bg-[#0f6b4b]"
                              title="อนุมัติกิจกรรม"
                            >
                              อนุมัติ
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(act)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="แก้ไข"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setTargetDeleteId(act.id);
                              setShowDeleteModal(true);
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            title="ลบ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* Instructor Action: Submit for approval */}
                      {currentRole === 'dare_instructor' && act.status === 'draft' && (
                        <button
                          onClick={() => updateActivityStatus(act.id, 'pending_approval', 'ส่งตรวจสอบโดยครูผู้สอน')}
                          className="px-2 py-0.5 text-[10px] font-bold bg-[#5B2A86] text-white rounded hover:bg-[#441D66]"
                        >
                          ส่งตรวจสอบ
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Detail Modal */}
      {showDetailModal && selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E7E0EF]">
            <div className="p-5 border-b border-[#E7E0EF] flex items-center justify-between bg-[#F7F5FB]">
              <div>
                <span className="font-mono text-[#5B2A86] text-xs font-bold">{selectedActivity.code}</span>
                <h3 className="text-base font-bold text-[#32145C] mt-0.5">{selectedActivity.title}</h3>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#F7F5FB] rounded-lg">
                  <span className="text-[#756B80] block">สถานศึกษา</span>
                  <span className="font-bold text-[#211A2B]">{selectedActivity.schoolName}</span>
                </div>
                <div className="p-3 bg-[#F7F5FB] rounded-lg">
                  <span className="text-[#756B80] block">วันและเวลา</span>
                  <span className="font-bold text-[#211A2B]">{selectedActivity.date} ({selectedActivity.time})</span>
                </div>
                <div className="p-3 bg-[#F7F5FB] rounded-lg">
                  <span className="text-[#756B80] block">ครูผู้สอน</span>
                  <span className="font-bold text-[#211A2B]">{selectedActivity.instructorNames.join(', ')}</span>
                </div>
                <div className="p-3 bg-[#F7F5FB] rounded-lg">
                  <span className="text-[#756B80] block">จำนวนนักเรียนที่เข้าร่วม</span>
                  <span className="font-bold text-[#211A2B]">{selectedActivity.studentCount} คน</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-[#32145C] block mb-1">คำอธิบายและเนื้อหาการสอน:</span>
                <p className="p-3 bg-[#F7F5FB] rounded-lg text-gray-700 leading-relaxed">
                  {selectedActivity.description}
                </p>
              </div>

              {selectedActivity.summary && (
                <div>
                  <span className="font-bold text-[#168A62] block mb-1">ผลการดำเนินงานและข้อคิดเห็น:</span>
                  <p className="p-3 bg-emerald-50 rounded-lg text-emerald-900 leading-relaxed">
                    {selectedActivity.summary}
                  </p>
                </div>
              )}

              {/* Photos Gallery */}
              {selectedActivity.photoUrls.length > 0 && (
                <div>
                  <span className="font-bold text-[#32145C] block mb-2">ภาพถ่ายกิจกรรม:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedActivity.photoUrls.map((url, idx) => (
                      <img key={idx} src={url} alt="Activity" className="rounded-lg h-36 w-full object-cover" />
                    ))}
                  </div>
                </div>
              )}

              {selectedActivity.reviewedBy && (
                <div className="p-3 rounded-lg bg-purple-50 text-purple-900 border border-purple-200">
                  <span className="font-bold">ตรวจสอบและอนุมัติโดย: </span>
                  <span>{selectedActivity.reviewedBy}</span>
                  {selectedActivity.reviewComment && (
                    <div className="text-[11px] text-purple-700 mt-1 italic">
                      ความเห็น: "{selectedActivity.reviewComment}"
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-[#F7F5FB] border-t border-[#E7E0EF] flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#5B2A86] rounded-lg"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Activity Form Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E7E0EF]">
            <div className="p-5 border-b border-[#E7E0EF] flex items-center justify-between bg-[#F7F5FB]">
              <h3 className="text-sm font-bold text-[#32145C]">
                {isEditing ? 'แก้ไขกิจกรรม D.A.R.E.' : 'สร้างกิจกรรมการเรียนการสอนใหม่'}
              </h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#211A2B] block mb-1">หัวข้อกิจกรรม / บทเรียน</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="เช่น บทเรียนที่ 5: การสื่อสารอย่างมั่นใจและไม่ก้าวร้าว"
                  className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">ประเภทกิจกรรม</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ActivityCategory })}
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                  >
                    <option value="dare_standard">หลักสูตรมาตรฐาน 10 สัปดาห์</option>
                    <option value="special_camp">ค่ายเยาวชนต้านยาเสพติด</option>
                    <option value="drug_free_school">โครงการสถานศึกษาสีขาว</option>
                    <option value="parent_workshop">การอบรมผู้ปกครอง/ชุมชน</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">สถานศึกษา</label>
                  <select
                    value={formData.schoolId}
                    onChange={(e) => {
                      const sch = schools.find(s => s.id === e.target.value);
                      setFormData({
                        ...formData,
                        schoolId: e.target.value,
                        schoolName: sch?.name || formData.schoolName,
                      });
                    }}
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                  >
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.province})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">วันที่สอน</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">เวลา</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">จำนวนนักเรียน</label>
                  <input
                    type="number"
                    value={formData.studentCount}
                    onChange={(e) => setFormData({ ...formData, studentCount: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#211A2B] block mb-1">สถานที่จัดกิจกรรม</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-[#211A2B] block mb-1">คำอธิบายกิจกรรม</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-[#211A2B] block mb-1">สรุปผลการจัดกิจกรรม</label>
                <textarea
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                />
              </div>

              <div className="p-4 bg-[#F7F5FB] border-t border-[#E7E0EF] flex justify-end gap-2 -mx-6 -mb-6 mt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-[#E7E0EF] rounded-lg text-gray-700"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5B2A86] text-white font-bold rounded-lg"
                >
                  บันทึกกิจกรรม
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal for Approval */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E7E0EF]">
            <h3 className="text-sm font-bold text-[#32145C]">อนุมัติผลการปฏิบัติงาน D.A.R.E.</h3>
            <p className="text-xs text-[#756B80]">
              ระบุข้อคิดเห็นหรือคำแนะนำสำหรับครูผู้สอนก่อนยืนยันการอนุมัติ (บันทึกในระบบสารบรรณ)
            </p>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="ข้อคิดเห็นผู้บังคับบัญชา..."
              className="w-full p-2 text-xs bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-3 py-1.5 border rounded-lg text-gray-600"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmReview}
                className="px-4 py-1.5 bg-[#168A62] text-white font-bold rounded-lg"
              >
                ยืนยันอนุมัติ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="ยืนยันการลบกิจกรรม"
        description="คุณต้องการลบกิจกรรมนี้ออกจากระบบใช่หรือไม่?"
        type="danger"
        confirmLabel="ยืนยันลบ"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Google Sheets Confirmation */}
      <ConfirmationModal
        isOpen={showSheetsConfirm}
        title="ส่งออกรายงานกิจกรรมสู่ Google Sheets"
        description="ระบบจะสร้างเอกสาร Google Spreadsheet ใหม่ พร้อมบันทึกรายการกิจกรรมการเรียนการสอนทั้งหมดตามเงื่อนไขปัจจุบัน"
        type="sheets"
        confirmLabel="ยืนยันส่งออก"
        isLoading={isExporting}
        details={[
          `จำนวนกิจกรรม: ${filteredActivities.length} รายการ`,
          'บริการ: Google Sheets API v4',
        ]}
        onConfirm={handleExportGoogleSheets}
        onCancel={() => setShowSheetsConfirm(false)}
      />
    </div>
  );
};

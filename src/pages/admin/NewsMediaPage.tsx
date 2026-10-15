import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MediaNews } from '../../types';
import { 
  Newspaper, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Clock, 
  X, 
  Calendar,
  Globe
} from 'lucide-react';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

export const NewsMediaPage: React.FC = () => {
  const { news, addNews, updateNews, deleteNews, currentRole } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNews, setSelectedNews] = useState<MediaNews | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'news' as MediaNews['category'],
    summary: '',
    content: '',
    imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
    publishedAt: new Date().toISOString().split('T')[0],
    status: 'published' as MediaNews['status'],
    author: 'กลุ่มงานประชาสัมพันธ์ บช.ตชด.',
  });

  const filteredNews = news.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      title: '',
      category: 'news',
      summary: '',
      content: '',
      imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
      publishedAt: new Date().toISOString().split('T')[0],
      status: 'published',
      author: 'กลุ่มงานประชาสัมพันธ์ บช.ตชด.',
    });
    setShowEditModal(true);
  };

  const handleOpenEdit = (item: MediaNews) => {
    setIsEditing(true);
    setSelectedNews(item);
    setFormData({
      title: item.title,
      category: item.category,
      summary: item.summary,
      content: item.content,
      imageUrl: item.imageUrl,
      publishedAt: item.publishedAt,
      status: item.status,
      author: item.author,
    });
    setShowEditModal(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && selectedNews) {
      updateNews(selectedNews.id, formData);
    } else {
      addNews(formData);
    }
    setShowEditModal(false);
  };

  const handleConfirmDelete = () => {
    if (targetDeleteId) {
      deleteNews(targetDeleteId);
      setTargetDeleteId(null);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#32145C] flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-[#5B2A86]" />
            <span>จัดการข่าวสารและคลังสื่อประชาสัมพันธ์</span>
          </h1>
          <p className="text-xs text-[#756B80]">
            ระบบจัดการเนื้อหา (CMS) เผยแพร่ข่าวสารและกิจกรรมโครงการ D.A.R.E. สู่เว็บไซต์สาธารณะ
          </p>
        </div>

        {(currentRole === 'central_admin' || currentRole === 'unit_admin') && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#211A2B] bg-[#D6B15E] hover:bg-[#c49f48] rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#32145C]" />
            <span>สร้างข่าวสารใหม่</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E0EF] shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#756B80]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาพาดหัวข่าว..."
            className="w-full pl-9 pr-3 py-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
          >
            <option value="all">ทุกสถานะการเผยแพร่</option>
            <option value="published">เผยแพร่แล้ว (Published)</option>
            <option value="draft">ฉบับร่าง (Draft)</option>
          </select>
        </div>
      </div>

      {/* Grid of News Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredNews.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-[#E7E0EF] shadow-2xs overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 bg-gray-100">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                <span className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold ${
                  item.status === 'published' ? 'bg-[#168A62] text-white' : 'bg-gray-700 text-white'
                }`}>
                  {item.status === 'published' ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}
                </span>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-[10px] text-[#756B80]">
                  <Calendar className="w-3.5 h-3.5 text-[#5B2A86]" />
                  <span>{item.publishedAt}</span>
                  <span>•</span>
                  <span>{item.author}</span>
                </div>
                <h4 className="text-xs font-bold text-[#211A2B] line-clamp-2">{item.title}</h4>
                <p className="text-[11px] text-[#756B80] line-clamp-2">{item.summary}</p>
              </div>
            </div>

            <div className="p-4 border-t border-[#E7E0EF] bg-[#F7F5FB] flex items-center justify-between text-xs">
              <span className="text-[#756B80] text-[10px]">ผู้เข้าชม {item.views} ครั้ง</span>
              {(currentRole === 'central_admin' || currentRole === 'unit_admin') && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    title="แก้ไข"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setTargetDeleteId(item.id);
                      setShowDeleteModal(true);
                    }}
                    className="p-1 text-red-500 hover:bg-red-100 rounded"
                    title="ลบ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit News Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E7E0EF]">
            <div className="p-5 border-b border-[#E7E0EF] flex items-center justify-between bg-[#F7F5FB]">
              <h3 className="text-sm font-bold text-[#32145C]">
                {isEditing ? 'แก้ไขข่าวสาร' : 'สร้างข่าวสารและสื่อประชาสัมพันธ์'}
              </h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#211A2B] block mb-1">พาดหัวข่าว</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">หมวดหมู่</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                  >
                    <option value="news">ข่าวประชาสัมพันธ์</option>
                    <option value="activity">กิจกรรมในสถานศึกษา</option>
                    <option value="knowledge">คลังความรู้</option>
                    <option value="announcement">ประกาศราชการ</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#211A2B] block mb-1">สถานะ</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                  >
                    <option value="published">เผยแพร่ทันที (Published)</option>
                    <option value="draft">ฉบับร่าง (Draft)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#211A2B] block mb-1">URL รูปภาพหน้าปก</label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-[#211A2B] block mb-1">บทคัดย่อสั้น</label>
                <textarea
                  rows={2}
                  required
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full p-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-[#211A2B] block mb-1">เนื้อหาฉบับเต็ม</label>
                <textarea
                  rows={4}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="ยืนยันการลบข่าวสาร"
        description="คุณต้องการลบข่าวประชาสัมพันธ์นี้ออกจากระบบใช่หรือไม่?"
        type="danger"
        confirmLabel="ยืนยันลบ"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

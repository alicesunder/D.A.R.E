import React, { useState } from 'react';
import { KNOWLEDGE_ARTICLES } from '../../data/mockData';
import { KnowledgeArticle } from '../../types';
import { 
  ShieldAlert, 
  Compass, 
  HeartHandshake, 
  AlertTriangle, 
  Clock, 
  BookOpen, 
  X, 
  Share2, 
  Printer, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const KnowledgeCenterPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeArticle, setActiveArticle] = useState<KnowledgeArticle | null>(null);

  const categories = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'refusal_skills', label: 'ทักษะการปฏิเสธ' },
    { id: 'decision_making', label: 'การตัดสินใจอย่างมีสติ' },
    { id: 'parent_guide', label: 'คู่มือผู้ปกครอง' },
    { id: 'drug_awareness', label: 'รู้ทันภัยยาเสพติด' },
  ];

  const filteredArticles = KNOWLEDGE_ARTICLES.filter((a) => {
    if (selectedCategory === 'all') return true;
    return a.category === selectedCategory;
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-[#5926B8]" />;
      case 'Compass':
        return <Compass className="w-5 h-5 text-blue-600" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-5 h-5 text-amber-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }
  };

  return (
    <div className="dare-public-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F2] text-[#5926B8] text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>D.A.R.E. Knowledge & Life Skills</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#171E5B]">
          คลังความรู้และการพัฒนาทักษะชีวิต
        </h1>
        <p className="text-sm text-[#64748B]">
          รวบรวมเทคนิคการสอน ทักษะการปฏิเสธ และข้อแนะนำการดูแลบุตรหลานสำหรับโรงเรียนและชุมชน
        </p>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === c.id
                ? 'bg-[#5926B8] text-white shadow-xs'
                : 'bg-white text-[#64748B] hover:bg-gray-100 border border-[#E5EAF5]'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Article Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredArticles.map((art) => (
          <div
            key={art.id}
            className="bg-white rounded-2xl p-6 border border-[#E5EAF5] shadow-2xs hover:shadow-md hover:border-[#E31837] transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-[#F7F9FF] border border-[#E5EAF5]">
                  {getIcon(art.iconName)}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#64748B]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>ใช้เวลาอ่าน {art.readTime}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-[#E31837] uppercase tracking-wider">
                  {art.categoryLabel}
                </span>
                <h3 className="text-base font-bold text-[#172554] mt-1">{art.title}</h3>
                <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                  {art.summary}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5EAF5] flex items-center justify-between">
              <span className="text-[11px] text-[#64748B]">
                กลุ่มเป้าหมาย: {art.targetAudience === 'students' ? 'นักเรียน' : art.targetAudience === 'parents' ? 'ผู้ปกครอง' : 'บุคคลทั่วไป'}
              </span>
              <button
                onClick={() => setActiveArticle(art)}
                className="text-xs font-semibold text-[#5926B8] hover:text-[#171E5B] flex items-center gap-1"
              >
                <span>อ่านเนื้อหาฉบับเต็ม</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Read Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#E5EAF5]">
            <div className="p-5 border-b border-[#E5EAF5] flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-[#5926B8]">{activeArticle.categoryLabel}</span>
                <h3 className="text-lg font-bold text-[#172554] mt-0.5">{activeArticle.title}</h3>
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-[#4A3B69] leading-relaxed whitespace-pre-line">
              {activeArticle.content}
            </div>

            <div className="p-4 bg-[#F7F9FF] border-t border-[#E5EAF5] flex items-center justify-between text-xs text-[#64748B]">
              <span>ศูนย์วิชาการ D.A.R.E. บช.ตชด.</span>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 text-[#5926B8] hover:underline"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>พิมพ์บทความ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

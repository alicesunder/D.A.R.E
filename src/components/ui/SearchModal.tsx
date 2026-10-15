import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, X, BookOpen, School, Calendar, ArrowRight } from 'lucide-react';
import { KNOWLEDGE_ARTICLES } from '../../data/mockData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { news, schools, activities } = useApp();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filteredNews = news.filter(n => n.title.toLowerCase().includes(query.toLowerCase())).slice(0, 3);
  const filteredSchools = schools.filter(s => s.name.toLowerCase().includes(query.toLowerCase())).slice(0, 3);
  const filteredKnowledge = KNOWLEDGE_ARTICLES.filter(k => k.title.toLowerCase().includes(query.toLowerCase())).slice(0, 3);

  const hasResults = query.trim() !== '' && (filteredNews.length > 0 || filteredSchools.length > 0 || filteredKnowledge.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#E7E0EF] overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#E7E0EF] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#5B2A86]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาข้อมูลหลักสูตร โรงเรียน ข่าวสาร หรือทักษะการปฏิเสธ..."
            className="w-full text-sm outline-hidden text-[#211A2B]"
          />
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4 text-xs">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-[#756B80]">
              พิมพ์คำค้นหาเพื่อค้นหาข้อมูลทั่วทั้งเว็บไซต์ D.A.R.E. บช.ตชด.
            </div>
          ) : !hasResults ? (
            <div className="py-8 text-center text-[#756B80]">
              ไม่พบผลลัพธ์ที่ตรงกับ "{query}"
            </div>
          ) : (
            <div className="space-y-4">
              {/* Knowledge Results */}
              {filteredKnowledge.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-[#5B2A86] uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    <span>คลังความรู้ & ทักษะชีวิต</span>
                  </div>
                  {filteredKnowledge.map(k => (
                    <div
                      key={k.id}
                      onClick={() => {
                        onClose();
                        onNavigate('knowledge');
                      }}
                      className="p-2.5 rounded-lg hover:bg-purple-50 cursor-pointer flex items-center justify-between"
                    >
                      <span className="font-bold text-[#211A2B]">{k.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}

              {/* Schools Results */}
              {filteredSchools.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
                    <School className="w-3 h-3" />
                    <span>โรงเรียนในโครงการ</span>
                  </div>
                  {filteredSchools.map(s => (
                    <div
                      key={s.id}
                      onClick={() => {
                        onClose();
                        onNavigate('schools');
                      }}
                      className="p-2.5 rounded-lg hover:bg-blue-50 cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-[#211A2B]">{s.name}</span>
                        <span className="text-[10px] text-gray-500 ml-2">จ.{s.province}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}

              {/* News Results */}
              {filteredNews.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>ข่าวสารและกิจกรรม</span>
                  </div>
                  {filteredNews.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        onClose();
                        onNavigate('news');
                      }}
                      className="p-2.5 rounded-lg hover:bg-emerald-50 cursor-pointer flex items-center justify-between"
                    >
                      <span className="font-bold text-[#211A2B] truncate max-w-md">{n.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

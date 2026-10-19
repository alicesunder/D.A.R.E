import React, { useState } from 'react';
import { BrandIdentity } from '../ui/Logos';
import { Search, Menu, X, Shield, ChevronRight, Lock } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onGoToAdmin: () => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onGoToAdmin,
  onOpenSearch,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'หน้าแรก' },
    { id: 'about', label: 'เกี่ยวกับ D.A.R.E.' },
    { id: 'activities', label: 'กิจกรรม' },
    { id: 'news', label: 'ข่าวสาร' },
    { id: 'knowledge', label: 'คลังความรู้' },
    { id: 'schools', label: 'โรงเรียน' },
    { id: 'contact', label: 'ติดต่อเรา' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 text-[#172554] shadow-[0_8px_30px_rgba(23,37,84,0.08)] border-b border-[#E5EAF5] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand */}
          <div 
            onClick={() => handleLinkClick('home')}
            className="cursor-pointer transition-transform hover:scale-[1.01]"
          >
            <BrandIdentity variant="light" />
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const active = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#FFE4E8] text-[#E31837] shadow-xs'
                      : 'text-[#334155] hover:text-[#E31837] hover:bg-[#FFF0F2]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#334155] hover:text-[#E31837] hover:bg-[#FFF0F2] rounded-lg transition-colors"
              title="ค้นหาข้อมูล"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Admin Login CTA */}
            <button
              onClick={onGoToAdmin}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#E31837] hover:bg-[#C8102E] rounded-lg shadow-sm transition-transform active:scale-95"
            >
              <Lock className="w-4 h-4 text-white" />
              <span>เข้าสู่ระบบเจ้าหน้าที่</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#334155] hover:text-[#E31837] rounded-lg"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#334155] hover:text-[#E31837] hover:bg-[#FFF0F2] rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-[#E5EAF5] shadow-lg px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between ${
                currentTab === link.id
                  ? 'bg-[#FFE4E8] text-[#E31837]'
                  : 'text-[#334155] hover:bg-[#FFF0F2]'
              }`}
            >
              <span>{link.label}</span>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>
          ))}
          <div className="pt-3 border-t border-[#E5EAF5]">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onGoToAdmin();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#E31837] hover:bg-[#C8102E] rounded-lg"
            >
              <Shield className="w-4 h-4 text-white" />
              <span>เข้าสู่ระบบศูนย์บัญชาการ (Admin)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

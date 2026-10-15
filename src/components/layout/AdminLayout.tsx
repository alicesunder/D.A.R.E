import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { BrandIdentity, DareLogo } from '../ui/Logos';
import { SidebarMascotCard } from '../ui/MascotArt';
import { 
  Home,
  HelpCircle,
  Building2,
  Users,
  BookOpen,
  Calendar,
  BarChart2,
  FolderOpen,
  Newspaper,
  PhoneCall,
  ChevronDown,
  Search,
  Bell,
  Globe,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';

interface AdminLayoutProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onReturnToPublic: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onNavigate,
  onReturnToPublic,
  children,
}) => {
  const { 
    currentUser, 
    currentRole, 
    switchRole, 
    resetDemoData,
    schools,
    personnel
  } = useApp();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchResults, setSearchResults] = useState<{ type: string; title: string; subtitle: string; tab: string }[]>([]);

  // 10 Exact Menu Items matching the user's mockup image
  const menuItems = [
    { 
      id: 'overview', 
      label: 'หน้าหลัก', 
      icon: Home,
      targetTab: 'overview'
    },
    { 
      id: 'about', 
      label: 'เกี่ยวกับโครงการ', 
      icon: HelpCircle,
      targetTab: 'about'
    },
    { 
      id: 'schools', 
      label: 'จัดการโรงเรียน', 
      icon: Building2,
      targetTab: 'hub-registry'
    },
    { 
      id: 'personnel', 
      label: 'ครู D.A.R.E.', 
      icon: Users,
      targetTab: 'hub-registry'
    },
    { 
      id: 'learning', 
      label: 'สื่อการเรียนรู้', 
      icon: BookOpen,
      targetTab: 'hub-governance'
    },
    { 
      id: 'activities', 
      label: 'กิจกรรม/โครงการ', 
      icon: Calendar,
      targetTab: 'hub-operations'
    },
    { 
      id: 'statistics', 
      label: 'รายงานสถิติ', 
      icon: BarChart2,
      targetTab: 'hub-governance'
    },
    { 
      id: 'media_vault', 
      label: 'คลังสื่อ', 
      icon: FolderOpen,
      targetTab: 'hub-governance'
    },
    { 
      id: 'news', 
      label: 'ข่าวสาร', 
      icon: Newspaper,
      targetTab: 'hub-governance'
    },
    { 
      id: 'contact', 
      label: 'ติดต่อเรา', 
      icon: PhoneCall,
      targetTab: 'contact'
    },
  ];

  const roleLabels: Record<UserRole, { label: string; badge: string }> = {
    central_admin: { label: 'ผู้ดูแลระบบส่วนกลาง (บช.ตชด.)', badge: 'bg-purple-100 text-purple-900 border-purple-300' },
    unit_admin: { label: 'ผู้ดูแลระดับหน่วย (กก.ตชด.)', badge: 'bg-blue-100 text-blue-900 border-blue-300' },
    dare_instructor: { label: 'ครู D.A.R.E. ผู้ปฏิบัติงาน', badge: 'bg-amber-100 text-amber-900 border-amber-300' },
    report_viewer: { label: 'ผู้ตรวจการ/ดูรายงาน', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  };

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.targetTab === 'about') {
      onReturnToPublic();
      window.location.hash = '#/about';
    } else if (item.targetTab === 'contact') {
      onReturnToPublic();
      window.location.hash = '#/contact';
    } else {
      onNavigate(item.targetTab);
    }
    setMobileSidebarOpen(false);
  };

  const isMenuItemActive = (item: typeof menuItems[0]) => {
    if (item.id === 'overview' && (currentTab === 'overview' || currentTab === 'hub-overview')) return true;
    if (item.id === 'schools' && currentTab === 'hub-registry') return true;
    if (item.id === 'personnel' && currentTab === 'hub-assignment') return true;
    if (item.id === 'activities' && currentTab === 'hub-operations') return true;
    if ((item.id === 'statistics' || item.id === 'learning' || item.id === 'media_vault' || item.id === 'news') && currentTab === 'hub-governance') return true;
    return currentTab === item.targetTab;
  };

  // Live Search handler in top bar
  const handleSearch = (query: string) => {
    setGlobalSearch(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const q = query.toLowerCase();
    const matchSchools = schools
      .filter(s => s.name.toLowerCase().includes(q) || s.province.toLowerCase().includes(q))
      .slice(0, 3)
      .map(s => ({ type: 'โรงเรียน', title: s.name, subtitle: `อ.${s.district} จ.${s.province}`, tab: 'hub-registry' }));
    
    const matchPersonnel = personnel
      .filter(p => `${p.rank} ${p.firstName} ${p.lastName}`.toLowerCase().includes(q) || p.policeId.includes(q))
      .slice(0, 3)
      .map(p => ({ type: 'ครู D.A.R.E.', title: `${p.rank} ${p.firstName} ${p.lastName}`, subtitle: p.organizationName, tab: 'hub-registry' }));
    
    setSearchResults([...matchSchools, ...matchPersonnel]);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FD] flex flex-col font-sans text-[#1E293B]">
      {/* Top Demo Notification Strip */}
      <div className="bg-[#180A33] text-[#FFE082] px-4 py-1 text-[11px] font-medium flex items-center justify-between border-b border-purple-900/60 z-50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span>ระบบบริหารจัดการโครงการ D.A.R.E. Thailand กองบัญชาการตำรวจตระเวนชายแดน (สภาพแวดล้อมจำลอง)</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-purple-200 text-[10px]">
          <button 
            onClick={resetDemoData}
            className="flex items-center gap-1 hover:text-white transition-colors underline"
          >
            <RefreshCw className="w-2.5 h-2.5" />
            <span>คืนค่าข้อมูลจำลอง</span>
          </button>
          <span>|</span>
          <button onClick={onReturnToPublic} className="hover:text-white flex items-center gap-1">
            <Globe className="w-2.5 h-2.5 text-[#D6B15E]" />
            <span>หน้าเว็บสาธารณะ</span>
          </button>
        </div>
      </div>

      {/* Main Container (Sidebar + Content Viewport) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Left Sidebar (Matching Mockup 10 Items + Mascot) */}
        <aside className="hidden md:flex flex-col w-60 bg-[#160B2E] text-white shrink-0 border-r border-purple-900/40 select-none overflow-y-auto">
          {/* Top Brand Logo */}
          <div className="p-4 border-b border-purple-900/40 flex items-center justify-center">
            <DareLogo className="h-10" />
          </div>

          {/* 10 Navigation Items */}
          <div className="py-4 px-3 space-y-1.5 flex-1">
            {menuItems.map((item) => {
              const active = isMenuItemActive(item);
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                    active
                      ? 'bg-[#6D28D9] text-white shadow-md shadow-purple-900/50'
                      : 'text-purple-200/80 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-purple-300'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom Mascot Card: ครูช้าง ตชด. + GOOD CHOICES BRIGHTER FUTURE */}
          <SidebarMascotCard />
        </aside>

        {/* Mobile Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative w-72 bg-[#160B2E] text-white flex flex-col h-full shadow-2xl z-10 overflow-y-auto">
              <div className="p-4 border-b border-purple-900 flex items-center justify-between">
                <DareLogo className="h-9" />
                <button onClick={() => setMobileSidebarOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-3 px-3 space-y-1 flex-1">
                {menuItems.map((item) => {
                  const active = isMenuItemActive(item);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMenuClick(item)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                        active ? 'bg-[#6D28D9] text-white' : 'text-purple-200/80 hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <SidebarMascotCard />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar matching Mockup */}
          <header className="h-18 bg-white border-b border-[#E7E0EF] shadow-2xs px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
            {/* Left: Mobile Toggle & Official Title */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="md:hidden p-2 text-[#64748B] hover:text-[#1E293B] rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-black text-[#1E1B4B] truncate leading-tight">
                  โครงการการศึกษา
                </div>
                <div className="text-[10px] sm:text-xs text-[#64748B] truncate font-medium">
                  เพื่อต่อต้านการใช้ยาเสพติดในเด็กนักเรียน ประเทศไทย
                </div>
              </div>
            </div>

            {/* Center: Large Interactive Search Bar */}
            <div className="hidden md:block relative max-w-md w-full mx-6">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3" />
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="ค้นหาโรงเรียน ครู D.A.R.E. สื่อการสอน ..."
                  className="w-full pl-11 pr-4 py-2.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-full focus:outline-none focus:bg-white focus:border-[#7C3AED] transition-all shadow-inner"
                />
              </div>

              {/* Search dropdown results */}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 space-y-1">
                  <div className="text-[10px] font-bold text-gray-400 px-3 py-1 uppercase tracking-wider">
                    ผลการค้นหา
                  </div>
                  {searchResults.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        onNavigate(item.tab);
                        setGlobalSearch('');
                        setSearchResults([]);
                      }}
                      className="p-2 rounded-xl hover:bg-purple-50 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#1E293B]">{item.title}</div>
                        <div className="text-[10px] text-gray-500">{item.subtitle}</div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {item.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Notifications & Profile Pill */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Notification Bell with Badge 3 */}
              <div className="relative">
                <button
                  onClick={() => setShowNotificationModal(!showNotificationModal)}
                  className="w-10 h-10 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] flex items-center justify-center text-[#475569] transition-colors relative"
                  title="การแจ้งเตือน"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    3
                  </span>
                </button>

                {/* Notifications Popup */}
                {showNotificationModal && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50 text-xs space-y-2">
                    <div className="font-bold text-[#1E293B] border-b pb-2 flex items-center justify-between">
                      <span>การแจ้งเตือนล่าสุด</span>
                      <span className="text-[10px] text-[#7C3AED] font-semibold">3 รายการ</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="p-2 rounded-xl bg-purple-50/60 text-[11px] text-[#32145C]">
                        <span className="font-bold block">บันทึกการสอนใหม่</span>
                        รร.ตชด.บ้านปิล๊อกคี่ ส่งรายงานบทเรียนที่ 3
                      </div>
                      <div className="p-2 rounded-xl bg-blue-50/60 text-[11px] text-[#1E3A8A]">
                        <span className="font-bold block">คำสั่งมอบหมายครู</span>
                        ร.ต.อ. ธนากร ได้รับมอบหมายดูแล 2 โรงเรียน
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-50/60 text-[11px] text-[#065F46]">
                        <span className="font-bold block">ซิงค์ Google Sheets</span>
                        รายงานยอดนักเรียน 412,600 คน อัปเดตแล้ว
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Pill matching Mockup: "ครู ตชด. ผู้ดูแลระบบ" */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#E2E8F0] transition-colors"
                >
                  {/* Police Avatar with Beret */}
                  <div className="w-8 h-8 rounded-full bg-[#1E1B4B] border-2 border-[#D6B15E] flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden shadow-xs">
                    👮‍♂️
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-[#1E1B4B] leading-tight">ครู ตชด.</div>
                    <div className="text-[10px] text-[#64748B] leading-tight">ผู้ดูแลระบบ</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {/* Profile & Role Switcher Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="font-bold text-[#1E1B4B]">{currentUser.name}</div>
                      <div className="text-[10px] text-[#D6B15E] font-semibold">{currentUser.organizationName}</div>
                    </div>

                    <div className="px-3 py-2 border-b border-gray-100 space-y-1">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
                        สลับบทบาทผู้ใช้ (RBAC)
                      </div>
                      {(['central_admin', 'unit_admin', 'dare_instructor', 'report_viewer'] as UserRole[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => {
                            switchRole(r);
                            setShowProfileMenu(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                            currentRole === r ? 'bg-purple-50 text-[#7C3AED] font-bold' : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span>{roleLabels[r].label}</span>
                          {currentRole === r && <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />}
                        </button>
                      ))}
                    </div>

                    <div className="px-2 pt-1">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onReturnToPublic();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-gray-700 hover:bg-purple-50 flex items-center gap-2"
                      >
                        <Globe className="w-4 h-4 text-[#7C3AED]" />
                        <span>กลับไปหน้าเว็บไซต์สาธารณะ</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Viewport Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

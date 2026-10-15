import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { BrandIdentity } from '../ui/Logos';
import { 
  LayoutDashboard, 
  Network, 
  Users, 
  GraduationCap, 
  UserCheck, 
  Calendar, 
  Activity as ActivityIcon, 
  FileText, 
  BarChart3, 
  Newspaper, 
  ShieldCheck, 
  History, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Globe, 
  LogOut, 
  AlertCircle, 
  FileSpreadsheet, 
  Menu, 
  X,
  Bell,
  RefreshCw,
  User as UserIcon
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
    googleUser, 
    isLoggingIn, 
    handleGoogleSignIn, 
    handleGoogleSignOut,
    resetDemoData
  } = useApp();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const menuItems = [
    { id: 'overview', label: '1. ภาพรวมระบบ', icon: LayoutDashboard },
    { id: 'organization', label: '2. โครงสร้างหน่วยงาน', icon: Network },
    { id: 'personnel', label: '3. ทำเนียบครู D.A.R.E.', icon: Users },
    { id: 'schools', label: '4. ทะเบียนโรงเรียน', icon: GraduationCap },
    { id: 'assignments', label: '5. การมอบหมายครู', icon: UserCheck },
    { id: 'calendar', label: '6. ปฏิทินกิจกรรม', icon: Calendar },
    { id: 'activities', label: '7. จัดการกิจกรรม', icon: ActivityIcon },
    { id: 'reports', label: '8. รายงานผลการปฏิบัติงาน', icon: FileText },
    { id: 'statistics', label: '9. สถิติและการวิเคราะห์', icon: BarChart3 },
    { id: 'news', label: '10. ข่าวสารและคลังสื่อ', icon: Newspaper },
    { id: 'users', label: '11. ผู้ใช้งานและสิทธิ์', icon: ShieldCheck },
    { id: 'audit', label: '12. ประวัติการใช้งาน', icon: History },
    { id: 'settings', label: '13. ตั้งค่าระบบ', icon: Settings },
  ];

  const roleLabels: Record<UserRole, { label: string; badge: string }> = {
    central_admin: { label: 'ผู้ดูแลระบบส่วนกลาง (บช.ตชด.)', badge: 'bg-purple-100 text-purple-900 border-purple-300' },
    unit_admin: { label: 'ผู้ดูแลระดับหน่วย (กก.ตชด.)', badge: 'bg-blue-100 text-blue-900 border-blue-300' },
    dare_instructor: { label: 'ครู D.A.R.E. ผู้ปฏิบัติงาน', badge: 'bg-amber-100 text-amber-900 border-amber-300' },
    report_viewer: { label: 'ผู้ตรวจการ/ดูรายงาน', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  };

  const handleMenuClick = (id: string) => {
    onNavigate(id);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F5FB] flex flex-col font-sans">
      {/* Top Demo Banner */}
      <div className="bg-[#32145C] text-[#FFE082] px-4 py-1.5 text-xs font-medium flex items-center justify-between border-b border-[#D6B15E]/40 z-50">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <AlertCircle className="w-4 h-4 text-[#D6B15E] shrink-0" />
          <span>โหมดสาธิต — ข้อมูลทั้งหมดเป็นข้อมูลสมมติ ไม่ใช่ข้อมูลราชการจริง (D.A.R.E. Simulation Environment)</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[11px] text-purple-200">
          <button 
            onClick={resetDemoData}
            className="flex items-center gap-1 hover:text-white transition-colors underline"
          >
            <RefreshCw className="w-3 h-3" />
            <span>คืนค่าข้อมูลเริ่มต้น</span>
          </button>
          <span className="text-purple-400">|</span>
          <span className="font-mono">v1.2.0-STABLE</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:flex flex-col bg-[#210B3B] text-purple-200 transition-all duration-200 z-30 border-r border-[#5B2A86]/40 select-none ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Sidebar Header Brand */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-[#5B2A86]/50">
            {!sidebarCollapsed ? (
              <BrandIdentity variant="light" subtitle={false} />
            ) : (
              <div className="mx-auto">
                <span className="font-extrabold text-[#D6B15E] text-base">D.A.R.E.</span>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 text-purple-300 hover:text-white hover:bg-[#5B2A86]/50 rounded-lg transition-colors"
              title={sidebarCollapsed ? "ขยายแถบเมนู" : "ย่อแถบเมนู"}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Current User Quick Info */}
          <div className="p-3 border-b border-purple-900/40 bg-[#1A0730]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#5B2A86] border border-[#D6B15E] flex items-center justify-center font-bold text-white shrink-0">
                {currentUser.rank.slice(0, 2)}
              </div>
              {!sidebarCollapsed && (
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-[#D6B15E] truncate">{currentUser.organizationName}</div>
                </div>
              )}
            </div>
          </div>

          {/* Nav List */}
          <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
            {menuItems.map((item) => {
              const active = currentTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-[#5B2A86] text-white shadow-xs font-semibold border-l-4 border-[#D6B15E]'
                      : 'text-purple-200 hover:text-white hover:bg-[#5B2A86]/30'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#D6B15E]' : 'text-purple-300'}`} />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer Link to Public Site */}
          <div className="p-3 border-t border-purple-900/40">
            <button
              onClick={onReturnToPublic}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-purple-200 hover:text-white hover:bg-[#5B2A86]/40 transition-colors ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
            >
              <Globe className="w-4 h-4 text-[#D6B15E]" />
              {!sidebarCollapsed && <span>ไปหน้าเว็บสาธารณะ</span>}
            </button>
          </div>
        </aside>

        {/* Mobile Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative w-72 bg-[#210B3B] text-purple-100 flex flex-col h-full shadow-2xl z-10">
              <div className="h-16 flex items-center justify-between px-4 border-b border-[#5B2A86]">
                <BrandIdentity variant="light" />
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 text-purple-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
                {menuItems.map((item) => {
                  const active = currentTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMenuClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium ${
                        active
                          ? 'bg-[#5B2A86] text-white border-l-4 border-[#D6B15E]'
                          : 'text-purple-200 hover:bg-[#5B2A86]/30'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#D6B15E]' : 'text-purple-300'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="p-4 border-t border-purple-900/40">
                <button
                  onClick={() => {
                    setMobileSidebarOpen(false);
                    onReturnToPublic();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-[#5B2A86] rounded-lg"
                >
                  <Globe className="w-4 h-4 text-[#D6B15E]" />
                  <span>ไปหน้าเว็บสาธารณะ</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Admin Header */}
          <header className="h-16 bg-white border-b border-[#E7E0EF] shadow-xs px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
            {/* Left: Mobile Toggle & Page Title Indicator */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="md:hidden p-2 text-[#756B80] hover:text-[#211A2B] rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#32145C] flex items-center gap-2">
                  <span>D.A.R.E. Command Center</span>
                  <span className="hidden sm:inline-block text-xs font-normal text-[#756B80]">
                    | {menuItems.find(m => m.id === currentTab)?.label || 'แผงควบคุม'}
                  </span>
                </h2>
              </div>
            </div>

            {/* Right: Role Switcher & Google Sheets Auth */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Role Switcher Pill */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${roleLabels[currentRole].badge}`}
                  title="คลิกเพื่อสลับบทบาทผู้ใช้งาน (RBAC Testing)"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">{roleLabels[currentRole].label}</span>
                  <span className="lg:hidden">{currentRole === 'central_admin' ? 'ส่วนกลาง' : currentRole === 'unit_admin' ? 'หน่วย' : 'ครู'}</span>
                </button>

                {showRoleMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#E7E0EF] py-2 z-50 animate-in fade-in duration-100">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-[#756B80] uppercase tracking-wider border-b border-gray-100">
                      ทดสอบสิทธิ์ผู้ใช้งาน (RBAC)
                    </div>
                    {(['central_admin', 'unit_admin', 'dare_instructor', 'report_viewer'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          switchRole(r);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-purple-50 transition-colors ${
                          currentRole === r ? 'font-bold text-[#5B2A86] bg-purple-50/70' : 'text-[#211A2B]'
                        }`}
                      >
                        <span>{roleLabels[r].label}</span>
                        {currentRole === r && <span className="w-2 h-2 rounded-full bg-[#5B2A86]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Google Workspace Connection Pill (MANDATORY Google Workspace skill style) */}
              {googleUser ? (
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1.5 rounded-lg text-xs">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="hidden sm:inline font-medium truncate max-w-[120px]">
                    {googleUser.email || 'Sheets เชื่อมต่อแล้ว'}
                  </span>
                  <button
                    onClick={handleGoogleSignOut}
                    className="ml-1 text-emerald-600 hover:text-emerald-900"
                    title="ออกจากระบบ Google"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoggingIn}
                  className="flex items-center gap-1.5 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 px-2.5 py-1.5 rounded-lg text-xs font-medium shadow-2xs transition-all"
                  title="เชื่อมต่อ Google Sheets เพื่อส่งออกข้อมูล"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span className="hidden sm:inline">{isLoggingIn ? 'กำลังเชื่อมต่อ...' : 'เชื่อมต่อ Google Sheets'}</span>
                  <span className="sm:hidden">Sheets</span>
                </button>
              )}

              {/* Public Website Button */}
              <button
                onClick={onReturnToPublic}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5B2A86] hover:bg-purple-50 border border-[#E7E0EF] rounded-lg transition-colors"
                title="เปิดหน้าเว็บไซต์สาธารณะ"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>หน้าสาธารณะ</span>
              </button>
            </div>
          </header>

          {/* Content Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

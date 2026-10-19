import React, { Suspense, lazy, useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AdminLayout } from './components/layout/AdminLayout';
import { SearchModal } from './components/ui/SearchModal';
import { PlayfulDecor } from './components/ui/PlayfulDecor';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { KnowledgeCenterPage } from './pages/public/KnowledgeCenterPage';
import { PublicActivitiesPage } from './pages/public/PublicActivitiesPage';
import { SchoolDirectoryPage } from './pages/public/SchoolDirectoryPage';
import { ContactPage } from './pages/public/ContactPage';

// Admin Views & Hubs (lazy-loaded: public visitors no longer download the whole admin UI)
const named = <T extends Record<string, any>, K extends keyof T>(loader: () => Promise<T>, key: K) =>
  lazy(() => loader().then(m => ({ default: m[key] as React.ComponentType<any> })));
const DareNewDashboard = named(() => import('./pages/admin/DareNewDashboard'), 'DareNewDashboard');
const Hub2Registry = named(() => import('./pages/admin/Hub2Registry'), 'Hub2Registry');
const Hub3Assignment = named(() => import('./pages/admin/Hub3Assignment'), 'Hub3Assignment');
const Hub4Operations = named(() => import('./pages/admin/Hub4Operations'), 'Hub4Operations');
const Hub5Governance = named(() => import('./pages/admin/Hub5Governance'), 'Hub5Governance');
const TeacherWorkspacePage = named(() => import('./pages/admin/TeacherWorkspacePage'), 'TeacherWorkspacePage');
const ReportReviewPage = named(() => import('./pages/admin/ReportReviewPage'), 'ReportReviewPage');
const RegistryImportPage = named(() => import('./pages/admin/RegistryImportPage'), 'RegistryImportPage');
const TeacherLeaderboardPage = named(() => import('./pages/admin/TeacherLeaderboardPage'), 'TeacherLeaderboardPage');

const PUBLIC_TABS = ['home', 'about', 'activities', 'news', 'knowledge', 'schools', 'contact'];
const ADMIN_TABS = ['overview', 'hub-overview', 'teaching', 'leaderboard', 'report-review', 'registry-import', 'hub-registry', 'personnel', 'schools',
  'organization', 'hub-assignment', 'assignments', 'hub-operations', 'calendar', 'activities', 'hub-governance', 'reports',
  'statistics', 'news', 'learning', 'media_vault', 'users', 'audit', 'settings'];

/** Single source of truth for reading the URL hash (also used for the first render, so deep links and refresh work). */
function parseHash(hash: string): { mode: 'public' | 'admin'; tab: string } {
  if (hash.startsWith('#/admin')) {
    const tab = hash.replace('#/admin', '').replace(/^\//, '').split('?')[0] || 'overview';
    return { mode: 'admin', tab: ADMIN_TABS.includes(tab) ? tab : 'overview' };
  }
  const tab = hash.replace(/^#\/?/, '').split('?')[0] || 'home';
  return { mode: 'public', tab: PUBLIC_TABS.includes(tab) ? tab : 'home' };
}

function AppContent() {
  // Navigation State
  // Mode: 'public' | 'admin'
  const initial = parseHash(window.location.hash);
  const [viewMode, setViewMode] = useState<'public' | 'admin'>(initial.mode);
  const [publicTab, setPublicTab] = useState<string>(initial.mode === 'public' ? initial.tab : 'home');
  const [adminTab, setAdminTab] = useState<string>(initial.mode === 'admin' ? initial.tab : 'overview');
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Sync hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const { mode, tab } = parseHash(window.location.hash);
      setViewMode(mode);
      // Empty hash (browser Back to "#/") now resets to home / overview instead of keeping the stale tab.
      if (mode === 'admin') setAdminTab(tab); else setPublicTab(tab);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigatePublic = (tab: string) => {
    setPublicTab(tab);
    window.location.hash = `#/${tab === 'home' ? '' : tab}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateAdmin = (tab: string) => {
    setAdminTab(tab);
    window.location.hash = `#/admin/${tab === 'overview' ? '' : tab}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToAdmin = () => {
    setViewMode('admin');
    window.location.hash = '#/admin';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const returnToPublic = () => {
    setViewMode('public');
    window.location.hash = '#/';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {viewMode === 'public' ? (
        <div className="dare-playful min-h-screen flex flex-col">
          <PlayfulDecor />
          {publicTab !== 'home' && (
            <Navbar
              currentTab={publicTab}
              onNavigate={navigatePublic}
              onGoToAdmin={goToAdmin}
              onOpenSearch={() => setSearchModalOpen(true)}
            />
          )}

          <main className={publicTab === 'home' ? 'flex-1' : 'flex-1'}>
            {publicTab === 'home' && (
              <HomePage
                onNavigate={navigatePublic}
                onGoToAdmin={goToAdmin}
                onSelectActivity={() => navigatePublic('activities')}
                onSelectNews={() => navigatePublic('activities')}
              />
            )}
            {publicTab === 'about' && <AboutPage onNavigate={navigatePublic} />}
            {publicTab === 'activities' && <PublicActivitiesPage />}
            {publicTab === 'news' && <HomePage onNavigate={navigatePublic} onGoToAdmin={goToAdmin} onSelectActivity={() => {}} onSelectNews={() => {}} />}
            {publicTab === 'knowledge' && <KnowledgeCenterPage />}
            {publicTab === 'schools' && <SchoolDirectoryPage />}
            {publicTab === 'contact' && <ContactPage />}
          </main>

          {publicTab !== 'home' && <Footer onNavigate={navigatePublic} />}

          <SearchModal
            isOpen={searchModalOpen}
            onClose={() => setSearchModalOpen(false)}
            onNavigate={navigatePublic}
          />
        </div>
      ) : (
        <AdminLayout
          currentTab={adminTab}
          onNavigate={navigateAdmin}
          onReturnToPublic={returnToPublic}
        >
          <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500" role="status">กำลังโหลด…</div>}>
          {adminTab === 'teaching' && <TeacherWorkspacePage />}
          {adminTab === 'leaderboard' && <TeacherLeaderboardPage />}
          {adminTab === 'report-review' && <ReportReviewPage />}
          {adminTab === 'registry-import' && <RegistryImportPage />}
          {(adminTab === 'overview' || adminTab === 'hub-overview') && (
            <DareNewDashboard onNavigateHub={navigateAdmin} />
          )}
          {(adminTab === 'hub-registry' || adminTab === 'personnel' || adminTab === 'schools' || adminTab === 'organization') && (
            <Hub2Registry initialTab={adminTab === 'schools' ? 'schools' : adminTab === 'organization' ? 'units' : 'personnel'} />
          )}
          {(adminTab === 'hub-assignment' || adminTab === 'assignments') && (
            <Hub3Assignment />
          )}
          {(adminTab === 'hub-operations' || adminTab === 'calendar' || adminTab === 'activities') && (
            <Hub4Operations />
          )}
          {(adminTab === 'hub-governance' || adminTab === 'reports' || adminTab === 'statistics' || adminTab === 'news' || adminTab === 'learning' || adminTab === 'media_vault' || adminTab === 'users' || adminTab === 'audit' || adminTab === 'settings') && (
            <Hub5Governance initialTab={adminTab === 'news' ? 'news' : adminTab === 'learning' ? 'learning' : adminTab === 'media_vault' ? 'media_vault' : adminTab === 'users' || adminTab === 'settings' ? 'rbac' : adminTab === 'audit' ? 'audit' : 'reports'} />
          )}
          </Suspense>
        </AdminLayout>
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

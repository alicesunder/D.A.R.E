import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AdminLayout } from './components/layout/AdminLayout';
import { SearchModal } from './components/ui/SearchModal';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { KnowledgeCenterPage } from './pages/public/KnowledgeCenterPage';
import { PublicActivitiesPage } from './pages/public/PublicActivitiesPage';
import { SchoolDirectoryPage } from './pages/public/SchoolDirectoryPage';
import { ContactPage } from './pages/public/ContactPage';

// Admin Views & Hubs
import { DareNewDashboard } from './pages/admin/DareNewDashboard';
import { Hub1Overview } from './pages/admin/Hub1Overview';
import { Hub2Registry } from './pages/admin/Hub2Registry';
import { Hub3Assignment } from './pages/admin/Hub3Assignment';
import { Hub4Operations } from './pages/admin/Hub4Operations';
import { Hub5Governance } from './pages/admin/Hub5Governance';

function AppContent() {
  // Navigation State
  // Mode: 'public' | 'admin'
  const [viewMode, setViewMode] = useState<'public' | 'admin'>(() => {
    return window.location.hash.startsWith('#/admin') ? 'admin' : 'public';
  });

  const [publicTab, setPublicTab] = useState<string>('home');
  const [adminTab, setAdminTab] = useState<string>('overview');
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Sync hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/admin')) {
        setViewMode('admin');
        const tab = hash.replace('#/admin/', '').replace('#/admin', '');
        if (tab) setAdminTab(tab);
      } else {
        setViewMode('public');
        const tab = hash.replace('#/', '').replace('#', '');
        if (tab) setPublicTab(tab);
      }
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
        <div className="min-h-screen flex flex-col bg-[#F7F5FB]">
          <Navbar
            currentTab={publicTab}
            onNavigate={navigatePublic}
            onGoToAdmin={goToAdmin}
            onOpenSearch={() => setSearchModalOpen(true)}
          />

          <main className="flex-1">
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

          <Footer onNavigate={navigatePublic} />

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

import React, { useState, useEffect, useCallback } from 'react';
import { InteriorProject } from './types/project';
import { loadProjects, saveProjects, resetProjects } from './utils/storage';
import {
  supabase,
  getCurrentSessionUser,
  signOutUser,
  fetchProjectsFromSupabase,
  saveProjectToSupabase,
  deleteProjectFromSupabase,
  subscribeToProjectsRealtime
} from './lib/supabase';
import { User } from '@supabase/supabase-js';
import { Navbar } from './components/Navbar';
import { CalendarView } from './components/CalendarView';
import { ProjectsListView } from './components/ProjectsListView';
import { ProjectQuickModal } from './components/ProjectQuickModal';
import { ProjectDetailScreen, DetailTab } from './components/ProjectDetailScreen';
import { ProjectFormModal } from './components/ProjectFormModal';
import { LeftSidebarBanner } from './components/LeftSidebarBanner';
import { LoginScreen } from './components/LoginScreen';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);

  const [projects, setProjects] = useState<InteriorProject[]>([]);
  const [currentView, setCurrentView] = useState<'calendar' | 'list'>('calendar');
  const [isLeftBannerOpen, setIsLeftBannerOpen] = useState<boolean>(true);
  
  // Quick Info Modal state
  const [quickModalProject, setQuickModalProject] = useState<InteriorProject | null>(null);

  // Fullscreen Detailed Management Screen state
  const [detailProject, setDetailProject] = useState<InteriorProject | null>(null);
  const [detailDefaultTab, setDetailDefaultTab] = useState<DetailTab>('measurement');

  // Create / Edit Project Modal state
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<InteriorProject | null>(null);
  const [defaultStartDate, setDefaultStartDate] = useState<string>('2026-10-22');

  // 1. Initialize Supabase Auth Session
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const sessionUser = await getCurrentSessionUser();
        if (mounted) {
          setUser(sessionUser);
          setAuthChecking(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) setAuthChecking(false);
      }
    }

    initAuth();

    // Listen to Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user || null);
        if (session?.user) {
          setIsGuestMode(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 2. Load Projects from Supabase DB (with localStorage fallback)
  const loadAllProjects = useCallback(async () => {
    try {
      const dbProjects = await fetchProjectsFromSupabase();
      if (dbProjects && dbProjects.length > 0) {
        setProjects(dbProjects);
      } else {
        const local = loadProjects();
        setProjects(local);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
      const local = loadProjects();
      setProjects(local);
    }
  }, []);

  useEffect(() => {
    if (user || isGuestMode) {
      loadAllProjects();
    }
  }, [user, isGuestMode, loadAllProjects]);

  // 3. Supabase Realtime Subscription Listener for multi-user instant updates
  useEffect(() => {
    if (!user && !isGuestMode) return;

    const unsubscribe = subscribeToProjectsRealtime(() => {
      console.log('Realtime DB change detected. Refreshing projects...');
      loadAllProjects();
    });

    return () => {
      unsubscribe();
    };
  }, [user, isGuestMode, loadAllProjects]);

  // Save / Update Project List helper
  const handleUpdateProjectsList = async (newProjects: InteriorProject[]) => {
    setProjects(newProjects);
    saveProjects(newProjects);
  };

  const handleSelectProjectOnCalendar = (project: InteriorProject) => {
    setQuickModalProject(project);
  };

  const handleNavigateToDetail = (project: InteriorProject, tab: DetailTab = 'measurement') => {
    setQuickModalProject(null);
    setDetailProject(project);
    setDetailDefaultTab(tab);
  };

  const handleOpenNewProject = (startDateStr = '2026-10-22') => {
    setEditingProject(null);
    setDefaultStartDate(startDateStr);
    setShowFormModal(true);
  };

  const handleEditBasicInfo = (project: InteriorProject) => {
    setQuickModalProject(null);
    setEditingProject(project);
    setShowFormModal(true);
  };

  const handleSaveProjectForm = async (savedProject: InteriorProject) => {
    let updated: InteriorProject[];
    const exists = projects.some(p => p.id === savedProject.id);
    if (exists) {
      updated = projects.map(p => (p.id === savedProject.id ? savedProject : p));
    } else {
      updated = [savedProject, ...projects];
    }

    // Sync to local state & storage
    handleUpdateProjectsList(updated);

    // Sync to Supabase DB asynchronously
    await saveProjectToSupabase(savedProject);

    // If detail view was open for this project, sync it
    if (detailProject && detailProject.id === savedProject.id) {
      setDetailProject(savedProject);
    }
  };

  const handleUpdateProjectDetail = async (updatedProject: InteriorProject) => {
    const updated = projects.map(p => (p.id === updatedProject.id ? updatedProject : p));
    handleUpdateProjectsList(updated);
    setDetailProject(updatedProject);

    // Sync to Supabase DB asynchronously
    await saveProjectToSupabase(updatedProject);
  };

  const handleDeleteProject = async (projectId: string) => {
    const updated = projects.filter(p => p.id !== projectId);
    handleUpdateProjectsList(updated);

    // Delete from Supabase DB asynchronously
    await deleteProjectFromSupabase(projectId);

    if (quickModalProject && quickModalProject.id === projectId) {
      setQuickModalProject(null);
    }
    if (detailProject && detailProject.id === projectId) {
      setDetailProject(null);
    }
    if (editingProject && editingProject.id === projectId) {
      setShowFormModal(false);
      setEditingProject(null);
    }
  };

  const handleResetData = async () => {
    const reset = resetProjects();
    setProjects(reset);
    setQuickModalProject(null);
    setDetailProject(null);

    // Upsert reset projects to Supabase DB as well
    for (const proj of reset) {
      await saveProjectToSupabase(proj);
    }
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(projects, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `interior_projects_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleLogout = async () => {
    await signOutUser();
    setUser(null);
    setIsGuestMode(false);
  };

  // Loading spinner while checking initial session
  if (authChecking) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col justify-center items-center text-white">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium text-neutral-300">사용자 인증 확인 중...</p>
      </div>
    );
  }

  // Gate app access behind Google Auth Login
  if (!user && !isGuestMode) {
    return <LoginScreen onBypassLogin={() => setIsGuestMode(true)} />;
  }

  // Render Fullscreen Project Detail View
  if (detailProject) {
    return (
      <ProjectDetailScreen
        project={detailProject}
        initialTab={detailDefaultTab}
        onBack={() => setDetailProject(null)}
        onUpdateProject={handleUpdateProjectDetail}
        onDeleteProject={handleDeleteProject}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col text-neutral-900 font-sans antialiased">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenNewProject={() => handleOpenNewProject()}
        onResetData={handleResetData}
        onExportData={handleExportData}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main View Area with Left Operations Banner */}
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebarBanner
          projects={projects}
          onNavigateToProjectAS={proj => handleNavigateToDetail(proj, 'defects')}
          isOpen={isLeftBannerOpen}
          onToggle={() => setIsLeftBannerOpen(!isLeftBannerOpen)}
        />

        <main className="flex-1 overflow-y-auto pb-12">
          {currentView === 'calendar' ? (
            <CalendarView
              projects={projects}
              onSelectProject={handleSelectProjectOnCalendar}
              onAddNewProject={handleOpenNewProject}
            />
          ) : (
            <ProjectsListView
              projects={projects}
              onSelectProject={handleSelectProjectOnCalendar}
              onNavigateDetail={handleNavigateToDetail}
              onAddNewProject={() => handleOpenNewProject()}
              onDeleteProject={handleDeleteProject}
            />
          )}
        </main>
      </div>

      {/* Quick Info Modal (Basic Info Popup) */}
      {quickModalProject && (
        <ProjectQuickModal
          project={quickModalProject}
          onClose={() => setQuickModalProject(null)}
          onNavigateDetail={handleNavigateToDetail}
          onEditBasicInfo={handleEditBasicInfo}
          onDeleteProject={handleDeleteProject}
        />
      )}

      {/* Create / Edit Project Modal */}
      {showFormModal && (
        <ProjectFormModal
          initialData={editingProject}
          defaultStartDate={defaultStartDate}
          onClose={() => setShowFormModal(false)}
          onSave={handleSaveProjectForm}
          onDelete={handleDeleteProject}
        />
      )}
    </div>
  );
}

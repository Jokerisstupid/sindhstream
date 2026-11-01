import React, { useState, useEffect, useRef } from 'react';
import { AppView, Project, UserSettings, HandTrackingState } from './types';
import {
  getStoredProjects,
  saveProject,
  deleteProject,
  toggleProjectStar,
  getStoredSettings,
  saveStoredSettings,
  getStoredStats,
} from './utils/storage';
import { handTracker } from './services/handTrackingService';
import { AppHeader } from './components/layout/AppHeader';
import { DashboardView } from './components/dashboard/DashboardView';
import { WhiteboardWorkspace } from './components/whiteboard/WhiteboardWorkspace';
import { ProjectsView } from './components/projects/ProjectsView';
import { AITutorView } from './components/ai-tutor/AITutorView';
import { SettingsView } from './components/settings/SettingsView';
import { NewBoardModal } from './components/whiteboard/NewBoardModal';
import { GestureCalibrationModal } from './components/whiteboard/GestureCalibrationModal';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [projects, setProjects] = useState<Project[]>(() => getStoredProjects());
  const [activeProject, setActiveProject] = useState<Project>(() => {
    const stored = getStoredProjects();
    return stored[0];
  });
  const [settings, setSettings] = useState<UserSettings>(() => getStoredSettings());
  const [stats, setStats] = useState(() => getStoredStats());
  const [trackingState, setTrackingState] = useState<HandTrackingState>(handTracker.state);

  const [isNewBoardOpen, setIsNewBoardOpen] = useState(false);
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);

  // Hidden persistent video element for tracking
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Subscribe to hand tracking state updates
  useEffect(() => {
    const unsubscribe = handTracker.subscribe((state) => {
      setTrackingState(state);
    });
    return () => unsubscribe();
  }, []);

  // Save settings when modified
  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  // Toggle Camera
  const handleToggleCamera = async () => {
    if (trackingState.isTrackingActive) {
      handTracker.stopTracking();
    } else if (videoRef.current) {
      await handTracker.startTracking(videoRef.current, settings, {
        width: 1400,
        height: 850,
      });
    }
  };

  // Project actions
  const handleSaveProject = (updated: Project) => {
    const nextList = saveProject(updated);
    setProjects(nextList);
    if (activeProject.id === updated.id) {
      setActiveProject(updated);
    }
  };

  const handleDeleteProject = (id: string) => {
    const nextList = deleteProject(id);
    setProjects(nextList);
    if (activeProject.id === id && nextList.length > 0) {
      setActiveProject(nextList[0]);
    }
  };

  const handleDuplicateProject = (id: string) => {
    const target = projects.find((p) => p.id === id);
    if (!target) return;
    const duplicated: Project = {
      ...target,
      id: `proj_${Date.now()}`,
      title: `${target.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pages: target.pages.map((pg, i) => ({
        ...pg,
        id: `pg_${Date.now()}_${i}`,
      })),
    };
    const nextList = saveProject(duplicated);
    setProjects(nextList);
  };

  const handleToggleStar = (id: string) => {
    const nextList = toggleProjectStar(id);
    setProjects(nextList);
    if (activeProject.id === id) {
      setActiveProject((prev) => ({ ...prev, isStarred: !prev.isStarred }));
    }
  };

  const handleOpenProject = (project: Project) => {
    setActiveProject(project);
    setCurrentView('workspace');
  };

  const handleCreateNewBoard = (proto: Partial<Project>) => {
    const newBoard: Project = {
      id: `proj_${Date.now()}`,
      title: proto.title || 'Untitled Whiteboard',
      description: proto.description || 'Created in AIRWRITE AI',
      subject: proto.subject || 'Mathematics',
      template: proto.template || 'blank',
      tags: proto.tags || ['Air-Writing'],
      pages: proto.pages || [
        { id: `pg_${Date.now()}`, title: 'Page 1', background: 'grid', strokes: [] },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isStarred: false,
    };
    const nextList = saveProject(newBoard);
    setProjects(nextList);
    setActiveProject(newBoard);
    setCurrentView('workspace');
  };

  const handleStartBoardWithTopic = (subject: Project['subject'], title: string) => {
    handleCreateNewBoard({
      title,
      subject,
      template: 'math_grid',
      description: `Exploring ${subject} concepts with AI Tutor.`,
      tags: [subject, 'AI Tutor'],
    });
  };

  return (
    <div className={`flex flex-col bg-[#070B14] text-slate-100 ${currentView === 'workspace' ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      {/* Top Application Header */}
      <AppHeader
        currentView={currentView}
        onNavigate={setCurrentView}
        onNewBoard={() => setIsNewBoardOpen(true)}
        isCameraActive={trackingState.isTrackingActive}
        onToggleCamera={handleToggleCamera}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {currentView === 'dashboard' && (
          <DashboardView
            projects={projects}
            stats={stats}
            onNavigate={setCurrentView}
            onOpenNewBoard={() => setIsNewBoardOpen(true)}
            onOpenProject={handleOpenProject}
            onToggleStar={handleToggleStar}
            onDeleteProject={handleDeleteProject}
            onDuplicateProject={handleDuplicateProject}
            onOpenCalibration={() => setIsCalibrationOpen(true)}
          />
        )}

        {currentView === 'workspace' && activeProject && (
          <WhiteboardWorkspace
            project={activeProject}
            onSaveProject={handleSaveProject}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            trackingState={trackingState}
            onToggleCamera={handleToggleCamera}
            onOpenCalibration={() => setIsCalibrationOpen(true)}
            videoRef={videoRef}
          />
        )}

        {currentView === 'projects' && (
          <ProjectsView
            projects={projects}
            onOpenProject={handleOpenProject}
            onNewBoard={() => setIsNewBoardOpen(true)}
            onToggleStar={handleToggleStar}
            onDeleteProject={handleDeleteProject}
            onDuplicateProject={handleDuplicateProject}
          />
        )}

        {currentView === 'ai-tutor' && (
          <AITutorView
            onNavigate={setCurrentView}
            onStartBoardWithTopic={handleStartBoardWithTopic}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onOpenCalibration={() => setIsCalibrationOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <NewBoardModal
        isOpen={isNewBoardOpen}
        onClose={() => setIsNewBoardOpen(false)}
        onCreate={handleCreateNewBoard}
      />

      <GestureCalibrationModal
        isOpen={isCalibrationOpen}
        onClose={() => setIsCalibrationOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        trackingState={trackingState}
      />
    </div>
  );
}

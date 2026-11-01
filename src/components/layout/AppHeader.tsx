import React from 'react';
import { AppView } from '../../types';
import { Sparkles, Plus, Video, VideoOff } from 'lucide-react';

interface AppHeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onNewBoard: () => void;
  isCameraActive: boolean;
  onToggleCamera: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentView,
  onNavigate,
  onNewBoard,
  isCameraActive,
  onToggleCamera,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-[#090E1A]/95 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-lg font-bold tracking-tight text-white hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded"
          aria-label="AIRWRITE AI Dashboard"
        >
          <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-tr from-blue-600 to-cyan-400" />
          <span>AIRWRITE AI</span>
        </button>
      </div>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'dashboard' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onNavigate('workspace')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'workspace' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Whiteboard Workspace
        </button>
        <button
          onClick={() => onNavigate('projects')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'projects' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Project History
        </button>
        <button
          onClick={() => onNavigate('ai-tutor')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'ai-tutor' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          AI Tutor
        </button>
        <button
          onClick={() => onNavigate('settings')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentView === 'settings' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Settings
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleCamera}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
            isCameraActive
              ? 'bg-blue-950/60 border-cyan-500/50 text-cyan-300 hover:bg-blue-900/60'
              : 'bg-slate-900/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
          }`}
          title={isCameraActive ? 'Turn off Air Camera' : 'Turn on Air Camera'}
          aria-label={isCameraActive ? 'Turn off camera' : 'Turn on camera'}
        >
          {isCameraActive ? (
            <>
              <Video className="w-3.5 h-3.5 text-cyan-400" />
              <span>Camera Active</span>
            </>
          ) : (
            <>
              <VideoOff className="w-3.5 h-3.5 text-slate-400" />
              <span>Air Camera</span>
            </>
          )}
        </button>

        <button
          onClick={onNewBoard}
          className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:from-blue-500 hover:to-cyan-500 transition-all shadow-md shadow-blue-950/40 whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          aria-label="Create New Whiteboard"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Board</span>
        </button>
      </div>
    </header>
  );
};

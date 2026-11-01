import React, { useState } from 'react';
import { UserSettings } from '../../types';
import { DEFAULT_SETTINGS } from '../../utils/storage';
import {
  Sliders,
  Hand,
  Video,
  Sparkles,
  Keyboard,
  RotateCcw,
  Check,
  Eye,
  Zap,
} from 'lucide-react';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onOpenCalibration: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onOpenCalibration,
}) => {
  const [savedToast, setSavedToast] = useState(false);

  const update = (partial: Partial<UserSettings>) => {
    onUpdateSettings({ ...settings, ...partial });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handleReset = () => {
    onUpdateSettings(DEFAULT_SETTINGS);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 max-w-5xl mx-auto w-full space-y-8 text-slate-100">
      {/* Page Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System & Air Settings</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure MediaPipe hand tracking, pinch thresholds, and AI Tutor academic profile
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedToast && (
            <span className="flex items-center gap-1.5 text-xs text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2.5 py-1 rounded-lg animate-in fade-in">
              <Check className="w-3.5 h-3.5" /> Preferences Saved
            </span>
          )}
          <button
            onClick={handleReset}
            className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Section 1: Air Tracking & Gesture Sensitivity */}
      <section className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-cyan-400">
              <Hand className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Touchless Hand Tracking & Sensitivity</h2>
              <p className="text-xs text-slate-400">Calibrate pinch detection and finger tracking geometry</p>
            </div>
          </div>

          <button
            onClick={onOpenCalibration}
            className="px-3 py-1.5 text-xs font-semibold text-cyan-400 bg-blue-950/60 border border-cyan-800/80 rounded-lg hover:bg-blue-900/60 transition-colors cursor-pointer"
          >
            Live Gesture Tester
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Dominant Hand */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Dominant Writing Hand
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Right', 'Left'] as const).map((hand) => (
                <button
                  key={hand}
                  type="button"
                  onClick={() => update({ dominantHand: hand })}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                    settings.dominantHand === hand
                      ? 'bg-blue-600 border-cyan-400 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {hand} Handed
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Optimizes landmark classification for your natural writing orientation.
            </p>
          </div>

          {/* Pinch Sensitivity Threshold */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-300 uppercase tracking-wider">
                Pinch Distance Threshold
              </span>
              <span className="font-mono text-cyan-400 font-bold">
                {(settings.pinchSensitivity * 1000).toFixed(0)}
              </span>
            </div>
            <input
              type="range"
              min="0.02"
              max="0.10"
              step="0.005"
              value={settings.pinchSensitivity}
              onChange={(e) => update({ pinchSensitivity: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Tighter Pinch (0.02)</span>
              <span>Easier Trigger (0.10)</span>
            </div>
          </div>

          {/* Smoothing Factor */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-300 uppercase tracking-wider">
                Stroke Jitter Smoothing
              </span>
              <span className="font-mono text-cyan-400 font-bold">
                {Math.round((1 - settings.smoothingFactor) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.15"
              max="0.85"
              step="0.05"
              value={settings.smoothingFactor}
              onChange={(e) => update({ smoothingFactor: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Ultra Smooth (High EMA)</span>
              <span>Raw Instant (No Filter)</span>
            </div>
          </div>

          {/* 1€ Filter Parameters */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-300 uppercase tracking-wider">
                1€ Filter Min Cutoff (Jitter)
              </span>
              <span className="font-mono text-cyan-400 font-bold">
                {settings.oneEuroMinCutoff.toFixed(1)} Hz
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              value={settings.oneEuroMinCutoff}
              onChange={(e) => update({ oneEuroMinCutoff: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>0.2 Hz (Ultra Stable)</span>
              <span>3.0 Hz (Loose)</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-300 uppercase tracking-wider">
                1€ Filter Speed Beta (Latency)
              </span>
              <span className="font-mono text-cyan-400 font-bold">
                {settings.oneEuroBeta.toFixed(3)}
              </span>
            </div>
            <input
              type="range"
              min="0.001"
              max="0.025"
              step="0.001"
              value={settings.oneEuroBeta}
              onChange={(e) => update({ oneEuroBeta: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>0.001 (Slow response)</span>
              <span>0.025 (Ultra-fast responsive)</span>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div>
                <div className="text-xs font-medium text-slate-200">Mirror Webcam Feed</div>
                <div className="text-[11px] text-slate-500">Natural mirror image behavior</div>
              </div>
              <input
                type="checkbox"
                checked={settings.mirrorWebcam}
                onChange={(e) => update({ mirrorWebcam: e.target.checked })}
                className="accent-cyan-400 w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div>
                <div className="text-xs font-medium text-slate-200">Render Hand Skeleton</div>
                <div className="text-[11px] text-slate-500">Visual landmark nodes on video HUD</div>
              </div>
              <input
                type="checkbox"
                checked={settings.showLandmarks}
                onChange={(e) => update({ showLandmarks: e.target.checked })}
                className="accent-cyan-400 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Camera & Video Feed */}
      <section className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-600/20 text-cyan-400">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Camera & Video Processing</h2>
            <p className="text-xs text-slate-400">Hardware input resolution and device options</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Camera Resolution
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['720p', '1080p', '480p'] as const).map((res) => (
                <button
                  key={res}
                  type="button"
                  onClick={() => update({ cameraResolution: res })}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                    settings.cameraResolution === res
                      ? 'bg-blue-600 border-cyan-400 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              720p HD is recommended for optimal 60 FPS vision model throughput.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Auto-Save Interval
            </label>
            <select
              value={settings.autoSaveInterval}
              onChange={(e) => update({ autoSaveInterval: parseInt(e.target.value, 10) })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 cursor-pointer"
            >
              <option value={5}>Every 5 seconds</option>
              <option value={15}>Every 15 seconds (Recommended)</option>
              <option value={30}>Every 30 seconds</option>
              <option value={60}>Every 60 seconds</option>
            </select>
          </div>
        </div>
      </section>

      {/* Section 3: AI Tutor Academic Profile */}
      <section className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">AI Tutor Pedagogy & Level</h2>
            <p className="text-xs text-slate-400">Target depth of derivations and educational feedback</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Target Academic Level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['High School', 'Undergraduate', 'Advanced AP/College'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => update({ academicLevel: lvl })}
                className={`p-3 text-left rounded-lg border transition-all cursor-pointer ${
                  settings.academicLevel === lvl
                    ? 'bg-blue-950/60 border-cyan-500 text-white ring-1 ring-cyan-500/40'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-slate-200">{lvl}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {lvl === 'High School'
                    ? 'Intuitive step-by-step guidance with analogies'
                    : lvl === 'Undergraduate'
                    ? 'Rigorous proofs and standard university notation'
                    : 'Theoretical precision with research-grade depth'}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Gesture & Keyboard Cheat Sheet */}
      <section className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Shortcuts & Touchless Gestures</h2>
            <p className="text-xs text-slate-400">Master rapid navigation and tool switching</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between items-center">
            <span className="text-slate-300">Pinch Index & Thumb</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px]">
              Write Air Stroke
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between items-center">
            <span className="text-slate-300">Peace Sign "V"</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px]">
              Toggle Eraser
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between items-center">
            <span className="text-slate-300">Open 5-Finger Palm</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px]">
              Pause / Pan Canvas
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between items-center">
            <span className="text-slate-300">Undo / Redo</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
              Ctrl + Z / Ctrl + Y
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

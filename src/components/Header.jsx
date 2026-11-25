import React from 'react';
import {
  Film,
  Download,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Tv,
  Layers,
  Sparkles
} from 'lucide-react';
import { ASPECT_RATIOS } from '../constants';

export default function Header({
  projectName,
  setProjectName,
  aspectRatio,
  setAspectRatio,
  zoom,
  setZoom,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenExport,
  onAddTrack
}) {
  return (
    <header className="h-14 bg-[#12151f] border-b border-[#1f2536] px-4 flex items-center justify-between z-20 shrink-0">
      {/* Brand & Project Info */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 px-2.5 py-1.5 rounded-lg shadow-sm shadow-indigo-500/20">
          <Film className="w-5 h-5 text-white" />
          <span className="font-bold text-sm tracking-wide text-white uppercase">CineForge</span>
        </div>

        <div className="h-4 w-px bg-gray-700/60" />

        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="bg-transparent hover:bg-[#1a1f2e] focus:bg-[#1a1f2e] text-sm font-medium text-gray-200 px-2 py-1 rounded transition border border-transparent focus:border-indigo-500/50 outline-none w-48"
          title="Click to rename project"
        />
      </div>

      {/* Center Controls: Aspect Ratio & Canvas Size */}
      <div className="flex items-center space-x-3 bg-[#0d0f17] px-2 py-1 rounded-lg border border-[#1d2334]">
        <div className="flex items-center space-x-1.5 text-xs text-gray-400">
          <Tv className="w-3.5 h-3.5 text-indigo-400" />
          <span>Canvas:</span>
        </div>

        <select
          value={aspectRatio.id}
          onChange={(e) => {
            const found = ASPECT_RATIOS.find(r => r.id === e.target.value);
            if (found) setAspectRatio(found);
          }}
          className="bg-[#181c2b] text-xs font-medium text-gray-200 rounded px-2 py-1 border border-[#2b334a] outline-none cursor-pointer hover:border-indigo-500 transition"
        >
          {ASPECT_RATIOS.map((ratio) => (
            <option key={ratio.id} value={ratio.id}>
              {ratio.label} ({ratio.width}×{ratio.height})
            </option>
          ))}
        </select>

        <div className="h-3.5 w-px bg-gray-700/60" />

        {/* Undo / Redo */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition ${!canUndo ? 'opacity-30 cursor-not-allowed' : ''}`}
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition ${!canRedo ? 'opacity-30 cursor-not-allowed' : ''}`}
            title="Redo (Ctrl+Y)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right Controls: Timeline Zoom & Export */}
      <div className="flex items-center space-x-3">
        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 bg-[#181c2b] rounded-lg px-2 py-1 border border-[#242b3d]">
          <span className="text-[11px] text-gray-400 mr-1">Zoom:</span>
          <button
            onClick={() => setZoom(Math.max(20, zoom - 15))}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition"
            title="Zoom Out Timeline"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs mono-time text-gray-300 w-9 text-center font-semibold">
            {Math.round((zoom / 50) * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(200, zoom + 15))}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition"
            title="Zoom In Timeline"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Add Track */}
        <button
          onClick={onAddTrack}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#1a2030] hover:bg-[#232b40] text-gray-300 hover:text-white text-xs font-medium border border-[#27324a] transition"
          title="Add a new track"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>+ Track</span>
        </button>

        {/* Export Button */}
        <button
          onClick={onOpenExport}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Export Video</span>
        </button>
      </div>
    </header>
  );
}

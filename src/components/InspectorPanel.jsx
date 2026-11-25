import React from 'react';
import {
  Sliders,
  SlidersHorizontal,
  Type,
  Volume2,
  Trash2,
  Copy,
  RotateCw,
  Palette,
  Layers,
  Sparkles
} from 'lucide-react';
import { FILTER_PRESETS } from '../constants';

export default function InspectorPanel({
  selectedClip,
  onUpdateClip,
  onDeleteClip,
  onDuplicateClip
}) {
  if (!selectedClip) {
    return (
      <div className="w-72 bg-[#10131d] border-l border-[#1e2333] flex flex-col items-center justify-center p-6 text-center select-none shrink-0 text-gray-500">
        <SlidersHorizontal className="w-10 h-10 text-gray-600 mb-3 stroke-[1.5]" />
        <p className="text-xs font-semibold text-gray-400">No Clip Selected</p>
        <p className="text-[11px] text-gray-600 mt-1">
          Click any clip in the timeline to adjust timing, filters, transforms, or text overlays.
        </p>
      </div>
    );
  }

  const isText = selectedClip.type === 'text';
  const isVideo = selectedClip.type === 'video';
  const isAudio = selectedClip.type === 'audio';

  const updateProp = (prop, value) => {
    onUpdateClip(selectedClip.id, { [prop]: value });
  };

  const updateFilter = (filterKey, value) => {
    const prevFilters = selectedClip.filters || { ...FILTER_PRESETS[0].values };
    updateProp('filters', {
      ...prevFilters,
      [filterKey]: value
    });
  };

  return (
    <div className="w-72 bg-[#10131d] border-l border-[#1e2333] flex flex-col h-full shrink-0 select-none overflow-y-auto">
      {/* Header */}
      <div className="h-10 border-b border-[#1e2333] px-3.5 flex items-center justify-between bg-[#0c0e15] shrink-0">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-300 uppercase tracking-wide">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>Inspector</span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => onDuplicateClip(selectedClip.id)}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition"
            title="Duplicate Clip"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteClip(selectedClip.id)}
            className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
            title="Delete Clip"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body Settings */}
      <div className="p-3.5 space-y-4 text-xs">
        {/* Clip Name */}
        <div>
          <label className="text-[11px] font-semibold text-gray-400 uppercase">Clip Name</label>
          <input
            type="text"
            value={selectedClip.name || ''}
            onChange={(e) => updateProp('name', e.target.value)}
            className="w-full mt-1 bg-[#161a26] text-gray-200 px-2.5 py-1.5 rounded border border-[#252c3d] focus:border-indigo-500 outline-none"
          />
        </div>

        {/* Timing */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-semibold text-gray-400 uppercase">Start (s)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={selectedClip.start}
              onChange={(e) => updateProp('start', Math.max(0, Number(e.target.value)))}
              className="w-full mt-1 bg-[#161a26] text-gray-200 px-2 py-1 rounded border border-[#252c3d] focus:border-indigo-500 outline-none mono-time"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-gray-400 uppercase">Duration (s)</label>
            <input
              type="number"
              step="0.1"
              min="0.2"
              value={selectedClip.duration}
              onChange={(e) => updateProp('duration', Math.max(0.2, Number(e.target.value)))}
              className="w-full mt-1 bg-[#161a26] text-gray-200 px-2 py-1 rounded border border-[#252c3d] focus:border-indigo-500 outline-none mono-time"
            />
          </div>
        </div>

        {/* Text Settings */}
        {isText && (
          <div className="space-y-3 pt-2 border-t border-[#1e2333]">
            <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
              <Type className="w-3 h-3" />
              <span>Text Overlay</span>
            </p>

            <div>
              <label className="text-[11px] text-gray-400">Content</label>
              <textarea
                rows="2"
                value={selectedClip.text || ''}
                onChange={(e) => updateProp('text', e.target.value)}
                className="w-full mt-1 bg-[#161a26] text-gray-200 p-2 rounded border border-[#252c3d] focus:border-indigo-500 outline-none resize-none font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-gray-400">Font Size ({selectedClip.fontSize || 48}px)</label>
                <input
                  type="range"
                  min="16"
                  max="120"
                  value={selectedClip.fontSize || 48}
                  onChange={(e) => updateProp('fontSize', Number(e.target.value))}
                  className="w-full accent-indigo-500 mt-1 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-400">Text Color</label>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="color"
                    value={selectedClip.color || '#ffffff'}
                    onChange={(e) => updateProp('color', e.target.value)}
                    className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <span className="mono-time text-[10px] text-gray-400">{selectedClip.color || '#ffffff'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-gray-400">Y Position ({selectedClip.y || 50}%)</label>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={selectedClip.y !== undefined ? selectedClip.y : 50}
                  onChange={(e) => updateProp('y', Number(e.target.value))}
                  className="w-full accent-indigo-500 mt-1 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-400">Font Weight</label>
                <select
                  value={selectedClip.fontWeight || 'bold'}
                  onChange={(e) => updateProp('fontWeight', e.target.value)}
                  className="w-full mt-1 bg-[#161a26] text-gray-200 px-2 py-1 rounded border border-[#252c3d] outline-none"
                >
                  <option value="normal">Normal</option>
                  <option value="600">Semi-Bold</option>
                  <option value="bold">Bold</option>
                  <option value="900">Black</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Transform controls (Video/Image) */}
        {(isVideo || selectedClip.type === 'image') && (
          <div className="space-y-3 pt-2 border-t border-[#1e2333]">
            <p className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center space-x-1">
              <Layers className="w-3 h-3" />
              <span>Transform</span>
            </p>

            <div>
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>Scale / Zoom</span>
                <span className="mono-time">{Math.round((selectedClip.scale || 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.05"
                value={selectedClip.scale || 1}
                onChange={(e) => updateProp('scale', Number(e.target.value))}
                className="w-full accent-indigo-500 mt-1 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>Opacity</span>
                <span className="mono-time">{Math.round((selectedClip.opacity !== undefined ? selectedClip.opacity : 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={selectedClip.opacity !== undefined ? selectedClip.opacity : 1}
                onChange={(e) => updateProp('opacity', Number(e.target.value))}
                className="w-full accent-indigo-500 mt-1 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>Rotation</span>
                <span className="mono-time">{selectedClip.rotation || 0}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={selectedClip.rotation || 0}
                onChange={(e) => updateProp('rotation', Number(e.target.value))}
                className="w-full accent-indigo-500 mt-1 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Color Grading & Filters (Video) */}
        {isVideo && (
          <div className="space-y-3 pt-2 border-t border-[#1e2333]">
            <p className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center space-x-1">
              <Palette className="w-3 h-3" />
              <span>Color Grading & Looks</span>
            </p>

            {/* Filter Preset Buttons */}
            <div className="grid grid-cols-3 gap-1.5">
              {FILTER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => updateProp('filters', { ...preset.values })}
                  className="px-2 py-1 bg-[#171b26] hover:bg-indigo-600/20 text-gray-300 hover:text-indigo-300 rounded border border-[#242b3c] text-[10px] font-medium transition"
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Sliders */}
            <div className="space-y-2 pt-1">
              <div>
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>Brightness</span>
                  <span className="mono-time">{selectedClip.filters?.brightness || 100}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={selectedClip.filters?.brightness || 100}
                  onChange={(e) => updateFilter('brightness', Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>Contrast</span>
                  <span className="mono-time">{selectedClip.filters?.contrast || 100}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={selectedClip.filters?.contrast || 100}
                  onChange={(e) => updateFilter('contrast', Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>Saturation</span>
                  <span className="mono-time">{selectedClip.filters?.saturate || 100}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="250"
                  value={selectedClip.filters?.saturate || 100}
                  onChange={(e) => updateFilter('saturate', Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>Blur</span>
                  <span className="mono-time">{selectedClip.filters?.blur || 0}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={selectedClip.filters?.blur || 0}
                  onChange={(e) => updateFilter('blur', Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Audio Volume */}
        {(isVideo || isAudio) && (
          <div className="space-y-2 pt-2 border-t border-[#1e2333]">
            <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
              <Volume2 className="w-3 h-3" />
              <span>Audio Level</span>
            </p>

            <div className="flex justify-between text-[11px] text-gray-400">
              <span>Clip Volume</span>
              <span className="mono-time">{Math.round((selectedClip.volume !== undefined ? selectedClip.volume : 1) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={selectedClip.volume !== undefined ? selectedClip.volume : 1}
              onChange={(e) => updateProp('volume', Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
}

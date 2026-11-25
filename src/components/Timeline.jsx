import React, { useRef, useState, useEffect } from 'react';
import {
  Scissors,
  Trash2,
  Copy,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Type,
  Video,
  Music,
  Plus,
  Magnet
} from 'lucide-react';
import { formatTimecode } from '../utils/time';

export default function Timeline({
  tracks,
  setTracks,
  currentTime,
  onSeek,
  duration,
  setDuration,
  selectedClipId,
  setSelectedClipId,
  zoom, // pixels per second
  onSplitClip,
  onDuplicateClip,
  onDeleteClip
}) {
  const timelineContentRef = useRef(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isDraggingClip, setIsDraggingClip] = useState(false);
  const [isTrimmingClip, setIsTrimmingClip] = useState(false); // 'left' | 'right' | null
  const [activeClipId, setActiveClipId] = useState(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [initialClipState, setInitialClipState] = useState(null);
  const [snapEnabled, setSnapEnabled] = useState(true);

  // Time ruler tick generator
  const renderRulerTicks = () => {
    const totalSeconds = Math.ceil(duration) + 5;
    const ticks = [];
    const pixelsPerSecond = zoom;

    for (let s = 0; s <= totalSeconds; s++) {
      const left = s * pixelsPerSecond;
      ticks.push(
        <div
          key={`sec-${s}`}
          className="absolute top-0 flex flex-col items-start select-none pointer-events-none"
          style={{ left: `${left}px` }}
        >
          <div className="h-3 w-px bg-gray-600" />
          <span className="text-[10px] mono-time text-gray-400 mt-0.5 -translate-x-1/2">
            {s}s
          </span>
        </div>
      );

      // Sub-second minor ticks
      if (pixelsPerSecond >= 40) {
        ticks.push(
          <div
            key={`half-${s}`}
            className="absolute top-0 h-1.5 w-px bg-gray-700 pointer-events-none"
            style={{ left: `${left + pixelsPerSecond / 2}px` }}
          />
        );
      }
    }
    return ticks;
  };

  // Convert mouse X to timeline seconds
  const getTimelineTimeFromX = (clientX) => {
    if (!timelineContentRef.current) return 0;
    const rect = timelineContentRef.current.getBoundingClientRect();
    const scrollLeft = timelineContentRef.current.scrollLeft;
    const offsetX = clientX - rect.left + scrollLeft;
    const time = Math.max(0, offsetX / zoom);
    return Math.min(time, duration + 5);
  };

  // Timeline scrub handling
  const handleRulerMouseDown = (e) => {
    setIsScrubbing(true);
    const newTime = getTimelineTimeFromX(e.clientX);
    onSeek(newTime);
  };

  // Mouse move and up handlers for scrub & clip dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isScrubbing) {
        const newTime = getTimelineTimeFromX(e.clientX);
        onSeek(newTime);
      } else if (isDraggingClip && activeClipId && initialClipState) {
        const deltaX = e.clientX - dragStartX;
        const deltaTime = deltaX / zoom;
        let newStart = Math.max(0, initialClipState.start + deltaTime);

        // Snap to playhead or 0
        if (snapEnabled) {
          if (Math.abs(newStart - currentTime) < 0.25) newStart = currentTime;
          if (newStart < 0.15) newStart = 0;
        }

        setTracks((prevTracks) =>
          prevTracks.map((tr) => ({
            ...tr,
            items: tr.items.map((it) =>
              it.id === activeClipId ? { ...it, start: Math.round(newStart * 100) / 100 } : it
            )
          }))
        );
      } else if (isTrimmingClip && activeClipId && initialClipState) {
        const deltaX = e.clientX - dragStartX;
        const deltaTime = deltaX / zoom;

        setTracks((prevTracks) =>
          prevTracks.map((tr) => ({
            ...tr,
            items: tr.items.map((it) => {
              if (it.id !== activeClipId) return it;
              if (isTrimmingClip === 'right') {
                const newDuration = Math.max(0.3, initialClipState.duration + deltaTime);
                return { ...it, duration: Math.round(newDuration * 100) / 100 };
              } else if (isTrimmingClip === 'left') {
                const newStart = Math.max(0, initialClipState.start + deltaTime);
                const newDuration = Math.max(0.3, initialClipState.duration - deltaTime);
                const newTrimStart = Math.max(0, (initialClipState.trimStart || 0) + deltaTime);
                return {
                  ...it,
                  start: Math.round(newStart * 100) / 100,
                  duration: Math.round(newDuration * 100) / 100,
                  trimStart: Math.round(newTrimStart * 100) / 100
                };
              }
              return it;
            })
          }))
        );
      }
    };

    const handleMouseUp = () => {
      setIsScrubbing(false);
      setIsDraggingClip(false);
      setIsTrimmingClip(null);
      setActiveClipId(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbing, isDraggingClip, isTrimmingClip, activeClipId, initialClipState, zoom, currentTime, duration, snapEnabled]);

  // Track actions: Mute toggle, Lock toggle
  const toggleTrackMute = (trackId) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t));
  };

  const toggleTrackLock = (trackId) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, locked: !t.locked } : t));
  };

  // Find track type icon
  const getTrackIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="w-3.5 h-3.5 text-blue-400" />;
      case 'audio': return <Music className="w-3.5 h-3.5 text-emerald-400" />;
      case 'text': return <Type className="w-3.5 h-3.5 text-amber-400" />;
      default: return <Video className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0f17] border-t border-[#1a1f2e] select-none overflow-hidden">
      {/* Timeline Toolbar */}
      <div className="h-10 bg-[#121622] border-b border-[#1f2536] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          {/* Split Tool */}
          <button
            onClick={onSplitClip}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#1a1f2e] hover:bg-indigo-600/20 hover:text-indigo-300 text-gray-300 text-xs font-medium border border-[#2b334a] transition"
            title="Split Clip at Playhead (S)"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Split (S)</span>
          </button>

          {/* Duplicate Tool */}
          <button
            onClick={onDuplicateClip}
            disabled={!selectedClipId}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#1a1f2e] hover:bg-[#252c40] text-gray-300 text-xs font-medium border border-[#2b334a] transition ${!selectedClipId ? 'opacity-40 cursor-not-allowed' : ''}`}
            title="Duplicate Selected Clip (D)"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicate</span>
          </button>

          {/* Delete Tool */}
          <button
            onClick={onDeleteClip}
            disabled={!selectedClipId}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#1a1f2e] hover:bg-red-500/20 hover:text-red-300 text-gray-300 text-xs font-medium border border-[#2b334a] transition ${!selectedClipId ? 'opacity-40 cursor-not-allowed' : ''}`}
            title="Delete Selected Clip (Del)"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>

        {/* Snap & Helpers */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSnapEnabled(!snapEnabled)}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition ${snapEnabled ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40' : 'text-gray-400 hover:text-white bg-[#1a1f2e]'}`}
            title="Snap to clips and playhead"
          >
            <Magnet className="w-3 h-3" />
            <span>Snap</span>
          </button>

          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <span>Duration:</span>
            <span className="mono-time font-semibold text-gray-200">{formatTimecode(duration)}</span>
          </div>
        </div>
      </div>

      {/* Main Track Grid & Ruler */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers (Left column) */}
        <div className="w-48 bg-[#10131d] border-r border-[#1e2333] shrink-0 flex flex-col z-10">
          {/* Header spacer for ruler */}
          <div className="h-7 border-b border-[#1e2333] bg-[#0c0e15] px-3 flex items-center justify-between text-[11px] font-semibold text-gray-400">
            <span>TRACKS</span>
            <span className="text-[10px] text-gray-500">{tracks.length} active</span>
          </div>

          {/* Track rows labels */}
          <div className="flex-1 overflow-y-auto">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="h-16 border-b border-[#1c2233] px-3 flex items-center justify-between hover:bg-[#151926] transition group"
              >
                <div className="flex items-center space-x-2 overflow-hidden">
                  {getTrackIcon(track.type)}
                  <div className="truncate">
                    <p className="text-xs font-medium text-gray-200 truncate">{track.name}</p>
                    <p className="text-[10px] text-gray-500 uppercase">{track.type}</p>
                  </div>
                </div>

                {/* Track controls */}
                <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100">
                  <button
                    onClick={() => toggleTrackMute(track.id)}
                    className={`p-1 rounded hover:bg-gray-700/50 transition ${track.muted ? 'text-red-400' : 'text-gray-400'}`}
                    title={track.muted ? 'Unmute Track' : 'Mute Track'}
                  >
                    {track.muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => toggleTrackLock(track.id)}
                    className={`p-1 rounded hover:bg-gray-700/50 transition ${track.locked ? 'text-amber-400' : 'text-gray-400'}`}
                    title={track.locked ? 'Unlock Track' : 'Lock Track'}
                  >
                    {track.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable Tracks Canvas (Right column) */}
        <div
          ref={timelineContentRef}
          className="flex-1 overflow-x-auto overflow-y-auto relative bg-[#090b10]"
        >
          {/* Total timeline width container */}
          <div
            className="relative h-full"
            style={{ width: `${Math.max(1200, (duration + 10) * zoom)}px`, minHeight: '100%' }}
          >
            {/* Top Time Ruler */}
            <div
              className="h-7 border-b border-[#1c2233] bg-[#0d1017] relative cursor-pointer sticky top-0 z-20"
              onMouseDown={handleRulerMouseDown}
            >
              {renderRulerTicks()}
            </div>

            {/* Draggable Playhead Red Needle */}
            <div
              className="absolute top-0 bottom-0 z-30 pointer-events-none flex flex-col items-center"
              style={{ left: `${currentTime * zoom}px` }}
            >
              {/* Playhead handle icon */}
              <div className="w-3.5 h-3.5 bg-red-500 rotate-45 -mt-1 shadow-md shadow-red-500/50" />
              {/* Vertical line */}
              <div className="w-0.5 flex-1 bg-red-500 shadow-sm shadow-red-500/80" />
            </div>

            {/* Tracks Body */}
            <div className="relative">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className={`h-16 border-b border-[#181c2a] relative ${track.muted ? 'opacity-40' : ''}`}
                >
                  {/* Track Clips */}
                  {track.items.map((clip) => {
                    const isSelected = selectedClipId === clip.id;
                    const left = clip.start * zoom;
                    const width = Math.max(20, clip.duration * zoom);

                    return (
                      <div
                        key={clip.id}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          if (track.locked) return;
                          setSelectedClipId(clip.id);
                          setIsDraggingClip(true);
                          setActiveClipId(clip.id);
                          setDragStartX(e.clientX);
                          setInitialClipState({ ...clip });
                        }}
                        className={`absolute top-1.5 bottom-1.5 rounded-md px-2.5 flex items-center justify-between cursor-move shadow-md transition-shadow select-none group ${
                          isSelected
                            ? 'ring-2 ring-indigo-400 shadow-lg shadow-indigo-500/30'
                            : 'hover:brightness-110'
                        }`}
                        style={{
                          left: `${left}px`,
                          width: `${width}px`,
                          backgroundColor: track.color || '#3b82f6'
                        }}
                      >
                        {/* Left Trim Handle */}
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            if (track.locked) return;
                            setSelectedClipId(clip.id);
                            setIsTrimmingClip('left');
                            setActiveClipId(clip.id);
                            setDragStartX(e.clientX);
                            setInitialClipState({ ...clip });
                          }}
                          className="absolute left-0 top-0 bottom-0 w-2.5 bg-black/40 hover:bg-white/60 cursor-ew-resize rounded-l-md opacity-0 group-hover:opacity-100 transition"
                          title="Drag to trim start"
                        />

                        {/* Clip Label */}
                        <div className="flex items-center space-x-1.5 overflow-hidden pointer-events-none">
                          <span className="text-[11px] font-semibold text-white drop-shadow truncate">
                            {clip.name || clip.text || 'Clip'}
                          </span>
                        </div>

                        {/* Clip duration pill */}
                        <span className="text-[10px] mono-time text-white/80 bg-black/30 px-1 rounded pointer-events-none shrink-0 ml-1">
                          {clip.duration.toFixed(1)}s
                        </span>

                        {/* Right Trim Handle */}
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            if (track.locked) return;
                            setSelectedClipId(clip.id);
                            setIsTrimmingClip('right');
                            setActiveClipId(clip.id);
                            setDragStartX(e.clientX);
                            setInitialClipState({ ...clip });
                          }}
                          className="absolute right-0 top-0 bottom-0 w-2.5 bg-black/40 hover:bg-white/60 cursor-ew-resize rounded-r-md opacity-0 group-hover:opacity-100 transition"
                          title="Drag to trim duration"
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

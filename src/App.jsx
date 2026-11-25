import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import PlayerCanvas from './components/PlayerCanvas';
import TransportControls from './components/TransportControls';
import Timeline from './components/Timeline';
import MediaLibrary from './components/MediaLibrary';
import InspectorPanel from './components/InspectorPanel';
import ExportModal from './components/ExportModal';
import { ASPECT_RATIOS, INITIAL_TRACKS } from './constants';

export default function App() {
  // Project settings
  const [projectName, setProjectName] = useState('My Cinema Project');
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [zoom, setZoom] = useState(60); // pixels per second

  // Timeline tracks & clips
  const [tracks, setTracks] = useState(INITIAL_TRACKS);
  const [selectedClipId, setSelectedClipId] = useState('clip-video-1');

  // Playback state
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  // Modals & Panels
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Refs
  const playerRef = useRef(null);
  const lastTimeRef = useRef(null);
  const animFrameRef = useRef(null);
  const containerRef = useRef(null);

  // History stack for Undo / Redo
  const [history, setHistory] = useState([INITIAL_TRACKS]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistory = useCallback((newTracks) => {
    setHistory((prev) => {
      const upToCurrent = prev.slice(0, historyIndex + 1);
      return [...upToCurrent, newTracks];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setTracks(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setTracks(history[newIndex]);
    }
  };

  // Calculate project duration based on furthest clip end
  const duration = Math.max(
    6,
    ...tracks.flatMap((t) => t.items.map((i) => (Number(i.start) || 0) + (Number(i.duration) || 0)))
  );

  // Find currently selected clip object
  const selectedClip = tracks
    .flatMap((t) => t.items)
    .find((i) => i.id === selectedClipId);

  // Playback loop using requestAnimationFrame
  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const tick = (now) => {
      if (lastTimeRef.current !== null) {
        const deltaSec = (now - lastTimeRef.current) / 1000;
        setCurrentTime((prevTime) => {
          let nextTime = prevTime + deltaSec * playbackRate;
          if (nextTime >= duration) {
            if (isLooping) {
              return 0;
            } else {
              setIsPlaying(false);
              return duration;
            }
          }
          return nextTime;
        });
      }
      lastTimeRef.current = now;
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, playbackRate, duration, isLooping]);

  // Seek handler
  const handleSeek = (newTime) => {
    const clamped = Math.max(0, Math.min(newTime, duration));
    setCurrentTime(clamped);
  };

  // Step 1 frame (1/30 sec)
  const handleStepFrame = (direction) => {
    const frameDelta = 1 / 30;
    handleSeek(currentTime + direction * frameDelta);
  };

  // Add clip to timeline
  const handleAddClip = (mediaItem, time) => {
    const clipType = mediaItem.type || 'video';
    const targetTrackType = clipType === 'audio' ? 'audio' : (clipType === 'text' ? 'text' : 'video');

    const newClip = {
      id: `clip-${Date.now()}`,
      type: clipType,
      name: mediaItem.name || 'New Clip',
      src: mediaItem.src,
      text: mediaItem.text,
      start: Math.round(time * 10) / 10,
      duration: mediaItem.duration || 4,
      trimStart: 0,
      volume: 1,
      scale: 1,
      x: mediaItem.x || 0,
      y: mediaItem.y || (clipType === 'text' ? 50 : 0),
      opacity: 1,
      rotation: 0,
      fontSize: mediaItem.fontSize || 48,
      fontWeight: mediaItem.fontWeight || 'bold',
      color: mediaItem.color || '#ffffff',
      backgroundColor: mediaItem.backgroundColor || 'rgba(0,0,0,0.6)'
    };

    setTracks((prev) => {
      let targetTrack = prev.find((t) => t.type === targetTrackType);
      let updated;
      if (targetTrack) {
        updated = prev.map((t) =>
          t.id === targetTrack.id ? { ...t, items: [...t.items, newClip] } : t
        );
      } else {
        // Create new track
        const newTrack = {
          id: `track-${Date.now()}`,
          name: `${targetTrackType.toUpperCase()} Track`,
          type: targetTrackType,
          color: targetTrackType === 'audio' ? '#059669' : '#2563eb',
          muted: false,
          locked: false,
          items: [newClip]
        };
        updated = [...prev, newTrack];
      }
      pushHistory(updated);
      return updated;
    });

    setSelectedClipId(newClip.id);
  };

  // Update clip properties (from Inspector or Timeline)
  const handleUpdateClip = (clipId, updates) => {
    setTracks((prev) => {
      const updated = prev.map((t) => ({
        ...t,
        items: t.items.map((i) => (i.id === clipId ? { ...i, ...updates } : i))
      }));
      return updated;
    });
  };

  // Split selected clip at playhead
  const handleSplitClip = () => {
    if (!selectedClip) return;
    const clipStart = Number(selectedClip.start);
    const clipEnd = clipStart + Number(selectedClip.duration);

    if (currentTime <= clipStart + 0.1 || currentTime >= clipEnd - 0.1) {
      return; // Cannot split at extreme boundary
    }

    const firstDuration = currentTime - clipStart;
    const secondDuration = selectedClip.duration - firstDuration;

    const firstClip = {
      ...selectedClip,
      duration: Math.round(firstDuration * 100) / 100
    };

    const secondClip = {
      ...selectedClip,
      id: `clip-${Date.now()}`,
      name: `${selectedClip.name || 'Clip'} (Part 2)`,
      start: Math.round(currentTime * 100) / 100,
      duration: Math.round(secondDuration * 100) / 100,
      trimStart: (selectedClip.trimStart || 0) + firstDuration
    };

    setTracks((prev) => {
      const updated = prev.map((t) => ({
        ...t,
        items: t.items.flatMap((i) => (i.id === selectedClip.id ? [firstClip, secondClip] : [i]))
      }));
      pushHistory(updated);
      return updated;
    });

    setSelectedClipId(secondClip.id);
  };

  // Duplicate clip
  const handleDuplicateClip = (clipIdToDup = selectedClipId) => {
    const target = tracks.flatMap((t) => t.items).find((i) => i.id === clipIdToDup);
    if (!target) return;

    const duplicate = {
      ...target,
      id: `clip-${Date.now()}`,
      name: `${target.name || 'Clip'} (Copy)`,
      start: Math.round((target.start + target.duration + 0.2) * 100) / 100
    };

    setTracks((prev) => {
      const updated = prev.map((t) =>
        t.items.some((i) => i.id === target.id) ? { ...t, items: [...t.items, duplicate] } : t
      );
      pushHistory(updated);
      return updated;
    });

    setSelectedClipId(duplicate.id);
  };

  // Delete clip
  const handleDeleteClip = (clipIdToDel = selectedClipId) => {
    if (!clipIdToDel) return;
    setTracks((prev) => {
      const updated = prev.map((t) => ({
        ...t,
        items: t.items.filter((i) => i.id !== clipIdToDel)
      }));
      pushHistory(updated);
      return updated;
    });
    setSelectedClipId(null);
  };

  // Add new track
  const handleAddTrack = () => {
    const newTrack = {
      id: `track-${Date.now()}`,
      name: `Track ${tracks.length + 1}`,
      type: 'video',
      color: '#3b82f6',
      muted: false,
      locked: false,
      items: []
    };
    setTracks((prev) => {
      const updated = [...prev, newTrack];
      pushHistory(updated);
      return updated;
    });
  };

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'KeyS') {
        e.preventDefault();
        handleSplitClip();
      } else if (e.code === 'KeyD') {
        e.preventDefault();
        handleDuplicateClip();
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        e.preventDefault();
        handleDeleteClip();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleStepFrame(-1);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleStepFrame(1);
      } else if (e.code === 'Home') {
        e.preventDefault();
        handleSeek(0);
      } else if (e.code === 'End') {
        e.preventDefault();
        handleSeek(duration);
      } else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyY') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedClip, currentTime, duration, historyIndex, history]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen w-screen bg-[#0b0d13] text-gray-100 overflow-hidden font-sans"
    >
      {/* 1. Top Navigation & Studio Header */}
      <Header
        projectName={projectName}
        setProjectName={setProjectName}
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        zoom={zoom}
        setZoom={setZoom}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={undo}
        onRedo={redo}
        onOpenExport={() => setIsExportOpen(true)}
        onAddTrack={handleAddTrack}
      />

      {/* 2. Middle Work Area: Media Library (Left) + Player Monitor (Center) + Inspector (Right) */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Media Library */}
        <MediaLibrary onAddClip={handleAddClip} currentTime={currentTime} />

        {/* Center: Live Canvas Player */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#07080c]">
          <div className="flex-1 relative overflow-hidden">
            <PlayerCanvas
              ref={playerRef}
              currentTime={currentTime}
              duration={duration}
              isPlaying={isPlaying}
              tracks={tracks}
              aspectRatio={aspectRatio}
              volume={volume}
              isMuted={isMuted}
              playbackRate={playbackRate}
            />
          </div>

          {/* Transport Controls (Play, Scrub, Step, Timecode) */}
          <TransportControls
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            playbackRate={playbackRate}
            setPlaybackRate={setPlaybackRate}
            volume={volume}
            setVolume={setVolume}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            isLooping={isLooping}
            setIsLooping={setIsLooping}
            onStepFrame={handleStepFrame}
            onToggleFullscreen={handleToggleFullscreen}
          />
        </div>

        {/* Inspector Panel */}
        <InspectorPanel
          selectedClip={selectedClip}
          onUpdateClip={handleUpdateClip}
          onDeleteClip={handleDeleteClip}
          onDuplicateClip={handleDuplicateClip}
        />
      </div>

      {/* 3. Bottom Area: Multi-Track Timeline */}
      <div className="h-64 border-t border-[#1a1f2e] shrink-0">
        <Timeline
          tracks={tracks}
          setTracks={setTracks}
          currentTime={currentTime}
          onSeek={handleSeek}
          duration={duration}
          setDuration={() => {}}
          selectedClipId={selectedClipId}
          setSelectedClipId={setSelectedClipId}
          zoom={zoom}
          onSplitClip={handleSplitClip}
          onDuplicateClip={handleDuplicateClip}
          onDeleteClip={handleDeleteClip}
        />
      </div>

      {/* 4. Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        projectName={projectName}
        duration={duration}
        aspectRatio={aspectRatio}
        tracks={tracks}
        playerRef={playerRef}
      />
    </div>
  );
}

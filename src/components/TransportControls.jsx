import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Volume2,
  VolumeX,
  Maximize2
} from 'lucide-react';
import { formatTimecode, formatDuration } from '../utils/time';

export default function TransportControls({
  isPlaying,
  onTogglePlay,
  currentTime,
  duration,
  onSeek,
  playbackRate,
  setPlaybackRate,
  volume,
  setVolume,
  isMuted,
  setIsMuted,
  isLooping,
  setIsLooping,
  onStepFrame,
  onToggleFullscreen
}) {
  return (
    <div className="h-12 bg-[#121520] border-t border-[#1e2333] px-4 flex items-center justify-between z-10 shrink-0">
      {/* Left: Timecode Display */}
      <div className="flex items-center space-x-2">
        <div className="bg-[#0b0d13] px-3 py-1 rounded-md border border-[#23293a] flex items-center space-x-1.5 shadow-inner">
          <span className="mono-time text-sm font-bold text-indigo-400">
            {formatTimecode(currentTime)}
          </span>
          <span className="text-gray-600 text-xs font-mono">/</span>
          <span className="mono-time text-xs text-gray-400">
            {formatTimecode(duration)}
          </span>
        </div>
      </div>

      {/* Center: Playback Buttons */}
      <div className="flex items-center space-x-2">
        {/* Jump to start */}
        <button
          onClick={() => onSeek(0)}
          className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#1f2536] transition"
          title="Jump to Start (Home)"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        {/* 1 Frame Back */}
        <button
          onClick={() => onStepFrame(-1)}
          className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#1f2536] transition"
          title="Previous Frame (Left Arrow)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Main Play / Pause Button */}
        <button
          onClick={onTogglePlay}
          className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 transition transform active:scale-90"
          title="Play / Pause (Space)"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-white" />
          ) : (
            <Play className="w-4 h-4 fill-white ml-0.5" />
          )}
        </button>

        {/* 1 Frame Forward */}
        <button
          onClick={() => onStepFrame(1)}
          className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#1f2536] transition"
          title="Next Frame (Right Arrow)"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Jump to end */}
        <button
          onClick={() => onSeek(duration)}
          className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#1f2536] transition"
          title="Jump to End (End)"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Loop toggle */}
        <button
          onClick={() => setIsLooping(!isLooping)}
          className={`p-1.5 rounded-md transition ${isLooping ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-400 hover:text-white hover:bg-[#1f2536]'}`}
          title="Toggle Loop Playback"
        >
          <Repeat className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Rate, Volume & Fullscreen */}
      <div className="flex items-center space-x-3">
        {/* Playback speed selector */}
        <select
          value={playbackRate}
          onChange={(e) => setPlaybackRate(Number(e.target.value))}
          className="bg-[#181d2c] text-xs font-semibold text-gray-300 rounded px-2 py-1 border border-[#262e42] outline-none cursor-pointer hover:border-indigo-500/60 transition"
          title="Playback Rate"
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1.0x</option>
          <option value={1.25}>1.25x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2.0x</option>
        </select>

        {/* Volume & Mute */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1 text-gray-400 hover:text-white transition"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
          />
        </div>

        {/* Fullscreen */}
        <button
          onClick={onToggleFullscreen}
          className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#1f2536] transition"
          title="Fullscreen Canvas"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

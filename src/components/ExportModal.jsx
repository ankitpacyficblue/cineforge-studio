import React, { useState } from 'react';
import {
  X,
  Download,
  Film,
  Sparkles,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ExportModal({
  isOpen,
  onClose,
  projectName,
  duration,
  aspectRatio,
  tracks,
  playerRef
}) {
  if (!isOpen) return null;

  const [exportMode, setExportMode] = useState('browser'); // 'browser' | 'ffmpeg'
  const [resolution, setResolution] = useState('1080p');
  const [fps, setFps] = useState(30);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);

  // Trigger confetti burst
  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Browser Client-Side Export via Canvas MediaRecorder
  const handleBrowserExport = async () => {
    if (!playerRef.current) return;
    setIsExporting(true);
    setProgress(0);
    setError(null);
    setDownloadUrl(null);

    const canvas = playerRef.current.getCanvas();
    if (!canvas) {
      setError('Preview canvas not ready');
      setIsExporting(false);
      return;
    }

    try {
      const stream = canvas.captureStream(fps);
      const mimeType = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')
        ? 'video/mp4;codecs=avc1'
        : (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
            ? 'video/webm;codecs=vp9'
            : 'video/webm');

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 8000000 // 8 Mbps high quality
      });

      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setIsExporting(false);
        setProgress(100);
        triggerCelebration();
      };

      recorder.start();

      // Step through time frame-by-frame and render onto canvas
      const totalFrames = Math.ceil(duration * fps);
      const frameDuration = 1 / fps;

      for (let f = 0; f < totalFrames; f++) {
        const t = f * frameDuration;
        playerRef.current.renderFrameAt(t);
        setProgress(Math.round(((f + 1) / totalFrames) * 98));
        // Small delay to let canvas frame settle into MediaRecorder
        await new Promise((r) => setTimeout(r, 1000 / fps));
      }

      recorder.stop();
    } catch (err) {
      console.error('Export error:', err);
      setError(err.message || 'Export failed');
      setIsExporting(false);
    }
  };

  // Backend FFmpeg Export
  const handleFfmpegExport = async () => {
    setIsExporting(true);
    setProgress(15);
    setError(null);
    setDownloadUrl(null);

    // Extract text overlays from tracks
    const textTrack = tracks.find(t => t.type === 'text');
    const textItems = textTrack ? textTrack.items : [];

    const timelinePayload = {
      duration,
      textTracks: textItems.map(item => ({
        text: item.text,
        start: item.start,
        duration: item.duration,
        fontSize: item.fontSize,
        color: item.color
      }))
    };

    try {
      setProgress(40);
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeline: timelinePayload,
          settings: {
            width: aspectRatio.width,
            height: aspectRatio.height,
            fps
          }
        })
      });

      setProgress(85);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'FFmpeg render failed');
      }

      const result = await response.json();
      setDownloadUrl(result.downloadUrl);
      setProgress(100);
      setIsExporting(false);
      triggerCelebration();
    } catch (err) {
      console.error('FFmpeg export error:', err);
      setError(err.message || 'Server export failed. Trying in-browser export instead...');
      setIsExporting(false);
    }
  };

  const handleStartExport = () => {
    if (exportMode === 'browser') {
      handleBrowserExport();
    } else {
      handleFfmpegExport();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#121622] border border-[#232a3d] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="h-14 border-b border-[#1f2638] px-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Film className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-sm text-gray-100">Export Video Project</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Project Summary */}
          <div className="bg-[#181c2b] p-3 rounded-xl border border-[#242b3e] flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-200">{projectName}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {aspectRatio.label} ({aspectRatio.width}×{aspectRatio.height}) • {duration.toFixed(1)}s
              </p>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {fps} FPS
            </span>
          </div>

          {/* Export Mode Selection */}
          <div>
            <label className="text-[11px] font-semibold text-gray-400 uppercase">Render Engine</label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              <button
                onClick={() => setExportMode('browser')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  exportMode === 'browser'
                    ? 'border-indigo-500 bg-indigo-600/10 text-white shadow-inner'
                    : 'border-[#22293c] bg-[#161a26] text-gray-400 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-1.5 font-bold text-xs text-indigo-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Instant Browser</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Direct WebCodecs / MediaRecorder fast export.</p>
              </button>

              <button
                onClick={() => setExportMode('ffmpeg')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  exportMode === 'ffmpeg'
                    ? 'border-indigo-500 bg-indigo-600/10 text-white shadow-inner'
                    : 'border-[#22293c] bg-[#161a26] text-gray-400 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-1.5 font-bold text-xs text-purple-400">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>FFmpeg Pro</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Local FFmpeg engine for crisp MP4 encoding.</p>
              </button>
            </div>
          </div>

          {/* Framerate & Resolution */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase">Quality Preset</label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full mt-1 bg-[#161a26] text-gray-200 px-2.5 py-1.5 rounded-lg border border-[#252c3d] outline-none"
              >
                <option value="720p">720p HD</option>
                <option value="1080p">1080p Full HD (Default)</option>
                <option value="4K">4K UHD</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase">Frame Rate</label>
              <select
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                className="w-full mt-1 bg-[#161a26] text-gray-200 px-2.5 py-1.5 rounded-lg border border-[#252c3d] outline-none"
              >
                <option value={24}>24 FPS (Cinematic)</option>
                <option value={30}>30 FPS (Standard)</option>
                <option value={60}>60 FPS (Ultra Smooth)</option>
              </select>
            </div>
          </div>

          {/* Progress Bar & Status */}
          {isExporting && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] text-gray-400">
                <span className="flex items-center space-x-1.5 text-indigo-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Rendering timeline frames...</span>
                </span>
                <span className="mono-time font-bold text-indigo-400">{progress}%</span>
              </div>
              <div className="w-full bg-[#1e2333] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Finished Download Button */}
          {downloadUrl && (
            <a
              href={downloadUrl}
              download={`${projectName.toLowerCase().replace(/\s+/g, '-')}.mp4`}
              className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/30 transition text-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Download Finished Video</span>
            </a>
          )}
        </div>

        {/* Modal Footer */}
        <div className="h-14 border-t border-[#1f2638] px-5 flex items-center justify-end space-x-2 bg-[#0e111a]">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-gray-400 hover:text-white text-xs font-medium hover:bg-gray-800 transition"
          >
            Cancel
          </button>

          {!downloadUrl && (
            <button
              onClick={handleStartExport}
              disabled={isExporting}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition ${
                isExporting ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
              }`}
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Start Export</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

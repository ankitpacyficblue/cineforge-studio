import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';

const PlayerCanvas = forwardRef(function PlayerCanvas(
  {
    currentTime,
    duration,
    isPlaying,
    tracks,
    aspectRatio,
    volume,
    isMuted,
    playbackRate,
    onEnded,
    containerRef
  },
  ref
) {
  const canvasRef = useRef(null);
  const mediaPoolRef = useRef({}); // cache of video/audio elements by url
  const animationFrameRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Expose canvas element for export recording
  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    renderFrameAt: (time) => renderCompositeFrame(time)
  }));

  // Preload and retrieve media element
  const getMediaElement = (src, type) => {
    if (!mediaPoolRef.current[src]) {
      const el = document.createElement(type === 'audio' ? 'audio' : 'video');
      el.src = src;
      el.crossOrigin = 'anonymous';
      el.preload = 'auto';
      el.playsInline = true;
      mediaPoolRef.current[src] = el;
    }
    return mediaPoolRef.current[src];
  };

  // Find active items at a given time
  const getActiveItems = (time) => {
    const active = [];
    tracks.forEach((track) => {
      if (track.muted) return;
      track.items.forEach((item) => {
        const itemStart = Number(item.start);
        const itemEnd = itemStart + Number(item.duration);
        if (time >= itemStart && time <= itemEnd) {
          active.push({ ...item, trackType: track.type });
        }
      });
    });
    return active;
  };

  // Synchronize audio/video playback elements with current time and playing state
  useEffect(() => {
    const activeItems = getActiveItems(currentTime);

    // Sync playing media elements
    Object.entries(mediaPoolRef.current).forEach(([src, el]) => {
      const matchingItem = activeItems.find(i => i.src === src);
      if (matchingItem) {
        const itemStart = Number(matchingItem.start);
        const trimStart = Number(matchingItem.trimStart || 0);
        const targetMediaTime = (currentTime - itemStart) * (matchingItem.speed || 1) + trimStart;

        // Sync volume
        const clipVolume = matchingItem.volume !== undefined ? matchingItem.volume : 1;
        el.volume = isMuted ? 0 : Math.max(0, Math.min(1, volume * clipVolume));
        el.playbackRate = playbackRate * (matchingItem.speed || 1);

        // Resync drift if greater than 0.15s
        if (Math.abs(el.currentTime - targetMediaTime) > 0.15) {
          try {
            el.currentTime = Math.max(0, targetMediaTime);
          } catch (e) {
            // Ignore seek error during rapid scrubbing
          }
        }

        if (isPlaying && el.paused) {
          el.play().catch(() => {});
        } else if (!isPlaying && !el.paused) {
          el.pause();
        }
      } else {
        // Pause inactive media
        if (!el.paused) {
          el.pause();
        }
      }
    });
  }, [currentTime, isPlaying, tracks, volume, isMuted, playbackRate]);

  // Pause all media when unmounted or paused
  useEffect(() => {
    if (!isPlaying) {
      Object.values(mediaPoolRef.current).forEach(el => {
        if (!el.paused) el.pause();
      });
    }
  }, [isPlaying]);

  // Main Canvas Render function
  const renderCompositeFrame = (time) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = aspectRatio.width;
    const height = aspectRatio.height;

    // Reset transform & clear canvas with background color
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0b0d13';
    ctx.fillRect(0, 0, width, height);

    // Subtle grid/pattern in background
    ctx.strokeStyle = '#151926';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const activeItems = getActiveItems(time);

    // 1. Render Video / Image items (back-to-front by track order)
    activeItems.forEach(item => {
      if (item.type === 'video' || item.type === 'image') {
        const el = getMediaElement(item.src, item.type);
        ctx.save();

        // Transforms
        const scale = item.scale !== undefined ? item.scale : 1;
        const posX = ((item.x || 0) / 100) * width;
        const posY = ((item.y || 0) / 100) * height;
        const rotation = ((item.rotation || 0) * Math.PI) / 180;
        const opacity = item.opacity !== undefined ? item.opacity : 1;

        ctx.globalAlpha = opacity;
        ctx.translate(width / 2 + posX, height / 2 + posY);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);

        // Filters
        if (item.filters) {
          const f = item.filters;
          ctx.filter = `brightness(${f.brightness || 100}%) contrast(${f.contrast || 100}%) saturate(${f.saturate || 100}%) blur(${f.blur || 0}px) sepia(${f.sepia || 0}%) grayscale(${f.grayscale || 0}%) hue-rotate(${f.hueRotate || 0}deg)`;
        }

        // Draw image or video frame
        const drawW = width;
        const drawH = height;
        try {
          if (el.readyState >= 2 || item.type === 'image') {
            ctx.drawImage(el, -drawW / 2, -drawH / 2, drawW, drawH);
          } else {
            // Draw placeholder loading card
            ctx.fillStyle = '#1c2233';
            ctx.fillRect(-drawW / 4, -drawH / 4, drawW / 2, drawH / 2);
            ctx.fillStyle = '#818cf8';
            ctx.font = '24px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(item.name || 'Loading clip...', 0, 0);
          }
        } catch (e) {
          // Cross-origin or frame load error
        }

        ctx.restore();
      }
    });

    // 2. Render Text Overlays
    activeItems.forEach(item => {
      if (item.type === 'text') {
        ctx.save();
        const posX = ((item.x !== undefined ? item.x : 50) / 100) * width;
        const posY = ((item.y !== undefined ? item.y : 50) / 100) * height;
        const fontSize = Math.round((item.fontSize || 48) * (height / 1080));
        const fontWeight = item.fontWeight || 'bold';
        const color = item.color || '#ffffff';
        const opacity = item.opacity !== undefined ? item.opacity : 1;

        ctx.globalAlpha = opacity;
        ctx.font = `${fontWeight} ${fontSize}px "Plus Jakarta Sans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const lines = (item.text || 'Sample Text').split('\n');
        const lineHeight = fontSize * 1.25;
        const totalTextHeight = lines.length * lineHeight;

        // Background pill
        if (item.backgroundColor && item.backgroundColor !== 'transparent') {
          lines.forEach((line, idx) => {
            const metrics = ctx.measureText(line);
            const paddingX = (item.padding || 16) * (height / 1080);
            const paddingY = 8 * (height / 1080);
            const bgW = metrics.width + paddingX * 2;
            const bgH = lineHeight;
            const lineY = posY - totalTextHeight / 2 + idx * lineHeight;

            ctx.fillStyle = item.backgroundColor;
            ctx.beginPath();
            ctx.roundRect(
              posX - bgW / 2,
              lineY - bgH / 2,
              bgW,
              bgH,
              (item.borderRadius || 8) * (height / 1080)
            );
            ctx.fill();
          });
        }

        // Drop shadow for crisp readability
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Text lines
        ctx.fillStyle = color;
        lines.forEach((line, idx) => {
          const lineY = posY - totalTextHeight / 2 + idx * lineHeight;
          ctx.fillText(line, posX, lineY);
        });

        ctx.restore();
      }
    });
  };

  // Render on time updates
  useEffect(() => {
    renderCompositeFrame(currentTime);
  }, [currentTime, tracks, aspectRatio]);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 bg-[#08090e] overflow-hidden select-none">
      {/* Outer monitor frame */}
      <div
        className="relative flex items-center justify-center rounded-xl shadow-2xl border border-[#20273a] bg-black overflow-hidden"
        style={{
          aspectRatio: `${aspectRatio.width} / ${aspectRatio.height}`,
          maxHeight: '100%',
          maxWidth: '100%'
        }}
      >
        <canvas
          ref={canvasRef}
          width={aspectRatio.width}
          height={aspectRatio.height}
          className="w-full h-full object-contain"
        />

        {/* Live Status Watermark */}
        <div className="absolute top-3 left-3 flex items-center space-x-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-300 border border-white/10 pointer-events-none">
          <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
          <span>{isPlaying ? 'PLAYING' : 'PAUSED'}</span>
        </div>

        {/* Aspect Ratio Badge */}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] mono-time text-gray-400 border border-white/10 pointer-events-none">
          {aspectRatio.id} ({aspectRatio.width}×{aspectRatio.height})
        </div>
      </div>
    </div>
  );
});

export default PlayerCanvas;

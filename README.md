# CineForge Studio — Interactive Web Video Editing Studio

A fast, modern, multi-track web video editing application built with React, Vite, Tailwind CSS, HTML5 Canvas compositing, and an FFmpeg production render pipeline.

---

## 🚀 Quick Start

1. Open your browser to: **[http://localhost:5173/](http://localhost:5173/)**
2. The dev server runs both the web UI and the Node.js/FFmpeg backend concurrently:
   ```bash
   cd /Users/ankitmalhotra/.gemini/antigravity/scratch/video-editing-studio
   npm run dev
   ```

---

## ✨ Studio Features

- **Multi-Track Timeline:**
  - Dedicated tracks for Video, Audio/Music, and Text/Title Overlays.
  - Interactive playhead with scrubbable time ruler (seconds + sub-second ticks).
  - Clip trimming via left/right edge drag handles.
  - Drag-and-drop clip repositioning with smart snapping to playhead.
  - Track controls: Mute, Lock, Hide, and Add Track (`+ Track`).

- **Real-Time Canvas Compositing Monitor:**
  - Real-time compositing of active video, graphics, and text overlays synced to audio.
  - Aspect ratio switcher:
    - **16:9 Landscape** (1920×1080) for YouTube / Desktop
    - **9:16 Vertical** (1080×1920) for Reels, Shorts & TikTok
    - **1:1 Square** (1080×1080) for Instagram Feed
    - **4:5 Portrait** (1080×1350) for Social Media

- **Inspector & Color Grading:**
  - **Color Grading Looks:** Normal, Vivid Pop, Film Noir, Cinematic Warm, Cyberpunk, and Vintage 70s.
  - **Filters:** Brightness, Contrast, Saturation, and Gaussian Blur.
  - **Transforms:** Scale/Zoom (20% – 250%), Position X/Y, Rotation (-180° – 180°), Opacity.
  - **Text Styling:** Multi-line text, Font size, Weight, Color picker, and Background pill styling.
  - **Audio:** Volume adjustment per clip (0% – 200%).

- **Export Pipeline:**
  - **Instant Browser Export:** Fast client-side rendering via MediaRecorder/WebCodecs into WebM/MP4.
  - **Production FFmpeg Engine:** Leverages the local FFmpeg binary (`/opt/homebrew/bin/ffmpeg`) on the backend server for high-definition MP4 renders.
  - Quality presets: 720p HD, 1080p Full HD, 4K UHD @ 24/30/60 FPS.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| **`Space`** | Play / Pause playback |
| **`S`** | Split selected clip at playhead |
| **`D`** | Duplicate selected clip |
| **`Delete` / `Backspace`** | Delete selected clip |
| **`←` / `→`** | Step 1 frame backward / forward (1/30s) |
| **`Home` / `End`** | Jump to Start / End |
| **`Ctrl+Z` / `Cmd+Z`** | Undo |
| **`Ctrl+Y` / `Cmd+Shift+Z`** | Redo |

---

## 📁 Project Directory Structure

```
video-editing-studio/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── public/
│   └── samples/              # Pre-bundled stock video/audio clips
├── server/
│   └── index.js              # Express backend with FFmpeg export & upload pipeline
└── src/
    ├── main.jsx
    ├── index.css
    ├── App.jsx               # Master timeline state & keyboard shortcut listeners
    ├── constants.js          # Aspect ratios, presets, initial track data
    ├── utils/
    │   └── time.js           # Timecode & duration formatting
    └── components/
        ├── Header.jsx        # Project branding, aspect ratio dropdown, zoom, export
        ├── PlayerCanvas.jsx  # Real-time multi-track canvas renderer
        ├── TransportControls.jsx # Playhead controls, timecode, speed, volume
        ├── Timeline.jsx      # Multi-track editor with ruler, trim handles, playhead
        ├── MediaLibrary.jsx  # Stock clips, file upload dropzone, text presets
        ├── InspectorPanel.jsx# Properties inspector (filters, transforms, text)
        └── ExportModal.jsx   # Browser & FFmpeg export modal with progress bar
```

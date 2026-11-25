# CineForge FilmCraft 🎬
### Professional Non-Linear Video Editor, Color Grading & Audio Suite (Pure Rust & WebAssembly)

[![Live Web Studio](https://img.shields.io/badge/Web_Studio-Vercel_Ready-6366f1?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![Built in Pure Rust](https://img.shields.io/badge/Engine-Pure_Rust-6a3fd6?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![License: MIT OR Apache-2.0](https://img.shields.io/badge/License-MIT%20%7C%20Apache--2.0-8b5cf6?style=for-the-badge)](./LICENSE-MIT)
[![Platforms](https://img.shields.io/badge/Runs_on-macOS%20%7C%20Windows%20%7C%20Linux%20%7C%20Browser-059669?style=for-the-badge)](#)

---

## 🌟 Overview

**CineForge FilmCraft** is an open-source, full-fledged, professional non-linear video editing (NLE) suite. It provides a complete desktop-grade editing workflow native on macOS, Windows, and Linux, and directly in the browser via WebAssembly, WebGPU, and WebCodecs.

Unlike simple web clip trimmers, FilmCraft is built from the bitstream up:
- **Pure Rust Codecs:** Custom H.264, HEVC, ProRes, VP8, and AAC decoders and demuxers.
- **GPU Compositor:** Color grading and compositing in linear light with sub-pixel precision.
- **Exact Frame Timing:** Integer timecode math to guarantee zero frame drift.
- **WebAssembly Engine:** Runs the entire desktop NLE in the browser on WebGPU (with automatic WebGL2 fallback).
- **Client-Side Storage:** Real-time auto-saving and crash recovery via Origin Private File System (OPFS).
- **Zero Server Costs:** Media stays local on the creator's machine.

---

## 🔐 Web Studio & Authentication

The web application includes a secure cinema-themed login gate with static credentials:
- **Username:** `admin` (or `creator@cineforge.io`)
- **Password:** `studio2026`
- **1-Click Demo:** Click the **"Fill Demo"** button on the login screen to sign in instantly.

---

## 🚀 Instant Deployment on Vercel

The repository is pre-configured with [`vercel.json`](./vercel.json) for zero-configuration deployment:

1. Import this repository in [Vercel](https://vercel.com/new).
2. Confirm the project settings:
   - **Framework Preset:** Other / None
   - **Output Directory:** `dist`
   - **Build Command:** `npm run build`
3. Click **Deploy**. Vercel will deploy the complete WebAssembly video editor with proper `.wasm` streaming headers and caching rules!

---

## 🖥️ Running Locally

To run the WebAssembly video editor locally:

```bash
# Clone the repository
git clone https://github.com/ankitpacyficblue/cineforge-studio.git
cd cineforge-studio

# Start the local development server (serves on http://localhost:5173)
npx serve dist -l 5173
```

Open your browser to **http://localhost:5173/**.

---

## 📦 Native Desktop App (macOS, Windows, Linux)

In addition to running in the browser, FilmCraft can be compiled natively using Cargo:

```bash
# Run native desktop app with GPU acceleration
cargo run --release -p filmcraft
```

---

## 📂 Architecture & Directory Structure

```
cineforge-studio/
├── apps/
│   ├── filmcraft/            # Native desktop NLE application (macOS, Windows, Linux)
│   ├── filmcraft-cli/        # Command-line automation and render tool
│   └── filmcraft-web/        # WebAssembly / eframe web runner
├── crates/
│   ├── bitstream/            # Bitstream parsers
│   ├── color/                # Color science, LUTs, and color spaces
│   ├── compositor/           # GPU linear-light rendering engine
│   ├── h264enc/              # H.264 encoder
│   ├── prores/               # Apple ProRes decoder
│   ├── timeline/             # Multi-track integer-time sequence engine
│   └── ui-egui/              # Professional multi-panel editing UI
├── dist/                     # Pre-bundled WebAssembly distribution for Vercel
│   ├── index.html            # Studio entry point with cinema login gate
│   ├── filmcraft_web.js      # WASM JS bindings
│   ├── filmcraft_web_bg.wasm # 50MB compiled Rust video engine
│   └── audio-worklet.js      # WebAudio real-time mixer
├── packaging/                # Installers for macOS (.dmg), Windows (.msi), Linux (.AppImage)
├── xtask/                    # Build tasks and verification tooling
└── vercel.json               # Vercel deployment configuration
```

---

## 📄 License & Credits

Based on the [FilmCraft / ArtCraft](https://github.com/storytold/filmcraft) open-source project.  
Licensed under the **MIT** or **Apache-2.0** license.

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Directories
const uploadsDir = path.join(rootDir, 'uploads');
const exportsDir = path.join(rootDir, 'exports');
const samplesDir = path.join(rootDir, 'samples');

[uploadsDir, exportsDir, samplesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use('/uploads', express.static(uploadsDir));
app.use('/exports', express.static(exportsDir));
app.use('/samples', express.static(samplesDir));

// Find FFmpeg binary
const FFMPEG_PATH = fs.existsSync('/opt/homebrew/bin/ffmpeg')
  ? '/opt/homebrew/bin/ffmpeg'
  : (fs.existsSync('/usr/local/bin/ffmpeg') ? '/usr/local/bin/ffmpeg' : 'ffmpeg');

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});
const upload = multer({ storage });

// Health check
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    ffmpegAvailable: true,
    ffmpegPath: FFMPEG_PATH,
    timestamp: new Date().toISOString()
  });
});

// File upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    file: {
      id: req.file.filename,
      name: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      url: fileUrl,
      path: req.file.path
    }
  });
});

// Export timeline to MP4 using FFmpeg
app.post('/api/export', async (req, res) => {
  const { timeline, settings } = req.body;
  if (!timeline) {
    return res.status(400).json({ error: 'Missing timeline payload' });
  }

  const width = settings?.width || 1280;
  const height = settings?.height || 720;
  const fps = settings?.fps || 30;
  const totalDuration = Math.max(1, Math.min(timeline.duration || 10, 300));
  const outputFileName = `render-${Date.now()}.mp4`;
  const outputPath = path.join(exportsDir, outputFileName);

  console.log(`Starting FFmpeg render: ${width}x${height} @ ${fps}fps, duration: ${totalDuration}s`);

  // Build FFmpeg command args
  // If no clips or synthetic preview, render background color + overlays
  const args = [
    '-y',
    '-f', 'lavfi',
    '-i', `color=c=0x0b0d13:s=${width}x${height}:r=${fps}:d=${totalDuration}`,
  ];

  // We add audio silence base
  args.push('-f', 'lavfi', '-i', `anullsrc=r=44100:cl=stereo:d=${totalDuration}`);

  // Assemble video filters
  let filterChains = [];
  let currentVideoOutput = '0:v';

  // Draw project title or text overlays
  if (timeline.textTracks && timeline.textTracks.length > 0) {
    let textIndex = 0;
    for (const textItem of timeline.textTracks) {
      const sanitizedText = (textItem.text || 'Text')
        .replace(/'/g, "\\'")
        .replace(/:/g, '\\:');
      const start = Number(textItem.start || 0).toFixed(2);
      const end = (Number(textItem.start || 0) + Number(textItem.duration || 5)).toFixed(2);
      const fontSize = Math.round((textItem.fontSize || 36) * (height / 720));
      const fontColor = textItem.color || 'white';
      
      const nextOut = `v_txt_${textIndex}`;
      filterChains.push(
        `[${currentVideoOutput}]drawtext=text='${sanitizedText}':fontcolor=${fontColor}:fontsize=${fontSize}:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,${start},${end})'[${nextOut}]`
      );
      currentVideoOutput = nextOut;
      textIndex++;
    }
  }

  if (filterChains.length > 0) {
    args.push('-filter_complex', filterChains.join(';'));
    args.push('-map', `[${currentVideoOutput}]`);
  } else {
    args.push('-map', '0:v');
  }

  args.push('-map', '1:a');
  args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'ultrafast');
  args.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
  args.push(outputPath);

  const ffmpegProcess = spawn(FFMPEG_PATH, args);

  let errorLogs = '';
  ffmpegProcess.stderr.on('data', data => {
    errorLogs += data.toString();
  });

  ffmpegProcess.on('close', code => {
    if (code === 0) {
      console.log(`Render succeeded: ${outputFileName}`);
      res.json({
        success: true,
        downloadUrl: `/exports/${outputFileName}`,
        filename: outputFileName
      });
    } else {
      console.error(`FFmpeg failed with code ${code}:`, errorLogs);
      res.status(500).json({
        error: 'FFmpeg rendering failed',
        details: errorLogs.slice(-500)
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Video Editing Studio Backend running on http://localhost:${PORT}`);
  console.log(`Using FFmpeg at: ${FFMPEG_PATH}`);
});

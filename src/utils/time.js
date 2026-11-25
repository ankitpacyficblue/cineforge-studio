/**
 * Convert seconds to timecode format HH:MM:SS:FF
 */
export function formatTimecode(seconds, fps = 30) {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  
  const totalFrames = Math.floor(seconds * fps);
  const frames = totalFrames % fps;
  const totalSecs = Math.floor(seconds);
  const s = totalSecs % 60;
  const m = Math.floor(totalSecs / 60) % 60;
  const h = Math.floor(totalSecs / 3600);

  const pad = (num, digits = 2) => String(num).padStart(digits, '0');

  if (h > 0) {
    return `${pad(h)}:${pad(m)}:${pad(s)}:${pad(frames)}`;
  }
  return `${pad(m)}:${pad(s)}:${pad(frames)}`;
}

/**
 * Format seconds to display as simple mm:ss
 */
export function formatDuration(seconds) {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const totalSecs = Math.floor(seconds);
  const s = totalSecs % 60;
  const m = Math.floor(totalSecs / 60);
  const pad = (num) => String(num).padStart(2, '0');
  return `${pad(m)}:${pad(s)}`;
}

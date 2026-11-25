export const ASPECT_RATIOS = [
  { id: '16:9', label: '16:9 Landscape', width: 1920, height: 1080, desc: 'YouTube, Desktop' },
  { id: '9:16', label: '9:16 Vertical', width: 1080, height: 1920, desc: 'Reels, Shorts, TikTok' },
  { id: '1:1', label: '1:1 Square', width: 1080, height: 1080, desc: 'Instagram Feed' },
  { id: '4:5', label: '4:5 Portrait', width: 1080, height: 1350, desc: 'Social Media' }
];

export const FILTER_PRESETS = [
  { id: 'normal', name: 'Normal', filter: 'none', values: { brightness: 100, contrast: 100, saturate: 100, blur: 0, sepia: 0, grayscale: 0, hueRotate: 0 } },
  { id: 'vivid', name: 'Vivid Pop', filter: 'saturate(140%) contrast(115%)', values: { brightness: 105, contrast: 115, saturate: 140, blur: 0, sepia: 0, grayscale: 0, hueRotate: 0 } },
  { id: 'cinematic', name: 'Cinematic Warm', filter: 'sepia(25%) contrast(110%) brightness(95%) saturate(120%)', values: { brightness: 95, contrast: 110, saturate: 120, blur: 0, sepia: 25, grayscale: 0, hueRotate: -5 } },
  { id: 'noir', name: 'Film Noir', filter: 'grayscale(100%) contrast(140%) brightness(90%)', values: { brightness: 90, contrast: 140, saturate: 0, blur: 0, sepia: 0, grayscale: 100, hueRotate: 0 } },
  { id: 'cyber', name: 'Cyberpunk', filter: 'hue-rotate(180deg) saturate(160%) contrast(120%)', values: { brightness: 100, contrast: 120, saturate: 160, blur: 0, sepia: 0, grayscale: 0, hueRotate: 180 } },
  { id: 'vintage', name: 'Vintage 70s', filter: 'sepia(60%) contrast(90%) brightness(105%)', values: { brightness: 105, contrast: 90, saturate: 85, blur: 0, sepia: 60, grayscale: 0, hueRotate: 15 } }
];

export const INITIAL_TRACKS = [
  {
    id: 'track-text',
    name: 'Text & Titles',
    type: 'text',
    color: '#d97706',
    muted: false,
    locked: false,
    items: [
      {
        id: 'clip-text-1',
        type: 'text',
        name: 'Title Card',
        text: 'CINEFORGE STUDIO',
        start: 0.5,
        duration: 3.5,
        fontSize: 52,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 8,
        padding: 12,
        x: 50, // %
        y: 80, // %
        opacity: 1
      }
    ]
  },
  {
    id: 'track-video',
    name: 'Video Track 1',
    type: 'video',
    color: '#2563eb',
    muted: false,
    locked: false,
    items: [
      {
        id: 'clip-video-1',
        type: 'video',
        name: 'SMPTE Colors',
        src: '/samples/sample-2.mp4',
        start: 0,
        duration: 3,
        trimStart: 0,
        volume: 1,
        scale: 1,
        x: 0,
        y: 0,
        opacity: 1,
        rotation: 0,
        filters: { ...FILTER_PRESETS[0].values }
      },
      {
        id: 'clip-video-2',
        type: 'video',
        name: 'Test Pattern',
        src: '/samples/sample-1.mp4',
        start: 3,
        duration: 3,
        trimStart: 0,
        volume: 1,
        scale: 1,
        x: 0,
        y: 0,
        opacity: 1,
        rotation: 0,
        filters: { ...FILTER_PRESETS[1].values }
      }
    ]
  },
  {
    id: 'track-audio',
    name: 'Background Audio',
    type: 'audio',
    color: '#059669',
    muted: false,
    locked: false,
    items: [
      {
        id: 'clip-audio-1',
        type: 'audio',
        name: 'Synth Melody',
        src: '/samples/sample-audio.mp3',
        start: 0.2,
        duration: 3,
        trimStart: 0,
        volume: 0.85
      }
    ]
  }
];

export const STOCK_SAMPLES = [
  {
    id: 'stock-smpte',
    type: 'video',
    name: 'SMPTE Color Bars',
    src: '/samples/sample-2.mp4',
    duration: 3,
    category: 'Video',
    thumbnail: '🎬'
  },
  {
    id: 'stock-test',
    type: 'video',
    name: 'Test Pattern & Clock',
    src: '/samples/sample-1.mp4',
    duration: 3,
    category: 'Video',
    thumbnail: '⏱️'
  },
  {
    id: 'stock-synth',
    type: 'audio',
    name: 'Synth Pure Tone',
    src: '/samples/sample-audio.mp3',
    duration: 3,
    category: 'Audio',
    thumbnail: '🎵'
  }
];

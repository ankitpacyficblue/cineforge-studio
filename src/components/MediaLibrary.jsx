import React, { useState } from 'react';
import {
  Upload,
  Film,
  Music,
  Type,
  Plus,
  Sparkles,
  FileVideo,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { STOCK_SAMPLES } from '../constants';

export default function MediaLibrary({ onAddClip, currentTime }) {
  const [activeTab, setActiveTab] = useState('samples'); // 'samples' | 'upload' | 'text'
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Text title presets
  const textPresets = [
    {
      name: 'Main Headline',
      text: 'CINEMATIC STORY',
      fontSize: 56,
      fontWeight: 'bold',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.6)',
      duration: 3
    },
    {
      name: 'Lower Third Subtitle',
      text: 'John Doe • Director & Producer',
      fontSize: 32,
      fontWeight: '500',
      color: '#f3f4f6',
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      y: 85,
      duration: 4
    },
    {
      name: 'Callout Badge',
      text: '★ NEW RELEASE',
      fontSize: 38,
      fontWeight: '800',
      color: '#fbbf24',
      backgroundColor: 'rgba(30, 27, 75, 0.9)',
      duration: 3
    }
  ];

  // Handle local file upload
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      const newFile = {
        id: data.file.id,
        name: data.file.name,
        type: data.file.mimeType.startsWith('audio') ? 'audio' : 'video',
        src: data.file.url,
        duration: 5, // fallback estimate
        category: 'Uploaded'
      };

      setUploadedFiles(prev => [newFile, ...prev]);
    } catch (err) {
      console.warn('Backend upload server not reachable, using local blob URL');
      // Graceful fallback to client-side Object URL
      const localUrl = URL.createObjectURL(files[0]);
      const mime = files[0].type;
      const newFile = {
        id: `local-${Date.now()}`,
        name: files[0].name,
        type: mime.startsWith('audio') ? 'audio' : (mime.startsWith('image') ? 'image' : 'video'),
        src: localUrl,
        duration: 5,
        category: 'Uploaded (Local)'
      };
      setUploadedFiles(prev => [newFile, ...prev]);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-80 bg-[#10131d] border-r border-[#1e2333] flex flex-col h-full shrink-0 select-none">
      {/* Tabs */}
      <div className="flex border-b border-[#1e2333] bg-[#0c0e15] p-1">
        <button
          onClick={() => setActiveTab('samples')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'samples'
              ? 'bg-[#1b2131] text-indigo-400 shadow-sm border border-[#262f46]'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Samples</span>
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'upload'
              ? 'bg-[#1b2131] text-indigo-400 shadow-sm border border-[#262f46]'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload</span>
        </button>

        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'text'
              ? 'bg-[#1b2131] text-indigo-400 shadow-sm border border-[#262f46]'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Text</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Tab 1: Stock Samples */}
        {activeTab === 'samples' && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Built-in Clips & Audio
            </p>
            {STOCK_SAMPLES.map((sample) => (
              <div
                key={sample.id}
                className="bg-[#151926] hover:bg-[#1a2030] p-2.5 rounded-lg border border-[#22293c] transition flex items-center justify-between group"
              >
                <div className="flex items-center space-x-2.5 overflow-hidden">
                  <div className="w-9 h-9 rounded bg-[#1f2638] flex items-center justify-center text-lg shrink-0">
                    {sample.thumbnail}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-medium text-gray-200 truncate">{sample.name}</p>
                    <p className="text-[10px] text-gray-400">{sample.category} • {sample.duration}s</p>
                  </div>
                </div>

                <button
                  onClick={() => onAddClip(sample, currentTime)}
                  className="p-1.5 rounded-md bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition opacity-0 group-hover:opacity-100"
                  title="Add to Timeline at current time"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Upload Media */}
        {activeTab === 'upload' && (
          <div className="space-y-3">
            {/* Upload Dropzone */}
            <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-[#2b344c] hover:border-indigo-500/60 rounded-xl bg-[#141724] cursor-pointer transition group">
              <Upload className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition" />
              <p className="text-xs font-semibold text-gray-300 mt-2">Upload Video, Audio or Image</p>
              <p className="text-[10px] text-gray-500 mt-0.5">MP4, WebM, MP3, WAV, PNG, JPG</p>
              <input
                type="file"
                accept="video/*,audio/*,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {isUploading && (
              <div className="flex items-center space-x-2 text-xs text-indigo-400 bg-indigo-500/10 p-2 rounded border border-indigo-500/20">
                <span className="animate-spin w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full" />
                <span>Processing media asset...</span>
              </div>
            )}

            {/* List of uploaded files */}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Your Uploads ({uploadedFiles.length})
              </p>
              {uploadedFiles.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No uploads yet. Drag & drop above!</p>
              ) : (
                uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="bg-[#151926] hover:bg-[#1a2030] p-2.5 rounded-lg border border-[#22293c] transition flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded bg-[#1f2638] flex items-center justify-center shrink-0">
                        {file.type === 'audio' ? (
                          <Music className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Film className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-medium text-gray-200 truncate">{file.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase">{file.type}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onAddClip(file, currentTime)}
                      className="p-1.5 rounded-md bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition opacity-0 group-hover:opacity-100"
                      title="Add to Timeline"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Text Presets */}
        {activeTab === 'text' && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Text & Title Templates
            </p>
            {textPresets.map((preset, idx) => (
              <div
                key={idx}
                className="bg-[#151926] hover:bg-[#1a2030] p-3 rounded-lg border border-[#22293c] transition group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-200">{preset.name}</span>
                  <button
                    onClick={() =>
                      onAddClip(
                        {
                          type: 'text',
                          name: preset.name,
                          text: preset.text,
                          fontSize: preset.fontSize,
                          fontWeight: preset.fontWeight,
                          color: preset.color,
                          backgroundColor: preset.backgroundColor,
                          duration: preset.duration,
                          y: preset.y || 50
                        },
                        currentTime
                      )
                    }
                    className="flex items-center space-x-1 px-2 py-0.5 rounded bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white text-[11px] font-semibold transition"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>

                <div
                  className="text-center py-2 px-3 rounded bg-black/40 border border-white/5 truncate"
                  style={{ color: preset.color }}
                >
                  <span className="text-xs font-bold">{preset.text}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import {
  Film,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Video,
  Layers,
  Cpu
} from 'lucide-react';

export const STATIC_CREDENTIALS = {
  username: 'admin',
  password: 'studio2026'
};

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const trimmedUser = username.trim().toLowerCase();
      const trimmedPass = password.trim();

      const isValidUser =
        trimmedUser === STATIC_CREDENTIALS.username ||
        trimmedUser === 'creator@cineforge.io';
      const isValidPass = trimmedPass === STATIC_CREDENTIALS.password;

      if (isValidUser && isValidPass) {
        if (rememberMe) {
          localStorage.setItem('cineforge_auth', JSON.stringify({
            user: trimmedUser,
            loggedInAt: new Date().toISOString()
          }));
        } else {
          sessionStorage.setItem('cineforge_auth', JSON.stringify({
            user: trimmedUser,
            loggedInAt: new Date().toISOString()
          }));
        }
        setIsLoading(false);
        onLoginSuccess({ user: trimmedUser });
      } else {
        setIsLoading(false);
        setError('Invalid credentials. Use admin / studio2026 or click "Use Demo Login" below.');
      }
    }, 400);
  };

  const fillDemoCredentials = () => {
    setUsername(STATIC_CREDENTIALS.username);
    setPassword(STATIC_CREDENTIALS.password);
    setError('');
  };

  return (
    <div className="relative min-h-screen w-screen bg-[#07090e] flex items-center justify-center p-4 overflow-hidden select-none font-sans">
      {/* Background Ambient Lighting & Gradients */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Card Container */}
        <div className="bg-[#11141e]/90 backdrop-blur-xl border border-[#23293c] rounded-2xl shadow-2xl shadow-black/80 p-8">
          {/* Logo & Header */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 mb-3.5">
              <Film className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              CineForge Studio
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Professional Web Video Editing & Compositing Suite
            </p>
          </div>

          {/* Static Credentials Helper Pill */}
          <div className="bg-[#171b28] border border-[#262f44] rounded-xl p-3 mb-6 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1 text-[11px] font-semibold text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Demo Access</span>
              </div>
              <p className="text-[11px] text-gray-300 mono-time">
                <span className="text-gray-400">User:</span> <span className="text-indigo-300 font-semibold">{STATIC_CREDENTIALS.username}</span> • <span className="text-gray-400">Pass:</span> <span className="text-indigo-300 font-semibold">{STATIC_CREDENTIALS.password}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[11px] font-semibold transition border border-indigo-500/30 active:scale-95 shrink-0 ml-2"
            >
              Fill Demo
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-[#181c2a] border border-[#293246] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-100 text-xs rounded-xl pl-9 pr-3.5 py-2.5 outline-none transition placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#181c2a] border border-[#293246] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-100 text-xs rounded-xl pl-9 pr-10 py-2.5 outline-none transition placeholder:text-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-[#181c2a] border-[#293246] text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-gray-400 text-[11px]">Remember login session</span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded-xl text-xs flex items-center space-x-2 animate-fadeIn">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition transform active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Open Video Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Highlights Footer */}
          <div className="mt-6 pt-5 border-t border-[#1e2434] grid grid-cols-3 gap-2 text-center text-[10px] text-gray-500">
            <div className="flex flex-col items-center space-y-1">
              <Video className="w-3.5 h-3.5 text-blue-400" />
              <span>Multi-Track</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Canvas Sync</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fast Export</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

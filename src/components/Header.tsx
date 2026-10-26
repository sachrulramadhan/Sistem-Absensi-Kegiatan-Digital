import React from 'react';
import {
  ClipboardCheck,
  Shield,
  UserCheck,
  FileSpreadsheet,
  LogIn,
  LogOut,
  Sparkles,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { googleSignIn, logoutGoogle } from '../services/googleAuth';

interface HeaderProps {
  currentView: 'peserta' | 'admin' | 'live';
  onChangeView: (view: 'peserta' | 'admin' | 'live') => void;
  currentUser: User | null;
  spreadsheetConnected: boolean;
  onOpenIntegrationModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onChangeView,
  currentUser,
  spreadsheetConnected,
  onOpenIntegrationModal,
}) => {
  const [isSigningIn, setIsSigningIn] = React.useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await googleSignIn();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutGoogle();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => onChangeView('peserta')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:bg-emerald-500 transition-colors">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight leading-none">
                  Absensi Digital
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 hidden sm:inline">
                  Google Workspace
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Sistem Registrasi & Presensi Kegiatan
              </p>
            </div>
          </div>

          {/* Center Navigation Switcher (Clean Segmented Control) */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/70">
            <button
              type="button"
              onClick={() => onChangeView('peserta')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'peserta'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Form Peserta</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeView('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'admin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-slate-600" />
              <span>Panel Admin</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeView('live')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'live'
                  ? 'bg-slate-900 text-emerald-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Layar Siaran Langsung (QR Code & Tabel Kehadiran Real-time)"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Layar Live</span>
            </button>
          </div>

          {/* Right Actions: Google Connection & Sign-in */}
          <div className="flex items-center gap-2">
            {/* Google Sheets Status Link */}
            {onOpenIntegrationModal && (
              <button
                type="button"
                onClick={onOpenIntegrationModal}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 transition-colors"
                title="Kelola koneksi Google Sheets & Drive"
              >
                <FileSpreadsheet
                  className={`w-3.5 h-3.5 ${
                    spreadsheetConnected ? 'text-emerald-600' : 'text-amber-500'
                  }`}
                />
                <span className="truncate max-w-[130px]">
                  {spreadsheetConnected ? 'Sheets Terhubung' : 'Setup Sheets'}
                </span>
              </button>
            )}

            {/* Google Auth Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <div
                  className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs ring-2 ring-emerald-100"
                  title={currentUser.email || ''}
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    currentUser.displayName?.charAt(0) || 'U'
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden sm:flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                  title="Logout dari Google"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
              >
                {/* Official Google 'G' icon */}
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span className="hidden sm:inline">
                  {isSigningIn ? 'Menghubungkan...' : 'Login Google'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

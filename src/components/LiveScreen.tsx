import React, { useState, useEffect, useRef, useMemo } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Users,
  Clock,
  Calendar,
  MapPin,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  X,
  Search,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Radio,
  ExternalLink,
  ChevronDown,
  ZoomIn,
} from 'lucide-react';
import type { AttendanceRecord, Kegiatan } from '../types/attendance';
import { playArrivalChime } from '../services/storageService';

interface LiveScreenProps {
  records: AttendanceRecord[];
  kegiatanList: Kegiatan[];
  selectedKegiatanId?: string;
  onClose: () => void;
  onSelectKegiatan?: (id: string) => void;
}

export const LiveScreen: React.FC<LiveScreenProps> = ({
  records,
  kegiatanList,
  selectedKegiatanId,
  onClose,
  onSelectKegiatan,
}) => {
  // Determine active event
  const [currentKegiatanId, setCurrentKegiatanId] = useState<string>(() => {
    if (selectedKegiatanId && kegiatanList.some((k) => k.id === selectedKegiatanId)) {
      return selectedKegiatanId;
    }
    const active = kegiatanList.find((k) => k.status === 'Aktif');
    return active ? active.id : kegiatanList[0]?.id || '';
  });

  const activeKegiatan = useMemo(() => {
    return kegiatanList.find((k) => k.id === currentKegiatanId) || kegiatanList[0] || null;
  }, [kegiatanList, currentKegiatanId]);

  // QR Code canvas & direct link
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const zoomedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [directUrl, setDirectUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isQrZoomed, setIsQrZoomed] = useState(false);

  // Audio chime state (defaults to on, synthesized via Web Audio)
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Live clock
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  // Track recently arrived records (IDs added within last 12 seconds)
  const [recentlyArrivedIds, setRecentlyArrivedIds] = useState<Set<string>>(new Set());
  const prevRecordsLengthRef = useRef(records.length);
  const prevRecordIdsRef = useRef<Set<string>>(new Set(records.map((r) => r.id)));

  // Update clock every second
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' WIB'
      );
      setCurrentDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update QR Code when event changes
  useEffect(() => {
    if (!activeKegiatan) return;

    const baseUrl = window.location.origin + window.location.pathname;
    const url = `${baseUrl}?kegiatan=${encodeURIComponent(activeKegiatan.id)}`;
    setDirectUrl(url);

    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        url,
        {
          width: 220,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('Failed to generate live QR code:', error);
        }
      );
    }
  }, [activeKegiatan]);

  // Update zoomed QR code when zoom modal is opened
  useEffect(() => {
    if (!isQrZoomed || !activeKegiatan || !zoomedCanvasRef.current) return;

    const baseUrl = window.location.origin + window.location.pathname;
    const url = `${baseUrl}?kegiatan=${encodeURIComponent(activeKegiatan.id)}`;

    QRCode.toCanvas(
      zoomedCanvasRef.current,
      url,
      {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      },
      (error) => {
        if (error) console.error('Failed to generate zoomed QR code:', error);
      }
    );
  }, [isQrZoomed, activeKegiatan]);

  // Detect newly added attendance records in real-time
  useEffect(() => {
    const currentIds = new Set(records.map((r) => r.id));
    const prevIds = prevRecordIdsRef.current;

    // Find new IDs
    const newlyAdded: string[] = [];
    currentIds.forEach((id) => {
      if (!prevIds.has(id)) {
        newlyAdded.push(id);
      }
    });

    if (newlyAdded.length > 0) {
      // Highlight these rows
      setRecentlyArrivedIds((prev) => {
        const next = new Set(prev);
        newlyAdded.forEach((id) => next.add(id));
        return next;
      });

      // Play soft chime if audio is enabled
      if (soundEnabled) {
        playArrivalChime();
      }

      // Remove highlight after 10 seconds
      const timeoutId = setTimeout(() => {
        setRecentlyArrivedIds((prev) => {
          const next = new Set(prev);
          newlyAdded.forEach((id) => next.delete(id));
          return next;
        });
      }, 10000);

      return () => clearTimeout(timeoutId);
    }

    prevRecordIdsRef.current = currentIds;
    prevRecordsLengthRef.current = records.length;
  }, [records, soundEnabled]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen error:', err);
    }
  };

  const handleCopyLink = () => {
    if (!directUrl) return;
    navigator.clipboard.writeText(directUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectKegiatan = (id: string) => {
    setCurrentKegiatanId(id);
    if (onSelectKegiatan) {
      onSelectKegiatan(id);
    }
  };

  // Filter records for the active event
  const eventRecords = useMemo(() => {
    if (!activeKegiatan) return [];
    return records.filter(
      (r) =>
        r.kegiatanId === activeKegiatan.id ||
        (r.namaKegiatan &&
          r.namaKegiatan.toLowerCase().includes(activeKegiatan.nama.toLowerCase()))
    );
  }, [records, activeKegiatan]);

  // Filtered by search query (Nama or Instansi)
  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return eventRecords;
    return eventRecords.filter(
      (r) =>
        r.nama.toLowerCase().includes(q) ||
        r.instansi.toLowerCase().includes(q) ||
        r.jam.toLowerCase().includes(q)
    );
  }, [eventRecords, searchQuery]);

  // Summary statistics
  const totalCount = eventRecords.length;
  const onTimeCount = eventRecords.filter((r) => r.status === 'Tepat Waktu').length;
  const lateCount = eventRecords.filter((r) => r.status === 'Terlambat').length;
  const lastArrival = eventRecords[0] || null;

  return (
    <div className="fixed inset-0 z-50 bg-[#f8fafc] text-slate-800 flex flex-col font-sans overflow-hidden antialiased">
      {/* Top Bar / Navigation */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xs">
        {/* Left: Branding & Minimal Live Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <span className="text-xs font-extrabold tracking-wider text-emerald-700 uppercase">
              LIVE MONITORING
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <span aria-hidden="true">·</span>
            <span className="text-slate-600 font-medium">Siaran Presensi Digital</span>
          </div>
        </div>

        {/* Center: Live Running Clock & Date */}
        <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 hidden sm:flex">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentDate}</span>
          </div>
          <span className="text-slate-300 hidden sm:inline" aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5 text-sm font-mono font-bold text-slate-900">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{currentTime}</span>
          </div>
        </div>

        {/* Right: Event Switcher & Action Controls */}
        <div className="flex items-center gap-2">
          {/* Kegiatan Selector */}
          <div className="relative">
            <select
              value={currentKegiatanId}
              onChange={(e) => handleSelectKegiatan(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-semibold rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 cursor-pointer max-w-[200px] sm:max-w-[260px] truncate transition-colors"
              title="Ganti Kegiatan yang Ditampilkan"
            >
              {kegiatanList.map((k) => (
                <option key={k.id} value={k.id} className="bg-white text-slate-900">
                  [{k.id}] {k.nama}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sound Chime Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-colors ${
              soundEnabled
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title={soundEnabled ? 'Bunyi Notifikasi Aktif (Klik untuk Mute)' : 'Bunyi Dimatikan (Klik untuk Aktifkan)'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Proyektor / Layar Penuh'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Close Live Screen */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
            title="Tutup Layar Live"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Split Grid View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 sm:p-6 overflow-hidden min-h-0 bg-[#f8fafc]">
        {/* ======================================================== */}
        {/* LEFT COLUMN: BARCODE / QR CODE KEGIATAN & EVENT METADATA */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4 overflow-y-auto pr-1 pb-3 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          {/* QR Code Container Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col items-center text-center shrink-0">
            <div className="w-full flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold text-emerald-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Barcode Presensi
              </span>
              <span className="text-slate-400 text-xs">Pindai Kamera HP</span>
            </div>

            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight mb-1">
              Pindai untuk Mengisi Absensi
            </h2>
            <p className="text-xs text-slate-500 mb-4 max-w-xs leading-relaxed">
              Arahkan kamera smartphone ke barcode di bawah ini untuk membuka formulir kehadiran digital.
            </p>

            {/* QR Code Canvas Box - clean white with subtle border */}
            <div
              onClick={() => setIsQrZoomed(true)}
              className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-500 transition-all duration-200 hover:scale-[1.02] flex items-center justify-center cursor-pointer group relative shrink-0"
              title="Klik untuk memperbesar barcode"
            >
              <canvas ref={canvasRef} className="block rounded-lg" />
              <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                <span className="bg-white text-slate-900 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1 shadow-md">
                  <ZoomIn className="w-3.5 h-3.5 text-emerald-600" /> Perbesar
                </span>
              </div>
            </div>

            {/* Direct URL copy bar */}
            <div className="w-full mt-4 flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1.5 shrink-0">
              <input
                type="text"
                readOnly
                value={directUrl}
                className="text-xs text-slate-600 font-mono bg-transparent flex-1 px-2.5 py-1 outline-none truncate select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
                title="Salin Link Formulir"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
              <a
                href={directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 transition-colors shrink-0"
                title="Buka Formulir di Tab Baru"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Active Event Details & Live Counter Card */}
          {activeKegiatan && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col gap-3.5 shrink-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold block mb-0.5">
                    {activeKegiatan.id}
                  </span>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                    {activeKegiatan.nama}
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                    activeKegiatan.status === 'Aktif'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : activeKegiatan.status === 'Ditutup'
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {activeKegiatan.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{activeKegiatan.tanggal}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {activeKegiatan.jamMulai || '08:00'} - {activeKegiatan.jamSelesai || 'Selesai'}
                  </span>
                </div>
                <div className="col-span-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{activeKegiatan.lokasi}</span>
                </div>
              </div>

              {/* Live Count Counter */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Total Hadir</div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{totalCount}</div>
                </div>
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-emerald-800 font-semibold uppercase tracking-wider">Tepat Waktu</div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5">{onTimeCount}</div>
                </div>
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-center">
                  <div className="text-[10px] text-amber-800 font-semibold uppercase tracking-wider">Terlambat</div>
                  <div className="text-xl sm:text-2xl font-black text-amber-700 mt-0.5">{lateCount}</div>
                </div>
              </div>

              {/* Latest Arrival Banner */}
              {lastArrival && (
                <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {lastArrival.nama.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1.5">
                      <span>Kedatangan Terakhir</span>
                      <span className="text-emerald-700 font-mono font-semibold">· {lastArrival.jam} WIB</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 truncate">{lastArrival.nama}</div>
                    <div className="text-[11px] text-slate-500 truncate">{lastArrival.instansi}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: TABEL ABSENSI LIVE (Nama, Instansi, Jam)  */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden min-h-0">
          {/* Table Header Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                    Daftar Hadir Terkini
                  </h3>
                  <span className="text-xs font-mono text-emerald-700 font-bold">
                    ({filteredRecords.length} Peserta)
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Data kehadiran diperbarui secara otomatis secara real-time
                </p>
              </div>
            </div>

            {/* Search Filter */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau instansi..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Table Container (Scrollable) */}
          <div className="flex-1 overflow-auto">
            {filteredRecords.length === 0 ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
                  <QrCode className="w-7 h-7 text-slate-400" />
                </div>
                <h4 className="text-base font-bold text-slate-800 mb-1">
                  {searchQuery ? 'Tidak Ada Data Sesuai Pencarian' : 'Belum Ada Peserta yang Hadir'}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  {searchQuery
                    ? `Tidak ditemukan peserta dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
                    : 'Arahkan kamera smartphone ke barcode di samping untuk mulai mengisi daftar kehadiran.'}
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50/95 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th scope="col" className="px-4 py-3.5 w-14 text-center">
                      No
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Nama Peserta
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Instansi / Asal
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-center w-32">
                      Jam Datang
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-center w-28">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((record, index) => {
                    const isNewlyArrived = recentlyArrivedIds.has(record.id);

                    return (
                      <tr
                        key={record.id}
                        className={`transition-all duration-300 ${
                          isNewlyArrived
                            ? 'bg-emerald-50/80 border-l-4 border-emerald-500 text-slate-900 ring-1 ring-emerald-200'
                            : index % 2 === 0
                            ? 'bg-white hover:bg-slate-50/70'
                            : 'bg-slate-50/30 hover:bg-slate-50/70'
                        }`}
                      >
                        {/* No */}
                        <td className="px-4 py-3.5 text-center font-mono font-medium text-slate-400">
                          #{index + 1}
                        </td>

                        {/* Nama Peserta */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                isNewlyArrived
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                              }`}
                            >
                              {record.nama.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 flex items-center gap-1.5 truncate">
                                <span>{record.nama}</span>
                                {isNewlyArrived && (
                                  <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.2 rounded bg-emerald-600 text-white">
                                    BARU
                                  </span>
                                )}
                              </div>
                              {record.jabatan && (
                                <div className="text-[11px] text-slate-500 truncate">
                                  {record.jabatan}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Instansi / Asal */}
                        <td className="px-4 py-3.5 text-slate-700">
                          <span className="truncate max-w-[240px] block font-medium">{record.instansi}</span>
                        </td>

                        {/* Jam Datang */}
                        <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-800">
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                            <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{record.jam || record.timestamp.split(' ')[1] || '-'}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              record.status === 'Tepat Waktu'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : record.status === 'Terlambat'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {record.status === 'Tepat Waktu' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                            )}
                            <span>{record.status}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Table Footer Bar */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Siaran Langsung Terhubung ke Database Absensi Digital</span>
            </div>
            <div className="flex items-center gap-3 font-medium">
              <span>
                Total Tampil: <strong className="text-slate-900">{filteredRecords.length}</strong> orang
              </span>
              <span>·</span>
              <span className="text-slate-400">Mode proyektor aktif (F11)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Zoomed QR Code Modal (for projector / large hall) */}
      {isQrZoomed && (
        <div
          className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsQrZoomed(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsQrZoomed(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
              title="Tutup Tampilan Penuh"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
              TAMPILAN PENUH BARCODE
            </span>

            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-1">
              {activeKegiatan?.nama || 'Barcode Kegiatan'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Pindai menggunakan kamera ponsel untuk mengisi absensi secara langsung
            </p>

            <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200 mb-4">
              <canvas ref={zoomedCanvasRef} className="block rounded-lg" />
            </div>

            <p className="text-xs font-mono text-emerald-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 mb-4 truncate max-w-full">
              {directUrl}
            </p>

            <button
              type="button"
              onClick={() => setIsQrZoomed(false)}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors shadow-xs"
            >
              Tutup Tampilan Penuh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

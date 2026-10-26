import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check, ExternalLink, Calendar, MapPin, Radio } from 'lucide-react';
import type { Kegiatan } from '../types/attendance';

interface QRCodeModalProps {
  isOpen: boolean;
  kegiatan: Kegiatan | null;
  onClose: () => void;
  onOpenLiveScreen?: (kegiatanId: string) => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  kegiatan,
  onClose,
  onOpenLiveScreen,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');

  useEffect(() => {
    if (!isOpen || !kegiatan) return;

    // Build the direct attendance URL
    const baseUrl = window.location.origin + window.location.pathname;
    const url = `${baseUrl}?kegiatan=${encodeURIComponent(kegiatan.id)}`;
    setTargetUrl(url);

    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        url,
        {
          width: 260,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('Error generating QR code:', error);
        }
      );
    }
  }, [isOpen, kegiatan]);

  if (!isOpen || !kegiatan) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a composite high-resolution canvas with header and event info for printing
    const printCanvas = document.createElement('canvas');
    printCanvas.width = 600;
    printCanvas.height = 750;
    const ctx = printCanvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, printCanvas.width, printCanvas.height);

    // Decorative top bar
    ctx.fillStyle = '#059669'; // Emerald-600
    ctx.fillRect(0, 0, printCanvas.width, 16);

    // Header Title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCAN UNTUK ABSENSI', 300, 70);

    // Event Title
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#047857';
    const titleLines = kegiatan.nama.length > 36 ? [kegiatan.nama.slice(0, 36), kegiatan.nama.slice(36)] : [kegiatan.nama];
    ctx.fillText(titleLines[0], 300, 115);
    if (titleLines[1]) {
      ctx.fillText(titleLines[1], 300, 145);
    }

    // Date & Location
    ctx.fillStyle = '#475569';
    ctx.font = '16px sans-serif';
    ctx.fillText(`Tanggal: ${kegiatan.tanggal} | Lokasi: ${kegiatan.lokasi}`, 300, 185);

    // Draw QR code centered
    ctx.drawImage(canvas, 170, 220, 260, 260);

    // Instructions
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('Arahkan Kamera HP ke QR Code', 300, 530);

    ctx.fillStyle = '#64748b';
    ctx.font = '14px sans-serif';
    ctx.fillText('Form absensi digital akan terbuka secara otomatis', 300, 560);
    ctx.fillText('Sistem Absensi Terintegrasi Google Sheets', 300, 680);

    // Download image
    const link = document.createElement('a');
    link.download = `QR_Absensi_${kegiatan.id}_${kegiatan.nama.slice(0, 15).replace(/\s+/g, '_')}.png`;
    link.href = printCanvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-base">QR Code Absensi Kegiatan</h3>
            <p className="text-xs text-slate-500">Siap dipajang / diproyeksikan untuk peserta</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col items-center text-center">
          {/* Event Badge */}
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 w-full mb-4 text-left">
            <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mb-1">
              {kegiatan.id}
            </span>
            <h4 className="font-bold text-slate-900 text-sm">{kegiatan.nama}</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {kegiatan.tanggal}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {kegiatan.lokasi}
              </span>
            </div>
          </div>

          {/* QR Code Canvas */}
          <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-sm mb-4 inline-block">
            <canvas ref={canvasRef} className="rounded-lg block" />
          </div>

          <p className="text-xs text-slate-600 mb-4 max-w-xs">
            Peserta cukup memindai QR Code menggunakan kamera ponsel untuk langsung membuka form kehadiran ini.
          </p>

          {/* URL box */}
          <div className="w-full flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 mb-4">
            <input
              type="text"
              readOnly
              value={targetUrl}
              className="text-xs text-slate-700 bg-transparent flex-1 px-2 py-1 outline-none truncate font-mono select-all"
            />
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Tersalin' : 'Salin'}
            </button>
          </div>

          {/* Action buttons */}
          <div className="w-full space-y-2">
            {onOpenLiveScreen && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLiveScreen(kegiatan.id);
                }}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-emerald-400 border border-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl shadow-xs transition-colors"
              >
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Buka Layar Siaran Langsung (QR + Tabel Live)</span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 px-3 rounded-xl shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Gambar
              </button>
              <a
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold py-2.5 px-3 rounded-xl shadow-xs transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Tes Buka Form
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

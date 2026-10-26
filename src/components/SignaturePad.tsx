import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, PenTool, CheckCircle2 } from 'lucide-react';

interface SignaturePadProps {
  onSignatureChange: (dataUrl: string | null) => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSignatureChange }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Initialize canvas with high-dpi resolution
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // Only resize if changed to avoid clearing while drawing
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#1e293b'; // slate-800
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else if ('clientX' in e) {
      return {
        x: (e as MouseEvent).clientX - rect.left,
        y: (e as MouseEvent).clientY - rect.top,
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e.nativeEvent);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e.nativeEvent);
    ctx.lineTo(x, y);
    ctx.stroke();

    if (!hasSignature) {
      setHasSignature(true);
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && hasSignature) {
      const dataUrl = canvas.toDataURL('image/png');
      onSignatureChange(dataUrl);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasSignature(false);
    onSignatureChange(null);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
          <PenTool className="w-4 h-4 text-emerald-600" />
          Tanda Tangan Digital <span className="text-red-500">*</span>
        </label>
        {hasSignature && (
          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Terisi
          </span>
        )}
      </div>

      <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-white hover:border-emerald-400 transition-colors overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-44 touch-none cursor-crosshair block"
        />

        {!hasSignature && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 text-sm">
            <PenTool className="w-8 h-8 mb-1 stroke-1 text-slate-300" />
            <p className="font-medium text-slate-500">Bubuhkan tanda tangan di sini</p>
            <p className="text-xs text-slate-400">Gunakan jari (layar sentuh) atau mouse</p>
          </div>
        )}

        {/* Clear button positioned inside bottom-right */}
        <div className="absolute bottom-2.5 right-2.5">
          <button
            type="button"
            onClick={handleClear}
            disabled={!hasSignature}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all shadow-xs ${
              hasSignature
                ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:text-red-600 active:scale-95'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Hapus Tanda Tangan
          </button>
        </div>
      </div>
      <p className="text-[11px] text-slate-500 mt-1">
        Tanda tangan akan disimpan secara aman ke Google Drive dan tautannya dicatat di Google Sheets.
      </p>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  ZoomIn,
  Move,
  Crop,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { LogoCropData } from '../types';
import { uploadFileToStorage } from '../lib/settings';

interface LogoCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLogoUrl?: string;
  initialCropData?: LogoCropData;
  onSaveLogo: (logoUrl: string, cropData: LogoCropData) => Promise<void>;
}

export const LogoCropModal: React.FC<LogoCropModalProps> = ({
  isOpen,
  onClose,
  currentLogoUrl,
  initialCropData,
  onSaveLogo,
}) => {
  const [imageSrc, setImageSrc] = useState<string>(currentLogoUrl || '');
  const [zoom, setZoom] = useState<number>(initialCropData?.zoom || 1.0);
  const [posX, setPosX] = useState<number>(initialCropData?.x || 0);
  const [posY, setPosY] = useState<number>(initialCropData?.y || 0);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | 'custom'>(
    initialCropData?.aspectRatio || '1:1'
  );
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setImageSrc(currentLogoUrl || '');
      setZoom(initialCropData?.zoom || 1.0);
      setPosX(initialCropData?.x || 0);
      setPosY(initialCropData?.y || 0);
      setAspectRatio(initialCropData?.aspectRatio || '1:1');
      setErrorMsg('');
    }
  }, [isOpen, currentLogoUrl, initialCropData]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Harap pilih file gambar valid (PNG, JPG, SVG, WebP)');
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
      setPosX(0);
      setPosY(0);
      setZoom(1.0);
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageSrc) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - posX, y: e.clientY - posY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosX(e.clientX - dragStartRef.current.x);
    setPosY(e.clientY - dragStartRef.current.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Generate cropped image from canvas
  const handleApplyCropAndUpload = async () => {
    if (!imageSrc) {
      setErrorMsg('Pilih file logo terlebih dahulu dari perangkat Anda.');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Gagal memproses file gambar'));
      });

      // Canvas dimensions based on aspect ratio
      let targetWidth = 400;
      let targetHeight = 400;
      if (aspectRatio === '16:9') {
        targetHeight = Math.round(targetWidth * (9 / 16));
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Canvas rendering context tidak didukung');

      ctx.clearRect(0, 0, targetWidth, targetHeight);
      ctx.save();

      // Center and apply transform
      ctx.translate(targetWidth / 2 + posX, targetHeight / 2 + posY);
      ctx.scale(zoom, zoom);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      // Convert canvas to Blob
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png')
      );

      if (!blob) throw new Error('Gagal mengekspor hasil crop logo');

      const fileName = `logo-${Date.now()}.png`;
      const uploadRes = await uploadFileToStorage('app-assets', blob, fileName);

      const cropMetadata: LogoCropData = {
        x: posX,
        y: posY,
        zoom,
        aspectRatio,
      };

      await onSaveLogo(uploadRes.url, cropMetadata);
      setIsUploading(false);
      onClose();
    } catch (err: any) {
      setIsUploading(false);
      setErrorMsg(err?.message || 'Gagal mengunggah logo ke Supabase Storage');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Editor Logo &amp; Crop Positioning
              </h3>
              <p className="text-xs text-slate-400">
                Unggah file gambar dari komputer, atur posisi X/Y, zoom, dan aspek rasio.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* File Upload Selector */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 px-6 border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-2xl bg-slate-950/50 hover:bg-slate-950 text-slate-300 hover:text-white transition flex flex-col items-center justify-center space-y-2 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-purple-600/30 flex items-center justify-center text-slate-400 group-hover:text-purple-300 transition">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-center">
                <span className="text-xs font-bold text-white block">
                  Pilih File Gambar dari Perangkat (Upload File)
                </span>
                <span className="text-[11px] text-slate-400">
                  Mendukung format PNG, JPG, WebP, SVG transparan
                </span>
              </div>
            </button>
          </div>

          {/* Canvas Crop Area */}
          {imageSrc ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Area Pratinjau &amp; Geser Gambar (Drag to Pan)
                </span>
                <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAspectRatio('1:1')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      aspectRatio === '1:1'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    1:1 (Persegi)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('16:9')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      aspectRatio === '16:9'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    16:9 (Banner)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('custom')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      aspectRatio === 'custom'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Bebas
                  </button>
                </div>
              </div>

              {/* Interactive Viewport Box */}
              <div
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={`relative w-full overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center cursor-grab active:cursor-grabbing select-none ${
                  aspectRatio === '16:9' ? 'h-52' : 'h-64'
                }`}
              >
                {/* Guide overlay */}
                <div className="absolute inset-0 pointer-events-none border border-purple-500/30 rounded-2xl z-10 grid grid-cols-3 grid-rows-3 opacity-30">
                  <div className="border-r border-b border-purple-500/20" />
                  <div className="border-r border-b border-purple-500/20" />
                  <div className="border-b border-purple-500/20" />
                  <div className="border-r border-b border-purple-500/20" />
                  <div className="border-r border-b border-purple-500/20" />
                  <div className="border-b border-purple-500/20" />
                  <div className="border-r border-purple-500/20" />
                  <div className="border-r border-purple-500/20" />
                  <div />
                </div>

                {/* Transformed image */}
                <img
                  src={imageSrc}
                  alt="Crop Preview"
                  draggable={false}
                  style={{
                    transform: `translate(${posX}px, ${posY}px) scale(${zoom})`,
                    transition: isDragging ? 'none' : 'transform 0.05s ease-out',
                  }}
                  className="max-h-full max-w-full object-contain pointer-events-none"
                />
              </div>

              {/* Sliders for Precision Adjustment */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                {/* Zoom Slider */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1.5">
                    <span className="flex items-center gap-1">
                      <ZoomIn className="w-3.5 h-3.5 text-purple-400" />
                      Zoom / Scaling
                    </span>
                    <span>{zoom.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                {/* Position X */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1.5">
                    <span className="flex items-center gap-1">
                      <Move className="w-3.5 h-3.5 text-purple-400" />
                      Geser X-Axis
                    </span>
                    <span>{posX}px</span>
                  </div>
                  <input
                    type="range"
                    min="-200"
                    max="200"
                    step="2"
                    value={posX}
                    onChange={(e) => setPosX(parseInt(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                {/* Position Y */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1.5">
                    <span className="flex items-center gap-1">
                      <Move className="w-3.5 h-3.5 text-purple-400" />
                      Geser Y-Axis
                    </span>
                    <span>{posY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-200"
                    max="200"
                    step="2"
                    value={posY}
                    onChange={(e) => setPosY(parseInt(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Mini Circular & Pill Live Previews */}
              <div className="flex items-center space-x-4 p-3 bg-slate-950/40 rounded-2xl border border-slate-800/80">
                <span className="text-xs text-slate-400">Pratinjau Tampilan Header:</span>
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center p-1">
                  <img
                    src={imageSrc}
                    alt="Pill"
                    style={{
                      transform: `translate(${posX * 0.15}px, ${posY * 0.15}px) scale(${zoom})`,
                    }}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPosX(0);
                    setPosY(0);
                    setZoom(1.0);
                  }}
                  className="ml-auto text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Posisi</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs">
              Belum ada file gambar yang dipilih. Silakan klik tombol di atas untuk mengunggah file.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 flex items-center justify-between bg-slate-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleApplyCropAndUpload}
            disabled={!imageSrc || isUploading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center space-x-2 cursor-pointer shadow-lg shadow-purple-900/40 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mengunggah ke Supabase Storage (app-assets)...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Terapkan &amp; Unggah Logo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

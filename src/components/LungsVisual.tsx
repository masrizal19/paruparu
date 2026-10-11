import React, { useState, useRef } from 'react';
import { Volume2, CheckCircle2, Info, Activity, Wind, Sparkles } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface LungsVisualProps {
  interactive?: boolean;
  score?: number;
}

export const LungsVisual: React.FC<LungsVisualProps> = ({
  interactive = true,
  score = 98,
}) => {
  const { settings } = useSettings();
  const [activeNode, setActiveNode] = useState<number | null>(null);

  const inspectionNodes = [
    {
      id: 1,
      x: '38%',
      y: '38%',
      lobe: 'Lobus Superior Kanan',
      status: 'Akustik Vesikuler Bersih',
      freq: '240 - 380 Hz',
      airflow: 'Aliran Udara Bebas Obstruksi',
    },
    {
      id: 2,
      x: '62%',
      y: '42%',
      lobe: 'Lobus Superior Kiri',
      status: 'Suara Napas Murni',
      freq: '250 - 410 Hz',
      airflow: 'Resonansi Paru Simetris',
    },
    {
      id: 3,
      x: '34%',
      y: '68%',
      lobe: 'Lobus Inferior Kanan',
      status: 'Bebas Ronki & Wheezing',
      freq: '180 - 320 Hz',
      airflow: 'Ekspansi Diafragma Optimal',
    },
    {
      id: 4,
      x: '65%',
      y: '68%',
      lobe: 'Lobus Inferior Kiri',
      status: 'Tidak Ada Kongesti Cairan',
      freq: '190 - 330 Hz',
      airflow: 'Pertukaran Gas SpO2 99%',
    },
  ];

  // Animation CSS mapping based on admin settings
  const animType = settings.lung_animation_type || 'breathing';
  const animSpeed = settings.lung_animation_speed || 'normal';

  let animationClass = 'animate-lungs-breath';
  if (animType === 'pulse') animationClass = 'animate-pulse';
  if (animType === 'glow-neon') animationClass = 'animate-bounce';
  if (animType === 'floating') animationClass = 'animate-pulse';
  if (animType === 'static') animationClass = '';

  let durationStyle = '3s';
  if (animSpeed === 'slow') durationStyle = '5s';
  if (animSpeed === 'fast') durationStyle = '1.8s';

  // If custom image is set by admin
  if (settings.lungIconType === 'custom-image' && (settings.customLungIconUrl || settings.custom_lung_icon_path)) {
    const imageUrl = settings.customLungIconUrl || settings.custom_lung_icon_path;
    return (
      <div className="relative w-full max-w-md mx-auto aspect-[1/1] flex items-center justify-center select-none">
        <div className={`absolute inset-0 bg-gradient-to-tr from-cyan-100/40 via-rose-100/30 to-blue-100/40 rounded-full blur-3xl pointer-events-none transform scale-90 ${animType === 'glow-neon' ? 'animate-pulse' : ''}`} />
        <div
          className={`relative w-4/5 h-4/5 flex items-center justify-center ${animationClass}`}
          style={{ animationDuration: durationStyle }}
        >
          <img
            src={imageUrl}
            alt="Custom Lungs Visual"
            className="w-full h-full object-contain drop-shadow-[0_20px_35px_rgba(100,116,139,0.25)] rounded-3xl"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        {interactive && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-white/90 shadow-xs text-[10px] font-medium text-slate-600 flex items-center space-x-1.5">
            <Sparkles className="w-3 h-3 text-[#FF5C50]" />
            <span>Ikon Kustom • {animType} ({animSpeed})</span>
          </div>
        )}
      </div>
    );
  }

  // Cyber Cyan Hologram Preset
  if (settings.lungIconType === 'cyber-cyan') {
    return (
      <div className="relative w-full max-w-md mx-auto aspect-[1/1] flex items-center justify-center select-none">
        <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div
          className={`relative w-full h-full flex items-center justify-center ${animationClass}`}
          style={{ animationDuration: durationStyle }}
        >
          <svg
            viewBox="0 0 500 500"
            className="w-full h-full drop-shadow-[0_0_35px_rgba(6,182,212,0.45)]"
            fill="none"
          >
            <defs>
              <linearGradient id="cyberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0284C7" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <path
              d="M243 100 L243 180 Q243 195 235 205 L215 225 M257 100 L257 180 Q257 195 265 205 L285 225"
              stroke="#06B6D4"
              strokeWidth="9"
              strokeLinecap="round"
            />
            {/* Left lobe */}
            <path
              d="M265 190 C310 180, 375 220, 385 290 C395 360, 375 425, 335 440 C295 455, 275 405, 260 380 C250 350, 252 240, 265 190 Z"
              fill="url(#cyberGrad)"
              stroke="#22D3EE"
              strokeWidth="3.5"
            />
            {/* Right lobe */}
            <path
              d="M235 190 C190 180, 125 220, 115 290 C105 360, 125 425, 165 440 C205 455, 225 405, 240 380 C250 350, 248 240, 235 190 Z"
              fill="url(#cyberGrad)"
              stroke="#22D3EE"
              strokeWidth="3.5"
            />
          </svg>
        </div>
        {interactive && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-cyan-950/85 text-cyan-300 backdrop-blur-md border border-cyan-800/80 shadow-xs text-[10px] font-semibold flex items-center space-x-1.5">
            <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>Cyber Cyan • {animType}</span>
          </div>
        )}
      </div>
    );
  }

  // Minimalist Line Preset
  if (settings.lungIconType === 'minimal-outline') {
    return (
      <div className="relative w-full max-w-md mx-auto aspect-[1/1] flex items-center justify-center select-none">
        <div className="absolute inset-0 bg-slate-200/40 rounded-full blur-3xl pointer-events-none" />
        <div
          className={`relative w-full h-full flex items-center justify-center ${animationClass}`}
          style={{ animationDuration: durationStyle }}
        >
          <svg viewBox="0 0 500 500" className="w-full h-full" fill="none">
            <path
              d="M250 110 L250 190 M250 190 L220 230 M250 190 L280 230"
              stroke="#334155"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M260 190 C315 185, 380 230, 390 300 C400 370, 370 435, 325 445 C280 455, 260 410, 250 380 C240 410, 220 455, 175 445 C130 435, 100 370, 110 300 C120 230, 185 185, 240 190 Z"
              stroke="#334155"
              strokeWidth="6"
              fill="rgba(241, 245, 249, 0.6)"
            />
          </svg>
        </div>
        {interactive && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-md border border-slate-700 shadow-xs text-[10px] font-semibold flex items-center space-x-1.5">
            <Wind className="w-3 h-3 text-slate-300" />
            <span>Minimalist Vector • {animType}</span>
          </div>
        )}
      </div>
    );
  }

  // Hologram Pulse Preset
  if (settings.lungIconType === 'hologram-pulse') {
    return (
      <div className="relative w-full max-w-md mx-auto aspect-[1/1] flex items-center justify-center select-none">
        <div className="absolute inset-0 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div
          className={`relative w-full h-full flex items-center justify-center ${animationClass}`}
          style={{ animationDuration: durationStyle }}
        >
          <svg viewBox="0 0 500 500" className="w-full h-full drop-shadow-lg" fill="none">
            <defs>
              <linearGradient id="holoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818CF8" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#C084FC" stopOpacity="0.35" />
              </linearGradient>
            </defs>
            <path
              d="M250 90 L250 180 M245 180 Q230 200 215 220 M255 180 Q270 200 285 220"
              stroke="#6366F1"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M265 190 C320 180, 385 220, 395 295 C405 370, 380 435, 335 445 C290 455, 270 410, 255 385 C245 350, 248 240, 265 190 Z"
              fill="url(#holoGrad)"
              stroke="#818CF8"
              strokeWidth="4"
            />
            <path
              d="M235 190 C180 180, 115 220, 105 295 C95 370, 120 435, 165 445 C210 455, 230 410, 245 385 C255 350, 252 240, 235 190 Z"
              fill="url(#holoGrad)"
              stroke="#818CF8"
              strokeWidth="4"
            />
          </svg>
        </div>
        {interactive && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-950/80 text-indigo-200 backdrop-blur-md border border-indigo-800/80 shadow-xs text-[10px] font-semibold flex items-center space-x-1.5">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Holographic Bio-Impedance • {animType}</span>
          </div>
        )}
      </div>
    );
  }

  // DEFAULT PRESET: Neon BIOS Anatomis (Glassmorphism 3D Lungs with glowing lobes)
  return (
    <div className="relative w-full max-w-md mx-auto aspect-[1/1] flex items-center justify-center select-none">
      {/* Ambient Glow background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#FF5C50]/15 via-rose-300/20 to-blue-300/15 rounded-full blur-3xl pointer-events-none transform scale-90" />

      {/* Main Container with Admin Selected Animation */}
      <div
        className={`relative w-full h-full flex items-center justify-center ${animationClass}`}
        style={{ animationDuration: durationStyle }}
      >
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full drop-shadow-[0_25px_35px_rgba(150,71,61,0.2)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Lobe Gradients */}
            <linearGradient id="rightLobeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF7368" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#E0483C" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#96473D" stopOpacity="0.85" />
            </linearGradient>

            <linearGradient id="leftLobeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF8B80" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#FF5C50" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#C55345" stopOpacity="0.85" />
            </linearGradient>

            <linearGradient id="tracheaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#475569" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#1E293B" stopOpacity="0.9" />
            </linearGradient>

            <filter id="glassGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Trachea & Bronchi (Main Airways) */}
          <path
            d="M241 80 L241 165 Q241 185 220 205 L190 225 M259 80 L259 165 Q259 185 280 205 L310 225"
            stroke="url(#tracheaGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M250 75 L250 170"
            stroke="#94A3B8"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* RIGHT LUNG (3 Lobes: Superior, Middle, Inferior) */}
          <g filter="url(#glassGlow)" className="transition-all duration-300">
            {/* Superior Lobe */}
            <path
              d="M238 190 C185 180, 110 210, 105 270 C100 310, 130 330, 175 330 C215 330, 235 305, 245 270 C252 245, 252 210, 238 190 Z"
              fill="url(#rightLobeGrad)"
              stroke="#FFA096"
              strokeWidth="2.5"
            />
            {/* Middle Lobe */}
            <path
              d="M175 335 C125 335, 105 365, 115 400 C125 435, 175 445, 215 425 C240 410, 250 380, 245 350 C242 338, 210 335, 175 335 Z"
              fill="url(#rightLobeGrad)"
              stroke="#FFA096"
              strokeWidth="2.5"
              fillOpacity="0.9"
            />
            {/* Inferior Lobe / Cardiac Notch accent */}
            <path
              d="M220 428 C195 445, 150 445, 135 410 C125 390, 140 370, 160 365 C185 360, 215 390, 220 428 Z"
              fill="#96473D"
              fillOpacity="0.4"
            />
          </g>

          {/* LEFT LUNG (2 Lobes: Superior, Inferior + Cardiac Notch) */}
          <g filter="url(#glassGlow)" className="transition-all duration-300">
            {/* Superior Lobe */}
            <path
              d="M262 190 C315 180, 390 210, 395 270 C400 310, 370 330, 325 330 C285 330, 265 305, 255 270 C248 245, 248 210, 262 190 Z"
              fill="url(#leftLobeGrad)"
              stroke="#FFC2BC"
              strokeWidth="2.5"
            />
            {/* Inferior Lobe */}
            <path
              d="M325 335 C375 335, 395 365, 385 400 C375 435, 325 445, 285 425 C260 410, 250 380, 255 350 C258 338, 290 335, 325 335 Z"
              fill="url(#leftLobeGrad)"
              stroke="#FFC2BC"
              strokeWidth="2.5"
              fillOpacity="0.9"
            />
          </g>

          {/* Bronchial Tree Internal Branch Highlights */}
          <path
            d="M230 220 Q180 250 145 290 M235 260 Q190 300 160 380 M270 220 Q320 250 355 290 M265 260 Q310 300 340 380"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Interactive Inspection Nodes (Auscultation points) */}
          {interactive &&
            inspectionNodes.map((node) => {
              const isSelected = activeNode === node.id;
              return (
                <g key={node.id} className="cursor-pointer" onClick={() => setActiveNode(node.id)}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? '12' : '8'}
                    fill={isSelected ? '#FF5C50' : '#ffffff'}
                    stroke="#E0483C"
                    strokeWidth="3"
                    className="transition-all duration-200 animate-pulse drop-shadow-md"
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? '22' : '14'}
                    fill="none"
                    stroke="#FF5C50"
                    strokeWidth="1.5"
                    opacity={isSelected ? '0.8' : '0.4'}
                  />
                </g>
              );
            })}
        </svg>

        {/* Selected Lobe Auscultation Popup Card */}
        {interactive && activeNode && (
          <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-md border border-rose-100 p-3.5 rounded-2xl shadow-xl max-w-xs z-20 animate-in fade-in slide-in-from-top-2 text-left">
            {(() => {
              const node = inspectionNodes.find((n) => n.id === activeNode);
              if (!node) return null;
              return (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-900">{node.lobe}</span>
                    <button
                      onClick={() => setActiveNode(null)}
                      className="text-slate-400 hover:text-slate-700 font-bold text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-[10px] text-emerald-600 font-bold">{node.status}</p>
                  <p className="text-[10px] text-slate-500 font-mono">Frekuensi: {node.freq}</p>
                  <p className="text-[10px] text-slate-600 font-medium">{node.airflow}</p>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Footer Pill Badge */}
      {interactive && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-white/90 shadow-xs text-[10px] font-semibold text-slate-700 flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Auskultasi Aktif • Klik titik lobus untuk detail</span>
        </div>
      )}
    </div>
  );
};

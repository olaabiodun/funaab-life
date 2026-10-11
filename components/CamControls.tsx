import React, { useEffect, useState } from 'react';
import { camApi } from '../game/world';

// Hidden by default: one small button. Gestures (drag / pinch / twist) are the main controls.
export default function CamControls() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setOpen(false), 6000);
    return () => clearTimeout(t);
  }, [open]);

  const Btn = ({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) => (
    <button
      aria-label={label}
      onClick={() => { onClick(); setOpen(true); }}
      className="w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow-md border border-white/80 text-slate-700 text-base font-black flex items-center justify-center active:scale-90 transition-transform"
    >
      {children}
    </button>
  );

  return (
    <div className="absolute right-2 top-[138px] z-20 flex flex-col items-center gap-1.5">
      <button
        aria-label="Camera controls"
        onClick={() => setOpen((o) => !o)}
        className={`w-9 h-9 rounded-full shadow-md border text-base flex items-center justify-center active:scale-90 transition-all ${
          open ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white/85 backdrop-blur border-white/80 text-slate-700'
        }`}
      >
        🧭
      </button>
      {open && (
        <div className="flex flex-col gap-1.5 anim-fade">
          <Btn label="Zoom in" onClick={() => camApi.zoom(0.78)}>＋</Btn>
          <Btn label="Zoom out" onClick={() => camApi.zoom(1.28)}>－</Btn>
          <Btn label="Rotate left" onClick={() => camApi.rotate(0.5)}>⟲</Btn>
          <Btn label="Rotate right" onClick={() => camApi.rotate(-0.5)}>⟳</Btn>
          <Btn label="Find me" onClick={() => camApi.recenter()}>🎯</Btn>
        </div>
      )}
    </div>
  );
}

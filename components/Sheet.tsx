import React from 'react';
import { useGame } from '../game/store';

export default function Sheet({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) {
  const setTab = useGame((s) => s.setTab);
  return (
    <div className="absolute inset-x-0 bottom-[72px] z-30 px-2 pointer-events-none mb-[env(safe-area-inset-bottom)]">
      <div className="pointer-events-auto max-w-xl mx-auto max-h-[56vh] flex flex-col rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl border border-white/80 anim-up overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-2.5 pb-2">
          <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-9 h-1 rounded-full bg-slate-300" />
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xl">{emoji}</span>
            <h2 className="text-sm font-black text-slate-900">{title}</h2>
          </div>
          <button onClick={() => setTab('map')} className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 text-xs font-black active:scale-90 transition-transform">
            ✕
          </button>
        </div>
        <div className="overflow-y-auto px-3 pb-3 flex-1">{children}</div>
      </div>
    </div>
  );
}

export function Segments<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { id: T; label: string }[] }) {
  return (
    <div className="flex gap-1 p-1 rounded-2xl bg-slate-100 mb-2.5">
      {items.map((i) => (
        <button
          key={i.id}
          onClick={() => onChange(i.id)}
          className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 ${
            value === i.id ? 'bg-white text-emerald-700 shadow' : 'text-slate-500'
          }`}
        >
          {i.label}
        </button>
      ))}
    </div>
  );
}

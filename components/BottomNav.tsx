import React from 'react';
import { Tab, useGame } from '../game/store';
import { sound } from '../game/sound';

const TABS: { id: Tab; emoji: string; label: string }[] = [
  { id: 'map', emoji: '🗺️', label: 'Map' },
  { id: 'places', emoji: '📍', label: 'Places' },
  { id: 'hustle', emoji: '💼', label: 'Hustle' },
  { id: 'me', emoji: '🎒', label: 'Me' },
];

export default function BottomNav() {
  const tab = useGame((s) => s.tab);
  const setTab = useGame((s) => s.setTab);
  const claimable = useGame((s) => s.claimed.length);
  return (
    <nav className="absolute bottom-0 inset-x-0 z-40 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pointer-events-none">
      <div className="pointer-events-auto max-w-md mx-auto h-[58px] rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl border border-white/80 p-1 flex gap-1">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                sound.click();
                setTab(t.id);
              }}
              className={`flex-1 rounded-2xl flex flex-col items-center justify-center gap-0 transition-all duration-150 active:scale-95 ${
                active ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500'
              }`}
            >
              <span className={`text-[20px] leading-none transition-transform ${active ? '-translate-y-px scale-110' : ''}`}>{t.emoji}</span>
              <span className="text-[10px] font-black leading-tight">{t.label}</span>
            </button>
          );
        })}
      </div>
      <span className="hidden">{claimable}</span>
    </nav>
  );
}

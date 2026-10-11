import React from 'react';
import { fmtTime, gpaOf, levelOf, naira, useGame } from '../game/store';
import { PLACE_MAP } from '../game/data';
import { sound } from '../game/sound';

const barColor = (v: number) => (v > 60 ? 'bg-emerald-500' : v > 30 ? 'bg-amber-400' : 'bg-rose-500');

function Mini({ emoji, v }: { emoji: string; v: number }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between text-[10px] font-black text-slate-700 leading-none mb-0.5">
        <span>{emoji}</span>
        <span>{Math.round(v)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor(v)}`} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

export default function Hud() {
  const s = useGame();
  const h = (s.minutes / 60) % 24;
  const sunny = h >= 6 && h < 18;
  const lvl = levelOf(s.xp);
  const xpPct = s.xp % 100;
  const last = s.logs[0];
  const kindColor = last?.kind === 'bad' ? 'bg-rose-600' : last?.kind === 'good' ? 'bg-emerald-600' : 'bg-slate-800';

  return (
    <div className="absolute top-0 inset-x-0 z-30 p-2 pt-[max(0.5rem,env(safe-area-inset-top))] pointer-events-none">
      <div className="pointer-events-auto max-w-xl mx-auto rounded-2xl bg-white/90 backdrop-blur-md shadow-lg border border-white/70 px-2.5 py-1.5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.click();
              s.setTab('me');
              useGame.setState({ meSeg: 'profile' });
            }}
            className="relative w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex flex-col items-center justify-center shadow-md active:scale-95 transition-transform"
          >
            <span className="text-[17px] leading-none">{s.profile.avatar || '🎓'}</span>
            <span className="text-[8px] font-black leading-none mt-0.5">Lv{lvl}</span>
            <span className="absolute -bottom-0.5 inset-x-1 h-[3px] rounded-full bg-emerald-950/50 overflow-hidden">
              <span className="block h-full bg-amber-300" style={{ width: `${xpPct}%` }} />
            </span>
          </button>
          <div className="flex-1 min-w-0 leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black text-slate-900 truncate">
                {s.profile.name}
              </span>
              <span className="text-[9px] font-black text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded-md">
                D{s.day}
              </span>
            </div>
            <div className="text-[10px] font-bold text-slate-500 truncate mt-0.5">
              {sunny ? '☀️' : '🌙'} {fmtTime(s.minutes)} · GPA{' '}
              <span className="text-emerald-700 font-black">
                {gpaOf(s.counters.lectures, s.xp, s.profile.traitId).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="px-2.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs font-black text-emerald-800 whitespace-nowrap shadow-sm">
            💰 {naira(s.cash)}
          </div>
        </div>
        <div className="flex gap-2.5 mt-2">
          <Mini emoji="⚡" v={s.energy} />
          <Mini emoji="🍔" v={s.hunger} />
          <Mini emoji="🧠" v={s.sanity} />
          <Mini emoji="🤝" v={s.social} />
        </div>
      </div>

      {s.travel ? (
        <div className="pointer-events-none max-w-xl mx-auto mt-1.5 flex justify-center">
          <div className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black shadow-lg animate-pulse">
            {s.travel.mode === 'shuttle' ? '🚐' : '🚶'} Heading to {PLACE_MAP[s.travel.to].short}…
          </div>
        </div>
      ) : (
        last && (
          <button
            onClick={() => { s.setTab('me'); useGame.setState({ meSeg: 'log' }); }}
            className={`pointer-events-auto max-w-xl mx-auto mt-1.5 w-full flex items-center gap-1.5 px-3 py-1 rounded-full ${kindColor} text-white text-[11px] font-bold shadow-md text-left active:scale-[0.98] transition-transform`}
          >
            <span className="truncate flex-1">{last.text}</span>
            <span className="opacity-70">›</span>
          </button>
        )
      )}
    </div>
  );
}

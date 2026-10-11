import React from 'react';
import { ITEM_MAP, QUESTS } from '../game/data';
import { gpaOf, levelOf, naira, useGame } from '../game/store';
import Sheet, { Segments } from './Sheet';

function Stat({ emoji, label, v, tone }: { emoji: string; label: string; v: number; tone: string }) {
  return (
    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
      <div className="flex items-center justify-between text-[11px] font-black text-slate-600">
        <span>{emoji} {label}</span>
        <span>{Math.round(v)}%</span>
      </div>
      <div className="h-2 mt-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${tone}`} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

export default function MePanel() {
  const s = useGame();
  const seg = s.meSeg;
  const lvl = levelOf(s.xp);

  return (
    <Sheet title="My Student Life" emoji="🎒">
      <Segments
        value={seg}
        onChange={(v) => useGame.setState({ meSeg: v })}
        items={[
          { id: 'profile', label: '👤 Me' },
          { id: 'quests', label: '🏅 Quests' },
          { id: 'bag', label: '🎒 Bag' },
          { id: 'log', label: '📜 Log' },
        ]}
      />

      {seg === 'profile' && (
        <div className="space-y-2.5">
          <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center gap-3 shadow">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">😎</div>
            <div className="flex-1">
              <div className="text-sm font-black">Comrade Student · Level {lvl}</div>
              <div className="text-[11px] font-semibold text-emerald-100">GPA {gpaOf(s.counters.lectures, s.xp).toFixed(2)} / 5.00 · Day {s.day}</div>
              <div className="h-1.5 mt-1.5 rounded-full bg-white/25 overflow-hidden">
                <div className="h-full bg-amber-300 rounded-full" style={{ width: `${s.xp % 100}%` }} />
              </div>
            </div>
            <div className="text-right text-[10px] font-black">{s.xp % 100}/100<br />XP</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Stat emoji="⚡" label="Energy" v={s.energy} tone="bg-amber-400" />
            <Stat emoji="🍔" label="Hunger" v={s.hunger} tone="bg-rose-500" />
            <Stat emoji="🧠" label="Sanity" v={s.sanity} tone="bg-violet-500" />
            <Stat emoji="🤝" label="Social" v={s.social} tone="bg-teal-500" />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              ['📚', 'Lectures', s.counters.lectures],
              ['🍲', 'Meals', s.counters.meals],
              ['🧭', 'Places', s.counters.visited.length],
            ].map(([e, l, v]) => (
              <div key={l as string} className="p-2 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-lg">{e}</div>
                <div className="text-base font-black text-slate-900 leading-none">{v}</div>
                <div className="text-[10px] font-bold text-slate-500">{l}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => { if (confirm('Reset all progress?')) s.reset(); }}
            className="w-full py-2 rounded-xl bg-slate-100 text-slate-500 text-[11px] font-black active:scale-95 transition-transform"
          >
            🔄 Reset progress
          </button>
        </div>
      )}

      {seg === 'quests' && (
        <div className="space-y-1.5">
          {QUESTS.map((q) => {
            const val = q.counter === 'visited' ? s.counters.visited.length : s.counters[q.counter];
            const done = val >= q.target;
            const claimed = s.claimed.includes(q.id);
            return (
              <div key={q.id} className="p-2.5 rounded-2xl bg-white border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{q.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-black text-slate-900">{q.title}</div>
                    <div className="text-[10px] font-bold text-slate-500">
                      🎁 {naira(q.reward.cash)} + {q.reward.xp}XP · {Math.min(val, q.target)}/{q.target}
                    </div>
                  </div>
                  <button
                    disabled={!done || claimed}
                    onClick={() => s.claim(q.id)}
                    className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-[11px] font-black active:scale-95 transition-all disabled:opacity-40 disabled:bg-slate-400"
                  >
                    {claimed ? '✅' : done ? 'Claim' : '…'}
                  </button>
                </div>
                <div className="h-1.5 mt-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(100, (val / q.target) * 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {seg === 'bag' && (
        <div className="space-y-1.5">
          {Object.entries(s.bag).filter(([, n]) => n > 0).length === 0 && (
            <p className="text-center text-xs font-bold text-slate-400 py-8">🎒 Bag is empty. Visit the 🛒 Shop in Hustle!</p>
          )}
          {Object.entries(s.bag)
            .filter(([, n]) => n > 0)
            .map(([id, n]) => {
              const it = ITEM_MAP[id];
              return (
                <div key={id} className="flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-slate-200">
                  <span className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-2xl">{it.emoji}</span>
                  <div className="flex-1">
                    <div className="text-[13px] font-black text-slate-900">{it.name} <span className="text-slate-400">×{n}</span></div>
                    <div className="text-[10px] font-semibold text-slate-500">{it.desc}</div>
                  </div>
                  <button onClick={() => s.useItem(id)} className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-[11px] font-black active:scale-95 transition-transform">
                    Use
                  </button>
                </div>
              );
            })}
        </div>
      )}

      {seg === 'log' && (
        <div className="space-y-1.5">
          {s.logs.map((l) => (
            <div
              key={l.id}
              className={`p-2.5 rounded-2xl text-[12px] font-semibold leading-snug border ${
                l.kind === 'bad' ? 'bg-rose-50 border-rose-200 text-rose-900' : l.kind === 'good' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : l.kind === 'event' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="text-[10px] font-black opacity-60 mb-0.5">{l.t}</div>
              {l.text}
            </div>
          ))}
        </div>
      )}
    </Sheet>
  );
}

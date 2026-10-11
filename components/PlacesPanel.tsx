import React, { useState } from 'react';
import { PLACES } from '../game/data';
import { findPath, pathLength, camApi } from '../game/world';
import { useGame } from '../game/store';
import Sheet from './Sheet';

const KINDS = ['All', 'Academics', 'Food', 'Admin', 'Sports', 'Hostels', 'Faith', 'Health', 'Nature', 'Transport'] as const;

export default function PlacesPanel() {
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<(typeof KINDS)[number]>('All');
  const location = useGame((s) => s.location);
  const visited = useGame((s) => s.counters.visited);
  const list = PLACES.filter(
    (p) => (kind === 'All' || p.kind === kind) && (p.name + p.kind).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <Sheet title="Campus Places" emoji="📍">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="🔎 Search JAO, SUB, Zoo…"
        className="w-full mb-2 px-3 py-2 rounded-2xl bg-slate-100 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1">
        {KINDS.map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`px-3 py-1 rounded-full text-[11px] font-black whitespace-nowrap transition-all active:scale-95 ${
              kind === k ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="space-y-1.5">
        {list.map((p) => {
          const dist = Math.round(pathLength(findPath(location, p.id)));
          return (
            <button
              key={p.id}
              onClick={() => {
                const st = useGame.getState();
                st.select(p.id);
                st.setTab('map');
                camApi.flyTo(p.pos[0], p.pos[1] + 4);
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-slate-200 active:scale-[0.98] transition-transform text-left"
            >
              <span className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl">{p.emoji}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-[13px] font-black text-slate-900 truncate">{p.name}</span>
                <span className="block text-[10px] font-bold text-slate-500">
                  {p.kind} · {location === p.id ? "📍 You're here" : `${dist}m away`}
                  {visited.includes(p.id) ? ' · ✅ visited' : ''}
                </span>
              </span>
              <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">View</span>
            </button>
          );
        })}
        {list.length === 0 && <p className="text-center text-xs font-bold text-slate-400 py-6">😅 No place found</p>}
      </div>
    </Sheet>
  );
}

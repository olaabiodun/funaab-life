import React from 'react';
import { PLACE_MAP } from '../game/data';
import { fxDeltaText, useGame } from '../game/store';
import { camApi, findPath, pathLength, travelCost } from '../game/world';
import { sound } from '../game/sound';

export default function PlaceCard() {
  const id = useGame((s) => s.selected);
  const location = useGame((s) => s.location);
  const travel = useGame((s) => s.travel);
  const perform = useGame((s) => s.perform);
  const startTravel = useGame((s) => s.startTravel);
  if (!id) return null;
  const p = PLACE_MAP[id];
  const here = location === id && !travel;
  const dist = Math.round(pathLength(findPath(location, id)));
  const walkInfo = travelCost(dist, 'walk');
  const shuttleInfo = travelCost(dist, 'shuttle');

  return (
    <div className="absolute inset-x-0 bottom-[72px] z-30 px-2 pointer-events-none mb-[env(safe-area-inset-bottom)]">
      <div className="pointer-events-auto max-w-xl mx-auto max-h-[44vh] overflow-y-auto rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl border border-white/80 p-3 anim-up">
        <div className="flex items-start gap-2.5">
          <span className="w-11 h-11 shrink-0 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl">{p.emoji}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-slate-900 leading-tight">{p.name}</h3>
            <p className="text-[11px] font-semibold text-slate-500 leading-snug">{p.blurb}</p>
          </div>
          <button onClick={() => useGame.getState().select(null)} className="w-7 h-7 shrink-0 rounded-full bg-slate-100 text-slate-500 text-xs font-black active:scale-90 transition-transform">
            ✕
          </button>
        </div>
        <p className="mt-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-bold italic text-amber-900">{p.gist}</p>

        {!here ? (
          <div className="grid grid-cols-2 gap-2 mt-2.5">
            <button
              disabled={!!travel}
              onClick={() => {
                sound.click();
                startTravel(id, 'walk');
              }}
              className="py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-black active:scale-95 transition-all disabled:opacity-40"
            >
              🚶 Walk · {walkInfo.minutes}min
              <span className="block text-[10px] font-bold text-emerald-100">{walkInfo.energy}⚡ · {dist}m</span>
            </button>
            <button
              disabled={!!travel}
              onClick={() => {
                sound.horn();
                startTravel(id, 'shuttle');
              }}
              className="py-2.5 rounded-2xl bg-amber-400 text-slate-900 text-xs font-black active:scale-95 transition-all disabled:opacity-40"
            >
              🚐 Shuttle · {shuttleInfo.minutes}min
              <span className="block text-[10px] font-bold text-amber-900">-₦{shuttleInfo.cost}</span>
            </button>
          </div>
        ) : (
          <div className="mt-2.5 space-y-1.5">
            <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700">📍 You're here — pick an action</div>
            {p.activities.map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  if (a.reward) sound.cash();
                  else sound.click();
                  perform(a, id);
                }}
                className="w-full flex items-center gap-2.5 p-2 rounded-2xl bg-white border border-slate-200 text-left active:scale-[0.98] transition-transform shadow-sm"
              >
                <span className="text-2xl w-9 text-center">{a.emoji}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] font-black text-slate-900 truncate">{a.label}</span>
                  <span className="block text-[10px] font-bold text-slate-500">
                    {fxDeltaText({ cash: (a.reward || 0) - (a.cost || 0), energy: a.energy, hunger: a.hunger, sanity: a.sanity, social: a.social, xp: a.xp })}
                  </span>
                </span>
                <span className="px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white text-[11px] font-black">Go</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export { camApi };

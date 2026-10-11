import React from 'react';
import { GROOVES, ITEMS, JOBS, PLACE_MAP, PLACES, Activity } from '../game/data';
import { fxDeltaText, naira, useGame } from '../game/store';
import { camApi } from '../game/world';
import Sheet, { Segments } from './Sheet';

function Row({ emoji, title, sub, tag, tagTone, btn, onClick, disabled }: {
  emoji: string; title: string; sub: string; tag?: string; tagTone?: 'good' | 'bad'; btn: string; onClick: () => void; disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-slate-200">
      <span className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-black text-slate-900 truncate">{title}</span>
          {tag && (
            <span className={`text-[10px] font-black px-1.5 rounded ${tagTone === 'good' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {tag}
            </span>
          )}
        </div>
        <div className="text-[10px] font-semibold text-slate-500 leading-snug">{sub}</div>
      </div>
      <button
        onClick={onClick}
        disabled={disabled}
        className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-[11px] font-black active:scale-95 transition-all disabled:opacity-40 shrink-0"
      >
        {btn}
      </button>
    </div>
  );
}

function actFx(a: Activity) {
  return fxDeltaText({ cash: (a.reward || 0) - (a.cost || 0), energy: a.energy, hunger: a.hunger, sanity: a.sanity, social: a.social, xp: a.xp });
}

export default function HustlePanel() {
  const seg = useGame((s) => s.hustleSeg);
  const location = useGame((s) => s.location);
  const cash = useGame((s) => s.cash);
  const perform = useGame((s) => s.perform);
  const buy = useGame((s) => s.buy);

  // find the activity object for a job
  const activityFor = (placeId: string, id: string) => PLACE_MAP[placeId].activities.find((a) => a.id === id)!;

  return (
    <Sheet title="Hustle & Spend" emoji="💼">
      <Segments
        value={seg}
        onChange={(v) => useGame.setState({ hustleSeg: v })}
        items={[
          { id: 'jobs', label: '💼 Jobs' },
          { id: 'shop', label: '🛒 Shop' },
          { id: 'groove', label: '🎉 Groove' },
        ]}
      />
      <div className="space-y-1.5">
        {seg === 'jobs' &&
          JOBS.map((j) => {
            const act = activityFor(j.place, j.activityId);
            const here = location === j.place;
            return (
              <Row
                key={j.id}
                emoji={j.emoji}
                title={j.title}
                sub={`${j.desc} · 📍 ${PLACE_MAP[j.place].short} · ${actFx(act)}`}
                tag={`+${naira(act.reward || 0)}`}
                tagTone="good"
                btn={here ? 'Work' : 'Go 📍'}
                onClick={() => {
                  if (here) perform(act, j.place);
                  else {
                    const st = useGame.getState();
                    st.select(j.place);
                    st.setTab('map');
                    camApi.flyTo(PLACE_MAP[j.place].pos[0], PLACE_MAP[j.place].pos[1] + 4);
                  }
                }}
              />
            );
          })}

        {seg === 'shop' &&
          ITEMS.map((it) => (
            <Row key={it.id} emoji={it.emoji} title={it.name} sub={it.desc} tag={naira(it.price)} tagTone="bad" btn="Buy" disabled={cash < it.price} onClick={() => buy(it.id)} />
          ))}

        {seg === 'groove' &&
          GROOVES.map((g) => (
            <Row key={g.id} emoji={g.emoji} title={g.label} sub={actFx(g)} tag={g.cost ? `-${naira(g.cost)}` : 'Free'} tagTone={g.cost ? 'bad' : 'good'} btn="Go!" onClick={() => perform(g)} />
          ))}
      </div>
      <span className="hidden">{PLACES.length}</span>
    </Sheet>
  );
}

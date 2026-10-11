import React from 'react';
import { ITEM_MAP, QUESTS, PLACE_MAP } from '../game/data';
import { gpaOf, levelOf, naira, useGame, MeSegment } from '../game/store';
import { STUDENT_TRAITS, DEPARTMENTS, CAMPUS_SCHEDULE, CAMPUS_YARNS } from '../game/character';
import { sound } from '../game/sound';
import Sheet, { Segments } from './Sheet';

function Stat({ emoji, label, v, tone }: { emoji: string; label: string; v: number; tone: string }) {
  return (
    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between text-[11px] font-black text-slate-700">
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

  const trait = STUDENT_TRAITS.find((t) => t.id === s.profile.traitId) || STUDENT_TRAITS[0];
  const dept = DEPARTMENTS.find((d) => d.id === s.profile.departmentId) || DEPARTMENTS[0];
  const currentGpa = gpaOf(s.counters.lectures, s.xp, s.profile.traitId);

  return (
    <Sheet title="Student Portal" emoji="🎒">
      <Segments<MeSegment>
        value={seg}
        onChange={(v) => {
          sound.click();
          useGame.setState({ meSeg: v });
        }}
        items={[
          { id: 'profile', label: '👤 Profile' },
          { id: 'schedule', label: '📅 Timetable' },
          { id: 'yarns', label: '🔥 Yarns' },
          { id: 'quests', label: '🏅 Quests' },
          { id: 'bag', label: '🎒 Bag' },
          { id: 'log', label: '📜 Log' },
        ]}
      />

      {/* 👤 STUDENT PROFILE & STATS */}
      {seg === 'profile' && (
        <div className="space-y-2.5">
          {/* Student ID Card */}
          <div className="p-3.5 rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-900 text-white shadow-xl relative overflow-hidden border border-emerald-500/30">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border border-white/20">
                {s.profile.avatar || '😎'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black truncate leading-tight">{s.profile.name}</h3>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-sm">
                    Lv{lvl}
                  </span>
                </div>
                <div className="text-[11px] font-bold text-emerald-100/90 mt-0.5">
                  {s.profile.matricNo} · {dept.name}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] font-black text-emerald-200">
                  <span>{trait.emoji} {trait.name}</span>
                  <span>·</span>
                  <span className="text-amber-300">CGPA: {currentGpa.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Level XP Bar */}
            <div className="mt-3 pt-2.5 border-t border-white/15">
              <div className="flex items-center justify-between text-[10px] font-bold text-emerald-100 mb-1">
                <span>Semester Experience</span>
                <span>{s.xp % 100} / 100 XP</span>
              </div>
              <div className="h-2 rounded-full bg-black/25 overflow-hidden">
                <div className="h-full bg-amber-300 rounded-full transition-all" style={{ width: `${s.xp % 100}%` }} />
              </div>
            </div>
          </div>

          {/* Vitals Grid */}
          <div className="grid grid-cols-2 gap-2">
            <Stat emoji="⚡" label="Energy" v={s.energy} tone="bg-amber-400" />
            <Stat emoji="🍔" label="Hunger" v={s.hunger} tone="bg-rose-500" />
            <Stat emoji="🧠" label="Sanity" v={s.sanity} tone="bg-violet-500" />
            <Stat emoji="🤝" label="Social" v={s.social} tone="bg-teal-500" />
          </div>

          {/* Life Achievements Summary */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              ['📚', 'Lectures', s.counters.lectures],
              ['🍲', 'Meals', s.counters.meals],
              ['🧭', 'Places Visited', s.counters.visited.length],
            ].map(([e, l, v]) => (
              <div key={l as string} className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="text-xl mb-0.5">{e}</div>
                <div className="text-base font-black text-slate-900 leading-none">{v}</div>
                <div className="text-[10px] font-bold text-slate-500 mt-1">{l}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              if (confirm('Reset your character and student progress?')) s.reset();
            }}
            className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black active:scale-95 transition-all"
          >
            🔄 Reset Student Life
          </button>
        </div>
      )}

      {/* 📅 TIMETABLE & LECTURE SCHEDULE */}
      {seg === 'schedule' && (
        <div className="space-y-2">
          <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-900 leading-snug">
            💡 <strong>Course Registration Active:</strong> Attend your daily lectures to build Academic XP and boost your Semester GPA!
          </div>

          {CAMPUS_SCHEDULE.map((item) => {
            const hall = PLACE_MAP[item.placeId];
            const isAtHall = s.location === item.placeId && !s.travel;
            return (
              <div key={item.id} className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
                  {hall?.emoji || '📚'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">{item.code}: {item.title}</span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {item.unit} Units
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                    📍 {hall?.name || 'Lecture Hall'} · ⏰ {Math.floor(item.startMinutes / 60)}:00 AM
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => {
                        sound.click();
                        if (isAtHall) {
                          // Perform lecture activity
                          const act = hall.activities.find((a) => a.tag === 'lecture') || hall.activities[0];
                          if (act) s.perform(act, item.placeId);
                        } else {
                          s.select(item.placeId);
                          s.setTab('map');
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black shadow-sm active:scale-95 transition-all ${
                        isAtHall
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {isAtHall ? '✍️ Attend Lecture' : '📍 Go to Hall'}
                    </button>
                    {isAtHall && (
                      <span className="text-[10px] font-black text-emerald-700">
                        ✅ You're here!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🔥 CAMPUS YARNS (Social Feed) */}
      {seg === 'yarns' && (
        <div className="space-y-2">
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 px-1">
            Trending Gist on Campus
          </div>
          {CAMPUS_YARNS.map((yarn) => (
            <div key={yarn.id} className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-base">
                  {yarn.avatar}
                </span>
                <div className="flex-1 min-w-0 leading-tight">
                  <div className="text-xs font-black text-slate-900 truncate">{yarn.author}</div>
                  <div className="text-[10px] font-bold text-slate-400">{yarn.handle}</div>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {yarn.tag}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-700 leading-snug">
                {yarn.text}
              </p>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-3 text-[10px] font-bold text-slate-500">
                <span>❤️ {yarn.likes} Comrades</span>
                <span>💬 Reply</span>
                <span>🔄 Repost</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🏅 QUESTS */}
      {seg === 'quests' && (
        <div className="space-y-2">
          {QUESTS.map((q) => {
            const val = q.counter === 'visited' ? s.counters.visited.length : s.counters[q.counter];
            const done = val >= q.target;
            const claimed = s.claimed.includes(q.id);
            return (
              <div key={q.id} className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
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
                    onClick={() => {
                      sound.cash();
                      s.claim(q.id);
                    }}
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

      {/* 🎒 INVENTORY BAG */}
      {seg === 'bag' && (
        <div className="space-y-2">
          {Object.entries(s.bag).filter(([, n]) => n > 0).length === 0 && (
            <p className="text-center text-xs font-bold text-slate-400 py-8">🎒 Bag is empty. Visit the 🛒 Shop in Hustle!</p>
          )}
          {Object.entries(s.bag)
            .filter(([, n]) => n > 0)
            .map(([id, n]) => {
              const it = ITEM_MAP[id];
              return (
                <div key={id} className="flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <span className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-2xl">{it.emoji}</span>
                  <div className="flex-1">
                    <div className="text-[13px] font-black text-slate-900">{it.name} <span className="text-slate-400">×{n}</span></div>
                    <div className="text-[10px] font-semibold text-slate-500">{it.desc}</div>
                  </div>
                  <button
                    onClick={() => {
                      sound.click();
                      s.useItem(id);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-[11px] font-black active:scale-95 transition-transform"
                  >
                    Use
                  </button>
                </div>
              );
            })}
        </div>
      )}

      {/* 📜 CAMPUS LOG */}
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

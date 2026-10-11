import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Activity, EVENTS, Fx, ITEM_MAP, PLACE_MAP, QUESTS } from './data';
import { findPath, pathLength, travelCost } from './world';

export type Tab = 'map' | 'places' | 'hustle' | 'me';
export type LogKind = 'info' | 'good' | 'bad' | 'event';

export interface LogItem {
  id: number;
  text: string;
  kind: LogKind;
  t: string;
}
export interface Travel {
  to: string;
  path: string[];
  mode: 'walk' | 'shuttle';
  minutes: number;
}
export interface Counters {
  lectures: number;
  meals: number;
  earned: number;
  hangouts: number;
  visited: string[];
}

const clamp = (v: number, a = 0, b = 100) => Math.max(a, Math.min(b, v));
let uid = 1;

export const fmtTime = (minutes: number) => {
  const h = Math.floor(minutes / 60) % 24;
  const m = Math.floor(minutes % 60);
  const ap = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${m.toString().padStart(2, '0')} ${ap}`;
};
export const naira = (n: number) => `₦${Math.round(n).toLocaleString()}`;

export interface StudentProfile {
  name: string;
  matricNo: string;
  departmentId: string;
  traitId: string;
  avatar: string;
  gender: 'comrade_m' | 'comrade_f';
}

export type MeSegment = 'profile' | 'schedule' | 'yarns' | 'quests' | 'bag' | 'log';

interface Game {
  onboarded: boolean;
  profile: StudentProfile;
  cash: number;
  energy: number;
  hunger: number;
  sanity: number;
  social: number;
  xp: number;
  day: number;
  minutes: number;
  location: string;
  travel: Travel | null;
  counters: Counters;
  claimed: string[];
  bag: Record<string, number>;
  logs: LogItem[];
  toast: { id: number; text: string; kind: LogKind } | null;

  selected: string | null;
  tab: Tab;
  meSeg: MeSegment;
  hustleSeg: 'jobs' | 'shop' | 'groove';

  setTab: (t: Tab) => void;
  select: (id: string | null) => void;
  log: (text: string, kind?: LogKind) => void;
  notify: (text: string, kind?: LogKind) => void;
  addTime: (m: number) => void;
  tick: () => void;
  perform: (act: Activity, requirePlace?: string) => boolean;
  startTravel: (to: string, mode: 'walk' | 'shuttle') => void;
  finishTravel: () => void;
  buy: (id: string) => void;
  useItem: (id: string) => void;
  claim: (id: string) => void;
  createProfile: (profile: StudentProfile) => void;
  reset: () => void;
}

const defaultProfile: StudentProfile = {
  name: 'Comrade Student',
  matricNo: '2024/0421',
  departmentId: 'csc',
  traitId: 'scholar',
  avatar: '😎',
  gender: 'comrade_m',
};

const initial = {
  onboarded: false,
  profile: defaultProfile,
  cash: 5000,
  energy: 90,
  hunger: 75,
  sanity: 90,
  social: 40,
  xp: 0,
  day: 1,
  minutes: 8 * 60,
  location: 'main_gate',
  travel: null as Travel | null,
  counters: { lectures: 0, meals: 0, earned: 0, hangouts: 0, visited: ['main_gate'] } as Counters,
  claimed: [] as string[],
  bag: {} as Record<string, number>,
  logs: [
    { id: 0, text: '🎒 Welcome to FUNAAB! You just arrived at the School Gate. Grab a shuttle or trek in.', kind: 'info' as LogKind, t: '8:00 AM' },
  ] as LogItem[],
};

function fxDeltaText(fx: Fx): string {
  const parts: string[] = [];
  if (fx.cash) parts.push(`${fx.cash > 0 ? '+' : '-'}${naira(Math.abs(fx.cash))}`);
  if (fx.energy) parts.push(`${fx.energy > 0 ? '+' : ''}${fx.energy}⚡`);
  if (fx.hunger) parts.push(`${fx.hunger > 0 ? '+' : ''}${fx.hunger}🍔`);
  if (fx.sanity) parts.push(`${fx.sanity > 0 ? '+' : ''}${fx.sanity}🧠`);
  if (fx.social) parts.push(`${fx.social > 0 ? '+' : ''}${fx.social}🤝`);
  if (fx.xp) parts.push(`+${fx.xp}XP`);
  return parts.join('  ');
}
export { fxDeltaText };

export const useGame = create<Game>()(
  persist(
    (set, get) => {
      const patchFx = (fx: Fx) => {
        const s = get();
        const xp = s.xp + (fx.xp || 0);
        set({
          cash: Math.max(0, s.cash + (fx.cash || 0)),
          energy: clamp(s.energy + (fx.energy || 0)),
          hunger: clamp(s.hunger + (fx.hunger || 0)),
          sanity: clamp(s.sanity + (fx.sanity || 0)),
          social: clamp(s.social + (fx.social || 0)),
          xp,
        });
        const n = get();
        if (n.hunger <= 0 || n.energy <= 0) {
          const bill = Math.min(n.cash, 500);
          set({ location: 'health', travel: null, cash: n.cash - bill, energy: 45, hunger: 45, sanity: clamp(n.sanity - 15) });
          get().log(`🚑 You collapsed from exhaustion! Good Samaritans rushed you to the Health Centre. Bill: -${naira(bill)}.`, 'bad');
          get().notify('🚑 You fainted! Rushed to the clinic', 'bad');
        }
      };

      return {
        ...initial,
        toast: null,
        selected: null,
        tab: 'map',
        meSeg: 'profile',
        hustleSeg: 'jobs',

        setTab: (t) => set({ tab: t }),
        select: (id) => set({ selected: id }),

        log: (text, kind = 'info') => {
          const s = get();
          set({ logs: [{ id: uid++, text, kind, t: fmtTime(s.minutes) }, ...s.logs].slice(0, 80) });
        },
        notify: (text, kind = 'info') => set({ toast: { id: uid++, text, kind } }),

        addTime: (m) => {
          let minutes = get().minutes + m;
          let day = get().day;
          while (minutes >= 1440) {
            minutes -= 1440;
            day++;
          }
          const newDay = day !== get().day;
          set({ minutes, day });
          if (newDay) get().log(`🌅 Day ${day} begins. Fresh semester energy (allegedly).`, 'event');
        },

        tick: () => {
          const s = get();
          const night = s.minutes >= 22 * 60 || s.minutes < 5 * 60;
          get().addTime(5);
          if (s.travel) return;
          patchFx({ hunger: -0.5, energy: night ? -0.35 : -0.12, sanity: s.sanity < 25 ? -0.1 : 0 });
          if (Math.random() < 0.06) {
            const ev = EVENTS[Math.floor(Math.random() * EVENTS.length)];
            patchFx(ev.fx);
            get().log(ev.text, ev.kind);
            get().notify(ev.text, ev.kind);
          } else if (s.sanity < 20 && Math.random() < 0.08) {
            patchFx({ energy: -4 });
            get().log('😵 Your brain is buffering. You walked into a door.', 'bad');
          }
        },

        perform: (act, requirePlace) => {
          const s = get();
          if (s.travel) {
            get().notify('🚶 Finish walking first!', 'bad');
            return false;
          }
          if (requirePlace && s.location !== requirePlace) {
            get().notify(`📍 Go to ${PLACE_MAP[requirePlace].short} first`, 'bad');
            return false;
          }
          if ((act.cost || 0) > s.cash) {
            get().notify('❌ Not enough Naira — sapa is holding you', 'bad');
            return false;
          }
          if ((act.energy || 0) < 0 && s.energy < Math.abs(act.energy!) * 0.6) {
            get().notify('⚠️ Too tired! Rest or eat first', 'bad');
            return false;
          }
          const fx: Fx = {
            cash: (act.reward || 0) - (act.cost || 0),
            energy: act.energy,
            hunger: act.hunger,
            sanity: act.sanity,
            social: act.social,
            xp: act.xp,
          };
          const c = { ...s.counters };
          if (act.tag === 'lecture') c.lectures++;
          if (act.tag === 'meal') c.meals++;
          if (act.tag === 'hang') c.hangouts++;
          if (act.reward) c.earned += act.reward;
          set({ counters: c });
          patchFx(fx);
          get().addTime(act.minutes);
          get().log(`${act.log}  (${fxDeltaText(fx)})`, act.reward ? 'good' : 'info');
          get().notify(fxDeltaText(fx), (fx.cash || 0) > 0 ? 'good' : 'info');
          return true;
        },

        startTravel: (to, mode) => {
          const s = get();
          if (s.travel) return get().notify('🚶 Already on the move!', 'bad');
          if (s.location === to) return get().notify('📍 You are already here', 'info');
          const path = findPath(s.location, to);
          const dist = pathLength(path);
          const { cost, energy, hunger, minutes } = travelCost(dist, mode);
          if (cost > s.cash) return get().notify('❌ No ₦150 for shuttle — trek it!', 'bad');
          if (s.energy < Math.abs(energy) + 3) return get().notify('⚠️ Too tired to walk. Take the shuttle or rest.', 'bad');
          patchFx({ cash: -cost, energy, hunger });
          set({ travel: { to, path, mode, minutes } });
          get().log(
            mode === 'shuttle'
              ? `🚐 You boarded the campus shuttle to ${PLACE_MAP[to].short}. (-₦${cost})`
              : `🚶 You set off on foot to ${PLACE_MAP[to].short}. (${energy}⚡)`,
            'info',
          );
        },

        finishTravel: () => {
          const t = get().travel;
          if (!t) return;
          const c = { ...get().counters };
          if (!c.visited.includes(t.to)) c.visited = [...c.visited, t.to];
          set({ travel: null, location: t.to, counters: c });
          get().addTime(t.minutes);
          get().log(`📍 You arrived at ${PLACE_MAP[t.to].name}. ${PLACE_MAP[t.to].gist}`, 'info');
        },

        buy: (id) => {
          const it = ITEM_MAP[id];
          const s = get();
          if (s.cash < it.price) return get().notify('❌ Not enough Naira', 'bad');
          set({ cash: s.cash - it.price, bag: { ...s.bag, [id]: (s.bag[id] || 0) + 1 } });
          get().log(`🛒 Bought ${it.emoji} ${it.name} for ${naira(it.price)}.`, 'info');
          get().notify(`${it.emoji} Added to bag`, 'good');
        },

        useItem: (id) => {
          const it = ITEM_MAP[id];
          const s = get();
          if (!s.bag[id]) return;
          const c = { ...s.counters };
          if (it.food) c.meals++;
          set({ bag: { ...s.bag, [id]: s.bag[id] - 1 }, counters: c });
          patchFx(it.fx);
          get().log(`${it.emoji} You used ${it.name}. (${fxDeltaText(it.fx)})`, 'good');
          get().notify(fxDeltaText(it.fx), 'good');
        },

        claim: (id) => {
          const q = QUESTS.find((x) => x.id === id);
          const s = get();
          if (!q || s.claimed.includes(id)) return;
          const val = q.counter === 'visited' ? s.counters.visited.length : s.counters[q.counter];
          if (val < q.target) return;
          set({ claimed: [...s.claimed, id] });
          patchFx({ cash: q.reward.cash, xp: q.reward.xp });
          get().log(`🏅 Quest complete: ${q.title}! (+${naira(q.reward.cash)}, +${q.reward.xp}XP)`, 'good');
          get().notify(`🏅 Quest done! +${naira(q.reward.cash)}`, 'good');
        },

        createProfile: (prof) => {
          const trait = prof.traitId === 'hustler' ? { cash: 10000, energy: 90, sanity: 90, social: 40 }
            : prof.traitId === 'politician' ? { cash: 6000, energy: 90, sanity: 90, social: 70 }
            : prof.traitId === 'baller' ? { cash: 7500, energy: 100, sanity: 95, social: 50 }
            : { cash: 5000, energy: 90, sanity: 90, social: 40 };

          set({
            onboarded: true,
            profile: prof,
            ...trait,
            logs: [
              {
                id: uid++,
                text: `🎓 Matriculation Complete! Welcome to FUNAAB, ${prof.name} (${prof.matricNo}). Your journey begins!`,
                kind: 'good',
                t: '8:00 AM',
              },
            ],
          });
          get().notify(`🎉 Welcome ${prof.name}!`, 'good');
        },

        reset: () => set({ ...initial, toast: null, selected: null, tab: 'map' }),
      };
    },
    {
      name: 'campus-life-save-v2',
      partialize: (s) => ({
        onboarded: s.onboarded, profile: s.profile,
        cash: s.cash, energy: s.energy, hunger: s.hunger, sanity: s.sanity, social: s.social, xp: s.xp,
        day: s.day, minutes: s.minutes, location: s.location, counters: s.counters, claimed: s.claimed,
        bag: s.bag, logs: s.logs,
      }),
    },
  ),
);

export const levelOf = (xp: number) => Math.floor(xp / 100) + 1;
export const gpaOf = (lectures: number, xp: number, traitId?: string) => {
  const boost = traitId === 'scholar' ? 0.35 : 0;
  return Math.min(5, 2.4 + boost + lectures * 0.12 + xp / 380);
};

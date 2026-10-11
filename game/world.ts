import { PLACES, Place, px2w } from './data';

export type V2 = [number, number];

// =============================================================
// ROAD NETWORK — traced from the FUNAAB MAP GUIDE (pixel coords)
// Junctions share exact vertices so the graph connects.
// =============================================================
interface RoadDef {
  name: string;
  w: number; // width in world units
  line?: boolean; // painted centre line
  pts: V2[];
}

const RAW: RoadDef[] = [
  // big east–west expressway through the middle of campus
  { name: 'highway', w: 10, line: true, pts: [[30, 220], [60, 222], [188, 231], [322, 241], [462, 240], [592, 228], [665, 205], [700, 195]] },
  // the academic ring road (COLENG / JAO / NIMBE side)
  { name: 'loop', w: 8, line: true, pts: [[322, 241], [322, 148], [322, 72], [332, 50], [362, 33], [450, 28], [560, 30], [590, 45], [602, 75], [602, 148], [592, 228]] },
  // school gate up to the expressway (and out of campus)
  { name: 'gate', w: 8, line: true, pts: [[462, 240], [462, 300], [462, 330], [462, 372], [465, 410], [468, 470]] },
  // southern road: Camp → Zoo → Gate
  { name: 'south', w: 9, line: true, pts: [[-20, 390], [150, 382], [300, 374], [420, 372], [462, 372]] },
  // hostel road (NEEDS hostels → SUB)
  { name: 'needs', w: 6, pts: [[55, 77], [188, 74], [322, 72]] },
  // inner road across the ring (NIMBE library row)
  { name: 'mid', w: 6, pts: [[322, 148], [447, 148], [602, 148]] },
  // Mahmud / 500 seater link
  { name: 'mahmud', w: 5, pts: [[188, 74], [188, 231]] },
  // ACAD / Sport centre streets
  { name: 'acad', w: 5, pts: [[462, 300], [528, 300]] },
  { name: 'sport', w: 6, pts: [[322, 330], [462, 330], [528, 324]] },
  // Wole Soyinka library / COLENDS road
  { name: 'wole', w: 6, pts: [[462, 372], [540, 358], [608, 338]] },
];

export const ROADS = RAW.map((r) => ({ ...r, pts: r.pts.map(([x, y]) => px2w(x, y)) as V2[] }));
export const ROAD_POLYS: V2[][] = ROADS.map((r) => r.pts);

export const LAKE = (() => {
  const [x, z] = px2w(212, 322);
  return { x, z, rx: 20, rz: 12 };
})();

export const BOUNDS = { minX: -320, maxX: 335, minZ: -215, maxZ: 175 };

// =============================================================
// Geometry helpers
// =============================================================
export function distToSegment(px: number, pz: number, a: V2, b: V2): number {
  return project(px, pz, a, b).d;
}
function project(px: number, pz: number, a: V2, b: V2) {
  const abx = b[0] - a[0];
  const abz = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((px - a[0]) * abx + (pz - a[1]) * abz) / (abx * abx + abz * abz || 1)));
  const x = a[0] + abx * t;
  const z = a[1] + abz * t;
  return { t, x, z, d: Math.hypot(px - x, pz - z), nx: -abz, nz: abx };
}

export function nearRoad(x: number, z: number, margin: number): boolean {
  for (const r of ROADS) {
    for (let i = 0; i < r.pts.length - 1; i++) {
      if (distToSegment(x, z, r.pts[i], r.pts[i + 1]) < margin + r.w / 2) return true;
    }
  }
  return false;
}

export function inLake(x: number, z: number, pad = 0): boolean {
  const dx = (x - LAKE.x) / (LAKE.rx + pad);
  const dz = (z - LAKE.z) / (LAKE.rz + pad);
  return dx * dx + dz * dz < 1;
}

// =============================================================
// Building footprints + layout (nudge off roads, face the road)
// =============================================================
// hand-built model sizes: [half width, half depth] before scaling
const MODEL_FOOT: Record<string, [number, number]> = {
  main_gate: [14, 4], camp: [15, 8], chapel: [5, 9], mosque: [7, 6], senate: [9, 6], ceremonial: [11, 9],
  ict: [7, 5], jao: [14, 7], coleng: [9, 7], colamrud: [11, 5], colplant: [16, 5], colanim: [12, 7],
  sub: [12, 8], motion: [17, 13], zoo: [13, 9], health: [12, 6], hostels: [16, 10],
};
export const MODEL_SCALE: Record<string, number> = { chapel: 0.7, mosque: 0.7, motion: 0.8, hostels: 0.8 };
export const hasModel = (id: string) => !!MODEL_FOOT[id];
export const scaleOf = (id: string) => MODEL_SCALE[id] ?? 0.85;

export function footprintOf(p: Place): { hw: number; hd: number; r: number } {
  if (MODEL_FOOT[p.id]) {
    const s = scaleOf(p.id);
    const [hw, hd] = MODEL_FOOT[p.id];
    return { hw: hw * s, hd: hd * s, r: Math.max(hw, hd) * s };
  }
  const [w, d] = p.style || [10, 7, 6];
  return { hw: w / 2, hd: d / 2, r: Math.max(w, d) / 2 };
}

const NO_PUSH = new Set(['main_gate']); // the gate arch straddles the road on purpose

// graph nodes
const nodes: Record<string, V2> = {};
const key = (p: V2) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
interface Edge { a: string; b: string; A: V2; B: V2 }
const baseEdges: Edge[] = [];
ROADS.forEach((r) => {
  for (let i = 0; i < r.pts.length - 1; i++) {
    const A = r.pts[i];
    const B = r.pts[i + 1];
    const a = key(A);
    const b = key(B);
    nodes[a] = A;
    nodes[b] = B;
    baseEdges.push({ a, b, A, B });
  }
});

const attach = new Map<number, { id: string; t: number }[]>();
PLACES.forEach((p) => {
  let [x, z] = p.pos;
  const fp = footprintOf(p);
  if (!NO_PUSH.has(p.id)) {
    for (let it = 0; it < 4; it++) {
      for (const r of ROADS) {
        for (let i = 0; i < r.pts.length - 1; i++) {
          const pr = project(x, z, r.pts[i], r.pts[i + 1]);
          const need = fp.hd + r.w / 2 + 2;
          if (pr.d < need) {
            let dx = x - pr.x;
            let dz = z - pr.z;
            let len = Math.hypot(dx, dz);
            if (len < 0.01) { dx = pr.nx; dz = pr.nz; len = Math.hypot(dx, dz) || 1; }
            x = pr.x + (dx / len) * need;
            z = pr.z + (dz / len) * need;
          }
        }
      }
    }
  }
  p.pos = [x, z];

  // attach to the nearest road segment
  let best = { i: 0, t: 0, x: 0, z: 0, d: Infinity };
  baseEdges.forEach((e, i) => {
    const pr = project(x, z, e.A, e.B);
    if (pr.d < best.d) best = { i, t: pr.t, x: pr.x, z: pr.z, d: pr.d };
  });
  nodes[`@${p.id}`] = [best.x, best.z];
  if (!attach.has(best.i)) attach.set(best.i, []);
  attach.get(best.i)!.push({ id: p.id, t: best.t });
  p.rot = best.d > 0.5 ? Math.atan2(best.x - x, best.z - z) : 0;
});

// adjacency (edges split at every building's road point)
const adj: Record<string, { n: string; w: number }[]> = {};
const link = (a: string, b: string) => {
  const w = Math.hypot(nodes[a][0] - nodes[b][0], nodes[a][1] - nodes[b][1]);
  (adj[a] ||= []).push({ n: b, w });
  (adj[b] ||= []).push({ n: a, w });
};
baseEdges.forEach((e, i) => {
  const list = (attach.get(i) || []).sort((u, v) => u.t - v.t);
  let prev = e.a;
  list.forEach((l) => {
    link(prev, `@${l.id}`);
    prev = `@${l.id}`;
  });
  link(prev, e.b);
});

export const nodePos = (id: string): V2 => nodes[id] || [0, 0];
export const roadPoint = (placeId: string): V2 => nodes[`@${placeId}`] || [0, 0];

// =============================================================
// Pathfinding (Dijkstra, cached per source)
// =============================================================
const cache = new Map<string, { dist: Record<string, number>; prev: Record<string, string> }>();
function dijkstra(src: string) {
  const hit = cache.get(src);
  if (hit) return hit;
  const dist: Record<string, number> = { [src]: 0 };
  const prev: Record<string, string> = {};
  const done = new Set<string>();
  const open = new Set<string>([src]);
  while (open.size) {
    let u = '';
    let best = Infinity;
    open.forEach((n) => { if (dist[n] < best) { best = dist[n]; u = n; } });
    open.delete(u);
    done.add(u);
    for (const { n, w } of adj[u] || []) {
      if (done.has(n)) continue;
      const nd = best + w;
      if (nd < (dist[n] ?? Infinity)) {
        dist[n] = nd;
        prev[n] = u;
        open.add(n);
      }
    }
  }
  const res = { dist, prev };
  cache.set(src, res);
  return res;
}

/** Returns road-node ids from place `from` to place `to`. */
export function findPath(from: string, to: string): string[] {
  const s = `@${from}`;
  const t = `@${to}`;
  if (from === to) return [s];
  const { prev } = dijkstra(s);
  if (!(t in prev)) return [s, t];
  const out = [t];
  while (out[0] !== s) out.unshift(prev[out[0]]);
  return out;
}

export function pathLength(path: string[]): number {
  let d = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const a = nodePos(path[i]);
    const b = nodePos(path[i + 1]);
    d += Math.hypot(b[0] - a[0], b[1] - a[1]);
  }
  return d;
}

export const SHUTTLE_FARE = 150;
export function travelCost(dist: number, mode: 'walk' | 'shuttle') {
  return mode === 'walk'
    ? { cost: 0, energy: -Math.round(dist * 0.035), hunger: -Math.round(dist * 0.012), minutes: Math.max(2, Math.round(dist / 3.5)) }
    : { cost: SHUTTLE_FARE, energy: -Math.round(dist * 0.008), hunger: 0, minutes: Math.max(2, Math.round(dist / 10)) };
}

// =============================================================
// Polyline helpers
// =============================================================
export interface Poly {
  pts: V2[];
  cum: number[];
  total: number;
}
export function makePoly(pts: V2[]): Poly {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  return { pts, cum, total: cum[cum.length - 1] };
}
export function pointAt(poly: Poly, d: number): { x: number; z: number; dx: number; dz: number } {
  const dd = Math.max(0, Math.min(poly.total, d));
  let i = 1;
  while (i < poly.cum.length - 1 && poly.cum[i] < dd) i++;
  const a = poly.pts[i - 1];
  const b = poly.pts[i];
  const seg = poly.cum[i] - poly.cum[i - 1] || 1;
  const t = (dd - poly.cum[i - 1]) / seg;
  return { x: a[0] + (b[0] - a[0]) * t, z: a[1] + (b[1] - a[1]) * t, dx: b[0] - a[0], dz: b[1] - a[1] };
}

// shuttle routes (ping-pong)
const route = (pts: V2[]) => pts.map(([x, y]) => px2w(x, y)) as V2[];
export const SHUTTLE_ROUTES: V2[][] = [
  route([[465, 410], [462, 372], [462, 240], [592, 228], [602, 148], [602, 75], [590, 45], [560, 30], [450, 28], [362, 33], [332, 50], [322, 72], [322, 241], [188, 231], [60, 222]]),
  route([[150, 382], [300, 374], [420, 372], [462, 372], [462, 240], [322, 241], [322, 148], [602, 148]]),
];

// =============================================================
// Billboards — placed automatically along the big roads
// =============================================================
const BOARD_TEXT = [
  { t: 'YOUR AD HERE', s: 'campuslife.app/ads', a: '#0ea5e9', b: '#14b8a6' },
  { t: 'DEAN CUP FINAL', s: 'Live at Motion Ground', a: '#16a34a', b: '#065f46' },
  { t: 'IYA BASIRA BUKA', s: 'Hot amala 24/7 @ SUB', a: '#db2777', b: '#7c3aed' },
  { t: 'TECH EXPO 2026', s: 'AI • Robotics • Careers', a: '#6366f1', b: '#06b6d4' },
  { t: 'FRESH BREAD', s: 'Baked daily • COLANIM', a: '#f59e0b', b: '#ea580c' },
  { t: 'SUG ELECTIONS', s: 'Vote for integrity', a: '#be185d', b: '#4f46e5' },
  { t: 'CBT HALL', s: 'Practice tests @ ICTREC', a: '#0f766e', b: '#0369a1' },
  { t: 'WELCOME FRESHERS', s: 'FUNAAB — Excellence', a: '#15803d', b: '#ca8a04' },
];
export const BOARDS = (() => {
  const out: { x: number; z: number; r: number; t: string; s: string; a: string; b: string }[] = [];
  let side = 1;
  for (const r of ROADS.filter((x) => x.w >= 8)) {
    const poly = makePoly(r.pts);
    let n = 0;
    for (let d = 45; d < poly.total - 30 && n < 2 && out.length < BOARD_TEXT.length; d += 55) {
      const p = pointAt(poly, d);
      const len = Math.hypot(p.dx, p.dz) || 1;
      const nx = (-p.dz / len) * side;
      const nz = (p.dx / len) * side;
      side *= -1;
      const off = r.w / 2 + 4;
      const bx = p.x + nx * off;
      const bz = p.z + nz * off;
      if (nearRoad(bx, bz, 1.5) || inLake(bx, bz, 4)) continue;
      if (PLACES.some((q) => Math.hypot(bx - q.pos[0], bz - q.pos[1]) < footprintOf(q).r + 6)) continue;
      out.push({ x: bx, z: bz, r: Math.atan2(-nx, -nz), ...BOARD_TEXT[out.length] });
      n++;
    }
  }
  return out;
})();

// tiny seeded RNG so the world looks the same every load
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ---------- camera bridge (UI buttons -> 3D scene) ----------
export const camApi = {
  zoom: (_f: number) => {},
  rotate: (_a: number) => {},
  flyTo: (_x: number, _z: number) => {},
  followPlayer: (_on: boolean) => {},
  recenter: () => {},
};

// live camera info (written by the camera rig, read by pins)
export const camState = { dist: 120, tx: 0, tz: 0 };

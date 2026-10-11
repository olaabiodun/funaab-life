import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, MapControls } from '@react-three/drei';
import * as THREE from 'three';
import { PLACES, Place } from './data';
import { MODELS, B, Cyl, Generic } from './models';
import { useGame } from './store';
import {
  BOUNDS, LAKE, ROAD_POLYS, ROADS, V2, camApi, inLake, makePoly, nearRoad, pointAt, rng, roadPoint, nodePos,
  BOARDS as WORLD_BOARDS, SHUTTLE_ROUTES, scaleOf,
} from './world';

// =============================================================
// Day / night sky + lights (driven by the in‑game clock)
// =============================================================
const SKY: [number, string][] = [
  [0, '#0a1230'], [5, '#1b2654'], [6.5, '#f2a46b'], [8, '#8fd3f4'],
  [17, '#8fd3f4'], [18.5, '#f08a5d'], [20, '#1b2654'], [24, '#0a1230'],
];
const tmpA = new THREE.Color();
const tmpB = new THREE.Color();
function skyAt(h: number, out: THREE.Color) {
  for (let i = 1; i < SKY.length; i++) {
    if (h <= SKY[i][0]) {
      const [h0, c0] = SKY[i - 1];
      const [h1, c1] = SKY[i];
      tmpA.set(c0);
      tmpB.set(c1);
      return out.copy(tmpA).lerp(tmpB, (h - h0) / (h1 - h0));
    }
  }
  return out.set(SKY[SKY.length - 1][1]);
}

function SkyRig() {
  const scene = useThree((s) => s.scene);
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const col = useMemo(() => new THREE.Color(), []);
  useEffect(() => {
    scene.background = new THREE.Color('#8fd3f4');
    scene.fog = new THREE.Fog('#8fd3f4', 140, 420);
  }, [scene]);
  useFrame(() => {
    const h = useGame.getState().minutes / 60;
    skyAt(h, col);
    (scene.background as THREE.Color).copy(col);
    (scene.fog as THREE.Fog).color.copy(col);
    const ang = ((h - 6) / 12) * Math.PI;
    const elev = Math.sin(ang);
    const day = Math.max(0, elev);
    if (sun.current) {
      sun.current.position.set(Math.cos(ang) * 120 + 10, Math.abs(elev) * 110 + 25, 60);
      sun.current.intensity = 0.2 + day * 1.25;
      sun.current.color.set(elev > 0 && elev < 0.25 ? '#ffc58a' : elev > 0 ? '#fff4e0' : '#8da2ff');
    }
    if (hemi.current) hemi.current.intensity = 0.28 + day * 0.7;
  });
  return (
    <>
      <hemisphereLight ref={hemi} args={['#ffffff', '#6b8f5e', 0.9]} />
      <directionalLight
        ref={sun}
        castShadow
        position={[60, 100, 60]}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-130}
        shadow-camera-right={130}
        shadow-camera-top={110}
        shadow-camera-bottom={-110}
        shadow-camera-near={1}
        shadow-camera-far={420}
        shadow-bias={-0.0006}
      />
    </>
  );
}

// =============================================================
// Terrain: grass, lake, roads, lawns
// =============================================================
const noRay = () => null;

function Ground() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[10, 0, 0]} receiveShadow raycast={noRay}>
        <planeGeometry args={[820, 620]} />
        <meshStandardMaterial color="#7cc06b" roughness={1} />
      </mesh>
      {PLACES.map((p) => {
        const rad = p.id === 'motion' ? 26 : p.id === 'zoo' ? 24 : p.major ? 18 : 12;
        return (
          <mesh key={p.id} rotation-x={-Math.PI / 2} position={[p.pos[0], 0.03, p.pos[1]]} receiveShadow raycast={noRay}>
            <circleGeometry args={[rad, 36]} />
            <meshStandardMaterial color="#93d17d" roughness={1} />
          </mesh>
        );
      })}
    </group>
  );
}

function Lake() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[LAKE.x, 0.04, LAKE.z]} scale={[LAKE.rx + 2.2, LAKE.rz + 2.2, 1]} receiveShadow raycast={noRay}>
        <circleGeometry args={[1, 48]} />
        <meshStandardMaterial color="#e9dba7" roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[LAKE.x, 0.08, LAKE.z]} scale={[LAKE.rx, LAKE.rz, 1]} receiveShadow raycast={noRay}>
        <circleGeometry args={[1, 48]} />
        <meshStandardMaterial color="#47b4e6" roughness={0.25} metalness={0.2} />
      </mesh>
      {/* pier + boat */}
      <B p={[LAKE.x - LAKE.rx - 3, 0.05, LAKE.z]} s={[9, 0.35, 2.4]} c="#a9764a" />
      <B p={[LAKE.x - 3, 0.15, LAKE.z + 2]} s={[3.4, 0.7, 1.4]} c="#f8fafc" rot={0.3} />
      <B p={[LAKE.x - 3, 0.85, LAKE.z + 2]} s={[0.15, 2.4, 0.15]} c="#555" rot={0.3} />
    </group>
  );
}

function Roads() {
  const parts: JSX.Element[] = [];
  ROADS.forEach((r, ri) => {
    const w = r.w;
    const poly = r.pts;
    for (let i = 0; i < poly.length - 1; i++) {
      const a = poly[i];
      const b = poly[i + 1];
      const dx = b[0] - a[0];
      const dz = b[1] - a[1];
      const len = Math.hypot(dx, dz);
      const rot = Math.atan2(dx, dz);
      const mx = (a[0] + b[0]) / 2;
      const mz = (a[1] + b[1]) / 2;
      parts.push(
        <group key={`${ri}-${i}`} position={[mx, 0, mz]} rotation={[0, rot, 0]}>
          <mesh position={[0, 0.1, 0]} receiveShadow raycast={noRay}>
            <boxGeometry args={[w, 0.2, len]} />
            <meshStandardMaterial color="#64748b" roughness={0.92} />
          </mesh>
          {r.line && (
            <mesh position={[0, 0.215, 0]} raycast={noRay}>
              <boxGeometry args={[0.32, 0.04, len * 0.95]} />
              <meshStandardMaterial color="#fef08a" />
            </mesh>
          )}
        </group>,
      );
    }
    poly.forEach((pt, i) =>
      parts.push(
        <mesh key={`j-${ri}-${i}`} position={[pt[0], 0.1, pt[1]]} receiveShadow raycast={noRay}>
          <cylinderGeometry args={[w / 2, w / 2, 0.2, 18]} />
          <meshStandardMaterial color="#64748b" roughness={0.92} />
        </mesh>,
      ),
    );
  });
  return <group>{parts}</group>;
}

// =============================================================
// Trees (instanced – cheap on phones)
// =============================================================
function Trees() {
  const data = useMemo(() => {
    const r = rng(11);
    const out: { x: number; z: number; s: number; type: number; tone: string }[] = [];
    const tones = ['#2f9e57', '#3aa95f', '#278a4c', '#4cb86a', '#2b8f57'];
    const push = (x: number, z: number) =>
      out.push({ x, z, s: 0.8 + r() * 0.9, type: r() < 0.55 ? 0 : 1, tone: tones[Math.floor(r() * tones.length)] });
    let tries = 0;
    while (out.length < 190 && tries < 5000) {
      tries++;
      const x = BOUNDS.minX - 12 + r() * (BOUNDS.maxX - BOUNDS.minX + 24);
      const z = BOUNDS.minZ - 12 + r() * (BOUNDS.maxZ - BOUNDS.minZ + 24);
      if (inLake(x, z, 4) || nearRoad(x, z, 5.5)) continue;
      if (PLACES.some((p) => Math.hypot(x - p.pos[0], z - p.pos[1]) < (p.id === 'zoo' ? 8 : 17))) continue;
      push(x, z);
    }
    const zoo = PLACES.find((p) => p.id === 'zoo')!;
    for (let i = 0; i < 40; i++) {
      const a = r() * Math.PI * 2;
      const d = 12 + r() * 16;
      const x = zoo.pos[0] + Math.cos(a) * d;
      const z = zoo.pos[1] + Math.sin(a) * d;
      if (nearRoad(x, z, 5.5) || inLake(x, z, 3)) continue;
      push(x, z);
    }
    return out;
  }, []);

  const trunk = useRef<THREE.InstancedMesh>(null);
  const cone = useRef<THREE.InstancedMesh>(null);
  const ball = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    if (!trunk.current || !cone.current || !ball.current) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const pos = new THREE.Vector3();
    const sc = new THREE.Vector3();
    const col = new THREE.Color();
    let ci = 0;
    let bi = 0;
    data.forEach((t, i) => {
      sc.set(t.s, t.s, t.s);
      pos.set(t.x, 1.1 * t.s, t.z);
      m.compose(pos, q, sc);
      trunk.current!.setMatrixAt(i, m);
      if (t.type === 0) {
        pos.set(t.x, (2.2 + 2.75) * t.s, t.z);
        m.compose(pos, q, sc);
        cone.current!.setMatrixAt(ci, m);
        cone.current!.setColorAt(ci, col.set(t.tone));
        ci++;
      } else {
        pos.set(t.x, (2.2 + 2.1) * t.s, t.z);
        m.compose(pos, q, sc);
        ball.current!.setMatrixAt(bi, m);
        ball.current!.setColorAt(bi, col.set(t.tone));
        bi++;
      }
    });
    trunk.current.count = data.length;
    cone.current.count = ci;
    ball.current.count = bi;
    [trunk, cone, ball].forEach((r) => {
      r.current!.instanceMatrix.needsUpdate = true;
      if (r.current!.instanceColor) r.current!.instanceColor.needsUpdate = true;
    });
  }, [data]);

  return (
    <group>
      <instancedMesh ref={trunk} args={[undefined, undefined, data.length]} castShadow frustumCulled={false} raycast={noRay}>
        <cylinderGeometry args={[0.35, 0.45, 2.2, 6]} />
        <meshStandardMaterial color="#7a5232" flatShading />
      </instancedMesh>
      <instancedMesh ref={cone} args={[undefined, undefined, data.length]} castShadow frustumCulled={false} raycast={noRay}>
        <coneGeometry args={[2.2, 5.5, 7]} />
        <meshStandardMaterial color="#ffffff" flatShading roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={ball} args={[undefined, undefined, data.length]} castShadow frustumCulled={false} raycast={noRay}>
        <icosahedronGeometry args={[2.5, 1]} />
        <meshStandardMaterial color="#ffffff" flatShading roughness={0.9} />
      </instancedMesh>
    </group>
  );
}

// =============================================================
// Digital billboards (canvas textures)
// =============================================================
function makeBoardTexture(title: string, sub: string, c1: string, c2: string) {
  const cv = document.createElement('canvas');
  cv.width = 512;
  cv.height = 256;
  const g = cv.getContext('2d')!;
  const grd = g.createLinearGradient(0, 0, 512, 256);
  grd.addColorStop(0, c1);
  grd.addColorStop(1, c2);
  g.fillStyle = grd;
  g.fillRect(0, 0, 512, 256);
  g.textAlign = 'center';
  g.fillStyle = '#fde68a';
  g.font = '800 46px system-ui, sans-serif';
  g.fillText(title, 256, 100);
  g.fillStyle = '#ffffff';
  g.font = '700 30px system-ui, sans-serif';
  g.fillText(sub, 256, 160);
  g.fillStyle = 'rgba(0,0,0,0.45)';
  g.fillRect(96, 190, 320, 44);
  g.fillStyle = '#fff';
  g.font = '800 26px system-ui, sans-serif';
  g.fillText('TAP TO ADVERTISE', 256, 222);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const BOARDS = [
  { x: -52, z: 20, r: 0.5, t: 'YOUR AD HERE', s: 'campuslife.app/ads', a: '#0ea5e9', b: '#14b8a6' },
  { x: -36, z: -8, r: 0.6, t: 'TECH EXPO 2026', s: 'AI • Robotics • Careers', a: '#6366f1', b: '#06b6d4' },
  { x: 8, z: 29, r: 0.15, t: 'IYA BASIRA BUKA', s: 'Hot amala 24/7', a: '#db2777', b: '#7c3aed' },
  { x: 38, z: 26, r: -0.1, t: 'DEAN CUP FINAL', s: 'Live at Motion Ground', a: '#16a34a', b: '#065f46' },
  { x: 70, z: 12, r: -0.4, t: 'FRESH BREAD', s: 'Baked daily • COLANIM', a: '#f59e0b', b: '#ea580c' },
  { x: -16, z: -4, r: -0.3, t: 'SUG ELECTIONS', s: 'Vote for integrity', a: '#be185d', b: '#4f46e5' },
];

function Billboard({ x, z, r, t, s, a, b }: (typeof BOARDS)[number]) {
  const tex = useMemo(() => makeBoardTexture(t, s, a, b), [t, s, a, b]);
  return (
    <group position={[x, 0, z]} rotation={[0, r, 0]}>
      <Cyl p={[-2.4, 0, 0]} r={0.2} h={5} c="#334155" seg={6} />
      <Cyl p={[2.4, 0, 0]} r={0.2} h={5} c="#334155" seg={6} />
      <B p={[0, 4.6, 0]} s={[8.6, 4.6, 0.5]} c="#0f172a" />
      <mesh position={[0, 6.9, 0.28]}>
        <planeGeometry args={[8, 4]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
}

// =============================================================
// People
// =============================================================
function Person({ body = '#16a34a', skin = '#f1c79b', hair = '#2b1d12', pack = '#f59e0b' }: { body?: string; skin?: string; hair?: string; pack?: string }) {
  return (
    <group>
      <mesh position={[0, 0.82, 0]} castShadow>
        <capsuleGeometry args={[0.38, 0.8, 4, 8]} />
        <meshStandardMaterial color={body} flatShading />
      </mesh>
      <mesh position={[0, 1.78, 0]} castShadow>
        <sphereGeometry args={[0.34, 10, 8]} />
        <meshStandardMaterial color={skin} flatShading />
      </mesh>
      <mesh position={[0, 1.95, -0.04]} castShadow>
        <sphereGeometry args={[0.35, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={hair} flatShading />
      </mesh>
      <mesh position={[0, 0.95, -0.42]} castShadow>
        <boxGeometry args={[0.55, 0.7, 0.28]} />
        <meshStandardMaterial color={pack} flatShading />
      </mesh>
    </group>
  );
}

const NPC_TONES = ['#ef4444', '#3b82f6', '#a855f7', '#f59e0b', '#14b8a6', '#ec4899', '#84cc16', '#f97316'];
function Npc({ seed }: { seed: number }) {
  const g = useRef<THREE.Group>(null);
  const cfg = useMemo(() => {
    const r = rng(seed * 97 + 5);
    const ri = Math.floor(r() * ROAD_POLYS.length);
    const poly = makePoly(ROAD_POLYS[ri]);
    return {
      poly,
      d: r() * poly.total,
      dir: r() < 0.5 ? 1 : -1,
      speed: 1.3 + r() * 1.3,
      side: (r() < 0.5 ? -1 : 1) * (1.4 + r()),
      body: NPC_TONES[seed % NPC_TONES.length],
      skin: ['#f1c79b', '#c68642', '#8d5524', '#e0ac69'][seed % 4],
    };
  }, [seed]);
  const st = useRef({ d: cfg.d, dir: cfg.dir });
  useFrame((state, dt) => {
    const s = st.current;
    s.d += s.dir * cfg.speed * dt;
    if (s.d > cfg.poly.total) { s.d = cfg.poly.total; s.dir = -1; }
    if (s.d < 0) { s.d = 0; s.dir = 1; }
    const p = pointAt(cfg.poly, s.d);
    const len = Math.hypot(p.dx, p.dz) || 1;
    const nx = -p.dz / len;
    const nz = p.dx / len;
    if (g.current) {
      g.current.position.set(p.x + nx * cfg.side, Math.abs(Math.sin(state.clock.elapsedTime * 7 + seed)) * 0.12, p.z + nz * cfg.side);
      g.current.rotation.y = Math.atan2(p.dx * s.dir, p.dz * s.dir);
    }
  });
  return (
    <group ref={g} scale={0.9}>
      <Person body={cfg.body} skin={cfg.skin} pack={cfg.body} />
    </group>
  );
}

function Shuttle({ routeIdx = 0, initialD = 0 }: { routeIdx?: number; initialD?: number }) {
  const g = useRef<THREE.Group>(null);
  const poly = useMemo(() => makePoly(SHUTTLE_ROUTES[routeIdx] || ROAD_POLYS[0]), [routeIdx]);
  const st = useRef({ d: initialD, dir: 1 });
  useFrame((_, dt) => {
    const s = st.current;
    s.d += s.dir * 9 * dt;
    if (s.d > poly.total) { s.d = poly.total; s.dir = -1; }
    if (s.d < 0) { s.d = 0; s.dir = 1; }
    const p = pointAt(poly, s.d);
    const len = Math.hypot(p.dx, p.dz) || 1;
    if (g.current) {
      g.current.position.set(p.x + (-p.dz / len) * 1.3 * s.dir, 0, p.z + (p.dx / len) * 1.3 * s.dir);
      g.current.rotation.y = Math.atan2(p.dx * s.dir, p.dz * s.dir);
    }
  });
  return (
    <group ref={g}>
      <B p={[0, 0.5, 0]} s={[2.6, 2.2, 6]} c="#facc15" />
      <B p={[0, 2.7, 0]} s={[2.4, 0.2, 5.8]} c="#16a34a" />
      <B p={[0, 1.4, 0.1]} s={[2.7, 0.9, 4.8]} c="#1e293b" />
      <B p={[0, 1.2, 3.02]} s={[2.2, 1, 0.1]} c="#bae6fd" />
      {[-1.4, 1.4].flatMap((x) => [-2, 2].map((z) => (
        <mesh key={`${x}${z}`} position={[x, 0.5, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.4, 10]} />
          <meshStandardMaterial color="#111827" flatShading />
        </mesh>
      )))}
    </group>
  );
}

// =============================================================
// The player — walks along the road graph
// =============================================================
export const playerPos = new THREE.Vector3();

function Player() {
  const g = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const travel = useGame((s) => s.travel);
  const location = useGame((s) => s.location);
  const wp = useRef<V2[]>([]);
  const idx = useRef(1);
  const done = useRef(false);

  useEffect(() => {
    if (!g.current) return;
    if (travel) {
      wp.current = travel.path.map(nodePos);
      idx.current = 1;
      done.current = false;
      g.current.position.set(wp.current[0][0], 0, wp.current[0][1]);
      camApi.followPlayer(true);
    } else {
      const [x, z] = roadPoint(location);
      g.current.position.set(x, 0, z);
      camApi.followPlayer(false);
    }
    playerPos.copy(g.current.position);
  }, [travel, location]);

  useFrame((state, dt) => {
    const o = g.current;
    if (!o) return;
    const tr = useGame.getState().travel;
    if (tr && wp.current.length > 1 && !done.current) {
      const target = wp.current[Math.min(idx.current, wp.current.length - 1)];
      const dx = target[0] - o.position.x;
      const dz = target[1] - o.position.z;
      const dist = Math.hypot(dx, dz);
      const step = (tr.mode === 'shuttle' ? 22 : 7) * Math.min(dt, 0.05);
      if (dist <= step) {
        o.position.x = target[0];
        o.position.z = target[1];
        idx.current++;
        if (idx.current >= wp.current.length) {
          done.current = true;
          useGame.getState().finishTravel();
        }
      } else {
        o.position.x += (dx / dist) * step;
        o.position.z += (dz / dist) * step;
        const want = Math.atan2(dx, dz);
        let diff = want - o.rotation.y;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        o.rotation.y += diff * Math.min(1, dt * 10);
      }
      o.position.y = tr.mode === 'walk' ? Math.abs(Math.sin(state.clock.elapsedTime * 11)) * 0.22 : 0;
    } else {
      o.position.y = 0;
    }
    playerPos.copy(o.position);
    if (ring.current) {
      const k = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.12;
      ring.current.scale.set(k, k, k);
    }
  });

  return (
    <group ref={g}>
      <Person body="#059669" pack="#fbbf24" />
      <mesh ref={ring} rotation-x={-Math.PI / 2} position={[0, 0.3, 0]} raycast={noRay}>
        <ringGeometry args={[1.1, 1.45, 28]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.9} />
      </mesh>
      <Html position={[0, 3.2, 0]} center zIndexRange={[25, 0]} style={{ pointerEvents: 'none' }}>
        <div className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black shadow-lg whitespace-nowrap border border-white/70">
          {travel ? (travel.mode === 'shuttle' ? '🚐 Riding' : '🚶 Walking') : '😎 You'}
        </div>
      </Html>
    </group>
  );
}

// =============================================================
// Pins + building click targets
// =============================================================
function Pin({ p }: { p: Place }) {
  const selected = useGame((s) => s.selected === p.id);
  const here = useGame((s) => s.location === p.id && !s.travel);
  return (
    <Html position={[p.pos[0], p.h + 2, p.pos[1]]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <button
        onClick={() => {
          useGame.getState().select(p.id);
          camApi.flyTo(p.pos[0], p.pos[1] + 4);
        }}
        className="pointer-events-auto flex flex-col items-center active:scale-90 transition-transform"
      >
        <span
          className={`relative w-9 h-9 rounded-full bg-white flex items-center justify-center text-[19px] shadow-lg border-2 transition-all ${
            selected ? 'border-emerald-500 scale-125 ring-4 ring-emerald-400/60' : 'border-white'
          }`}
        >
          {p.emoji}
          {here && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />}
        </span>
        <span className="w-0.5 h-2 bg-white/90" />
        <span className="px-1.5 rounded-full bg-slate-900/80 text-[9px] font-extrabold text-white whitespace-nowrap">{p.short}</span>
      </button>
    </Html>
  );
}

function PlaceModel({ p }: { p: Place }) {
  const Model = MODELS[p.id];
  const sc = scaleOf(p.id);
  const rot = p.rot || 0;
  return (
    <group
      position={[p.pos[0], 0, p.pos[1]]}
      rotation={[0, rot, 0]}
      onClick={(e) => {
        e.stopPropagation();
        useGame.getState().select(p.id);
        camApi.flyTo(p.pos[0], p.pos[1] + 4);
      }}
    >
      {Model ? (
        <group scale={sc}>
          <Model />
        </group>
      ) : (
        <Generic p={p} />
      )}
    </group>
  );
}

// =============================================================
// Camera rig: smooth fly-to, follow player, bounds, zoom/rotate API
// =============================================================
const UP = new THREE.Vector3(0, 1, 0);
function CameraRig() {
  const controls = useThree((s) => s.controls) as any;
  const camera = useThree((s) => s.camera);
  const focus = useRef<THREE.Vector3 | null>(null);
  const follow = useRef(false);

  useEffect(() => {
    if (!controls) return;
    camApi.flyTo = (x, z) => { focus.current = new THREE.Vector3(x, 0, z); follow.current = false; };
    camApi.followPlayer = (on) => { follow.current = on; if (on) focus.current = null; };
    camApi.recenter = () => { focus.current = playerPos.clone(); follow.current = false; };
    camApi.zoom = (f) => {
      const off = camera.position.clone().sub(controls.target);
      const len = Math.min(130, Math.max(14, off.length() * f));
      off.setLength(len);
      camera.position.copy(controls.target).add(off);
      controls.update();
    };
    camApi.rotate = (a) => {
      const off = camera.position.clone().sub(controls.target).applyAxisAngle(UP, a);
      camera.position.copy(controls.target).add(off);
      controls.update();
    };
    const onStart = () => { focus.current = null; follow.current = false; };
    controls.addEventListener('start', onStart);
    return () => controls.removeEventListener('start', onStart);
  }, [controls, camera]);

  useFrame((_, dt) => {
    if (!controls) return;
    const t = controls.target as THREE.Vector3;
    const goal = follow.current ? playerPos : focus.current;
    if (goal) {
      const dx = goal.x - t.x;
      const dz = goal.z - t.z;
      const k = 1 - Math.pow(0.0008, Math.min(dt, 0.05));
      t.x += dx * k;
      t.z += dz * k;
      camera.position.x += dx * k;
      camera.position.z += dz * k;
      if (!follow.current && Math.hypot(dx, dz) < 0.1) focus.current = null;
    }
    const cx = Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, t.x));
    const cz = Math.max(BOUNDS.minZ, Math.min(BOUNDS.maxZ, t.z));
    if (cx !== t.x || cz !== t.z) {
      camera.position.x += cx - t.x;
      camera.position.z += cz - t.z;
      t.x = cx;
      t.z = cz;
    }
    t.y = 0;
  });
  return null;
}

// =============================================================
// Root
// =============================================================
export default function Scene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [-45, 52, 88], fov: 42, near: 1, far: 700 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onPointerMissed={() => useGame.getState().select(null)}
      style={{ touchAction: 'none' }}
    >
      <SkyRig />
      <Ground />
      <Lake />
      <Roads />
      <Trees />
      {PLACES.map((p) => <PlaceModel key={p.id} p={p} />)}
      {WORLD_BOARDS.map((b, i) => <Billboard key={i} {...b} />)}
      <Shuttle routeIdx={0} initialD={10} />
      <Shuttle routeIdx={1} initialD={45} />
      {Array.from({ length: 16 }, (_, i) => <Npc key={i} seed={i + 1} />)}
      <Player />
      {PLACES.map((p) => <Pin key={p.id} p={p} />)}
      <MapControls
        makeDefault
        enableDamping
        dampingFactor={0.09}
        screenSpacePanning={false}
        minDistance={14}
        maxDistance={130}
        minPolarAngle={0.25}
        maxPolarAngle={1.2}
        panSpeed={1.1}
        rotateSpeed={0.55}
        zoomSpeed={0.8}
        target={[-45, 0, 30]}
      />
      <CameraRig />
    </Canvas>
  );
}

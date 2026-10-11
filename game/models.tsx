import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { Place } from './data';

type V3 = [number, number, number];

// ---------- primitives (low-poly, flat shaded) ----------
export const B = ({ p = [0, 0, 0], s, c, e, o, rot = 0 }: { p?: V3; s: V3; c: string; e?: string; o?: number; rot?: number }) => (
  <mesh position={[p[0], p[1] + s[1] / 2, p[2]]} rotation={[0, rot, 0]} castShadow receiveShadow>
    <boxGeometry args={s} />
    <meshStandardMaterial
      color={c}
      emissive={e || '#000000'}
      emissiveIntensity={e ? 0.7 : 0}
      transparent={o !== undefined}
      opacity={o ?? 1}
      flatShading
      roughness={0.85}
    />
  </mesh>
);

export const Cyl = ({ p = [0, 0, 0], r, h, c, seg = 12, r2 }: { p?: V3; r: number; h: number; c: string; seg?: number; r2?: number }) => (
  <mesh position={[p[0], p[1] + h / 2, p[2]]} castShadow receiveShadow>
    <cylinderGeometry args={[r2 ?? r, r, h, seg]} />
    <meshStandardMaterial color={c} flatShading roughness={0.85} />
  </mesh>
);

export const Pyramid = ({ p = [0, 0, 0], r, h, c, sx = 1, sz = 1 }: { p?: V3; r: number; h: number; c: string; sx?: number; sz?: number }) => (
  <mesh position={[p[0], p[1] + h / 2, p[2]]} rotation={[0, Math.PI / 4, 0]} scale={[sx, 1, sz]} castShadow>
    <coneGeometry args={[r, h, 4]} />
    <meshStandardMaterial color={c} flatShading roughness={0.8} />
  </mesh>
);

export const Ball = ({ p = [0, 0, 0], r, c, sy = 1 }: { p?: V3; r: number; c: string; sy?: number }) => (
  <mesh position={p} scale={[1, sy, 1]} castShadow>
    <sphereGeometry args={[r, 14, 10]} />
    <meshStandardMaterial color={c} flatShading roughness={0.7} />
  </mesh>
);

// grid of windows on a front face (+z)
const Windows = ({ w, y0, h, cols, rows, z, c = '#9fd6f2' }: { w: number; y0: number; h: number; cols: number; rows: number; z: number; c?: string }) => {
  const items: JSX.Element[] = [];
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      const x = ((k + 0.5) / cols - 0.5) * w * 0.82;
      const y = y0 + ((r + 0.5) / rows) * h;
      items.push(<B key={`${r}-${k}`} p={[x, y - 0.5, z]} s={[(w / cols) * 0.42, (h / rows) * 0.5, 0.12]} c={c} e="#ffd98a" />);
    }
  }
  return <>{items}</>;
};

// ---------- individual campus buildings (origin = ground centre, face +z) ----------
const Gate = () => (
  <group>
    <B p={[-6.5, 0, 0]} s={[3, 11, 3]} c="#f1e6c8" />
    <B p={[6.5, 0, 0]} s={[3, 11, 3]} c="#f1e6c8" />
    <B p={[0, 9.4, 0]} s={[17, 3, 3.6]} c="#1f9d63" />
    <B p={[0, 12.4, 0]} s={[7, 1.2, 3]} c="#f1e6c8" />
    <Ball p={[0, 14.4, 0]} r={1.4} c="#f4b400" />
    <B p={[-12, 0, 3]} s={[5, 4, 5]} c="#d9d2bf" />
    <B p={[-12, 4, 3]} s={[6.4, 0.6, 6.4]} c="#8a4b2a" />
    <B p={[-2, 1.4, 5]} s={[8, 0.35, 0.35]} c="#e33b3b" />
    <B p={[-6, 0, 5]} s={[0.5, 1.8, 0.5]} c="#555" />
  </group>
);

const Senate = () => (
  <group>
    <B p={[0, 0, 0]} s={[18, 5, 12]} c="#d3d9e2" />
    <B p={[0, 5, 0]} s={[9, 22, 9]} c="#4a607f" />
    <Windows w={9} y0={6} h={20} cols={3} rows={8} z={4.55} />
    <B p={[0, 27, 0]} s={[10, 0.8, 10]} c="#2e3d54" />
    <Cyl p={[0, 27.8, 0]} r={0.12} h={5} c="#999" seg={6} />
    <B p={[0.9, 31, 0]} s={[1.8, 1.1, 0.1]} c="#1f9d63" />
    <Windows w={18} y0={0.6} h={3.2} cols={6} rows={1} z={6.05} />
  </group>
);

const Ceremonial = () => (
  <group>
    <B p={[0, 0, 0]} s={[22, 7, 14]} c="#ece3cd" />
    <Cyl p={[0, 7, 0]} r={6} r2={5.2} h={2} c="#e0d4b4" seg={20} />
    <mesh position={[0, 9, 0]} castShadow>
      <sphereGeometry args={[5.2, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#d4a72c" flatShading roughness={0.4} metalness={0.3} />
    </mesh>
    {[-8, -4.8, -1.6, 1.6, 4.8, 8].map((x) => (
      <Cyl key={x} p={[x, 0, 7.8]} r={0.5} h={7} c="#f8f3e6" seg={8} />
    ))}
    <B p={[0, 7, 7.8]} s={[19, 0.7, 1.6]} c="#c4b896" />
  </group>
);

const Jao = () => (
  <group>
    <B p={[-9, 0, 2]} s={[8, 7, 11]} c="#2f6fb5" rot={0.35} />
    <B p={[0, 0, 0]} s={[9, 8, 12]} c="#3b82c9" />
    <B p={[9, 0, 2]} s={[8, 7, 11]} c="#2f6fb5" rot={-0.35} />
    <B p={[-9, 7, 2]} s={[8.6, 0.8, 11.6]} c="#1e4f87" rot={0.35} />
    <B p={[0, 8, 0]} s={[9.6, 0.8, 12.6]} c="#1e4f87" />
    <B p={[9, 7, 2]} s={[8.6, 0.8, 11.6]} c="#1e4f87" rot={-0.35} />
    <Windows w={9} y0={1} h={6} cols={3} rows={2} z={6.08} />
    <B p={[0, 0, 7]} s={[6, 0.4, 3]} c="#cbd5e1" />
  </group>
);

const Ict = () => (
  <group>
    <B p={[0, 0, 0]} s={[14, 7, 9]} c="#3a8fd0" />
    <B p={[0, 7, 0]} s={[14.6, 0.7, 9.6]} c="#245f8d" />
    <B p={[0, 1.4, 4.6]} s={[9, 3.6, 0.2]} c="#0f172a" e="#22d3ee" />
    <B p={[5.5, 7.7, 0]} s={[2, 2.4, 2]} c="#94a3b8" />
    <Cyl p={[-4, 7.7, -1]} r={0.15} h={4} c="#bbb" seg={6} />
    <Ball p={[-4, 12, -1]} r={0.7} c="#e11d48" />
  </group>
);

const Coleng = () => (
  <group>
    <B p={[0, 0, 0]} s={[18, 6, 12]} c="#c97b3d" />
    {[-5.5, 0, 5.5].map((x) => (
      <group key={x}>
        <B p={[x, 6, 0]} s={[5, 2.4, 12]} c="#a9622d" />
        <B p={[x + 1.6, 6, 0]} s={[1.8, 3.2, 12]} c="#7c4519" />
      </group>
    ))}
    <Cyl p={[8, 0, -4]} r={1.2} r2={0.8} h={14} c="#8f3c2a" seg={10} />
    <B p={[0, 0, 6.1]} s={[7, 4.2, 0.2]} c="#334155" />
    <B p={[-7, 0, 8]} s={[3, 1.8, 2]} c="#f59e0b" />
  </group>
);

const Colamrud = () => (
  <group>
    <B p={[0, 0, 0]} s={[16, 9, 10]} c="#2fa39a" />
    <B p={[0, 9, 0]} s={[16.8, 0.8, 10.8]} c="#1d7a73" />
    <Windows w={16} y0={1.2} h={7.5} cols={5} rows={3} z={5.08} />
    <B p={[-9.5, 0, 3]} s={[3, 4, 4]} c="#facc15" />
    <B p={[-9.5, 4, 3]} s={[3.6, 0.5, 4.6]} c="#a16207" />
  </group>
);

const Colplant = () => (
  <group>
    <B p={[-2, 0, 0]} s={[16, 6, 10]} c="#dff4ea" o={0.38} />
    <B p={[-2, 6, 0]} s={[16.4, 0.4, 10.4]} c="#7dd3a8" o={0.6} />
    {[-6, -3, 0, 3].map((x) => (
      <B key={x} p={[x - 1, 0, 0]} s={[1.4, 1.1, 7.5]} c="#22a447" />
    ))}
    <B p={[12, 0, 1]} s={[7, 4.6, 6]} c="#f4f4f5" />
    <B p={[12, 4.6, 1]} s={[7.6, 0.5, 6.6]} c="#be123c" />
    <B p={[12, 1.4, 4.1]} s={[1.2, 2.4, 0.2]} c="#e11d48" />
    <B p={[10.8, 2.2, 4.1]} s={[3.6, 0.8, 0.2]} c="#e11d48" />
  </group>
);

const Colanim = () => (
  <group>
    <B p={[0, 0, 0]} s={[13, 6, 10]} c="#b8403a" />
    <Pyramid p={[0, 6, 0]} r={9.4} h={5} c="#7a2a26" sx={1.1} sz={0.85} />
    <B p={[0, 0, 5.05]} s={[4, 4.5, 0.2]} c="#f5ead0" />
    <Cyl p={[9.5, 0, -1]} r={2} h={10} c="#cbd5e1" seg={14} />
    <Ball p={[9.5, 10, -1]} r={2} c="#94a3b8" sy={0.7} />
    <B p={[-9, 0, 6]} s={[4, 1.4, 6]} c="#a16207" />
    <B p={[-9, 0.2, 13]} s={[0.3, 1.4, 6]} c="#f5f5f4" />
  </group>
);

const awning = ['#e11d48', '#0284c7', '#16a34a', '#eab308', '#9333ea', '#ea580c', '#06b6d4', '#db2777'];
const Sub = () => (
  <group>
    <B p={[0, 0, 0]} s={[24, 0.4, 16]} c="#d7cdb0" />
    {[0, 1, 2, 3].map((i) => (
      <group key={i}>
        <B p={[-9 + i * 6, 0.4, -4]} s={[4.4, 3.2, 3.6]} c="#f5ead0" />
        <B p={[-9 + i * 6, 3.6, -3]} s={[5.2, 0.5, 5.6]} c={awning[i]} />
        <B p={[-9 + i * 6, 0.4, 4]} s={[4.4, 3.2, 3.6]} c="#f5ead0" />
        <B p={[-9 + i * 6, 3.6, 4.8]} s={[5.2, 0.5, 5.6]} c={awning[i + 4]} />
      </group>
    ))}
    <B p={[0, 0.4, 0]} s={[3, 1, 3]} c="#8b5a2b" />
    <Ball p={[0, 7, -8]} r={0} c="#fff" />
    <B p={[0, 7.5, -8]} s={[10, 2.4, 0.4]} c="#16a34a" e="#34d399" />
  </group>
);

const Chapel = () => (
  <group>
    <B p={[0, 0, -1]} s={[9, 6, 13]} c="#f3efe3" />
    <Pyramid p={[0, 6, -1]} r={8} h={4.5} c="#8a4b2a" sx={0.8} sz={1.05} />
    <B p={[0, 0, 6]} s={[3.6, 13, 3.6]} c="#f3efe3" />
    <Pyramid p={[0, 13, 6]} r={2.8} h={4.5} c="#8a4b2a" />
    <B p={[-0.1, 17.5, 6]} s={[0.4, 2.4, 0.4]} c="#facc15" />
    <B p={[-0.1, 18.5, 6]} s={[1.6, 0.4, 0.4]} c="#facc15" />
    <B p={[0, 0, 7.9]} s={[1.6, 2.6, 0.2]} c="#7c4a24" />
  </group>
);

const Mosque = () => (
  <group>
    <B p={[0, 0, 0]} s={[11, 5.2, 10]} c="#f8fafc" />
    <mesh position={[0, 5.2, 0]} castShadow>
      <sphereGeometry args={[4, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#14b8a6" flatShading roughness={0.5} />
    </mesh>
    <Cyl p={[0, 9, 0]} r={0.12} h={1.6} c="#facc15" seg={6} />
    <Cyl p={[6.5, 0, 3.5]} r={0.9} h={12} c="#f8fafc" seg={10} />
    <Cyl p={[6.5, 12, 3.5]} r={1.3} h={0.6} c="#14b8a6" seg={10} />
    <Ball p={[6.5, 13.5, 3.5]} r={1} c="#14b8a6" />
    <B p={[0, 0, 5.05]} s={[3, 3.4, 0.2]} c="#0f766e" />
  </group>
);

const Motion = () => (
  <group>
    <mesh position={[0, 0.15, 0]} scale={[1, 1, 0.62]} receiveShadow>
      <cylinderGeometry args={[17, 17, 0.3, 32]} />
      <meshStandardMaterial color="#c4623a" flatShading />
    </mesh>
    <mesh position={[0, 0.32, 0]} scale={[1, 1, 0.62]} receiveShadow>
      <cylinderGeometry args={[13.5, 13.5, 0.3, 32]} />
      <meshStandardMaterial color="#3aa853" flatShading />
    </mesh>
    <B p={[0, 0.5, 0]} s={[0.25, 0.1, 17]} c="#ffffff" />
    <mesh position={[0, 0.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[2.6, 2.9, 24]} />
      <meshBasicMaterial color="#fff" />
    </mesh>
    {[-12.2, 12.2].map((x) => (
      <group key={x}>
        <B p={[x, 0.5, 0]} s={[0.25, 2.8, 4.5]} c="#fff" />
      </group>
    ))}
    <B p={[0, 0, -13.5]} s={[22, 3, 3]} c="#cbd5e1" />
    <B p={[0, 3, -15.5]} s={[22, 3, 3]} c="#94a3b8" />
    <B p={[0, 6, -17]} s={[22.6, 0.6, 5]} c="#e11d48" />
    {[-8, -4, 0, 4, 8].map((x) => (
      <B key={x} p={[x, 3, -12.5]} s={[1.8, 0.8, 1]} c="#facc15" />
    ))}
  </group>
);

const Zoo = () => (
  <group>
    <B p={[-6, 0, 8]} s={[1.4, 7, 1.4]} c="#8a5a2b" />
    <B p={[6, 0, 8]} s={[1.4, 7, 1.4]} c="#8a5a2b" />
    <B p={[0, 7, 8]} s={[14, 1.6, 1.6]} c="#15803d" />
    <B p={[0, 7.2, 8.1]} s={[8, 1, 0.2]} c="#fde68a" e="#fbbf24" />
    <mesh position={[-4, 0.08, -2]} scale={[1, 1, 0.65]} receiveShadow>
      <cylinderGeometry args={[6, 6, 0.1, 24]} />
      <meshStandardMaterial color="#4cb7e5" flatShading />
    </mesh>
    {/* cages + animals */}
    <B p={[7, 0, -2]} s={[7, 0.3, 6]} c="#a1a1aa" />
    {[[-3.4, -3], [3.4, -3], [-3.4, 3], [3.4, 3]].map(([x, z], i) => (
      <B key={i} p={[7 + x, 0, -2 + z]} s={[0.25, 3, 0.25]} c="#52525b" />
    ))}
    <B p={[7, 0.3, -2]} s={[2.4, 1.2, 1.2]} c="#d99a3d" />
    <Ball p={[8.6, 1.5, -2]} r={0.8} c="#b45309" />
    <B p={[-12, 0.2, 3]} s={[1.6, 1.6, 2.4]} c="#a3a3a3" />
    <Cyl p={[-12, 1.6, 4]} r={0.35} h={2} c="#a3a3a3" seg={6} />
  </group>
);

const Health = () => (
  <group>
    <B p={[0, 0, 0]} s={[16, 7.5, 10]} c="#f4f4f5" />
    <B p={[0, 7.5, 0]} s={[16.8, 0.7, 10.8]} c="#cbd5e1" />
    <B p={[0, 3, 5.08]} s={[1.6, 5, 0.25]} c="#e11d48" />
    <B p={[0, 4.5, 5.08]} s={[5, 1.6, 0.25]} c="#e11d48" />
    <Windows w={16} y0={0.8} h={6} cols={5} rows={2} z={5.08} />
    <B p={[10, 0, 5]} s={[3.2, 2.2, 5.5]} c="#ffffff" />
    <B p={[10, 1.2, 7.8]} s={[3.2, 0.8, 0.1]} c="#e11d48" />
    <B p={[10, 2.2, 5]} s={[2.4, 0.3, 1]} c="#2563eb" e="#60a5fa" />
  </group>
);

const hostelTone = ['#e9a98a', '#f2d17a', '#9bc9a6', '#9dbbe8', '#d6a2d8', '#f0a0a0'];
const Hostels = () => (
  <group>
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const x = -11 + (i % 3) * 11;
      const z = i < 3 ? -5 : 7;
      return (
        <group key={i} position={[x, 0, z]}>
          <B s={[8, 8, 6]} c={hostelTone[i]} />
          <B p={[0, 8, 0]} s={[8.6, 0.6, 6.6]} c="#7c3a2a" />
          <Windows w={8} y0={1} h={6.5} cols={3} rows={2} z={3.06} />
        </group>
      );
    })}
    <Cyl p={[15, 0, 0]} r={0.9} h={2.4} c="#facc15" seg={8} />
  </group>
);

const shopTone = ['#f43f5e', '#0ea5e9', '#22c55e', '#f59e0b', '#a855f7'];
const Camp = () => (
  <group>
    {[0, 1, 2, 3, 4].map((i) => (
      <group key={i} position={[-12 + i * 6, 0, i % 2 ? 3 : 0]}>
        <B s={[5, 5.5, 5]} c={shopTone[i]} />
        <B p={[0, 5.5, 0]} s={[5.6, 0.5, 5.6]} c="#374151" />
        <B p={[0, 0.6, 2.55]} s={[3.2, 2.4, 0.12]} c="#fef3c7" e="#fde68a" />
      </group>
    ))}
    <Cyl p={[-14, 0, -6]} r={0.35} h={11} c="#9ca3af" seg={8} />
    <B p={[-14, 11, -6]} s={[4.4, 2.2, 0.4]} c="#16a34a" e="#34d399" />
  </group>
);

export const MODELS: Record<string, React.FC> = {
  main_gate: Gate,
  camp: Camp,
  chapel: Chapel,
  mosque: Mosque,
  senate: Senate,
  ceremonial: Ceremonial,
  ict: Ict,
  jao: Jao,
  coleng: Coleng,
  colamrud: Colamrud,
  colplant: Colplant,
  colanim: Colanim,
  sub: Sub,
  motion: Motion,
  zoo: Zoo,
  health: Health,
  hostels: Hostels,
};

// =============================================================
// Generic campus building (kind-aware), using one shared window texture
// =============================================================
let baseWin: THREE.CanvasTexture | null = null;
function windowTexture() {
  if (baseWin) return baseWin;
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d')!;
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, 64, 64);
  g.fillStyle = '#35506f';
  g.fillRect(14, 14, 36, 30);
  g.fillStyle = '#7fb3d9';
  g.fillRect(16, 16, 15, 12);
  g.fillStyle = '#e5e7eb';
  g.fillRect(12, 44, 40, 4);
  baseWin = new THREE.CanvasTexture(c);
  baseWin.colorSpace = THREE.SRGBColorSpace;
  baseWin.wrapS = baseWin.wrapT = THREE.RepeatWrapping;
  return baseWin;
}

const PALETTE: Record<string, string[]> = {
  Academics: ['#efe2c2', '#cfe3f0', '#f2cfae', '#d6e9c9', '#e9d6ea', '#f5e7a8'],
  Admin: ['#f1f5f9', '#e7e0cf', '#dbe7f3'],
  Hostels: ['#e9a98a', '#f2d17a', '#9bc9a6', '#9dbbe8', '#d6a2d8', '#f0a0a0'],
  Shop: ['#fde68a', '#fecaca', '#bae6fd'],
  Sports: ['#e2e8f0'],
  Transport: ['#cbd5e1'],
};
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

function Walls({ w, d, h, color, roof, y = 0 }: { w: number; d: number; h: number; color: string; roof: string; y?: number }) {
  const mats = useMemo(() => {
    const t = windowTexture().clone();
    t.repeat.set(Math.max(1, Math.round(w / 3.4)), Math.max(1, Math.round(h / 3.2)));
    t.needsUpdate = true;
    const wall = new THREE.MeshStandardMaterial({ map: t, color, roughness: 0.85 });
    const top = new THREE.MeshStandardMaterial({ color: roof, roughness: 0.9, flatShading: true });
    return [wall, wall, top, top, wall, wall];
  }, [w, h, color, roof]);
  return (
    <mesh position={[0, y + h / 2, 0]} material={mats} castShadow receiveShadow>
      <boxGeometry args={[w, h, d]} />
    </mesh>
  );
}

const CARS = ['#ef4444', '#3b82f6', '#f8fafc', '#facc15', '#111827'];

export function Generic({ p }: { p: Place }) {
  const [w, d, h] = p.style || [10, 7, 6];
  const hs = hash(p.id);
  const pal = PALETTE[p.kind] || PALETTE.Academics;
  const color = pal[hs % pal.length];

  if (p.kind === 'Transport') {
    return (
      <group>
        <B p={[0, 0, 0]} s={[w, 0.25, d]} c="#4b5563" />
        {Array.from({ length: Math.floor(w / 3) }, (_, i) => (
          <B key={i} p={[-w / 2 + 1.5 + i * 3, 0.25, 0]} s={[0.15, 0.04, d * 0.8]} c="#f8fafc" />
        ))}
        {[0, 1, 2].map((i) => (
          <B key={`c${i}`} p={[-w / 2 + 3 + i * 4.5, 0.3, (i % 2 ? 1 : -1) * 1.6]} s={[1.8, 1.2, 3]} c={CARS[(hs + i) % CARS.length]} />
        ))}
      </group>
    );
  }

  if (p.kind === 'Hostels') {
    return (
      <group>
        <Walls w={w} d={d} h={h} color={color} roof="#7c3a2a" />
        <Pyramid p={[0, h, 0]} r={Math.max(w, d) * 0.72} h={3.6} c="#8a3b2a" sx={w / Math.max(w, d)} sz={d / Math.max(w, d)} />
        <Cyl p={[w / 2 - 1.5, h + 1.4, -d / 4]} r={0.9} h={1.8} c="#1f2937" seg={8} />
        <B p={[0, 0, d / 2 + 0.1]} s={[2, 2.6, 0.2]} c="#7c4a24" />
      </group>
    );
  }

  if (p.kind === 'Shop') {
    return (
      <group>
        <Walls w={w} d={d} h={h} color={color} roof="#475569" />
        <B p={[0, h * 0.55, d / 2 + 1]} s={[w + 0.4, 0.3, 2.2]} c={['#e11d48', '#0284c7', '#16a34a'][hs % 3]} />
        <B p={[0, h + 0.1, d / 2 - 0.3]} s={[w * 0.6, 1.4, 0.3]} c="#0f172a" e="#fbbf24" />
      </group>
    );
  }

  if (p.kind === 'Sports') {
    return (
      <group>
        <Walls w={w} d={d} h={h} color={color} roof="#2563eb" />
        <mesh position={[0, h, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.35, 1, 1]} castShadow>
          <cylinderGeometry args={[d / 2, d / 2, w, 16, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#3b82f6" flatShading side={THREE.DoubleSide} />
        </mesh>
        <B p={[w / 2 + 4.5, 0, 0]} s={[6, 0.1, d]} c="#c2410c" />
      </group>
    );
  }

  const isNew = p.id.startsWith('nb');
  return (
    <group>
      <Walls w={w} d={d} h={h} color={isNew ? '#d6d3d1' : color} roof={p.kind === 'Admin' ? '#334155' : '#6b7280'} />
      {/* parapet */}
      <B p={[0, h, 0]} s={[w + 0.4, 0.5, d + 0.4]} c={p.kind === 'Admin' ? '#1e3a5f' : '#57534e'} />
      {/* entrance canopy */}
      <B p={[0, h * 0.35, d / 2 + 1.1]} s={[Math.min(5, w * 0.45), 0.3, 2.2]} c="#15803d" />
      <B p={[0, 0, d / 2 + 0.05]} s={[2, 2.6, 0.15]} c="#1e293b" />
      {p.kind === 'Admin' &&
        [-1.5, -0.5, 0.5, 1.5].map((k) => <Cyl key={k} p={[k * (w / 4.2), 0, d / 2 + 1.6]} r={0.35} h={h * 0.8} c="#f8fafc" seg={8} />)}
      {h >= 8 && <B p={[w / 4, h + 0.5, -d / 5]} s={[2.4, 2, 2.4]} c="#94a3b8" />}
      {isNew && (
        <group position={[w / 2 + 2, 0, -d / 2]}>
          <B p={[0, 0, 0]} s={[0.8, h + 9, 0.8]} c="#facc15" />
          <B p={[-4, h + 9, 0]} s={[12, 0.6, 0.6]} c="#facc15" />
          <B p={[-9, h + 6, 0]} s={[0.1, 3, 0.1]} c="#334155" />
        </group>
      )}
    </group>
  );
}

import React, { useEffect, useState } from 'react';
import { useGame } from './game/store';
import Scene from './game/Scene';
import Hud from './components/Hud';
import BottomNav from './components/BottomNav';
import PlaceCard from './components/PlaceCard';
import PlacesPanel from './components/PlacesPanel';
import HustlePanel from './components/HustlePanel';
import MePanel from './components/MePanel';
import CamControls from './components/CamControls';

function Toast() {
  const toast = useGame((s) => s.toast);
  const [shown, setShown] = useState<typeof toast>(null);
  useEffect(() => {
    if (!toast) return;
    setShown(toast);
    const t = setTimeout(() => setShown(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  if (!shown) return null;
  const tone = shown.kind === 'bad' ? 'bg-rose-600' : shown.kind === 'good' ? 'bg-emerald-600' : 'bg-slate-900';
  return (
    <div className="absolute top-[132px] inset-x-0 z-50 flex justify-center pointer-events-none px-6">
      <div key={shown.id} className={`${tone} text-white px-4 py-2 rounded-full shadow-2xl text-xs font-black text-center anim-pop max-w-full`}>
        {shown.text}
      </div>
    </div>
  );
}

function Hint() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 6500);
    return () => clearTimeout(t);
  }, []);
  const tab = useGame((s) => s.tab);
  const selected = useGame((s) => s.selected);
  if (!show || tab !== 'map' || selected) return null;
  return (
    <div className="absolute bottom-[78px] inset-x-0 z-20 flex justify-center pointer-events-none px-4 mb-[env(safe-area-inset-bottom)]">
      <div className="px-4 py-2 rounded-full bg-slate-900/80 backdrop-blur text-white text-[11px] font-bold text-center anim-fade">
        👆 Drag to move · 🤏 Pinch to zoom · ✌️ Twist to rotate · Tap a pin
      </div>
    </div>
  );
}

export default function App() {
  const tab = useGame((s) => s.tab);

  // the campus clock: every 4 seconds = 5 in-game minutes
  useEffect(() => {
    const id = setInterval(() => useGame.getState().tick(), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-sky-200 select-none">
      <div className="absolute inset-0">
        <Scene />
      </div>
      <Hud />
      <CamControls />
      <Toast />
      <Hint />
      {tab === 'map' && <PlaceCard />}
      {tab === 'places' && <PlacesPanel />}
      {tab === 'hustle' && <HustlePanel />}
      {tab === 'me' && <MePanel />}
      <BottomNav />
    </div>
  );
}

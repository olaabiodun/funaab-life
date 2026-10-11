'use client';

import React, { useState, useRef, useEffect } from 'react';

// --- DATA: ALL FUNAAB PLACES FROM REAL GOOGLE MAPS ---
export interface CampusPlace {
  id: string;
  name: string;
  shortName: string;
  category: 'Academics' | 'Admin' | 'Hostels' | 'Food & Chill' | 'Sports' | 'Transport';
  emoji: string;
  // Normalized 3D map coordinates in pixels
  x: number;
  y: number;
  color: string;
  description: string;
  studentGist: string;
  activities: { label: string; cost?: number; reward?: number; energyDelta: number }[];
}

export const FUNAAB_CAMPUS_PLACES: CampusPlace[] = [
  // 1. GATE & TRANSIT
  {
    id: 'main_gate',
    name: 'FUNAAB Main Ceremonial Gate',
    shortName: 'Main Gate',
    category: 'Transport',
    emoji: '🏛️',
    x: 350,
    y: 1750,
    color: 'from-amber-600 to-emerald-700',
    description: 'The iconic triumphal entrance archway on Alabata Road with security post and taxi parks.',
    studentGist: '"Hold your exact ₦150 change before entering white shuttle bus!"',
    activities: [
      { label: 'Board White Shuttle Bus', cost: 150, energyDelta: -5 },
      { label: 'Hustle as Bus Conductor', reward: 1200, energyDelta: -25 },
    ],
  },
  {
    id: 'camp_junction',
    name: 'Camp Junction & Student Market',
    shortName: 'Camp Junction',
    category: 'Transport',
    emoji: '🏡',
    x: 220,
    y: 850,
    color: 'from-orange-600 to-red-700',
    description: 'Off-campus student town where red cabs load, with ATM galleries and provision shops.',
    studentGist: '"Traffic at Camp roundabout during 5:00 PM rush hour is legendary."',
    activities: [
      { label: 'Buy Provisions & Indomie', cost: 800, energyDelta: 10 },
      { label: 'Withdraw Cash at POS Stand', reward: 3000, energyDelta: -10 },
    ],
  },

  // 2. CENTRAL ADMINISTRATION
  {
    id: 'senate_building',
    name: 'Mahmood Yakubu Senate Building',
    shortName: 'Senate Tower',
    category: 'Admin',
    emoji: '🏢',
    x: 820,
    y: 1300,
    color: 'from-slate-700 to-slate-900',
    description: 'The multi-storey glass-and-marble administrative headquarters of the Vice-Chancellor.',
    studentGist: '"Where matriculation photos happen and final clearance is signed."',
    activities: [
      { label: 'Process Academic Transcript', cost: 500, energyDelta: -20 },
      { label: 'Matriculation Photo Shoot', cost: 300, energyDelta: -10 },
    ],
  },
  {
    id: 'ceremonial_building',
    name: 'Ceremonial Building & Great Hall',
    shortName: 'Ceremonial Bldg',
    category: 'Admin',
    emoji: '🏛️',
    x: 1050,
    y: 1400,
    color: 'from-indigo-700 to-purple-900',
    description: 'Massive multi-thousand seat auditorium for convocation, SUG congress, and matriculation.',
    studentGist: '"Air-conditioned convocation arena, but stifling during crowded SUG debates."',
    activities: [
      { label: 'Attend Faculty Orientation', energyDelta: -15 },
      { label: 'Crash Graduation Reception', cost: 200, energyDelta: 20 },
    ],
  },

  // 3. CORE LECTURE COMPLEXES & COLLEGES
  {
    id: 'jao_theatres',
    name: 'JAO 1, 2 & 3 Lecture Theatres',
    shortName: 'JAO Theatres',
    category: 'Academics',
    emoji: '🏫',
    x: 1100,
    y: 1050,
    color: 'from-blue-600 to-cyan-800',
    description: 'The heartbeat of general undergraduate lectures (GNS, CHM, PHY, BIO courses).',
    studentGist: '"If you do not reach JAO by 7:30 AM, prepare to receive lecture through the window!"',
    activities: [
      { label: 'Fight for Front Row Seat (2hr GNS)', energyDelta: -30 },
      { label: 'Sign Class Attendance Sheet', energyDelta: -10 },
    ],
  },
  {
    id: 'ict_compcentre',
    name: 'ICT Resource Centre & CBT Hall',
    shortName: 'ICT Compcentre',
    category: 'Academics',
    emoji: '🖥️',
    x: 950,
    y: 950,
    color: 'from-cyan-600 to-blue-900',
    description: 'Central computer centre for CBT e-exams, portal registrations, and IT certifications.',
    studentGist: '"The dreaded exam hall where 100 questions in 30 minutes decide your GPA."',
    activities: [
      { label: 'Submit Course Registration', energyDelta: -15 },
      { label: 'Hustle: Fix Laptop Software Glitches', reward: 2200, energyDelta: -20 },
    ],
  },
  {
    id: 'coleng',
    name: 'College of Engineering (COLENG)',
    shortName: 'COLENG',
    category: 'Academics',
    emoji: '⚙️',
    x: 900,
    y: 650,
    color: 'from-amber-700 to-orange-950',
    description: 'Mechanical, Mechatronics, Civil, Electrical, and Agric Engineering workshops.',
    studentGist: '"Students always carrying drawing boards, T-squares, and laboratory coats."',
    activities: [
      { label: 'CAD Engineering Workshop', energyDelta: -25 },
      { label: 'Repair Tractor Alternator', reward: 1800, energyDelta: -20 },
    ],
  },
  {
    id: 'colamrud',
    name: 'COLAMRUD (Agric Management & Extension)',
    shortName: 'COLAMRUD',
    category: 'Academics',
    emoji: '📊',
    x: 1350,
    y: 850,
    color: 'from-teal-700 to-emerald-950',
    description: 'Agric economics, rural sociology, and agricultural administration faculties.',
    studentGist: '"Photocopy headquarters. The busiest spiral binding machines on campus."',
    activities: [
      { label: 'Print GNS 101 Past Questions', cost: 250, energyDelta: -10 },
      { label: 'Submit Farm Budget Assignment', energyDelta: -15 },
    ],
  },
  {
    id: 'colplant_colvet',
    name: 'COLPLANT & Veterinary Medicine Hospital',
    shortName: 'COLPLANT/COLVET',
    category: 'Academics',
    emoji: '🌿',
    x: 1550,
    y: 600,
    color: 'from-green-700 to-emerald-950',
    description: 'Plant science labs, crop production fields, and teaching veterinary medical clinic.',
    studentGist: '"Smells like eucalyptus and fresh topsoil. Vet students are always examining animals."',
    activities: [
      { label: 'Practical Farm Weeding (Farm Year)', energyDelta: -35 },
      { label: 'Assist Vet Doctor with Pet Injection', reward: 1500, energyDelta: -15 },
    ],
  },
  {
    id: 'colfhec_colanim',
    name: 'COLANIM (Animal Science) & COLFHEC',
    shortName: 'COLANIM & COLFHEC',
    category: 'Academics',
    emoji: '🥩',
    x: 1650,
    y: 800,
    color: 'from-rose-800 to-stone-900',
    description: 'Livestock research farms, poultry pens, food technology, and hospitality labs.',
    studentGist: '"Where the famous fresh FUNAAB Bread and chilled FUNAAB Yoghurt are made!"',
    activities: [
      { label: 'Buy Fresh Warm FUNAAB Bread', cost: 450, energyDelta: 20 },
      { label: 'Buy Chilled FUNAAB Yoghurt', cost: 350, energyDelta: 15 },
    ],
  },

  // 4. FOOD, FAITH & STUDENT COMMERCE
  {
    id: 'sub_food_complex',
    name: 'Student Union Building (SUB) & Bukas',
    shortName: 'SUB & Bukas',
    category: 'Food & Chill',
    emoji: '🍲',
    x: 1150,
    y: 1500,
    color: 'from-red-600 to-amber-800',
    description: 'The gastronomic hub: Iya Basira Amala, Iya Oyo, mama put, POS kiosks, and SUG secretariats.',
    studentGist: '"Hot Amala with Ewedu and peppered goat meat cures all carryover depression."',
    activities: [
      { label: 'Eat Hot Amala + Goat Meat (Iya Basira)', cost: 1100, energyDelta: 50 },
      { label: 'Smoky Buka Jollof & Fried Plantain', cost: 850, energyDelta: 40 },
    ],
  },
  {
    id: 'chapel_mosque',
    name: 'Chapel of Transfiguration & Central Mosque',
    shortName: 'Chapel & Mosque',
    category: 'Food & Chill',
    emoji: '⛪',
    x: 650,
    y: 1500,
    color: 'from-blue-700 to-teal-800',
    description: 'Peaceful spiritual sanctuaries and lush reflection lawns on the main boulevard.',
    studentGist: '"Quiet sanctuary when exam timetable comes out and heart rate spikes."',
    activities: [
      { label: 'Attend Mid-Week Fellowship Service', energyDelta: 30 },
      { label: 'Quiet Prayer for High GPA', energyDelta: 20 },
    ],
  },

  // 5. SPORTS, TOURISM & EMERGENCY
  {
    id: 'motion_ground',
    name: 'Motion Ground Sports Complex',
    shortName: 'Motion Ground',
    category: 'Sports',
    emoji: '🏟️',
    x: 1350,
    y: 1650,
    color: 'from-emerald-600 to-green-900',
    description: 'FIFA regulation grass football pitch, spectator stands, running track, and SUG mega-rallies.',
    studentGist: '"Dean Cup finals here draw more crowd than a Champions League match."',
    activities: [
      { label: 'Play 90-min Inter-Faculty Match', energyDelta: -35 },
      { label: 'Evening Jogging on the Track', energyDelta: 15 },
    ],
  },
  {
    id: 'zoo_park',
    name: 'FUNAAB Zoo & Ecological Park',
    shortName: 'Zoo Park',
    category: 'Sports',
    emoji: '🦁',
    x: 1900,
    y: 1550,
    color: 'from-emerald-700 to-teal-950',
    description: 'Sprawling natural wildlife reserve with lions, hyenas, peacocks, primates, and picnic woods.',
    studentGist: '"The lion will roar once in a while during afternoon silence. Super peaceful tour."',
    activities: [
      { label: 'Tour Wildlife Reserve', cost: 500, energyDelta: 25 },
      { label: 'Picnic Under Tall Pine Trees', cost: 300, energyDelta: 35 },
    ],
  },
  {
    id: 'health_centre',
    name: 'University Health Centre',
    shortName: 'Health Centre',
    category: 'Admin',
    emoji: '🏥',
    x: 1650,
    y: 1250,
    color: 'from-rose-600 to-red-900',
    description: 'Full-time campus health centre, pharmacy, lab test unit, and student emergency ward.',
    studentGist: '"The cure for every sickness here is: 2 tablets of Paracetamol and drink plenty of water."',
    activities: [
      { label: 'Medical Checkup & Bed Rest', cost: 400, energyDelta: 45 },
      { label: 'Collect Paracetamol & Multivitamins', cost: 200, energyDelta: 20 },
    ],
  },

  // 6. RESIDENTIAL HOSTELS
  {
    id: 'isolu_hostels',
    name: 'Isolu Student Hostels & Residential Lodges',
    shortName: 'Isolu Hostels',
    category: 'Hostels',
    emoji: '🛏️',
    x: 2100,
    y: 950,
    color: 'from-purple-700 to-indigo-950',
    description: 'Vast cluster of student lodges, hostels, generator hubs, and late-night noodle stands.',
    studentGist: '"Loud "I better pass my neighbor" generators buzzing till 11:00 PM. Peak student banter."',
    activities: [
      { label: 'Power Nap Under Ceiling Fan', energyDelta: 40 },
      { label: 'Cook Late Night Pepper Indomie', cost: 350, energyDelta: 25 },
    ],
  },
];

// --- 3D BILLBOARD DATA ---
const WORLD_BILLBOARDS = [
  { x: 500, y: 1580, title: 'YOUR AD HERE', sub: 'campuslife.app/ads', tag: '₦25k / 7 DAYS', scheme: 'cyan' },
  { x: 920, y: 1180, title: 'MEGA SCREEN: SUG ELECTIONS', sub: 'VOTE COMRADE TUNDE', tag: 'INTEGRITY 2026', scheme: 'pink' },
  { x: 1250, y: 1350, title: 'IYA BASIRA BUKA', sub: 'HOT AMALA & GOAT MEAT', tag: 'SUB FOOD COMPLEX', scheme: 'pink' },
  { x: 1450, y: 1800, title: 'DEAN CUP TOURNAMENT', sub: 'COLENG VS COLAMRUD', tag: 'LIVE AT MOTION GROUND', scheme: 'emerald' },
  { x: 1800, y: 1100, title: 'FRESH FUNAAB BREAD', sub: 'BAKED FRESH DAILY', tag: 'BUY AT COLANIM STALL', scheme: 'cyan' },
];

export default function Funaab3DWorld() {
  // Navigation & Viewport State
  const [pan, setPan] = useState({ x: -450, y: -450 });
  const [zoom, setZoom] = useState(0.85);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Active Bottom Navigation Tab (4 Nav Tabs)
  const [activeBottomNav, setActiveBottomNav] = useState<'world' | 'places' | 'hustle' | 'student'>('world');

  // Selected Place Modal
  const [selectedPlace, setSelectedPlace] = useState<CampusPlace | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  // Player Stats
  const [wallet, setWallet] = useState(4850);
  const [energy, setEnergy] = useState(85);
  const [hunger, setHunger] = useState(70);
  const [sanity, setSanity] = useState(90);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // 4-WAY NAVIGATION SCROLL HANDLERS (D-PAD BUTTONS)
  const panBy = (dx: number, dy: number) => {
    setPan((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));
  };

  // ZOOM CONTROLS
  const zoomIn = () => setZoom((z) => Math.min(1.4, z + 0.15));
  const zoomOut = () => setZoom((z) => Math.max(0.5, z - 0.15));
  const resetView = () => {
    setPan({ x: -450, y: -450 });
    setZoom(0.85);
  };

  // FLY TO PLACE
  const flyToPlace = (place: CampusPlace) => {
    setSelectedPlace(place);
    setActiveBottomNav('world');
    // Center the landmark in the 3D viewport
    setPan({
      x: -place.x * 0.7 + 300,
      y: -place.y * 0.7 + 350,
    });
    showToast(`📍 Traveling to ${place.name}...`);
  };

  // Execute activity
  const doActivity = (act: { label: string; cost?: number; reward?: number; energyDelta: number }) => {
    if (act.cost && wallet < act.cost) {
      showToast('❌ Not enough Naira! Sapa is active.');
      return;
    }
    if (act.energyDelta < 0 && energy < Math.abs(act.energyDelta)) {
      showToast('⚠️ Too exhausted! Rest or eat first.');
      return;
    }

    setWallet((w) => Math.max(0, w - (act.cost || 0) + (act.reward || 0)));
    setEnergy((e) => Math.min(100, Math.max(0, e + act.energyDelta)));
    if (act.cost && act.cost > 400) {
      setHunger((h) => Math.min(100, h + 30));
    }
    showToast(`✅ Done: ${act.label}`);
  };

  // Mouse & Touch Drag Handlers
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const onMouseUp = () => setIsDragging(false);

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
  };
  const onTouchEnd = () => setIsDragging(false);

  const filteredPlaces =
    selectedFilter === 'All'
      ? FUNAAB_CAMPUS_PLACES
      : FUNAAB_CAMPUS_PLACES.filter((p) => p.category === selectedFilter);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#77b76d] font-sans select-none touch-none">
      {/* ========================================================= */}
      {/* 1. TOP STATUS BAR (LAGOS LIFE AESTHETIC)                   */}
      {/* ========================================================= */}
      <header className="absolute top-2.5 inset-x-2.5 z-40 pointer-events-none flex items-center justify-between gap-2">
        {/* Left: Brand Badge */}
        <div className="pointer-events-auto flex items-center gap-1.5 md:gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-slate-200">
          <div className="flex items-center gap-1 font-black text-slate-900 text-xs md:text-sm">
            <span className="text-amber-500 text-base">👑</span>
            <span>Campus Life</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 text-[10px] md:text-xs font-extrabold text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>FUNAAB 3D</span>
          </div>
        </div>

        {/* Center: Live Ticker Banner (Desktop) */}
        <div className="pointer-events-auto hidden md:flex items-center gap-2">
          <div className="bg-emerald-700 text-white px-3.5 py-1 rounded-full shadow-md text-xs font-bold flex items-center gap-1.5 animate-pulse">
            <span>📢</span>
            <span>SUG Sports Week: Motion Ground Dean Cup Kickoff Today!</span>
          </div>
        </div>

        {/* Right: Wallet & Stats Badges */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md border border-slate-200 flex items-center gap-1">
            <span className="text-sm">💰</span>
            <span className="text-xs md:text-sm font-black text-emerald-600">₦{wallet.toLocaleString()}</span>
          </div>
          <div className="hidden sm:flex bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md border border-slate-200 items-center gap-1 text-xs font-black text-amber-600">
            <span>⚡</span>
            <span>{energy}%</span>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
          <div className="bg-slate-900/95 text-white px-4 py-2 rounded-full shadow-2xl border border-emerald-500/50 text-xs md:text-sm font-black whitespace-nowrap">
            {toastMsg}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ON-SCREEN 4-WAY NAVIGATION SCROLL & ZOOM CONTROLS      */}
      {/* ========================================================= */}
      <div className="absolute top-14 right-3 z-30 pointer-events-auto flex flex-col items-center gap-2">
        {/* Easy Zoom In / Out / Reset */}
        <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-slate-200 flex flex-col gap-1.5">
          <button
            onClick={zoomIn}
            title="Zoom In"
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-black text-base flex items-center justify-center transition-all shadow-sm"
          >
            +
          </button>
          <button
            onClick={zoomOut}
            title="Zoom Out"
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-black text-base flex items-center justify-center transition-all shadow-sm"
          >
            -
          </button>
          <button
            onClick={resetView}
            title="Reset Campus View"
            className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs flex items-center justify-center transition-all shadow-md"
          >
            🎯
          </button>
        </div>

        {/* 4-Way Scroll D-Pad Controls */}
        <div className="bg-white/95 backdrop-blur-md p-2 rounded-3xl shadow-xl border border-slate-200 flex flex-col items-center gap-1">
          {/* UP Button */}
          <button
            onClick={() => panBy(0, 180)}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-emerald-100 active:scale-90 text-slate-800 hover:text-emerald-700 font-black text-xs flex items-center justify-center transition-all shadow-sm"
          >
            ▲
          </button>
          {/* LEFT & RIGHT Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => panBy(180, 0)}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-emerald-100 active:scale-90 text-slate-800 hover:text-emerald-700 font-black text-xs flex items-center justify-center transition-all shadow-sm"
            >
              ◀
            </button>
            <div className="w-4 h-4 rounded-full bg-slate-300"></div>
            <button
              onClick={() => panBy(-180, 0)}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-emerald-100 active:scale-90 text-slate-800 hover:text-emerald-700 font-black text-xs flex items-center justify-center transition-all shadow-sm"
            >
              ▶
            </button>
          </div>
          {/* DOWN Button */}
          <button
            onClick={() => panBy(0, -180)}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-emerald-100 active:scale-90 text-slate-800 hover:text-emerald-700 font-black text-xs flex items-center justify-center transition-all shadow-sm"
          >
            ▼
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. THE 3D MODEL WORLD CANVAS (BASED ON REAL FUNAAB MAP)   */}
      {/* ========================================================= */}
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`w-full h-full cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
        style={{ perspective: '1200px' }}
      >
        <div
          className="relative w-[3000px] h-[2400px] transition-transform duration-100 ease-out"
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom}) rotateX(54deg) rotateZ(-26deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* 🌿 LUSH BASE TERRAIN (FUNAAB AGRICULTURAL GROUNDS) */}
          <div className="absolute inset-0 bg-[#8bc67a] shadow-inner">
            {/* Lawn Grid Pattern */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #6ea65f 2px, transparent 2px), linear-gradient(to bottom, #6ea65f 2px, transparent 2px)',
                backgroundSize: '100px 100px',
              }}
            />

            {/* 🌊 CAMPUS WATER RESERVOIR & ALABATA DAM (Across the North) */}
            <div
              className="absolute left-0 right-0 top-[40%] h-[260px] bg-[#53b8dc] border-y-8 border-[#3da2c6] flex items-center justify-around shadow-inner"
              style={{ transform: 'translateZ(2px)' }}
            >
              <span className="text-white/40 font-black text-6xl tracking-[0.3em] uppercase pointer-events-none">
                FUNAAB WATER RESERVOIR
              </span>
              <span className="text-white/40 font-black text-6xl tracking-[0.3em] uppercase pointer-events-none">
                ALABATA DAM & FISHERIES
              </span>
            </div>

            {/* 🛣️ MAIN ASPHALT CAMPUS ROAD NETWORK */}
            {/* Ceremonial Boulevard from Gate to Senate */}
            <div
              className="absolute top-[55%] left-[10%] w-[38%] h-[65px] bg-[#758490] border-y-4 border-[#61707c] rotate-[-12deg]"
              style={{ transform: 'translateZ(4px)' }}
            >
              <div className="w-full h-full flex items-center border-t border-b border-white/20">
                <div className="w-full h-[3px] border-b-2 border-dashed border-white/70"></div>
              </div>
            </div>

            {/* East-West Highway */}
            <div
              className="absolute left-0 right-0 top-[28%] h-[60px] bg-[#758490] border-y-4 border-[#61707c]"
              style={{ transform: 'translateZ(4px)' }}
            >
              <div className="w-full h-full flex items-center">
                <div className="w-full h-[3px] border-b-2 border-dashed border-white/60"></div>
              </div>
            </div>

            {/* South Loop by Motion Ground & SUB */}
            <div
              className="absolute left-[30%] right-[10%] top-[70%] h-[65px] bg-[#758490] border-y-4 border-[#61707c]"
              style={{ transform: 'translateZ(4px)' }}
            >
              <div className="w-full h-full flex items-center">
                <div className="w-full h-[3px] border-b-2 border-dashed border-amber-300/70"></div>
              </div>
            </div>

            {/* Cross Bridge over Reservoir */}
            <div
              className="absolute top-[40%] left-[45%] w-[80px] h-[260px] bg-[#8997a3] border-x-4 border-amber-400 shadow-2xl"
              style={{ transform: 'translateZ(12px)' }}
            >
              <div className="w-full h-full flex flex-col justify-around items-center">
                <span className="text-[10px] font-black text-amber-300 rotate-90">DAM BRIDGE</span>
                <span className="text-[10px] font-black text-amber-300 rotate-90">DAM BRIDGE</span>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 3D BUILDING BLOCKS & ARCHITECTURAL LANDMARKS              */}
            {/* ========================================================= */}

            {/* 1. SENATE ADMINISTRATIVE TOWER (Tall Glass & Slate 3D Block) */}
            <div
              className="absolute top-[52%] left-[26%] w-[150px] h-[130px] bg-slate-900 rounded-lg shadow-2xl border-4 border-slate-600 flex flex-col items-center justify-center text-white"
              style={{ transform: 'translateZ(55px)' }}
            >
              <div className="text-[11px] font-black text-emerald-400">SENATE TOWER</div>
              <div className="text-[8px] text-slate-400">VC OFFICE & REGISTRY</div>
              <div className="grid grid-cols-5 gap-1 mt-2">
                {[...Array(15)].map((_, i) => (
                  <div key={i} className="w-3 h-2 bg-cyan-400/80 rounded-sm"></div>
                ))}
              </div>
            </div>

            {/* 2. CEREMONIAL BUILDING & AUDITORIUM */}
            <div
              className="absolute top-[56%] left-[34%] w-[180px] h-[120px] bg-indigo-950 rounded-xl shadow-2xl border-4 border-indigo-700 flex flex-col items-center justify-center text-white"
              style={{ transform: 'translateZ(35px)' }}
            >
              <div className="text-[11px] font-black text-amber-300">CEREMONIAL HALL</div>
              <div className="text-[8px] text-slate-300">CONVOCATION AUDITORIUM</div>
              <div className="w-24 h-4 bg-indigo-800 rounded mt-1"></div>
            </div>

            {/* 3. JAO LECTURE COMPLEX 1-3 */}
            <div
              className="absolute top-[42%] left-[35%] w-[200px] h-[130px] bg-blue-950 rounded-xl shadow-2xl border-4 border-blue-700 flex flex-col items-center justify-center text-white"
              style={{ transform: 'translateZ(30px)' }}
            >
              <div className="text-xs font-black text-cyan-300">JAO 1-3 THEATRES</div>
              <div className="text-[8px] text-slate-300">GNS & GENERAL LECTURE HALLS</div>
              <div className="flex gap-2 mt-2">
                <span className="px-1.5 py-0.5 rounded bg-blue-800 text-[8px] font-bold">HALL 1</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-800 text-[8px] font-bold">HALL 2</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-800 text-[8px] font-bold">HALL 3</span>
              </div>
            </div>

            {/* 4. MOTION GROUND STADIUM */}
            <div
              className="absolute top-[66%] left-[43%] w-[360px] h-[240px] bg-[#d97706] rounded-3xl p-3 shadow-2xl border-4 border-amber-800"
              style={{ transform: 'translateZ(8px)' }}
            >
              <div className="w-full h-full bg-[#3fa844] rounded-2xl border-4 border-white/90 p-2 relative flex items-center justify-center shadow-inner">
                <div className="w-20 h-20 rounded-full border-2 border-white/90 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
                <div className="absolute inset-x-0 h-0.5 bg-white/90 top-1/2"></div>
                <div className="absolute left-1 inset-y-8 w-5 border-2 border-white/90"></div>
                <div className="absolute right-1 inset-y-8 w-5 border-2 border-white/90"></div>
              </div>
            </div>

            {/* 5. SUB BUKA FOOD COMPLEX (Colorful Lagos Life Stalls) */}
            <div
              className="absolute top-[60%] left-[37%] w-[220px] h-[160px] bg-[#6ca55c] p-2.5 rounded-xl border-4 border-[#5b8f4c] shadow-xl grid grid-cols-4 grid-rows-3 gap-1.5"
              style={{ transform: 'translateZ(10px)' }}
            >
              {['#e11d48', '#0284c7', '#16a34a', '#eab308', '#9333ea', '#ea580c', '#06b6d4', '#e11d48', '#16a34a', '#eab308', '#0284c7', '#9333ea'].map(
                (color, i) => (
                  <div
                    key={i}
                    style={{ backgroundColor: color }}
                    className="rounded shadow flex items-center justify-center text-[10px] text-white font-black"
                  >
                    🍲
                  </div>
                )
              )}
            </div>

            {/* 6. ZOO PARK & NATURE RESERVE (Dense Trees + Pond) */}
            <div
              className="absolute top-[62%] left-[61%] w-[280px] h-[220px] bg-[#539745] rounded-3xl p-3 border-4 border-[#3e7533] shadow-xl relative"
              style={{ transform: 'translateZ(10px)' }}
            >
              <div className="absolute bottom-4 left-5 w-24 h-16 rounded-full bg-[#4bb1d6] border-2 border-[#3794b6]"></div>
              <div className="absolute top-2 left-4 text-3xl">🌲</div>
              <div className="absolute top-2 right-6 text-3xl">🌴</div>
              <div className="absolute bottom-8 right-8 text-3xl">🌳</div>
              <div className="absolute top-12 left-20 text-3xl">🌲</div>
              <div className="absolute top-16 right-20 text-3xl">🌴</div>
            </div>

            {/* 7. ISOLU RESIDENTIAL HOSTEL BLOCKS */}
            <div
              className="absolute top-[38%] left-[68%] w-[260px] h-[180px] grid grid-cols-3 gap-2.5 p-2 bg-[#69a15a] rounded-2xl border-4 border-emerald-800"
              style={{ transform: 'translateZ(15px)' }}
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-[#b3855a] rounded-lg border-2 border-[#875d38] p-1.5 shadow-md">
                  <div className="h-3 bg-[#944738] rounded-t"></div>
                  <div className="text-[8px] text-center font-bold text-white mt-1">HOSTEL {i + 1}</div>
                </div>
              ))}
            </div>

            {/* 8. HEALTH CENTRE CLINIC (White Cubic Clinic with Red Cross) */}
            <div
              className="absolute top-[50%] left-[53%] w-[130px] h-[100px] bg-slate-100 rounded-xl shadow-2xl border-4 border-slate-300 flex flex-col items-center justify-center"
              style={{ transform: 'translateZ(28px)' }}
            >
              <span className="text-2xl font-black text-rose-600">➕</span>
              <span className="text-[10px] font-black text-slate-800">HEALTH CLINIC</span>
            </div>

            {/* ========================================================= */}
            {/* 3D DIGITAL BILLBOARDS                                     */}
            {/* ========================================================= */}
            {WORLD_BILLBOARDS.map((bb, idx) => (
              <div
                key={idx}
                style={{
                  left: `${bb.x}px`,
                  top: `${bb.y}px`,
                  transform: 'translateZ(22px)',
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform duration-200 hover:scale-110"
                onClick={() => showToast(`📢 ${bb.title}: ${bb.sub}`)}
              >
                <div className="relative flex flex-col items-center">
                  <div className="w-[180px] h-[85px] bg-slate-950 p-1.5 rounded-lg border-2 border-slate-800 shadow-2xl shadow-black/80 flex flex-col justify-between">
                    <div
                      className={`w-full h-full rounded p-1.5 flex flex-col justify-between text-center ${
                        bb.scheme === 'pink'
                          ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600'
                          : bb.scheme === 'emerald'
                          ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700'
                          : 'bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500'
                      }`}
                    >
                      <span className="text-[8px] font-black uppercase text-amber-300 tracking-wider">
                        ★ {bb.title} ★
                      </span>
                      <p className="text-[10px] font-black text-white leading-tight">{bb.sub}</p>
                      <div className="bg-black/60 rounded px-1 py-0.5">
                        <span className="text-[9px] font-extrabold text-white">{bb.tag}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between w-28 h-6 px-4">
                    <div className="w-1.5 h-full bg-slate-700 shadow"></div>
                    <div className="w-1.5 h-full bg-slate-700 shadow"></div>
                  </div>
                  <div className="w-32 h-1.5 bg-slate-800 rounded-full shadow"></div>
                </div>
              </div>
            ))}

            {/* ========================================================= */}
            {/* FLOATING WHITE CIRCULAR PIN BADGES FOR EVERY CAMPUS PLACE */}
            {/* ========================================================= */}
            {FUNAAB_CAMPUS_PLACES.map((place) => {
              const isSelected = selectedPlace?.id === place.id;
              return (
                <div
                  key={place.id}
                  style={{
                    left: `${place.x}px`,
                    top: `${place.y}px`,
                    transform: 'translateZ(65px)',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlace(place);
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-30 transition-transform duration-200 hover:scale-125"
                >
                  <div className="relative flex flex-col items-center">
                    {/* The Pure White Round Disc Button (Lagos Life) */}
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border-2 flex items-center justify-center text-xl md:text-2xl shadow-xl transition-all ${
                        isSelected
                          ? 'border-emerald-500 ring-4 ring-emerald-400 scale-110 shadow-emerald-500/50'
                          : 'border-slate-300 shadow-black/25 group-hover:border-emerald-400 group-hover:shadow-2xl'
                      }`}
                    >
                      <span>{place.emoji}</span>
                    </div>

                    {/* Ground Anchor Pin Stem */}
                    <div className="w-0.5 h-3 bg-white/80 shadow-md"></div>
                    <div className="w-2.5 h-1 bg-black/30 rounded-full blur-[1px]"></div>

                    {/* Name Pill Badge */}
                    <div className="mt-1 bg-slate-900/90 text-white text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap shadow-lg border border-slate-700">
                      {place.shortName}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. MODAL: SELECTED PLACE INSPECTOR & ACTION DRAWER        */}
      {/* ========================================================= */}
      {selectedPlace && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-4 animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-3xl p-4 shadow-2xl flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl shadow-sm border border-emerald-300">
                  {selectedPlace.emoji}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    {selectedPlace.name}
                  </h3>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                    {selectedPlace.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlace(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Description & Student Gist */}
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {selectedPlace.description}
            </p>
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 text-xs text-amber-900 italic font-semibold">
              {selectedPlace.studentGist}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                Available Actions:
              </span>
              {selectedPlace.activities.map((act, i) => (
                <button
                  key={i}
                  onClick={() => doActivity(act)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs md:text-sm py-2.5 px-3.5 rounded-xl shadow-md transition-all flex items-center justify-between"
                >
                  <span>⚡ {act.label}</span>
                  <span className="bg-emerald-800/80 px-2 py-0.5 rounded text-[11px]">
                    {act.cost ? `-₦${act.cost}` : act.reward ? `+₦${act.reward}` : 'Free'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. OVERLAYS FOR THE 4 BOTTOM NAV TABS                      */}
      {/* ========================================================= */}

      {/* TAB 2: PLACES & FACULTIES DIRECTORY MODAL */}
      {activeBottomNav === 'places' && (
        <div className="absolute inset-x-3 top-16 bottom-20 z-40 max-w-xl mx-auto bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏫</span>
              <div>
                <h3 className="text-sm md:text-base font-black text-slate-900">Campus Places Directory</h3>
                <p className="text-xs text-slate-500">Tap any place to fly directly to it on the 3D map</p>
              </div>
            </div>
            <button
              onClick={() => setActiveBottomNav('world')}
              className="text-xs font-bold bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg"
            >
              Close
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="p-2.5 border-b border-slate-100 flex gap-1.5 overflow-x-auto">
            {['All', 'Academics', 'Admin', 'Food & Chill', 'Sports', 'Hostels', 'Transport'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedFilter === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* List of Places */}
          <div className="p-3 overflow-y-auto space-y-2 flex-1 scrollbar-thin">
            {filteredPlaces.map((place) => (
              <div
                key={place.id}
                onClick={() => flyToPlace(place)}
                className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/50 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{place.emoji}</span>
                  <div>
                    <h4 className="text-xs md:text-sm font-black text-slate-900">{place.name}</h4>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">
                      {place.category}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-lg">
                  Fly Here 🚀
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: THE HUSTLE & WORK TAB */}
      {activeBottomNav === 'hustle' && (
        <div className="absolute inset-x-3 top-16 bottom-20 z-40 max-w-xl mx-auto bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💼</span>
              <div>
                <h3 className="text-sm md:text-base font-black text-slate-900">Campus Hustle & Jobs</h3>
                <p className="text-xs text-slate-500">Work campus gigs to earn pocket Naira (₦)</p>
              </div>
            </div>
            <button
              onClick={() => setActiveBottomNav('world')}
              className="text-xs font-bold bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg"
            >
              Close
            </button>
          </div>

          <div className="p-3 overflow-y-auto space-y-2.5 flex-1">
            {[
              {
                title: 'Campus Shuttle Conductor',
                emoji: '🚐',
                desc: 'Call passengers at Gate: "Motion Ground 150 change enter!"',
                reward: 1500,
                energy: -25,
              },
              {
                title: 'Compcentre Course Registration Guide',
                emoji: '🖥️',
                desc: 'Help confused freshers select course units without errors.',
                reward: 2200,
                energy: -20,
              },
              {
                title: 'COLAMRUD Photocopy Machine Operator',
                emoji: '📄',
                desc: 'Print 150 volumes of GNS past questions before test week.',
                reward: 1800,
                energy: -15,
              },
              {
                title: 'Pure Water Hawker at Motion Ground',
                emoji: '💧',
                desc: 'Sell iced sachet water to thirsty football spectators.',
                reward: 1000,
                energy: -30,
              },
            ].map((job, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-slate-200 bg-white flex flex-col gap-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{job.emoji}</span>
                    <h4 className="text-xs md:text-sm font-black text-slate-900">{job.title}</h4>
                  </div>
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    +₦{job.reward}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{job.desc}</p>
                <button
                  onClick={() => doActivity({ label: job.title, reward: job.reward, energyDelta: job.energy })}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs py-2 rounded-xl transition-all shadow"
                >
                  ⚡ Work This Shift ({job.energy} Energy)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: STUDENT PROFILE & SURVIVAL STATS */}
      {activeBottomNav === 'student' && (
        <div className="absolute inset-x-3 top-16 bottom-20 z-40 max-w-xl mx-auto bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎒</span>
              <div>
                <h3 className="text-sm md:text-base font-black text-slate-900">Student Profile</h3>
                <p className="text-xs text-slate-500">Academic rank, health, and campus inventory</p>
              </div>
            </div>
            <button
              onClick={() => setActiveBottomNav('world')}
              className="text-xs font-bold bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg"
            >
              Close
            </button>
          </div>

          <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
            {/* Identity card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-3xl">
                🎓
              </div>
              <div>
                <h4 className="text-base font-black">Comrade Student</h4>
                <p className="text-xs text-emerald-100 font-semibold">Faculty of Engineering • 100L</p>
                <span className="inline-block mt-1 bg-white/30 text-white text-[10px] font-black px-2 py-0.5 rounded">
                  GPA: 4.35 / 5.00
                </span>
              </div>
            </div>

            {/* Vital Stats */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-600">💰 Pocket Naira</span>
                <span className="text-lg font-black text-emerald-600">₦{wallet.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-600">⚡ Energy Level</span>
                <span className="text-lg font-black text-amber-600">{energy}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-600">🍔 Satiety / Hunger</span>
                <span className="text-lg font-black text-rose-600">{hunger}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-600">🧠 Sanity (Exam Stress)</span>
                <span className="text-lg font-black text-purple-600">{sanity}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. BOTTOM 4-TAB NAVIGATION BAR (NATIVE MOBILE APP STYLE)   */}
      {/* ========================================================= */}
      <nav className="absolute bottom-2.5 inset-x-2.5 z-40 max-w-lg mx-auto pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-3xl p-1.5 shadow-2xl flex items-center justify-around">
          {/* TAB 1: 3D WORLD */}
          <button
            onClick={() => setActiveBottomNav('world')}
            className={`flex-1 py-2 px-1 rounded-2xl flex flex-col items-center gap-0.5 transition-all active:scale-95 ${
              activeBottomNav === 'world'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="text-lg md:text-xl">🗺️</span>
            <span className="text-[10px] md:text-xs font-black">3D World</span>
          </button>

          {/* TAB 2: PLACES */}
          <button
            onClick={() => setActiveBottomNav('places')}
            className={`flex-1 py-2 px-1 rounded-2xl flex flex-col items-center gap-0.5 transition-all active:scale-95 ${
              activeBottomNav === 'places'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="text-lg md:text-xl">🏫</span>
            <span className="text-[10px] md:text-xs font-black">Places</span>
          </button>

          {/* TAB 3: HUSTLE */}
          <button
            onClick={() => setActiveBottomNav('hustle')}
            className={`flex-1 py-2 px-1 rounded-2xl flex flex-col items-center gap-0.5 transition-all active:scale-95 ${
              activeBottomNav === 'hustle'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="text-lg md:text-xl">💼</span>
            <span className="text-[10px] md:text-xs font-black">Hustle</span>
          </button>

          {/* TAB 4: STUDENT */}
          <button
            onClick={() => setActiveBottomNav('student')}
            className={`flex-1 py-2 px-1 rounded-2xl flex flex-col items-center gap-0.5 transition-all active:scale-95 ${
              activeBottomNav === 'student'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="text-lg md:text-xl">🎒</span>
            <span className="text-[10px] md:text-xs font-black">Student</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

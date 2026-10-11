'use client';

import React, { useState, useRef } from 'react';

// --- TYPES ---
export interface BuildingPin {
  id: string;
  name: string;
  category: string;
  emoji: string;
  x: number; // percentage on map (0 - 100)
  y: number; // percentage on map (0 - 100)
  description: string;
  actionTitle: string;
  actionCost?: number;
  actionReward?: number;
  energyChange?: number;
  hungerChange?: number;
  sanityChange?: number;
  socialChange?: number;
}

export interface Billboard {
  id: string;
  x: number;
  y: number;
  title: string;
  sub: string;
  rate: string;
  colorScheme: 'pink' | 'cyan' | 'emerald';
}

// --- UNIVERSAL CAMPUS BILLBOARDS ---
const CAMPUS_BILLBOARDS: Billboard[] = [
  {
    id: 'bb-1',
    x: 18,
    y: 28,
    title: 'YOUR AD HERE',
    sub: 'campuslife.app/ads',
    rate: '₦25k / 7 days',
    colorScheme: 'cyan',
  },
  {
    id: 'bb-2',
    x: 34,
    y: 42,
    title: 'MEGA SCREEN: SUG ELECTIONS',
    sub: 'VOTE COMRADE TUNDE · SUG 2026',
    rate: 'TAP TO READ MANIFESTO',
    colorScheme: 'pink',
  },
  {
    id: 'bb-3',
    x: 48,
    y: 38,
    title: 'YOUR AD HERE',
    sub: 'campuslife.app/advertise',
    rate: '₦50k / 7 days',
    colorScheme: 'cyan',
  },
  {
    id: 'bb-4',
    x: 78,
    y: 40,
    title: 'MEGA SCREEN',
    sub: 'CAMPUS SHUTTLE APP',
    rate: '₦150 FLAT STUDENT FARE',
    colorScheme: 'pink',
  },
  {
    id: 'bb-5',
    x: 64,
    y: 68,
    title: 'IYA BASIRA BUKA',
    sub: 'HOT AMALA, JOLLOF & GOAT MEAT',
    rate: 'SUB FOOD COMPLEX · OPEN 24/7',
    colorScheme: 'pink',
  },
  {
    id: 'bb-6',
    x: 88,
    y: 78,
    title: 'YOUR AD HERE',
    sub: 'Promote Student Business',
    rate: '₦20k / 7 days',
    colorScheme: 'emerald',
  },
  {
    id: 'bb-7',
    x: 14,
    y: 72,
    title: 'ANNUAL TECH & CAREER SUMMIT',
    sub: 'AI, Engineering & Future Jobs',
    rate: 'GREAT HALL AUDITORIUM',
    colorScheme: 'cyan',
  },
];

// --- UNIVERSAL 3D LANDMARK PINS ---
const CAMPUS_PINS: BuildingPin[] = [
  // Top sector: Campus Gate & Student Town
  {
    id: 'gate',
    name: 'University Main Gate',
    category: 'Transport',
    emoji: '🏛️',
    x: 14,
    y: 18,
    description: 'Monumental campus gate, taxi terminal, and campus shuttle queue.',
    actionTitle: 'Board Campus Shuttle to Lecture Halls',
    actionCost: 150,
    energyChange: -5,
  },
  {
    id: 'student_town_pos',
    name: 'Student Town & POS Hub',
    category: 'Commercial',
    emoji: '💳',
    x: 28,
    y: 20,
    description: 'Withdraw emergency cash from POS or buy affordable hostel provisions.',
    actionTitle: 'Withdraw Pocket Allowance',
    actionReward: 2500,
    energyChange: -10,
  },
  {
    id: 'club_lounge',
    name: 'Campus Lounge & Grill',
    category: 'Nightlife',
    emoji: '🎷',
    x: 26,
    y: 12,
    description: 'Premier off-campus chill spot with loud Afrobeats, suya, and cold drinks.',
    actionTitle: 'Hang Out with Course Mates',
    actionCost: 1200,
    socialChange: 35,
    sanityChange: 20,
  },
  {
    id: 'chapel',
    name: 'University Chapel & Fellowship',
    category: 'Faith',
    emoji: '⛪',
    x: 12,
    y: 32,
    description: 'Inter-denominational student chapel and serene prayer garden.',
    actionTitle: 'Attend Sunday Fellowship Service',
    sanityChange: 30,
    socialChange: 15,
  },
  // Center: Administrative & Academic Core
  {
    id: 'senate',
    name: 'Senate Administrative Tower',
    category: 'Administration',
    emoji: '🏢',
    x: 32,
    y: 62,
    description: 'Vice-Chancellor headquarters, academic council chambers, and student clearance registry.',
    actionTitle: 'Process Semester Clearance Documents',
    energyChange: -15,
    sanityChange: -10,
  },
  {
    id: 'lecture_theatre',
    name: 'Central Lecture Theatres',
    category: 'Academics',
    emoji: '🎓',
    x: 38,
    y: 30,
    description: 'Mega-hall lecture theatres with intense early-morning attendance battles.',
    actionTitle: 'Fight for Front Row Seat & Attend 2hr Lecture',
    energyChange: -25,
    hungerChange: -20,
    sanityChange: -15,
  },
  {
    id: 'cbt_ict',
    name: 'ICT & CBT Testing Centre',
    category: 'Academics',
    emoji: '🖥️',
    x: 33,
    y: 28,
    description: 'University computer centre for CBT exams, course registration, and portal verification.',
    actionTitle: 'Help Freshers with Course Registration',
    actionReward: 1800,
    energyChange: -15,
  },
  {
    id: 'health_centre',
    name: 'University Health Centre',
    category: 'Emergency',
    emoji: '🏥',
    x: 78,
    y: 22,
    description: 'Campus medical clinic. Primary care, paracetamol prescriptions, and sick bay.',
    actionTitle: 'Receive Health Checkup & Rest',
    actionCost: 400,
    energyChange: 35,
    sanityChange: 20,
  },
  {
    id: 'tech_workshops',
    name: 'Engineering & Science Workshops',
    category: 'Academics',
    emoji: '⚙️',
    x: 58,
    y: 56,
    description: 'Laboratories, CAD studios, and fabrication machine workshops.',
    actionTitle: 'Complete Practical Lab Experiment',
    energyChange: -20,
    sanityChange: -10,
  },
  // SUB Market & Food
  {
    id: 'sub_buka',
    name: 'SUB Food Complex & Buka Stalls',
    category: 'Food',
    emoji: '🍲',
    x: 21,
    y: 55,
    description: 'Heart of campus appetite: steaming hot amala, ewedu, jollof rice, and fried dodo.',
    actionTitle: 'Eat Hot Amala & Goat Meat at Iya Basira',
    actionCost: 950,
    hungerChange: 65,
    sanityChange: 25,
  },
  {
    id: 'photocopy',
    name: 'Campus Photocopy & Print Hub',
    category: 'Commercial',
    emoji: '📄',
    x: 16,
    y: 54,
    description: 'Print term papers, spiral bind final-year projects, and buy past questions.',
    actionTitle: 'Hustle: Print Handouts for Class Rep',
    actionReward: 1400,
    energyChange: -15,
  },
  {
    id: 'security_post',
    name: 'Campus Security & Marshal Post',
    category: 'Security',
    emoji: '🚓',
    x: 24,
    y: 68,
    description: 'University security post and cadet corps keeping student peace.',
    actionTitle: 'Report Missing Student ID Card',
    actionCost: 300,
    sanityChange: 10,
  },
  // Sports Arena & Park
  {
    id: 'stadium',
    name: 'University Sports Stadium & Pitch',
    category: 'Sports',
    emoji: '⚽',
    x: 72,
    y: 55,
    description: 'FIFA-standard grass pitch, running tracks, and faculty cup tournaments.',
    actionTitle: 'Play Inter-Faculty Football Match',
    energyChange: -30,
    hungerChange: -25,
    socialChange: 45,
  },
  {
    id: 'botanical_gardens',
    name: 'Botanical Gardens & Eco Reserve',
    category: 'Tourism',
    emoji: '🦁',
    x: 78,
    y: 72,
    description: 'Lush green reserve with towering trees, peaceful pond, and quiet benches.',
    actionTitle: 'Nature Walk & Meditate Away Exam Stress',
    actionCost: 300,
    sanityChange: 40,
    energyChange: -5,
  },
  // Hostels
  {
    id: 'hostels',
    name: 'Student Hostels & Halls of Residence',
    category: 'Residential',
    emoji: '🛏️',
    x: 92,
    y: 60,
    description: 'Multi-block campus halls with lively hallway banter and cooking aromas.',
    actionTitle: 'Sleep in Hostel Room & Charge Devices',
    energyChange: 50,
    sanityChange: 25,
    hungerChange: -10,
  },
  {
    id: 'staff_club',
    name: 'Faculty & Senior Staff Club',
    category: 'Recreation',
    emoji: '🍸',
    x: 52,
    y: 74,
    description: 'Quiet garden lawn with spicy suya, drinks, and academic discussions.',
    actionTitle: 'Eat Peppered Suya with Senior Scholars',
    actionCost: 1500,
    socialChange: 30,
    sanityChange: 20,
  },
  {
    id: 'lake_dock',
    name: 'Campus Lake & Boardwalk Pier',
    category: 'Waterway',
    emoji: '⛵',
    x: 50,
    y: 44,
    description: 'Wooden pier overlooking the scenic central university lake.',
    actionTitle: 'Enjoy Sunset Breeze by the Pier',
    sanityChange: 25,
    energyChange: 10,
  },
];

export default function CampusLifeIsometric() {
  // Player Stats
  const [wallet, setWallet] = useState(4500);
  const [energy, setEnergy] = useState(85);
  const [hunger, setHunger] = useState(75);
  const [sanity, setSanity] = useState(90);
  const [social, setSocial] = useState(50);

  // Active Selected Landmark & Drawer
  const [activePin, setActivePin] = useState<BuildingPin | null>(null);
  const [selectedBillboard, setSelectedBillboard] = useState<Billboard | null>(null);
  const [isActionDrawerOpen, setIsActionDrawerOpen] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Map Pan / Drag state (Touch + Mouse)
  const [pan, setPan] = useState({ x: -140, y: -90 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch drag handlers (Mobile Phones / Tablets)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  // Trigger temporary toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Perform building action
  const handlePerformAction = (pin: BuildingPin) => {
    if (pin.actionCost && wallet < pin.actionCost) {
      showToast('❌ Not enough Naira! Sapa is active!');
      return;
    }
    if (pin.energyChange && pin.energyChange < 0 && energy < Math.abs(pin.energyChange)) {
      showToast('⚠️ Too exhausted! Rest or eat first!');
      return;
    }

    setWallet((w) => Math.max(0, w - (pin.actionCost || 0) + (pin.actionReward || 0)));
    setEnergy((e) => Math.min(100, Math.max(0, e + (pin.energyChange || 0))));
    setHunger((h) => Math.min(100, Math.max(0, h + (pin.hungerChange || 0))));
    setSanity((s) => Math.min(100, Math.max(0, s + (pin.sanityChange || 0))));
    setSocial((so) => Math.min(100, Math.max(0, so + (pin.socialChange || 0))));

    showToast(`✅ ${pin.actionTitle} completed!`);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#7cb870] font-sans select-none touch-none">
      {/* ========================================================= */}
      {/* 1. TOP LAGOS LIFE STYLE FLOATING HUD                      */}
      {/* ========================================================= */}
      <header className="absolute top-2.5 left-2.5 right-2.5 z-40 pointer-events-none flex flex-wrap items-center justify-between gap-2">
        {/* Left: Brand Badge & Online Stats */}
        <div className="pointer-events-auto flex items-center gap-1.5 md:gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-slate-200">
          <div className="flex items-center gap-1.5 font-black text-slate-900 text-xs md:text-base">
            <span className="text-amber-500">👑</span>
            <span>Campus Life</span>
          </div>
          <span className="text-slate-300 font-light">|</span>
          <div className="flex items-center gap-1 text-[10px] md:text-xs font-bold text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>24.5k online</span>
          </div>
          <span className="hidden sm:inline text-slate-300 font-light">•</span>
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-slate-500">
            <span>👥 1.2M visits</span>
          </div>
        </div>

        {/* Center: Live Marquee Ticker & Campus Quick Pills (Desktop) */}
        <div className="pointer-events-auto hidden xl:flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm text-xs font-bold text-slate-700 border border-slate-200">
            <span>🏛️ VC & Senate</span>
          </div>
          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm text-xs font-bold text-slate-700 border border-slate-200">
            <span>🎓 50 Faculties</span>
          </div>
          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm text-xs font-bold text-slate-700 border border-slate-200">
            <span>🛏️ 4,000 Hostels</span>
          </div>
          {/* Green Ticker Banner */}
          <div className="flex items-center gap-1.5 bg-emerald-700 text-white px-4 py-1.5 rounded-full shadow-md text-xs font-bold animate-pulse">
            <span>📢</span>
            <span>SUG declares Lecture-Free Sports Week this week!</span>
          </div>
        </div>

        {/* Right: User Pocket & Survival Status Badges */}
        <div className="pointer-events-auto flex items-center gap-1.5 md:gap-2">
          {/* Wallet */}
          <div className="bg-white/95 backdrop-blur-md px-2.5 md:px-3.5 py-1.5 rounded-full shadow-lg border border-slate-200 flex items-center gap-1">
            <span className="text-sm md:text-base">💰</span>
            <span className="text-xs md:text-sm font-black text-emerald-600">₦{wallet.toLocaleString()}</span>
          </div>
          {/* Energy */}
          <div className="bg-white/95 backdrop-blur-md px-2.5 md:px-3 py-1.5 rounded-full shadow-lg border border-slate-200 flex items-center gap-1 text-[11px] md:text-xs font-black text-amber-600">
            <span>⚡</span>
            <span>{energy}%</span>
          </div>
          {/* Hunger */}
          <div className="bg-white/95 backdrop-blur-md px-2.5 md:px-3 py-1.5 rounded-full shadow-lg border border-slate-200 flex items-center gap-1 text-[11px] md:text-xs font-black text-rose-600">
            <span>🍔</span>
            <span>{hunger}%</span>
          </div>
          {/* Reset View Button */}
          <button
            onClick={() => setPan({ x: -140, y: -90 })}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-2.5 md:px-3.5 py-1.5 rounded-full font-black text-[11px] md:text-xs shadow-lg transition-all"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Floating Delta Toast */}
      {toastMessage && (
        <div className="absolute top-16 md:top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
          <div className="bg-slate-900/95 text-white px-4 md:px-5 py-2 rounded-full shadow-2xl border border-emerald-500/50 text-xs md:text-sm font-black whitespace-nowrap">
            {toastMessage}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. THE 3D ISOMETRIC / TILT-SHIFT CITY CANVAS (LAGOS LIFE) */}
      {/* ========================================================= */}
      <div
        ref={mapContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`w-full h-full cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
        style={{ perspective: '1100px' }}
      >
        <div
          className="relative w-[2800px] h-[2200px] transition-transform duration-75 ease-out"
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) rotateX(55deg) rotateZ(-26deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* 🌿 BASE TERRAIN: LUSH PASTEL CAMPUS GRASS (Matches Lagos Life #8fc77c) */}
          <div className="absolute inset-0 bg-[#8bc67a] shadow-inner">
            {/* Subtle lawn plot grid */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #6fa85f 2px, transparent 2px), linear-gradient(to bottom, #6fa85f 2px, transparent 2px)',
                backgroundSize: '120px 120px',
              }}
            />

            {/* 🌊 CAMPUS WATER BODY: "CAMPUS LAKE / WATER RESERVE" */}
            <div
              className="absolute left-0 right-0 top-[40%] h-[240px] bg-[#53b8dc] border-y-8 border-[#3da2c6] flex items-center justify-around shadow-inner"
              style={{ transform: 'translateZ(2px)' }}
            >
              <span className="text-white/40 font-black text-6xl tracking-[0.3em] uppercase pointer-events-none">
                CAMPUS LAKE
              </span>
              <span className="text-white/40 font-black text-6xl tracking-[0.3em] uppercase pointer-events-none">
                UNIVERSITY WATER RESERVE
              </span>
            </div>

            {/* 🛣️ MAIN ASPHALT ROADS */}
            {/* East-West Highway */}
            <div
              className="absolute left-0 right-0 top-[28%] h-[60px] bg-[#758490] border-y-4 border-[#61707c]"
              style={{ transform: 'translateZ(4px)' }}
            >
              <div className="w-full h-full flex items-center justify-between border-t border-b border-white/20">
                <div className="w-full h-[3px] border-b-2 border-dashed border-white/60"></div>
              </div>
            </div>

            {/* South Boulevard */}
            <div
              className="absolute left-0 right-0 top-[68%] h-[65px] bg-[#758490] border-y-4 border-[#61707c]"
              style={{ transform: 'translateZ(4px)' }}
            >
              <div className="w-full h-full flex items-center justify-between">
                <div className="w-full h-[3px] border-b-2 border-dashed border-amber-300/70"></div>
              </div>
            </div>

            {/* North-South Linking Arteries */}
            <div
              className="absolute top-0 bottom-0 left-[24%] w-[55px] bg-[#758490] border-x-4 border-[#61707c]"
              style={{ transform: 'translateZ(4px)' }}
            />
            <div
              className="absolute top-0 bottom-0 left-[48%] w-[55px] bg-[#758490] border-x-4 border-[#61707c]"
              style={{ transform: 'translateZ(4px)' }}
            />
            <div
              className="absolute top-0 bottom-0 left-[75%] w-[55px] bg-[#758490] border-x-4 border-[#61707c]"
              style={{ transform: 'translateZ(4px)' }}
            />

            {/* Bridge over Lake */}
            <div
              className="absolute top-[40%] left-[47%] w-[75px] h-[240px] bg-[#8997a3] border-x-4 border-amber-400 shadow-2xl"
              style={{ transform: 'translateZ(10px)' }}
            >
              <div className="w-full h-full flex flex-col justify-around items-center">
                <span className="text-[10px] font-black text-amber-300 rotate-90">BRIDGE</span>
                <span className="text-[10px] font-black text-amber-300 rotate-90">BRIDGE</span>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 3D BUILDINGS & STYLED ENVIRONMENT CLUSTERS                */}
            {/* ========================================================= */}

            {/* CLUSTER A: SUB BUKA MARKET STALLS (Vibrant Color Blocks) */}
            <div
              className="absolute top-[52%] left-[16%] w-[260px] h-[190px] bg-[#6ca55c] p-3 rounded-xl border-4 border-[#5b8f4c] shadow-xl grid grid-cols-4 grid-rows-3 gap-2"
              style={{ transform: 'translateZ(8px)' }}
            >
              {['#e11d48', '#0284c7', '#16a34a', '#eab308', '#9333ea', '#ea580c', '#06b6d4', '#e11d48', '#16a34a', '#eab308', '#0284c7', '#9333ea'].map(
                (color, i) => (
                  <div
                    key={i}
                    style={{ backgroundColor: color }}
                    className="rounded shadow-md flex items-center justify-center text-[10px] text-white font-black"
                  >
                    🏪
                  </div>
                )
              )}
            </div>

            {/* CLUSTER B: STADIUM & SPORTS ARENA */}
            <div
              className="absolute top-[50%] left-[68%] w-[340px] h-[220px] bg-[#d97706] rounded-3xl p-3 shadow-2xl border-4 border-amber-800"
              style={{ transform: 'translateZ(8px)' }}
            >
              {/* Running Track & Green Pitch */}
              <div className="w-full h-full bg-[#3fa844] rounded-2xl border-4 border-white/80 p-3 relative flex items-center justify-center shadow-inner">
                {/* Center circle */}
                <div className="w-16 h-16 rounded-full border-2 border-white/80 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
                <div className="absolute inset-x-0 h-0.5 bg-white/80 top-1/2"></div>
                {/* Goal posts */}
                <div className="absolute left-1 inset-y-8 w-4 border-2 border-white/80"></div>
                <div className="absolute right-1 inset-y-8 w-4 border-2 border-white/80"></div>
              </div>
            </div>

            {/* CLUSTER C: BOTANICAL GARDENS & ECO PARK */}
            <div
              className="absolute top-[68%] left-[76%] w-[260px] h-[200px] bg-[#539745] rounded-2xl p-3 border-4 border-[#3e7533] shadow-xl relative"
              style={{ transform: 'translateZ(8px)' }}
            >
              <div className="absolute bottom-3 left-4 w-20 h-16 rounded-full bg-[#4bb1d6] border-2 border-[#3794b6]"></div>
              <div className="absolute top-2 left-4 text-3xl">🌲</div>
              <div className="absolute top-2 right-4 text-3xl">🌴</div>
              <div className="absolute bottom-6 right-8 text-3xl">🌳</div>
              <div className="absolute top-10 left-16 text-3xl">🌲</div>
              <div className="absolute top-12 right-16 text-3xl">🌴</div>
            </div>

            {/* CLUSTER D: SENATE TOWER */}
            <div
              className="absolute top-[58%] left-[32%] w-[130px] h-[110px] bg-slate-800 rounded-lg shadow-2xl border-4 border-slate-600 flex flex-col items-center justify-center text-white"
              style={{ transform: 'translateZ(45px)' }}
            >
              <div className="text-xs font-black text-emerald-400">SENATE TOWER</div>
              <div className="grid grid-cols-4 gap-1 mt-1">
                {[...Array(8)].map((_, idx) => (
                  <div key={idx} className="w-3 h-2 bg-cyan-400/80 rounded-sm"></div>
                ))}
              </div>
            </div>

            {/* CLUSTER E: HEALTH CENTRE */}
            <div
              className="absolute top-[18%] left-[78%] w-[120px] h-[95px] bg-slate-100 rounded-lg shadow-2xl border-4 border-slate-300 flex flex-col items-center justify-center"
              style={{ transform: 'translateZ(30px)' }}
            >
              <span className="text-2xl font-black text-rose-600">➕</span>
              <span className="text-[9px] font-black text-slate-800">CLINIC</span>
            </div>

            {/* CLUSTER F: STUDENT HOSTELS */}
            <div
              className="absolute top-[52%] left-[88%] w-[240px] h-[160px] grid grid-cols-3 gap-3 p-2 bg-[#69a15a] rounded-xl border-2 border-emerald-800"
              style={{ transform: 'translateZ(12px)' }}
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-[#b3855a] rounded border-2 border-[#875d38] p-1 shadow">
                  <div className="h-2 bg-[#944738] rounded-t"></div>
                  <div className="text-[8px] text-center font-bold text-white mt-1">HOSTEL</div>
                </div>
              ))}
            </div>

            {/* ========================================================= */}
            {/* 3. 3D DIGITAL BILLBOARDS (EXACT LAGOS LIFE STYLE)         */}
            {/* ========================================================= */}
            {CAMPUS_BILLBOARDS.map((bb) => (
              <div
                key={bb.id}
                style={{
                  left: `${bb.x}%`,
                  top: `${bb.y}%`,
                  transform: 'translateZ(25px)',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedBillboard(bb);
                  showToast(`📢 ${bb.title}: ${bb.sub}`);
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform duration-200 hover:scale-110"
              >
                {/* 3D Black Pole Supports */}
                <div className="relative flex flex-col items-center">
                  <div className="w-[170px] md:w-[190px] h-[85px] bg-slate-950 p-1.5 rounded-lg border-2 border-slate-800 shadow-2xl shadow-black/80 flex flex-col justify-between overflow-hidden">
                    <div
                      className={`w-full h-full rounded p-1.5 flex flex-col justify-between text-center ${
                        bb.colorScheme === 'pink'
                          ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600'
                          : bb.colorScheme === 'emerald'
                          ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700'
                          : 'bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500'
                      }`}
                    >
                      <span className="text-[8px] uppercase tracking-widest font-black text-amber-300">
                        ★ {bb.title} ★
                      </span>
                      <p className="text-[10px] font-black text-white leading-tight drop-shadow-md">
                        {bb.sub}
                      </p>
                      <div className="bg-black/60 rounded px-1 py-0.5">
                        <span className="text-[9px] font-extrabold text-white tracking-wide">
                          {bb.rate}
                        </span>
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
            {/* 4. CIRCULAR FLOATING WHITE PIN BADGES (LAGOS LIFE)        */}
            {/* ========================================================= */}
            {CAMPUS_PINS.map((pin) => {
              const isSelected = activePin?.id === pin.id;
              return (
                <div
                  key={pin.id}
                  style={{
                    left: `${pin.x}%`,
                    top: `${pin.y}%`,
                    transform: 'translateZ(65px)',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePin(pin);
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-30 transition-transform duration-200 hover:scale-125"
                >
                  <div className="relative flex flex-col items-center">
                    {/* The Pure White Round Disc Button */}
                    <div
                      className={`w-9 h-9 md:w-11 md:h-11 rounded-full bg-white border-2 flex items-center justify-center text-lg md:text-xl shadow-xl transition-all ${
                        isSelected
                          ? 'border-emerald-500 ring-4 ring-emerald-400 scale-110 shadow-emerald-500/50'
                          : 'border-slate-300 shadow-black/25 group-hover:border-emerald-400 group-hover:shadow-2xl'
                      }`}
                    >
                      <span>{pin.emoji}</span>
                    </div>

                    <div className="w-0.5 h-3 bg-white/80 shadow-md"></div>
                    <div className="w-2 h-1 bg-black/30 rounded-full blur-[1px]"></div>

                    {/* Hover Mini Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900/90 text-white text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap shadow-lg pointer-events-none">
                      {pin.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. BOTTOM FLOATING ACTION CARD & DRAWER (LAGOS LIFE)      */}
      {/* ========================================================= */}
      <footer className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-2.5 pointer-events-none">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl p-3 md:p-4 shadow-2xl flex flex-col gap-2">
          {/* Top Row: Playing Now Count & Quick Toggle */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="flex -space-x-1.5 overflow-hidden">
                <span className="inline-block h-5 w-5 md:h-6 md:w-6 rounded-full bg-emerald-500 border-2 border-white text-xs flex items-center justify-center">
                  🧑‍🎓
                </span>
                <span className="inline-block h-5 w-5 md:h-6 md:w-6 rounded-full bg-indigo-500 border-2 border-white text-xs flex items-center justify-center">
                  👩‍🌾
                </span>
                <span className="inline-block h-5 w-5 md:h-6 md:w-6 rounded-full bg-amber-500 border-2 border-white text-xs flex items-center justify-center">
                  👨‍💻
                </span>
              </div>
              <div className="text-[11px] md:text-xs font-bold text-slate-700">
                <span className="font-extrabold text-slate-900">24.5k Students</span> playing right now • free
              </div>
            </div>

            <button
              onClick={() => setIsActionDrawerOpen(!isActionDrawerOpen)}
              className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 px-2 py-0.5 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              {isActionDrawerOpen ? 'Collapse' : 'Expand'}
            </button>
          </div>

          {/* If Pin Selected: Dedicated Building Action Card */}
          {activePin ? (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-2.5 md:p-3 flex flex-col gap-1.5 animate-fadeIn">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white shadow flex items-center justify-center text-xl md:text-2xl border border-emerald-200">
                    {activePin.emoji}
                  </div>
                  <div>
                    <h3 className="text-xs md:text-sm font-black text-slate-900">{activePin.name}</h3>
                    <p className="text-[10px] md:text-[11px] font-semibold text-emerald-700">{activePin.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActivePin(null)}
                  className="text-slate-400 hover:text-slate-700 text-xs font-bold px-1"
                >
                  ✕
                </button>
              </div>

              <p className="text-[11px] md:text-xs text-slate-600 leading-snug">{activePin.description}</p>

              {/* Action Trigger Button */}
              <button
                onClick={() => handlePerformAction(activePin)}
                className="w-full mt-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs md:text-sm py-2 md:py-2.5 px-3 md:px-4 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-between"
              >
                <span>⚡ {activePin.actionTitle}</span>
                <span className="bg-emerald-800/80 px-2 py-0.5 rounded text-[10px] md:text-[11px]">
                  {activePin.actionCost ? `-₦${activePin.actionCost}` : activePin.actionReward ? `+₦${activePin.actionReward}` : 'Go!'}
                </span>
              </button>
            </div>
          ) : isActionDrawerOpen ? (
            /* General Play Action Button */
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const randomPin = CAMPUS_PINS[Math.floor(Math.random() * CAMPUS_PINS.length)];
                  setActivePin(randomPin);
                  showToast(`📍 Focused on ${randomPin.name}`);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs md:text-sm py-2.5 md:py-3 px-4 md:px-6 rounded-2xl shadow-lg shadow-emerald-600/30 transition-all text-center"
              >
                Explore Next Campus Spot 🚀
              </button>
              <button
                onClick={() => showToast('🎓 Logged in as Student')}
                className="bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-extrabold text-xs md:text-sm py-2.5 md:py-3 px-3.5 md:px-5 rounded-2xl border border-slate-200 transition-all"
              >
                Profile
              </button>
            </div>
          ) : null}

          {/* Footer Social Pill Badges */}
          <div className="flex items-center justify-center gap-3 md:gap-4 text-[11px] md:text-xs font-extrabold text-slate-400 pt-0.5">
            <span className="flex items-center gap-1 text-emerald-600">
              <span>✔</span> Official
            </span>
            <span className="hover:text-slate-800 cursor-pointer">𝕏</span>
            <span className="hover:text-slate-800 cursor-pointer">TikTok</span>
            <span className="hover:text-slate-800 cursor-pointer">Instagram</span>
            <span className="hover:text-slate-800 cursor-pointer">Discord</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

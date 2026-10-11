'use client';

import React, { useState, useEffect, useMemo } from 'react';

// --- TYPES & INTERFACES ---
export type CampusLocationId = 'gate' | 'jao' | 'motion' | 'camp' | 'isolu' | 'health_centre';

export interface CampusLocation {
  id: CampusLocationId;
  name: string;
  emoji: string;
  tagline: string;
  coords: { x: number; y: number }; // Percentage on isometric grid
  color: string;
}

export interface PlayerStats {
  wallet: number;
  energy: number;
  hunger: number;
  sanity: number;
  social: number;
  academicXP: number;
  day: number;
  timeSlot: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  currentLocation: CampusLocationId;
}

export interface ActionItem {
  id: string;
  title: string;
  emoji: string;
  description: string;
  effectDescription: string;
  cost?: number;
  reward?: number;
  energyCost?: number;
  energyGain?: number;
  hungerGain?: number;
  hungerCost?: number;
  sanityDelta?: number;
  socialDelta?: number;
  academicXpGain?: number;
  targetLocation?: CampusLocationId;
  flavorLog: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  text: string;
  type: 'move' | 'hustle' | 'spend' | 'groove' | 'alert' | 'penalty';
}

// --- CAMPUS MAP LOCATIONS ---
export const CAMPUS_LOCATIONS: Record<CampusLocationId, CampusLocation> = {
  gate: {
    id: 'gate',
    name: 'FUNAAB Main Gate',
    emoji: '🏛️',
    tagline: 'Ceremonial archway & shuttle park terminal',
    coords: { x: 18, y: 78 },
    color: 'from-amber-500 to-emerald-600',
  },
  jao: {
    id: 'jao',
    name: 'JAO 1-3 Lecture Theatres',
    emoji: '🏫',
    tagline: 'Crowded halls, no AC, 8:00 AM attendance wars',
    coords: { x: 48, y: 44 },
    color: 'from-blue-600 to-indigo-800',
  },
  motion: {
    id: 'motion',
    name: 'Motion Ground & Sports Complex',
    emoji: '🏟️',
    tagline: 'SUG election rallies, evening jogging & SU hangout',
    coords: { x: 55, y: 70 },
    color: 'from-emerald-500 to-teal-700',
  },
  camp: {
    id: 'camp',
    name: 'Camp Junction & Market',
    emoji: '🏡',
    tagline: 'Off-campus hub, Point of Sale (POS) stands & Bukas',
    coords: { x: 12, y: 28 },
    color: 'from-orange-500 to-red-600',
  },
  isolu: {
    id: 'isolu',
    name: 'Isolu Student Hostels',
    emoji: '🛏️',
    tagline: 'Hostel vibes, generator noise & late-night gist',
    coords: { x: 80, y: 35 },
    color: 'from-purple-600 to-pink-600',
  },
  health_centre: {
    id: 'health_centre',
    name: 'University Health Centre',
    emoji: '🏥',
    tagline: 'Paracetamol headquarters & emergency ward',
    coords: { x: 74, y: 68 },
    color: 'from-rose-500 to-red-700',
  },
};

// --- ACTION CATALOGUE ---
export const GAME_ACTIONS: Record<'move' | 'hustle' | 'spend' | 'groove', ActionItem[]> = {
  move: [
    {
      id: 'move_gate',
      title: 'Trek to Main Gate',
      emoji: '🏛️',
      description: 'Take white shuttle or trek through the long boulevard.',
      effectDescription: '-₦150, -10 Energy',
      cost: 150,
      energyCost: 10,
      hungerCost: 5,
      targetLocation: 'gate',
      flavorLog: '🚶 You jumped inside a Coaster bus to FUNAAB Main Gate. Conductor said "hold your exact change!" (-₦150)',
    },
    {
      id: 'move_jao',
      title: 'Rush to JAO 1-3',
      emoji: '🏫',
      description: 'Fight for front-row seat before Dr. Ogundele locks the door.',
      effectDescription: '-20 Energy, -10 Sanity, +25 XP',
      energyCost: 20,
      hungerCost: 10,
      sanityDelta: -10,
      academicXpGain: 25,
      targetLocation: 'jao',
      flavorLog: '📚 You squeezed into JAO Lecture Theatre. Microphones were cracking! (+25 Academic XP, -20 Energy)',
    },
    {
      id: 'move_motion',
      title: 'Hangout at Motion Ground',
      emoji: '🏟️',
      description: 'Catch campus breeze, watch football or chat by the stands.',
      effectDescription: '-5 Energy, +15 Social',
      energyCost: 5,
      socialDelta: 15,
      targetLocation: 'motion',
      flavorLog: '🏟️ You chilled by the grass at Motion Ground. Caught up on campus gossip! (+15 Social)',
    },
    {
      id: 'move_camp',
      title: 'Head to Camp Junction',
      emoji: '🏡',
      description: 'Board red cab out of campus to buy groceries and hustle.',
      effectDescription: '-₦200, -10 Energy',
      cost: 200,
      energyCost: 10,
      hungerCost: 10,
      targetLocation: 'camp',
      flavorLog: '🚕 You boarded a shared cab to Camp Junction. Traffic at the roundabout was wild! (-₦200)',
    },
    {
      id: 'move_isolu',
      title: 'Return to Isolu Hostels',
      emoji: '🛏️',
      description: 'Rest on your student mattress and plug phone to "I better pass my neighbor" gen.',
      effectDescription: '+35 Energy, +15 Sanity, -₦100 (Gen fuel)',
      cost: 100,
      energyGain: 35,
      sanityDelta: 15,
      targetLocation: 'isolu',
      flavorLog: '🛏️ You took a refreshing power nap at Isolu hostel under ceiling fan breeze. (+35 Energy)',
    },
  ],
  hustle: [
    {
      id: 'hustle_shuttle',
      title: 'Campus Shuttle Driver Assistant',
      emoji: '🚐',
      description: 'Call passengers at Gate: "Motion Ground enter with your ₦150!"',
      effectDescription: '+₦1,200, -25 Energy, -15 Hunger',
      reward: 1200,
      energyCost: 25,
      hungerCost: 15,
      flavorLog: '🚐 You assisted the campus shuttle driver shouting "Motion! JAO! 150 change!" Earned ₦1,200 pure hustle money!',
    },
    {
      id: 'hustle_compcentre',
      title: 'Compcentre Attendant',
      emoji: '🖥️',
      description: 'Help 100L Jambites do course registration & passport sizing.',
      effectDescription: '+₦2,000, -20 Energy, -10 Sanity',
      reward: 2000,
      energyCost: 20,
      sanityDelta: -10,
      hungerCost: 10,
      flavorLog: '🖥️ You solved course code glitches for frustrated freshers at Compcentre. (+₦2,000, -10 Sanity)',
    },
    {
      id: 'hustle_photocopy',
      title: 'Photocopy Guy at COLAMRUD',
      emoji: '📄',
      description: 'Run heavy volumes of past questions & Dr. Adebayo handout prints.',
      effectDescription: '+₦1,500, -15 Energy, -10 Hunger',
      reward: 1500,
      energyCost: 15,
      hungerCost: 10,
      flavorLog: '📄 Machine jammed twice, but you produced 120 copies of GNS 101 past questions! (+₦1,500)',
    },
    {
      id: 'hustle_water',
      title: 'Cold Pure Water Seller',
      emoji: '💧',
      description: 'Hawked iced sachet water under blazing Abeokuta 2:00 PM sun.',
      effectDescription: '+₦800, -30 Energy, -20 Hunger',
      reward: 800,
      energyCost: 30,
      hungerCost: 20,
      flavorLog: '💧 Pure water sold out in 30 minutes in front of COLPLANT! (+₦800 cash)',
    },
  ],
  spend: [
    {
      id: 'spend_gala',
      title: 'Gala Sausage & Lacasera',
      emoji: '🥖',
      description: 'The legendary Nigerian student quick-energy lifesaver.',
      effectDescription: '-₦450, +25 Hunger, +10 Energy',
      cost: 450,
      hungerGain: 25,
      energyGain: 10,
      flavorLog: '🥖 Cold Lacasera + warm Gala hit the spot inside the shuttle queue! (+25 Hunger, -₦450)',
    },
    {
      id: 'spend_amala',
      title: 'Hot Amala & Gbegiri Buka',
      emoji: '🍲',
      description: 'Fluffy black amala with ewedu, goat meat and peppered pomo.',
      effectDescription: '-₦1,100, +65 Hunger, +25 Sanity',
      cost: 1100,
      hungerGain: 65,
      sanityDelta: 25,
      flavorLog: '🍲 You ate steaming hot Amala & Ewedu with goat meat behind Ceremonial Building. Life is good! (+65 Hunger, -₦1,100)',
    },
    {
      id: 'spend_rice',
      title: 'Buka Jollof & Fried Plantain',
      emoji: '🍛',
      description: 'Smoky party jollof with two pieces of dodo from Iya Basira.',
      effectDescription: '-₦900, +50 Hunger, +15 Energy',
      cost: 900,
      hungerGain: 50,
      energyGain: 15,
      flavorLog: '🍛 Iya Basira gave you extra spoonful of dodo because of your sweet mouth. (+50 Hunger, -₦900)',
    },
    {
      id: 'spend_powerbank',
      title: 'Fast-Charging Power Bank',
      emoji: '🔋',
      description: 'Keep your smartphone alive through 8-hour NEPA power outages.',
      effectDescription: '-₦3,500, +40 Sanity',
      cost: 3500,
      sanityDelta: 40,
      flavorLog: '🔋 Bought a 20,000mAh battery pack at Camp market. No more crying when light goes off! (+40 Sanity, -₦3,500)',
    },
  ],
  groove: [
    {
      id: 'groove_mubas',
      title: 'Chill at Mubas Bar & Grill',
      emoji: '🍻',
      description: 'Listen to loud Asake songs, drink cold malt, and argue Premier League.',
      effectDescription: '-₦1,500, +45 Social, +20 Sanity, -15 Energy',
      cost: 1500,
      socialDelta: 45,
      sanityDelta: 20,
      energyCost: 15,
      flavorLog: '🔊 You went clubbing at Mubas. Vibes were immaculate and Chelsea lost! (-₦1,500, +45 Social)',
    },
    {
      id: 'groove_bonfire',
      title: 'Hostel Acoustic Bonfire',
      emoji: '🪵',
      description: 'Sing along to Burna Boy with guitar chords under the starry sky.',
      effectDescription: '-5 Energy, +30 Social, +15 Sanity',
      energyCost: 5,
      socialDelta: 30,
      sanityDelta: 15,
      flavorLog: '🪵 Gathered round the fire at Isolu hostel compound. Pure positive camaraderie! (+30 Social)',
    },
    {
      id: 'groove_party',
      title: 'Crash Faculty Dinner & Awards',
      emoji: '🪩',
      description: 'Show up in your sharpest senator native attire and dance Zanku.',
      effectDescription: '-₦1,000, +50 Social, -20 Energy',
      cost: 1000,
      socialDelta: 50,
      energyCost: 20,
      flavorLog: '🪩 You crashed NACOSS Dinner at Ceremonial Hall! Stole two takeaway packs! (+50 Social, -₦1,000)',
    },
    {
      id: 'groove_staff_club',
      title: 'Senior Staff Club Hangout',
      emoji: '🍸',
      description: 'Gentle atmosphere, suya skewers, and networking with postgrads.',
      effectDescription: '-₦2,200, +40 Social, +25 Sanity',
      cost: 2200,
      socialDelta: 40,
      sanityDelta: 25,
      flavorLog: '🍸 Enjoyed spicy beef suya with seniors at Senior Staff Club. High value connections made! (+40 Social, -₦2,200)',
    },
  ],
};

// --- HELPER TO DETERMINE STUDENT STATUS ---
function getStudentTitle(wallet: number, academicXP: number, sanity: number): { title: string; badge: string; color: string } {
  if (wallet >= 20000) {
    return { title: '🤫 EFCC Target', badge: 'Big Boy', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
  }
  if (academicXP >= 150) {
    return { title: '👔 Scholar (First Class)', badge: 'Bookworm', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
  }
  if (sanity <= 20) {
    return { title: '😵 Carryover Survivor', badge: 'Stressed', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
  }
  if (wallet < 1000) {
    return { title: '💸 Sapa Ambassador', badge: 'Broke', color: 'bg-red-500/20 text-red-300 border-red-500/40' };
  }
  return { title: '🎓 100L Jambite', badge: 'Freshman', color: 'bg-teal-500/20 text-teal-300 border-teal-500/40' };
}

import CustomCampusMap from './CustomCampusMap';

// --- MAIN COMPONENT ---
export default function FunaabLifeGame() {
  const [showFullMapModal, setShowFullMapModal] = useState<boolean>(false);
  // 1. GAME STATE
  const [stats, setStats] = useState<PlayerStats>({
    wallet: 3500,
    energy: 85,
    hunger: 70,
    sanity: 90,
    social: 40,
    academicXP: 20,
    day: 1,
    timeSlot: 'Morning',
    currentLocation: 'gate',
  });

  const [activeTab, setActiveTab] = useState<'move' | 'hustle' | 'spend' | 'groove'>('move');
  const [logs, setLogs] = useState<ActivityLog[]>([
    {
      id: 'init-1',
      timestamp: '08:00 AM',
      text: '🎒 Welcome to FUNAAB! You just arrived at the Main Gate with your luggage. Sapa is real, but your ambition is high!',
      type: 'alert',
    },
    {
      id: 'init-2',
      timestamp: '08:05 AM',
      text: '💡 Pro-tip: Keep your Energy & Hunger high. If Hunger hits 0, you will collapse and end up at Health Centre!',
      type: 'alert',
    },
  ]);

  const [floatingToast, setFloatingToast] = useState<{ message: string; color: string } | null>(null);
  const [isDrawerOpenMobile, setIsDrawerOpenMobile] = useState<boolean>(true);

  // Derive student status
  const studentStatus = useMemo(
    () => getStudentTitle(stats.wallet, stats.academicXP, stats.sanity),
    [stats.wallet, stats.academicXP, stats.sanity]
  );

  // Helper to trigger floating toast
  const triggerToast = (message: string, color: string = 'text-emerald-400') => {
    setFloatingToast({ message, color });
    setTimeout(() => setFloatingToast(null), 2500);
  };

  // 2. ACTION HANDLER WITH REALISTIC RULES & CONSTRAINTS
  const executeAction = (action: ActionItem) => {
    // Check wallet restriction
    if (action.cost && stats.wallet < action.cost) {
      addLog(`❌ Insufficient funds! You need ₦${action.cost.toLocaleString()} but only have ₦${stats.wallet.toLocaleString()}. Sapa is holding you!`, 'penalty');
      triggerToast('❌ Not enough Naira!', 'text-rose-400');
      return;
    }

    // Check energy restriction
    if (action.energyCost && stats.energy < action.energyCost) {
      addLog(`⚠️ You are too exhausted (${stats.energy}% Energy) to do this! Trek to Isolu or buy Gala & Lacasera first.`, 'penalty');
      triggerToast('⚠️ Low Energy! Rest up!', 'text-amber-400');
      return;
    }

    // Calculate updated values
    setStats((prev) => {
      let newWallet = prev.wallet - (action.cost || 0) + (action.reward || 0);
      let newEnergy = Math.min(100, Math.max(0, prev.energy - (action.energyCost || 0) + (action.energyGain || 0)));
      let newHunger = Math.min(100, Math.max(0, prev.hunger - (action.hungerCost || 0) + (action.hungerGain || 0)));
      let newSanity = Math.min(100, Math.max(0, prev.sanity + (action.sanityDelta || 0)));
      let newSocial = Math.min(100, Math.max(0, prev.social + (action.socialDelta || 0)));
      let newAcademicXP = prev.academicXP + (action.academicXpGain || 0);
      let newLocation = action.targetLocation || prev.currentLocation;

      // Time progression
      const timeSlots: ('Morning' | 'Afternoon' | 'Evening' | 'Night')[] = ['Morning', 'Afternoon', 'Evening', 'Night'];
      const currentIndex = timeSlots.indexOf(prev.timeSlot);
      let nextIndex = (currentIndex + 1) % timeSlots.length;
      let nextDay = nextIndex === 0 ? prev.day + 1 : prev.day;

      // Emergency Fainting penalty if hunger hits zero
      if (newHunger <= 0) {
        newLocation = 'health_centre';
        newWallet = Math.max(0, newWallet - 500);
        newEnergy = 40;
        newHunger = 30;
        newSanity = Math.max(10, newSanity - 20);
        setTimeout(() => {
          addLog('🏥 🚑 CRITICAL: You collapsed from severe hunger! Campus Good Samaritans rushed you to the Health Centre. Clinic bill: -₦500.', 'penalty');
          triggerToast('🏥 Fainted! Rushed to Clinic!', 'text-red-400');
        }, 150);
      }

      return {
        wallet: newWallet,
        energy: newEnergy,
        hunger: newHunger,
        sanity: newSanity,
        social: newSocial,
        academicXP: newAcademicXP,
        day: nextDay,
        timeSlot: timeSlots[nextIndex],
        currentLocation: newLocation,
      };
    });

    // Add log
    addLog(action.flavorLog, activeTab);
    triggerToast(action.reward ? `+₦${action.reward.toLocaleString()}` : action.cost ? `-₦${action.cost.toLocaleString()}` : 'Action Done!');
  };

  const addLog = (text: string, type: ActivityLog['type']) => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newLogItem: ActivityLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: timeString,
      text,
      type,
    };
    setLogs((prev) => [newLogItem, ...prev.slice(0, 19)]); // Keep recent 20 logs
  };

  // Color bar dynamic helper
  const getBarColor = (val: number) => {
    if (val > 60) return 'bg-emerald-500';
    if (val > 30) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* ========================================================= */}
      {/* LAYER 1: BACKGROUND ISOMETRIC / 2.5D CAMPUS MAP CANVAS   */}
      {/* ========================================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
        {/* Campus Map Textured Terrain */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/70 via-slate-900 to-green-950/80">
          {/* Subtle Isometric Grid Pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="funaab-grid" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#10b981" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#funaab-grid)" />
          </svg>

          {/* Winding Campus Asphalt Road Network */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-700/60" fill="none">
            {/* Gate to Motion Ground road */}
            <path d="M 18% 78% Q 35% 82% 55% 70%" strokeWidth="14" strokeLinecap="round" />
            <path d="M 18% 78% Q 35% 82% 55% 70%" strokeWidth="2" strokeDasharray="6 6" stroke="#fbbf24" strokeLinecap="round" />
            {/* Motion Ground to JAO */}
            <path d="M 55% 70% Q 50% 55% 48% 44%" strokeWidth="12" strokeLinecap="round" />
            {/* Gate to Camp Road */}
            <path d="M 18% 78% Q 12% 50% 12% 28%" strokeWidth="12" strokeLinecap="round" />
            {/* JAO to Isolu Hostels */}
            <path d="M 48% 44% Q 65% 38% 80% 35%" strokeWidth="10" strokeLinecap="round" />
            {/* Motion Ground to Health Centre */}
            <path d="M 55% 70% Q 65% 72% 74% 68%" strokeWidth="10" strokeLinecap="round" />
          </svg>
        </div>

        {/* Dynamic Campus Landmark Pins */}
        {Object.values(CAMPUS_LOCATIONS).map((loc) => {
          const isPlayerHere = stats.currentLocation === loc.id;
          return (
            <div
              key={loc.id}
              style={{ left: `${loc.coords.x}%`, top: `${loc.coords.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform duration-300 hover:scale-110"
              onClick={() => {
                const moveAction = GAME_ACTIONS.move.find((m) => m.targetLocation === loc.id);
                if (moveAction && !isPlayerHere) executeAction(moveAction);
              }}
            >
              {/* Landmark Base Shadow & Aura */}
              <div
                className={`relative flex flex-col items-center p-2 rounded-2xl transition-all duration-300 ${
                  isPlayerHere
                    ? 'scale-110 ring-4 ring-emerald-400 bg-slate-900/90 shadow-2xl shadow-emerald-500/50'
                    : 'bg-slate-900/60 backdrop-blur-sm border border-slate-700/60 hover:bg-slate-800/80'
                }`}
              >
                {/* Visual Avatar / Pin Badge */}
                <div className="relative text-3xl md:text-4xl filter drop-shadow-md">
                  {loc.emoji}
                  {isPlayerHere && (
                    <span className="absolute -top-3 -right-3 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-950"></span>
                    </span>
                  )}
                </div>

                {/* Micro Label */}
                <div className="mt-1 text-center whitespace-nowrap px-2 py-0.5 rounded-full bg-slate-950/80 border border-slate-700/50">
                  <span className="text-[10px] md:text-xs font-black tracking-wide text-slate-200">
                    {loc.name.split(' ')[0]} {loc.name.split(' ')[1] || ''}
                  </span>
                  {isPlayerHere && (
                    <span className="ml-1 text-[9px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded">
                      YOU ARE HERE
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Ambient Floating Campus Shuttles / Animated Props */}
        <div className="absolute top-1/4 left-1/3 animate-bounce duration-1000 pointer-events-none opacity-40 text-2xl">
          🚐
        </div>
        <div className="absolute top-2/3 right-1/4 animate-pulse pointer-events-none opacity-30 text-3xl">
          🌳
        </div>
        <div className="absolute top-1/3 right-1/5 animate-pulse pointer-events-none opacity-40 text-2xl">
          🌴
        </div>
      </div>

      {/* Floating Center Notification Delta Toast */}
      {floatingToast && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
          <div className="px-5 py-2 rounded-full backdrop-blur-xl bg-slate-900/90 border border-emerald-500/50 shadow-2xl text-base font-extrabold tracking-wide">
            <span className={floatingToast.color}>{floatingToast.message}</span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* LAYER 2: FOREGROUND 2D HEAD-UP DISPLAY (HUD)              */}
      {/* ========================================================= */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between pointer-events-none p-3 md:p-6">
        {/* ========================================================= */}
        {/* SECTION A: TOP STATUS HEADER (THE SURVIVAL BARS)          */}
        {/* ========================================================= */}
        <header className="pointer-events-auto w-full max-w-7xl mx-auto rounded-2xl md:rounded-3xl backdrop-blur-xl bg-slate-900/85 border border-emerald-500/30 shadow-2xl p-3 md:p-4 transition-all">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3 md:gap-4">
            {/* Top Left: Logo, Time, Day, & Wallet */}
            <div className="w-full lg:w-auto flex flex-wrap items-center justify-between lg:justify-start gap-3">
              {/* Brand Title */}
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/30 font-black">
                  🌱
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-black tracking-tight text-white flex items-center gap-1">
                    FUNAAB <span className="text-emerald-400">LIFE</span>
                  </h1>
                  <p className="text-[10px] md:text-xs font-semibold text-slate-400">
                    Day {stats.day} • {stats.timeSlot} ☀️
                  </p>
                </div>
              </div>

              {/* Wallet Pill Badge */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-emerald-500/40 shadow-inner">
                <span className="text-xl">💰</span>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Pocket Balance</div>
                  <div className="text-base md:text-lg font-black text-emerald-400 tracking-tight">
                    ₦{stats.wallet.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Class Status Badge */}
              <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-extrabold ${studentStatus.color}`}>
                <span>{studentStatus.title}</span>
              </div>

              {/* Map Toggle Button */}
              <button
                onClick={() => setShowFullMapModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-black text-emerald-400 border border-slate-700 active:scale-95 transition-all shadow-md"
              >
                <span>🗺️</span>
                <span className="hidden sm:inline">Open</span> Map
              </button>
            </div>

            {/* Top Right: Status Bars Grid (Energy, Hunger, Sanity, Social) */}
            <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3 flex-1 lg:max-w-2xl">
              {/* ⚡ ENERGY */}
              <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span className="flex items-center gap-1 text-slate-300">
                    <span>⚡</span> Energy
                  </span>
                  <span className="text-emerald-400 font-extrabold">{stats.energy}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${stats.energy}%` }}
                    className={`h-full transition-all duration-300 ${getBarColor(stats.energy)}`}
                  />
                </div>
              </div>

              {/* 🍔 HUNGER */}
              <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span className="flex items-center gap-1 text-slate-300">
                    <span>🍔</span> Hunger
                  </span>
                  <span className="text-amber-400 font-extrabold">{stats.hunger}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${stats.hunger}%` }}
                    className={`h-full transition-all duration-300 ${getBarColor(stats.hunger)}`}
                  />
                </div>
              </div>

              {/* 🧠 SANITY */}
              <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span className="flex items-center gap-1 text-slate-300">
                    <span>🧠</span> Sanity
                  </span>
                  <span className="text-purple-400 font-extrabold">{stats.sanity}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${stats.sanity}%` }}
                    className={`h-full transition-all duration-300 ${getBarColor(stats.sanity)}`}
                  />
                </div>
              </div>

              {/* 🤝 SOCIAL */}
              <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span className="flex items-center gap-1 text-slate-300">
                    <span>🤝</span> Social
                  </span>
                  <span className="text-teal-400 font-extrabold">{stats.social}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${stats.social}%` }}
                    className="h-full bg-teal-500 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ========================================================= */}
        {/* SECTION B: DYNAMIC ACTIVITY LOGGER (THE LIVE FEED TICKER) */}
        {/* ========================================================= */}
        <div className="pointer-events-auto my-auto w-full max-w-sm hidden md:block">
          <div className="backdrop-blur-xl bg-slate-900/85 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-72">
            {/* Header */}
            <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                  Campus Live Feed
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">
                📍 {CAMPUS_LOCATIONS[stats.currentLocation].name.split(' ')[0]}
              </span>
            </div>

            {/* Rolling Activity Logs */}
            <div className="p-3 overflow-y-auto space-y-2 flex-1 scrollbar-thin scrollbar-thumb-slate-700">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-2.5 rounded-xl border text-xs leading-relaxed transition-all duration-200 ${
                    log.type === 'penalty'
                      ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                      : log.type === 'alert'
                      ? 'bg-blue-950/40 border-blue-800/60 text-blue-200'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-semibold">
                    <span>{log.timestamp}</span>
                    <span className="uppercase text-[9px] px-1 py-0.2 rounded bg-slate-800">
                      {log.type}
                    </span>
                  </div>
                  <p className="font-medium">{log.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Mini Ticker Bar (Top-Middle for small screens) */}
        <div className="pointer-events-auto md:hidden w-full my-2">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 shadow-lg flex items-center gap-2">
            <span className="text-base flex-shrink-0">📢</span>
            <p className="text-xs font-medium text-slate-300 truncate">
              {logs[0]?.text || 'Welcome to FUNAAB Life! Explore campus.'}
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION C: FLOATING ACTION DRAWER / CONTROL PANEL         */}
        {/* ========================================================= */}
        <footer className="pointer-events-auto w-full max-w-5xl mx-auto backdrop-blur-xl bg-slate-900/90 border border-slate-700/60 rounded-2xl md:rounded-3xl shadow-2xl p-3 md:p-5 transition-all">
          {/* Top Category Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 gap-1 md:gap-2 overflow-x-auto">
            {(
              [
                { id: 'move', label: 'Trek / Move', emoji: '📍' },
                { id: 'hustle', label: 'The Hustle', emoji: '💼' },
                { id: 'spend', label: 'Spend Cash', emoji: '🛒' },
                { id: 'groove', label: 'Groove & Chill', emoji: '🎉' },
              ] as const
            ).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 rounded-xl text-xs md:text-sm font-black transition-all duration-150 active:scale-95 whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800'
                  }`}
                >
                  <span className="text-base md:text-lg">{tab.emoji}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Action Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3 max-h-56 md:max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
            {GAME_ACTIONS[activeTab].map((action) => {
              const isAffordable = !action.cost || stats.wallet >= action.cost;
              const hasEnergy = !action.energyCost || stats.energy >= action.energyCost;
              const isCurrentLoc = action.targetLocation === stats.currentLocation;

              return (
                <button
                  key={action.id}
                  onClick={() => executeAction(action)}
                  disabled={isCurrentLoc}
                  className={`group relative flex flex-col justify-between items-center text-center p-3 rounded-2xl border transition-all duration-150 active:scale-95 ${
                    isCurrentLoc
                      ? 'bg-slate-800/40 border-slate-700/40 opacity-60 cursor-not-allowed'
                      : !isAffordable || !hasEnergy
                      ? 'bg-slate-950/80 border-slate-800 hover:border-rose-700/60'
                      : 'bg-slate-950/90 border-slate-800 hover:border-emerald-500/60 hover:bg-slate-900/90 shadow-md'
                  }`}
                >
                  {/* Big Top Emoji Anchor */}
                  <div className="text-3xl md:text-4xl mb-1.5 transition-transform duration-200 group-hover:scale-110">
                    {action.emoji}
                  </div>

                  {/* Punchy Title */}
                  <h3 className="text-xs md:text-sm font-black text-slate-100 tracking-tight leading-tight line-clamp-1">
                    {action.title}
                  </h3>

                  {/* Micro Description */}
                  <p className="text-[10px] md:text-xs text-slate-400 line-clamp-2 my-1 leading-snug">
                    {action.description}
                  </p>

                  {/* Cost / Effect Badge */}
                  <div className="w-full mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-center">
                    <span
                      className={`text-[10px] md:text-xs font-black px-2 py-0.5 rounded-full ${
                        isCurrentLoc
                          ? 'bg-slate-800 text-slate-400'
                          : action.reward
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                          : action.cost
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-800/50'
                          : 'bg-slate-800 text-teal-300'
                      }`}
                    >
                      {isCurrentLoc ? '📍 Current Spot' : action.effectDescription}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </footer>
      </div>

      {/* ========================================================= */}
      {/* MODAL: CUSTOM CAMPUS MAP & VISUALIZER                    */}
      {/* ========================================================= */}
      {showFullMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-6xl h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🗺️</span>
                <div>
                  <h2 className="text-base font-black text-white">FUNAAB Campus Customizer & GPS Map</h2>
                  <p className="text-xs text-slate-400">Switch styles, inspect landmarks, or view real satellite GPS data (Zero API Key)</p>
                </div>
              </div>
              <button
                onClick={() => setShowFullMapModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 w-full h-full p-2 overflow-hidden">
              <CustomCampusMap
                currentLocationId={stats.currentLocation}
                onSelectLandmark={(landmark) => {
                  // Find move action if exists
                  const moveAction = GAME_ACTIONS.move.find((m) => m.targetLocation === landmark.id);
                  if (moveAction) {
                    executeAction(moveAction);
                    setShowFullMapModal(false);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

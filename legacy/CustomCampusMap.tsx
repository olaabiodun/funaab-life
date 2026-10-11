'use client';

import React, { useState, useMemo } from 'react';
import { FUNAAB_LANDMARKS, CAMPUS_PATHS, CampusLandmark } from './campusMapData';

export type MapTheme = 'funaab_green' | 'neon_night' | 'blueprint' | 'satellite_real';

interface CustomCampusMapProps {
  currentLocationId?: string;
  onSelectLandmark?: (landmark: CampusLandmark) => void;
  interactive?: boolean;
}

export default function CustomCampusMap({
  currentLocationId = 'main_gate',
  onSelectLandmark,
  interactive = true,
}: CustomCampusMapProps) {
  const [theme, setTheme] = useState<MapTheme>('funaab_green');
  const [selectedLandmark, setSelectedLandmark] = useState<CampusLandmark | null>(
    FUNAAB_LANDMARKS.find((l) => l.id === currentLocationId) || null
  );
  const [showRoads, setShowRoads] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Theme styling presets
  const themeStyles = useMemo(() => {
    switch (theme) {
      case 'neon_night':
        return {
          bgGradient: 'from-slate-950 via-purple-950/80 to-slate-900',
          gridStroke: '#a855f7',
          roadColor: '#06b6d4',
          roadWidth: '10',
          dashColor: '#f43f5e',
          buildingBg: 'bg-slate-900/90 border-cyan-500/60 shadow-cyan-500/20 text-cyan-200',
          activeRing: 'ring-cyan-400 shadow-cyan-400/80',
        };
      case 'blueprint':
        return {
          bgGradient: 'from-blue-950 via-indigo-950 to-blue-900',
          gridStroke: '#60a5fa',
          roadColor: '#93c5fd',
          roadWidth: '8',
          dashColor: '#ffffff',
          buildingBg: 'bg-blue-900/90 border-blue-400/60 shadow-blue-500/20 text-blue-100',
          activeRing: 'ring-white shadow-blue-400/80',
        };
      case 'satellite_real':
        return {
          bgGradient: 'from-emerald-950 via-stone-900 to-slate-950',
          gridStroke: '#22c55e',
          roadColor: '#d97706',
          roadWidth: '10',
          dashColor: '#fef08a',
          buildingBg: 'bg-stone-900/90 border-amber-500/50 shadow-amber-500/20 text-amber-200',
          activeRing: 'ring-amber-400 shadow-amber-400/80',
        };
      case 'funaab_green':
      default:
        return {
          bgGradient: 'from-emerald-950/90 via-slate-900 to-green-950',
          gridStroke: '#10b981',
          roadColor: '#334155',
          roadWidth: '12',
          dashColor: '#fbbf24',
          buildingBg: 'bg-slate-900/80 border-emerald-500/40 shadow-emerald-500/20 text-emerald-100',
          activeRing: 'ring-emerald-400 shadow-emerald-400/80',
        };
    }
  }, [theme]);

  // Convert coordinate points to SVG path 'd' string
  const generatePathD = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    return d;
  };

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden rounded-3xl border border-slate-700/60 shadow-2xl bg-slate-950 select-none">
      {/* 🧭 TOP MAP CONTROL BAR */}
      <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl backdrop-blur-xl bg-slate-900/85 border border-slate-700/50 shadow-lg">
        {/* Style Preset Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider mr-1">
            🎨 Map Style:
          </span>
          <button
            onClick={() => setTheme('funaab_green')}
            className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
              theme === 'funaab_green'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🌱 FUNAAB Green
          </button>
          <button
            onClick={() => setTheme('neon_night')}
            className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
              theme === 'neon_night'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🌆 Lagos Life Neon
          </button>
          <button
            onClick={() => setTheme('blueprint')}
            className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
              theme === 'blueprint'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            📐 Blueprint
          </button>
          <button
            onClick={() => setTheme('satellite_real')}
            className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
              theme === 'satellite_real'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🌍 GPS OpenMap
          </button>
        </div>

        {/* Toggle options */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRoads(!showRoads)}
            className={`px-2 py-1 rounded-lg text-xs font-bold border ${
              showRoads ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            🛣️ Roads {showRoads ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`px-2 py-1 rounded-lg text-xs font-bold border ${
              showLabels ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            🏷️ Labels {showLabels ? 'ON' : 'OFF'}
          </button>
          {/* Zoom controls */}
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
            className="w-7 h-7 rounded-lg bg-slate-800 text-white text-xs font-bold flex items-center justify-center hover:bg-slate-700"
          >
            +
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
            className="w-7 h-7 rounded-lg bg-slate-800 text-white text-xs font-bold flex items-center justify-center hover:bg-slate-700"
          >
            -
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
          >
            Reset
          </button>
        </div>
      </div>

      {/* 🗺️ MAP CANVAS CONTAINER */}
      <div
        className="w-full h-full transition-transform duration-300 ease-out flex items-center justify-center"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        {/* IF GPS OPENMAP MODE: Live Interactive OpenStreetMap View (NO API KEY REQUIRED) */}
        {theme === 'satellite_real' ? (
          <div className="w-full h-full relative">
            <iframe
              title="FUNAAB OpenStreetMap Live"
              className="w-full h-full border-none filter contrast-125 brightness-90"
              src="https://www.openstreetmap.org/export/embed.html?bbox=3.4150%2C7.2050%2C3.4600%2C7.2350&amp;layer=mapnik&amp;marker=7.2233%2C3.4372"
            />
            {/* Watermark badge */}
            <div className="absolute bottom-4 left-4 z-10 px-3 py-1.5 rounded-xl bg-slate-900/90 text-[11px] font-bold text-amber-300 border border-amber-500/40">
              🛰️ Real GPS View: 7.2233° N, 3.4372° E (No API Key Required)
            </div>
          </div>
        ) : (
          /* VECTOR CUSTOM GAME CANVAS */
          <div className={`relative w-full h-full bg-gradient-to-br ${themeStyles.bgGradient}`}>
            {/* Background Grid Pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="campus-grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke={themeStyles.gridStroke} strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#campus-grid-pattern)" />
            </svg>

            {/* SVG Roads & Paths */}
            {showRoads && (
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full pointer-events-none"
              >
                {CAMPUS_PATHS.map((path) => (
                  <g key={path.id}>
                    {/* Asphalt outer track */}
                    <path
                      d={generatePathD(path.points)}
                      stroke={themeStyles.roadColor}
                      strokeWidth={path.type === 'boulevard' ? 3.5 : 2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    {/* Center lane dash marker */}
                    <path
                      d={generatePathD(path.points)}
                      stroke={themeStyles.dashColor}
                      strokeWidth="0.5"
                      strokeDasharray="1.5 1.5"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.8"
                    />
                  </g>
                ))}
              </svg>
            )}

            {/* Landmark Pins & Buildings */}
            {FUNAAB_LANDMARKS.map((landmark) => {
              const isCurrent = landmark.id === currentLocationId;
              const isSelected = selectedLandmark?.id === landmark.id;

              return (
                <div
                  key={landmark.id}
                  style={{
                    left: `${landmark.canvas.x}%`,
                    top: `${landmark.canvas.y}%`,
                  }}
                  onClick={() => {
                    if (interactive) {
                      setSelectedLandmark(landmark);
                      onSelectLandmark?.(landmark);
                    }
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group transition-transform duration-200 hover:scale-115 active:scale-95"
                >
                  <div
                    className={`flex flex-col items-center p-2 rounded-2xl backdrop-blur-md border transition-all duration-300 ${
                      themeStyles.buildingBg
                    } ${
                      isCurrent
                        ? `ring-4 ${themeStyles.activeRing} scale-110 shadow-2xl`
                        : isSelected
                        ? 'ring-2 ring-white scale-105'
                        : 'hover:border-slate-400'
                    }`}
                  >
                    {/* Icon & Pulse Beacon */}
                    <div className="relative text-2xl md:text-3xl">
                      {landmark.emoji}
                      {isCurrent && (
                        <span className="absolute -top-2 -right-2 flex h-3.5 w-3.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-950"></span>
                        </span>
                      )}
                    </div>

                    {/* Landmark Label */}
                    {showLabels && (
                      <div className="mt-1 text-center whitespace-nowrap px-2 py-0.5 rounded-full bg-slate-950/80 border border-slate-700/60 shadow-sm">
                        <span className="text-[10px] md:text-xs font-black tracking-tight">
                          {landmark.shortName}
                        </span>
                        {isCurrent && (
                          <span className="ml-1 text-[8px] font-extrabold text-emerald-400 bg-emerald-950/80 px-1 py-0.2 rounded">
                            YOU
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🔍 BOTTOM-RIGHT INSPECTOR DRAWER */}
      {selectedLandmark && theme !== 'satellite_real' && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-30 p-4 rounded-2xl backdrop-blur-2xl bg-slate-900/95 border border-slate-700/70 shadow-2xl transition-all">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl">{selectedLandmark.emoji}</span>
              <div>
                <h3 className="text-sm md:text-base font-black text-white leading-tight">
                  {selectedLandmark.name}
                </h3>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  {selectedLandmark.category} • GPS: {selectedLandmark.gps.lat.toFixed(4)}°N, {selectedLandmark.gps.lng.toFixed(4)}°E
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedLandmark(null)}
              className="text-slate-400 hover:text-white text-xs font-bold p-1"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-300 mt-2 font-medium leading-relaxed">
            {selectedLandmark.description}
          </p>

          <div className="mt-2.5 pt-2.5 border-t border-slate-800 flex flex-wrap gap-1.5">
            {selectedLandmark.popularActivities.map((act, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700"
              >
                ⚡ {act}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Real-world coordinates and normalized game coordinates for FUNAAB (Federal University of Agriculture, Abeokuta)
// Latitude: ~7.2233° N, Longitude: ~3.4372° E

export interface CampusLandmark {
  id: string;
  name: string;
  shortName: string;
  category: 'academic' | 'admin' | 'recreation' | 'transport' | 'residential' | 'commercial';
  emoji: string;
  // Real world GPS
  gps: { lat: number; lng: number };
  // Normalized 2D canvas coordinates (0% to 100% of game viewport)
  canvas: { x: number; y: number };
  // Visual dimensions for vector building blocks
  dimensions?: { width: number; height: number };
  description: string;
  popularActivities: string[];
}

export interface CampusPath {
  id: string;
  name: string;
  type: 'boulevard' | 'road' | 'trail';
  points: { x: number; y: number }[]; // Canvas coordinates
}

// 🏛️ Actual landmarks on the FUNAAB Alabata campus
export const FUNAAB_LANDMARKS: CampusLandmark[] = [
  {
    id: 'main_gate',
    name: 'FUNAAB Main Ceremonial Gate',
    shortName: 'Main Gate',
    category: 'transport',
    emoji: '🏛️',
    gps: { lat: 7.2145, lng: 3.4285 },
    canvas: { x: 15, y: 82 },
    dimensions: { width: 50, height: 35 },
    description: 'The monumental entrance archway connecting Alabata Road to FUNAAB campus.',
    popularActivities: ['Board Shuttle', 'Meet Bikers', 'Alight from Camp Cab'],
  },
  {
    id: 'senate_building',
    name: 'Mahmood Yakubu Senate Building',
    shortName: 'Senate Building',
    category: 'admin',
    emoji: '🏢',
    gps: { lat: 7.2225, lng: 3.4355 },
    canvas: { x: 38, y: 55 },
    dimensions: { width: 60, height: 45 },
    description: 'The iconic glass-and-marble administrative headquarters of the Vice-Chancellor.',
    popularActivities: ['Submit Clearance', 'Meet VC Delegations', 'Take Matric Photos'],
  },
  {
    id: 'ceremonial_building',
    name: 'Ceremonial Building & Hall',
    shortName: 'Ceremonial Bldg',
    category: 'admin',
    emoji: '🏛️',
    gps: { lat: 7.2218, lng: 3.4370 },
    canvas: { x: 46, y: 60 },
    dimensions: { width: 55, height: 40 },
    description: 'Convocation arena, student induction ground, and huge auditorium.',
    popularActivities: ['Attend Orientation', 'Convocation', 'Student Awards'],
  },
  {
    id: 'jao_theatres',
    name: 'JAO 1, 2 & 3 Lecture Theatres',
    shortName: 'JAO Complex',
    category: 'academic',
    emoji: '🏫',
    gps: { lat: 7.2240, lng: 3.4385 },
    canvas: { x: 50, y: 40 },
    dimensions: { width: 70, height: 45 },
    description: 'The central lecture complex where large faculty lectures and tests happen.',
    popularActivities: ['GNS 101 Lecture', 'Fight for Front Row', 'Sign Attendance'],
  },
  {
    id: 'colamrud',
    name: 'College of Agric Management (COLAMRUD)',
    shortName: 'COLAMRUD',
    category: 'academic',
    emoji: '📊',
    gps: { lat: 7.2260, lng: 3.4410 },
    canvas: { x: 62, y: 32 },
    dimensions: { width: 50, height: 35 },
    description: 'Agricultural economics and rural sociology departments.',
    popularActivities: ['Photocopy Handouts', 'Submit Farm Records', 'Meet Lecturers'],
  },
  {
    id: 'coleng',
    name: 'College of Engineering (COLENG)',
    shortName: 'COLENG',
    category: 'academic',
    emoji: '⚙️',
    gps: { lat: 7.2275, lng: 3.4360 },
    canvas: { x: 42, y: 25 },
    dimensions: { width: 55, height: 40 },
    description: 'Mechanical, Mechatronics, Civil, and Electrical engineering workshops.',
    popularActivities: ['Lab Experiments', 'CAD Design', 'Workshop Practice'],
  },
  {
    id: 'colplant_colvet',
    name: 'COLPLANT & Veterinary Medicine Complex',
    shortName: 'COLPLANT/COLVET',
    category: 'academic',
    emoji: '🌿',
    gps: { lat: 7.2290, lng: 3.4430 },
    canvas: { x: 72, y: 22 },
    dimensions: { width: 60, height: 40 },
    description: 'Plant science labs, veterinary clinics, and greenhouse nurseries.',
    popularActivities: ['Botany Practical', 'Pet Treatment', 'Plant Sampling'],
  },
  {
    id: 'motion_ground',
    name: 'Motion Ground Sports Complex',
    shortName: 'Motion Ground',
    category: 'recreation',
    emoji: '🏟️',
    gps: { lat: 7.2205, lng: 3.4420 },
    canvas: { x: 58, y: 72 },
    dimensions: { width: 75, height: 50 },
    description: 'Football stadium, running tracks, SUG election mega rallies, and festival grounds.',
    popularActivities: ['Dean Cup Match', 'Evening Jogging', 'Rally Campaigns'],
  },
  {
    id: 'sub_buka',
    name: 'SUB Buka & Student Union Building',
    shortName: 'SUB & Bukas',
    category: 'commercial',
    emoji: '🍲',
    gps: { lat: 7.2215, lng: 3.4405 },
    canvas: { x: 52, y: 66 },
    dimensions: { width: 45, height: 35 },
    description: 'Food haven with Amala spots, Mama Put, POS points, and Union Offices.',
    popularActivities: ['Eat Hot Amala', 'Charge Phones', 'Hang Out with Friends'],
  },
  {
    id: 'zoo_park',
    name: 'FUNAAB Zoo & Ecological Park',
    shortName: 'Zoo Park',
    category: 'recreation',
    emoji: '🦁',
    gps: { lat: 7.2209, lng: 3.4466 },
    canvas: { x: 82, y: 68 },
    dimensions: { width: 65, height: 45 },
    description: 'Lush natural reserve housing lions, primates, peacocks, and picnic spots.',
    popularActivities: ['Sightseeing Tour', 'Quiet Picnic', 'Nature Walk'],
  },
  {
    id: 'camp_junction',
    name: 'Camp Junction & Student Market',
    shortName: 'Camp Junction',
    category: 'commercial',
    emoji: '🏡',
    gps: { lat: 7.2080, lng: 3.4210 },
    canvas: { x: 10, y: 32 },
    dimensions: { width: 60, height: 40 },
    description: 'Off-campus student town filled with restaurants, nightlife, and supermarkets.',
    popularActivities: ['Buy Provisions', 'Night Clubbing', 'Off-Campus Chilling'],
  },
  {
    id: 'isolu_hostels',
    name: 'Isolu Student Hostels & Residential',
    shortName: 'Isolu Hostels',
    category: 'residential',
    emoji: '🛏️',
    gps: { lat: 7.2180, lng: 3.4520 },
    canvas: { x: 85, y: 38 },
    dimensions: { width: 65, height: 45 },
    description: 'Massive student hostel clusters with generator noise, street food, and study groups.',
    popularActivities: ['Rest in Room', 'Cook Indomie', 'Late-night Gist'],
  },
  {
    id: 'health_centre',
    name: 'University Health Centre',
    shortName: 'Health Centre',
    category: 'admin',
    emoji: '🏥',
    gps: { lat: 7.2230, lng: 3.4445 },
    canvas: { x: 74, y: 55 },
    dimensions: { width: 45, height: 35 },
    description: 'Campus clinic and emergency ward for students and staff.',
    popularActivities: ['Collect Paracetamol', 'Medical Certificate', 'First Aid'],
  },
];

// 🛣️ Core campus arterial routes connecting landmarks
export const CAMPUS_PATHS: CampusPath[] = [
  {
    id: 'gate_to_senate',
    name: 'Ceremonial Boulevard',
    type: 'boulevard',
    points: [
      { x: 15, y: 82 },
      { x: 26, y: 68 },
      { x: 38, y: 55 },
    ],
  },
  {
    id: 'senate_to_ceremonial',
    name: 'Senate Crescent',
    type: 'road',
    points: [
      { x: 38, y: 55 },
      { x: 46, y: 60 },
      { x: 52, y: 66 },
    ],
  },
  {
    id: 'senate_to_jao',
    name: 'Academic Way',
    type: 'road',
    points: [
      { x: 38, y: 55 },
      { x: 44, y: 46 },
      { x: 50, y: 40 },
    ],
  },
  {
    id: 'jao_to_colamrud',
    name: 'Colleges Drive',
    type: 'road',
    points: [
      { x: 50, y: 40 },
      { x: 56, y: 35 },
      { x: 62, y: 32 },
      { x: 72, y: 22 },
    ],
  },
  {
    id: 'jao_to_coleng',
    name: 'Technology Link',
    type: 'road',
    points: [
      { x: 50, y: 40 },
      { x: 45, y: 32 },
      { x: 42, y: 25 },
    ],
  },
  {
    id: 'sub_to_motion',
    name: 'Sports Link',
    type: 'road',
    points: [
      { x: 52, y: 66 },
      { x: 58, y: 72 },
    ],
  },
  {
    id: 'motion_to_zoo',
    name: 'Ecological Trail',
    type: 'trail',
    points: [
      { x: 58, y: 72 },
      { x: 70, y: 70 },
      { x: 82, y: 68 },
    ],
  },
  {
    id: 'gate_to_camp',
    name: 'Alabata Highway Outbound',
    type: 'boulevard',
    points: [
      { x: 15, y: 82 },
      { x: 11, y: 58 },
      { x: 10, y: 32 },
    ],
  },
  {
    id: 'academic_to_isolu',
    name: 'Hostel Bypass Road',
    type: 'road',
    points: [
      { x: 62, y: 32 },
      { x: 74, y: 34 },
      { x: 85, y: 38 },
    ],
  },
  {
    id: 'motion_to_clinic',
    name: 'Health Way',
    type: 'road',
    points: [
      { x: 58, y: 72 },
      { x: 68, y: 63 },
      { x: 74, y: 55 },
    ],
  },
];

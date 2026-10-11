// Comprehensive student character traits, departments, and timetable data

export interface StudentTrait {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  desc: string;
  startingCash: number;
  bonus: string;
}

export const STUDENT_TRAITS: StudentTrait[] = [
  {
    id: 'scholar',
    name: 'First-Class Aspirant',
    emoji: '🤓',
    tagline: 'Bookworm & 5.0 CGPA Chaser',
    desc: 'Starts with higher GPA baseline (+0.5) and earns +25% Academic XP from lectures and reading.',
    startingCash: 5000,
    bonus: '+0.5 Start GPA, +25% Study XP',
  },
  {
    id: 'hustler',
    name: 'Alaba / POS Hustler',
    emoji: '💼',
    tagline: 'Sapa is not your portion',
    desc: 'Starts with an extra ₦5,000 allowance and earns +30% cash rewards from campus shifts.',
    startingCash: 10000,
    bonus: '+₦5,000 Start Capital, +30% Job Pay',
  },
  {
    id: 'politician',
    name: 'Comrade / SUG Aspirant',
    emoji: '✊',
    tagline: 'Greatest Nigerian Students!',
    desc: 'Starts with high social presence (+30 Social) and receives discounts on campus shuttle rides.',
    startingCash: 6000,
    bonus: '+30 Social, Free Shuttle Discretion',
  },
  {
    id: 'baller',
    name: 'Gentle Baller',
    emoji: '😎',
    tagline: 'Vibes, Chilling & Soft Life',
    desc: 'Hostel fan never goes off. Higher starting energy and sanity resilience against exam anxiety.',
    startingCash: 7500,
    bonus: '+20 Max Energy, Slower Sanity Drain',
  },
];

export interface Department {
  id: string;
  name: string;
  college: string;
  emoji: string;
  baseLectureHall: string; // e.g. jao, coleng, colamrud
}

export const DEPARTMENTS: Department[] = [
  { id: 'csc', name: 'Computer Science', college: 'COLPHYS', emoji: '💻', baseLectureHall: 'ict' },
  { id: 'mch', name: 'Mechanical Engineering', college: 'COLENG', emoji: '⚙️', baseLectureHall: 'coleng' },
  { id: 'age', name: 'Agricultural Economics', college: 'COLAMRUD', emoji: '📊', baseLectureHall: 'colamrud' },
  { id: 'vet', name: 'Veterinary Medicine', college: 'COLVET', emoji: '🐕', baseLectureHall: 'colplant' },
  { id: 'bio', name: 'Biochemistry', college: 'COLBIOS', emoji: '🧬', baseLectureHall: 'jao' },
  { id: 'fhe', name: 'Food Science & Tech', college: 'COLFHEC', emoji: '🥘', baseLectureHall: 'sub' },
];

export interface ClassSchedule {
  id: string;
  code: string;
  title: string;
  placeId: string;
  startMinutes: number; // e.g. 8 * 60 = 480
  durationMinutes: number; // e.g. 90
  unit: number;
}

export const CAMPUS_SCHEDULE: ClassSchedule[] = [
  { id: 'c1', code: 'GNS 101', title: 'Use of English & Library', placeId: 'jao', startMinutes: 8 * 60, durationMinutes: 90, unit: 2 },
  { id: 'c2', code: 'MTH 101', title: 'Elementary Mathematics', placeId: 'ict', startMinutes: 10 * 60 + 30, durationMinutes: 90, unit: 3 },
  { id: 'c3', code: 'CHM 101', title: 'General Physical Chemistry', placeId: 'coleng', startMinutes: 13 * 60, durationMinutes: 90, unit: 3 },
  { id: 'c4', code: 'BIO 101', title: 'General Biology Practical', placeId: 'colplant', startMinutes: 15 * 60, durationMinutes: 90, unit: 2 },
];

export interface CampusRumor {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  text: string;
  likes: number;
  tag: string;
}

export const CAMPUS_YARNS: CampusRumor[] = [
  {
    id: 'y1',
    author: 'SUG Public Relations',
    handle: '@funaab_sug',
    avatar: '📢',
    text: '🚨 Notice: The price of campus shuttle remains strictly ₦150! Any driver charging ₦200 should be reported to the security post at Gate.',
    likes: 421,
    tag: 'Official',
  },
  {
    id: 'y2',
    author: 'Tolu from JAO',
    handle: '@tolu_cbt',
    avatar: '👀',
    text: 'If you are having GNS 101 this morning, make sure you reach JAO before 7:45am. Hall 2 AC is actually working today, miracles do happen! 🙏',
    likes: 218,
    tag: 'Gist',
  },
  {
    id: 'y3',
    author: 'Iya Basira Kitchen',
    handle: '@amala_junction',
    avatar: '🍲',
    text: 'Fresh goat meat and piping hot Amala just landed at SUB buka. Come before 1pm before course reps buy everything!',
    likes: 312,
    tag: 'Food',
  },
  {
    id: 'y4',
    author: 'Campus Gist Hub',
    handle: '@funaab_yarns',
    avatar: '🔥',
    text: 'Dean Cup Semi-Finals happening at Motion Ground by 4:00 PM today! COLENG vs COLAMRUD. Free pure water for the first 50 supporters!',
    likes: 540,
    tag: 'Sports',
  },
];

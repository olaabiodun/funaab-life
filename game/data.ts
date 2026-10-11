// ============================================================
// CAMPUS LIFE — game content, laid out from the official FUNAAB MAP GUIDE.
// Each place has `px,py` = its pin position on the guide image (665 x 462).
// world position = (px-330)*SCALE , (py-230)*SCALE   (world.ts then nudges buildings off the roads)
// ============================================================

export interface Fx {
  cash?: number;
  energy?: number;
  hunger?: number;
  sanity?: number;
  social?: number;
  xp?: number;
}

export interface Activity extends Fx {
  id: string;
  label: string;
  emoji: string;
  cost?: number;
  reward?: number;
  minutes: number;
  tag?: 'lecture' | 'meal' | 'work' | 'hang';
  log: string;
}

export type Kind = 'Academics' | 'Admin' | 'Food' | 'Faith' | 'Sports' | 'Hostels' | 'Transport' | 'Health' | 'Nature' | 'Shop';

export interface Place {
  id: string;
  name: string;
  short: string;
  emoji: string;
  kind: Kind;
  px: number;
  py: number;
  pos: [number, number];
  sc: number; // model scale
  h: number; // pin height (before scale)
  style?: [number, number, number]; // generic building w,d,h
  blurb: string;
  gist: string;
  activities: Activity[];
  major: boolean; // has a hand-built model / always labelled
  rot?: number; // y-rotation so the entrance faces the road (set by world.ts)
}

const SCALE = 1;
export const px2w = (px: number, py: number): [number, number] => [(px - 330) * SCALE, (py - 230) * SCALE];

// ---------- default activities by kind ----------
function defaults(kind: Kind, id: string, short: string): Activity[] {
  switch (kind) {
    case 'Academics':
      return [
        { id: `${id}_class`, label: `Attend class at ${short}`, emoji: '📚', minutes: 110, energy: -26, hunger: -14, sanity: -7, xp: 24, tag: 'lecture', log: `📚 You sat through a full lecture at ${short}. Notes: 2 pages. Understanding: 1%.` },
        { id: `${id}_study`, label: 'Quiet study session', emoji: '🧠', minutes: 90, energy: -14, sanity: -4, xp: 16, log: `🧠 Deep focus at ${short}. The semester feels slightly less scary.` },
      ];
    case 'Admin':
      return [
        { id: `${id}_paper`, label: 'Handle paperwork', emoji: '📝', cost: 200, minutes: 70, energy: -12, sanity: -6, xp: 12, log: `📝 You queued at ${short} for an hour. Stamp acquired.` },
        { id: `${id}_gist`, label: 'Catch up with course mates', emoji: '🗣️', minutes: 30, social: 10, sanity: 4, tag: 'hang', log: `🗣️ Gist session outside ${short}. Everyone is broke. Everyone is smiling.` },
      ];
    case 'Hostels':
      return [
        { id: `${id}_sleep`, label: 'Sleep under the fan', emoji: '😴', minutes: 420, energy: 55, sanity: 20, hunger: -22, log: '😴 You slept like a baby. NEPA was kind tonight.' },
        { id: `${id}_cook`, label: 'Cook pepper Indomie', emoji: '🍜', cost: 350, minutes: 25, hunger: 30, energy: 8, tag: 'meal', log: '🍜 Pepper Indomie with egg. Five-star hostel dining.' },
        { id: `${id}_gist`, label: 'Gist with roommates', emoji: '🛋️', minutes: 60, social: 22, sanity: 10, tag: 'hang', log: '🛋️ Roommates gisted till someone fell asleep mid-sentence.' },
      ];
    case 'Food':
      return [
        { id: `${id}_eat`, label: 'Eat a proper meal', emoji: '🍲', cost: 900, minutes: 30, hunger: 50, sanity: 12, energy: 8, tag: 'meal', log: '🍲 Hot food, real portions. Life is good!' },
      ];
    case 'Sports':
      return [
        { id: `${id}_work`, label: 'Workout session', emoji: '🏋️', minutes: 70, energy: -22, hunger: -14, sanity: 12, social: 8, log: '🏋️ You lifted things and put them down. Gains pending.' },
        { id: `${id}_play`, label: 'Pick-up game', emoji: '🏀', minutes: 80, energy: -20, social: 22, sanity: 8, tag: 'hang', log: '🏀 A friendly game that became not-so-friendly.' },
      ];
    case 'Faith':
      return [{ id: `${id}_pray`, label: 'Quiet prayer', emoji: '🙏', minutes: 40, sanity: 22, social: 6, log: '🙏 Peace of mind. For at least a few hours.' }];
    case 'Health':
      return [{ id: `${id}_rest`, label: 'Rest & check-up', emoji: '🛌', cost: 400, minutes: 150, energy: 40, sanity: 15, log: '🛌 A nurse said "you are just tired". Obviously.' }];
    case 'Nature':
      return [{ id: `${id}_walk`, label: 'Peaceful nature walk', emoji: '🌳', minutes: 60, sanity: 25, energy: -6, log: '🌳 Birds, shade and zero assignments.' }];
    case 'Shop':
      return [
        { id: `${id}_snack`, label: 'Window shop & snack', emoji: '🥤', cost: 400, minutes: 25, hunger: 18, sanity: 6, tag: 'meal', log: '🥤 You bought one thing and looked at ten.' },
      ];
    case 'Transport':
    default:
      return [{ id: `${id}_chat`, label: 'Chat with the drivers', emoji: '🚕', minutes: 25, social: 8, sanity: 4, log: '🚕 Drivers shared gist about the price of fuel.' }];
  }
}

const GISTS: Record<Kind, string[]> = {
  Academics: ['"If you reach late, you will receive the lecture through the window."', '"Everyone here is one assignment away from a breakdown."', '"The AC works only when the lecturer is absent."'],
  Admin: ['"Seven offices, six signatures, one missing stamp."', '"Come back tomorrow" is the official motto.'],
  Hostels: ['"The generator hums till 11pm, then the gist begins."', '"Noodles are a food group here."'],
  Food: ['"Hot food cures all carryover depression."'],
  Sports: ['"More people watch than play."'],
  Faith: ['"A quiet corner when the timetable drops."'],
  Health: ['"Two paracetamol and drink water."'],
  Nature: ['"The only place without Wi-Fi anxiety."'],
  Shop: ['"Everything is ₦200 more than yesterday."'],
  Transport: ['"Hold your exact change!"'],
};

const STYLE: Partial<Record<Kind, [number, number, number]>> = {
  Academics: [13, 8, 7],
  Admin: [11, 8, 8],
  Hostels: [14, 8, 8],
  Shop: [10, 6, 5],
  Sports: [14, 9, 5],
  Transport: [10, 6, 4],
};

function mk(
  id: string, name: string, short: string, emoji: string, kind: Kind, px: number, py: number,
  extra: Partial<Place> = {},
): Place {
  const style = extra.style || STYLE[kind] || [10, 7, 6];
  const gists = GISTS[kind];
  return {
    id, name, short, emoji, kind, px, py,
    pos: px2w(px, py),
    sc: extra.activities ? 0.72 : 1,
    h: style[2] + 3,
    style,
    blurb: `${name} — a well-known spot on the FUNAAB campus map.`,
    gist: gists[(id.length + px) % gists.length],
    activities: defaults(kind, id, short),
    major: !!extra.activities,
    ...extra,
  };
}

export const PLACES: Place[] = [
  // ---------- hand-built landmarks (custom models + activities) ----------
  mk('main_gate', 'School Gate & Shuttle Park', 'Main Gate', '🏛️', 'Transport', 465, 385, {
    sc: 0.85, h: 15, blurb: 'The ceremonial entrance archway, taxi park and shuttle queue.',
    gist: '"Hold your exact ₦150 change before you enter the shuttle!"',
    activities: [
      { id: 'gate_conduct', label: 'Shuttle conductor shift', emoji: '🚐', reward: 1500, minutes: 120, energy: -25, hunger: -15, tag: 'work', log: '🚐 You shouted "Motion! JAO! 150 change!" all afternoon. Hustle pays.' },
      { id: 'gate_snack', label: 'Buy suya from the bikers', emoji: '🍢', cost: 400, minutes: 15, hunger: 20, sanity: 4, tag: 'meal', log: '🍢 Spicy suya at the gate. Onions free, sapa not.' },
    ],
  }),
  mk('camp', 'Camp Junction & POS Hub', 'Camp', '🏘️', 'Transport', 60, 350, {
    sc: 0.8, h: 11, blurb: 'Student town with POS stands, provision shops and loud generators.',
    gist: '"Traffic at the Camp roundabout at 5pm is a spiritual experience."',
    activities: [
      { id: 'camp_pos', label: 'Withdraw at POS (₦100 fee)', emoji: '💳', cost: 100, reward: 3000, minutes: 20, energy: -4, log: '💳 POS guy charged ₦100 and said "network no good" twice.' },
      { id: 'camp_prov', label: 'Buy Indomie & provisions', emoji: '🍜', cost: 900, minutes: 25, hunger: 25, sanity: 6, tag: 'meal', log: '🍜 Stocked the hostel locker. You are now a landlord of noodles.' },
    ],
  }),
  mk('chapel', 'University Church', 'Church', '⛪', 'Faith', 428, 358, {
    sc: 0.8, h: 18, blurb: 'Serene church on the main boulevard near the gate.',
    gist: '"Quiet sanctuary the moment the exam timetable drops."',
    activities: [
      { id: 'chapel_fellow', label: 'Join fellowship service', emoji: '🙏', minutes: 90, sanity: 25, social: 12, energy: -6, xp: 8, tag: 'hang', log: '🙏 You sang, prayed and prayed some more for a B in MTH 101.' },
      { id: 'chapel_quiet', label: 'Quiet reflection', emoji: '🕊️', minutes: 30, sanity: 14, log: '🕊️ Ten quiet minutes. The semester suddenly feels smaller.' },
    ],
  }),
  mk('senate', 'Senate Building', 'Senate', '🏢', 'Admin', 485, 185, {
    sc: 0.75, h: 30, blurb: 'The glass tower of the VC, registry and clearance units.',
    gist: '"Matric photos happen here. Clearance dreams die here."',
    activities: [
      { id: 'senate_clear', label: 'Process clearance form', emoji: '📝', cost: 500, minutes: 90, energy: -18, sanity: -10, xp: 25, log: '📝 Seven offices, six signatures, one missing stamp. Classic.' },
      { id: 'senate_photo', label: 'Matriculation photo shoot', emoji: '📸', cost: 300, minutes: 30, social: 14, sanity: 8, log: '📸 You posed in front of the tower. The caption writes itself.' },
    ],
  }),
  mk('ceremonial', 'Ceremonial Building', 'Ceremonial', '🎭', 'Admin', 500, 368, {
    sc: 0.7, h: 20, blurb: 'Dome-topped auditorium for orientation, SUG congress and convocation.',
    gist: '"Air-conditioned for VIPs. Everyone else gets a hand fan."',
    activities: [
      { id: 'cer_orient', label: 'Attend orientation talk', emoji: '🎤', minutes: 120, energy: -14, sanity: 6, xp: 20, social: 8, log: '🎤 You learned 14 rules and ignored 13 of them.' },
      { id: 'cer_party', label: 'Crash a faculty dinner', emoji: '🪩', cost: 1000, minutes: 150, social: 38, energy: -20, hunger: 25, tag: 'hang', log: '🪩 You crashed the dinner and left with two takeaway packs!' },
    ],
  }),
  mk('ict', 'ICTREC Centre & CBT Hall', 'ICTREC', '🖥️', 'Academics', 518, 268, {
    sc: 0.7, h: 14, blurb: 'Computer lab for CBT exams, portal registration and printing.',
    gist: '"100 questions in 30 minutes decide your whole GPA."',
    activities: [
      { id: 'ict_reg', label: 'Course registration help desk', emoji: '🧑‍💻', reward: 2200, minutes: 120, energy: -20, sanity: -8, tag: 'work', log: '🧑‍💻 You rescued 14 freshers from "invalid matric number" errors.' },
      { id: 'ict_cbt', label: 'Take a CBT practice test', emoji: '🧠', minutes: 60, energy: -12, sanity: -6, xp: 30, log: '🧠 Practice test done. You blinked and time was up.' },
    ],
  }),
  mk('jao', 'JAO Lecture Theatres', 'JAO', '🎓', 'Academics', 557, 130, {
    sc: 0.62, h: 14, blurb: 'Big lecture halls where GNS, CHM, PHY and BIO live.',
    gist: '"Reach after 7:30am and you will receive the lecture through the window."',
    activities: [
      { id: 'jao_lecture', label: 'Attend 2-hour lecture', emoji: '📚', minutes: 120, energy: -30, hunger: -15, sanity: -8, xp: 28, tag: 'lecture', log: '📚 You fought for a front-row seat. Your brain is frying! (+Academic XP)' },
      { id: 'jao_sign', label: 'Sign attendance sheet', emoji: '✍️', minutes: 10, energy: -3, xp: 6, log: '✍️ You signed for yourself and two friends. Ethics pending.' },
    ],
  }),
  mk('coleng', 'College of Engineering (COLENG)', 'COLENG', '⚙️', 'Academics', 380, 72, {
    sc: 0.6, h: 15, blurb: 'Workshops, CAD studios and machine labs with a tall chimney.',
    gist: '"Everybody here carries a drawing board and a lab coat."',
    activities: [
      { id: 'eng_cad', label: 'CAD workshop practical', emoji: '📐', minutes: 120, energy: -26, sanity: -8, xp: 30, tag: 'lecture', log: '📐 Your isometric drawing finally looks like an isometric drawing.' },
      { id: 'eng_repair', label: 'Fix a generator for ₦', emoji: '🔧', reward: 1800, minutes: 100, energy: -22, hunger: -12, tag: 'work', log: '🔧 You revived the hostel generator. You are now a campus legend.' },
    ],
  }),
  mk('colamrud', 'COLAMRUD (Agric Management)', 'COLAMRUD', '📊', 'Academics', 410, 95, {
    sc: 0.58, h: 14, blurb: 'Agric economics, extension and the busiest photocopy corner.',
    gist: '"The spiral-binding machine never sleeps."',
    activities: [
      { id: 'amr_print', label: 'Photocopy & binding gig', emoji: '📄', reward: 1600, minutes: 100, energy: -16, hunger: -10, tag: 'work', log: '📄 120 copies of GNS 101 past questions. The machine jammed twice.' },
      { id: 'amr_lecture', label: 'Attend farm-economics class', emoji: '📈', minutes: 100, energy: -22, sanity: -6, xp: 24, tag: 'lecture', log: '📈 You calculated the profit margin of a tomato you never planted.' },
    ],
  }),
  mk('colplant', 'COLPLANT & Greenhouses', 'COLPLANT', '🌿', 'Academics', 550, 170, {
    sc: 0.62, h: 12, blurb: 'Greenhouses, crop plots and the teaching vet clinic.',
    gist: '"Smells like fresh topsoil and fear of Farm Year."',
    activities: [
      { id: 'plant_farm', label: 'Practical farm weeding', emoji: '🌱', minutes: 140, energy: -34, hunger: -18, xp: 22, tag: 'lecture', log: '🌱 Three hours of weeding. The cutlass won. You are tired.' },
      { id: 'plant_vet', label: 'Assist vet with a pet', emoji: '🐕', reward: 1500, minutes: 90, energy: -14, sanity: 8, tag: 'work', log: '🐕 You held a very angry goat. The vet tipped you ₦1,500.' },
    ],
  }),
  mk('colanim', 'COLANIM Farms & Bakery', 'COLANIM', '🥖', 'Food', 525, 127, {
    sc: 0.55, h: 14, blurb: 'Animal science pens plus the legendary campus bread & yoghurt.',
    gist: '"Warm bread + chilled yoghurt is a lifestyle."',
    activities: [
      { id: 'anim_bread', label: 'Buy bread & yoghurt', emoji: '🥛', cost: 800, minutes: 20, hunger: 30, energy: 12, sanity: 8, tag: 'meal', log: '🥛 Fresh warm bread and cold yoghurt. A perfect crime against sapa.' },
      { id: 'anim_feed', label: 'Feed the poultry (part-time)', emoji: '🐔', reward: 900, minutes: 60, energy: -12, log: '🐔 The chickens respect you now. Sort of.' },
    ],
  }),
  mk('sub', 'SUB — Student Union Building', 'SUB', '🍲', 'Food', 293, 100, {
    sc: 0.7, h: 12, blurb: 'Amala, jollof, mama-put stalls and the SUG secretariat.',
    gist: '"Hot amala with goat meat cures all carryover depression."',
    activities: [
      { id: 'sub_amala', label: 'Hot amala & goat meat', emoji: '🍲', cost: 1100, minutes: 30, hunger: 62, sanity: 24, energy: 8, tag: 'meal', log: '🍲 You ate hot Amala at the Buka. Life is good!' },
      { id: 'sub_rice', label: 'Jollof & fried plantain', emoji: '🍛', cost: 850, minutes: 25, hunger: 48, energy: 14, tag: 'meal', log: '🍛 Smoky party jollof and extra dodo. Iya Basira likes you.' },
      { id: 'sub_gala', label: 'Gala & Lacasera', emoji: '🥤', cost: 450, minutes: 8, hunger: 24, energy: 10, tag: 'meal', log: '🥤 Gala and Lacasera. The undefeated student combo.' },
    ],
  }),
  mk('motion', 'Motion Ground', 'Motion Ground', '🏟️', 'Sports', 448, 205, {
    sc: 0.62, h: 13, blurb: 'Football pitch, running track and SUG rallies.',
    gist: '"Dean Cup finals pull more crowd than the Champions League."',
    activities: [
      { id: 'mot_match', label: 'Play inter-faculty match', emoji: '⚽', minutes: 120, energy: -34, hunger: -22, social: 42, sanity: 14, tag: 'hang', log: '⚽ You scored a screamer. Nobody has a replay. Still counts.' },
      { id: 'mot_jog', label: 'Evening jog', emoji: '🏃', minutes: 45, energy: -12, sanity: 16, social: 5, log: '🏃 A calm jog around the track. The sunset did the rest.' },
      { id: 'mot_water', label: 'Sell pure water to fans', emoji: '💧', reward: 1000, minutes: 90, energy: -28, hunger: -18, tag: 'work', log: '💧 Ice-cold pure water sold out in 30 minutes. Hustle!' },
    ],
  }),
  mk('zoo', 'FUNAAB Zoo', 'Zoo', '🦁', 'Nature', 270, 358, {
    sc: 0.75, h: 13, blurb: 'A wildlife reserve with lions, peacocks and picnic woods.',
    gist: '"The lion roars once in a while. Everybody stops."',
    activities: [
      { id: 'zoo_tour', label: 'Wildlife tour', emoji: '🦚', cost: 500, minutes: 90, sanity: 30, energy: -8, social: 6, log: '🦚 A peacock judged your outfit. You still enjoyed the tour.' },
      { id: 'zoo_picnic', label: 'Pine-tree picnic', emoji: '🧺', cost: 300, minutes: 60, sanity: 22, hunger: 18, energy: 8, log: '🧺 Picnic under the pines. Exams? Never heard of them.' },
    ],
  }),
  mk('health', 'Health Centre', 'Health Centre', '🏥', 'Health', 428, 313, {
    sc: 0.62, h: 14, blurb: 'Clinic, pharmacy and sick bay.',
    gist: '"Two tablets of paracetamol and drink plenty of water."',
    activities: [
      { id: 'hc_rest', label: 'Check-up & bed rest', emoji: '🛌', cost: 400, minutes: 180, energy: 45, sanity: 18, hunger: -10, log: '🛌 A nurse said "you are just tired". Obviously.' },
      { id: 'hc_pills', label: 'Collect vitamins', emoji: '💊', cost: 200, minutes: 20, energy: 14, sanity: 6, log: '💊 Paracetamol and a vitamin. Medicine has spoken.' },
    ],
  }),
  mk('hostels', 'Marble Hostel', 'Marble Hostel', '🛏️', 'Hostels', 615, 250, {
    sc: 0.6, h: 15, blurb: 'Lodges, generator hum and late-night noodle stands.',
    gist: '"The "I better pass my neighbour" generator runs till 11pm."',
    activities: [
      { id: 'host_sleep', label: 'Sleep under the fan', emoji: '😴', minutes: 420, energy: 55, sanity: 20, hunger: -22, log: '😴 You slept under the ceiling fan. NEPA was kind tonight.' },
      { id: 'host_cook', label: 'Cook pepper Indomie', emoji: '🍜', cost: 350, minutes: 25, hunger: 30, energy: 8, tag: 'meal', log: '🍜 Pepper Indomie with egg. Five-star hostel dining.' },
      { id: 'host_fire', label: 'Hostel bonfire & guitar', emoji: '🪵', minutes: 120, social: 30, sanity: 18, energy: -8, tag: 'hang', log: '🪵 Burna Boy on guitar around the fire. Pure vibes.' },
    ],
  }),
  mk('mosque', 'Central Mosque', 'Mosque', '🕌', 'Faith', 428, 345, { sc: 0.8, h: 14, activities: [
    { id: 'mosque_pray', label: 'Quiet prayer', emoji: '🙏', minutes: 40, sanity: 22, social: 6, log: '🙏 Peace of mind. The call to prayer echoed across campus.' },
  ] }),

  // ---------- from the map guide (generic buildings) ----------
  mk('iyat', 'IYAT Complex', 'IYAT', '🌾', 'Academics', 418, 20),
  mk('uk_hostel', 'UK Hostel', 'UK Hostel', '🛏️', 'Hostels', 470, 17),
  mk('aud3', 'AUD 3 Lecture Hall', 'AUD 3', '🎤', 'Academics', 428, 58, { style: [14, 9, 8] }),
  mk('colerm1', 'COLERM Phase 1', 'COLERM 1', '🌍', 'Academics', 470, 98),
  mk('colerm2', 'COLERM Phase 2', 'COLERM 2', '🌍', 'Academics', 230, 205),
  mk('amrec', 'AMREC', 'AMREC', '🔬', 'Academics', 380, 108),
  mk('mp', 'MP Hall', 'MP', '🏛️', 'Academics', 355, 125, { style: [12, 9, 7] }),
  mk('old_colphy', 'Old COLPHY', 'Old COLPHY', '🧪', 'Academics', 360, 165),
  mk('colbios', 'COLBIOS', 'COLBIOS', '🧬', 'Academics', 400, 185),
  mk('colfhec', 'COLFHEC', 'COLFHEC', '🥘', 'Academics', 279, 178),
  mk('bt_lab', 'BT Lab', 'BT Lab', '🧫', 'Academics', 279, 143),
  mk('mahmud', 'Mahmud Hall', 'Mahmud', '🎓', 'Academics', 188, 170),
  mk('colcom', 'COLCOM', 'COLCOM', '💻', 'Academics', 252, 105),
  mk('pisad', 'PISAD', 'PISAD', '🌱', 'Academics', 505, 103),
  mk('agric_lab', 'Agric Lab', 'Agric Lab', '🧪', 'Academics', 540, 88),
  mk('colvet', 'COLVET', 'COLVET', '🐄', 'Academics', 597, 195),
  mk('all_lab', 'ALL LAB', 'ALL LAB', '🔬', 'Academics', 215, 258),
  mk('new_colphy', 'New COLPHY', 'New COLPHY', '🧪', 'Academics', 130, 255),
  mk('cents', 'CENTS', 'CENTS', '🏫', 'Academics', 293, 128),
  mk('annenih', 'ANNENIH', 'ANNENIH', '🏢', 'Academics', 342, 224),
  mk('pg', 'Postgraduate School', 'PG School', '🎓', 'Academics', 280, 213),
  mk('nimbe_lib', 'NIMBE Library', 'NIMBE Library', '📖', 'Academics', 450, 135, { style: [14, 10, 10] }),
  mk('wole_lib', 'Wole Soyinka Library', 'Wole Soyinka Lib.', '📚', 'Academics', 580, 335, { style: [13, 9, 9] }),
  mk('colends', 'COLENDS', 'COLENDS', '🌍', 'Academics', 572, 352),
  mk('book_shop', 'Campus Book Shop', 'Book Shop', '📘', 'Shop', 473, 268, { activities: [
    { id: 'book_notes', label: 'Buy course handouts', emoji: '📘', cost: 600, minutes: 25, xp: 18, sanity: -2, log: '📘 Handouts bought. Reading them is a separate challenge.' },
    { id: 'book_snack', label: 'Grab a snack', emoji: '🍪', cost: 300, minutes: 10, hunger: 14, sanity: 4, tag: 'meal', log: '🍪 Biscuit and a cold drink. Minimalist lunch.' },
  ], sc: 1 }),
  mk('acad', 'ACAD — Academic Office', 'ACAD', '📋', 'Admin', 515, 300),
  mk('sport_center', 'Sport Centre', 'Sport Centre', '🏋️', 'Sports', 505, 322),
  mk('man_o_war', 'Man O War', 'Man O War', '🪖', 'Admin', 390, 297),
  mk('unity', 'Unity Building', 'Unity Build', '🏢', 'Admin', 565, 258),
  mk('park', 'Car Park', 'Park', '🅿️', 'Transport', 400, 268, { style: [14, 8, 2] }),
  mk('shops', 'Campus Shops', 'Shops', '🛍️', 'Shop', 350, 265, { style: [14, 6, 5] }),
  mk('old_need_m', 'Old NEEDS Male Hostel', 'Old Male H.', '🛏️', 'Hostels', 118, 60),
  mk('old_need_f', 'Old NEEDS Female Hostel', 'Old Female H.', '🛏️', 'Hostels', 210, 58),
  mk('new_needs_m', 'New NEEDS Male Hostel', 'New Male', '🛏️', 'Hostels', 143, 95),
  mk('new_needs_f', 'New NEEDS Female Hostel', 'New Female', '🛏️', 'Hostels', 195, 95),
  mk('sug_build', 'SUG Building', 'SUG', '🗳️', 'Admin', 284, 50),
  mk('nb1', 'NB 1 (Newly constructed)', 'NB 1', '🏗️', 'Academics', 88, 130),
  mk('nb2', 'NB 2 (Newly constructed)', 'NB 2', '🏗️', 'Academics', 88, 248),
  mk('seater500', '500 Seater Hall', '500 Seater', '🎤', 'Academics', 158, 160, { style: [16, 10, 8] }),
  mk('seater250', '250 Seater Hall', '250 Seater', '🎤', 'Academics', 172, 258, { style: [14, 9, 7] }),
  mk('cap1k', '1K Capacity Hall', '1K CAP', '🎤', 'Academics', 280, 262, { style: [20, 12, 9] }),
  mk('intl_school', 'FUNAAB International School', 'Int. School', '🏫', 'Academics', 95, 350, { style: [14, 9, 7] }),
];

export const PLACE_MAP: Record<string, Place> = Object.fromEntries(PLACES.map((p) => [p.id, p]));

// ---------- Hustle tab: jobs (must be at the place) ----------
export interface Job {
  id: string;
  title: string;
  emoji: string;
  place: string;
  activityId: string;
  desc: string;
}
export const JOBS: Job[] = [
  { id: 'j1', title: 'Campus Shuttle Conductor', emoji: '🚐', place: 'main_gate', activityId: 'gate_conduct', desc: 'Call passengers at the gate.' },
  { id: 'j2', title: 'ICTREC Attendant', emoji: '🖥️', place: 'ict', activityId: 'ict_reg', desc: 'Help freshers with registration.' },
  { id: 'j3', title: 'Photocopy Guy', emoji: '📄', place: 'colamrud', activityId: 'amr_print', desc: 'Run past-question prints.' },
  { id: 'j4', title: 'Pure Water Seller', emoji: '💧', place: 'motion', activityId: 'mot_water', desc: 'Sell ice-cold sachets to fans.' },
  { id: 'j5', title: 'Generator Fixer', emoji: '🔧', place: 'coleng', activityId: 'eng_repair', desc: 'Revive dead hostel gens.' },
  { id: 'j6', title: 'Vet Assistant', emoji: '🐕', place: 'colplant', activityId: 'plant_vet', desc: 'Hold the angry goats.' },
  { id: 'j7', title: 'Poultry Hand', emoji: '🐔', place: 'colanim', activityId: 'anim_feed', desc: 'Feed the chickens.' },
];

// ---------- Shop (bag items, use anywhere) ----------
export interface Item {
  id: string;
  name: string;
  emoji: string;
  price: number;
  desc: string;
  fx: Fx;
  food?: boolean;
}
export const ITEMS: Item[] = [
  { id: 'gala', name: 'Gala & Lacasera', emoji: '🥖', price: 450, desc: '+25 hunger, +8 energy', fx: { hunger: 25, energy: 8 }, food: true },
  { id: 'rice', name: 'Buka Rice', emoji: '🍛', price: 900, desc: '+50 hunger, +12 energy', fx: { hunger: 50, energy: 12 }, food: true },
  { id: 'zobo', name: 'Cold Zobo', emoji: '🧃', price: 250, desc: '+10 hunger, +10 sanity', fx: { hunger: 10, sanity: 10 }, food: true },
  { id: 'power', name: 'Power Bank', emoji: '🔋', price: 3500, desc: '+35 sanity (no more NEPA tears)', fx: { sanity: 35 } },
  { id: 'energy', name: 'Energy Drink', emoji: '⚡', price: 700, desc: '+35 energy, -5 sanity', fx: { energy: 35, sanity: -5 } },
  { id: 'notes', name: 'Past Questions', emoji: '📘', price: 1200, desc: '+40 academic XP', fx: { xp: 40, sanity: -4 } },
];
export const ITEM_MAP: Record<string, Item> = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

// ---------- Groove (social, anywhere) ----------
export const GROOVES: Activity[] = [
  { id: 'g_mubas', label: 'Chill at Mubas', emoji: '🍻', cost: 1500, minutes: 150, social: 45, sanity: 20, energy: -15, hunger: 10, tag: 'hang', log: '🔊 You went clubbing at Mubas. Vibes were immaculate!' },
  { id: 'g_staff', label: 'Senior Staff Club suya', emoji: '🍸', cost: 2200, minutes: 120, social: 38, sanity: 24, hunger: 30, tag: 'hang', log: '🍸 Beef suya with seniors. Valuable connections made.' },
  { id: 'g_bonfire', label: 'Hostel bonfire', emoji: '🪵', minutes: 120, social: 30, sanity: 18, energy: -8, tag: 'hang', log: '🪵 Guitar, fire and gist. Free therapy.' },
  { id: 'g_party', label: 'Crash a student party', emoji: '🪩', cost: 1000, minutes: 180, social: 50, energy: -22, sanity: 14, tag: 'hang', log: '🪩 You danced Zanku until the DJ gave up.' },
];

// ---------- Quests ----------
export interface Quest {
  id: string;
  title: string;
  emoji: string;
  target: number;
  counter: 'lectures' | 'meals' | 'earned' | 'hangouts' | 'visited';
  reward: { cash: number; xp: number };
}
export const QUESTS: Quest[] = [
  { id: 'q_lect', title: 'Attend 2 lectures', emoji: '📚', target: 2, counter: 'lectures', reward: { cash: 1500, xp: 30 } },
  { id: 'q_eat', title: 'Eat 3 meals', emoji: '🍲', target: 3, counter: 'meals', reward: { cash: 500, xp: 20 } },
  { id: 'q_earn', title: 'Earn ₦4,000 hustling', emoji: '💸', target: 4000, counter: 'earned', reward: { cash: 1000, xp: 40 } },
  { id: 'q_hang', title: 'Hang out 2 times', emoji: '🤝', target: 2, counter: 'hangouts', reward: { cash: 500, xp: 30 } },
  { id: 'q_visit', title: 'Visit 10 places', emoji: '🧭', target: 10, counter: 'visited', reward: { cash: 2500, xp: 70 } },
];

// ---------- Random campus events ----------
export interface CampusEvent {
  text: string;
  fx: Fx;
  kind: 'good' | 'bad' | 'event';
}
export const EVENTS: CampusEvent[] = [
  { text: '💡 NEPA took the light mid-lecture. Phones went up like fireflies.', fx: { sanity: -4 }, kind: 'bad' },
  { text: '💰 You found ₦500 in an old jean pocket. Thank you, past you!', fx: { cash: 500 }, kind: 'good' },
  { text: '🍚 A coursemate shared rice with you. Blessed.', fx: { hunger: 15, social: 4 }, kind: 'good' },
  { text: '📢 Surprise quiz announced. Hearts everywhere stopped.', fx: { sanity: -8 }, kind: 'bad' },
  { text: '🎶 Someone blasted Asake from a hostel window. Campus is dancing.', fx: { sanity: 6, social: 4 }, kind: 'event' },
  { text: '🐐 A goat walked into a lecture hall. Class was suspended.', fx: { sanity: 8 }, kind: 'event' },
  { text: '🌧️ Sudden rain! You sprinted with your notes in your shirt.', fx: { energy: -6 }, kind: 'bad' },
  { text: '🏆 SUG announces free data for all. You did not get any.', fx: { sanity: -2 }, kind: 'event' },
  { text: '🍗 A senior bought you chicken after seeing you looking sad.', fx: { hunger: 20, sanity: 6 }, kind: 'good' },
];

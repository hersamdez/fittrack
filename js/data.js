// ── SAM'S FOOD DATABASE ──────────────────────────────────────────────────────
const FOODS = [
  { id: 'egg-white-bites',   name: 'Egg White Bites',         cal: 130, protein: 20, carbs: 10, fat: 3 },
  { id: 'nutri-shake',       name: 'Nutri Protein Shake',     cal: 160, protein: 25, carbs: 8,  fat: 3 },
  { id: 'fig-bar',           name: "Nature's Bakery Fig Bar", cal: 200, protein: 3,  carbs: 36, fat: 4 },
  { id: 'dates-2',           name: 'Medjool Dates (2)',       cal: 133, protein: 1,  carbs: 36, fat: 0 },
  { id: 'rice-pouch',        name: "Ben's Rice Pouch",        cal: 220, protein: 4,  carbs: 46, fat: 1 },
  { id: 'rotisserie-chicken',name: 'Rotisserie Chicken (6oz)',cal: 250, protein: 38, carbs: 0,  fat: 10 },
  { id: 'goodles-mac',       name: 'Goodles Mac (1 box)',     cal: 330, protein: 14, carbs: 52, fat: 7 },
  { id: 'pork-bowl',         name: 'BBQ Smoked Pork Bowl',    cal: 320, protein: 28, carbs: 22, fat: 11 },
  { id: 'salsa-verde',       name: 'Salsa Verde Chicken',     cal: 220, protein: 30, carbs: 8,  fat: 6 },
  { id: 'chobani-yogurt',    name: 'Chobani Zero Sugar',      cal: 90,  protein: 17, carbs: 7,  fat: 0 },
  { id: 'granola-quarter',   name: 'Granola (¼ cup)',         cal: 120, protein: 3,  carbs: 20, fat: 4 },
  { id: 'cheese-nut-snack',  name: 'Cheese Fruit Nut Snack',  cal: 200, protein: 8,  carbs: 14, fat: 12 },
  { id: 'popcorn',           name: 'Lesser Evil Popcorn',     cal: 100, protein: 2,  carbs: 16, fat: 4 },
  { id: 'built-bar',         name: 'Built Puff Bar',          cal: 130, protein: 15, carbs: 16, fat: 3 },
  { id: 'plum',              name: 'Plum',                    cal: 30,  protein: 0,  carbs: 8,  fat: 0 },
  { id: 'egg-whites-3',      name: 'Egg Whites (3)',          cal: 51,  protein: 11, carbs: 1,  fat: 0 },
];

// ── WORKOUT TEMPLATES ─────────────────────────────────────────────────────────
const WORKOUT_TEMPLATES = {
  push: [
    { name: 'Chest Press Machine',   sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
    { name: 'Incline Chest Press',   sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
    { name: 'Pec Deck / Cable Fly',  sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
    { name: 'Shoulder Press Machine',sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
    { name: 'Lateral Raise Machine', sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
    { name: 'Tricep Pushdown (Rope)',  sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
    { name: 'Seated Dip Machine',    sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
  ],
  pull: [
    { name: 'Lat Pulldown Machine',       sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
    { name: 'Seated Cable Row',           sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
    { name: 'Chest-Supported Row',        sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
    { name: 'Overhead Tricep Extension',  sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
    { name: 'Cable Bicep Curl',           sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
    { name: 'Hammer Curl (Dumbbell)',     sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
  ],
  legs: [
    { name: 'Leg Press (Horizontal)',     sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
    { name: 'Romanian Deadlift',          sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
    { name: 'Goblet Squat',              sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
    { name: 'Hip Thrust Machine',         sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
    { name: 'Glute Kickback Machine',     sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
    { name: 'Hip Abduction Machine',      sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
    { name: 'Hip Adduction Machine',      sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
    { name: 'Leg Curl Machine',           sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
  ],
  upper: [
    { name: 'Chest Press Machine',        sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
    { name: 'Pec Deck / Cable Fly',       sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
    { name: 'Lat Pulldown Machine',       sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
    { name: 'Seated Cable Row',           sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
    { name: 'Shoulder Press Machine',     sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
    { name: 'Rear Delt / Deltoid Fly',    sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
    { name: 'Cable Bicep Curl',           sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
    { name: 'Tricep Extension Machine',   sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''}] },
  ],
  spin: [
    { name: 'Spin Class', sets: [{w:'',r:'45 min'}] },
  ],
  custom: [],
};

// ── STORAGE HELPERS ────────────────────────────────────────────────────────────
const STORE = {
  key: (k) => `fittrack_${k}`,
  get: (k) => { try { return JSON.parse(localStorage.getItem(STORE.key(k))); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(STORE.key(k), JSON.stringify(v)); } catch {} },
  todayKey: () => new Date().toISOString().slice(0, 10),
};

function getTodayData() {
  return STORE.get(STORE.todayKey()) || { dayType: 'push', nutrition: [], workout: null, notes: '' };
}
function saveTodayData(data) {
  STORE.set(STORE.todayKey(), data);
}

function getAllWorkouts() {
  const all = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key.startsWith('fittrack_')) continue;
    const date = key.replace('fittrack_', '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    try {
      const d = JSON.parse(localStorage.getItem(key));
      if (d && d.workout) all.push({ date, ...d });
    } catch {}
  }
  return all.sort((a, b) => a.date.localeCompare(b.date));
}

function getMeasurements() {
  return STORE.get('measurements') || [];
}
function saveMeasurement_data(entry) {
  const ms = getMeasurements();
  ms.push(entry);
  STORE.set('measurements', ms);
}

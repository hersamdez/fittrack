// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setGreeting();
  setDateBadge();
  loadFoodGrid();
  loadDashboard();
  loadWorkoutTemplate();
  renderNutrition();
  renderProgress();
  renderWeeklySummary();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
});

// ── GREETING ──────────────────────────────────────────────────────────────────
function setGreeting() {
  const h = new Date().getHours();
  const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('greeting').textContent = g + ', Sam';
}

function setDateBadge() {
  const d = new Date();
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('today-date').innerHTML = `<strong>${days[d.getDay()]}</strong><br>${months[d.getMonth()]} ${d.getDate()}`;
}

// ── TAB SWITCHING ─────────────────────────────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  if (tab === 'progress') { renderProgress(); renderWeeklySummary(); }
  if (tab === 'dashboard') { loadDashboard(); }
  if (tab === 'coach') { updateCoachContext(); }
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function loadDashboard() {
  const data = getTodayData();
  // restore day type
  document.querySelectorAll('.day-pill').forEach(p => {
    p.classList.toggle('active', p.dataset.type === data.dayType);
  });
  renderDashboardMacros();
  renderWorkoutPreview(data.dayType);
  renderMealsPreview(data.nutrition);
}

function setDayType(type) {
  const data = getTodayData();
  data.dayType = type;
  saveTodayData(data);
  document.querySelectorAll('.day-pill').forEach(p => p.classList.toggle('active', p.dataset.type === type));
  renderWorkoutPreview(type);
  // also update workout tab select
  document.getElementById('workout-type-select').value = type;
  loadWorkoutTemplate();
}

function renderDashboardMacros() {
  const data = getTodayData();
  const totals = calcTotals(data.nutrition);
  const calTarget = data.dayType === 'rest' ? 2100 : data.dayType === 'spin' ? 2200 : 2400;
  const proTarget = 155, carbTarget = data.dayType === 'rest' ? 115 : 265;

  document.getElementById('dash-calories').innerHTML = `${totals.cal}<span>/${calTarget}</span>`;
  document.getElementById('dash-protein').innerHTML = `${totals.protein}<span>/${proTarget}g</span>`;
  document.getElementById('dash-carbs').innerHTML = `${totals.carbs}<span>/${carbTarget}g</span>`;

  setBar('cal-bar', totals.cal, calTarget);
  setBar('pro-bar', totals.protein, proTarget);
  setBar('carb-bar', totals.carbs, carbTarget);
}

function setBar(id, val, max) {
  document.getElementById(id).style.width = Math.min(100, Math.round(val / max * 100)) + '%';
}

function renderWorkoutPreview(type) {
  const el = document.getElementById('workout-preview');
  const tmpl = WORKOUT_TEMPLATES[type] || [];
  if (!tmpl.length) { el.innerHTML = '<p class="empty-state">Rest day — recovery is when muscles grow</p>'; return; }
  el.innerHTML = tmpl.map(ex => `<div class="preview-exercise"><span>${ex.name}</span><span>${ex.sets.length} sets</span></div>`).join('');
}

function renderMealsPreview(nutrition) {
  const el = document.getElementById('meals-preview');
  if (!nutrition || !nutrition.length) { el.innerHTML = '<p class="empty-state">No meals logged yet today</p>'; return; }
  el.innerHTML = nutrition.map(f => `
    <div class="meal-item">
      <span>${f.name}</span>
      <span class="meal-macros">${f.protein}g P · ${f.carbs}g C</span>
    </div>`).join('');
}

// ── WORKOUT LOGGING ───────────────────────────────────────────────────────────
let currentExercises = [];

function loadWorkoutTemplate() {
  const type = document.getElementById('workout-type-select').value;
  const tmpl = WORKOUT_TEMPLATES[type] || [];
  // Check if there's a saved workout for today of this type
  const data = getTodayData();
  if (data.workout && data.workout.type === type && data.workout.exercises.length) {
    currentExercises = JSON.parse(JSON.stringify(data.workout.exercises));
  } else {
    currentExercises = tmpl.map(ex => ({ name: ex.name, sets: ex.sets.map(s => ({...s})) }));
  }
  renderExerciseList();
}

function renderExerciseList() {
  const el = document.getElementById('exercise-list');
  el.innerHTML = currentExercises.map((ex, ei) => `
    <div class="exercise-card">
      <div class="exercise-header">
        <input class="exercise-name-input" value="${ex.name}" placeholder="Exercise name"
          onchange="currentExercises[${ei}].name = this.value"/>
        <button class="remove-ex" onclick="removeExercise(${ei})">✕</button>
      </div>
      <div class="sets-header"><span>Set</span><span>Weight (lbs)</span><span>Reps</span><span></span></div>
      ${ex.sets.map((s, si) => `
        <div class="set-row">
          <span class="set-num">${si + 1}</span>
          <input class="set-input" type="number" value="${s.w}" placeholder="0"
            onchange="currentExercises[${ei}].sets[${si}].w = this.value"/>
          <input class="set-input" type="number" value="${s.r}" placeholder="0"
            onchange="currentExercises[${ei}].sets[${si}].r = this.value"/>
          <button class="remove-set" onclick="removeSet(${ei}, ${si})">−</button>
        </div>`).join('')}
      <button class="add-set-btn" onclick="addSet(${ei})">+ Add set</button>
    </div>`).join('');
}

function addExercise() {
  currentExercises.push({ name: '', sets: [{w:'',r:''},{w:'',r:''},{w:'',r:''}] });
  renderExerciseList();
  setTimeout(() => {
    const inputs = document.querySelectorAll('.exercise-name-input');
    inputs[inputs.length - 1].focus();
  }, 50);
}

function removeExercise(ei) {
  currentExercises.splice(ei, 1);
  renderExerciseList();
}

function addSet(ei) {
  currentExercises[ei].sets.push({w:'',r:''});
  renderExerciseList();
}

function removeSet(ei, si) {
  if (currentExercises[ei].sets.length <= 1) return;
  currentExercises[ei].sets.splice(si, 1);
  renderExerciseList();
}

function saveWorkout() {
  const type = document.getElementById('workout-type-select').value;
  const notes = document.getElementById('workout-notes').value;
  const data = getTodayData();
  data.workout = { type, exercises: currentExercises, notes, savedAt: new Date().toISOString() };
  data.dayType = type;
  saveTodayData(data);
  showToast('Workout saved ✓');
  renderProgress();
  renderWeeklySummary();
}

// ── NUTRITION ─────────────────────────────────────────────────────────────────
function loadFoodGrid() {
  const grid = document.getElementById('food-grid');
  grid.innerHTML = FOODS.map(f => `
    <button class="food-btn" onclick="logFood('${f.id}')">
      <div class="food-btn-name">${f.name}</div>
      <div class="food-btn-macros">${f.cal} cal · ${f.protein}g P · ${f.carbs}g C</div>
    </button>`).join('');
}

function logFood(id) {
  const food = FOODS.find(f => f.id === id);
  if (!food) return;
  const data = getTodayData();
  data.nutrition = data.nutrition || [];
  data.nutrition.push({ ...food, loggedAt: new Date().toISOString() });
  saveTodayData(data);
  renderNutrition();
  renderDashboardMacros();
  renderMealsPreview(data.nutrition);
}

function clearNutrition() {
  const data = getTodayData();
  data.nutrition = [];
  saveTodayData(data);
  renderNutrition();
  renderDashboardMacros();
}

function removeFood(idx) {
  const data = getTodayData();
  data.nutrition.splice(idx, 1);
  saveTodayData(data);
  renderNutrition();
  renderDashboardMacros();
}

function calcTotals(nutrition) {
  return (nutrition || []).reduce((acc, f) => ({
    cal: acc.cal + (f.cal || 0),
    protein: acc.protein + (f.protein || 0),
    carbs: acc.carbs + (f.carbs || 0),
    fat: acc.fat + (f.fat || 0),
  }), { cal: 0, protein: 0, carbs: 0, fat: 0 });
}

function renderNutrition() {
  const data = getTodayData();
  const totals = calcTotals(data.nutrition);
  const dayType = data.dayType || 'push';
  const calTarget = dayType === 'rest' ? 2100 : dayType === 'spin' ? 2200 : 2400;
  const carbTarget = dayType === 'rest' ? 115 : 265;
  const proTarget = 155;

  // Rings
  setRing('cal-ring', totals.cal, calTarget);
  setRing('pro-ring', totals.protein, proTarget);
  setRing('carb-ring', totals.carbs, carbTarget);
  document.getElementById('cal-val').textContent = totals.cal;
  document.getElementById('pro-val').textContent = totals.protein + 'g';
  document.getElementById('carb-val').textContent = totals.carbs + 'g';

  // Logged list
  const el = document.getElementById('logged-foods');
  if (!data.nutrition || !data.nutrition.length) {
    el.innerHTML = '<p class="empty-state">No foods logged yet</p>';
    return;
  }
  el.innerHTML = data.nutrition.map((f, i) => `
    <div class="logged-food-item">
      <div>
        <div class="lf-name">${f.name}</div>
        <div class="lf-macros">${f.cal} cal · ${f.protein}g P · ${f.carbs}g C · ${f.fat}g F</div>
      </div>
      <button class="lf-remove" onclick="removeFood(${i})">✕</button>
    </div>`).join('');
}

function setRing(id, val, max) {
  const circ = 213.6;
  const pct = Math.min(1, val / max);
  const offset = circ - (pct * circ);
  document.getElementById(id).style.strokeDashoffset = offset;
}

// ── PROGRESS ──────────────────────────────────────────────────────────────────
function renderProgress() {
  renderStrengthChart();
  renderMeasurementsList();
}

function renderStrengthChart() {
  const liftName = document.getElementById('lift-select').value;
  const workouts = getAllWorkouts();
  const points = [];

  workouts.forEach(w => {
    if (!w.workout || !w.workout.exercises) return;
    const ex = w.workout.exercises.find(e => e.name.toLowerCase() === liftName.toLowerCase());
    if (!ex) return;
    const weights = ex.sets.map(s => parseFloat(s.w)).filter(v => !isNaN(v) && v > 0);
    if (!weights.length) return;
    const maxW = Math.max(...weights);
    points.push({ date: w.date, weight: maxW });
  });

  const el = document.getElementById('strength-chart');
  if (!points.length) {
    el.innerHTML = '<p class="empty-state">No data yet for this lift — log a workout to see progress</p>';
    return;
  }

  const maxW = Math.max(...points.map(p => p.weight));
  const bars = points.slice(-8).map(p => {
    const h = Math.round((p.weight / maxW) * 100);
    const d = p.date.slice(5);
    return `<div class="bar-wrap">
      <div class="bar-weight">${p.weight}</div>
      <div class="bar" style="height:${h}%"></div>
      <div class="bar-label">${d}</div>
    </div>`;
  }).join('');

  el.innerHTML = `<div class="bar-chart">${bars}</div>`;
}

function renderMeasurementsList() {
  const ms = getMeasurements();
  const el = document.getElementById('measurements-list');
  if (!ms.length) { el.innerHTML = '<p class="empty-state">No measurements logged yet</p>'; return; }
  el.innerHTML = ms.slice(-5).reverse().map(m => `
    <div class="measurement-entry">
      <div class="me-date">${m.date}</div>
      <div class="me-grid">
        ${m.chest ? `<div class="me-item"><div class="me-val">${m.chest}"</div><div class="me-key">Chest</div></div>` : ''}
        ${m.waist ? `<div class="me-item"><div class="me-val">${m.waist}"</div><div class="me-key">Waist</div></div>` : ''}
        ${m.armL ? `<div class="me-item"><div class="me-val">${m.armL}"</div><div class="me-key">L Arm</div></div>` : ''}
        ${m.thighL ? `<div class="me-item"><div class="me-val">${m.thighL}"</div><div class="me-key">L Thigh</div></div>` : ''}
        ${m.hips ? `<div class="me-item"><div class="me-val">${m.hips}"</div><div class="me-key">Hips</div></div>` : ''}
        ${m.weight ? `<div class="me-item"><div class="me-val">${m.weight}</div><div class="me-key">lbs</div></div>` : ''}
      </div>
    </div>`).join('');
}

function renderWeeklySummary() {
  const workouts = getAllWorkouts();
  const now = new Date();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const thisWeek = workouts.filter(w => new Date(w.date) >= weekAgo);

  const liftDays = thisWeek.filter(w => w.workout && w.workout.type !== 'spin').length;
  const spinDays = thisWeek.filter(w => w.workout && w.workout.type === 'spin').length;
  const totalDays = thisWeek.length;

  // Average protein
  const avgPro = thisWeek.length ? Math.round(
    thisWeek.reduce((a, w) => a + calcTotals(w.nutrition).protein, 0) / thisWeek.length
  ) : 0;

  const el = document.getElementById('weekly-summary');
  el.innerHTML = `
    <div class="week-stat"><span>Lift sessions</span><span class="week-stat-val">${liftDays} / 4</span></div>
    <div class="week-stat"><span>Spin sessions</span><span class="week-stat-val">${spinDays} / 2</span></div>
    <div class="week-stat"><span>Total active days</span><span class="week-stat-val">${totalDays}</span></div>
    <div class="week-stat"><span>Avg daily protein</span><span class="week-stat-val">${avgPro || '—'}g</span></div>
  `;
}

// ── MEASUREMENTS MODAL ────────────────────────────────────────────────────────
function showMeasurementModal() {
  document.getElementById('measurement-modal').classList.add('open');
}

function closeMeasurementModal(e) {
  if (!e || e.target.id === 'measurement-modal' || e.currentTarget.classList.contains('modal-cancel')) {
    document.getElementById('measurement-modal').classList.remove('open');
  }
}

function saveMeasurement() {
  const entry = {
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    chest:  document.getElementById('m-chest').value  || null,
    waist:  document.getElementById('m-waist').value  || null,
    armL:   document.getElementById('m-arm-l').value  || null,
    armR:   document.getElementById('m-arm-r').value  || null,
    thighL: document.getElementById('m-thigh-l').value|| null,
    thighR: document.getElementById('m-thigh-r').value|| null,
    hips:   document.getElementById('m-hips').value   || null,
    weight: document.getElementById('m-weight').value || null,
  };
  if (Object.values(entry).slice(1).every(v => !v)) { showToast('Enter at least one measurement'); return; }
  saveMeasurement_data(entry);
  closeMeasurementModal();
  renderMeasurementsList();
  showToast('Measurements saved ✓');
}

// ── UTILS ─────────────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style, {
    position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
    background: 'var(--accent)', color: '#0f0f0f', padding: '10px 20px',
    borderRadius: '20px', fontSize: '13px', fontWeight: '600',
    zIndex: '999', transition: 'opacity 0.3s',
  });
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2000);
}

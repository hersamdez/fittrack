// ── COACH ─────────────────────────────────────────────────────────────────────
let chatHistory = [];

function updateCoachContext() {
  const data = getTodayData();
  const totals = calcTotals(data.nutrition);
  const workouts = getAllWorkouts();
  const recentWorkout = workouts.slice(-1)[0];

  document.getElementById('ctx-day').textContent = `Today: ${data.dayType || 'not set'} day`;
  document.getElementById('ctx-nutrition').textContent = `Protein: ${totals.protein}g / 155g`;
}

function buildSystemPrompt() {
  const data = getTodayData();
  const totals = calcTotals(data.nutrition);
  const workouts = getAllWorkouts();
  const ms = getMeasurements();
  const recentWorkout = data.workout;

  // Build strength history summary
  const liftHistory = {};
  workouts.forEach(w => {
    if (!w.workout || !w.workout.exercises) return;
    w.workout.exercises.forEach(ex => {
      const weights = ex.sets.map(s => parseFloat(s.w)).filter(v => !isNaN(v) && v > 0);
      if (!weights.length) return;
      const maxW = Math.max(...weights);
      if (!liftHistory[ex.name]) liftHistory[ex.name] = [];
      liftHistory[ex.name].push({ date: w.date, weight: maxW });
    });
  });

  const strengthSummary = Object.entries(liftHistory)
    .map(([name, history]) => {
      const first = history[0]?.weight;
      const last = history[history.length - 1]?.weight;
      return `${name}: started at ${first}lbs, now at ${last}lbs (${history.length} sessions)`;
    }).join('\n');

  return `You are Sam's personal AI fitness coach inside his FitTrack app. You know everything about Sam and his fitness journey.

SAM'S PROFILE:
- 26 year old male, 5'8", started at ~169 lbs, currently tracking weight in the app
- Goal: body recomposition — bigger chest, bigger arms, bigger glutes, flat stomach (not necessarily abs)
- Describes himself as "skinny fat" with love handles, slight muffin top, fatty chest
- Has been doing spin 2-3x/week for 6 months before starting to lift ~7 weeks ago
- Prefers machines over free weights for stability

HIS WORKOUT SPLIT:
- Monday: Push (chest, shoulders, triceps) 
- Tuesday: Legs + Glutes
- Wednesday: Spin
- Thursday: Pull (back, biceps)
- Friday: Full upper body + stair master
- Saturday: Spin
- Sunday: Rest

HIS NUTRITION TARGETS:
- Training days: 2300-2400 cal, 150-155g protein, 265g carbs, 60-70g fat
- Rest days: 2000-2100 cal, 155g protein, 115g carbs
- Foods he eats: egg white bites, Nutri protein shake, fig bars, medjool dates, Ben's rice pouches, rotisserie chicken, Goodles mac, BBQ pork bowls, salsa verde chicken, Chobani zero sugar yogurt, granola, cheese/fruit/nut snacks, Lesser Evil popcorn, Built bars, plums

TODAY'S DATA:
- Day type: ${data.dayType || 'not set'}
- Calories logged: ${totals.cal} / target varies by day
- Protein: ${totals.protein}g
- Carbs: ${totals.carbs}g
- Fat: ${totals.fat}g
- Foods logged today: ${(data.nutrition || []).map(f => f.name).join(', ') || 'none yet'}
${recentWorkout ? `- Today's workout logged: ${recentWorkout.type} day, ${recentWorkout.exercises?.length} exercises` : '- No workout logged yet today'}

STRENGTH PROGRESS:
${strengthSummary || 'No workout history yet — just getting started'}

MEASUREMENTS:
${ms.length ? ms.slice(-2).map(m => `${m.date}: chest ${m.chest || '?'}", waist ${m.waist || '?'}", arms ${m.armL || '?'}"`).join('\n') : 'No measurements logged yet'}

TOTAL WORKOUT HISTORY: ${workouts.length} sessions logged

COACHING CONTEXT:
- Sam has seen some chest changes and strength gains
- Arms and glutes are slower to show changes — he's 7 weeks in
- Recently dropped 4 lbs in 3 weeks, was advised to eat more on training days
- His biggest gaps: not always hitting carb targets, dates eaten randomly instead of pre/post workout
- Hip thrust machine and Romanian deadlifts are priorities for glute growth
- Added tricep pushdown recently — overhead tricep extension also recommended

Be direct, specific, and encouraging. Reference his actual data when giving advice. Keep responses concise and practical — he's usually checking this at the gym or right before/after eating. Never be generic. Always connect advice to his specific goals and current data.`;
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;

  input.value = '';
  input.style.height = 'auto';

  // Add user bubble
  appendBubble(msg, 'user');
  chatHistory.push({ role: 'user', content: msg });

  // Typing indicator
  const typingId = appendTyping();

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: buildSystemPrompt(),
        messages: chatHistory,
      }),
    });

    const data = await response.json();
    removeTyping(typingId);

    const reply = data.content?.find(b => b.type === 'text')?.text || 'Something went wrong — try again.';
    appendBubble(reply, 'assistant');
    chatHistory.push({ role: 'assistant', content: reply });

    // Keep history manageable
    if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);

  } catch (err) {
    removeTyping(typingId);
    appendBubble('Connection error — make sure you have internet and try again.', 'assistant');
  }
}

function appendBubble(text, role) {
  const win = document.getElementById('chat-window');
  const div = document.createElement('div');
  div.className = `chat-bubble ${role}`;
  // Simple markdown-ish rendering for bold and line breaks
  div.innerHTML = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
  win.appendChild(div);
  win.scrollTop = win.scrollHeight;
  return div;
}

function appendTyping() {
  const win = document.getElementById('chat-window');
  const id = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.id = id;
  div.className = 'chat-bubble assistant typing';
  div.innerHTML = '<span>●</span><span>●</span><span>●</span>';
  win.appendChild(div);
  win.scrollTop = win.scrollHeight;
  return id;
}

function removeTyping(id) {
  document.getElementById(id)?.remove();
}

function handleChatKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
  // Auto-resize textarea
  e.target.style.height = 'auto';
  e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
}

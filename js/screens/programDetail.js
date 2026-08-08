import * as store from '../store.js';

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function repsLabel(ex) {
  if (ex.targetRepsLow == null) return `${ex.targetSets} sets`;
  const reps = ex.targetRepsLow === ex.targetRepsHigh ? `${ex.targetRepsLow}` : `${ex.targetRepsLow}-${ex.targetRepsHigh}`;
  return `${ex.targetSets} x ${reps}`;
}

function fmtVolume(n, unit) {
  return `${Math.round(n).toLocaleString()} ${unit}`;
}

async function makeSessionDraft(program, weekIndex, dayIndex) {
  const weekObj = program.weeks[weekIndex];
  const dayObj = weekObj.days[dayIndex];
  const unit = await store.getUnit();
  const exercises = await Promise.all(
    dayObj.exercises.map(async (target) => {
      const last = await store.getLastCompletedSetsForExercise(target.exerciseId);
      const sets = Array.from({ length: target.targetSets }, (_, i) => {
        const lastSet = last ? last[i] : null;
        return {
          weight: lastSet ? lastSet.weight : 0,
          weightUnit: unit,
          reps: lastSet ? lastSet.reps : target.targetRepsLow || 0,
          completed: false,
        };
      });
      return { exerciseId: target.exerciseId, target, sets };
    })
  );
  return {
    sessionId: `s-${Date.now()}`,
    date: new Date().toISOString(),
    programId: program.id,
    weekIndex,
    dayIndex,
    dayName: dayObj.name,
    status: 'in-progress',
    exercises,
  };
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export async function render(root, params, nav) {
  const program = await store.getProgram(params.programId);
  if (!program) {
    root.innerHTML = '<div class="empty-state">Program not found.</div>';
    return;
  }
  const [activeState, lifetimeVolume, unit, completedSessions] = await Promise.all([
    store.getActiveProgramState(),
    store.programLifetimeVolume(program.id),
    store.getUnit(),
    store.getCompletedSessionsForProgram(program.id),
  ]);
  const isActive = activeState && activeState.programId === program.id;

  // Most recent completed session per week/day slot (completedSessions is already newest-first).
  const completedByKey = {};
  for (const s of completedSessions) {
    const key = `${s.weekIndex}-${s.dayIndex}`;
    if (!completedByKey[key]) completedByKey[key] = s;
  }
  const expandedKeys = new Set();

  let selectedWeek = isActive ? activeState.weekIndex : 0;

  function weekOptionsHtml() {
    return program.weeks
      .map((w, i) => `<option value="${i}" ${i === selectedWeek ? 'selected' : ''}>Week ${w.week}</option>`)
      .join('');
  }

  function completedDayCard(d, dayIndex, session, key) {
    const isExpanded = expandedKeys.has(key);
    const volume = fmtVolume(store.sessionTotalVolume(session), unit);
    const doneSets = session.exercises
      .map((block) => {
        const done = block.sets.filter((s) => s.completed);
        if (done.length === 0) return '';
        return `
          <div class="exercise-row" style="display:block">
            <div class="name" style="margin-bottom:4px">${escapeHtml(exerciseNameCache[block.exerciseId] || block.exerciseId)}</div>
            <div class="scheme">${done.map((s) => `${s.weight} ${s.weightUnit} x ${s.reps}`).join(', ')}</div>
          </div>
        `;
      })
      .join('');
    return `
      <div class="card">
        <div class="badge">&check; DONE &middot; ${fmtDate(session.date)}</div>
        <div class="card-title" data-toggle-day="${key}" style="cursor:pointer">${escapeHtml(d.name)} <span style="color:var(--text-dim);font-weight:400">${isExpanded ? '&#9650;' : '&#9660;'}</span></div>
        <div class="card-sub">${volume} lifted</div>
        ${isExpanded ? `<div style="margin-top:10px">${doneSets}</div><div style="margin-top:12px"><button class="btn ghost" data-start-day="${dayIndex}">Redo This Day</button></div>` : ''}
      </div>
    `;
  }

  function upcomingDayCard(d, dayIndex, isNextUp) {
    return `
      <div class="card">
        ${isNextUp ? '<div class="badge">UP NEXT</div>' : ''}
        <div class="card-title">${escapeHtml(d.name)}</div>
        ${d.exercises
          .map(
            (ex) => `
          <div class="exercise-row">
            <span class="name">${escapeHtml(exerciseNameCache[ex.exerciseId] || ex.exerciseId)}</span>
            <span class="scheme">${repsLabel(ex)}</span>
          </div>`
          )
          .join('')}
        <div style="margin-top:12px">
          <button class="btn primary" data-start-day="${dayIndex}">Start This Day</button>
        </div>
      </div>
    `;
  }

  function daysHtml() {
    const week = program.weeks[selectedWeek];
    return week.days
      .map((d, dayIndex) => {
        const key = `${selectedWeek}-${dayIndex}`;
        const session = completedByKey[key];
        if (session) return completedDayCard(d, dayIndex, session, key);
        const isNextUp = isActive && selectedWeek === activeState.weekIndex && dayIndex === activeState.dayIndex;
        return upcomingDayCard(d, dayIndex, isNextUp);
      })
      .join('');
  }

  // Preload exercise names for display.
  const exercises = await store.getExercises();
  const exerciseNameCache = Object.fromEntries(exercises.map((e) => [e.id, e.name]));

  function paint() {
    root.innerHTML = `
      <div class="topbar">
        <button class="back" id="backBtn">&larr; Programs</button>
      </div>
      <h1>${escapeHtml(program.name)}</h1>
      ${isActive ? '<div class="badge">ACTIVE PROGRAM</div>' : ''}
      ${program.author ? `<div class="card-sub" style="margin-bottom:8px">${escapeHtml(program.author)}</div>` : ''}
      <p class="card-sub">${escapeHtml(program.description || '')}</p>

      <div class="stat-grid">
        <div class="stat"><div class="value">${program.durationWeeks}</div><div class="label">Weeks</div></div>
        <div class="stat"><div class="value">${program.daysPerWeek}</div><div class="label">Days/Week</div></div>
        <div class="stat"><div class="value">${fmtVolume(lifetimeVolume, unit)}</div><div class="label">Lifted So Far</div></div>
      </div>

      <div class="btn-row" style="margin-bottom:16px">
        <button class="btn ${isActive ? 'ghost' : 'primary'}" id="setActiveBtn">${isActive ? 'Restart Program' : 'Set as Active Program'}</button>
      </div>

      <div class="field">
        <label for="weekSelect">Week</label>
        <select id="weekSelect">${weekOptionsHtml()}</select>
      </div>

      <div id="dayList">${daysHtml()}</div>
    `;

    root.querySelector('#backBtn').addEventListener('click', () => nav.show('programs'));

    root.querySelector('#setActiveBtn').addEventListener('click', async () => {
      if (isActive) {
        const ok = window.confirm('Restart this program from Week 1, Day 1? Your workout history and logged data stay exactly as they are — this only resets which day is "up next".');
        if (!ok) return;
      }
      await store.setActiveProgramState({ programId: program.id, weekIndex: 0, dayIndex: 0 });
      render(root, params, nav);
    });

    root.querySelector('#weekSelect').addEventListener('change', (e) => {
      selectedWeek = Number(e.target.value);
      root.querySelector('#dayList').innerHTML = daysHtml();
      wireDayButtons();
    });

    wireDayButtons();
  }

  function wireDayButtons() {
    root.querySelectorAll('[data-start-day]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const dayIndex = Number(btn.dataset.startDay);
        const existing = await store.getInProgressSession();
        if (existing) {
          nav.show('workout', { sessionId: existing.sessionId });
          return;
        }
        const session = await makeSessionDraft(program, selectedWeek, dayIndex);
        await store.saveSession(session);
        nav.show('workout', { sessionId: session.sessionId });
      });
    });
    root.querySelectorAll('[data-toggle-day]').forEach((el) => {
      el.addEventListener('click', () => {
        const key = el.dataset.toggleDay;
        if (expandedKeys.has(key)) expandedKeys.delete(key);
        else expandedKeys.add(key);
        root.querySelector('#dayList').innerHTML = daysHtml();
        wireDayButtons();
      });
    });
  }

  paint();
}

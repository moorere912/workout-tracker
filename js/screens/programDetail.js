import * as store from '../store.js';
import { openExercisePhotoModal } from '../exercise-photos.js';

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

  function weekPillsHtml() {
    return program.weeks
      .map((w, i) => {
        const hasProgress = w.days.some((_, di) => completedByKey[`${i}-${di}`]);
        return `<button type="button" class="week-pill ${i === selectedWeek ? 'active' : ''}" data-week="${i}">Week ${w.week}${hasProgress ? '<span class="week-pill-dot"></span>' : ''}</button>`;
      })
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
        <div class="badge success">&check; DONE &middot; ${fmtDate(session.date)}</div>
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
          .map((ex) => {
            const last = lastSetsCache[ex.exerciseId];
            const lastLabel = last && last.length ? last.map((s) => `${s.weight}${s.weightUnit}x${s.reps}`).join(', ') : null;
            return `
          <div class="exercise-row" style="display:block">
            <div style="display:flex;justify-content:space-between">
              <button type="button" class="exercise-link" data-photo-exercise="${ex.exerciseId}">${escapeHtml(exerciseNameCache[ex.exerciseId] || ex.exerciseId)}</button>
              <span class="scheme">${repsLabel(ex)}</span>
            </div>
            ${lastLabel ? `<div class="scheme" style="margin-top:2px">Last time: ${escapeHtml(lastLabel)}</div>` : ''}
          </div>`;
          })
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

  let lastSetsCache = {};
  async function preloadLastSets(weekIndex) {
    const ids = new Set();
    program.weeks[weekIndex].days.forEach((d) => d.exercises.forEach((ex) => ids.add(ex.exerciseId)));
    const entries = await Promise.all(
      Array.from(ids).map(async (id) => [id, await store.getLastCompletedSetsForExercise(id)])
    );
    lastSetsCache = Object.fromEntries(entries);
  }
  await preloadLastSets(selectedWeek);

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

      <div class="week-pills" id="weekPills">${weekPillsHtml()}</div>

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

    wireWeekPills();
    wireDayButtons();
  }

  function wireWeekPills() {
    root.querySelectorAll('.week-pill').forEach((btn) => {
      btn.addEventListener('click', async () => {
        selectedWeek = Number(btn.dataset.week);
        await preloadLastSets(selectedWeek);
        root.querySelector('#weekPills').innerHTML = weekPillsHtml();
        root.querySelector('#dayList').innerHTML = daysHtml();
        wireWeekPills();
        wireDayButtons();
        root.querySelector(`.week-pill[data-week="${selectedWeek}"]`)?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
      });
    });
  }

  function wireDayButtons() {
    root.querySelectorAll('[data-photo-exercise]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const exerciseId = btn.dataset.photoExercise;
        openExercisePhotoModal(exerciseId, exerciseNameCache[exerciseId] || exerciseId);
      });
    });
    root.querySelectorAll('[data-start-day]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const dayIndex = Number(btn.dataset.startDay);
        const existing = await store.getInProgressSession();
        if (existing) {
          nav.show('workout', { sessionId: existing.sessionId });
          return;
        }
        const session = await store.createSessionDraft(program, selectedWeek, dayIndex);
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

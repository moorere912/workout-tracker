import * as store from '../store.js';

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function repsLabel(target) {
  if (target.targetRepsLow == null) return `${target.targetSets} sets`;
  const reps = target.targetRepsLow === target.targetRepsHigh ? `${target.targetRepsLow}` : `${target.targetRepsLow}-${target.targetRepsHigh}`;
  return `${target.targetSets} x ${reps} reps &middot; rest ${target.restSeconds ? Math.round(target.restSeconds / 60 * 10) / 10 + 'm' : '-'}`;
}

function fmtVolume(n, unit) {
  return `${Math.round(n).toLocaleString()} ${unit}`;
}

export async function render(root, params, nav) {
  let session = params.sessionId ? await store.getSession(params.sessionId) : await store.getInProgressSession();
  if (!session) {
    root.innerHTML = '<div class="empty-state">No workout in progress. Start one from a program.</div>';
    return;
  }

  const exerciseCatalog = Object.fromEntries((await store.getExercises()).map((e) => [e.id, e]));
  const lastTimeMap = {};
  for (const block of session.exercises) {
    lastTimeMap[block.exerciseId] = await store.getLastCompletedSetsForExercise(block.exerciseId, session.date);
  }
  const unit = await store.getUnit();

  async function persist() {
    await store.saveSession(session);
    const total = store.sessionTotalVolume(session);
    root.querySelector('#dailyTotalVal').textContent = fmtVolume(total, unit);
  }

  function setRowHtml(block, setIndex) {
    const s = block.sets[setIndex];
    return `
      <div class="set-row" data-ex="${block.exerciseId}" data-set="${setIndex}">
        <div class="set-num">${setIndex + 1}</div>
        <div class="stepper" data-field="weight">
          <button type="button" data-delta="-5">&minus;</button>
          <input class="val" type="number" inputmode="decimal" step="any" value="${s.weight}">
          <button type="button" data-delta="5">+</button>
        </div>
        <div class="stepper" data-field="reps">
          <button type="button" data-delta="-1">&minus;</button>
          <input class="val" type="number" inputmode="numeric" pattern="[0-9]*" value="${s.reps}">
          <button type="button" data-delta="1">+</button>
        </div>
        <button type="button" class="set-check ${s.completed ? 'done' : ''}" data-toggle>&check;</button>
      </div>
    `;
  }

  function exerciseBlockHtml(block) {
    const ex = exerciseCatalog[block.exerciseId];
    const lastSets = lastTimeMap[block.exerciseId];
    const lastLabel = lastSets && lastSets.length
      ? lastSets.map((s) => `${s.weight}x${s.reps}`).join(', ')
      : 'no previous data';
    return `
      <div class="workout-exercise" data-block="${block.exerciseId}">
        <h3>${escapeHtml(ex ? ex.name : block.exerciseId)}</h3>
        <div class="target">${repsLabel(block.target)}</div>
        <div class="last-time">Last time: ${escapeHtml(lastLabel)}</div>
        ${block.target.notes ? `<div class="last-time">${escapeHtml(block.target.notes)}</div>` : ''}
        <div class="sets">${block.sets.map((_, i) => setRowHtml(block, i)).join('')}</div>
      </div>
    `;
  }

  function paint() {
    const total = store.sessionTotalVolume(session);
    root.innerHTML = `
      <div class="daily-total">Today's total: <strong id="dailyTotalVal">${fmtVolume(total, unit)}</strong></div>
      <h1>${escapeHtml(session.dayName || 'Workout')}</h1>
      <div id="exerciseList">${session.exercises.map(exerciseBlockHtml).join('')}</div>
      <button class="btn success" id="finishBtn" style="margin: 8px 0">Finish Workout</button>
      <button class="btn ghost" id="cancelBtn" style="margin: 0 0 24px">Cancel This Workout</button>
    `;
    wireEvents();
  }

  function wireEvents() {
    root.querySelectorAll('.stepper button').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const row = btn.closest('.set-row');
        const exerciseId = row.dataset.ex;
        const setIndex = Number(row.dataset.set);
        const field = btn.closest('.stepper').dataset.field;
        const delta = Number(btn.dataset.delta);
        const block = session.exercises.find((b) => b.exerciseId === exerciseId);
        const s = block.sets[setIndex];
        const next = (field === 'weight' ? s.weight : s.reps) + delta;
        s[field] = Math.max(0, next);
        btn.closest('.stepper').querySelector('.val').value = s[field];
        await persist();
      });
    });

    root.querySelectorAll('.stepper input.val').forEach((input) => {
      input.addEventListener('focus', () => input.select());
      input.addEventListener('change', async () => {
        const row = input.closest('.set-row');
        const exerciseId = row.dataset.ex;
        const setIndex = Number(row.dataset.set);
        const field = input.closest('.stepper').dataset.field;
        const block = session.exercises.find((b) => b.exerciseId === exerciseId);
        const s = block.sets[setIndex];
        const parsed = field === 'weight' ? parseFloat(input.value) : parseInt(input.value, 10);
        s[field] = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
        input.value = s[field];
        await persist();
      });
    });

    root.querySelectorAll('[data-toggle]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const row = btn.closest('.set-row');
        const exerciseId = row.dataset.ex;
        const setIndex = Number(row.dataset.set);
        const block = session.exercises.find((b) => b.exerciseId === exerciseId);
        const s = block.sets[setIndex];
        s.completed = !s.completed;
        btn.classList.toggle('done', s.completed);
        await persist();
      });
    });

    root.querySelector('#finishBtn').addEventListener('click', async () => {
      session.status = 'completed';
      session.endedAt = new Date().toISOString();
      await store.saveSession(session);

      const activeState = await store.getActiveProgramState();
      if (activeState && activeState.programId === session.programId && activeState.weekIndex === session.weekIndex && activeState.dayIndex === session.dayIndex) {
        const program = await store.getProgram(session.programId);
        let { weekIndex, dayIndex } = activeState;
        dayIndex += 1;
        if (dayIndex >= program.weeks[weekIndex].days.length) {
          dayIndex = 0;
          weekIndex = Math.min(weekIndex + 1, program.weeks.length - 1);
        }
        await store.setActiveProgramState({ programId: program.id, weekIndex, dayIndex });
      }

      nav.show('history', { justFinishedId: session.sessionId });
    });

    root.querySelector('#cancelBtn').addEventListener('click', async () => {
      const ok = window.confirm('Cancel this workout? Anything logged in it will be deleted — this does not count as done.');
      if (!ok) return;
      await store.deleteSession(session.sessionId);
      nav.show('programs');
    });
  }

  paint();
}

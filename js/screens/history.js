import * as store from '../store.js';
import { icons } from '../icons.js';

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function fmtVolume(n, unit) {
  return `${Math.round(n).toLocaleString()} ${unit}`;
}

async function renderDetail(root, session, nav) {
  const exercises = Object.fromEntries((await store.getExercises()).map((e) => [e.id, e]));
  const unit = await store.getUnit();
  let editing = false;

  function readOnlyBlock(block) {
    const ex = exercises[block.exerciseId];
    const done = block.sets
      .map((s, i) => ({ ...s, index: i }))
      .filter((s) => s.completed);
    if (done.length === 0) return '';
    return `
      <div class="card">
        <div class="card-title">${escapeHtml(ex ? ex.name : block.exerciseId)}</div>
        ${done.map((s) => `<div class="exercise-row"><span class="name">Set</span><span class="scheme">${s.weight} ${s.weightUnit} x ${s.reps}</span></div>`).join('')}
      </div>
    `;
  }

  function editableBlock(block) {
    const ex = exercises[block.exerciseId];
    const done = block.sets
      .map((s, i) => ({ ...s, index: i }))
      .filter((s) => s.completed);
    if (done.length === 0) return '';
    return `
      <div class="card">
        <div class="card-title">${escapeHtml(ex ? ex.name : block.exerciseId)}</div>
        ${done
          .map(
            (s) => `
          <div class="set-row" data-ex="${block.exerciseId}" data-set="${s.index}">
            <div class="set-num">${s.index + 1}</div>
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
            <div></div>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  function paint() {
    root.innerHTML = `
      <div class="topbar"><button class="back" id="backBtn">&larr; History</button></div>
      <h1>${escapeHtml(session.dayName || 'Workout')}</h1>
      <div class="card-sub" style="margin-bottom:12px">${fmtDate(session.date)} &middot; ${fmtVolume(store.sessionTotalVolume(session), unit)} total</div>
      <div id="blocks">${session.exercises.map(editing ? editableBlock : readOnlyBlock).join('')}</div>
      <div class="btn-row" style="margin: 16px 0 24px">
        ${
          editing
            ? `<button class="btn ghost" id="cancelBtn">Cancel</button><button class="btn success" id="saveBtn">Save Changes</button>`
            : `<button class="btn ghost" id="editBtn">Edit</button><button class="btn danger" id="deleteBtn">Delete This Workout</button>`
        }
      </div>
    `;

    root.querySelector('#backBtn').addEventListener('click', () => nav.show('history'));

    if (editing) {
      root.querySelectorAll('.stepper button').forEach((btn) => {
        btn.addEventListener('click', () => {
          const row = btn.closest('.set-row');
          const exerciseId = row.dataset.ex;
          const setIndex = Number(row.dataset.set);
          const field = btn.closest('.stepper').dataset.field;
          const delta = Number(btn.dataset.delta);
          const block = session.exercises.find((b) => b.exerciseId === exerciseId);
          const s = block.sets[setIndex];
          s[field] = Math.max(0, s[field] + delta);
          btn.closest('.stepper').querySelector('.val').value = s[field];
        });
      });

      root.querySelectorAll('.stepper input.val').forEach((input) => {
        input.addEventListener('focus', () => input.select());
        input.addEventListener('change', () => {
          const row = input.closest('.set-row');
          const exerciseId = row.dataset.ex;
          const setIndex = Number(row.dataset.set);
          const field = input.closest('.stepper').dataset.field;
          const block = session.exercises.find((b) => b.exerciseId === exerciseId);
          const s = block.sets[setIndex];
          const parsed = field === 'weight' ? parseFloat(input.value) : parseInt(input.value, 10);
          s[field] = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
          input.value = s[field];
        });
      });
      root.querySelector('#cancelBtn').addEventListener('click', async () => {
        // Reload the unedited session from storage to discard in-memory changes.
        session = await store.getSession(session.sessionId);
        editing = false;
        paint();
      });
      root.querySelector('#saveBtn').addEventListener('click', async () => {
        await store.saveSession(session);
        editing = false;
        paint();
      });
    } else {
      root.querySelector('#editBtn').addEventListener('click', () => {
        editing = true;
        paint();
      });
      root.querySelector('#deleteBtn').addEventListener('click', async () => {
        const ok = window.confirm('Delete this workout permanently? This cannot be undone.');
        if (!ok) return;
        await store.deleteSession(session.sessionId);
        nav.show('history');
      });
    }
  }

  paint();
}

export async function render(root, params, nav) {
  if (params.sessionId) {
    const session = await store.getSession(params.sessionId);
    if (session) {
      await renderDetail(root, session, nav);
      return;
    }
  }

  const sessions = (await store.getSessions()).filter((s) => s.status === 'completed');
  const unit = await store.getUnit();

  root.innerHTML = `
    <div class="topbar"><h1>History</h1></div>
    <div id="list"></div>
  `;
  const list = root.querySelector('#list');

  if (sessions.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">${icons.clock(32)}</div><p>No workouts logged yet. Start one from a program.</p></div>`;
    return;
  }

  list.innerHTML = sessions
    .map(
      (s) => `
      <div class="card tappable" data-id="${s.sessionId}" role="button" tabindex="0">
        <div class="card-title">${escapeHtml(s.dayName || 'Workout')}</div>
        <div class="card-sub">${fmtDate(s.date)} &middot; ${fmtVolume(store.sessionTotalVolume(s), unit)}</div>
      </div>
    `
    )
    .join('');

  list.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('click', () => nav.show('history', { sessionId: card.dataset.id }));
  });
}

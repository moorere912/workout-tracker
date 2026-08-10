import * as store from '../store.js';
import { icons } from '../icons.js';

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function quickStartHtml(activeState) {
  const inProgress = await store.getInProgressSession();
  if (inProgress) {
    return `
      <div class="card" style="border-color:var(--accent)">
        <div class="badge">IN PROGRESS</div>
        <div class="card-title">${escapeHtml(inProgress.dayName || 'Workout')}</div>
        <button class="btn primary" id="quickStartBtn" style="margin-top:10px">Continue Workout</button>
      </div>
    `;
  }
  if (!activeState) return '';
  const program = await store.getProgram(activeState.programId);
  if (!program) return '';
  const dayObj = program.weeks[activeState.weekIndex]?.days[activeState.dayIndex];
  if (!dayObj) return '';
  return `
    <div class="card" style="border-color:var(--accent)">
      <div class="badge">UP NEXT &middot; ${escapeHtml(program.name)}</div>
      <div class="card-title">${escapeHtml(dayObj.name)}</div>
      <button class="btn primary" id="quickStartBtn" style="margin-top:10px">Start Today's Workout</button>
    </div>
  `;
}

export async function render(root, params, nav) {
  const [programs, activeState] = await Promise.all([store.getPrograms(), store.getActiveProgramState()]);
  const activeId = activeState ? activeState.programId : null;

  root.innerHTML = `
    <div class="brand-header">
      <div class="brand-mark">${icons.barbell(20)}</div>
      <div>
        <h1>Programs</h1>
        <div class="brand-sub">Pick a program, log your lifts</div>
      </div>
    </div>
    <div id="quickStart">${await quickStartHtml(activeState)}</div>
    <div id="programList"></div>
  `;

  root.querySelector('#quickStartBtn')?.addEventListener('click', async () => {
    const inProgress = await store.getInProgressSession();
    if (inProgress) {
      nav.show('workout', { sessionId: inProgress.sessionId });
      return;
    }
    const program = await store.getProgram(activeState.programId);
    const session = await store.createSessionDraft(program, activeState.weekIndex, activeState.dayIndex);
    await store.saveSession(session);
    nav.show('workout', { sessionId: session.sessionId });
  });

  const list = root.querySelector('#programList');
  if (programs.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">${icons.barbell(32)}</div><p>No programs yet.</p></div>`;
    return;
  }

  list.innerHTML = programs
    .map((p) => {
      const isActive = p.id === activeId;
      return `
        <div class="card tappable" data-id="${p.id}" role="button" tabindex="0">
          ${isActive ? '<div class="badge">ACTIVE</div>' : ''}
          <div class="card-title">${escapeHtml(p.name)}</div>
          <div class="card-sub">${p.durationWeeks} weeks &middot; ${p.daysPerWeek} days/week${p.author ? ` &middot; ${escapeHtml(p.author)}` : ''}</div>
        </div>
      `;
    })
    .join('');

  list.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('click', () => {
      nav.show('programDetail', { programId: card.dataset.id });
    });
  });
}

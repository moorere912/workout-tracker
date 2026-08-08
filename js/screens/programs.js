import * as store from '../store.js';

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export async function render(root, params, nav) {
  const [programs, activeState] = await Promise.all([store.getPrograms(), store.getActiveProgramState()]);
  const activeId = activeState ? activeState.programId : null;

  root.innerHTML = `
    <div class="topbar"><h1>Programs</h1></div>
    <div id="programList"></div>
  `;

  const list = root.querySelector('#programList');
  if (programs.length === 0) {
    list.innerHTML = '<div class="empty-state">No programs yet.</div>';
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

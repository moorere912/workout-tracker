// Exercise "how to" popup — opens a demo-video search link for the exercise.

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function openExercisePhotoModal(exerciseId, exerciseName) {
  const existing = document.getElementById('exercisePhotoModal');
  if (existing) existing.remove();

  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${exerciseName} exercise form`)}`;

  const overlay = document.createElement('div');
  overlay.id = 'exercisePhotoModal';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card">
      <button type="button" class="modal-close" aria-label="Close">&times;</button>
      <h3 style="padding-right:28px">${escapeHtml(exerciseName)}</h3>
      <div class="modal-body">
        <a class="btn primary" href="${searchUrl}" target="_blank" rel="noopener">Search a demo video</a>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('.modal-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
}

export function openAlternativesModal(muscleGroup, alternatives) {
  const existing = document.getElementById('exercisePhotoModal');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'exercisePhotoModal';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card">
      <button type="button" class="modal-close" aria-label="Close">&times;</button>
      <h3 style="padding-right:28px">Other ${escapeHtml(muscleGroup)} exercises</h3>
      <div class="modal-body">
        ${
          alternatives.length === 0
            ? '<p class="card-sub">No other exercises in the catalog for this muscle group.</p>'
            : alternatives
                .map((ex) => `<div class="exercise-row"><button type="button" class="exercise-link" data-alt-id="${ex.id}" data-alt-name="${escapeHtml(ex.name)}">${escapeHtml(ex.name)}</button></div>`)
                .join('')
        }
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('.modal-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  overlay.querySelectorAll('[data-alt-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openExercisePhotoModal(btn.dataset.altId, btn.dataset.altName);
    });
  });
}

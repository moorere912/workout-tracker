// Exercise "how to" popup. Looks for up to 2 user-supplied photos at
// images/exercises/<exerciseId>-1.(jpg|png) and -2.(jpg|png). Any that don't
// exist are silently skipped (probed client-side, no manifest to maintain).
// If neither photo exists, falls back to a YouTube search link so the popup
// is always useful even before any photos have been added.

function tryLoadImage(basePath) {
  return new Promise((resolve) => {
    const extensions = ['jpg', 'jpeg', 'png'];
    let i = 0;
    const attempt = () => {
      if (i >= extensions.length) {
        resolve(null);
        return;
      }
      const src = `${basePath}.${extensions[i]}`;
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => {
        i += 1;
        attempt();
      };
      img.src = src;
    };
    attempt();
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export async function openExercisePhotoModal(exerciseId, exerciseName) {
  const existing = document.getElementById('exercisePhotoModal');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'exercisePhotoModal';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card">
      <button type="button" class="modal-close" aria-label="Close">&times;</button>
      <h3 style="padding-right:28px">${escapeHtml(exerciseName)}</h3>
      <div class="modal-body">
        <div class="empty-state" style="padding:24px 0">Looking for photos&hellip;</div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('.modal-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  const [photo1, photo2] = await Promise.all([
    tryLoadImage(`./images/exercises/${exerciseId}-1`),
    tryLoadImage(`./images/exercises/${exerciseId}-2`),
  ]);

  const body = overlay.querySelector('.modal-body');
  const photos = [photo1, photo2].filter(Boolean);
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${exerciseName} exercise form`)}`;

  if (photos.length === 0) {
    body.innerHTML = `
      <p class="card-sub">No photos added for this exercise yet.</p>
      <a class="btn primary" href="${searchUrl}" target="_blank" rel="noopener">Search a demo video</a>
    `;
    return;
  }

  body.innerHTML = `
    <div class="modal-photos">
      ${photos.map((src) => `<img src="${src}" alt="${escapeHtml(exerciseName)}">`).join('')}
    </div>
    <a class="btn ghost" style="margin-top:10px" href="${searchUrl}" target="_blank" rel="noopener">Search a demo video</a>
  `;
}

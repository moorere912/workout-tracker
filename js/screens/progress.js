import * as store from '../store.js';

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function lineChart(values, labels, color) {
  const w = 320;
  const h = 140;
  const padX = 10;
  const padY = 16;
  if (values.length === 0) {
    return `<div class="empty-state">Not enough data yet</div>`;
  }
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = values.length > 1 ? (w - padX * 2) / (values.length - 1) : 0;
  const points = values.map((v, i) => {
    const x = padX + i * stepX;
    const y = h - padY - ((v - min) / range) * (h - padY * 2);
    return [x, y];
  });
  const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const dots = points
    .map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="${color}"><title>${escapeHtml(labels[i])}: ${values[i]}</title></circle>`)
    .join('');
  return `
    <svg class="chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      <path d="${path}" fill="none" stroke="${color}" stroke-width="2" />
      ${dots}
    </svg>
  `;
}

export async function render(root, params, nav) {
  const exercises = await store.getExercises();
  const selectedId = params.exerciseId || (exercises[0] && exercises[0].id);

  root.innerHTML = `
    <div class="topbar"><h1>Progress</h1></div>
    <div class="field">
      <label for="exSelect">Exercise</label>
      <select id="exSelect">
        ${exercises
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((e) => `<option value="${e.id}" ${e.id === selectedId ? 'selected' : ''}>${escapeHtml(e.name)}</option>`)
          .join('')}
      </select>
    </div>
    <div id="chartArea"></div>
  `;

  async function paintCharts(exerciseId) {
    const history = await store.getExerciseHistory(exerciseId);
    const unit = await store.getUnit();
    const area = root.querySelector('#chartArea');
    if (history.length === 0) {
      area.innerHTML = '<div class="empty-state">No logged sets for this exercise yet.</div>';
      return;
    }
    const labels = history.map((h) => new Date(h.date).toLocaleDateString());
    const topWeights = history.map((h) => h.topWeight);
    const volumes = history.map((h) => Math.round(h.volume));
    const last = history[history.length - 1];

    area.innerHTML = `
      <div class="stat-grid">
        <div class="stat"><div class="value">${last.topWeight} ${unit}</div><div class="label">Last Top Set</div></div>
        <div class="stat"><div class="value">${Math.round(last.volume).toLocaleString()}</div><div class="label">Last Volume</div></div>
      </div>
      <div class="card">
        <div class="card-title">Top Set Weight (${unit})</div>
        ${lineChart(topWeights, labels, '#ff5a3c')}
      </div>
      <div class="card">
        <div class="card-title">Total Volume (weight &times; reps)</div>
        ${lineChart(volumes, labels, '#3ecf8e')}
      </div>
    `;
  }

  root.querySelector('#exSelect').addEventListener('change', (e) => paintCharts(e.target.value));

  if (selectedId) await paintCharts(selectedId);
  else root.querySelector('#chartArea').innerHTML = '<div class="empty-state">No exercises found.</div>';
}

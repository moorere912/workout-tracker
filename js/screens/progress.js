import * as store from '../store.js';
import { icons } from '../icons.js';

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

let gradientCounter = 0;

function smoothPath(points) {
  if (points.length === 1) return `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  let d = `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    d += ` Q${x0.toFixed(1)},${y0.toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)}`;
  }
  const [lx, ly] = points[points.length - 1];
  d += ` T${lx.toFixed(1)},${ly.toFixed(1)}`;
  return d;
}

function lineChart(values, labels, color) {
  const w = 320;
  const h = 150;
  const padX = 12;
  const padY = 18;
  if (values.length === 0) {
    return `<div class="empty-state"><p>Not enough data yet</p></div>`;
  }
  gradientCounter += 1;
  const gradId = `chartGrad${gradientCounter}`;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = values.length > 1 ? (w - padX * 2) / (values.length - 1) : 0;
  const points = values.map((v, i) => {
    const x = values.length > 1 ? padX + i * stepX : w / 2;
    const y = h - padY - ((v - min) / range) * (h - padY * 2);
    return [x, y];
  });
  const linePath = smoothPath(points);
  const baseline = h - padY;
  const areaPath = `${linePath} L${points[points.length - 1][0].toFixed(1)},${baseline} L${points[0][0].toFixed(1)},${baseline} Z`;
  const dots = points
    .map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="${color}" stroke="var(--surface)" stroke-width="1.5"><title>${escapeHtml(labels[i])}: ${values[i]}</title></circle>`)
    .join('');
  const gridLines = [0.25, 0.5, 0.75]
    .map((f) => `<line x1="0" y1="${(h * f).toFixed(1)}" x2="${w}" y2="${(h * f).toFixed(1)}" stroke="var(--border)" stroke-width="1" stroke-dasharray="3 4"/>`)
    .join('');

  return `
    <svg class="chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      <defs>
        <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${gridLines}
      <path class="chart-area" d="${areaPath}" fill="url(#${gradId})" stroke="none"/>
      <path class="chart-line" d="${linePath}" fill="none" stroke="${color}" stroke-width="2.5"/>
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
      area.innerHTML = `<div class="empty-state"><div class="empty-icon">${icons.trendUp(32)}</div><p>No logged sets for this exercise yet.</p></div>`;
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
        ${lineChart(topWeights, labels, 'var(--accent)')}
      </div>
      <div class="card">
        <div class="card-title">Total Volume (weight &times; reps)</div>
        ${lineChart(volumes, labels, 'var(--success)')}
      </div>
    `;
  }

  root.querySelector('#exSelect').addEventListener('change', (e) => paintCharts(e.target.value));

  if (selectedId) await paintCharts(selectedId);
  else root.querySelector('#chartArea').innerHTML = `<div class="empty-state"><p>No exercises found.</p></div>`;
}

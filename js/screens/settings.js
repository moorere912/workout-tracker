import * as store from '../store.js';
import { downloadBackup, pickAndImportBackup } from '../backup.js';

export async function render(root, params, nav) {
  const unit = await store.getUnit();

  root.innerHTML = `
    <div class="topbar"><h1>Settings</h1></div>

    <div class="card">
      <div class="card-title">Weight Unit</div>
      <div class="toggle-group" id="unitToggle">
        <button data-unit="lb" class="${unit === 'lb' ? 'active' : ''}">lb</button>
        <button data-unit="kg" class="${unit === 'kg' ? 'active' : ''}">kg</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Backup</div>
      <p class="card-sub">Your data lives only in this phone's browser. Export a backup now and then so you never lose your history.</p>
      <div class="btn-row" style="margin-top:10px">
        <button class="btn primary" id="exportBtn">Export Backup</button>
        <button class="btn ghost" id="importBtn">Import Backup</button>
      </div>
      <p class="card-sub" id="backupMsg" style="margin-top:8px"></p>
    </div>

    <div class="card">
      <div class="card-title">Danger Zone</div>
      <p class="card-sub">Erases every program, workout, and log on this device. This cannot be undone unless you have a backup.</p>
      <button class="btn danger" id="clearBtn" style="margin-top:10px">Clear All Data</button>
    </div>
  `;

  root.querySelectorAll('#unitToggle button').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await store.setUnit(btn.dataset.unit);
      render(root, params, nav);
    });
  });

  root.querySelector('#exportBtn').addEventListener('click', async () => {
    await downloadBackup();
    root.querySelector('#backupMsg').textContent = 'Backup downloaded.';
  });

  root.querySelector('#importBtn').addEventListener('click', async () => {
    const msg = root.querySelector('#backupMsg');
    try {
      const ok = await pickAndImportBackup();
      if (ok) {
        msg.textContent = 'Backup restored.';
        setTimeout(() => nav.show('programs'), 600);
      }
    } catch (err) {
      msg.textContent = 'Could not read that file — is it a workout tracker backup?';
    }
  });

  root.querySelector('#clearBtn').addEventListener('click', async () => {
    if (!window.confirm('This deletes everything on this device permanently. Continue?')) return;
    await store.clearAllData();
    await store.seedIfNeeded();
    nav.show('programs');
  });
}

import * as store from './store.js';
import { initRestTimerBar, stopRestTimer } from './rest-timer.js';
import { icons } from './icons.js';
import * as programsScreen from './screens/programs.js';
import * as programDetailScreen from './screens/programDetail.js';
import * as workoutScreen from './screens/workout.js';
import * as historyScreen from './screens/history.js';
import * as progressScreen from './screens/progress.js';
import * as settingsScreen from './screens/settings.js';

const screens = {
  programs: programsScreen,
  programDetail: programDetailScreen,
  workout: workoutScreen,
  history: historyScreen,
  progress: progressScreen,
  settings: settingsScreen,
};

const tabForScreen = {
  programs: 'programs',
  programDetail: 'programs',
  workout: null,
  history: 'history',
  progress: 'progress',
  settings: 'settings',
};

const nav = {
  show(screenName, params = {}) {
    if (screenName !== 'workout') stopRestTimer();

    document.querySelectorAll('.screen').forEach((el) => el.classList.remove('active'));
    const el = document.getElementById(`screen-${screenName}`);
    el.classList.add('active');
    window.scrollTo(0, 0);

    document.querySelectorAll('.tabbar button').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tabForScreen[screenName]);
    });

    const mod = screens[screenName];
    mod.render(el, params, nav);
    refreshContinueBar();
  },
};

async function refreshContinueBar() {
  const bar = document.getElementById('continueBar');
  const sub = document.getElementById('continueBarSub');
  const active = document.querySelector('#screen-workout.active');
  if (active) {
    bar.classList.remove('show');
    return;
  }
  const inProgress = await store.getInProgressSession();
  if (inProgress) {
    bar.classList.add('show');
    sub.textContent = inProgress.dayName ? `${inProgress.dayName} — tap to continue` : 'Tap to continue';
  } else {
    bar.classList.remove('show');
  }
}

function renderTabIcons() {
  document.querySelectorAll('.tabbar .icon[data-icon]').forEach((el) => {
    const fn = icons[el.dataset.icon];
    if (fn) el.innerHTML = fn(20);
  });
}

function wireNav() {
  renderTabIcons();
  document.querySelectorAll('.tabbar button').forEach((btn) => {
    btn.addEventListener('click', () => nav.show(btn.dataset.tab));
  });
  document.getElementById('continueBar').addEventListener('click', async () => {
    const inProgress = await store.getInProgressSession();
    if (inProgress) nav.show('workout', { sessionId: inProgress.sessionId });
  });
  initRestTimerBar(document);
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('./sw.js').then((reg) => {
    reg.addEventListener('updatefound', () => {
      const installing = reg.installing;
      if (!installing) return;
      installing.addEventListener('statechange', () => {
        if (installing.state === 'installed' && navigator.serviceWorker.controller) {
          const banner = document.getElementById('updateBanner');
          banner.classList.add('show');
          banner.addEventListener('click', () => {
            installing.postMessage('skipWaiting');
          });
        }
      });
    });
  }).catch((err) => {
    console.warn('Service worker registration failed:', err);
  });
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

async function boot() {
  await store.seedIfNeeded();
  wireNav();
  registerServiceWorker();
  const inProgress = await store.getInProgressSession();
  if (inProgress) {
    nav.show('workout', { sessionId: inProgress.sessionId });
  } else {
    nav.show('programs');
  }
}

boot();

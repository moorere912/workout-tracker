// Foreground rest-timer: counts down, vibrates (where supported) and beeps
// when done. Lives as a small module so any screen can start/stop it.

let state = null; // { endTime, intervalId }

function fmtTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function playBeep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.55);
    osc.onended = () => ctx.close();
  } catch (err) {
    // Audio not available -- vibration/visual cue still cover it.
  }
}

function bar() {
  return document.getElementById('restTimerBar');
}

export function stopRestTimer() {
  if (state) {
    clearInterval(state.intervalId);
    state = null;
  }
  bar()?.classList.remove('show', 'done');
}

export function startRestTimer(seconds) {
  const el = bar();
  if (!el || !seconds || seconds <= 0) return;
  stopRestTimer();

  const label = document.getElementById('restTimerVal');
  const endTime = Date.now() + seconds * 1000;
  el.classList.remove('done');
  el.classList.add('show');

  const tick = () => {
    const remaining = Math.round((endTime - Date.now()) / 1000);
    if (remaining <= 0) {
      label.textContent = "Rest done!";
      el.classList.add('done');
      clearInterval(state.intervalId);
      state = null;
      if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
      playBeep();
      setTimeout(() => el.classList.remove('show', 'done'), 2500);
      return;
    }
    label.textContent = fmtTime(remaining);
  };

  tick();
  const intervalId = setInterval(tick, 250);
  state = { endTime, intervalId };
}

export function initRestTimerBar(root) {
  root.querySelector('#restSkipBtn')?.addEventListener('click', stopRestTimer);
}

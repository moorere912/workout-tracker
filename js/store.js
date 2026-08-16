import * as db from './db.js';
import { getCatalog } from './exercises-data.js';
import { programs as builtInPrograms } from './programs-data.js';

const SEED_VERSION = 3; // bump when programs-data.js / exercises-data.js content changes

export async function seedIfNeeded() {
  const seeded = await db.get('meta', 'seedVersion');
  if (seeded && seeded.value === SEED_VERSION) return;
  await db.putAll('exercises', getCatalog());
  await db.putAll('programs', builtInPrograms);
  await db.put('meta', { key: 'seedVersion', value: SEED_VERSION });
}

/* Programs -------------------------------------------------------------- */

export async function getPrograms() {
  return db.getAll('programs');
}

export async function getProgram(id) {
  return db.get('programs', id);
}

export async function saveProgram(program) {
  return db.put('programs', program);
}

export async function getActiveProgramState() {
  const rec = await db.get('meta', 'activeProgram');
  return rec ? rec.value : null; // { programId, weekIndex, dayIndex }
}

export async function setActiveProgramState(state) {
  return db.put('meta', { key: 'activeProgram', value: state });
}

export async function createSessionDraft(program, weekIndex, dayIndex) {
  const weekObj = program.weeks[weekIndex];
  const dayObj = weekObj.days[dayIndex];
  const unit = await getUnit();
  const exercises = await Promise.all(
    dayObj.exercises.map(async (target) => {
      const last = await getLastCompletedSetsForExercise(target.exerciseId);
      const sets = Array.from({ length: target.targetSets }, (_, i) => {
        const lastSet = last ? last[i] : null;
        return {
          weight: lastSet ? lastSet.weight : 0,
          weightUnit: unit,
          reps: lastSet ? lastSet.reps : target.targetRepsLow || 0,
          completed: false,
        };
      });
      return { exerciseId: target.exerciseId, target, sets };
    })
  );
  return {
    sessionId: `s-${Date.now()}`,
    date: new Date().toISOString(),
    programId: program.id,
    weekIndex,
    dayIndex,
    dayName: dayObj.name,
    status: 'in-progress',
    exercises,
  };
}

/* Exercises --------------------------------------------------------------*/

export async function getExercises() {
  return db.getAll('exercises');
}

export async function getExercise(id) {
  return db.get('exercises', id);
}

/* Units ------------------------------------------------------------------*/

export async function getUnit() {
  const rec = await db.get('meta', 'unit');
  return rec ? rec.value : 'lb';
}

export async function setUnit(unit) {
  return db.put('meta', { key: 'unit', value: unit });
}

/* Sessions -----------------------------------------------------------------
   A session is the single source of truth. Every time a set is logged we
   persist the whole session immediately (autosave) and rebuild its flattened
   setEntries so nothing is lost if the phone locks mid-workout. */

function flattenSetEntries(session) {
  const rows = [];
  for (const exBlock of session.exercises) {
    exBlock.sets.forEach((s, i) => {
      if (!s.completed) return;
      rows.push({
        entryId: `${session.sessionId}-${exBlock.exerciseId}-${i}`,
        sessionId: session.sessionId,
        date: session.date,
        exerciseId: exBlock.exerciseId,
        setNumber: i + 1,
        weight: s.weight,
        weightUnit: s.weightUnit,
        reps: s.reps,
      });
    });
  }
  return rows;
}

export async function saveSession(session) {
  await db.put('sessions', session);
  // Replace this session's flattened rows.
  const all = await db.getAll('setEntries');
  const stale = all.filter((r) => r.sessionId === session.sessionId);
  for (const row of stale) {
    await db.deleteKey('setEntries', row.entryId);
  }
  const fresh = flattenSetEntries(session);
  await db.putAll('setEntries', fresh);
  return session;
}

export async function getSessions() {
  const all = await db.getAll('sessions');
  return all.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getSession(sessionId) {
  return db.get('sessions', sessionId);
}

export async function getInProgressSession() {
  const all = await db.getAll('sessions');
  return all.find((s) => s.status === 'in-progress') || null;
}

export async function getCompletedSessionsForProgram(programId) {
  const all = await getSessions();
  return all.filter((s) => s.programId === programId && s.status === 'completed');
}

export async function deleteSession(sessionId) {
  await db.deleteKey('sessions', sessionId);
  const all = await db.getAll('setEntries');
  const stale = all.filter((r) => r.sessionId === sessionId);
  for (const row of stale) {
    await db.deleteKey('setEntries', row.entryId);
  }
}

/* Last performance / progress -------------------------------------------- */

// Looks at the most recent prior session that included this exercise at all
// (whether it was logged or skipped) -- used to show "you skipped this last
// time" instead of stale/blank weight info.
export async function getLastExerciseOutcome(exerciseId, beforeDate) {
  const sessions = await getSessions();
  for (const s of sessions) {
    if (s.status !== 'completed') continue;
    if (beforeDate && !(s.date < beforeDate)) continue;
    const block = s.exercises.find((b) => b.exerciseId === exerciseId);
    if (!block) continue;
    if (block.skipped) return { type: 'skipped', date: s.date };
    const doneSets = block.sets.filter((set) => set.completed);
    if (doneSets.length > 0) return { type: 'logged', date: s.date, sets: doneSets };
  }
  return null;
}

export async function getLastCompletedSetsForExercise(exerciseId, beforeDate) {
  const rows = await db.getAllByIndex('setEntries', 'byExercise', exerciseId);
  const filtered = beforeDate ? rows.filter((r) => r.date < beforeDate) : rows;
  if (filtered.length === 0) return null;
  const lastDate = filtered.reduce((max, r) => (r.date > max ? r.date : max), filtered[0].date);
  return filtered.filter((r) => r.date === lastDate).sort((a, b) => a.setNumber - b.setNumber);
}

export async function getExerciseHistory(exerciseId) {
  const rows = await db.getAllByIndex('setEntries', 'byExercise', exerciseId);
  const byDate = new Map();
  for (const row of rows) {
    if (!byDate.has(row.date)) byDate.set(row.date, []);
    byDate.get(row.date).push(row);
  }
  const dates = Array.from(byDate.keys()).sort();
  return dates.map((date) => {
    const sets = byDate.get(date).sort((a, b) => a.setNumber - b.setNumber);
    const topWeight = Math.max(...sets.map((s) => s.weight || 0));
    const volume = sets.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0);
    return { date, sets, topWeight, volume };
  });
}

/* Volume aggregation -------------------------------------------------------*/

export function sessionTotalVolume(session) {
  let total = 0;
  for (const exBlock of session.exercises) {
    for (const s of exBlock.sets) {
      if (!s.completed) continue;
      total += (s.weight || 0) * (s.reps || 0);
    }
  }
  return total;
}

export function sessionExerciseVolume(session, exerciseId) {
  const block = session.exercises.find((e) => e.exerciseId === exerciseId);
  if (!block) return 0;
  return block.sets.reduce((sum, s) => (s.completed ? sum + (s.weight || 0) * (s.reps || 0) : sum), 0);
}

export async function programLifetimeVolume(programId) {
  const sessions = await getSessions();
  return sessions
    .filter((s) => s.programId === programId && s.status === 'completed')
    .reduce((sum, s) => sum + sessionTotalVolume(s), 0);
}

/* Backup ------------------------------------------------------------------*/

export async function exportAll() {
  const [exercises, programs, sessions, setEntries, meta] = await Promise.all([
    db.getAll('exercises'),
    db.getAll('programs'),
    db.getAll('sessions'),
    db.getAll('setEntries'),
    db.getAll('meta'),
  ]);
  return { exportedAt: new Date().toISOString(), exercises, programs, sessions, setEntries, meta };
}

export async function importAll(data) {
  await db.clearAll();
  if (data.exercises) await db.putAll('exercises', data.exercises);
  if (data.programs) await db.putAll('programs', data.programs);
  if (data.sessions) await db.putAll('sessions', data.sessions);
  if (data.setEntries) await db.putAll('setEntries', data.setEntries);
  if (data.meta) await db.putAll('meta', data.meta);
}

export async function clearAllData() {
  await db.clearAll();
}

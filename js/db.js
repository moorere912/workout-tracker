// Small promise-based wrapper around IndexedDB.
const DB_NAME = 'workout-tracker';
const DB_VERSION = 1;

let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('exercises')) {
        db.createObjectStore('exercises', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('programs')) {
        db.createObjectStore('programs', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('sessions')) {
        const sessions = db.createObjectStore('sessions', { keyPath: 'sessionId' });
        sessions.createIndex('byDate', 'date');
      }
      if (!db.objectStoreNames.contains('setEntries')) {
        const setEntries = db.createObjectStore('setEntries', { keyPath: 'entryId' });
        setEntries.createIndex('byExercise', 'exerciseId');
        setEntries.createIndex('byExerciseDate', ['exerciseId', 'date']);
      }
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(storeNames, mode) {
  return openDb().then((db) => db.transaction(storeNames, mode));
}

function wrapRequest(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function put(storeName, value) {
  const t = await tx([storeName], 'readwrite');
  const store = t.objectStore(storeName);
  await wrapRequest(store.put(value));
  return value;
}

export async function putAll(storeName, values) {
  const t = await tx([storeName], 'readwrite');
  const store = t.objectStore(storeName);
  values.forEach((v) => store.put(v));
  return new Promise((resolve, reject) => {
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
  });
}

export async function get(storeName, key) {
  const t = await tx([storeName], 'readonly');
  return wrapRequest(t.objectStore(storeName).get(key));
}

export async function getAll(storeName) {
  const t = await tx([storeName], 'readonly');
  return wrapRequest(t.objectStore(storeName).getAll());
}

export async function deleteKey(storeName, key) {
  const t = await tx([storeName], 'readwrite');
  return wrapRequest(t.objectStore(storeName).delete(key));
}

export async function getAllByIndex(storeName, indexName, query) {
  const t = await tx([storeName], 'readonly');
  const index = t.objectStore(storeName).index(indexName);
  return wrapRequest(index.getAll(query));
}

export async function clearStore(storeName) {
  const t = await tx([storeName], 'readwrite');
  return wrapRequest(t.objectStore(storeName).clear());
}

export async function clearAll() {
  const names = ['exercises', 'programs', 'sessions', 'setEntries', 'meta'];
  for (const name of names) {
    await clearStore(name);
  }
}

// Exercise catalog. Programs register exercises they use via ex(name, muscleGroup, equipment);
// the same name always resolves to the same id, so multiple programs sharing an exercise
// (e.g. "Barbell Bench Press") automatically share history/progress data.

const catalog = new Map();

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function ex(name, muscleGroup, equipment) {
  const id = slugify(name);
  if (!catalog.has(id)) {
    catalog.set(id, { id, name, muscleGroup, equipment });
  }
  return id;
}

export function getCatalog() {
  return Array.from(catalog.values());
}

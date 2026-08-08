// Built-in workout programs.
//
// "12-Week Shortcut to Size" and both phases of "Shortcut to Shred" were transcribed by the
// app's owner from their own JEFit account into this app's own data format (exercise name,
// sets, rep target, rest, notes) for personal use — not fetched or scraped from JEFit.
import { ex } from './exercises-data.js';

function entry(name, muscleGroup, equipment, sets, reps, restSeconds, notes) {
  let lo = null;
  let hi = null;
  if (Array.isArray(reps)) {
    [lo, hi] = reps;
  } else if (typeof reps === 'number') {
    lo = reps;
    hi = reps;
  }
  return {
    exerciseId: ex(name, muscleGroup, equipment),
    targetSets: sets,
    targetRepsLow: lo,
    targetRepsHigh: hi,
    restSeconds: restSeconds ?? null,
    notes: notes || undefined,
  };
}

function day(name, exercises) {
  return { name, exercises };
}

/* ---------------------------------------------------------------------- */
/* 12-Week Shortcut to Size                                               */
/* ---------------------------------------------------------------------- */

const sizeWeekScheme = {
  1: {
    main: { sets: 3, reps: [12, 15], rest: 120 },
    acc: { sets: 2, reps: [12, 15], rest: 90 },
    calf: { sets: 4, reps: [25, 30], rest: 60 },
    abdom: { sets: 3, reps: [15, 20], rest: 60 },
  },
  2: {
    main: { sets: 3, reps: [9, 11], rest: 120 },
    acc: { sets: 2, reps: [9, 11], rest: 90 },
    calf: { sets: 4, reps: [15, 20], rest: 60 },
    abdom: { sets: 3, reps: [12, 15], rest: 60 },
  },
  3: {
    main: { sets: 4, reps: [6, 8], rest: 120 },
    acc: { sets: 3, reps: [6, 8], rest: 90 },
    calf: { sets: 4, reps: [10, 14], rest: 60 },
    abdom: { sets: 3, reps: [10, 14], rest: 60 },
  },
  4: {
    main: { sets: 4, reps: [3, 5], rest: 120, note: 'End of block: add 5 lb (10 lb for Squat/Romanian Deadlift) once you hit the top of the rep range.' },
    acc: { sets: 3, reps: [3, 5], rest: 90 },
    calf: { sets: 4, reps: [6, 9], rest: 60 },
    abdom: { sets: 3, reps: [6, 9], rest: 60 },
  },
};

function sizeEntry(category, weekInPhase, name, mg, eq) {
  const s = sizeWeekScheme[weekInPhase][category];
  return entry(name, mg, eq, s.sets, s.reps, s.rest, s.note);
}

const sizePhaseExercises = {
  1: {
    chest: [
      ['main', 'Barbell Bench Press', 'Chest', 'Barbell'],
      ['acc', 'Barbell Incline Bench Press', 'Chest', 'Barbell'],
      ['acc', 'Dumbbell Incline Chest Fly', 'Chest', 'Dumbbell'],
      ['acc', 'Cable Crossover', 'Chest', 'Cable'],
      ['acc', 'Cable Triceps Pushdown', 'Triceps', 'Cable'],
      ['acc', 'Barbell Skullcrusher', 'Triceps', 'Barbell'],
      ['acc', 'Cable Triceps Extension', 'Triceps', 'Cable'],
      ['calf', 'Barbell Standing Calf Raise', 'Calves', 'Barbell'],
      ['calf', 'Barbell Seated Calf Raise', 'Calves', 'Barbell'],
    ],
    back: [
      ['main', 'Dumbbell Bent-Over Row', 'Back', 'Dumbbell'],
      ['acc', 'Cable Lat Pulldown', 'Back', 'Cable'],
      ['acc', 'Cable Seated Row', 'Back', 'Cable'],
      ['acc', 'Cable Kneeling Pulldown', 'Back', 'Cable'],
      ['main', 'Barbell Curl', 'Biceps', 'Barbell'],
      ['acc', 'Dumbbell Incline Curl', 'Biceps', 'Dumbbell'],
      ['acc', 'Cable Bicep Curl', 'Biceps', 'Cable'],
      ['abdom', 'Bodyweight Hip Thrust', 'Abs', 'Bodyweight'],
      ['abdom', 'Bodyweight Crunch', 'Abs', 'Bodyweight'],
      ['abdom', 'Bodyweight Oblique Crunch', 'Abs', 'Bodyweight'],
    ],
    shoulders: [
      ['main', 'Barbell Shoulder Press', 'Shoulders', 'Barbell'],
      ['acc', 'Dumbbell Lateral Raise', 'Shoulders', 'Dumbbell'],
      ['acc', 'Cable Front Raise', 'Shoulders', 'Cable'],
      ['acc', 'Dumbbell Reverse Fly', 'Shoulders', 'Dumbbell'],
      ['main', 'Barbell Shrug', 'Traps', 'Barbell'],
      ['calf', 'Barbell Seated Calf Raise', 'Calves', 'Barbell'],
      ['calf', 'Machine Calf Press on Leg Press', 'Calves', 'Machine'],
    ],
    legs: [
      ['main', 'Barbell Squat', 'Legs', 'Barbell'],
      ['acc', 'Machine Leg Press', 'Legs', 'Machine'],
      ['acc', 'Machine Leg Extension', 'Legs', 'Machine'],
      ['main', 'Barbell Romanian Deadlift', 'Hamstrings', 'Barbell'],
      ['acc', 'Machine Lying Leg Curl', 'Hamstrings', 'Machine'],
      ['abdom', 'Bodyweight Hip Thrust', 'Abs', 'Bodyweight'],
      ['abdom', 'Bodyweight Crunch', 'Abs', 'Bodyweight'],
      ['abdom', 'Bodyweight Hanging Leg Raise', 'Abs', 'Bodyweight'],
    ],
  },
  2: {
    chest: [
      ['main', 'Barbell Bench Press', 'Chest', 'Barbell'],
      ['acc', 'Dumbbell Incline Bench Press', 'Chest', 'Dumbbell'],
      ['acc', 'Dumbbell Chest Fly', 'Chest', 'Dumbbell'],
      ['acc', 'Cable Incline Chest Fly', 'Chest', 'Cable'],
      ['acc', 'Cable Triceps Pushdown', 'Triceps', 'Cable'],
      ['acc', 'Dumbbell Triceps Extension', 'Triceps', 'Dumbbell'],
      ['acc', 'Cable Skullcrusher', 'Triceps', 'Cable'],
      ['calf', 'Barbell Standing Calf Raise', 'Calves', 'Barbell'],
      ['calf', 'Barbell Seated Calf Raise', 'Calves', 'Barbell'],
    ],
    back: [
      ['main', 'Dumbbell Bent-Over Row', 'Back', 'Dumbbell'],
      ['acc', 'Cable Lat Pulldown', 'Back', 'Cable'],
      ['acc', 'Cable Seated Row', 'Back', 'Cable'],
      ['acc', 'Cable Seated Wide Grip Row', 'Back', 'Cable'],
      ['main', 'Barbell Curl', 'Biceps', 'Barbell'],
      ['acc', 'Barbell Preacher Curl', 'Biceps', 'Barbell'],
      ['acc', 'Cable Bicep Curl', 'Biceps', 'Cable'],
      ['abdom', 'Bodyweight Hip Thrust', 'Abs', 'Bodyweight'],
      ['abdom', 'Bodyweight Crunch', 'Abs', 'Bodyweight'],
      ['abdom', 'Bodyweight Oblique Crunch', 'Abs', 'Bodyweight'],
    ],
    shoulders: [
      ['main', 'Barbell Shoulder Press', 'Shoulders', 'Barbell'],
      ['acc', 'Barbell Upright Row', 'Shoulders', 'Barbell'],
      ['acc', 'Cable Lateral Raise', 'Shoulders', 'Cable'],
      ['acc', 'Dumbbell Reverse Fly', 'Shoulders', 'Dumbbell'],
      ['main', 'Barbell Shrug', 'Traps', 'Barbell'],
      ['calf', 'Barbell Seated Calf Raise', 'Calves', 'Barbell'],
      ['calf', 'Machine Calf Press on Leg Press', 'Calves', 'Machine'],
    ],
    legs: [
      ['main', 'Barbell Squat', 'Legs', 'Barbell'],
      ['acc', 'Barbell Front Squat', 'Legs', 'Barbell'],
      ['acc', 'Machine Leg Extension', 'Legs', 'Machine'],
      ['main', 'Barbell Romanian Deadlift', 'Hamstrings', 'Barbell'],
      ['acc', 'Machine Seated Leg Curl', 'Hamstrings', 'Machine'],
      ['abdom', 'Bodyweight Hip Thrust', 'Abs', 'Bodyweight'],
      ['abdom', 'Bodyweight Crunch', 'Abs', 'Bodyweight'],
      ['abdom', 'Bodyweight Hanging Leg Raise', 'Abs', 'Bodyweight'],
    ],
  },
  3: {
    chest: [
      ['main', 'Barbell Bench Press', 'Chest', 'Barbell'],
      ['acc', 'Dumbbell Incline Bench Press', 'Chest', 'Dumbbell'],
      ['acc', 'Dumbbell Incline Chest Fly', 'Chest', 'Dumbbell'],
      ['acc', 'Cable Crossover', 'Chest', 'Cable'],
      ['acc', 'Cable Triceps Pushdown', 'Triceps', 'Cable'],
      ['acc', 'Cable Triceps Extension', 'Triceps', 'Cable'],
      ['acc', 'Barbell Close-Grip Bench Press', 'Triceps', 'Barbell'],
      ['calf', 'Barbell Standing Calf Raise', 'Calves', 'Barbell'],
      ['calf', 'Barbell Seated Calf Raise', 'Calves', 'Barbell'],
    ],
    back: [
      ['main', 'Dumbbell Bent-Over Row', 'Back', 'Dumbbell'],
      ['acc', 'Cable Lat Pulldown', 'Back', 'Cable'],
      ['acc', 'Cable Kneeling Pulldown', 'Back', 'Cable'],
      ['acc', 'Cable Seated Row', 'Back', 'Cable'],
      ['main', 'Barbell Curl', 'Biceps', 'Barbell'],
      ['acc', 'Dumbbell Incline Curl', 'Biceps', 'Dumbbell'],
      ['acc', 'Dumbbell Concentration Curl', 'Biceps', 'Dumbbell'],
      ['abdom', 'Bodyweight Hip Thrust', 'Abs', 'Bodyweight'],
      ['abdom', 'Bodyweight Crunch', 'Abs', 'Bodyweight'],
      ['abdom', 'Bodyweight Oblique Crunch', 'Abs', 'Bodyweight'],
    ],
    shoulders: [
      ['main', 'Barbell Shoulder Press', 'Shoulders', 'Barbell'],
      ['acc', 'Dumbbell Lateral Raise', 'Shoulders', 'Dumbbell'],
      ['acc', 'Barbell Upright Row', 'Shoulders', 'Barbell'],
      ['acc', 'Dumbbell Reverse Fly', 'Shoulders', 'Dumbbell'],
      ['main', 'Smith Machine Shrug', 'Traps', 'Smith Machine'],
      ['calf', 'Barbell Seated Calf Raise', 'Calves', 'Barbell'],
      ['calf', 'Machine Calf Press on Leg Press', 'Calves', 'Machine'],
    ],
    legs: [
      ['main', 'Barbell Squat', 'Legs', 'Barbell'],
      ['acc', 'Machine Leg Press', 'Legs', 'Machine'],
      ['acc', 'Machine Leg Extension', 'Legs', 'Machine'],
      ['main', 'Barbell Romanian Deadlift', 'Hamstrings', 'Barbell'],
      ['acc', 'Machine Lying Leg Curl', 'Hamstrings', 'Machine'],
      ['abdom', 'Bodyweight Hip Thrust', 'Abs', 'Bodyweight'],
      ['abdom', 'Bodyweight Crunch', 'Abs', 'Bodyweight'],
      ['abdom', 'Bodyweight Hanging Leg Raise', 'Abs', 'Bodyweight'],
    ],
  },
};

function buildShortcutToSize() {
  const weeks = [];
  for (let week = 1; week <= 12; week++) {
    const phase = Math.floor((week - 1) / 4) + 1;
    const weekInPhase = ((week - 1) % 4) + 1;
    const px = sizePhaseExercises[phase];
    const mk = (list) => list.map(([cat, n, mg, eq]) => sizeEntry(cat, weekInPhase, n, mg, eq));
    weeks.push({
      week,
      days: [
        day('Chest, Triceps, Calves', mk(px.chest)),
        day('Back, Biceps, Abs', mk(px.back)),
        day('Shoulders, Traps, Calves', mk(px.shoulders)),
        day('Legs, Abs', mk(px.legs)),
      ],
    });
  }
  return weeks;
}

const shortcutToSize = {
  id: 'shortcut-to-size',
  name: '12-Week Shortcut to Size',
  author: 'Jim Stoppani',
  durationWeeks: 12,
  daysPerWeek: 4,
  structureType: 'body-part-split',
  description:
    '4 days/week, 3 four-week blocks. Reps wave from 12-15 down to 3-5 each block (weeks 1-2 use a drop-set/rest-pause finisher on the last set), then reset heavier for the next block.',
  weeks: buildShortcutToSize(),
};

/* ---------------------------------------------------------------------- */
/* Shortcut to Shred — Phase 1                                            */
/* ---------------------------------------------------------------------- */

function realize(template, reps, rest, overrides = {}, extra = []) {
  const items = template.map(([name, mg, eq, sets, notes]) =>
    entry(name, mg, eq, sets, overrides[name] ?? reps, rest, notes)
  );
  return items.concat(extra);
}

// Sub-phase A templates (used for days 1-20 / weeks 1-3 of the rotation)
const shredA1 = [
  ['Barbell Bench Press', 'Chest', 'Barbell', 4],
  ['Dumbbell Incline Bench Press', 'Chest', 'Dumbbell', 3],
  ['Smith Machine Decline Bench Press', 'Chest', 'Smith Machine', 3],
  ['Dip', 'Chest', 'Bodyweight', 4],
  ['Barbell Close-Grip Bench Press', 'Triceps', 'Barbell', 4],
  ['Cable Kneeling Crunch (Rope)', 'Abs', 'Cable', 3],
  ['Smith Machine Hip Thrust', 'Glutes', 'Smith Machine', 3],
];
const shredA2 = [
  ['Barbell Shoulder Press', 'Shoulders', 'Barbell', 4],
  ['Dumbbell Alternating Press', 'Shoulders', 'Dumbbell', 3],
  ['Smith Machine One-Arm Upright Row', 'Shoulders', 'Smith Machine', 3],
  ['Barbell Squat', 'Legs', 'Barbell', 4],
  ['Barbell Deadlift', 'Back', 'Barbell', 3],
  ['Bodyweight Walking Lunge', 'Legs', 'Bodyweight', 3],
  ['Barbell Standing Calf Raise', 'Calves', 'Barbell', 3],
  ['Barbell Seated Calf Raise', 'Calves', 'Barbell', 3],
];
const shredA3 = [
  ['Barbell Bent-Over Row', 'Back', 'Barbell', 4],
  ['Dumbbell Bent-Over Row', 'Back', 'Dumbbell', 3],
  ['Cable Seated Row', 'Back', 'Cable', 3],
  ['Barbell Shrug', 'Traps', 'Barbell', 4],
  ['Barbell Curl', 'Biceps', 'Barbell', 3],
  ['Barbell Preacher Curl', 'Biceps', 'Barbell', 3],
  ['Barbell Reverse Curl', 'Forearms', 'Barbell', 3],
  ['Barbell Wrist Curl (Palms Up)', 'Forearms', 'Barbell', 3],
];
const shredA4 = [
  ['Dumbbell Incline Fly', 'Chest', 'Dumbbell', 3],
  ['Dumbbell Fly', 'Chest', 'Dumbbell', 3],
  ['Cable Cross-Over', 'Chest', 'Cable', 3],
  ['Cable Shoulder Extension', 'Triceps', 'Cable', 3],
  ['Dumbbell Triceps Extension', 'Triceps', 'Dumbbell', 3],
  ['Cable Lying Triceps Extension', 'Triceps', 'Cable', 3],
  ['Bodyweight Crunch', 'Abs', 'Bodyweight', 3],
  ['Cable One-Arm Side Bend', 'Abs', 'Cable', 3],
];
const shredA5 = [
  ['Dumbbell Lateral Raise', 'Shoulders', 'Dumbbell', 3],
  ['Barbell Overhead Front Raise', 'Shoulders', 'Barbell', 3],
  ['Dumbbell Seated Bent-Over Reverse Fly', 'Shoulders', 'Dumbbell', 3],
  ['Machine Leg Extension', 'Legs', 'Machine', 4],
  ['Machine Seated Leg Curl', 'Hamstrings', 'Machine', 4],
  ['Barbell Seated Calf Raise', 'Calves', 'Barbell', 3],
  ['Machine Calf Press on Leg Press', 'Calves', 'Machine', 3],
];
const shredA6 = [
  ['Cable Lat Pulldown (Wide Grip)', 'Back', 'Cable', 3],
  ['Machine Reverse Lat Pulldown (Close Grip)', 'Back', 'Machine', 3],
  ['Cable Shoulder Extension', 'Back', 'Cable', 3],
  ['Smith Machine Behind Back Shrug', 'Traps', 'Smith Machine', 3],
  ['Dumbbell Incline Curl', 'Biceps', 'Dumbbell', 3],
  ['Cable Bicep Curl (Supine Close Grip)', 'Biceps', 'Cable', 3],
  ['Rope Cable Curl', 'Biceps', 'Cable', 3],
  ['Dumbbell Seated Wrist Curl (Palms Down)', 'Forearms', 'Dumbbell', 3],
];

// Sub-phase B templates (used for days 22-34)
const shredB1 = [
  ['Barbell Bench Press', 'Chest', 'Barbell', 4],
  ['Dumbbell Incline Bench Press', 'Chest', 'Dumbbell', 3],
  ['Dumbbell Decline Press', 'Chest', 'Dumbbell', 3],
  ['Dip', 'Chest', 'Bodyweight', 4],
  ['Barbell Close-Grip Bench Press', 'Triceps', 'Barbell', 4],
  ['Smith Machine Hip Thrust', 'Glutes', 'Smith Machine', 3],
  ['Bodyweight Hanging Leg Raise', 'Abs', 'Bodyweight', 3],
];
const shredB2 = [
  ['Barbell Shoulder Press', 'Shoulders', 'Barbell', 4],
  ['Dumbbell Seated Shoulder Press', 'Shoulders', 'Dumbbell', 3],
  ['Dumbbell Upright Row', 'Shoulders', 'Dumbbell', 3],
  ['Barbell Squat', 'Legs', 'Barbell', 4],
  ['Barbell Deadlift', 'Back', 'Barbell', 3],
  ['Machine Leg Press', 'Legs', 'Machine', 3],
  ['Barbell Standing Calf Raise', 'Calves', 'Barbell', 3],
  ['Barbell Seated Calf Raise', 'Calves', 'Barbell', 3],
];
const shredB3 = [
  ['Barbell Bent-Over Row', 'Back', 'Barbell', 4],
  ['Dumbbell Incline Bench Row', 'Back', 'Dumbbell', 3],
  ['Cable Seated Row', 'Back', 'Cable', 3],
  ['Barbell Shrug', 'Traps', 'Barbell', 4],
  ['Barbell Curl', 'Biceps', 'Barbell', 3],
  ['Barbell Concentration Curl (Close Grip)', 'Biceps', 'Barbell', 3],
  ['Barbell Reverse Curl', 'Forearms', 'Barbell', 3],
  ['Barbell Wrist Curl (Posterior)', 'Forearms', 'Barbell', 3],
];
const shredB4 = [
  ['Cable Lower Chest Raise', 'Chest', 'Cable', 4],
  ['Cable Cross-Over', 'Chest', 'Cable', 3],
  ['Dumbbell Fly', 'Chest', 'Dumbbell', 3],
  ['Cable Rope Overhead Triceps Extension', 'Triceps', 'Cable', 3],
  ['Cable Lying Triceps Extension', 'Triceps', 'Cable', 3],
  ['Cable Triceps Pushdown (Rope)', 'Triceps', 'Cable', 3],
  ['Cross Body Crunch', 'Abs', 'Bodyweight', 3],
  ['Cable Wood Chop', 'Abs', 'Cable', 3],
];
const shredB5 = [
  ['Dumbbell Lateral Raise', 'Shoulders', 'Dumbbell', 4],
  ['Cable Front Raise', 'Shoulders', 'Cable', 3],
  ['Dumbbell Lateral Raise (Prone)', 'Shoulders', 'Dumbbell', 3],
  ['Machine Leg Extension', 'Legs', 'Machine', 4],
  ['Machine Seated Leg Curl', 'Hamstrings', 'Machine', 4],
  ['Barbell Seated Calf Raise', 'Calves', 'Barbell', 3],
  ['Machine Calf Press on Leg Press', 'Calves', 'Machine', 3],
];
const shredB6 = [
  ['Cable Lat Pulldown (Wide Grip)', 'Back', 'Cable', 4],
  ['Cable Rear Pulldown (Wide Grip)', 'Back', 'Cable', 3],
  ['Straight Arm Pushdown (Rope)', 'Back', 'Cable', 3],
  ['Dumbbell Shoulder Shrug', 'Traps', 'Dumbbell', 4],
  ['EZ-Bar Cable Curl', 'Biceps', 'Cable', 3],
  ['Dumbbell Incline Curl', 'Biceps', 'Dumbbell', 3],
  ['Dumbbell Hammer Curl', 'Biceps', 'Dumbbell', 3],
  ['Dumbbell Seated Wrist Curl (Palms Down)', 'Forearms', 'Dumbbell', 3],
];

function buildShredPhase1() {
  const weeks = [];
  const push = (weekNum, days) => weeks.push({ week: weekNum, days });

  // Weeks 1-3: sub-phase A, rotating multi-joint (11/8/5 reps) and single-joint (15/20/30 reps) days
  const aRotations = [
    { multi: 11, single: 15 },
    { multi: 8, single: 20 },
    { multi: 5, single: 30 },
  ];
  aRotations.forEach((r, i) => {
    const week = i + 1;
    const isDeload = r.multi === 5;
    push(week, [
      day('Chest, Triceps, Abs', realize(shredA1, r.multi, 90, isDeload ? { Dip: 8, 'Cable Kneeling Crunch (Rope)': 6, 'Smith Machine Hip Thrust': 6 } : {})),
      day(
        'Shoulders, Legs, Calves',
        realize(shredA2, r.multi, 90, isDeload ? { 'Barbell Standing Calf Raise': 6, 'Barbell Seated Calf Raise': 6 } : {}),
        // eslint-disable-next-line
      ),
      day('Back, Traps, Biceps', realize(shredA3, r.multi, 90)),
      day('Chest, Triceps, Abs', realize(shredA4, r.single, 60)),
      day(
        'Shoulders, Legs, Calves',
        realize(
          shredA5,
          r.single,
          60,
          {},
          week === 1
            ? [entry('Barbell Clean Deadlift', 'Back', 'Barbell', 3, null, 120, 'No target rep count in the original program — use a challenging weight.')]
            : week === 2
              ? [entry('Barbell Hip Thrust', 'Glutes', 'Barbell', 3, null, 90, 'No target rep count in the original program.')]
              : [
                  entry('Machine Leg Extension', 'Legs', 'Machine', 3, null, 45, 'Burnout set — no target rep count, go to near failure.'),
                  entry('Machine Seated Leg Curl', 'Hamstrings', 'Machine', 3, null, 45, 'Burnout set — no target rep count, go to near failure.'),
                ]
        )
      ),
      day('Back, Traps, Biceps', realize(shredA6, r.single, 60)),
    ]);
  });

  // Weeks 4-5: sub-phase B, only 2 rotations (11/8 multi-joint, 15/20 single-joint)
  const bRotations = [
    { multi: 11, single: 15 },
    { multi: 8, single: 20 },
  ];
  bRotations.forEach((r, i) => {
    const week = i + 4;
    push(week, [
      day('Chest, Triceps, Abs', realize(shredB1, r.multi, 90)),
      day('Shoulders, Legs, Calves', realize(shredB2, r.multi, 90)),
      day('Back, Traps, Biceps', realize(shredB3, r.multi, 90)),
      day('Chest, Triceps, Abs', realize(shredB4, r.single, 60)),
      day('Shoulders, Legs, Calves', realize(shredB5, r.single, 60)),
      day('Back, Traps, Biceps', realize(shredB6, r.single, 60)),
    ]);
  });

  return weeks;
}

const shredPhase1 = {
  id: 'shortcut-to-shred-phase-1',
  name: 'Shortcut to Shred — Phase 1',
  author: 'Jim Stoppani',
  durationWeeks: 5,
  daysPerWeek: 6,
  structureType: 'body-part-split',
  description:
    '6-day rotating split (Chest/Triceps/Abs, Shoulders/Legs/Calves, Back/Traps/Biceps, repeating) with a rest day after every 6th workout. Reps climb 11 -> 8 -> 5 on compound days and 15 -> 20 -> 30 on isolation days across the block.',
  weeks: buildShredPhase1(),
};

/* ---------------------------------------------------------------------- */
/* Shortcut to Shred — Phase 2                                            */
/* ---------------------------------------------------------------------- */

const c1 = [
  ['Barbell Bench Press', 'Chest', 'Barbell', 4],
  ['Barbell Incline Bench Press', 'Chest', 'Barbell', 3],
  ['Dumbbell Decline Bench Press', 'Chest', 'Dumbbell', 3],
  ['Dip', 'Chest', 'Bodyweight', 4],
  ['Barbell Close-Grip Bench Press', 'Triceps', 'Barbell', 4],
  ['Machine Ab Crunch', 'Abs', 'Machine', 3],
  ['Bodyweight Hanging Leg Raise', 'Abs', 'Bodyweight', 3],
];
const c2a = [
  ['Barbell Shoulder Press', 'Shoulders', 'Barbell', 4],
  ['Dumbbell Seated Shoulder Press', 'Shoulders', 'Dumbbell', 3],
  ['Dumbbell Upright Row', 'Shoulders', 'Dumbbell', 3],
  ['Machine Leg Press', 'Legs', 'Machine', 3],
  ['Smith Machine Deadlift', 'Back', 'Smith Machine', 3],
  ['Smith Machine Squat', 'Legs', 'Smith Machine', 4],
  ['Machine Calf Raise', 'Calves', 'Machine', 3],
  ['Machine Seated Calf Raise', 'Calves', 'Machine', 3],
];
const c2b = [
  ['Barbell Deep Squat', 'Legs', 'Barbell', 4],
  ['Barbell Clean Deadlift', 'Back', 'Barbell', 3],
  ['Dumbbell Upright Row', 'Shoulders', 'Dumbbell', 3],
  ['Machine Seated Calf Raise', 'Calves', 'Machine', 3],
  ['Barbell Shoulder Press', 'Shoulders', 'Barbell', 4],
  ['Dumbbell Seated Shoulder Press', 'Shoulders', 'Dumbbell', 3],
  ['Machine Calf Raise', 'Calves', 'Machine', 3],
  ['Machine Leg Press', 'Legs', 'Machine', 3],
];
const c3 = [
  ['Barbell Bent-Over Row', 'Back', 'Barbell', 4],
  ['Dumbbell Incline Bench Row', 'Back', 'Dumbbell', 3],
  ['Cable Seated Row', 'Back', 'Cable', 3],
  ['Barbell Shrug', 'Traps', 'Barbell', 4],
  ['Barbell Curl', 'Biceps', 'Barbell', 3],
  ['Barbell Concentration Curl (Close Grip)', 'Biceps', 'Barbell', 3],
  ['Barbell Reverse Curl', 'Forearms', 'Barbell', 3],
  ['Barbell Wrist Curl (Posterior)', 'Forearms', 'Barbell', 3],
];
const c4 = [
  ['Cable Lower Chest Raise', 'Chest', 'Cable', 4],
  ['Cable Cross-Over', 'Chest', 'Cable', 3],
  ['Dumbbell Fly', 'Chest', 'Dumbbell', 3],
  ['Cable Rope Overhead Triceps Extension', 'Triceps', 'Cable', 3],
  ['Barbell Triceps Extension (Supine)', 'Triceps', 'Barbell', 3],
  ['Cable Triceps Pushdown (Rope)', 'Triceps', 'Cable', 3],
  ['Cross Body Crunch', 'Abs', 'Bodyweight', 3],
  ['Cable Wood Chop', 'Abs', 'Cable', 3],
];
const c5 = [
  ['Dumbbell Lateral Raise', 'Shoulders', 'Dumbbell', 4],
  ['Cable Front Raise', 'Shoulders', 'Cable', 3],
  ['Dumbbell Lateral Raise (Prone)', 'Shoulders', 'Dumbbell', 3],
  ['Machine Leg Extension', 'Legs', 'Machine', 4],
  ['Machine Leg Curl (Prone)', 'Hamstrings', 'Machine', 4],
  ['Machine Seated Calf Raise', 'Calves', 'Machine', 3],
  ['Calf Press on Leg Press', 'Calves', 'Machine', 3],
];
const c6 = [
  ['Cable Lat Pulldown (Wide Grip)', 'Back', 'Cable', 4],
  ['Cable Rear Pulldown (Wide Grip)', 'Back', 'Cable', 3],
  ['Dumbbell Hammer Curl', 'Biceps', 'Dumbbell', 3],
  ['Dumbbell Incline Curl', 'Biceps', 'Dumbbell', 3],
  ['Dumbbell Shoulder Shrug', 'Traps', 'Dumbbell', 4],
  ['Cable Bicep Curl', 'Biceps', 'Cable', 3],
  ['Cable Shoulder Extension', 'Back', 'Cable', 3],
  ['Dumbbell Wrist Curl (Palms Down)', 'Forearms', 'Dumbbell', 3],
];

function buildShredPhase2() {
  const blocks = [
    { c2: c2a, multi: 11, single: 15, c3reps: 11 },
    { c2: c2b, multi: 8, single: 20, c3reps: 11 },
    { c2: c2b, multi: 5, single: 30, c3reps: 5 },
  ];
  return blocks.map((b, i) => ({
    week: i + 1,
    days: [
      day('Chest, Triceps, Abs (Multi-Joint)', realize(c1, b.multi, 90)),
      day('Shoulders, Legs, Calves (Multi-Joint)', realize(b.c2, b.multi, 90)),
      day('Back, Traps, Biceps (Multi-Joint)', realize(c3, b.c3reps, 90)),
      day('Chest, Triceps, Abs (Single-Joint)', realize(c4, b.single, 60)),
      day('Shoulders, Legs, Calves (Single-Joint)', realize(c5, b.single, 60)),
      day('Back, Traps, Biceps (Single-Joint)', realize(c6, b.single, 60)),
    ],
  }));
}

const shredPhase2 = {
  id: 'shortcut-to-shred-phase-2',
  name: 'Shortcut to Shred — Phase 2',
  author: 'Jim Stoppani',
  durationWeeks: 3,
  daysPerWeek: 6,
  structureType: 'body-part-split',
  description:
    'Continues the Phase 1 rotation, now split into dedicated Multi-Joint and Single-Joint days. Reps climb 11 -> 8 -> 5 on multi-joint days and 15 -> 20 -> 30 on single-joint days across the 3-week block.',
  weeks: buildShredPhase2(),
};

/* ---------------------------------------------------------------------- */
/* Fallback: original, generic program (no external source)               */
/* ---------------------------------------------------------------------- */

function fullBodyWeek() {
  const mk = (list) => list.map(([n, mg, eq]) => entry(n, mg, eq, 3, [8, 12], 90));
  return [
    day('Full Body A', mk([
      ['Barbell Squat', 'Legs', 'Barbell'],
      ['Barbell Bench Press', 'Chest', 'Barbell'],
      ['Cable Seated Row', 'Back', 'Cable'],
      ['Barbell Shoulder Press', 'Shoulders', 'Barbell'],
      ['Bodyweight Crunch', 'Abs', 'Bodyweight'],
    ])),
    day('Full Body B', mk([
      ['Barbell Romanian Deadlift', 'Hamstrings', 'Barbell'],
      ['Barbell Incline Bench Press', 'Chest', 'Barbell'],
      ['Cable Lat Pulldown', 'Back', 'Cable'],
      ['Dumbbell Lateral Raise', 'Shoulders', 'Dumbbell'],
      ['Bodyweight Hanging Leg Raise', 'Abs', 'Bodyweight'],
    ])),
  ];
}

const beginnerFullBody = {
  id: 'beginner-full-body',
  name: '8-Week Beginner Full-Body',
  author: null,
  durationWeeks: 8,
  daysPerWeek: 3,
  structureType: 'full-body',
  description: 'A generic 3-day/week full-body routine (squat, hinge, push, pull, core each session) at a standard 3x8-12. Add weight when you hit the top of the range for all sets.',
  weeks: Array.from({ length: 8 }, (_, i) => ({
    week: i + 1,
    days: [fullBodyWeek()[0], fullBodyWeek()[1], fullBodyWeek()[0]],
  })),
};

export const programs = [shortcutToSize, shredPhase1, shredPhase2, beginnerFullBody];

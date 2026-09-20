// The battery's report: how long each part took, the slowest cases, and how
// one report reads against the one before it. Every function here takes text
// or rows and answers rows, so a test drives it over a fixture.
// [[spec/guidance/retro/effect]]

export const SLOWEST = 10;
// A case counts as grown past this share of what it took before. [[spec/guidance/retro/effect]]
const GROWN = 0.5;
const SUBTEST = /^\s*# Subtest: (.+)$/;
const DURATION = /^\s*duration_ms: ([\d.]+)$/;

// The cases the runner's TAP names, each with its time, the slowest first. [[spec/guidance/retro/effect]]
export function slowestIn(tap, most = SLOWEST) {
  const open = [];
  const out = [];
  for (const line of String(tap ?? "").split(/\r?\n/)) {
    const named = SUBTEST.exec(line);
    if (named) {
      open.push(named[1].trim());
      continue;
    }
    const timed = DURATION.exec(line);
    if (!timed || !open.length) continue;
    out.push({ name: open.pop(), ms: Number(timed[1]) });
  }
  return out.sort((a, b) => b.ms - a.ms).slice(0, most);
}

// A clock over the parts: each part runs under its name, and the map holds what it took. [[spec/guidance/retro/effect]]
export function partsTimed(clock) {
  const parts = {};
  const timed = async (name, part) => {
    const from = clock.now().getTime();
    try {
      return await part();
    } finally {
      parts[name] = clock.now().getTime() - from;
    }
  };
  return { parts, timed };
}

// One report: the parts as timed, their sum, and the slowest cases. [[spec/guidance/retro/effect]]
export function batteryOf(parts, tap, most = SLOWEST) {
  const timed = {};
  let total = 0;
  for (const [name, ms] of Object.entries(parts ?? {})) {
    timed[name] = Math.round(Number(ms) || 0);
    total += timed[name];
  }
  return { parts: timed, total, slowest: slowestIn(tap, most) };
}

// This report against the last: each part's change, and the cases that are new, grown or gone. [[spec/guidance/retro/effect]]
export function batteryDelta(before, now) {
  const names = new Set([
    ...Object.keys(before?.parts ?? {}),
    ...Object.keys(now?.parts ?? {}),
  ]);
  const parts = [...names].map((part) => {
    const was = before?.parts?.[part] ?? 0;
    const is = now?.parts?.[part] ?? 0;
    return { part, before: was, now: is, delta: is - was };
  });
  const earlier = new Map((before?.slowest ?? []).map((one) => [one.name, one.ms]));
  const later = new Map((now?.slowest ?? []).map((one) => [one.name, one.ms]));
  const grown = [];
  const fresh = [];
  for (const [name, ms] of later) {
    if (!earlier.has(name)) fresh.push({ name, ms });
    else if (ms > earlier.get(name) * (1 + GROWN)) {
      grown.push({ name, before: earlier.get(name), ms });
    }
  }
  const gone = [...earlier]
    .filter(([name]) => !later.has(name))
    .map(([name, ms]) => ({ name, ms }));
  return {
    total: { before: before?.total ?? 0, now: now?.total ?? 0 },
    parts,
    fresh,
    grown,
    gone,
  };
}

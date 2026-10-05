// The battery's report against the one before it, and each part's median
// over the kept runs, which a retro reads. The check writes the report in Go.
// Every function here takes rows and answers rows, so a test drives it over a
// fixture.
// [[spec/guidance/retro/effect]]

export const SLOWEST = 10;
// A case counts as grown past this share of what it took before. [[spec/guidance/retro/effect]]
const GROWN = 0.5;

// Each part's median over the runs that reached it, because a red run leaves the parts past it unrun. [[spec/guidance/retro/effect]]
export function medianParts(runs) {
  const held = new Map();
  for (const run of runs ?? []) {
    for (const [name, ms] of Object.entries(run ?? {})) {
      held.set(name, [...(held.get(name) ?? []), Number(ms) || 0]);
    }
  }
  return Object.fromEntries([...held].map(([name, all]) => [name, medianOf(all)]));
}

function medianOf(all) {
  const sorted = [...all].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

// A case keys on its file and its name, because two files share a name. [[spec/guidance/retro/effect]]
export function keyOf(one) {
  return one?.file ? `${one.file} ${one.name}` : String(one?.name ?? "");
}

// This report against the last: each part's change, the cases new, grown or gone, the files against before, and the spawns side by side. [[spec/guidance/retro/effect]]
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
  const earlier = new Map((before?.slowest ?? []).map((one) => [keyOf(one), one]));
  const later = new Map((now?.slowest ?? []).map((one) => [keyOf(one), one]));
  const grown = [];
  const fresh = [];
  for (const [key, one] of later) {
    if (!earlier.has(key)) fresh.push({ ...one });
    else if (one.ms > earlier.get(key).ms * (1 + GROWN)) {
      grown.push({ ...one, before: earlier.get(key).ms });
    }
  }
  const gone = [...earlier]
    .filter(([key]) => !later.has(key))
    .map(([, one]) => ({ ...one }));
  const was = new Map((before?.files ?? []).map((one) => [one.name, one.ms]));
  const files = (now?.files ?? [])
    .slice(0, SLOWEST)
    .map((one) => ({ name: one.name, before: was.get(one.name) ?? 0, now: one.ms }));
  return {
    total: { before: before?.total ?? 0, now: now?.total ?? 0 },
    parts,
    fresh,
    grown,
    gone,
    files,
    unrun: [...(now?.unrun ?? [])],
    red: [...(now?.red ?? [])],
    spawns: { before: before?.spawns ?? null, now: now?.spawns ?? null },
  };
}

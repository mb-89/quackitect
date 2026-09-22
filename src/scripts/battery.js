// The battery's report: how long each part took, the slowest cases, a time a
// test file, the red cases in their own words, the spawns a run made, and how
// one report reads against the one before it. Every function here takes text
// or rows and answers rows, so a test drives it over a fixture.
// [[spec/guidance/retro/effect]]

export const SLOWEST = 10;
// A case counts as grown past this share of what it took before. [[spec/guidance/retro/effect]]
const GROWN = 0.5;
const WORDS = 200;
const VALE = /(^|[\\/])vale(\.exe)?$/i;

// The rows the runner's reporter wrote, one a case, and none for a line that reads as no row. [[spec/guidance/retro/effect]]
export function rowsIn(lines) {
  const out = [];
  for (const line of String(lines ?? "").split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const row = JSON.parse(line);
      if (row && typeof row === "object") out.push(row);
    } catch {}
  }
  return out;
}

// The cases, each with its time and its file, the slowest first. [[spec/guidance/retro/effect]]
export function slowestIn(lines, most = SLOWEST) {
  return rowsIn(lines)
    .map((row) => ({ name: String(row.name ?? ""), ms: Number(row.ms) || 0, file: String(row.file ?? "") }))
    .sort((a, b) => b.ms - a.ms)
    .slice(0, most);
}

// A time a test file: the sum of its cases at the top, the slowest first. [[spec/guidance/retro/effect]]
export function filesIn(lines) {
  const held = new Map();
  for (const row of rowsIn(lines)) {
    if (Number(row.nesting) || !row.file) continue;
    held.set(row.file, (held.get(row.file) ?? 0) + (Number(row.ms) || 0));
  }
  return [...held]
    .map(([name, ms]) => ({ name, ms: Math.round(ms) }))
    .sort((a, b) => b.ms - a.ms);
}

// The red cases in their own words: the file, the name, and the error's first line. [[spec/guidance/retro/effect]]
export function redIn(lines) {
  return rowsIn(lines)
    .filter((row) => row.ok === false)
    .map((row) => ({
      file: String(row.file ?? ""),
      name: String(row.name ?? ""),
      said: String(row.said ?? "").slice(0, WORDS),
    }));
}

// The tally the process door writes, one line a spawn: how many in all, and how many are Vale. [[spec/guidance/retro/effect]]
export function spawnsIn(tally) {
  const lines = String(tally ?? "")
    .split(/\r?\n/)
    .map((one) => one.trim())
    .filter(Boolean);
  return { all: lines.length, vale: lines.filter((one) => VALE.test(one)).length };
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

// One report: the parts as timed, their sum, the slowest cases, a time a file, the parts a red run left unrun, the red cases, and the spawns. [[spec/guidance/retro/effect]]
export function batteryOf(parts, lines, { most = SLOWEST, unrun = [], spawns = null } = {}) {
  const timed = {};
  let total = 0;
  for (const [name, ms] of Object.entries(parts ?? {})) {
    timed[name] = Math.round(Number(ms) || 0);
    total += timed[name];
  }
  return {
    parts: timed,
    total,
    slowest: slowestIn(lines, most),
    files: filesIn(lines),
    unrun: [...unrun],
    red: redIn(lines),
    spawns,
  };
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

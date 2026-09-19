// The retro's timeline: every timed line of its input, placed by its time,
// and the hours they fall in.
// [[spec/guidance/retro/chapter]]

import { RETRO } from "../../../.claude/skills/level0/lib/folders.js";

export const INPUT = "input";
// The sources a line carries a time in, and the field naming it. [[spec/guidance/retro/chapter]]
const TIMED = [
  { top: "transcripts", field: /"timestamp":"([^"]+)"/ },
  { top: "log", field: /"at":"([^"]+)"/ },
];
const HOUR = 3_600_000;
// The printed columns, each as wide as its head. [[spec/guidance/retro/chapter]]
const COLUMNS = [
  { key: "transcripts", head: "transcript" },
  { key: "log", head: "log" },
  { key: "sessions", head: "sessions" },
  { key: "faults", head: "faults" },
].map((column) => ({ ...column, width: column.head.length }));
const HOUR_KEY = 13;
// A line a transcript writes as a failing tool result, and a log line at a failing level. [[spec/guidance/retro/signals]]
const FAULT = /"is_error":\s*true|"level":"(?:warn|error|fatal)"/;

// The retro's own folder. [[spec/guidance/retro/chapter]]
export function homeOf(it, name) {
  return it.join(it.root, ...RETRO.split("/"), name);
}

// Every timed file of the input: its path under the input, and the time of each line. A line with no time takes the time before it. [[spec/guidance/retro/chapter]]
export function timedFiles(it, name) {
  const input = it.join(homeOf(it, name), INPUT);
  const out = [];
  for (const source of TIMED) {
    for (const path of walk(it, input, source.top)) {
      const lines = it.disk.read(it.join(input, ...path.split("/"))).split("\n");
      const times = [];
      const faults = [];
      let last = Number.NaN;
      for (const line of lines) {
        const when = Date.parse(source.field.exec(line)?.[1] ?? "");
        if (Number.isFinite(when)) last = when;
        times.push(last);
        faults.push(FAULT.test(line));
      }
      out.push({ path, source: source.top, times, faults });
    }
  }
  return out;
}

// The hours holding a line, each with its counts per source, its sessions and its faults. [[spec/guidance/retro/chapter]]
export function hoursOf(files) {
  const hours = new Map();
  for (const file of files) {
    file.times.forEach((when, at) => {
      if (!Number.isFinite(when)) return;
      const key = new Date(Math.floor(when / HOUR) * HOUR)
        .toISOString()
        .slice(0, HOUR_KEY);
      const hour = hours.get(key) ?? {
        hour: key,
        transcripts: 0,
        log: 0,
        faults: 0,
        sessions: new Set(),
      };
      hour[file.source] += 1;
      if (file.faults[at]) hour.faults += 1;
      if (file.source === "transcripts") hour.sessions.add(file.path);
      hours.set(key, hour);
    });
  }
  return [...hours.values()]
    .sort((a, b) => a.hour.localeCompare(b.hour))
    .map((one) => ({ ...one, sessions: one.sessions.size }));
}

// The verb: prints the hours holding work, with the idle stretches between them, and writes them beside the input. [[spec/guidance/retro/chapter]]
export function timeline(it, name) {
  if (!name || !it.disk.exists(it.join(homeOf(it, name), INPUT))) {
    console.error(
      "retro timeline names a retro whose collect stands: ./RUNME.sh retro timeline <retro>",
    );
    return 2;
  }
  const hours = hoursOf(timedFiles(it, name));
  it.disk.write(
    it.join(homeOf(it, name), "timeline.json"),
    `${JSON.stringify(hours, null, 2)}\n`,
  );
  console.log(`hour (UTC)      ${COLUMNS.map((column) => column.head).join("  ")}`);
  let before = 0;
  for (const one of hours) {
    const at = Date.parse(`${one.hour}:00:00Z`);
    const idle = before ? Math.round((at - before) / HOUR) - 1 : 0;
    if (idle > 0) console.log(`  ... ${idle} idle hour(s)`);
    const cells = COLUMNS.map((column) =>
      String(one[column.key]).padStart(column.width),
    );
    console.log(`${one.hour}   ${cells.join("  ")}`);
    before = at;
  }
  return 0;
}

// Each measure's matches over the input, and the active hours they fall in, read in one pass. A measure names its source, log or transcripts, or all. [[spec/guidance/retro/classify]]
export function countsOver(it, name, measures) {
  const input = it.join(homeOf(it, name), INPUT);
  const counts = Object.fromEntries(measures.map((one) => [one.id, 0]));
  const hours = new Set();
  for (const source of TIMED) {
    const reading = measures.filter(
      (one) => one.source === "all" || one.source === source.top,
    );
    for (const path of walk(it, input, source.top)) {
      for (const line of it.disk.read(it.join(input, ...path.split("/"))).split("\n")) {
        const when = Date.parse(source.field.exec(line)?.[1] ?? "");
        if (Number.isFinite(when)) hours.add(Math.floor(when / HOUR));
        for (const one of reading) if (one.pattern.test(line)) counts[one.id] += 1;
      }
    }
  }
  return { counts, hours: hours.size };
}

function walk(it, input, top) {
  const out = [];
  const into = (rel) => {
    const at = it.join(input, ...rel.split("/"));
    if (!it.disk.exists(at)) return;
    for (const one of it.disk.list(at)) {
      const path = `${rel}/${one.name}`;
      if (one.kind === "dir") into(path);
      else if (one.name.endsWith(".jsonl")) out.push(path);
    }
  };
  into(top);
  return out.sort();
}

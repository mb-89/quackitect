// The retro's chapters: the cuts a hand writes, checked for a gap and an
// overlap, and every timed line of the input handed to the chapter it falls in.
// [[spec/guidance/retro/chapter]]

import { homeOf, timedFiles } from "./timeline.js";

export const CUTS = "chapters.json";
export const CHAPTERS = "chapters";

// The cuts, read and checked: a start before an end, and each chapter opening where the one before closes. [[spec/guidance/retro/chapter]]
export function cutsOf(text) {
  let read;
  try {
    read = JSON.parse(text);
  } catch {
    return { faults: [`${CUTS} reads as no JSON`], cuts: [] };
  }
  const cuts = (Array.isArray(read) ? read : []).map((one) => ({
    id: String(one?.id ?? ""),
    title: String(one?.title ?? ""),
    from: Date.parse(String(one?.from ?? "")),
    to: Date.parse(String(one?.to ?? "")),
  }));
  const faults = [];
  if (!cuts.length) faults.push(`${CUTS} names no chapter`);
  cuts.forEach((one, at) => {
    if (!one.id || !one.title)
      faults.push(`chapter ${at + 1} carries no id or no title`);
    if (!(one.from < one.to)) faults.push(`${one.id} ends before it starts`);
    const next = cuts[at + 1];
    if (next && next.from !== one.to) {
      faults.push(
        `${one.id} ends apart from where ${next.id} starts: a gap or an overlap`,
      );
    }
  });
  return { faults, cuts };
}

// Every timed line placed in its chapter, as line ranges per file, and the lines no chapter holds. [[spec/guidance/retro/chapter]]
export function placed(cuts, files) {
  const out = new Map(cuts.map((one) => [one.id, { lines: {}, count: 0 }]));
  let outside = 0;
  for (const file of files) {
    file.times.forEach((when, at) => {
      if (!Number.isFinite(when)) return;
      const one = cuts.find((cut) => when >= cut.from && when < cut.to);
      if (!one) {
        outside += 1;
        return;
      }
      const held = out.get(one.id);
      if (!held.lines[file.path]) held.lines[file.path] = [];
      const ranges = held.lines[file.path];
      const line = at + 1;
      const last = ranges.at(-1);
      if (last && last[1] === line - 1) last[1] = line;
      else ranges.push([line, line]);
      held.count += 1;
    });
  }
  return { chapters: out, outside };
}

// The verb: refuses a gap, an overlap or a line past every chapter, and writes each chapter's lines. [[spec/guidance/retro/chapter]]
export function chapters(it, name) {
  const home = name ? homeOf(it, name) : "";
  const at = home ? it.join(home, CUTS) : "";
  if (!at || !it.disk.exists(at)) {
    console.error(
      `retro chapters reads ${CUTS} in the retro's folder, and none stands.`,
    );
    console.error(
      "Run ./RUNME.sh retro timeline <retro>, cut the window, and write the cuts there.",
    );
    return 2;
  }
  const { faults, cuts } = cutsOf(it.disk.read(at));
  const { chapters: held, outside } = faults.length
    ? { chapters: new Map(), outside: 0 }
    : placed(cuts, timedFiles(it, name));
  if (outside) faults.push(`${outside} timed line(s) fall past every chapter`);
  if (faults.length) {
    for (const one of faults) console.error(one);
    return 1;
  }
  it.disk.makeDir(it.join(home, CHAPTERS));
  for (const one of cuts) {
    const said = held.get(one.id);
    const record = {
      id: one.id,
      title: one.title,
      from: new Date(one.from).toISOString(),
      to: new Date(one.to).toISOString(),
      lines: said.lines,
      commits: commitsIn(it, one),
    };
    it.disk.write(
      it.join(home, CHAPTERS, `${one.id}.json`),
      `${JSON.stringify(record, null, 2)}\n`,
    );
    console.log(
      `${one.id}  ${record.from} to ${record.to}  ${said.count} line(s)  ${one.title}`,
    );
  }
  return 0;
}

function commitsIn(it, one) {
  const said = it.git?.run(
    [
      "log",
      "--format=%h %s",
      `--since=${new Date(one.from).toISOString()}`,
      `--until=${new Date(one.to).toISOString()}`,
    ],
    true,
  );
  return String(said?.out ?? "")
    .split("\n")
    .filter(Boolean);
}

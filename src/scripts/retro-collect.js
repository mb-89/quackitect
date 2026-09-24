// The retro's collect, its first step. It moves everything the private folder
// holds, past the dot folders, into the retro's own input folder, and copies
// the transcripts, the memory and the scratchpads beside it. After it, the
// private folder holds the runtime folder and the retro folder alone.
// [[spec/guidance/retro/collect]]

import { LOG, PRIVATE, RETRO } from "../../.claude/skills/level0/lib/folders.js";
import { STAMP, saysGreen, stampOf } from "../../.claude/skills/level0/lib/runs.js";
import { BATTERY } from "../engine/retro/effect.js";
import { medianParts } from "./battery.js";
import { holdsAnywhere } from "./guidance-hand.js";
import { outsideInto } from "./retro-outside.js";

const INPUT = "input";
const MANIFEST = "manifest.jsonl";
// The boundary the next retro opens at: when this one collects. [[spec/guidance/retro/collect]]
const COLLECTED = "collected.json";
const DOT = ".";
// The one dot folder collect drains: a running session writes the log through a retro, and the log is history. [[spec/guidance/retro/collect]]
const DRAINED = LOG.split("/").at(-1);
const DRAINED_INTO = "log";
// The column a source name fills, so the counts stand in one line down the page. [[spec/guidance/retro/collect]]
const SOURCE_WIDTH = 12;

// [[spec/guidance/retro/collect]]
export function collect(it, name, again = false) {
  if (!name) {
    console.error("retro collect names the retro it collects for:");
    console.error("  ./RUNME.sh retro collect <retro>");
    return 2;
  }

  // A move while a hand works takes the file it reads, so collect runs with no other hold standing. [[spec/guidance/retro/collect]]
  const holding = holdsAnywhere(it);
  if (holding && String(holding.held?.ticket ?? "") !== name) {
    console.error(`${holding.at} stands, and a hand holds a ticket while it works.`);
    console.error("Hand that step back, then run collect again.");
    return 1;
  }

  const home = it.join(it.root, ...RETRO.split("/"), name);
  const into = it.join(home, INPUT);
  // A step names this verb as its evidence, and a gate runs that evidence again. So a second run answers what the first recorded, because the live session writes its log again the moment collect ends. [[spec/guidance/retro/collect]]
  if (!again && it.disk.exists(it.join(into, MANIFEST))) {
    const record = parsed(read(it, it.join(home, COLLECTED)));
    // A count derives off the manifest, so no record carries one. [[spec/guidance/retro/collect]]
    const refusals = read(it, it.join(into, MANIFEST))
      .split("\n")
      .filter((row) => parsed(row)?.refused).length;
    console.log(
      `${RETRO}/${name}/${INPUT} holds a whole run already, and this one changes nothing.`,
    );
    if (refusals) console.error(`  that run records ${refusals} refused file(s).`);
    return record && !refusals ? 0 : 1;
  }

  // A retro opens on a battery green at this commit, with no warning standing. [[spec/guidance/retro/collect]]
  const battery = batteryOf(it);
  if (!battery.green) {
    console.error(
      `A retro opens on a green battery with no warning, and ${battery.says}.`,
    );
    console.error(
      "Fix what the check names, commit, run ./RUNME.sh check, then collect again.",
    );
    return 1;
  }

  // A torn run holds files it moves, so the next run carries on where it stops, and deletes nothing. [[spec/guidance/retro/collect]]
  // A second pass takes what arrives past this retro's own collect, and merges it into the same input. [[spec/guidance/retro/collect]]
  const since = again ? ownAt(it, home) || sinceLast(it, name) : sinceLast(it, name);
  it.disk.makeDir(into);
  const moved = movedInto(it, into);
  const outside = outsideInto(it, into, since);
  const refused = [...moved.refused, ...outside.refused];

  const rows = [...linesOf(it, into), ...refused];
  it.disk.write(
    it.join(into, MANIFEST),
    `${rows.map((one) => JSON.stringify(one)).join("\n")}\n`,
  );
  const counts = countsOf(rows);
  const at = it.clock.now().toISOString();
  it.disk.write(
    it.join(home, COLLECTED),
    `${JSON.stringify({ at, since: since ? new Date(since).toISOString() : "", folders: outside.folders }, null, 2)}\n`,
  );
  // The battery's report the retro opens on, kept one a retro, so the next effect step reads the two side by side. [[spec/guidance/retro/effect]]
  const report = keptReport(parsed(read(it, it.join(it.root, ...STAMP.split("/")))));
  if (report) it.disk.write(it.join(home, BATTERY), `${JSON.stringify(report, null, 2)}\n`);

  said(name, counts, outside.folders, since);
  for (const one of refused) console.error(`  refused ${one.path}: ${one.refused}`);
  return stands(it) && !refused.length ? 0 : 1;
}

// The parts read as their median over the runs the stamp keeps, and the slowest cases and the files stay off the last run. [[spec/guidance/retro/effect]]
export function keptReport(stamp) {
  const report = stamp?.battery;
  if (!report) return null;
  const runs = Array.isArray(stamp.runs) && stamp.runs.length ? stamp.runs : [report.parts ?? {}];
  const parts = medianParts(runs);
  const total = Object.values(parts).reduce((sum, ms) => sum + ms, 0);
  return { ...report, parts, total, runs: runs.length };
}

// Every entry straight under the private folder moves whole, a folder with all it holds. A dot folder stays, and the log is the one dot folder that moves. [[spec/guidance/retro/collect]]
function movedInto(it, into) {
  const from = it.join(it.root, PRIVATE);
  const out = { refused: [] };
  for (const one of listed(it, from)) {
    if (one.name.startsWith(DOT) && one.name !== DRAINED) continue;
    const was = it.join(from, one.name);
    const now = it.join(into, one.name === DRAINED ? DRAINED_INTO : one.name);
    try {
      // A folder the input holds already takes the new files beside the old ones. [[spec/guidance/retro/collect]]
      if (one.kind === "dir" && it.disk.exists(now))
        throw Object.assign(new Error("stands"), { code: "EEXIST" });
      it.disk.move(was, freeName(it, now));
    } catch (error) {
      // A folder an editor watches refuses the rename, and its files still move one at a time. [[spec/guidance/retro/collect]]
      if (
        one.kind === "dir" &&
        fileByFile(it, was, now, `${PRIVATE}/${one.name}`, out)
      ) {
        it.disk.remove(was);
        continue;
      }
      out.refused.push({ path: `${PRIVATE}/${one.name}`, refused: reasonOf(error) });
    }
  }
  return out;
}

// Moves every file a folder holds, and answers whether none stays behind. [[spec/guidance/retro/collect]]
function fileByFile(it, was, now, path, out) {
  let whole = true;
  for (const one of listed(it, was)) {
    const from = it.join(was, one.name);
    const to = it.join(now, one.name);
    if (one.kind === "dir") {
      whole = fileByFile(it, from, to, `${path}/${one.name}`, out) && whole;
      continue;
    }
    try {
      it.disk.makeDir(now);
      it.disk.move(from, freeName(it, to));
    } catch (error) {
      out.refused.push({ path: `${path}/${one.name}`, refused: reasonOf(error) });
      whole = false;
    }
  }
  return whole;
}

// The stamp the last check wrote, read against the commit standing now. [[spec/guidance/retro/collect]]
function batteryOf(it) {
  const stamp = stampOf(read(it, it.join(it.root, ...STAMP.split("/"))));
  const sha = String(it.git?.run(["rev-parse", "HEAD"], true)?.out ?? "").trim();
  const said = saysGreen(stamp, sha);
  if (!said.green) return said;
  if (stamp.warned) return { green: false, says: "a warning stands in the check" };
  return said;
}

// A name the input holds already takes a number before its extension, so a second pass overwrites nothing. [[spec/guidance/retro/collect]]
function freeName(it, at) {
  if (!it.disk.exists(at)) return at;
  const dot = at.lastIndexOf(".");
  const cut =
    dot > Math.max(at.lastIndexOf("/"), at.lastIndexOf("\\")) ? dot : at.length;
  for (let n = 2; ; n++) {
    const next = `${at.slice(0, cut)}.${n}${at.slice(cut)}`;
    if (!it.disk.exists(next)) return next;
  }
}

// When this retro's own collect ran, which opens the window of a second pass. [[spec/guidance/retro/collect]]
function ownAt(it, home) {
  const when = Date.parse(String(parsed(read(it, it.join(home, COLLECTED)))?.at ?? ""));
  return Number.isFinite(when) ? when : 0;
}

function reasonOf(error) {
  return error?.code ?? error?.message ?? String(error);
}

// The last retro's collect opens this window, and a retro with none before it takes everything. [[spec/guidance/retro/collect]]
function sinceLast(it, name) {
  const at = it.join(it.root, ...RETRO.split("/"));
  let newest = 0;
  for (const one of listed(it, at)) {
    if (one.kind !== "dir" || one.name === name) continue;
    const said = parsed(read(it, it.join(at, one.name, COLLECTED)));
    const when = Date.parse(String(said?.at ?? ""));
    if (Number.isFinite(when) && when > newest) newest = when;
  }
  return newest;
}

// One line a file the input folder holds, naming the source it comes from. [[spec/guidance/retro/collect]]
function linesOf(it, into, rel = "") {
  const at = rel ? it.join(into, ...rel.split("/")) : into;
  const out = [];
  for (const one of listed(it, at)) {
    const path = rel ? `${rel}/${one.name}` : one.name;
    if (path === MANIFEST) continue;
    if (one.kind === "dir") {
      out.push(...linesOf(it, into, path));
      continue;
    }
    out.push({
      path,
      size: it.disk.size(it.join(into, ...path.split("/"))),
      from: sourceOf(path),
    });
  }
  return out;
}

function sourceOf(path) {
  const top = path.split("/")[0];
  return ["transcripts", "memory", "scratch"].includes(top) ? top : PRIVATE;
}

function countsOf(rows) {
  const out = {};
  for (const one of rows) {
    const key = one.refused ? "refused" : one.from;
    out[key] = (out[key] ?? 0) + 1;
  }
  return out;
}

// What stands straight under the private folder past the two dot folders, which a clean collect leaves empty. [[spec/guidance/retro/collect]]
function stands(it) {
  const left = listed(it, it.join(it.root, PRIVATE)).filter(
    (one) => !one.name.startsWith(DOT),
  );
  for (const one of left)
    console.error(`  ${PRIVATE}/${one.name} still stands beside the dot folders.`);
  return !left.length;
}

// The count by source, because a short answer reads like a whole one. [[spec/guidance/retro/collect]]
function said(name, counts, folders, since) {
  const window = since
    ? `since ${new Date(since).toISOString()}`
    : "with no retro before it, so everything";
  console.log(`${RETRO}/${name}/${INPUT} collects ${window}.`);
  for (const [key, count] of Object.entries(counts))
    console.log(`  ${key.padEnd(SOURCE_WIDTH)} ${count} file(s)`);
  for (const one of folders) console.log(`  from ${one}`);
}

function listed(it, at) {
  try {
    return it.disk.exists(at) ? it.disk.list(at) : [];
  } catch {
    return [];
  }
}

function read(it, at) {
  try {
    return it.disk.exists(at) ? it.disk.read(at) : "";
  } catch {
    return "";
  }
}

function parsed(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

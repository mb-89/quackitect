// The retro's collect, its first step. It moves everything the private folder
// holds, past the dot folders, into the retro's own input folder, and copies
// the transcripts, the memory and the scratchpads beside it. After it, the
// private folder holds the runtime folder and the retro folder alone.
// [[spec/guidance/retro/collect]]

import { PRIVATE, RETRO } from "../../.claude/skills/level0/lib/folders.js";
import { holdsAnywhere } from "./guidance-hand.js";
import { outsideInto } from "./retro-outside.js";

const INPUT = "input";
const MANIFEST = "manifest.jsonl";
// The boundary the next retro opens at: when this one collects. [[spec/guidance/retro/collect]]
const COLLECTED = "collected.json";
const DOT = ".";
// The column a source name fills, so the counts stand in one line down the page. [[spec/guidance/retro/collect]]
const SOURCE_WIDTH = 12;

// [[spec/guidance/retro/collect]]
export function collect(it, name) {
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
  // A step names this verb as its evidence, and a gate runs that evidence again. So a second run answers the first. [[spec/guidance/retro/collect]]
  if (it.disk.exists(it.join(into, MANIFEST))) {
    console.log(
      `${RETRO}/${name}/${INPUT} holds a whole run already, and this one changes nothing.`,
    );
    return stands(it) ? 0 : 1;
  }

  // A torn run holds files it moves, so the next run carries on where it stops, and deletes nothing. [[spec/guidance/retro/collect]]
  const since = sinceLast(it, name);
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
    `${JSON.stringify({ at, since: since ? new Date(since).toISOString() : "", counts, folders: outside.folders }, null, 2)}\n`,
  );

  said(name, counts, outside.folders, since);
  for (const one of refused) console.error(`  refused ${one.path}: ${one.refused}`);
  return stands(it) && !refused.length ? 0 : 1;
}

// Every entry straight under the private folder past a dot moves whole, a folder with all it holds. [[spec/guidance/retro/collect]]
function movedInto(it, into) {
  const from = it.join(it.root, PRIVATE);
  const out = { refused: [] };
  for (const one of listed(it, from)) {
    if (one.name.startsWith(DOT)) continue;
    const was = it.join(from, one.name);
    try {
      it.disk.move(was, it.join(into, one.name));
    } catch (error) {
      out.refused.push({
        path: `${PRIVATE}/${one.name}`,
        refused: error?.code ?? error?.message ?? String(error),
      });
    }
  }
  return out;
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

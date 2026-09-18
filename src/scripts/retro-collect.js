// The retro's collect: it copies the private folder into the retro's own,
// passes the two folders the owner names, and writes a manifest naming every
// line it takes. The note drain stands in retro.js beside this file.
// [[spec/design_input/the-agent-pulls-tickets]]

import { holdsAnywhere } from "./guidance-hand.js";
import { leavesOut } from "./retro-leaves.js";

const PRIVATE = ".se";
const RETRO = "retro";
// The two folders collect passes: the state a box keeps while it works, and its own copies. [[spec/tickets/the-retro-takes-the-box]]
const SKIPS = ["runtime", RETRO];
const MANIFEST = "manifest.jsonl";
// The folders an outside source lands in, so a reader tells them from the rest. [[spec/tickets/the-retro-takes-the-box]]
const OUTSIDE = [
  { key: "scratch", into: "scratch" },
  { key: "transcripts", into: "transcripts" },
];

// [[spec/design_input/the-agent-pulls-tickets]]
export function collect(it, name) {
  if (!name) {
    console.error("retro collect names the ticket it collects for:");
    console.error("  ./RUNME.sh retro collect <ticket>");
    return 2;
  }

  // The retro's own first leaf is a hold, so collect passes that one and refuses the rest. [[spec/tickets/the-retro-takes-the-box]]
  const holding = holdsAnywhere(it);
  if (holding && String(holding.held?.ticket ?? "") !== name) {
    console.error(`${holding.at} stands, and a hand holds a ticket while it works.`);
    console.error("Hand that step back, then run collect again.");
    return 1;
  }

  const from = it.join(it.root, PRIVATE);
  const into = it.join(from, RETRO, name);
  // A step names this verb as its evidence, and a gate runs that evidence again. So a second run answers the first. [[spec/tickets/the-retro-takes-the-box]]
  if (it.disk.exists(it.join(into, MANIFEST))) {
    console.log(
      `${PRIVATE}/${RETRO}/${name} holds a whole run already, and this one changes nothing.`,
    );
    return 0;
  }

  // A folder carrying no manifest holds a torn run, so nothing of it survives this one. [[spec/tickets/the-retro-takes-the-box]]
  if (it.disk.exists(into)) it.disk.remove(into);

  const rows = copied(it, from, into, kept(it, from), PRIVATE);
  for (const one of OUTSIDE) {
    const where = String(it[one.key] ?? "").trim();
    if (!where) continue;
    rows.push(...copied(it, where, it.join(into, one.into), under(it, where), one.key));
  }

  it.disk.makeDir(into);
  // Each leaf of the retro's own reading takes a file, named in the manifest beside the copies. [[spec/tickets/the-retro-lays-its-leaves]]
  rows.push(...leavesOut(it, into, rows));
  it.disk.write(
    it.join(into, MANIFEST),
    `${rows.map((one) => JSON.stringify(one)).join("\n")}\n`,
  );
  console.log(
    `${PRIVATE}/${RETRO}/${name} holds the run, and its manifest names every line.`,
  );
  return 0;
}

// Every path under the private folder the two skips leave standing. [[spec/tickets/the-retro-takes-the-box]]
function kept(it, from) {
  return under(it, from).filter((path) => !SKIPS.includes(path.split("/")[0]));
}

// [[spec/design_input/the-agent-pulls-tickets]]
function under(it, from, rel = "") {
  const at = rel ? it.join(from, ...rel.split("/")) : from;
  const out = [];
  for (const one of listed(it, at)) {
    const path = rel ? `${rel}/${one.name}` : one.name;
    if (one.kind === "dir") out.push(...under(it, from, path));
    else out.push(path);
  }
  return out;
}

// [[spec/design_input/the-agent-pulls-tickets]]
function copied(it, from, into, paths, source) {
  const rows = [];
  for (const path of paths) {
    const parts = path.split("/");
    const holder = parts.slice(0, -1);
    it.disk.makeDir(holder.length ? it.join(into, ...holder) : into);
    try {
      // The copy carries bytes, because an archive under the private folder is no text. [[spec/tickets/the-retro-takes-the-box]]
      it.disk.copy(it.join(from, ...parts), it.join(into, ...parts));
      rows.push({ path, size: it.disk.size(it.join(from, ...parts)), from: source });
    } catch (bad) {
      // A file the copy refuses takes a line of its own, so the manifest names every path. [[spec/tickets/the-retro-takes-the-box]]
      rows.push({ path, from: source, refused: String(bad?.message ?? bad) });
    }
  }
  return rows;
}

function listed(it, at) {
  try {
    return it.disk.exists(at) ? it.disk.list(at) : [];
  } catch {
    return [];
  }
}

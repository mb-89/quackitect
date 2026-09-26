// A hand-back lands: the ticket goes to disk, the tree stages, and one commit
// names the ticket and what changes. A commit the hook refuses lands nothing.
// [[spec/design_output/pull#the-refused-commit]]

import { FOLDER as UNDONE } from "../../.claude/skills/level0/lib/undo.js";
import { everyHold } from "./guidance-hand.js";

// The hand's own paths stage beside the ticket, and a hand writing through no journal hands back the tree the other hands' journals leave. [[spec/design_output/pull#the-refused-commit]]
export function landed(it, one, changes, also = []) {
  const paths = journaled(it, one.name);
  if (paths.mine.length)
    return landing(it, one, changes, unique([one.at, ...also, ...paths.mine]));
  return landing(it, one, changes, null, paths.theirs);
}

// A landing the engine makes on the side stages the ticket files it writes, and a hand's edits stay out of a commit naming another ticket. [[spec/design_output/pull#the-refused-commit]]
export function landedAlone(it, one, changes, also = []) {
  return landing(it, one, changes, [one.at, ...also]);
}

function landing(it, one, changes, paths, kept = []) {
  const stood = it.disk.exists(one.at) ? it.disk.read(one.at) : "";
  it.disk.write(one.at, one.text);
  if (one.private) return "";
  it.git.run(paths ? ["add", "--", ...paths] : ["add", "-A"], true);
  if (!paths && kept.length) it.git.run(["reset", "-q", "--", ...kept], true);
  const commit = ["commit", "-m", `${one.name}: ${changes.join(", ")}`];
  const ran = it.git.run(paths ? [...commit, "--", ...paths] : commit, true);
  if (ran.ok) return "";
  it.git.run(paths ? ["reset", "-q", "--", ...paths] : ["reset", "-q"], true);
  it.disk.write(one.at, stood);
  return ran.err || ran.out || "the commit answers nothing";
}

// The files the undo journals name since the hold took the ticket, the ticket's own apart from every other ticket's. [[spec/design_output/pull#the-refused-commit]]
function journaled(it, name) {
  const out = { mine: [], theirs: [] };
  if (!it.root || !it.join) return out;
  const folder = it.join(it.root, ...UNDONE.split("/"));
  if (!it.disk.exists(folder)) return out;
  const taken = takenOf(it, name);
  for (const row of it.disk.list(folder)) {
    if (row.kind !== "file" || !row.name.endsWith(".json")) continue;
    const entry = parsed(it.disk.read(it.join(folder, row.name)));
    if (!entry?.ticket || String(entry.at ?? "") < taken) continue;
    const into = entry.ticket === name ? out.mine : out.theirs;
    for (const one of entry.files ?? []) into.push(inTree(it, String(one.file)));
  }
  out.mine = unique(out.mine);
  out.theirs = unique(out.theirs).filter((one) => !out.mine.includes(one));
  return out;
}

function takenOf(it, name) {
  const found = everyHold(it).find(({ held }) => held?.ticket === name);
  return String(found?.held?.taken ?? "");
}

function inTree(it, file) {
  return /^([A-Za-z]:)?[\\/]/.test(file) ? file : it.join(it.root, ...file.split("/"));
}

function parsed(text) {
  try {
    return JSON.parse(String(text));
  } catch {
    return null;
  }
}

function unique(paths) {
  return [...new Set(paths)];
}

export function unlandedRows(one, leaf, finding) {
  return [
    "the hook refuses the commit, so nothing lands:",
    ...finding.split("\n").filter(Boolean),
    "",
    `Fix it, and ${one.name} stays in hand at ${leaf.path}.`,
  ];
}

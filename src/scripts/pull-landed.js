// A hand-back lands: the ticket goes to disk, the tree stages, and one commit
// names the ticket and what changes. A commit the hook refuses lands nothing.
// [[spec/design_output/pull#the-refused-commit]]

import { stagedFault, unmergedFault } from "../../.claude/skills/level0/lib/markers.js";
import { FOLDER as UNDONE } from "../../.claude/skills/level0/lib/undo.js";
import { holdsIn } from "./ephemeral.js";

// The hand's own paths stage beside the ticket, and a hand writing through no journal hands back the tree the other hands' journals leave. [[spec/design_output/pull#the-refused-commit]]
export function landed(it, one, changes, also = []) {
  const paths = journaled(it, one.name);
  if (paths.mine.length)
    return landing(
      it,
      one,
      changes,
      tracked(it, unique([one.at, ...also, ...paths.mine])),
    );
  return landing(it, one, changes, null, paths.theirs);
}

// A journal names files git ignores, the handover among them, and git refuses a commit naming one. [[spec/design_output/pull#the-refused-commit]]
function tracked(it, paths) {
  const ran = it.git.run(["check-ignore", "--", ...paths], true);
  const ignored = new Set(
    String(ran.out ?? "")
      .split("\n")
      .map((row) => row.trim())
      .filter(Boolean),
  );
  return paths.filter((one) => !ignored.has(one) && standsSomewhere(it, one));
}

// A move leaves its old path in the journal, standing nowhere on disk and nowhere in git, and git refuses a commit naming it. A tracked path gone from disk still stages, as a deletion. [[spec/design_output/pull#the-refused-commit]]
function standsSomewhere(it, path) {
  if (it.disk.exists(path)) return true;
  return it.git.run(["ls-files", "--error-unmatch", "--", path], true).ok;
}

// A landing the engine makes on the side stages the ticket files it writes, and a hand's edits stay out of a commit naming another ticket. [[spec/design_output/pull#the-refused-commit]]
export function landedAlone(it, one, changes, also = []) {
  return landing(it, one, changes, [one.at, ...also]);
}

// A merge standing unresolved refuses the landing before anything stages, and a marker the index carries refuses it before the commit. [[spec/design_output/work#no-commit-carries-a-marker]]
function landing(it, one, changes, paths, kept = []) {
  const merging = one.private ? "" : unmergedFault(it.git);
  if (merging) return merging;
  const stood = it.disk.exists(one.at) ? it.disk.read(one.at) : "";
  it.disk.write(one.at, one.text);
  if (one.private) return "";
  it.git.run(paths ? ["add", "--", ...paths] : ["add", "-A"], true);
  if (!paths && kept.length) it.git.run(["reset", "-q", "--", ...kept], true);
  const only = paths ? ["--", ...paths] : [];
  const marked = stagedFault(it.git, only);
  const commit = ["commit", "-m", `${one.name}: ${changes.join(", ")}`];
  const ran = marked
    ? { ok: false, err: marked }
    : it.git.run([...commit, ...only], true);
  if (ran.ok) return "";
  it.git.run(["reset", "-q", ...only], true);
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
    // [[spec/design_output/apply#a-first-fault-writes-nothing]]
    if (entry.landed === false) continue;
    const into = entry.ticket === name ? out.mine : out.theirs;
    for (const one of entry.files ?? []) into.push(inTree(it, String(one.file)));
  }
  out.mine = unique(out.mine);
  out.theirs = unique(out.theirs).filter((one) => !out.mine.includes(one));
  return out;
}

function takenOf(it, name) {
  const found = holdsIn(it.disk, it.root).find(({ held }) => held?.ticket === name);
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

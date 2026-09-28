// The marks a conflicted merge leaves in a file, and the paths git lists
// unmerged while it stands. A commit carrying either lands nowhere, and the
// write door, the commit door and the sweep read the same marks.
// [[spec/design_output/work#no-commit-carries-a-marker]]

import { addedIn } from "./private.js";

export const RULE = "NoConflictMarkers";
export const BASE = 1;
export const OURS = 2;
export const THEIRS = 3;

const OPENS = /^<{7}(?: |$)/;
const PARTS = /^(?:={7}|\|{7}(?: .*)?)$/;
const SHUTS = /^>{7}(?: |$)/;
const UNMERGED = /^\d+ [0-9a-f]+ ([123])\t(.+)$/;

// An opener marks alone, and a split or a closer marks past an opener, so a setext underline stays prose. [[spec/design_output/work#no-commit-carries-a-marker]]
export function markersIn(text) {
  const out = [];
  let open = false;
  String(text ?? "")
    .split(/\r?\n/)
    .forEach((line, at) => {
      if (OPENS.test(line)) open = true;
      else if (!open || !(PARTS.test(line) || SHUTS.test(line))) return;
      if (SHUTS.test(line)) open = false;
      out.push(at + 1);
    });
  return out;
}

// The openers a staged delta adds, each with its file and line. [[spec/design_output/work#no-commit-carries-a-marker]]
export function markedIn(delta) {
  return addedIn(delta)
    .filter((one) => OPENS.test(one.text))
    .map((one) => ({ file: one.file, line: one.line }));
}

// Each path git lists unmerged, with the stages it holds: the base, ours and theirs. [[spec/design_output/work#no-commit-carries-a-marker]]
export function stagesIn(said) {
  const out = new Map();
  for (const row of String(said ?? "").split(/\r?\n/)) {
    const found = UNMERGED.exec(row.trim());
    if (!found) continue;
    const held = out.get(found[2]) ?? new Set();
    held.add(Number(found[1]));
    out.set(found[2], held);
  }
  return out;
}

export function unmergedIn(git) {
  return stagesIn(git.run(["ls-files", "-u"], true).out);
}

export function stagedMarkers(git, only = []) {
  return markedIn(git.run(["diff", "--cached", "--unified=0", ...only], true).out);
}

// The refusal every commit road answers, naming each file. [[spec/design_output/work#no-commit-carries-a-marker]]
export function mergeRefusal(unmerged = [], marked = []) {
  if (!unmerged.length && !marked.length) return "";
  return [
    "A merge stands unresolved, so no commit lands:",
    ...unmerged.map((path) => `  ${path}  git lists it unmerged`),
    ...marked.map((one) => `  ${one.file}:${one.line}  a conflict marker`),
    "Resolve the merge first: write each file without its markers, then land the merge with ./RUNME.sh commit.",
  ].join("\n");
}

// What a step verb meets before it stages: any unmerged path refuses it, so no step commit concludes a merge. [[spec/design_output/work#no-commit-carries-a-marker]]
export function unmergedFault(git) {
  return mergeRefusal([...unmergedIn(git).keys()]);
}

// What a verb meets once it stages: a marker the index carries refuses it. [[spec/design_output/work#no-commit-carries-a-marker]]
export function stagedFault(git, only = []) {
  return mergeRefusal([], stagedMarkers(git, only));
}

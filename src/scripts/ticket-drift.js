// The drift a person writes into a route: each step past the reached leaves
// that differs from the process version the ticket copied. `process_hash`
// names that version, and the git history holds it.
// [[spec/design_input/the-editor-draws-the-ticket#the-engine-answers-the-editor]]

import { entriesIn, processHash, readYaml } from "../../.claude/skills/level0/lib/schema.js";
import { fieldsOf, reachedOf, sameStep } from "./ticket-route.js";

// The steps a ticket's version of its process held, off the first commit whose file answers the hash, or null. [[spec/design_input/the-editor-draws-the-ticket#the-engine-answers-the-editor]]
export function baseOf(git, path, hash) {
  if (!git?.run || !path || !hash) return null;
  const said = git.run(["log", "--format=%H", "--", path], true);
  if (!said.ok) return null;
  for (const sha of said.out.split("\n").map((one) => one.trim()).filter(Boolean)) {
    const text = git.show(`${sha}:${path}`);
    if (text && processHash(text) === hash) return [readYaml(text).steps ?? []].flat();
  }
  return null;
}

// Each step past the reached leaves that stands added, changed, moved or dropped against the base. A phase compares every field but steps. [[spec/design_input/the-editor-draws-the-ticket#the-engine-answers-the-editor]]
export function driftOf(front, base) {
  const reached = reachedOf(front);
  const mine = entriesIn(front?.steps, "steps").filter((one) => !reached.has(one.path));
  const theirs = entriesIn(base, "steps").filter((one) => !reached.has(one.path));
  const byPath = new Map(theirs.map((one) => [one.path, one]));
  const out = [];
  for (const one of mine) {
    const was = byPath.get(one.path);
    if (!was || !same(one, was)) out.push(one.path);
  }
  const kept = new Set(mine.map((one) => one.path));
  for (const one of theirs) if (!kept.has(one.path)) out.push(one.path);

  const order = (list) => list.map((one) => one.path).filter((path) => !out.includes(path));
  const ours = order(mine).filter((path) => byPath.has(path));
  const copied = order(theirs).filter((path) => kept.has(path));
  const moved = ours.find((path, i) => copied[i] !== path);
  if (moved) out.push(moved);
  return out;
}

function same(one, was) {
  return one.leaf
    ? sameStep(one.said, was.said)
    : sameStep(fieldsOf(one.said), fieldsOf(was.said));
}

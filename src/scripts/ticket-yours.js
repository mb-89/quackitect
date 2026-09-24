// The yours verb: the tickets waiting on a person, in the order the queue
// hands them out. A ticket waits on a person where it stands open and the leaf
// its pointer names carries `by: person`. Each road answers one JSON object.
// [[spec/design_input/the-editor-draws-the-ticket#the-work-group]]

import { entriesIn, readNote } from "../../.claude/skills/level0/lib/schema.js";
import { todoOf } from "../engine/group.js";
import { PERSON } from "./pull-hand-of.js";
import { sorted, ticketsHere, weighing } from "./pull-hand.js";

// [[spec/design_input/the-editor-draws-the-ticket#the-work-group]]
export function waiting(all) {
  return [all ?? []].flat().filter((one) => {
    const front = frontIn(one);
    if (String(front.state ?? "") !== "open") return false;
    const step = String(front.step ?? "").trim();
    const leaf = entriesIn(front.steps, "steps").find(
      (it) => it.leaf && it.path === step,
    );
    return String(leaf?.said?.by ?? "") === PERSON;
  });
}

// The pool order `handOut` reads: a tagged ticket first, then the score. [[spec/design_output/pull#the-queue-is-a-score]]
export function yours(it, argv) {
  const all = ticketsHere(it);
  const at = weighing(it, all);
  const found = waiting(all);
  const tagged = found.filter((one) => todoOf(frontIn(one)) !== "");
  const rest = found.filter((one) => todoOf(frontIn(one)) === "");
  const queue = [...sorted(tagged, at), ...sorted(rest, at)].map(rowOf);

  const flags = new Set(argv ?? []);
  if (flags.has("--count")) return answer({ count: queue.length });
  if (flags.has("--next")) return answer(queue[0] ?? { ticket: null });
  return answer({ tickets: queue });
}

function rowOf(one) {
  return { ticket: one.name, path: one.path, step: String(frontIn(one).step ?? "") };
}

function frontIn(one) {
  return one.front ?? readNote(one.text).front.said ?? {};
}

function answer(said) {
  console.log(JSON.stringify(said));
  return 0;
}

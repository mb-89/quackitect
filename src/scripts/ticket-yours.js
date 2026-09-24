// The yours verb: the tickets waiting on a person, in the order the queue
// hands them out. A ticket waits on a person where it stands open and the leaf
// its pointer names carries `by: person`. Each road answers one JSON object.
// [[spec/design_input/the-editor-draws-the-ticket#the-work-group]]

import { frontOf } from "../engine/group.js";
import { PERSON } from "./pull-hand-of.js";
import { taggedFirst, ticketsHere, weighing } from "./pull-hand.js";
import { leafOf, stepPathOf } from "./pull-route.js";

// [[spec/design_input/the-editor-draws-the-ticket#the-work-group]]
export function waiting(all) {
  return [all ?? []].flat().filter((one) => {
    const front = frontIn(one);
    if (String(front.state ?? "") !== "open") return false;
    return leafOf(front, stepPathOf(front))?.by === PERSON;
  });
}

// The order `taggedFirst` holds, which the pull reads too. [[spec/design_output/pull#the-queue-is-a-score]]
export function yours(it, argv) {
  const all = ticketsHere(it);
  const at = weighing(it, all);
  const queue = taggedFirst(waiting(all), at).map(rowOf);

  const flags = new Set(argv ?? []);
  if (flags.has("--count")) return answer({ count: queue.length });
  if (flags.has("--next")) return answer(queue[0] ?? { ticket: null });
  return answer({ tickets: queue });
}

function rowOf(one) {
  return { ticket: one.name, path: one.path, step: stepPathOf(frontIn(one)) };
}

function frontIn(one) {
  return one.front ?? frontOf(one.text);
}

function answer(said) {
  console.log(JSON.stringify(said));
  return 0;
}

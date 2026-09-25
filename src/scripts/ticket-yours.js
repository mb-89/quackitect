// The yours verb: the rows the work tab's queue holds on this box, in the
// order the outline places them. The verb reads the one answer the work tab
// reads. Each road answers one JSON object.
// [[spec/design_input/the-editor-draws-the-ticket#the-work-group]]

import { OPEN } from "../engine/group.js";
import { ticketsHere } from "./pull-hand.js";
import { CLOUD_PLACE, compareOutline } from "./pull-outline.js";
import { answerOf } from "./work-answer.js";

// The rows this box takes: every row the answer places, off the cloud, each name once. src/tui/work/workplaces.go counts the same rows behind the tab's name. [[spec/design_output/tui#the-work-tab]]
export function queueIn(answer) {
  const rows = new Map();
  for (const one of answer?.branches ?? []) {
    rows.set(one.name, one);
    for (const child of one.tickets ?? []) rows.set(child.name, child);
  }
  for (const one of answer?.loose ?? []) rows.set(one.name, one);
  return [...rows.values()]
    .filter((one) => one.queue && one.queue !== CLOUD_PLACE)
    .sort((left, right) => compareOutline(left.queue, right.queue));
}

// Pull for me takes the first open row of the queue at a person's step, so a note waiting for its retro stays out of it. [[spec/design_output/pull#the-queue-is-an-outline]]
export function yours(it, argv) {
  const paths = new Map(ticketsHere(it).map((one) => [one.name, one.path]));
  const queue = queueIn(answerOf(it, true)).map((one) => rowOf(one, paths));

  const flags = new Set(argv ?? []);
  if (flags.has("--next")) {
    const next = queue.find((one) => one.person && one.path && one.state === OPEN);
    return answer(
      next
        ? { ticket: next.ticket, path: next.path, step: next.step }
        : { ticket: null },
    );
  }
  return answer({ tickets: queue });
}

function rowOf(one, paths) {
  return {
    ticket: one.name,
    path: paths.get(one.name) ?? "",
    step: one.step ?? "",
    queue: one.queue,
    state: one.state ?? "",
    person: Boolean(one.person),
  };
}

function answer(said) {
  console.log(JSON.stringify(said));
  return 0;
}

// Writes the golden file the Go port of the queue replays: one run of the
// queue over this tree, its lists as rows, and the places it answers. Run it
// with node from the root where the queue in JavaScript moves.
// [[spec/tickets/the-queue-moves-to-plan]]

import { dependsOn, fieldOf, GROUP, todoOf, urgent } from "../../src/engine/group.js";
import { it as doors } from "../../src/scripts/cli-doors.js";
import { failsOn } from "../../src/scripts/pull-queue.js";
import { answerOf } from "../../src/scripts/work-answer.js";

const GOLDEN = ["src", "modules", "queue", "testdata"];
const FILE = "queue.golden.json";
const WEIGHTS = ["block", "day", "fail"];

// A row carries what the queue and the outline read off a ticket or a todo. [[spec/tickets/the-queue-moves-to-plan]]
export function rowOf(one) {
  return {
    name: one.name,
    path: one.path ?? "",
    group: fieldOf(one.text ?? "", GROUP),
    todo: todoOf(one.front ?? {}),
    urgent: urgent(one.text ?? ""),
    depends_on: dependsOn(one.front),
    fails: failsOn(one.front),
    order: one.order ?? 0,
  };
}

// [[spec/tickets/the-queue-moves-to-plan]]
export function goldenOf(said) {
  const paths = new Set(said.all.map((one) => one.path).filter(Boolean));
  const stood = [...said.at.stood].filter(([path]) => paths.has(path));
  return {
    persons: said.persons.map(rowOf),
    held: said.held.map(rowOf),
    agents: said.agents.map(rowOf),
    back: said.back.map(rowOf),
    all: said.all.map(rowOf),
    places: said.places,
    at: {
      now: said.at.now,
      weights: Object.fromEntries(
        WEIGHTS.map((key) => [key, Number(said.at.weights?.[key]) || 0]),
      ),
      stood: Object.fromEntries(stood),
    },
    answer: Object.fromEntries(said.answer),
  };
}

if (process.argv[1]?.endsWith("queue-golden.js")) {
  const root = doors.work;
  let caught = null;
  answerOf({
    root,
    method: root,
    ...doors,
    capture: (said) => {
      caught = said;
    },
  });
  const folder = doors.join(root, ...GOLDEN);
  doors.disk.makeDir(folder);
  doors.disk.write(
    doors.join(folder, FILE),
    `${JSON.stringify(goldenOf(caught), null, 2)}\n`,
  );
  console.log(`${[...GOLDEN, FILE].join("/")} holds ${caught.all.length} rows.`);
}

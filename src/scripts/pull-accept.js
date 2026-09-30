// The final acceptance: a gate carrying final waits on the work under it,
// reads the diff since its last verdict, and closes onto a question past its
// cap. The hand-back runs every command of the route, in pull.js.
// [[spec/design_output/pull#the-final-acceptance]]

import { TRUNK } from "../../.claude/skills/level0/lib/trunk.js";
import { CLOSED, fieldOf, frontOf, OPEN, TICKETS } from "../engine/group.js";
import { processAt } from "./process.js";
import { routedTicket, fromHold } from "./ticket.js";
import { became, entriesOf, returnsOf } from "./pull-writes.js";
import { REFUSED, say } from "./pull-route.js";

const GROUP_ROUTE = "group";
const QUESTION_ROUTE = "question";

// The open tickets naming this one as parent or group, as a reason to wait, or nothing where none stands open. [[spec/design_output/pull#the-final-acceptance]]
export function acceptWaits(one, all = []) {
  const open = all
    .filter((held) => held.name !== one.name && fieldOf(held.text, "state") !== CLOSED)
    .filter((held) =>
      ["parent", "group"].some((key) => fieldOf(held.text, key) === one.name),
    )
    .map((held) => held.name);
  return open.length ? `waits for ${open.join(", ")}, which the acceptance reads` : "";
}

// The commit the diff starts at: the last verdict's tip, else the first take, else a group's merge base with trunk. [[spec/design_output/pull#the-final-acceptance]]
export function acceptBase(it, one, leaf) {
  const entries = entriesOf(frontOf(one.text));
  const last = entries
    .filter(
      (one) => String(one.step) === leaf.path && String(one.hash_after ?? "").trim(),
    )
    .at(-1);
  if (last) return String(last.hash_after).trim();
  if (String(fieldOf(one.text, "process")).includes(GROUP_ROUTE)) {
    const said = it.git.run(["merge-base", `origin/${TRUNK}`, "HEAD"], true);
    if (said.ok) return String(said.out).trim();
  }
  return String(
    entries.find((one) => String(one.hash_before ?? "").trim())?.hash_before ?? "",
  ).trim();
}

// The rows the hand-out carries at a final gate. [[spec/design_output/pull#the-final-acceptance]]
export function acceptRows(it, one, leaf) {
  const base = acceptBase(it, one, leaf);
  const diff = base
    ? `the diff since ${base}, merges and all: git diff ${base}..HEAD`
    : "the whole diff of the ticket";
  return [
    "",
    `Read ${diff}. The hand-back runs every command field of the leaves before this gate.`,
  ];
}

// Whether this verdict short of accept passes the cap the fail reads. [[spec/design_output/pull#the-final-acceptance]]
export function acceptCapped(it, one, leaf) {
  const most = Number(it.fails);
  return most > 0 && returnsOf(frontOf(one.text), leaf.path) + 1 > most;
}

// Past the cap a question ticket carries the verdict to a person, and the process closes became onto it. [[spec/design_output/pull#the-final-acceptance]]
export function acceptAsks(it, who, one, leaf, held, reason, answered) {
  const route = processAt(it.disk, it.method ?? it.root, it.join, QUESTION_ROUTE);
  if (route.why) return unasked(one, leaf, route.why);
  const name = `${one.name}-question`;
  const path = `${TICKETS}/${name}.md`;
  const round = returnsOf(frontOf(one.text), leaf.path) + 1;
  const made = routedTicket(it, path, route, {
    steps: fromHold(route.route, { ticket: one.name, step: leaf.path }),
    line: `${leaf.path} of ${one.name} falls short of accept ${round} times: ${reason}`,
    fields: { state: OPEN, parent: one.name },
  });
  if (made.why) return unasked(one, leaf, `${name} mints nothing: ${made.why}`);
  const at = it.join(it.root, ...path.split("/"));
  it.disk.write(at, made.text);
  return became(it, who, one, leaf, held, name, answered, {
    changes: [`mints ${name}`],
    wrote: [at],
  });
}

function unasked(one, leaf, why) {
  say(REFUSED, [why, "", `Fix it, and ${one.name} stays in hand at ${leaf.path}.`]);
  return 1;
}

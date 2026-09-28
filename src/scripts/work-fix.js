// A group reaches done once every ticket a box can close stands closed. Work a
// person alone can do stands on the person route, and that alone leaves the
// group loose on main. A ticket a box mints on its branch joins its group.
// [[spec/design_output/work#a-box-leaves]]

import { TRUNK } from "../../.claude/skills/level0/lib/trunk.js";
import {
  CLOSED,
  fieldOf,
  GROUP,
  isGroup,
  NOTE_END,
  TICKETS,
  ticketNamed,
  WORK_BRANCH,
} from "../engine/group.js";
import { childrenHere } from "./work-stands.js";

// The field a group ticket carries where it is a fix group. [[spec/schemas/ticket.schema.yaml]]
export const FIX = "fix";
// The route of work a person alone can do. [[spec/processes/person.yaml]]
export const PERSON = "person";

// Whether a ticket stands on the person route, in either spelling of its process. [[spec/design_output/work#a-box-leaves]]
export function onPersonRoute(text) {
  return personProcess(fieldOf(text, "process"));
}

function personProcess(said) {
  const process = String(said ?? "").replace(/^\[\[|\]\]$/g, "");
  return process === PERSON || process.endsWith(`/${PERSON}`);
}

// The tickets a group leaves open that a box can close: each open or draft child, and each open ticket the branch adds with no group. [[spec/design_output/work#a-box-leaves]]
export function leftOpen(it, name) {
  const added = addedHere(it).filter(
    (one) => one.name !== name && !fieldOf(one.text, GROUP),
  );
  const names = [...childrenHere(it, name), ...added]
    .filter(
      (one) =>
        fieldOf(one.text, "state") !== CLOSED &&
        !isGroup(one.text) &&
        !onPersonRoute(one.text),
    )
    .map((one) => one.name);
  return [...new Set(names)].sort();
}

// The tickets this branch adds over trunk, as the disk holds them. [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]
export function addedHere(it) {
  const said = it.git.run(
    ["diff", "--name-only", "--diff-filter=A", `origin/${TRUNK}...HEAD`, "--", TICKETS],
    true,
  );
  return String(said.out ?? "")
    .split("\n")
    .map((row) => row.trim())
    .filter((row) => row.endsWith(NOTE_END))
    .map((path) => ({ name: ticketNamed(path), path: it.join(it.root, path) }))
    .filter((one) => it.disk.exists(one.path))
    .map((one) => ({ name: one.name, text: it.disk.read(one.path) }));
}

// Whether done stops, naming each ticket left open, its pull, and the road out for a person's work. [[spec/design_output/work#a-box-leaves]]
export function leftRefuses(it, name) {
  const left = leftOpen(it, name);
  if (!left.length) return false;
  console.error(
    `${name} reaches done once every ticket a box can close stands closed, and these stand open:`,
  );
  for (const one of left) console.error(`  ${one}: ./RUNME.sh ticket pull ${one}`);
  console.error(
    "Close each one. Work a person alone can do moves to the person route, and leaves the group loose on main:",
  );
  console.error(
    `  ./RUNME.sh mint ticket ${TICKETS}/<name>-person.md --process=${PERSON}, then ./RUNME.sh ticket pull <name> --became <name>-person`,
  );
  return true;
}

// A ticket the mint writes on a work branch names the branch's group, past a named group, the person route and the group itself. [[spec/tickets/a-box-keeps-its-tickets]]
export function joinsGroup(fields, branch, name) {
  const said = String(branch ?? "");
  if (!said.startsWith(WORK_BRANCH) || fields[GROUP]) return fields;
  const group = said.slice(WORK_BRANCH.length);
  if (group === name) return fields;
  if (personProcess(fields.process)) return fields;
  return { ...fields, [GROUP]: group };
}

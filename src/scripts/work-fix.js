// A fix group hands back no ticket for an agent. What it leaves goes out as a
// question ticket for a person, so a chain of follow-ups ends at the owner.
// [[spec/design_input/the-cloud-runs-itself#feature-groups-and-fix-groups]]

import { TRUNK } from "../../.claude/skills/level0/lib/trunk.js";
import {
  CLOSED,
  fieldOf,
  GROUP,
  isGroup,
  NOTE_END,
  TICKETS,
  ticketNamed,
} from "../engine/group.js";
import { waitsOnPerson } from "./work-answer.js";

// The field a group ticket carries where it is a fix group. [[spec/schemas/ticket.schema.yaml]]
export const FIX = "fix";

// The agent tickets a fix group's branch adds and leaves standing, or none where the group is a feature group. [[spec/design_input/the-cloud-runs-itself#feature-groups-and-fix-groups]]
export function fixLeaves(it, text) {
  if (String(fieldOf(text, FIX)) !== "true") return [];
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
    .map((one) => ({ name: one.name, text: it.disk.read(one.path) }))
    .filter(
      (one) =>
        fieldOf(one.text, "state") !== CLOSED &&
        !fieldOf(one.text, GROUP) &&
        !isGroup(one.text) &&
        !waitsOnPerson(one),
    )
    .map((one) => one.name);
}

// Whether done stops on a fix group, naming each ticket and the two lines turning it into a question. [[spec/design_input/the-cloud-runs-itself#feature-groups-and-fix-groups]]
export function fixRefuses(it, text) {
  const left = fixLeaves(it, text);
  if (!left.length) return false;
  console.error(
    "A fix group hands back no ticket for an agent, and this branch leaves these:",
  );
  for (const name of left) {
    console.error(
      `  ${name}: ./RUNME.sh mint ticket ${TICKETS}/${name}-question.md --process=question`,
    );
    console.error(`  then ./RUNME.sh ticket pull ${name} --became ${name}-question`);
  }
  console.error(
    "Turn each into a question ticket for a person, then run ./RUNME.sh branch done.",
  );
  return true;
}

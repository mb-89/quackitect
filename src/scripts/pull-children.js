// What a group's children say: which stand open, which closed dropped, and
// which name the group at all. The group's children step reads it.
// [[spec/design_output/pull#children-before-their-group]]

import { CLOSED, fieldOf, GROUP } from "../engine/group.js";

// [[spec/design_output/pull#children-before-their-group]]
export function childrenSay(all, name) {
  const mine = all.filter((one) => !one.private && fieldOf(one.text, GROUP) === name);
  const open = mine
    .filter((one) => fieldOf(one.text, "state") !== CLOSED)
    .map((one) => one.name);
  const dropped = mine
    .filter(
      (one) =>
        fieldOf(one.text, "state") === CLOSED &&
        fieldOf(one.text, "reason") === "dropped",
    )
    .map((one) => one.name);
  return { open, dropped, all: mine.map((one) => one.name) };
}

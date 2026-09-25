// Whether this session runs on a cloud box, where nobody sits beside it. Every
// door reading that fact reads it here, so one name says what a cloud box is.
// [[spec/guidance/cloud]]

import { WORK_BRANCH } from "../../../../src/engine/group.js";
import { TRUNK } from "./trunk.js";

export const CLOUD = ["CLAUDE_CODE_REMOTE", "SE_CLOUD"];

// [[spec/guidance/cloud]]
export function inCloud(env = {}) {
  return CLOUD.some((name) => truthy(env?.[name]));
}

// The doors' own flag answers first, and the environment where it stands unset, so the Bash door and the verbs read one answer. [[spec/design_output/work#a-desk-works-on-trunk]]
export function cloudHere(it) {
  return Boolean(it?.cloud ?? inCloud(it?.env ?? {}));
}

// [[spec/design_output/work#a-desk-works-on-trunk]]
export function onDesk(it, branch) {
  return !cloudHere(it) && String(branch ?? "").startsWith(WORK_BRANCH);
}

// [[spec/design_output/work#a-desk-works-on-trunk]]
export function deskRefusal(what, name = "<name>") {
  return [
    `A desk works on ${TRUNK} alone, and a cloud box works each ${WORK_BRANCH} branch, so ${what}.`,
    `Run git switch ${TRUNK}, and take a finished cloud branch in with ./RUNME.sh branch merge ${name}.`,
  ];
}

function truthy(said) {
  const held = String(said ?? "")
    .trim()
    .toLowerCase();
  return Boolean(held) && held !== "0" && held !== "false";
}

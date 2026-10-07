// Whether this session runs on a cloud box, where nobody sits beside it. Every
// door reading that fact reads it here, so one name says what a cloud box is.
// [[spec/guidance/cloud/cloud]]

import { WORK_BRANCH } from "../../../../src/engine/group.js";
import { TRUNK } from "./trunk.js";

export const CLOUD = ["CLAUDE_CODE_REMOTE", "SE_CLOUD"];

// [[spec/guidance/cloud/cloud]]
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
// The message a desk refusal builds, before the door adds the id and the remedy. [[spec/design_output/failures#the-refusals-move-onto-nodes]]
export function deskSaid(what) {
  return `A desk works on ${TRUNK} alone, and a cloud box works each ${WORK_BRANCH} branch, so ${what}.`;
}

// The node a desk refusal raises, which holds its remedy. [[spec/design_output/failures#the-refusals-move-onto-nodes]]
export const DESK_FAILURE = "desk-works-on-trunk";

function truthy(said) {
  const held = String(said ?? "")
    .trim()
    .toLowerCase();
  return Boolean(held) && held !== "0" && held !== "false";
}

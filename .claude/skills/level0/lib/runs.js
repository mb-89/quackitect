// What the battery says about one commit. The check stamps the commit it runs
// against, and `branch done` reads that stamp, where it once read a claim.
// [[spec/design_output/work#the-battery-answers-first]]

import { inRun } from "./folders.js";

export const STAMP = inRun("check.json");
// The list the lint leaves for the refactoring hand, one entry a warning. [[spec/design_output/stop#the-grace]]
export const REFACTORS = inRun("refactor.json");
// The read marks the write door keeps, so a restart keeps them. [[spec/design_output/level0#the-marks-survive-a-restart]]
export const MARKS = inRun("marks.json");
// The file the refactoring hand holds, and the hand holding it. [[spec/design_output/stop#the-hand-holds-its-file]]
export const REFACTOR_HOLD = inRun("refactor-hold.json");
// The plan this box holds: the todos and the work in hand. [[spec/design_output/stop#the-plan]]
export const PLANS = inRun("plan.json");
const SHORT_SHA = 8;

export function shortOf(sha) {
  return String(sha ?? "").slice(0, SHORT_SHA);
}

export function stampOf(text) {
  try {
    const read = JSON.parse(text || "{}");
    return {
      sha: String(read.sha ?? ""),
      ok: read.ok === true,
      clean: read.clean === true,
      // A stamp naming no count reads as warned, so an old check opens no retro. [[spec/guidance/retro/collect]]
      warned: read.warnings === undefined || Number(read.warnings) > 0,
      at: String(read.at ?? ""),
      // What the lint left standing at warning, which the refactoring rule reads. [[spec/tickets/the-spawn-reaches-its-guidance]]
      warnings: Number(read.warnings ?? 0),
      files: [read.files ?? []].flat().map(String).filter(Boolean),
    };
  } catch {
    return {
      sha: "",
      ok: false,
      clean: false,
      warned: true,
      at: "",
      warnings: 0,
      files: [],
    };
  }
}

export function saysGreen(stamp, sha) {
  if (!stamp.sha) return { green: false, says: "no check has run here" };
  if (stamp.sha !== sha) {
    return { green: false, says: `the check ran against ${shortOf(stamp.sha)}` };
  }
  if (!stamp.clean) return { green: false, says: "the check ran over an unclean tree" };
  if (!stamp.ok) return { green: false, says: `the check answered red at ${stamp.at}` };
  // A warning standing anywhere in the tree reads red, so nothing leaves the box over one. [[spec/design_output/work#the-battery-answers-first]]
  const warned = Number(stamp.warnings ?? 0);
  if (warned > 0) {
    const files = [stamp.files ?? []].flat().length;
    return {
      green: false,
      says: `${warned} warning(s) stand in ${files} file(s), which ./RUNME.sh lint names`,
    };
  }
  return { green: true, says: `the check passes on ${shortOf(sha)}` };
}

// Whether the cage holds. Level zero fills its state once, and a session that
// misses that load guards nothing while every check reads green. So the doors
// ask this file before they trust themselves, and say so where the answer is no.
// [[spec/design_output/level0#god-mode]]

import { findings } from "./bash.js";

export const HEALTH = ".se/level0.health";
export const CAGE = ".claude/skills/level0/";

const WRITES = "ShellWritesNothing";

export function healthOf(text) {
  try {
    const read = JSON.parse(text || "{}");
    return {
      ok: read.ok === true,
      why: String(read.why ?? ""),
      at: String(read.at ?? ""),
    };
  } catch {
    return { ok: false, why: "the health file reads as nothing", at: "" };
  }
}

export function inTheCage(path) {
  return String(path ?? "")
    .split(/[\\/]/)
    .join("/")
    .includes(CAGE);
}

// [[spec/design_output/level0#god-mode]]
export function repairs(e, writing) {
  if (writing) return inTheCage(writing.path);
  if (String(e?.tool ?? "") !== "Bash") return true;
  return !findings(String(e?.command ?? "")).some((one) => one.rule === WRITES);
}

export function godMode(well) {
  return [
    "LEVEL ZERO HOLDS NOTHING, SO THIS TREE STANDS UNGUARDED.",
    "",
    `What fails: ${well?.why || "the cage says nothing about itself"}`,
    "",
    "No voice rule reads a write, no guidance reaches this session, and the log",
    "says nothing. So this door refuses the work and leaves one road open.",
    "",
    "Repair the cage:",
    "",
    "1. Run `./RUNME.sh check`. It runs outside this process, so it answers",
    "   honestly while the cage answers nothing.",
    `2. Read \`${CAGE}hooks/level0.js\` and mend what the fault above names.`,
    `3. A write under \`${CAGE}\` passes while the cage is down, and so does a`,
    "   command landing no file. Nothing else does.",
    "",
    "This door clears itself. The next call after a repair loads the rules",
    "again, and the refusal stops.",
  ].join("\n");
}

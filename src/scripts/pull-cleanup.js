// A desk pull meeting no ticket hands out the cleanup: the oldest file on the
// refactor list the hand holds no hold on, then the check where its stamp
// reads failed or stale. A cloud box gets none of it.
// [[spec/design_output/pull#an-empty-queue-hands-cleanup]]

import { MS } from "../../.claude/skills/level0/lib/log.js";
import {
  REFACTOR_HOLD,
  REFACTORS,
  STAMP,
  stampOf,
} from "../../.claude/skills/level0/lib/runs.js";
import {
  drains,
  filesOn,
  takesFile,
} from "../../.claude/skills/level0/lib/warnings.js";

export const CLEANUP = "cleanup";

export function cleanupOf(it) {
  if (it.cloud) return null;
  const listed = filesOn(parsed(it, REFACTORS, []));
  if (listed.length) {
    const held = String(parsed(it, REFACTOR_HOLD, {})?.file ?? "");
    const file = oldestOf(
      it,
      listed.filter((one) => one !== held),
    );
    return file ? { word: CLEANUP, rows: drains(file).split("\n") } : null;
  }
  const why = staleWhy(it);
  return why
    ? {
        word: CLEANUP,
        rows: [why, "", "Run `./RUNME.sh check`, and mend the fixes it names."],
      }
    : null;
}

function textOf(it, rel) {
  try {
    return String(it.disk.read(it.join(it.work, ...rel.split("/"))));
  } catch {
    return "";
  }
}

function parsed(it, rel, none) {
  try {
    return JSON.parse(textOf(it, rel));
  } catch {
    return none;
  }
}

// [[spec/design_output/pull#an-empty-queue-hands-cleanup]]
function oldestOf(it, files) {
  const wrote = Object.fromEntries(
    files.map((file) => [
      file,
      Number(it.git.run(["log", "-1", "--format=%ct", "--", file], true).out),
    ]),
  );
  return takesFile(files, wrote, Math.floor(it.clock.now().getTime() / MS), 0);
}

function staleWhy(it) {
  const stamp = stampOf(textOf(it, STAMP));
  const head = it.git.run(["rev-parse", "HEAD"], true).out;
  if (stamp.sha !== head) return "The check stamp names no check at HEAD.";
  return stamp.ok ? "" : "The check stamp reads failed at HEAD.";
}

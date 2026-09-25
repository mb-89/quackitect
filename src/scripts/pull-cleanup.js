// A desk pull meeting no ticket hands out the cleanup: the check where its
// stamp reads failed or stale. A cloud box gets none of it.
// [[spec/design_output/pull#an-empty-queue-hands-cleanup]]

import { STAMP, stampOf } from "../../.claude/skills/level0/lib/runs.js";

export const CLEANUP = "cleanup";

export function cleanupOf(it) {
  if (it.cloud) return null;
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

function staleWhy(it) {
  const stamp = stampOf(textOf(it, STAMP));
  const head = it.git.run(["rev-parse", "HEAD"], true).out;
  if (stamp.sha !== head) return "The check stamp names no check at HEAD.";
  return stamp.ok ? "" : "The check stamp reads failed at HEAD.";
}

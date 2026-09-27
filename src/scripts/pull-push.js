// The push a hand-back ends with. A desk lands it on this box, and a cloud box
// pushes its work branch. A refusal answers the push door's own cause.
// [[spec/design_output/pull#the-rejected-push]]

import { cloudHere } from "../../.claude/skills/level0/lib/cloud.js";

// Git names a moved branch alone with these words, so a rebase runs on them and on no other refusal. [[spec/design_output/pull#the-rejected-push]]
const MOVED = /\((?:fetch first|non-fast-forward)\)/;
const NOISE = /^(?:error: failed to push|hint:|To )/;
const SENT = Object.freeze({ ok: true, local: false, why: [] });

// A cloud box hands back on a work branch alone, so the push reads no trunk. [[spec/tickets/every-road-has-a-caller]]
// [[spec/design_output/pull#the-rejected-push]]
export function pushed(it, branch) {
  // A desk lands its hand-back on this box, as its commit verb does. [[spec/guidance/working]]
  if (!cloudHere(it)) {
    return {
      ok: true,
      local: true,
      why: [
        `The hand-back stands on this box, and ${branch} goes out with the next push.`,
      ],
    };
  }
  const first = tried(it, branch);
  if (first.ok || !first.moved) return first.said;
  it.git.run(["fetch", "origin", branch], true);
  if (!it.git.run(["rebase", `origin/${branch}`], true).ok) {
    it.git.run(["rebase", "--abort"], true);
    return {
      ok: false,
      local: true,
      why: [
        `${branch} moves on origin, and one rebase falls short. Push ${branch}, then pull again.`,
      ],
    };
  }
  return tried(it, branch).said;
}

// [[spec/design_output/pull#the-rejected-push]]
export function sentOut(it, one, branch) {
  return one.private ? SENT : pushed(it, branch);
}

function tried(it, branch) {
  const ran = it.git.run(["push", "origin", branch], true);
  if (ran.ok) return { ok: true, said: SENT };
  const lines = String(ran.err ?? "")
    .split("\n")
    .map((row) => row.trim())
    .filter((row) => row && !NOISE.test(row));
  return {
    ok: false,
    moved: MOVED.test(ran.err ?? ""),
    said: {
      ok: false,
      local: true,
      why: [
        `The push door refuses ${branch}:`,
        ...(lines.length ? lines : ["it names no cause"]),
      ],
    },
  };
}

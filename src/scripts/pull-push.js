// The push a hand-back ends with. On trunk the check runs over the close
// first, so the stamp names the commit the push carries, and a tests-red close
// stands on this box. A refusal answers the push door's own cause.
// [[spec/design_output/pull#the-rejected-push]]

import { inCloud } from "../../.claude/skills/level0/lib/cloud.js";
import { TRUNK } from "../../.claude/skills/level0/lib/trunk.js";
import { saidBy } from "./commit-verb.js";

// Git names a moved branch alone with these words, so a rebase runs on them and on no other refusal. [[spec/design_output/pull#the-rejected-push]]
const MOVED = /\((?:fetch first|non-fast-forward)\)/;
const NOISE = /^(?:error: failed to push|hint:|To )/;
const SENT = Object.freeze({ ok: true, local: false, why: [] });

// [[spec/design_output/pull#the-rejected-push]]
export function pushed(it, branch, { red = false } = {}) {
  // A desk lands its hand-back on this box, as its commit verb does. [[spec/guidance/working]]
  if (!(it.cloud ?? inCloud(it.env ?? {}))) {
    return {
      ok: true,
      local: true,
      why: [
        `The hand-back stands on this box, and ${branch} goes out with the next push.`,
      ],
    };
  }
  const trunk = branch === TRUNK;
  if (trunk && red) {
    return {
      ok: true,
      local: true,
      why: [
        `The close stands on this box, and the next green push carries it, because a tests-red leaf answers red on ${TRUNK}.`,
      ],
    };
  }
  const first = trunk ? checkRed(it) || tried(it, branch) : tried(it, branch);
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
  // The rebase moves the commit off the stamp, so the check reads the new commit. [[spec/design_output/pull#the-rejected-push]]
  return (trunk ? checkRed(it) || tried(it, branch) : tried(it, branch)).said;
}

// [[spec/design_output/pull#the-rejected-push]]
export function redLeaf(leaf) {
  return (leaf?.evidence ?? []).some(
    (one) => String(one?.expects ?? "") === "assertion",
  );
}

// [[spec/design_output/pull#the-rejected-push]]
export function sentOut(it, one, branch, leaf) {
  return one.private ? SENT : pushed(it, branch, { red: redLeaf(leaf) });
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

// [[spec/design_output/pull#the-rejected-push]]
function checkRed(it) {
  const ran = it.proc.run(
    [it.node, it.join(it.root, "src", "scripts", "cli.js"), "check"],
    {
      cwd: it.root,
    },
  );
  if (ran.exitCode === 0) return null;
  return {
    ok: false,
    moved: false,
    said: {
      ok: false,
      local: true,
      why: [
        "The check answers red on this commit, so the close stands on this box:",
        ...(saidBy(ran) || "the check answers nothing").split("\n"),
      ],
    },
  };
}

// The push door a terminal meets. Git runs the hook before a push and pipes one
// line per ref, and a ref naming trunk reads the stamp the check wrote. A ref
// carrying a tagged note comes back refused, because a to-do parks work on this
// box. The Bash door holds both rules for a session, and each stands alone.
// [[spec/design_output/work#the-battery-answers-first]]

import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { saysGreen, STAMP, stampOf } from "../../.claude/skills/level0/lib/runs.js";
import {
  reaches,
  refusedTodo,
  taggedIn,
} from "../../.claude/skills/level0/lib/todo.js";
import { TRUNK } from "../../.claude/skills/level0/lib/trunk.js";
import { disk } from "../doors/disk.js";
import { git } from "../doors/git.js";
import { proc } from "../doors/proc.js";

export const STDIN = 0;
export const ZEROS = /^0+$/;

export function refsIn(text) {
  return String(text ?? "")
    .split("\n")
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => {
      const [local, sha, remote, was] = row.split(/\s+/);
      return { local, sha, remote, was: was ?? "" };
    });
}

export function holds(refs, stampText, carried = () => []) {
  const trunk = refs.filter((one) => one.remote === `refs/heads/${TRUNK}`);
  for (const one of trunk) {
    const battery = saysGreen(stampOf(stampText), one.sha);
    if (battery.green) continue;
    return {
      code: 1,
      said: [
        `${TRUNK} takes a green battery, and ${battery.says}.`,
        "",
        "Run `./RUNME.sh check` last, after your final commit. The stamp names",
        "the commit it ran against, so a commit after it reads stale.",
      ].join("\n"),
    };
  }

  // [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
  for (const one of refs) {
    const found = taggedIn(carried(one));
    if (found.length) return { code: 1, said: refusedTodo(found) };
  }
  return { code: 0, said: "" };
}

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
export function namesIn(said) {
  return [
    ...new Set(
      String(said ?? "")
        .split("\n")
        .map((row) => row.trim())
        .filter(reaches),
    ),
  ];
}

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
export function rangeOf(ref) {
  return ZEROS.test(String(ref?.was ?? ""))
    ? [String(ref?.sha ?? ""), "--not", "--remotes"]
    : [`${ref.was}..${ref.sha}`];
}

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
export function carriedBy(repo) {
  return (ref) => {
    const said = repo.run(["log", "--format=", "--name-only", ...rangeOf(ref)], true);
    if (!said.ok) return [];
    const out = [];
    for (const name of namesIn(said.out)) {
      const held = repo.run(["show", `${ref.sha}:${name}`], true);
      if (held.ok) out.push({ name, text: held.out });
    }
    return out;
  };
}

async function main() {
  const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
  const files = disk();
  const at = join(root, STAMP);
  const stamp = files.exists(at) ? files.read(at) : "";
  const said = holds(refsIn(files.read(STDIN)), stamp, carriedBy(git(proc(), root)));
  if (said.code !== 0) console.error(said.said);
  return said.code;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(await main());
}

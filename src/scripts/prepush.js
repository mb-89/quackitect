// The push door a terminal meets. Git runs the hook before a push and pipes one
// line per ref, and a ref naming trunk reads the stamp the check wrote. The Bash
// door holds the same rule for a session, and each stands without the other.
// [[spec/design_output/work#the-battery-answers-first]]

import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { saysGreen, STAMP, stampOf } from "../../.claude/skills/level0/lib/runs.js";
import { disk } from "../doors/disk.js";

export const STDIN = 0;
export const TRUNK = "main";

export function refsIn(text) {
  return String(text ?? "")
    .split("\n")
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => {
      const [local, sha, remote] = row.split(/\s+/);
      return { local, sha, remote };
    });
}

export function holds(refs, stampText) {
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
  return { code: 0, said: "" };
}

async function main() {
  const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
  const files = disk();
  const at = join(root, STAMP);
  const stamp = files.exists(at) ? files.read(at) : "";
  const said = holds(refsIn(files.read(STDIN)), stamp);
  if (said.code !== 0) console.error(said.said);
  return said.code;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(await main());
}

// The stamp the check leaves: the battery run in order, each part timed, and
// the record a door reads before a push. The check verb in cli.js calls it.
// [[spec/design_output/work#the-battery-answers-first]]

import { join } from "node:path";
import { REFACTORS, STAMP } from "../../.claude/skills/level0/lib/runs.js";
import { filesOn } from "../../.claude/skills/level0/lib/warnings.js";
import { partsTimed } from "./battery.js";
import { files, it, root } from "./cli-doors.js";
import { warningsStood } from "./cli-read.js";

// The battery in order, each part timed under its name, stopping at the first red and naming the parts it leaves unrun. [[spec/guidance/retro/effect]]
export async function batteryRun(steps, clock) {
  const { parts, timed } = partsTimed(clock);
  let code = 0;
  const unrun = [];
  for (const [name, part] of steps) {
    if (code) {
      unrun.push(name);
      continue;
    }
    code = (await timed(name, part)) ?? 0;
  }
  return { code, parts, unrun };
}

// [[spec/design_output/work#the-battery-answers-first]]
export function stamped(code, battery = null) {
  const sha = it.git.run(["rev-parse", "HEAD"], true).out;
  const clean = !it.git.run(["status", "--porcelain"], true).out;
  // The list the lint left, so a door reading the stamp counts the warnings without a lint of its own. [[spec/tickets/the-spawn-reaches-its-guidance]]
  const stood = warningsStood();
  const said = stampFor({
    code,
    sha,
    clean,
    at: it.clock.now().toISOString(),
    stood,
    battery,
  });
  files.makeDir(join(root, ".se"));
  // The list stands in its own file, because the hand changes what it names and the stamp changes nothing. [[spec/design_output/stop#the-grace]]
  files.write(join(root, REFACTORS), `${JSON.stringify(stood, null, 2)}\n`);
  files.write(join(root, STAMP), `${JSON.stringify(said, null, 2)}\n`);
  return code;
}

// The stamp's shape, off what the check found; the battery's report rides it where one stands, and a retro keeps one a retro. [[spec/guidance/retro/effect]]
export function stampFor({ code, sha, clean, at, stood = [], battery = null }) {
  return {
    sha,
    ok: code === 0,
    clean,
    at,
    warnings: stood.length,
    files: filesOn(stood),
    ...(battery ? { battery } : {}),
  };
}

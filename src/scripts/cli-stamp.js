// The stamp the check leaves: the battery run in order, each part timed, and
// the record a door reads before a push. The check verb in cli.js calls it.
// [[spec/design_output/work#the-battery-answers-first]]

import { join } from "node:path";
import { STAMP } from "../../.claude/skills/level0/lib/runs.js";
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
export async function stamped(code, battery = null) {
  const sha = it.git.run(["rev-parse", "HEAD"], true).out;
  const at = join(root, STAMP);
  const clean = !it.git.run(["status", "--porcelain"], true).out;
  // The list the lint left, so a door reading the stamp counts the warnings without a lint of its own. [[spec/design_output/work#the-battery-answers-first]]
  const stood = warningsStood();
  const said = stampFor({
    code,
    sha,
    clean,
    at: it.clock.now().toISOString(),
    stood,
    battery,
    before: lastStamp(at),
    keep: await it.config.ask("battery.runs"),
  });
  files.makeDir(join(root, ".se"));
  files.write(at, `${JSON.stringify(said, null, 2)}\n`);
  return code;
}

function lastStamp(at) {
  try {
    return JSON.parse(files.read(at));
  } catch {
    return null;
  }
}

// The stamp's shape, off what the check found; the battery's report rides it where one stands, and a retro keeps one a retro. [[spec/guidance/retro/effect]]
export function stampFor({
  code,
  sha,
  clean,
  at,
  stood = [],
  battery = null,
  before = null,
  keep = 1,
}) {
  return {
    sha,
    ok: code === 0,
    clean,
    at,
    warnings: stood.length,
    files: filesOn(stood),
    ...(battery ? { battery, runs: runsKept(battery, before, sha, keep) } : {}),
  };
}

// The last runs' parts at this commit, newest first, up to the count, so a retro reads a median over one tree. [[spec/guidance/retro/effect]]
function runsKept(battery, before, sha, keep) {
  const earlier = before?.sha === sha ? (before?.runs ?? []) : [];
  return [battery.parts ?? {}, ...earlier].slice(0, Math.max(1, Number(keep) || 1));
}

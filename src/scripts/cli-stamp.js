// The stamp the check leaves: the battery run in order, each part timed, and
// the record a door reads before a push. The check verb in check-verb.js calls it.
// [[spec/design_output/work#the-battery-answers-first]]

import { join } from "node:path";
import {
  PUBLIC_TICKETS,
  TICKETS as PRIVATE_TICKETS,
} from "../../.claude/skills/level0/lib/folders.js";
import { STAMP } from "../../.claude/skills/level0/lib/runs.js";
import { filesOn } from "../../.claude/skills/level0/lib/warnings.js";
import { FROM } from "../bridge/findings.js";
import { partsTimed } from "./battery.js";
import { files, it, root } from "./cli-doors.js";
import { warningsStood } from "./cli-read.js";

// The battery in order, each part timed under its name, stopping at the first red and naming the parts it leaves unrun. [[spec/guidance/retro/effect]]
// A part marked beside starts where it stands, and the run goes on without it, then waits for it before it answers. So the total is the battery's own span, and no sum of its parts. [[spec/tickets/the-check-takes-a-minute]]
export async function batteryRun(steps, clock) {
  const { parts, timed } = partsTimed(clock);
  const from = clock.now().getTime();
  let code = 0;
  const unrun = [];
  const beside = [];
  for (const [name, part, how = {}] of steps) {
    if (code) {
      unrun.push(name);
      continue;
    }
    if (how.beside) beside.push(timed(name, part));
    else code = (await timed(name, part)) ?? 0;
  }
  for (const one of await Promise.all(beside)) code = code || (one ?? 0);
  return { code, parts, unrun, total: clock.now().getTime() - from };
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
  const held = stood.filter(holdsPush);
  return {
    sha,
    ok: code === 0,
    clean,
    at,
    warnings: held.length,
    files: filesOn(held),
    ...(battery ? { battery, runs: runsKept(battery, before, sha, keep) } : {}),
  };
}

// A ticket's prose stands at warning by rule, so it holds no push, and every other warning does. [[spec/design_output/work#the-battery-answers-first]]
export function holdsPush(one) {
  if (one?.source !== FROM.vale) return true;
  const file = String(one?.file ?? "").replaceAll("\\", "/");
  return ![PUBLIC_TICKETS, PRIVATE_TICKETS].some(
    (folder) => file.startsWith(`${folder}/`) || file.includes(`/${folder}/`),
  );
}

// The last runs' parts at this commit, newest first, up to the count, so a retro reads a median over one tree. [[spec/guidance/retro/effect]]
function runsKept(battery, before, sha, keep) {
  const earlier = before?.sha === sha ? (before?.runs ?? []) : [];
  return [battery.parts ?? {}, ...earlier].slice(0, Math.max(1, Number(keep) || 1));
}

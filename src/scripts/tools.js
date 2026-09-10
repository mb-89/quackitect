// The survey. It asks this box where each tool stands and writes
// .se/tools.json, which every caller reads in place of a guess.
// [[spec/design_output/tools#what-the-survey-writes]]

import {
  callsOf,
  guesses,
  pathOf,
  placesFor,
  surveyOf,
  TOOLS,
  versionOf,
  WANTED,
} from "../../.claude/skills/level0/lib/tools.js";

const ASKING = 10000;

export function survey(doors, root, env) {
  const bin = `${root}/.se/bin`;
  const found = {};
  for (const one of WANTED) found[one.name] = standing(doors, one, env, bin);
  return found;
}

export function writeSurvey(doors, root, env) {
  const found = survey(doors, root, env);
  doors.disk.makeDir(`${root}/.se`);
  doors.disk.write(`${root}/${TOOLS}`, `${JSON.stringify(found, null, 2)}\n`);
  return found;
}

// [[spec/design_output/tools#where-a-caller-looks]]
export function readTools(files, root) {
  const at = `${root}/${TOOLS}`;
  return files.exists(at) ? surveyOf(files.read(at)) : {};
}

export function whereIs(files, root, name, known) {
  const said = pathOf(known, name);
  if (said && files.exists(said)) return said;
  for (const guess of guesses(name)) {
    const at = `${root}/${guess}`;
    if (files.exists(at)) return at;
  }
  return name;
}

function standing(doors, one, env, bin) {
  for (const call of callsOf(one)) {
    for (const place of placesFor(call, env, bin)) {
      if (!doors.disk.exists(place)) continue;
      const asks = one.asks ?? [];
      if (!asks.length) return { path: place };
      return { path: place, version: asked(doors.proc, [place, ...asks]) };
    }
  }
  return null;
}

function asked(outside, argv) {
  try {
    const ran = outside.run(argv, { timeoutMs: ASKING });
    return versionOf(ran.stdout || ran.stderr);
  } catch {
    return "";
  }
}

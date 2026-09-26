// The doctor's hook probe: every hook address the settings files name, and
// whether each one answers.
// [[spec/design_output/level0#the-doctor-probes-every-hook]]

import { join } from "node:path";
import { SETTINGS, SETTINGS_LOCAL } from "../../.claude/skills/level0/lib/vehicle.js";
import { HEALTH_WAIT } from "./cli-doors.js";

// The three settings files the client reads, the tree's own first. [[spec/design_output/level0#the-doctor-probes-every-hook]]
function settingsFiles(root, home) {
  const rows = [
    { at: join(root, SETTINGS), name: SETTINGS },
    { at: join(root, SETTINGS_LOCAL), name: SETTINGS_LOCAL },
  ];
  // The name a reader sees joins with a slash on every box, and the path joins the way the box does. [[spec/design_output/level0#the-doctor-probes-every-hook]]
  if (home) rows.push({ at: join(home, SETTINGS), name: `${home}/${SETTINGS}` });
  return rows;
}

// A command path parses as a URL, so a probe holds these two schemes alone. [[spec/design_output/level0#the-doctor-probes-every-hook]]
const REACHED = new Set(["http:", "https:"]);

function addressOf(said) {
  try {
    const url = new URL(String(said));
    return REACHED.has(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

// Every string a settings tree holds, whatever key carries it. [[spec/design_output/level0#the-doctor-probes-every-hook]]
function stringsIn(said, out = []) {
  if (typeof said === "string") out.push(said);
  else if (Array.isArray(said)) for (const one of said) stringsIn(one, out);
  else if (said && typeof said === "object")
    for (const one of Object.values(said)) stringsIn(one, out);
  return out;
}

// Every hook address the settings files name, in reading order, each off the file naming it first. [[spec/design_output/level0#the-doctor-probes-every-hook]]
export function hooksNamed(disk, at, home) {
  const found = new Map();
  for (const file of settingsFiles(at, home)) {
    let said = null;
    try {
      said = JSON.parse(String(disk.read(file.at)));
    } catch {
      continue;
    }
    for (const one of stringsIn(said?.hooks)) {
      const where = addressOf(one);
      if (where && !found.has(where)) found.set(where, { where, file: file.name });
    }
  }
  return [...found.values()];
}

// One row a hook, off calls the probe runs together, so a box of dead hooks answers inside the first minute. [[spec/design_output/level0#the-doctor-probes-every-hook]]
export async function hookRows(found, get = fetch) {
  return Promise.all(found.map((one) => hookRow(one, get)));
}

async function hookRow(one, get) {
  const label = `hook ${new URL(one.where).host}`;
  try {
    await get(one.where, { signal: AbortSignal.timeout(HEALTH_WAIT) });
    return [label, `stands at ${one.where}, off ${one.file}`];
  } catch {
    return [label, `warn: answers nothing at ${one.where}, off ${one.file}`];
  }
}

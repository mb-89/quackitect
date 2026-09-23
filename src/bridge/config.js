// The config a door asks: the tracked file at the method root, and the local
// file at the work root over it, one key as section.leaf.
// [[spec/design_output/config#the-three-layers]]

import { join } from "node:path";
import { LOCAL, TRACKED, varOf } from "../../.claude/skills/level0/lib/config.js";

export function asks(box, key) {
  const [section, leaf] = String(key).split(".");
  const local = parsed(box.disk, join(box.work, LOCAL));
  const tracked = parsed(box.disk, join(box.method, TRACKED));
  const held = local?.[section]?.[leaf];
  return held !== undefined ? held : tracked?.[section]?.[leaf];
}

// A text key read through all three layers: the local file, then the environment, then the tracked file. [[spec/design_output/config#the-resolver-holds-the-layers]]
export function asksText(box, key) {
  const [section, leaf] = String(key).split(".");
  const local = parsed(box.disk, join(box.work, LOCAL))?.[section]?.[leaf];
  if (local !== undefined) return local;
  const env = box.env?.[varOf(key)];
  if (env !== undefined && env !== "") return String(env);
  return parsed(box.disk, join(box.method, TRACKED))?.[section]?.[leaf];
}

export function writes(box, key, value) {
  const [section, leaf] = String(key).split(".");
  const at = join(box.work, LOCAL);
  const held = parsed(box.disk, at) ?? {};
  held[section] = { ...(held[section] ?? {}), [leaf]: value };
  box.disk.makeDir(join(box.work, ".se"));
  box.disk.write(at, `${JSON.stringify(held, null, 2)}\n`);
}

function parsed(disk, at) {
  try {
    return JSON.parse(String(disk.read(at)));
  } catch {
    return null;
  }
}

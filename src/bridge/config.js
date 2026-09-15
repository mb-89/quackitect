// The config a door asks: the tracked file at the method root, and the local
// file at the work root over it. A key reads as section.leaf, and a key
// nobody names answers undefined.
// [[spec/design_output/config#three-layers]]

import { join } from "node:path";

const TRACKED = "spec/config/level0.json";
const LOCAL = ".se/config.json";

export function asks(box, key) {
  const [section, leaf] = String(key).split(".");
  const local = parsed(box.disk, join(box.work, LOCAL));
  const tracked = parsed(box.disk, join(box.method, TRACKED));
  const held = local?.[section]?.[leaf];
  return held !== undefined ? held : tracked?.[section]?.[leaf];
}

// A door writes one key into the local file, and leaves every other key as it stands.
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

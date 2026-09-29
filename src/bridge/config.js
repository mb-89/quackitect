// The config a door asks: the tracked file at the method root, and the local
// file at the work root over it, one key as section.leaf, and the schema's
// default under both.
// [[spec/design_output/config#the-layers]]

import { join } from "node:path";
import {
  BUILT_IN,
  LOCAL,
  SCHEMA,
  TRACKED,
  varOf,
} from "../../.claude/skills/level0/lib/config.js";

export function asks(box, key) {
  const [section, leaf] = String(key).split(".");
  const local = parsed(box.disk, join(box.work, LOCAL));
  const tracked = parsed(box.disk, join(box.method, TRACKED));
  const held = local?.[section]?.[leaf] ?? tracked?.[section]?.[leaf];
  return held !== undefined ? held : builtIn(box, section, leaf);
}

// The schema's default at the method root, which answers a key no file sets. [[spec/tickets/the-config-schema-gets-generated]]
function builtIn(box, section, leaf) {
  return parsed(box.disk, join(box.method, SCHEMA))?.properties?.[section]
    ?.properties?.[leaf]?.default;
}

// The value and the file that sets it, over the same two layers asks reads, so a refusal names no layer the hook skips. [[spec/design_output/config#the-engine-controls]]
export function whereFrom(box, key) {
  const [section, leaf] = String(key).split(".");
  for (const layer of [LOCAL, TRACKED]) {
    const root = layer === LOCAL ? box.work : box.method;
    const value = parsed(box.disk, join(root, layer))?.[section]?.[leaf];
    if (value !== undefined) return { value, layer };
  }
  const value = builtIn(box, section, leaf);
  return value !== undefined
    ? { value, layer: BUILT_IN }
    : { value: undefined, layer: "" };
}

// A text key read through all three layers: the local file, then the environment, then the tracked file. [[spec/design_output/config#the-resolver-holds-the-layers]]
export function asksText(box, key) {
  const [section, leaf] = String(key).split(".");
  const local = parsed(box.disk, join(box.work, LOCAL))?.[section]?.[leaf];
  if (local !== undefined) return local;
  const env = box.env?.[varOf(key)];
  if (env !== undefined && env !== "") return String(env);
  return (
    parsed(box.disk, join(box.method, TRACKED))?.[section]?.[leaf] ??
    builtIn(box, section, leaf)
  );
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

// The slices whose readers take a Go topic where the slice reads new. [[spec/tickets/readers-take-the-go-topics]]
export const SLICES = ["config", "log", "guidance", "check", "prose"];

// The modes a box holds, each read off the config again at the ask, so a change reaches the next reader. The box builds after this reads it, so the box comes as a function. [[spec/tickets/readers-name-one-mode-source]]
export function slicesOf(boxAt) {
  const out = {};
  for (const slice of SLICES) {
    Object.defineProperty(out, slice, {
      enumerable: true,
      get: () => asksText(boxAt(), `migration.${slice}`),
    });
  }
  return out;
}

// The key a box's log level reads, again at each event. [[spec/design_output/log#what-a-box-writes]]
export const LOG_LEVEL = "log.level";

#!/usr/bin/env node
// The brand a vehicle stamps on itself. The install script runs this ahead of
// every verb, so the marketplace name, its owner and the plugin's author each
// answer the folder the tree stands in.
// [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  brandOf,
  brandedJson,
  emptyBrand,
} from "../../.claude/skills/level0/lib/vehicle.js";
import { disk } from "../doors/disk.js";

export const MARKETPLACE = ".claude-plugin/marketplace.json";
export const PLUGIN = ".claude/skills/level0/.claude-plugin/plugin.json";
export const ICON_SOURCE = "spec/config/brand/icon.svg";
export const ICON_TARGET = "src/extension/icon.svg";

// [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
export function stamps(files, root, brand) {
  const done = [];
  for (const rel of [MARKETPLACE, PLUGIN]) {
    const at = join(root, ...rel.split("/"));
    const was = readIf(files, at);
    if (was === null) continue;
    const made = brandedJson(was, brand);
    if (made === was) continue;
    files.write(at, made);
    done.push(rel);
  }
  const from = join(root, ...ICON_SOURCE.split("/"));
  const to = join(root, ...ICON_TARGET.split("/"));
  const icon = readIf(files, from);
  if (icon !== null && icon !== readIf(files, to)) {
    files.makeDir(dirname(to));
    files.write(to, icon);
    done.push(ICON_TARGET);
  }
  return done;
}

function readIf(files, at) {
  try {
    return String(files.read(at));
  } catch {
    return null;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
  const brand = brandOf(root);
  if (!brand) {
    console.error(emptyBrand(root));
    process.exit(1);
  }
  for (const one of stamps(disk(), root, brand)) console.log(`  ${one} reads ${brand}`);
}

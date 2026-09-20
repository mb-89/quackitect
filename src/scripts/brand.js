#!/usr/bin/env node
// The brand a vehicle stamps on itself. The install script runs this ahead of
// every verb, so both manifests and the icon come out of the brand folder with
// the marketplace name, its owner and the plugin's author answering the folder
// the tree stands in.
// [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  brandOf,
  brandedJson,
  emptyBrand,
} from "../../.claude/skills/level0/lib/vehicle.js";
import { disk } from "../doors/disk.js";

export const BRAND = "spec/config/brand";
export const MARKETPLACE = ".claude-plugin/marketplace.json";
export const PLUGIN = ".claude/skills/level0/.claude-plugin/plugin.json";
export const ICON_SOURCE = `${BRAND}/icon.svg`;
export const ICON_TARGET = "src/extension/icon.svg";

// Each target reads its source in the brand folder, so a clone carrying no target gets one. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
export function stamps(files, root, brand) {
  const done = [];
  const targets = [
    [MARKETPLACE, `${BRAND}/marketplace.json`, (text) => brandedJson(text, brand)],
    [PLUGIN, `${BRAND}/plugin.json`, (text) => brandedJson(text, brand)],
    [ICON_TARGET, ICON_SOURCE, (text) => text],
  ];
  for (const [rel, source, branded] of targets) {
    const held = readIf(files, join(root, ...source.split("/")));
    if (held === null) continue;
    const to = join(root, ...rel.split("/"));
    const made = branded(held);
    if (made === readIf(files, to)) continue;
    files.makeDir(dirname(to));
    files.write(to, made);
    done.push(rel);
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

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

// The shape a manifest opens with where none stands, because git holds neither and a fresh clone meets the install first. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
export const SHAPES = {
  [MARKETPLACE]: {
    name: "",
    owner: { name: "" },
    plugins: [
      {
        name: "level0",
        description:
          "Level zero, run from the vehicle's own folder. A stub names this folder as a marketplace and enables the plugin, and carries no copy.",
        source: "./.claude/skills/level0",
      },
    ],
  },
  [PLUGIN]: {
    name: "level0",
    description:
      "Level zero: the rules that shape what the agent writes, taken inside the harness process, and the pull as a tool with the judge behind it. The voice rules hold at the write door on turn one of a clone that has never been built.",
    version: "0.1.0",
    author: { name: "" },
  },
};

// [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
export function stamps(files, root, brand) {
  const done = [];
  for (const rel of [MARKETPLACE, PLUGIN]) {
    const at = join(root, ...rel.split("/"));
    const was = readIf(files, at) ?? `${JSON.stringify(SHAPES[rel], null, 2)}\n`;
    const made = brandedJson(was, brand);
    if (made === readIf(files, at)) continue;
    files.makeDir(dirname(at));
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

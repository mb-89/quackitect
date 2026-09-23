#!/usr/bin/env node
// The brand a vehicle stamps on itself. The install script runs this ahead of
// every verb, so both manifests and the icon come out of the brand folder with
// the marketplace name, its owner and the plugin's author answering the folder
// the tree stands in.
// [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  brandedJson,
  brandOf,
  emptyBrand,
  versionedJson,
} from "../../.claude/skills/level0/lib/vehicle.js";
import { disk } from "../doors/disk.js";

export const BRAND = "spec/config/brand";
export const MARKETPLACE = ".claude-plugin/marketplace.json";
export const PLUGIN = ".claude/skills/level0/.claude-plugin/plugin.json";
export const ICON_SOURCE = `${BRAND}/icon.svg`;
export const ICON_TARGET = "src/extension/icon.svg";
export const EXTENSION = "src/extension/package.json";

// The shape a manifest takes where the brand folder carries no source for it, so a clone holding neither still gets both. The brand lands through brandedJson, and the version through versionedJson. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
const SHAPES = {
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
    author: { name: "" },
  },
};

// Each target reads its source in the brand folder, so a clone carrying no target gets one. The extension's manifest is its own source, because the editor reads it where git holds it. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
export function stamps(files, root, brand) {
  const done = [];
  const version = versionIn(files, root);
  const targets = [
    [MARKETPLACE, `${BRAND}/marketplace.json`, (text) => brandedJson(text, brand)],
    [
      PLUGIN,
      `${BRAND}/plugin.json`,
      (text) => versionedJson(brandedJson(text, brand), version),
    ],
    [EXTENSION, EXTENSION, (text) => versionedJson(text, version)],
    [ICON_TARGET, ICON_SOURCE, (text) => text],
  ];
  for (const [rel, source, branded] of targets) {
    const to = join(root, ...rel.split("/"));
    const was = readIf(files, to);
    // The source stands where the brand folder carries it, and the shape below answers a clone holding neither. A target standing already reads as its own source. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
    const held =
      readIf(files, join(root, ...source.split("/"))) ??
      (was === null ? shapeOf(rel) : null);
    if (held === null) continue;
    const made = branded(held);
    if (made === was) continue;
    files.makeDir(dirname(to));
    files.write(to, made);
    done.push(rel);
  }
  return done;
}

// The shape a missing source falls back on. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
function shapeOf(rel) {
  const shape = SHAPES[rel];
  return shape ? JSON.stringify(shape) : null;
}

// The tree's version, which package.json alone holds, and the empty string where it names none. [[spec/design_output/vehicle#one-file-holds-the-version]]
export function versionIn(files, root) {
  try {
    return String(JSON.parse(readIf(files, join(root, "package.json"))).version ?? "");
  } catch {
    return "";
  }
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

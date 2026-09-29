// The old reader's section of the guidance golden file: readsFor over every
// leaf of every process in this tree, on a box binding no env.
// node test/level0/guidance-golden.js writes it again.
// [[spec/tickets/the-guidance-topic-lands]]

import { join } from "node:path";
import { readYaml } from "../../.claude/skills/level0/lib/schema.js";
import { PROCESSES, readsFor } from "./guidance-hand.js";
import { leafOf, leavesOf } from "./pull-route.js";

const ROOT = join(import.meta.dirname, "..", "..");
export const GOLDEN = join(ROOT, "src", "quack", "testdata", "guidance.golden.json");
export const SECTION = "src/scripts/guidance-hand.js readsFor";
const YAML = /\.yaml$/;

// The tree the old reader walks, off the doors a verb holds. [[spec/tickets/the-guidance-topic-lands]]
export function treeOf(doors) {
  return { disk: doors.disk, join, root: doors.method ?? ROOT };
}

// Every leaf keyed process:path, and the notes readsFor hands it. [[spec/tickets/the-guidance-topic-lands]]
export function oldSection(it) {
  const at = it.join(it.root, ...PROCESSES.split("/"));
  if (!it.disk.exists(at)) return {};
  const out = {};
  for (const one of it.disk.list(at)) {
    if (one.kind !== "file" || !YAML.test(one.name)) continue;
    const name = one.name.replace(YAML, "");
    const front = {
      steps: readYaml(String(it.disk.read(it.join(at, one.name)))).steps,
    };
    for (const leaf of leavesOf(front)) {
      out[`${name}:${leaf.path}`] = readsFor(it, leafOf(front, leaf.path), {});
    }
  }
  return sortedKeys(out);
}

// Writes the old section into the golden file, and leaves every other section as it stands. [[spec/tickets/the-guidance-topic-lands]]
export function writeGolden(it) {
  let golden = {};
  try {
    golden = JSON.parse(String(it.disk.read(GOLDEN)));
  } catch {}
  golden[SECTION] = oldSection(it);
  it.disk.write(GOLDEN, `${JSON.stringify(sortedKeys(golden), null, 2)}\n`);
}

// The keys in name order, the order the Go encoder writes a map in. [[spec/tickets/the-guidance-topic-lands]]
function sortedKeys(said) {
  return Object.fromEntries(
    Object.keys(said)
      .sort()
      .map((key) => [key, said[key]]),
  );
}

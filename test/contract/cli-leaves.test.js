// The command line's dispatch stands in Go alone: cli.js stands nowhere, no
// source names it, and every verb Go lists stands as a program of its own or
// registers in Go.
// [[spec/tickets/cli-js-leaves]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const HERE = "test/contract/cli-leaves.test.js";
const FOLDERS = ["src", "test", ".claude/skills/level0", "RUNME.sh"];
const CODE = /\.(js|go|sh)$/;
const NAMED = /\bcli\.js\b/;

// Every code file under the folder, past the modules npm installs. [[spec/tickets/cli-js-leaves]]
function codeUnder(rel) {
  const at = join(root, ...rel.split("/"));
  if (!files.exists(at)) return [];
  if (CODE.test(rel) || rel === "RUNME.sh") return [rel];
  const out = [];
  let listed = [];
  try {
    listed = files.list(at);
  } catch {
    return [];
  }
  for (const one of listed) {
    if (one.name === "node_modules") continue;
    const path = `${rel}/${one.name}`;
    if (one.kind === "dir") out.push(...codeUnder(path));
    else if (CODE.test(one.name)) out.push(path);
  }
  return out;
}

test("cli.js stands nowhere", () => {
  assert.equal(files.exists(join(root, "src", "scripts", "cli.js")), false);
});

test("no source under src, test or level zero names cli.js", () => {
  const naming = FOLDERS.flatMap(codeUnder).filter(
    (one) =>
      one !== HERE && NAMED.test(String(files.read(join(root, ...one.split("/"))))),
  );
  assert.deepEqual(naming, []);
});

// A ported verb leaves its program and registers in Go from a file of its own. [[spec/tickets/landing-verbs-port-to-go]]
test("every verb Go lists stands as a program or registers in Go, and no program stands past the list", () => {
  const table = String(files.read(join(root, "src", "modules", "verbs", "tree.go")));
  const listed = [...table.matchAll(/\{Name: "([a-z]+)"/g)].map((one) => one[1]).sort();
  const folder = join(root, "src", "scripts", "verbs");
  const programs = files.exists(folder)
    ? files
        .list(folder)
        .map((one) => one.name)
        .filter((one) => one.endsWith(".js"))
        .map((one) => one.slice(0, -3))
        .sort()
    : [];
  assert.ok(listed.length > 0, "the table lists a verb");
  assert.deepEqual(
    programs.filter((one) => !listed.includes(one)),
    [],
    "no program stands past the list",
  );
  const quack = join(root, "src", "quack");
  const registered = files
    .list(quack)
    .filter((one) => one.name.endsWith(".go") && !one.name.endsWith("_test.go"))
    .map((one) => String(files.read(join(quack, one.name))))
    .join("\n");
  const orphans = [...new Set(listed)].filter(
    (verb) => !programs.includes(verb) && !registered.includes(`register("${verb}",`),
  );
  assert.deepEqual(orphans, [], "every verb with no program registers in Go");
});

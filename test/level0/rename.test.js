// The rename verb, over a fake disk. What reaches a name, what a rewrite
// answers, and what the move leaves behind.
// [[spec/design_output/index#the-questions-it-answers]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
// The whole module, so a name the verb answers nowhere yet fails an assertion. [[spec/tickets/a-rename-reaches-every-note]]
import * as rename from "../../src/scripts/rename.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));

// [[spec/tickets/a-rename-reaches-every-note]]
test("a reach is a line naming the old name, in any of the shapes a tree writes", () => {
  assert.equal(typeof rename.reachesIn, "function", "the verb answers reachesIn");
  const text = [
    'import { one } from "../viewer/ui.js";',
    "// [[spec/design_output/viewer#the-details]]",
    "const at = `src/viewer/main.go`;",
    "the viewer draws a row",
    "a review of the work",
  ].join("\n");

  const said = rename.reachesIn(text, "viewer");
  assert.deepEqual(
    said.map((one) => one.line),
    [1, 2, 3, 4],
    "a reach stands on each of the four lines, and review names another word",
  );
  assert.match(said[0].said, /viewer\/ui\.js/);
});

// [[spec/tickets/a-rename-reaches-every-note]]
test("a rewrite answers the old name as the new one, and leaves a longer word alone", () => {
  assert.equal(typeof rename.renamedText, "function", "the verb answers renamedText");
  const text = 'import "../viewer/ui.js";\n// a review of the viewer\n';

  assert.equal(
    rename.renamedText(text, "viewer", "tui"),
    'import "../tui/ui.js";\n// a review of the tui\n',
  );
  assert.equal(rename.renamedText(text, "view", "tui"), text, "a longer word stands");
});

// [[spec/tickets/a-rename-reaches-every-note]]
test("the move carries the folder and rewrites every file reaching it", () => {
  assert.equal(typeof rename.renaming, "function", "the verb answers renaming");
  const disk = fakeDisk({
    [at("src/viewer/main.go")]: "package main\n",
    [at("src/scripts/viewer.js")]: 'export const SOURCE = "src/viewer";\n',
    [at("spec/design_output/viewer.md")]: "# The window\n",
    [at("spec/design_output/pull.md")]:
      "See [[spec/design_output/viewer#the-details]].\n",
  });
  const it = { disk, join, root: ROOT, git: { run: () => ({ out: "", code: 0 }) } };

  const said = rename.renaming(it, "src/viewer", "src/tui");

  assert.equal(said.why, "", "the move answers no fault");
  assert.equal(
    disk.exists(at("src/tui/main.go")),
    true,
    "the file stands under the new name",
  );
  assert.equal(
    disk.exists(at("src/viewer/main.go")),
    false,
    "and nowhere under the old one",
  );
  assert.match(
    disk.read(at("src/scripts/viewer.js")),
    /src\/tui/,
    "a path reach rewrites",
  );
  assert.match(
    disk.read(at("spec/design_output/pull.md")),
    /\[\[spec\/design_output\/viewer#the-details\]\]/,
    "a note link naming another path stands as it stands",
  );
});

// [[spec/tickets/a-rename-reaches-every-note]]
test("a name standing nowhere answers a fault, and moves nothing", () => {
  assert.equal(typeof rename.renaming, "function", "the verb answers renaming");
  const disk = fakeDisk({ [at("src/viewer/main.go")]: "package main\n" });
  const it = { disk, join, root: ROOT, git: { run: () => ({ out: "", code: 0 }) } };

  const said = rename.renaming(it, "src/nobody", "src/tui");

  assert.match(said.why, /src\/nobody/, "the fault names what stands nowhere");
  assert.equal(disk.exists(at("src/tui")), false, "and nothing moves");
});

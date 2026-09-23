// The rename verb, over a fake disk. What reaches a name, what a rewrite
// answers, and what the move leaves behind. Each fixture names a word this
// tree holds nowhere, so a rename of a real name leaves this file alone.
// [[spec/design_output/index#a-rename-reaches-a-name]]

import assert from "node:assert/strict";
import { join, win32 } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
// The whole module, so a name the verb answers nowhere yet fails an assertion. [[spec/tickets/a-rename-reaches-every-note]]
import * as rename from "../../src/scripts/rename.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));
const OLD = "gadget";
const NEW = "widget";

// [[spec/tickets/a-rename-reaches-every-note]]
test("a reach is a line naming the old name, in any of the shapes a tree writes", () => {
  assert.equal(typeof rename.reachesIn, "function", "the verb answers reachesIn");
  const text = [
    `import { one } from "../${OLD}/ui.js";`,
    `// [[spec/design_output/${OLD}#the-details]]`,
    `const at = \`src/${OLD}/main.go\`;`,
    `the ${OLD} draws a row`,
    `a ${OLD}eer of the work`,
  ].join("\n");

  const said = rename.reachesIn(text, OLD);
  assert.deepEqual(
    said.map((one) => one.line),
    [1, 2, 3, 4],
    "a reach stands on each of the four lines, and a longer word holds none",
  );
  assert.match(said[0].said, /gadget\/ui\.js/);
});

// [[spec/tickets/a-rename-reaches-every-note]]
test("a rewrite answers the old name as the new one, and leaves a longer word alone", () => {
  assert.equal(typeof rename.renamedText, "function", "the verb answers renamedText");
  const text = `import "../${OLD}/ui.js";\n// a ${OLD}eer of the ${OLD}\n`;

  assert.equal(
    rename.renamedText(text, OLD, NEW),
    `import "../${NEW}/ui.js";\n// a ${OLD}eer of the ${NEW}\n`,
  );
  assert.equal(rename.renamedText(text, "gadge", NEW), text, "a longer word stands");
});

// A file with no ending and a page of markup each reach a name. [[spec/tickets/a-rename-reaches-every-note]]
test("the move carries a file of any ending, and the rewrite reaches one too", () => {
  assert.equal(typeof rename.writtenFiles, "function", "the verb answers writtenFiles");
  const disk = fakeDisk({
    [at(`src/${OLD}/main.go`)]: "package main\n",
    [at(`src/${OLD}/Makefile`)]: `all: src/${OLD}\n`,
    // A picture with no ending, so the reader looks at its bytes. [[spec/tickets/a-rename-reaches-every-note]]
    [at(`src/${OLD}/icon.png`)]: `\u0089PNG\u0000src/${OLD}\r\n`,
    [at(`src/${OLD}/a-picture`)]: `\u0089PNG\u0000src/${OLD}\r\n`,
    [at(".gitignore")]: `src/${OLD}/${OLD}\n`,
    [at("spec/funnel/a-page.html")]: `<code>src/${OLD}</code>\n`,
  });
  const it = { disk, join, root: ROOT };

  const said = rename.renaming(it, `src/${OLD}`, `src/${NEW}`);

  assert.equal(said.why, "");
  assert.equal(disk.exists(at(`src/${NEW}/Makefile`)), true, "a file with no ending moves");
  assert.equal(disk.exists(at(`src/${NEW}/icon.png`)), true, "and a picture moves too");
  assert.match(
    disk.read(at(".gitignore")),
    /src\/widget\/gadget/,
    "a file with no ending rewrites, and the name after the path stands",
  );
  assert.match(disk.read(at("spec/funnel/a-page.html")), /src\/widget/, "a page of markup rewrites");
  assert.equal(
    disk.read(at(`src/${NEW}/icon.png`)),
    `\u0089PNG\u0000src/${OLD}\r\n`,
    "a picture carries its bytes, because the rewrite reads it nowhere",
  );
  assert.equal(
    disk.read(at(`src/${NEW}/a-picture`)),
    `\u0089PNG\u0000src/${OLD}\r\n`,
    "and the reader looks at the bytes, so an ending decides nothing",
  );
  assert.equal(rename.readsAsText("a line of text\n"), true);
  assert.equal(rename.readsAsText("\u0089PNG\u0000"), false);
  assert.deepEqual(
    said.skipped,
    [`src/${NEW}/a-picture`, `src/${NEW}/icon.png`],
    "the run answers for each file its reader leaves out",
  );
});

// A source joining a key on a zero byte reads as a picture, and a run says so. [[spec/tickets/a-rename-reaches-every-note]]
test("a source the reader leaves out stands in the answer, so no reach drops in silence", () => {
  const disk = fakeDisk({
    [at(`src/${OLD}/main.go`)]: "package main\n",
    [at("src/scripts/one.js")]: `const KEY = "\u0000";\nexport const SOURCE = "src/${OLD}";\n`,
  });
  const it = { disk, join, root: ROOT };

  const said = rename.renaming(it, `src/${OLD}`, `src/${NEW}`);

  assert.deepEqual(said.skipped, ["src/scripts/one.js"], "the run names the file it skips");
  assert.match(
    disk.read(at("src/scripts/one.js")),
    /src\/gadget/,
    "and the reach in it stands, which is what the answer warns of",
  );
});

// [[spec/tickets/a-rename-reaches-every-note]]
test("the move carries the folder and rewrites every file reaching it", () => {
  assert.equal(typeof rename.renaming, "function", "the verb answers renaming");
  const disk = fakeDisk({
    [at(`src/${OLD}/main.go`)]: "package main\n",
    [at("src/scripts/one.js")]: `export const SOURCE = "src/${OLD}";\n`,
    [at("spec/design_output/pull.md")]:
      `See [[spec/design_output/${OLD}#the-details]].\n`,
  });
  const it = { disk, join, root: ROOT };

  const said = rename.renaming(it, `src/${OLD}`, `src/${NEW}`);

  assert.equal(said.why, "", "the move answers no fault");
  assert.equal(
    disk.exists(at(`src/${NEW}/main.go`)),
    true,
    "the file stands under the new name",
  );
  assert.equal(
    disk.exists(at(`src/${OLD}/main.go`)),
    false,
    "and nowhere under the old one",
  );
  assert.match(
    disk.read(at("src/scripts/one.js")),
    /src\/widget/,
    "a path reach rewrites",
  );
  assert.match(
    disk.read(at("spec/design_output/pull.md")),
    /\[\[spec\/design_output\/gadget#the-details\]\]/,
    "a note link naming another path stands as it stands",
  );
});

// A folder the walk skips moves with the rest, on a box spelling its paths with a backslash. [[spec/design_output/index#a-rename-reaches-a-name]]
test("the move carries a skipped folder too, on a windows path", () => {
  const WIN = "C:\\tree";
  const here = (path) => win32.join(WIN, ...path.split("/"));
  const disk = fakeDisk({
    [here(`src/${OLD}/main.go`)]: "package main\n",
    [here(`src/${OLD}/node_modules/dep/index.js`)]: "export {};\n",
    [here(`src/${OLD}/bin/tool.exe`)]: "MZ\u0000\u0001",
    [here("src/scripts/one.js")]: `export const SOURCE = "src/${OLD}";\n`,
  });
  const it = { disk, join: win32.join, root: WIN };

  const said = rename.renaming(it, `src/${OLD}`, `src/${NEW}/deep`);

  assert.equal(said.why, "");
  assert.equal(disk.exists(here(`src/${NEW}/deep/main.go`)), true);
  assert.equal(
    disk.read(here(`src/${NEW}/deep/node_modules/dep/index.js`)),
    "export {};\n",
    "a folder the walk skips moves, and nothing of it drops",
  );
  assert.equal(disk.read(here(`src/${NEW}/deep/bin/tool.exe`)), "MZ\u0000\u0001");
  assert.equal(disk.exists(here(`src/${OLD}`)), false, "the old folder stands nowhere");
  assert.deepEqual(said.moved, ["main.go"]);
  assert.match(disk.read(here("src/scripts/one.js")), /src\/widget\/deep/);
});

// A note is one file, and a reader reaches it with its ending and without. [[spec/tickets/a-rename-reaches-every-note]]
test("a note moves as a file, and both forms of its name rewrite", () => {
  assert.equal(typeof rename.renaming, "function", "the verb answers renaming");
  const disk = fakeDisk({
    [at(`spec/design_output/${OLD}.md`)]: "# The window\n",
    [at("spec/design_output/pull.md")]:
      `See [[spec/design_output/${OLD}#the-details]], in spec/design_output/${OLD}.md.\n`,
  });
  const it = { disk, join, root: ROOT };

  const said = rename.renaming(
    it,
    `spec/design_output/${OLD}.md`,
    `spec/design_output/${NEW}.md`,
  );

  assert.equal(said.why, "");
  assert.equal(disk.read(at(`spec/design_output/${NEW}.md`)), "# The window\n");
  assert.equal(disk.exists(at(`spec/design_output/${OLD}.md`)), false);
  assert.equal(
    disk.read(at("spec/design_output/pull.md")),
    `See [[spec/design_output/${NEW}#the-details]], in spec/design_output/${NEW}.md.\n`,
    "the link form and the path form each rewrite",
  );
});

// A module's name stands as no path, and the rewrite reaches it anyway. [[spec/tickets/a-rename-reaches-every-note]]
test("a name standing as no path rewrites, and moves nothing", () => {
  assert.equal(typeof rename.renamingText, "function", "the verb answers renamingText");
  const disk = fakeDisk({
    [at(`src/${NEW}/go.mod`)]: `module quackitect/${OLD}\n`,
    [at("src/other/go.mod")]: `require quackitect/${OLD} v0.0.0\n`,
  });
  const it = { disk, join, root: ROOT };

  const said = rename.renamingText(it, `quackitect/${OLD}`, `quackitect/${NEW}`);

  assert.equal(said.why, "");
  assert.deepEqual(said.moved, [], "a name standing as no path moves nothing");
  assert.equal(disk.read(at(`src/${NEW}/go.mod`)), `module quackitect/${NEW}\n`);
  assert.match(disk.read(at("src/other/go.mod")), /quackitect\/widget/);
});

// [[spec/tickets/a-rename-reaches-every-note]]
test("a name standing nowhere answers a fault, and moves nothing", () => {
  assert.equal(typeof rename.renaming, "function", "the verb answers renaming");
  const disk = fakeDisk({ [at(`src/${OLD}/main.go`)]: "package main\n" });
  const it = { disk, join, root: ROOT };

  const said = rename.renaming(it, "src/nobody", `src/${NEW}`);

  assert.match(said.why, /src\/nobody/, "the fault names what stands nowhere");
  assert.equal(disk.exists(at(`src/${NEW}`)), false, "and nothing moves");
});

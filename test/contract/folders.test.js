// The rules over the names the private folder holds. A copy of one names the
// module owning it beside the line, and the installer moves what those names
// say. Each case breaks the rule on a fake tree, and hands git a fake too.
// [[spec/design_input/the-runtime-files-stand-apart]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { configOf } from "../../.claude/skills/level0/lib/config.js";
import {
  INSTALL,
  installerHoldsTheNames,
  privateFolderOwned,
  treeOf,
} from "../../.claude/skills/level0/lib/tree.js";
import { disk } from "../../src/doors/disk.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const FAKE = "/tree";
const NODE = process.version.replace(/^v/, "");

const settings = configOf({
  read: async (where) => files.read(join(root, where)),
  readEnv: async () => ({}),
});
const words = await settings.ask("names.words");

const fakeTree = (seed, paths = []) =>
  treeOf({
    disk: fakeDisk(
      Object.fromEntries(
        Object.entries(seed).map(([at, said]) => [`${FAKE}/${at}`, said]),
      ),
    ),
    git: fakeGit({ "git ls-files": { stdout: paths.join("\n") } }, FAKE),
    root: FAKE,
    words,
    node: NODE,
    box: {},
  });

// [[spec/design_input/the-runtime-files-stand-apart]]
test("a file spelling the runtime folder without naming its owner is refused", () => {
  const found = privateFolderOwned(
    fakeTree(
      {
        "src/scripts/stray.js": 'const at = "x";\nconst hold = ".se/.runtime/hold";\n',
        "src/index/split.go": 'const at = ".se", ".runtime"\n',
      },
      ["src/scripts/stray.js", "src/index/split.go"],
    ),
  );

  assert.deepEqual(
    found.map((one) => [one.rule, one.file, one.line]),
    [
      ["PrivateFolderOwned", "src/scripts/stray.js", 2],
      ["PrivateFolderOwned", "src/index/split.go", 1],
    ],
  );
});

// A reader the move left behind spells the old place, and that is the drift. [[spec/design_input/the-runtime-files-stand-apart]]
test("a spelling of a name the runtime half took is refused where the old place stands", () => {
  const stale = {
    "src/bridge/left.js": 'const at = join(work, ".se", "hold");\n',
    "src/scripts/old.js": 'const bin = ".se/bin";\nconst log = ".se/.log";\n',
  };
  assert.deepEqual(
    privateFolderOwned(fakeTree(stale, Object.keys(stale))).map((one) => [
      one.file,
      one.line,
    ]),
    [
      ["src/bridge/left.js", 1],
      ["src/scripts/old.js", 1],
    ],
  );

  const kept = { "src/scripts/rest.js": 'const notes = ".se/notes";\n' };
  assert.deepEqual(privateFolderOwned(fakeTree(kept, Object.keys(kept))), []);
});

// The escape binds to the line, so an import of the owner excuses no other spelling. [[spec/design_input/the-runtime-files-stand-apart]]
test("a spelling under an import alone is refused, and one under its comment passes", () => {
  const loose = {
    "src/scripts/two.js":
      'import { inRun } from "../../.claude/skills/level0/lib/folders.js";\nconst at = ".se/.runtime/bin";\n',
  };
  assert.deepEqual(
    privateFolderOwned(fakeTree(loose, Object.keys(loose))).map((one) => [
      one.file,
      one.line,
    ]),
    [["src/scripts/two.js", 2]],
  );

  const named = {
    "src/scripts/two.js":
      'import { inRun } from "../../.claude/skills/level0/lib/folders.js";\n// The folder folders.js owns, spelled again here.\nconst at = ".se/.runtime/bin";\n',
  };
  assert.deepEqual(privateFolderOwned(fakeTree(named, Object.keys(named))), []);
});

test("a file naming the owner beside the copy passes, and a test file passes", () => {
  const owned = {
    "src/extension/copy.js":
      '// The folder folders.js owns, spelled again here.\nconst BIN = ".se/.runtime/bin";\n',
    "test/level0/folders.test.js": 'const at = ".se/.runtime/bin";\n',
    ".claude/skills/level0/lib/folders.js": 'export const RUN = ".se/.runtime";\n',
  };
  assert.deepEqual(privateFolderOwned(fakeTree(owned, Object.keys(owned))), []);
});

// The installer's loop and the list the rule reads move in one change. [[spec/design_input/the-runtime-files-stand-apart]]
test("a loop standing apart from its list is refused", () => {
  const loop = (names) =>
    `# folders.js owns these names as RENAMED.\nfor one in ${names}; do\n  mv "$one" "$new"\ndone\n`;
  const over = (text) =>
    installerHoldsTheNames(fakeTree({ [INSTALL]: text }, [INSTALL]));

  const short = over(loop('"$root/.se/run"'));
  assert.ok(
    short.some(
      (one) => one.rule === "InstallerHoldsTheNames" && /runtime/.test(one.message),
    ),
    "a name the list holds and the loop drops",
  );

  const strange = over(loop('"$root/.se/run" "$root/.se/runtime" "$root/.se/old"'));
  assert.ok(
    strange.some((one) => /old/.test(one.message)),
    "a name the loop holds and no list does",
  );

  const bare = over('for one in bin hold; do\n  mv "$one" "$new"\ndone\n');
  assert.ok(
    bare.some((one) => /names no list/.test(one.message)),
    "a loop naming no list",
  );
});

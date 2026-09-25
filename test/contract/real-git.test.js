// Git is a door, and one test drives it against a real repository. Every other
// test reads git through the fake, so this case names each test file importing
// the real door or building a repository of its own.
// [[spec/design_output/doors#a-door-standing-on-another]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const TESTS = "test";
const REAL = "test/contract/git.test.js";
const SELF = "test/contract/real-git.test.js";

// Each file here keeps one case over the tracked list, because no check reads the rule it holds. The entry leaves once a check takes the rule. [[spec/design_output/tree#the-rules-over-two-files]]
const KEPT = new Map([
  [
    "test/contract/tree.test.js",
    "everyModuleTested, stopFolderIsData, privateFolderOwned and installerHoldsTheNames over this tree",
  ],
  [
    "test/contract/schema.test.js",
    "the process schema over the process files git holds",
  ],
]);

// The spellings of the real door and of a fresh repository, split so this file carries neither whole.
const DOOR = new RegExp(`doors/${"git"}\\.js["']`);
const INIT = new RegExp(
  [
    `["']git["']\\s*,\\s*["']${"init"}["']`,
    `\\bgit ${"init"}\\b`,
    `\\(\\s*\\[\\s*["']${"init"}["']`,
  ].join("|"),
);

// Every file a test run reaches, by its path from the root.
function testFiles(at = TESTS) {
  const out = [];
  for (const one of files.list(join(root, at))) {
    const path = `${at}/${one.name}`;
    if (one.kind === "dir") out.push(...testFiles(path));
    else if (one.name.endsWith(".js")) out.push(path);
  }
  return out;
}

// [[spec/design_output/doors#a-door-standing-on-another]]
function realGitIn(texts) {
  const out = [];
  for (const [path, text] of Object.entries(texts)) {
    if (path === REAL || path === SELF) continue;
    if (DOOR.test(text) && !KEPT.has(path))
      out.push(`${path} imports src/doors/git.js`);
    if (INIT.test(text)) out.push(`${path} runs git init`);
  }
  return out;
}

test("a test file importing the real door or building a repository is named", () => {
  const found = realGitIn({
    "test/level0/door.test.js": 'import { git } from "../../src/doors/git.js";\n',
    "test/level0/repo.test.js": `door.run(["${"init"}", "-b", "main"], true);\n`,
    "test/level0/shell.test.js": `proc.run(["git", "${"init"}", "-q"]);\n`,
    "test/level0/fake.test.js":
      'import { fakeGit } from "../../src/doors/fake/git.js";\n',
    [REAL]: `import { git } from "../../src/doors/git.js";\ngit ${"init"}\n`,
  });
  assert.deepEqual(found, [
    "test/level0/door.test.js imports src/doors/git.js",
    "test/level0/repo.test.js runs git init",
    "test/level0/shell.test.js runs git init",
  ]);
});

test("no test file past the door's own imports the real door or runs git init", () => {
  const texts = Object.fromEntries(
    testFiles().map((path) => [path, files.read(join(root, path))]),
  );
  const found = realGitIn(texts);
  assert.deepEqual(
    found,
    [],
    `Git answers ${REAL} alone. Hand these the fake door, src/doors/fake/git.js:\n${found.join("\n")}`,
  );
});

test("each file the list excuses still reads the tracked list through the real door", () => {
  for (const [path, why] of KEPT) {
    assert.match(
      files.read(join(root, path)),
      DOOR,
      `${path} reads git no more, so ${why} leaves the list`,
    );
  }
});

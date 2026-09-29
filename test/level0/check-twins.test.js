// The JavaScript side of the check twins answers every twin over a tree it
// takes, and a golden file stands under the check module for every twin.
// [[spec/tickets/check-names-meet-their-goldens]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { treeOf } from "../../.claude/skills/level0/lib/tree.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { NAME, TWINS, twinsOf } from "../../src/scripts/check-twins.js";

// A Vale answer and a Biome answer, each in the shape its tool prints. [[spec/tickets/check-names-meet-their-goldens]]
const vale = {
  "spec/a.md": [
    {
      Check: "VoiceParagraph.Sentence",
      Line: 3,
      Span: [7, 9],
      Message: "Cut it.",
      Severity: "warning",
    },
    {
      Check: "VoiceShape.GuidanceCap",
      Line: 1,
      Span: [1, 2],
      Message: "Cap.",
      Severity: "",
    },
  ],
  "spec\\b.md": [
    {
      Check: "VoiceParagraph.Sentence",
      Line: 2,
      Message: "Cut it.",
      Severity: "warning",
    },
  ],
};
const biome = {
  diagnostics: [
    {
      severity: "warning",
      category: "lint/style/useConst",
      location: { path: "src/a.js", start: { line: 4 } },
      message: "Use const.",
    },
    {
      severity: "error",
      category: "lint/suspicious/noDebugger",
      location: { path: "src/b.js", start: { line: 2 } },
      message: "No debugger.",
    },
  ],
};

const TREE = {
  "src/a.js": "const a = 7;\nconst b = 42;\n",
  "src/b.go": "package b\n\nfunc f() int { return 42 }\n",
  "spec/note.md": "# The Note's Head\n\nThe owner reads it.\n",
  "spec/_draft/x.md": "# draft\n",
  "a/very/long-name-with-many-words-past-the-cap.md": "text\n",
};

function treeHere() {
  const disk = fakeDisk(
    Object.fromEntries(
      Object.entries(TREE).map(([path, text]) => [`/r/${path}`, text]),
    ),
  );
  const git = { run: () => ({ out: Object.keys(TREE).join("\n") }) };
  return treeOf({ root: "/r", disk, git, words: 5, node: "", box: {} });
}

test("every twin answers over a tree it takes", () => {
  const said = twinsOf(treeHere(), {
    all: Object.keys(TREE),
    words: 5,
    ceilings: { file: 600, function: 150 },
    vale: JSON.stringify(vale),
    biome: JSON.stringify(biome),
  });
  assert.deepEqual(Object.keys(said).sort(), [...TWINS].sort());
  assert.ok(
    said.tree.some((one) => one.message === "runs"),
    "the tree twin names the rules it runs",
  );
  assert.ok(
    said.magic.some((one) => one.file === "src/b.go"),
    "a bare number reads as magic",
  );
  assert.deepEqual(
    said.paths.map((one) => one.file),
    ["spec/_draft/x.md"],
  );
  assert.ok(
    said.names.some((one) => one.file.startsWith("a/very/")),
    "a long name reads as long",
  );
  assert.ok(
    said.private.some((one) => one.file === "spec/note.md" && one.message === NAME),
  );
  assert.ok(said.slug.some((one) => one.message === "the-notes-head"));
  assert.equal(said.vale.length, 3);
  assert.equal(said.biome.length, 2);
});

test("a twin's golden file stands for every twin", async () => {
  for (const twin of TWINS) {
    let golden = null;
    try {
      golden = (
        await import(`../../src/modules/check/testdata/${twin}.golden.json`, {
          with: { type: "json" },
        })
      ).default;
    } catch {
      golden = null;
    }
    assert.ok(
      golden,
      `no golden file stands for ${twin}: run go test ./src/lsp -run TestTwinGoldens -twins`,
    );
    assert.ok(
      Array.isArray(golden.javascript) && Array.isArray(golden.go),
      `${twin}'s golden holds both sides`,
    );
  }
});

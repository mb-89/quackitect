// The word lists this tree ships. Every term names a note that stands, and a
// chapter it names stands in that note, because a term with no defining note
// is jargon.
// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { readYaml } from "../../.claude/skills/level0/lib/schema.js";
import { disk } from "../../src/doors/disk.js";
import {
  CORE,
  coreOf,
  SWAPS,
  swapsOf,
  TERMS,
  termsOf,
  undefinedTerms,
  wordsOf,
} from "../../.claude/skills/level0/lib/vocabulary.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const read = (path) => readYaml(files.read(join(root, path)));

const slug = (heading) =>
  heading
    .toLowerCase()
    .replace(/[`']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function noteAt(link) {
  const [path, anchor] = link.replace(/^\[\[|\]\]$/g, "").split("#");
  for (const ending of ["", ".md", ".yaml", ".yml"]) {
    const at = join(root, `${path}${ending}`);
    if (files.exists(at)) return { at, anchor, text: ending ? files.read(at) : "" };
  }
  return null;
}

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
test("every term names a note that stands, and a chapter that stands in it", () => {
  const terms = termsOf(read(TERMS));
  assert.ok(terms.length >= 100, `the terms hold ${terms.length}`);
  assert.deepEqual(undefinedTerms(read(TERMS)), []);

  const broken = [];
  for (const one of terms) {
    const note = noteAt(one.defines);
    if (!note) {
      broken.push(`${one.word}: ${one.defines} stands nowhere`);
      continue;
    }
    if (!note.anchor || !note.text) continue;
    const headings = note.text.split("\n").filter((line) => /^#{1,6} /.test(line));
    if (!headings.some((line) => slug(line.replace(/^#+ /, "")) === note.anchor)) {
      broken.push(`${one.word}: no chapter ${note.anchor} in ${one.defines}`);
    }
  }
  assert.deepEqual(broken, []);
});

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
test("the core holds the standard, the seed and the common words", () => {
  const core = coreOf(read(CORE));
  const from = new Set(core.map((one) => one.from));
  assert.ok(core.length >= 5000, `the core holds ${core.length}`);
  assert.ok(from.has("ste") && from.has("openste") && from.has("common"));
});

// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
test("every swap writes a word the lists hold", () => {
  const lists = { core: read(CORE), terms: read(TERMS), swaps: read(SWAPS) };
  const held = new Set(wordsOf(lists));
  const loose = [...swapsOf(lists)].filter(
    ([, write]) => !write.split(" ").every((w) => held.has(w)),
  );
  assert.deepEqual(loose, []);
});

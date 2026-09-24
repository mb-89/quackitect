// The word lists this tree ships. Every term says what it means in core words
// and other terms, and points at no note in the tree.
// [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { readYaml } from "../../.claude/skills/level0/lib/schema.js";
import { CASES, slugOf } from "../../.claude/skills/level0/lib/slug.js";
import {
  CORE,
  coreOf,
  looseMeanings,
  SWAPS,
  swapsOf,
  TERMS,
  termsOf,
  wordsOf,
} from "../../.claude/skills/level0/lib/vocabulary.js";
import { disk } from "../../src/doors/disk.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const read = (path) => readYaml(files.read(join(root, path)));

// The slug stands in one place, and this file drives that one. [[spec/design_output/vocabulary#the-slug-reads-one-source]]
test("the slug answers every case the source holds", () => {
  const said = read(CASES);
  assert.ok(said.cases?.length, `${CASES} holds no case`);
  for (const one of said.cases) {
    assert.equal(slugOf(one.heading), one.anchor, one.heading);
  }
});

// The dictionary is the source, so a term points at no note. [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
test("no term points at a note in the tree", () => {
  const rows = read(TERMS).terms ?? [];
  assert.ok(rows.length >= 100, `the terms hold ${rows.length}`);
  const pointing = rows
    .filter((one) => "defines" in one || Object.values(one).some((v) => String(v).includes("[[")))
    .map((one) => one.word);
  assert.deepEqual(pointing, []);
});

// A term says what it means in words a reader holds. [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
test("every term says what it means, in core words and other terms", () => {
  const lists = { core: read(CORE), terms: read(TERMS), swaps: read(SWAPS) };
  assert.deepEqual(
    termsOf(lists.terms)
      .filter((one) => !one.means)
      .map((one) => one.word),
    [],
  );
  assert.deepEqual(looseMeanings(lists), []);
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

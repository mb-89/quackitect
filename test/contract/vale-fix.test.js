// The fixer, over a real file. `vale fix --apply` writes to disk, so a fixer
// asserted against a stub is a fixer nobody has run.
// [[spec/design_output/doors#every-door-has-exactly-one-contract-test]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { skip, test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";
import { calmed, SHOUTED } from "../../src/level0/lib/shout.js";
import { CONFIG, fromJson, valeBin } from "../../src/level0/lib/vale.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const outside = proc();
const bin = join(root, valeBin(process.platform));
const ifVale = files.exists(bin) ? test : skip;

const vale = (argv) => outside.run([bin, ...argv], { cwd: root });

function inATempFile(text, what) {
  const at = files.tempDir("level0-vale-");
  const where = join(at, "notes.md");
  files.write(where, text);
  try {
    return what(where);
  } finally {
    files.remove(at);
  }
}

const fixed = (text, rounds = 1) =>
  inATempFile(text, (where) => {
    for (let round = 0; round < rounds; round++) {
      vale(["fix", "--apply", `--config=${CONFIG}`, where]);
    }
    return files.read(where);
  });

const found = (text) =>
  inATempFile(text, (where) =>
    fromJson(vale([`--config=${CONFIG}`, "--output=JSON", "--no-exit", where]).stdout),
  );

ifVale("a contraction is written out, and the line keeps its case", () => {
  const said = fixed("# Notes\n\nIt's here. don't go. WON'T stop. We've seen it.\n");
  assert.equal(
    said,
    "# Notes\n\nIt is here. do not go. Will not stop. We have seen it.\n",
  );
});

ifVale("every contraction in the swap map has a written form", () => {
  const was =
    "# Notes\n\ncan't won't don't doesn't didn't isn't aren't wasn't hasn't\n" +
    "haven't it's that's there's you're they're we've I've we'll it'll\n";
  const said = fixed(was);
  assert.ok(!/n't|'s |'re|'ve|'ll/.test(said), said);
  assert.match(said, /cannot will not do not does not did not is not are not/);
  assert.match(said, /it is that is there is you are they are we have I have/);
});

ifVale("a Latin short form is written out in English", () => {
  const said = fixed(
    "# Notes\n\nA duck, e.g. a mallard, i.e. loud. Viz. this. Cf. that.\n",
  );
  assert.equal(
    said,
    "# Notes\n\nA duck, for example a mallard, that is loud. Namely this. Compare that.\n",
  );
});

ifVale(
  "etc. is reported and left standing, because its full stop needs a person",
  () => {
    const was = "# Notes\n\nDucks, geese, etc. We saw them.\n";
    assert.equal(fixed(was), was);
    assert.ok(found(was).some((one) => one.rule === "EtCetera"));
  },
);

ifVale("a shouted lead is reported with no action, and the tree calms it", () => {
  const was = "# Notes\n\nNOTHING AT ALL WORKS HERE, and then calm.\n";
  const shouts = found(was).filter((one) => one.rule === SHOUTED);
  assert.equal(shouts.length, 1);
  assert.equal(shouts[0].fixable, false);
  assert.equal(
    calmed(was, shouts),
    "# Notes\n\nNothing at all works here, and then calm.\n",
  );
});

ifVale("calming a shout uncovers the contraction inside it", () => {
  const was = "# Notes\n\nDON'T STOP AT ALL HERE, and then calm.\n";
  const now = fixed(calmed(was, found(was)));
  assert.equal(now, "# Notes\n\nDo not stop at all here, and then calm.\n");
});

ifVale("a second run leaves the file byte for byte the same", () => {
  const was =
    "# Notes\n\nIt's a duck, e.g. a mallard. They're loud, i.e. they quack.\n";
  assert.equal(fixed(was, 1), fixed(was, 4));
});

ifVale("fenced code keeps every breach it carries", () => {
  const was = "# Notes\n\n```\nIt's a duck, e.g. a mallard.\n```\n";
  assert.equal(fixed(was), was);
});

ifVale("an exempted span keeps its breach", () => {
  const was =
    "# Notes\n\n<!-- because: the fixer leaves this alone -->\n" +
    "<!-- vale VoiceVale.Contraction = NO -->\nIt's here.\n";
  assert.equal(fixed(was), was);
});

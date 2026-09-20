// The fixer, over real files. `vale fix --apply` writes to disk, so a fixer
// asserted against a stub is a fixer nobody has run. The helper runs it twice
// over every text this file declares, and each case reads its own back.
// [[spec/design_output/doors#one-contract-test-per-door]]

import assert from "node:assert/strict";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { calmed, SHOUTED } from "../../.claude/skills/level0/lib/shout.js";
import { NOTE, rulesIn } from "./ruled.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const { proves } = rulesIn(root, NOTE, { fixes: true });

const noted = (line) => `# Notes\n\n${line}\n`;

proves(
  "a contraction is written out, and the line keeps its case",
  { it: noted("It's here. don't go. WON'T stop. We've seen it.") },
  (said) => {
    assert.equal(
      said.fixed("it"),
      noted("It is here. do not go. Will not stop. We have seen it."),
    );
  },
);

proves(
  "every contraction in the swap map has a written form",
  {
    it:
      "# Notes\n\ncan't won't don't doesn't didn't isn't aren't wasn't hasn't\n" +
      "haven't it's that's there's you're they're we've I've we'll it'll\n",
  },
  (said) => {
    const now = said.fixed("it");
    assert.ok(!/n't|'s |'re|'ve|'ll/.test(now), now);
    assert.match(now, /cannot will not do not does not did not is not are not/);
    assert.match(now, /it is that is there is you are they are we have I have/);
  },
);

proves(
  "a Latin short form is written out in English",
  { it: noted("A duck, e.g. a mallard, i.e. loud. Viz. this. Cf. that.") },
  (said) => {
    assert.equal(
      said.fixed("it"),
      noted("A duck, for example a mallard, that is loud. Namely this. Compare that."),
    );
  },
);

proves(
  "etc. is reported and left standing, because its full stop needs a person",
  { it: noted("Ducks, geese, etc. We saw them.") },
  (said) => {
    assert.equal(said.fixed("it"), said.text("it"));
    assert.ok(said.rules("it").includes("EtCetera"));
  },
);

proves(
  "a shouted lead is reported with no action, and the tree calms it",
  { it: noted("NOTHING AT ALL WORKS HERE, and then calm.") },
  (said) => {
    const shouts = said.found("it").filter((one) => one.rule === SHOUTED);
    assert.equal(shouts.length, 1);
    assert.equal(shouts[0].fixable, false);
    assert.equal(
      calmed(said.text("it"), shouts),
      noted("Nothing at all works here, and then calm."),
    );
  },
);

// The calm text stands declared as well, so the fixer reads it off the same rounds. [[spec/design_output/doors#one-contract-test-per-door]]
proves(
  "calming a shout uncovers the contraction inside it",
  {
    shouted: noted("DON'T STOP AT ALL HERE, and then calm."),
    calm: noted("Don't stop at all here, and then calm."),
  },
  (said) => {
    assert.equal(calmed(said.text("shouted"), said.found("shouted")), said.text("calm"));
    assert.equal(said.fixed("calm"), noted("Do not stop at all here, and then calm."));
  },
);

proves(
  "a second run leaves the file byte for byte the same",
  { it: noted("It's a duck, e.g. a mallard. They're loud, i.e. they quack.") },
  (said) => {
    assert.notEqual(said.fixed("it"), said.text("it"), "the first round writes");
    assert.equal(said.settled("it"), said.fixed("it"));
  },
);

proves(
  "fenced code keeps every breach it carries",
  { it: "# Notes\n\n```\nIt's a duck, e.g. a mallard.\n```\n" },
  (said) => {
    assert.equal(said.fixed("it"), said.text("it"));
  },
);

proves(
  "an exempted span keeps its breach",
  {
    it:
      "# Notes\n\n<!-- because: the fixer leaves this alone -->\n" +
      "<!-- vale VoiceParagraph.Contraction = NO -->\nIt's here.\n",
  },
  (said) => {
    assert.equal(said.fixed("it"), said.text("it"));
  },
);

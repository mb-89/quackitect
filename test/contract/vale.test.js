// The Vale door, and the voice rules through the real Vale. One case drives
// the door against the binary and holds the fake to the same answer. The rule
// cases read their findings off the one run the helper makes for this file,
// because a rule asserted against a stub is a rule nobody has run.
// [[spec/design_output/doors#one-contract-test-per-door]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { NOBODY } from "../../.claude/skills/level0/lib/private.js";
import { disk } from "../../src/doors/disk.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { proc } from "../../src/doors/proc.js";
import { vale } from "../../src/doors/vale.js";
import { at, NOTE, rulesIn } from "./ruled.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const outside = proc();
const { ifVale, proves } = rulesIn(root);

// The real run teaches the fake, so the door answers the same through both. [[spec/design_output/doors#one-contract-test-per-door]]
ifVale(
  "the door stands where the binary is, reads a text under its path, and the fake answers the same",
  async () => {
    const taught = {};
    const recording = {
      run: (argv, init) => {
        const said = outside.run(argv, init);
        taught[argv.join(" ")] = said;
        return said;
      },
    };
    const door = vale(files, recording, root);
    assert.equal(door.stands(), true);

    const text = "THIS IS THE SHOUTED PART, and it follows.\n";
    const said = await door.lint(text, NOTE);
    assert.equal(said.ran, true, said.why);
    assert.deepEqual(
      said.found.map((one) => one.rule),
      ["ShoutedLead"],
    );

    const twin = vale(files, fakeProc(taught), root);
    assert.deepEqual(await twin.lint(text, NOTE), said);
  },
);

test("a box with no binary reads no rule, and says so", async () => {
  const door = vale(fakeDisk(), fakeProc(), "/tree");
  assert.equal(door.stands(), false);
  assert.deepEqual(await door.lint("A line.\n", NOTE), {
    ran: false,
    why: "no vale stands here",
    found: [],
  });
});

ifVale(
  "a shouted lead is refused and an acronym inside a sentence passes",
  proves(
    {
      shouted: "THIS IS THE SHOUTED PART, and it follows.",
      acronym: "The engine reads SQLite and answers JSON.",
    },
    (said) => {
      assert.ok(said.rules("shouted").includes("ShoutedLead"));
      assert.ok(!said.rules("acronym").includes("ShoutedLead"));
    },
  ),
);

ifVale(
  "antithesis is refused",
  proves({ it: "It is a door rather than a window." }, (said) => {
    assert.ok(said.rules("it").includes("Antithesis"));
  }),
);

// A marker places a claim in a tree that stands no more, and the rationales own that telling. [[spec/design_output/lsp#a-marker-carries-old-news]]
ifVale(
  "a history marker is refused and the standing claim passes",
  proves(
    {
      usedTo: "The door used to read the config.",
      previously: "The door previously names the file.",
      standing: "The door reads the config.",
    },
    (said) => {
      assert.ok(said.rules("usedTo").includes("History"));
      assert.ok(said.rules("previously").includes("History"));
      assert.ok(!said.rules("standing").includes("History"));
    },
  ),
);

ifVale(
  "the passive is refused and the active passes",
  proves(
    {
      passive: "The file was written by the engine.",
      active: "The engine writes the file.",
    },
    (said) => {
      assert.ok(said.rules("passive").includes("Passive"));
      assert.ok(!said.rules("active").includes("Passive"));
    },
  ),
);

ifVale(
  "a table and a list are not paragraphs",
  proves({ table: "| a | b |\n| - | - |\n", list: "- one\n- two\n" }, (said) => {
    assert.deepEqual(said.rules("table"), []);
    assert.deepEqual(said.rules("list"), []);
  }),
);

ifVale(
  "fenced code carries none of these rules",
  proves(
    { fenced: "```\nTHIS IS SHOUTED CODE, and it is left alone.\n```\n" },
    (said) => {
      assert.deepEqual(said.rules("fenced"), []);
    },
  ),
);

const BINDS = "- The door shall refuse the write, and it should name the rule.\n";
const INPUT = "spec/design_input/one.md";

// [[spec/funnel/a-paragraph-has-a-schema]]
ifVale(
  "the requirement register takes shall and should, and no other does",
  proves(
    {
      input: at(BINDS, INPUT),
      note: BINDS,
      output: at(BINDS, "spec/design_output/one.md"),
    },
    (said) => {
      assert.deepEqual(said.rules("input"), []);
      for (const key of ["note", "output"])
        assert.ok(said.rules(key).includes("Modal"), `${key} refuses shall and should`);
    },
  ),
);

ifVale(
  "the register outside the set stands refused inside it too",
  proves(
    { loose: at("- The door may refuse the write, and it would say why.\n", INPUT) },
    (said) => {
      assert.ok(said.rules("loose").includes("ModalRequirement"));
      assert.ok(
        !said.rules("loose").includes("Modal"),
        "one modal rule reads a path, and one alone",
      );
    },
  ),
);

// [[spec/design_output/private#a-fixture-carries-no-shape]]
const SECRETS = ["/home", "fnordwick", "secrets"].join("/");
const CALLED = ["+49 30", "1234 5678"].join(" ");

// [[spec/design_output/private#the-shapes]]
ifVale(
  "the shapes rule refuses an address, a number, a date and a home path",
  proves(
    [
      "Reach the owner at somebody@example.com when the box stalls.",
      `Call ${CALLED} about it, and say what stalls.`,
      "Measured on 2026-09-10 against client 2.1.267, on a cloud box.",
      `The probe writes under ${SECRETS} and reads it back.`,
      "A box answers C:\\Users\\fnordwick\\Desktop as the home folder there.",
    ],
    (said) => {
      for (const key of [0, 1, 2, 3, 4])
        assert.ok(said.rules(key).includes("Private"), said.text(key));
    },
  ),
);

ifVale(
  "a nobody user, a version and an example pass the shapes rule",
  proves(
    [
      "A cloud box writes under /home/user, and a fixture writes /Users/one.",
      "A runner writes under /home/runner, and an agent under /home/claude.",
      "Client 2.1.267 stands the same way, and the number 1024 passes.",
      `    the indented example: 2026-09-08 and ${SECRETS}\n`,
    ],
    (said) => {
      for (const key of [0, 1, 2, 3])
        assert.ok(!said.rules(key).includes("Private"), said.text(key));
    },
  ),
);

// [[spec/funnel/a-paragraph-has-a-schema]]
const saidOf = (said, key, rule) =>
  said
    .found(key)
    .filter((one) => one.rule === rule)
    .map((one) => one.message);

// [[spec/funnel/a-paragraph-has-a-schema]]
ifVale(
  "a word the list leaves out is refused, and the refusal names it",
  proves({ it: "The door refuses a flibbertigibbet." }, (said) => {
    const found = saidOf(said, "it", "Vocabulary");
    assert.equal(found.length, 1);
    assert.match(
      found[0],
      /^flibbertigibbet stands outside the words this tree writes/,
    );
    assert.match(found[0], /terms\.yml/);
  }),
);

// [[spec/funnel/a-paragraph-has-a-schema]]
ifVale(
  "a word the list swaps is refused, and the refusal names the swap",
  proves({ it: "The door utilize the list." }, (said) => {
    assert.deepEqual(saidOf(said, "it", "Vocabulary"), [
      "utilize stands outside the words this tree writes. Write use instead.",
    ]);
  }),
);

// [[spec/funnel/a-paragraph-has-a-schema]]
ifVale(
  "the words this tree writes pass, and so does what stands outside a layer",
  proves(
    [
      "The door refuses a write, and the writer reads the refusal.",
      "A run of doors reads the rules, and the rules stand in one folder.",
      "The tree writes `flibbertigibbet` in a code span, so the rule reads past it.",
      "A path like spec/vocabulary/words.yml stands outside the layer.",
      "The owner reads [[spec/funnel/a-paragraph-has-a-schema]] first.",
      "A capital past the first word names Flibbertigibbet, so it stands.",
      "The door reads 2048 bytes and the rule passes over a digit.",
    ],
    (said) => {
      for (const key of [0, 1, 2, 3, 4, 5, 6])
        assert.deepEqual(saidOf(said, key, "Vocabulary"), [], said.text(key));
    },
  ),
);

// [[spec/funnel/a-paragraph-has-a-schema]]
ifVale(
  "a plural, a past form and an -ing form of a listed word stand",
  proves(
    [
      "The door refuses a write, and the doors refused it.",
      "The door is refusing a write, and the writer stands waiting.",
      "The rules carry the tries a session tried.",
    ],
    (said) => {
      for (const key of [0, 1, 2])
        assert.deepEqual(saidOf(said, key, "Vocabulary"), [], said.text(key));
    },
  ),
);

test("the shapes rule and the commit door pass one list of nobody users", () => {
  const rule = files.read(join(root, "spec/config/styles/VoiceVale/Private.yml"));
  const listed = /nobody := \[([^\]]*)\]/.exec(rule);
  assert.ok(listed, "the rule names its nobody users");
  const names = listed[1].split(",").map((one) => one.trim().replace(/^"|"$/g, ""));
  assert.deepEqual(names.sort(), [...NOBODY].sort());
});

const DESIGN = "spec/design_output/probe.md";
const BARE = "The verb exits 0 on survives.\n";

// [[spec/design_output/config#the-magic-numbers-take-names]]
ifVale(
  "a digit in a design note's prose is refused, and a version, a unit and a table pass",
  proves(
    {
      bare: at(BARE, DESIGN),
      quiet: at(
        [
          "Measured against client 2.1.267, a poll every 250 ms stands, and x86 ships.",
          "",
          "| what | count |",
          "|---|---|",
          "| events | 186 |",
          "",
          "1. The verb exits `0` on survives.",
          "",
        ].join("\n"),
        DESIGN,
      ),
      note: BARE,
    },
    (said) => {
      assert.ok(said.rules("bare").includes("DigitInProse"));
      assert.deepEqual(
        said.rules("quiet").filter((one) => one === "DigitInProse"),
        [],
      );
      assert.ok(!said.rules("note").includes("DigitInProse"));
    },
  ),
);

// A count spelled in words before the things it counts meets the digit rule, and a word counting nothing passes. [[spec/guidance/voice]]
ifVale(
  "a count in words before a plural meets the digit rule, and a count word alone passes",
  proves(
    {
      counted: at(
        "Three verbs answer what their asks name, and the list has four rows.\n",
        "spec/design_output/probe.md",
      ),
      quiet: at(
        "The verbs answer what their asks name, and two of them read the queue.\n",
        "spec/design_output/probe.md",
      ),
    },
    (said) => {
      assert.equal(
        said.rules("counted").filter((one) => one === "DigitInProse").length,
        2,
      );
      assert.deepEqual(
        said.rules("quiet").filter((one) => one === "DigitInProse"),
        [],
      );
    },
  ),
);

// A span inside one line pairs first, so a lone mark takes no opening mark off the line under it, and every fault names the item's line. [[spec/tickets/a-lone-mark-pairs-wrong]]
ifVale(
  "a lone mark on a list item pairs with no span under it",
  proves(
    {
      apart: at(
        "- the mark ` opens a span, and the door reads it\n\nThe door reads `x` on this line, and the rule leaves it alone.\n",
        "notes.md",
      ),
      together: at(
        "- the mark ` opens a span, and the door reads it\n- the door reads `x` on this item, and the rule leaves it alone\n",
        "notes.md",
      ),
    },
    (said) => {
      for (const key of ["apart", "together"]) {
        const lines = said.found(key).map((one) => one.line);
        assert.ok(lines.includes(1), `no fault names the item's line on ${key}`);
        assert.ok(
          lines.every((one) => one === 1),
          `a fault stands off the item's line on ${key}`,
        );
      }
    },
  ),
);

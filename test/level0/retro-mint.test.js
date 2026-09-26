// The retro's minting: a class the check step leaves open gets one ticket,
// a class the tree answers already gets none.
// [[spec/guidance/retro/check]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { askOf, promotionName, withAsk } from "../../src/engine/retro/mint.js";
import { retro } from "../../src/scripts/retro.js";

const ROOT = "/tree";
// The command line stands under the method root, apart from the work root, as in a stub. [[spec/design_output/vehicle#the-work-root-inherits]]
const METHOD = "/method";
const NODE = "/bin/node";
const CLI = `${NODE} ${join(METHOD, "src", "scripts", "cli.js")}`;
const RETRO = "retro-a1b2c3";
const at = (path) => join(ROOT, ".se", ".retro", RETRO, ...path.split("/"));
const TICKET = join(ROOT, "spec", "tickets", "the-land-verb-lands.md");
const DRAFT =
  "---\nkind: [[ticket]]\nstate: draft\n---\n\n# Ask\n\n<!-- gain, as text -->\n<!-- breaks, as text -->\n\n# design\n\n## approach\n";

const CLASS = {
  id: "k1",
  category: "tools",
  class: "a commit lands by hand",
  defect: "the voice rules refuse the message one round at a time",
  fix: "one land verb lints the message, commits, checks and pushes",
  measure: { source: "log", pattern: "PastTense" },
  tickets: [],
  status: "open",
  ticket: {
    name: "the-land-verb-lands",
    gain: "a commit lands in one call",
    breaks: "every commit costs a round of refusals",
    done_when: ["./RUNME.sh land answers 0 over a clean tree"],
  },
};

const FIXED = {
  ...CLASS,
  id: "k2",
  status: "fixed: src/engine/retro/mint.js holds it",
  ticket: undefined,
};

function doors(classes, promotions = []) {
  const disk = fakeDisk({
    [at("classes.json")]: JSON.stringify({ classes, dispositions: {}, promotions }),
  });
  const proc = fakeProc({
    [`${CLI} mint ticket spec/tickets/the-land-verb-lands.md --process=standard`]:
      () => {
        disk.write(TICKET, DRAFT);
        return { exitCode: 0 };
      },
    [`${CLI} ticket open the-land-verb-lands`]: { exitCode: 0 },
    [`${CLI} mint ticket spec/tickets/a-second-ticket.md --process=standard`]: {
      exitCode: 2,
      stderr: "the ask names a word outside the vocabulary",
    },
  });
  return { disk, proc, join, root: ROOT, method: METHOD, node: NODE };
}

function heard(run) {
  const said = [];
  const log = console.log;
  const error = console.error;
  console.log = (...one) => said.push(one.join(" "));
  console.error = (...one) => said.push(one.join(" "));
  try {
    return { code: run(), said: said.join("\n") };
  } finally {
    console.log = log;
    console.error = error;
  }
}

test("a class with no status mints nothing, and the verb names it", () => {
  const { code, said } = heard(() =>
    retro(ROOT, ["mint", RETRO], doors([{ ...CLASS, status: "" }])),
  );
  assert.equal(code, 1);
  assert.match(said, /k1 carries no status of open, fixed: or past: with its reason/);
});

test("an open class mints one ticket with its ask, and a fixed class mints none", () => {
  const it = doors([CLASS, FIXED]);
  const { code, said } = heard(() => retro(ROOT, ["mint", RETRO], it));

  assert.equal(code, 0, said);
  assert.match(said, /k1 {2}spec\/tickets\/the-land-verb-lands\.md/);
  assert.match(said, /1 ticket\(s\) mint, and 1 class\(es\) stand closed already/);
  const ticket = it.disk.read(TICKET);
  assert.match(ticket, /# Ask\n\na commit lands in one call/);
  assert.match(ticket, /- \.\/RUNME\.sh land answers 0 over a clean tree/);
  assert.deepEqual(JSON.parse(it.disk.read(at("classes.json"))).classes[0].tickets, [
    "the-land-verb-lands",
  ]);
  assert.ok(
    it.proc.ran.every(
      (one) => one.init.env.SE_WORK_ROOT === ROOT && one.init.cwd === ROOT,
    ),
    "the child works on the work root",
  );
});

// [[spec/guidance/retro/check]]
test("a ticket that mints keeps its name where a later one refuses", () => {
  const second = {
    ...CLASS,
    id: "k3",
    ticket: { ...CLASS.ticket, name: "a-second-ticket" },
  };
  const it = doors([CLASS, second]);

  const { code } = heard(() => retro(ROOT, ["mint", RETRO], it));

  assert.equal(code, 1, "the second ticket meets no fake, so the verb refuses");
  assert.deepEqual(JSON.parse(it.disk.read(at("classes.json"))).classes[0].tickets, [
    "the-land-verb-lands",
  ]);
});

test("a second run mints nothing twice", () => {
  const it = doors([CLASS]);
  heard(() => retro(ROOT, ["mint", RETRO], it));
  const again = heard(() => retro(ROOT, ["mint", RETRO], it));
  assert.match(again.said, /0 ticket\(s\) mint/);
});

test("the ask reads as the chapter, and lands where the mint leaves it empty", () => {
  const ask = askOf(CLASS.ticket);
  assert.match(
    ask,
    /^a commit lands in one call\n\nevery commit costs a round of refusals\n\n- \.\/RUNME/,
  );
  const said = withAsk(DRAFT, ask);
  assert.ok(said.indexOf("a commit lands in one call") < said.indexOf("# design"));
  assert.doesNotMatch(said, /gain, as text/);
});

// [[spec/tickets/a-promotion-names-its-fault]]
test("a promotion carrying no ticket mints nothing, and the verb names it by its what or its place", () => {
  const promotions = [
    { what: "the land rule", from: "memory", to: "spec/guidance/working" },
    { what: "", from: "memory", to: "spec/guidance/voice" },
    { what: "a rule minted already", from: "memory", to: "spec/guidance/retro", tickets: ["the-land-verb-lands"] },
  ];
  const { code, said } = heard(() =>
    retro(ROOT, ["mint", RETRO], doors([FIXED], promotions)),
  );
  assert.equal(code, 1);
  assert.match(said, /promotion "the land rule" waits, and its ticket carries no name/);
  assert.match(said, /promotion 2 waits, and its ticket carries no done_when/);
  assert.doesNotMatch(said, /a rule minted already/);
  assert.doesNotMatch(said, /undefined/);
});

test("a promotion's name reads its what, and its place where the what stands empty", () => {
  assert.equal(promotionName({ what: " the land rule " }, 0), 'promotion "the land rule"');
  assert.equal(promotionName({}, 2), "promotion 3");
});

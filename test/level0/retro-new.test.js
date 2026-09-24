// The retro's mint, driven through fake doors. One command writes the ticket
// off the retro route, opens it, and hands out its first leaf.
// [[spec/design_input/the-agent-pulls-tickets]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { retro } from "../../src/scripts/retro.js";
import { SCHEMA } from "./pull-schema.js";
import { semicolonVale } from "./semicolon-vale.js";

const ROOT = "/tree";
const TIP = "a1b2c3d4e5f6a7b8";
const at = (path) => join(ROOT, ...path.split("/"));

const ROUTE = `for: a window of the record, and the changes to the machinery it earns
ask:
  - name: why
    form: text
    says: what calls for it
steps:
  - name: collect
    does: copies this box into the retro folder
    by: anyone
    needs: [retro]
    evidence:
      - name: run
        form: command
        expects: 0
        says: retro collect
`;

function doors(files = {}, more = {}) {
  const said = fakeGit(
    {
      "git rev-parse HEAD": { stdout: `${TIP}\n` },
      "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" },
      "git status --porcelain": { stdout: "" },
    },
    ROOT,
  );
  const disk = fakeDisk({
    [at("spec/schemas/ticket.schema.yaml")]: SCHEMA,
    [at("spec/processes/retro.yaml")]: ROUTE,
    [at(".se/box.json")]: JSON.stringify({ id: "d462e994b4cef" }),
    ...files,
  });
  return {
    proc: said.proc,
    disk,
    git: said,
    join,
    clock: fakeClock(),
    node: "node",
    words: 5,
    ...more,
  };
}

function heard(run) {
  const rows = [];
  const wasLog = console.log;
  const wasError = console.error;
  console.log = (...said) => rows.push(said.join(" "));
  console.error = (...said) => rows.push(said.join(" "));
  try {
    return { code: run(), said: rows.join("\n") };
  } finally {
    console.log = wasLog;
    console.error = wasError;
  }
}

// [[spec/design_input/the-agent-pulls-tickets]]
test("retro new writes the ticket off the retro route, and names it for the tip", () => {
  const it = doors();

  const { code } = heard(() => retro(ROOT, ["new"], it));

  assert.equal(code, 0);
  const named = at(`spec/tickets/retro-${TIP.slice(0, 7)}.md`);
  assert.equal(
    it.disk.exists(named),
    true,
    "the name reads off the commit it stands on",
  );
  assert.match(it.disk.read(named), /process: \[\[spec\/processes\/retro\]\]/);
});

// [[spec/design_input/the-agent-pulls-tickets]]
test("retro new opens the ticket, so a hand pulls it without a second command", () => {
  const it = doors();

  heard(() => retro(ROOT, ["new"], it));

  const said = it.disk.read(at(`spec/tickets/retro-${TIP.slice(0, 7)}.md`));
  assert.match(said, /^state: open$/m, "the mint opens it");
  assert.match(said, /^step: collect$/m, "it stands at the route's first leaf");
  assert.doesNotMatch(
    said,
    /^urgent:/m,
    "a retro waits its turn, so the mint sets no mark",
  );
});

// The owner says why, and the ask carries those words. [[spec/design_input/the-agent-pulls-tickets]]
test("retro new writes the reason into the ask, and takes a name a hand gives", () => {
  const it = doors();

  heard(() =>
    retro(ROOT, ["new", "--why", "the owner asks for it", "--name", "retro-one"], it),
  );

  const named = at("spec/tickets/retro-one.md");
  assert.equal(it.disk.exists(named), true, "a hand names its own");
  assert.match(it.disk.read(named), /the owner asks for it/);
});

// [[spec/design_input/the-agent-pulls-tickets]]
test("retro new refuses a name a ticket holds already, and writes nothing over it", () => {
  const it = doors({
    [at("spec/tickets/retro-one.md")]: "---\nkind: [[ticket]]\n---\n",
  });

  const { code, said } = heard(() => retro(ROOT, ["new", "--name", "retro-one"], it));

  assert.equal(code, 1);
  assert.match(said, /stands already/);
  assert.equal(
    it.disk.read(at("spec/tickets/retro-one.md")),
    "---\nkind: [[ticket]]\n---\n",
  );
});

// The verb mints the retro for this session, so the queue lets its own pull through. [[spec/design_output/config#the-engine-controls]]
test("retro new takes its retro under queue", () => {
  const it = doors({}, { binding: "queue" });

  const { code, said } = heard(() => retro(ROOT, ["new", "--name", "retro-one"], it));

  assert.doesNotMatch(said, /behind the queue/);
  assert.equal(code, 0, said);
  assert.match(
    said,
    /retro-one at collect/,
    "the pull hands out the retro's first leaf",
  );
});

// The --why line lands in the Ask, so the mint reads it through the lint's road before it writes. [[spec/design_output/pull#the-voice-reads-the-evidence]]
test("retro new refuses a --why line the lint warns on, names Characters, and writes no ticket", () => {
  const VALE = "/tree/.se/.runtime/bin/vale";
  const it = doors({}, { vale: VALE });
  it.proc.teach([VALE], semicolonVale());

  const { code, said } = heard(() =>
    retro(ROOT, ["new", "--why", "one; two", "--name", "retro-one"], it),
  );

  assert.equal(code, 1, said);
  assert.match(said, /breaks Characters/);
  assert.equal(
    it.disk.exists(at("spec/tickets/retro-one.md")),
    false,
    "no ticket stands",
  );
});

// Every call that writes names the ticket it serves: a patch and a replace in
// their ticket field, a commit at the head of its message. Edit, Write and
// NotebookEdit carry no such field, so the door refuses them.
// [[spec/design_output/level0#a-write-names-its-ticket]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import {
  PATCH,
  patchSpec,
  REPLACE,
  replaceSpec,
} from "../../.claude/skills/level0/lib/apply.js";
import { findings } from "../../.claude/skills/level0/lib/bash.js";
import { MINT_TOOL, schemasFrom } from "../../.claude/skills/level0/lib/schema.js";
import { UNDO } from "../../.claude/skills/level0/lib/undo.js";
import { SPECS } from "../../src/bridge/apply.js";
import { boxOf, decide } from "../../src/bridge/server.js";
import { onToolWrite } from "../../src/bridge/write.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { ticketFault, ticketOf } from "../../src/engine/named.js";
import { commitVerb } from "../../src/scripts/commit-verb.js";

const ROOT = "/tree";
const ticket = (state) =>
  `---\nkind: [[ticket]]\nstate: ${state}\n---\n\n# Ask\n\nA thing.\n`;
const TICKETS = {
  "/tree/spec/tickets/open-one.md": ticket("open"),
  "/tree/spec/tickets/done-one.md": ticket("closed"),
  "/tree/.se/tickets/private-one.md": ticket("open"),
};

const NOTE_SCHEMA = `kind: note

frontmatter:
  additionalProperties: false
  required:
    - kind
  properties:
    kind:
      const: note
      x-link: true

body:
  headingLevel: 1
  extraSections: false
  sections:
    - header: Scope
      required: true
      description: what this note covers
`;

function routed(seed = {}) {
  const disk = fakeDisk({ "/tree/one.md": "alpha beta\n", ...TICKETS, ...seed });
  const box = boxOf(ROOT, ROOT, {
    disk,
    clock: fakeClock(),
    log: fakeLog(),
    proc: { run: () => ({ exitCode: 1, stdout: "", stderr: "" }) },
    index: {
      dead: () => "",
      fault: () => "",
      warm: () => ({ warmed: false }),
      ask: () => ({ files: [{ path: "one.md" }] }),
    },
    vale: { stands: () => false },
    biome: { stands: () => false },
  });
  box.schemas = schemasFrom([{ name: "note.schema.yaml", text: NOTE_SCHEMA }]);
  return box;
}

const called = (box, e) => decide({ event: "tool.call", e }, box);
const patch = (more = {}) => ({
  tool: `mcp__level0__${PATCH}`,
  ops: [{ file: "one.md", old: "beta", new: "delta" }],
  ...more,
});
const answered = (said) => String(said?.result?.result ?? "");
const refused = (said) => String(said?.result?.deny ?? "");

test("a patch naming no ticket writes nothing, and says to name one in the ticket field", async () => {
  const box = routed();
  const said = answered(await called(box, patch()));
  assert.match(said, /names no ticket/);
  assert.match(said, /ticket field/);
  assert.equal(box.disk.read("/tree/one.md"), "alpha beta\n");
});

test("a patch naming a ticket nobody holds writes nothing, and names the ticket", async () => {
  const box = routed();
  const said = answered(await called(box, patch({ ticket: "no-such-one" })));
  assert.match(said, /no-such-one/);
  assert.match(said, /No ticket named no-such-one stands/);
  assert.equal(box.disk.read("/tree/one.md"), "alpha beta\n");
});

test("a patch naming a closed ticket writes nothing, and says it stands closed", async () => {
  const box = routed();
  const said = answered(await called(box, patch({ ticket: "done-one" })));
  assert.match(said, /done-one stands closed/);
  assert.equal(box.disk.read("/tree/one.md"), "alpha beta\n");
});

test("a patch naming an open ticket, public or private, writes", async () => {
  const box = routed();
  assert.match(answered(await called(box, patch({ ticket: "open-one" }))), /written/);
  assert.equal(box.disk.read("/tree/one.md"), "alpha delta\n");
  const again = patch({
    ticket: "private-one",
    ops: [{ file: "one.md", old: "delta", new: "gamma" }],
  });
  assert.match(answered(await called(box, again)), /written/);
  assert.equal(box.disk.read("/tree/one.md"), "alpha gamma\n");
});

test("a replace naming no ticket writes nothing, and one naming an open ticket writes", async () => {
  const box = routed();
  const sweep = {
    tool: `mcp__level0__${REPLACE}`,
    pattern: "beta",
    replacement: "zeta",
    glob: "*.md",
  };
  assert.match(answered(await called(box, sweep)), /names no ticket/);
  assert.equal(box.disk.read("/tree/one.md"), "alpha beta\n");
  assert.match(
    answered(await called(box, { ...sweep, ticket: "open-one" })),
    /written/,
  );
  assert.equal(box.disk.read("/tree/one.md"), "alpha zeta\n");
});

test("the patch and replace specs require the ticket field", () => {
  for (const spec of [patchSpec(), replaceSpec()]) {
    assert.ok(spec.inputSchema.required.includes("ticket"), spec.name);
    assert.equal(spec.inputSchema.properties.ticket.type, "string", spec.name);
  }
  assert.ok(
    SPECS().every(
      (one) => one.name === UNDO || one.inputSchema.required.includes("ticket"),
    ),
  );
});

test("an undo names no ticket, and puts the patch back", async () => {
  const box = routed();
  await called(box, patch({ ticket: "open-one" }));
  assert.match(
    answered(await called(box, { tool: `mcp__level0__${UNDO}` })),
    /come back/,
  );
  assert.equal(box.disk.read("/tree/one.md"), "alpha beta\n");
});

test("Edit, Write, MultiEdit and NotebookEdit refuse a path in the tree, and name the patch tool and its ticket field", async () => {
  const at = join(ROOT, "one.md");
  const calls = [
    { tool: "Edit", file_path: at, old_string: "beta", new_string: "delta" },
    { tool: "Write", file_path: at, content: "fresh\n" },
    {
      tool: "MultiEdit",
      file_path: at,
      edits: [{ old_string: "beta", new_string: "delta" }],
    },
    { tool: "NotebookEdit", notebook_path: join(ROOT, "one.ipynb"), new_source: "x" },
  ];
  for (const e of calls) {
    const said = refused(await called(routed(), e));
    assert.match(said, new RegExp(`^${e.tool} carries no ticket field`), e.tool);
    assert.match(said, /mcp__level0__patch/, e.tool);
    assert.match(said, /ticket field/, e.tool);
  }
});

test("a Write of the handover passes with no ticket, through the tool and through a patch", async () => {
  const box = routed();
  const at = join(ROOT, ".se", "HANDOVER.md");
  assert.equal(
    refused(
      await called(box, {
        tool: "Write",
        file_path: at,
        content: "# Where it stands\n",
      }),
    ),
    "",
  );
  assert.deepEqual(
    await onToolWrite(
      { tool: "Write", file_path: at, content: "# Where it stands\n" },
      box,
    ),
    { pass: true },
  );
  const said = answered(
    await called(box, {
      tool: `mcp__level0__${PATCH}`,
      ops: [{ file: ".se/HANDOVER.md", op: "create", new: "# Where\n" }],
    }),
  );
  assert.match(said, /written/);
  assert.equal(box.disk.read("/tree/.se/HANDOVER.md"), "# Where\n");
});

test("a Write outside the tree passes, since the write door reads the tree alone", async () => {
  const box = routed();
  assert.deepEqual(
    await onToolWrite(
      { tool: "Write", file_path: "/elsewhere/a.md", content: "x" },
      box,
    ),
    { pass: true },
  );
});

test("a mint names no ticket, and writes its note", async () => {
  const box = routed();
  const said = answered(
    await called(box, {
      tool: `mcp__level0__${MINT_TOOL}`,
      kind: "note",
      path: "spec/notes/fresh.md",
    }),
  );
  assert.match(said, /stands, in the shape note names/);
  assert.equal(box.disk.exists("/tree/spec/notes/fresh.md"), true);
});

test("the ticket note and ticket mint verbs pass the shell door with no ticket named", async () => {
  for (const command of [
    './RUNME.sh ticket note a-thought "a line to keep"',
    "./RUNME.sh mint ticket spec/tickets/fresh.md --process=standard",
  ]) {
    assert.equal(
      refused(await called(routed(), { tool: "Bash", command })),
      "",
      command,
    );
  }
});

test("the shell door's refusal names the patch tool and its ticket field, and no road the door refuses", () => {
  const said = findings("cat > spec/guidance/x.md").find(
    (one) => one.rule === "ShellWritesNothing",
  ).message;
  assert.match(said, /mcp__level0__patch/);
  assert.match(said, /ticket field/);
  assert.doesNotMatch(said, /\b(Edit|Write)\b/);
});

test("ticketOf reads the name before the first colon, and nothing where the message opens otherwise", () => {
  assert.equal(ticketOf("open-one: the change lands"), "open-one");
  assert.equal(ticketOf("the change lands"), "");
  assert.equal(ticketOf("the change: lands"), "");
});

test("ticketFault answers nothing for an open ticket, and the fault and the how for the rest", () => {
  const where = { disk: fakeDisk(TICKETS), root: ROOT };
  assert.equal(ticketFault("open-one", where, "HOW"), "");
  assert.equal(ticketFault("private-one", where, "HOW"), "");
  assert.match(ticketFault("", where, "HOW"), /names no ticket\. HOW$/);
  assert.match(
    ticketFault("gone", where, "HOW"),
    /No ticket named gone stands .* HOW$/,
  );
  assert.match(ticketFault("done-one", where, "HOW"), /done-one stands closed\. HOW$/);
});

function commitDoors() {
  const git = fakeGit(
    { "git rev-parse --abbrev-ref HEAD": { stdout: "main\n" } },
    ROOT,
  );
  const it = {
    root: ROOT,
    method: ROOT,
    join,
    node: "node",
    git,
    disk: fakeDisk(TICKETS),
    log: { say: () => {} },
    vale: { stands: () => true, lint: async () => ({ ran: true, found: [] }) },
    proc: git.proc,
    env: {},
  };
  for (const verb of ["test", "check"]) {
    git.proc.teach([it.node, join(ROOT, "src", "scripts", "cli.js"), verb], {
      exitCode: 0,
      stdout: "ok\n",
    });
  }
  return { it, git };
}

const heard = async (what) => {
  const lines = [];
  const was = [console.log, console.error];
  console.log = (...said) => lines.push(said.join(" "));
  console.error = console.log;
  try {
    return { code: await what(), said: lines.join("\n") };
  } finally {
    [console.log, console.error] = was;
  }
};

test("a commit message opening with no ticket, an unknown one or a closed one stages nothing", async () => {
  for (const [message, fault] of [
    ["the change lands", /names no ticket/],
    ["gone: the change lands", /No ticket named gone stands/],
    ["done-one: the change lands", /done-one stands closed/],
  ]) {
    const { it, git } = commitDoors();
    const { code, said } = await heard(() => commitVerb(it, [message]));
    assert.equal(code, 2, message);
    assert.match(said, fault, message);
    assert.match(said, /Open the message with <ticket>:/, message);
    assert.deepEqual(git.ran, [], message);
  }
});

test("a commit message opening with an open ticket lands", async () => {
  const { it, git } = commitDoors();
  const { code } = await heard(() => commitVerb(it, ["open-one: the change lands"]));
  assert.equal(code, 0);
  assert.ok(
    git.ran.some(
      (one) => one.argv.join(" ") === "git commit -m open-one: the change lands",
    ),
  );
});

// [[spec/design_output/level0#a-shell-names-its-ticket]]
test("a PowerShell call naming no open ticket refuses, and one naming an open ticket passes", async () => {
  const box = routed();
  const bare = await called(box, {
    tool: "PowerShell",
    command: "Get-ChildItem",
    description: "List the files",
  });
  assert.match(refused(bare), /Open the description with <ticket>:/);
  const named = await called(box, {
    tool: "PowerShell",
    command: "Get-ChildItem",
    description: "open-one: list the files",
  });
  assert.equal(refused(named), "");
});

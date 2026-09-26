// The doctor's read of the hooks: the reader takes every address the settings
// files name, and the probe says which one answers.
// [[spec/tickets/the-doctor-probes-every-hook]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import { hookRows, hooksNamed } from "../../src/scripts/cli-check.js";
import { lspProbe } from "../../src/scripts/lsp-probe.js";

const ROOT = "/tree";
const HOME = "/home/nobody";
const TREE = "/tree/.claude/settings.json";
const BOX = "/tree/.claude/settings.local.json";
const MINE = "/home/nobody/.claude/settings.json";

// A settings file naming one address, in the shape the client reads. [[spec/design_output/doors#a-fake-behaves]]
function settings(url) {
  return JSON.stringify({
    hooks: { PreToolUse: [{ matcher: "*", hooks: [{ type: "http", url }] }] },
  });
}

// A wire answering the addresses a case names, and standing dead for the rest. [[spec/design_output/doors#a-fake-behaves]]
function wire(answers = {}) {
  const asked = [];
  const get = async (where) => {
    asked.push(where);
    const said = answers[where];
    if (said === undefined) throw new Error("fetch failed");
    return { status: said, json: async () => ({ ok: true }) };
  };
  return { asked, get };
}

test("the reader takes an address out of each of the three settings files", () => {
  const disk = fakeDisk({
    [TREE]: settings("http://127.0.0.1:1/a"),
    [BOX]: settings("http://127.0.0.1:2/b"),
    [MINE]: settings("http://127.0.0.1:3/c"),
  });
  const found = hooksNamed(disk, ROOT, HOME);

  assert.deepEqual(
    found.map((one) => one.where),
    ["http://127.0.0.1:1/a", "http://127.0.0.1:2/b", "http://127.0.0.1:3/c"],
  );
  assert.deepEqual(
    found.map((one) => one.file),
    [".claude/settings.json", ".claude/settings.local.json", MINE],
  );
});

test("a settings file holding no hooks names no address", () => {
  const disk = fakeDisk({ [TREE]: JSON.stringify({ permissions: { allow: [] } }) });
  assert.deepEqual(hooksNamed(disk, ROOT, HOME), []);
});

test("a settings file standing nowhere names no address", () => {
  assert.deepEqual(hooksNamed(fakeDisk({}), ROOT, HOME), []);
});

test("a settings file holding torn json names no address", () => {
  const disk = fakeDisk({ [TREE]: "{" });
  assert.deepEqual(hooksNamed(disk, ROOT, HOME), []);
});

test("a command hook stands outside the addresses, because a command path parses", () => {
  const disk = fakeDisk({
    [TREE]: JSON.stringify({
      hooks: {
        PreToolUse: [
          { hooks: [{ type: "command", command: "C:\\hook.exe" }] },
          { hooks: [{ type: "command", command: "/usr/bin/hook" }] },
          { hooks: [{ type: "http", url: "http://127.0.0.1:1/a" }] },
        ],
      },
    }),
  });

  assert.deepEqual(
    hooksNamed(disk, ROOT, HOME).map((one) => one.where),
    ["http://127.0.0.1:1/a"],
  );
});

test("two files naming one address name it once, off the file reading first", () => {
  const disk = fakeDisk({
    [TREE]: settings("http://127.0.0.1:1/a"),
    [BOX]: settings("http://127.0.0.1:1/a"),
  });
  const found = hooksNamed(disk, ROOT, HOME);

  assert.equal(found.length, 1);
  assert.equal(found[0].file, ".claude/settings.json");
});

test("a hook answering stands, and its row names the address and the file", async () => {
  const where = "http://127.0.0.1:36368/hook";
  const { get } = wire({ [where]: 200 });
  const rows = await hookRows([{ where, file: ".claude/settings.local.json" }], get);

  assert.equal(rows.length, 1);
  assert.match(
    rows[0][0],
    /^hook 127\.0\.0\.1:36368$/,
    "the label names host and port",
  );
  assert.match(rows[0][1], /^stands at/);
  assert.match(rows[0][1], /36368/);
  assert.match(rows[0][1], /settings\.local\.json/);
});

test("a hook answering nothing warns, and the row opens on the warn word", async () => {
  const where = "http://127.0.0.1:36368/hook";
  const { get } = wire();
  const rows = await hookRows([{ where, file: ".claude/settings.local.json" }], get);

  assert.equal(rows.length, 1);
  assert.match(rows[0][1], /^warn/, "the doctor writes a printed row opening on warn");
  assert.match(rows[0][1], /answers nothing/);
  assert.match(rows[0][1], /settings\.local\.json/, "and names the file to edit");
});

test("a hook answering a failing status stands, because a status proves it listens", async () => {
  const where = "http://127.0.0.1:36368/hook";
  const { get } = wire({ [where]: 500 });
  const rows = await hookRows([{ where, file: ".claude/settings.json" }], get);

  assert.match(rows[0][1], /^stands at/);
});

test("the probe asks every address together, so a box of dead hooks answers fast", async () => {
  const asked = [];
  let free;
  const held = new Promise((take) => {
    free = take;
  });
  const get = async (where) => {
    asked.push(where);
    if (asked.length === 1) await held;
    throw new Error("fetch failed");
  };

  const found = [
    { where: "http://127.0.0.1:1/a", file: "a" },
    { where: "http://127.0.0.1:2/b", file: "b" },
  ];
  const rows = hookRows(found, get);
  await Promise.resolve();
  await Promise.resolve();

  assert.equal(asked.length, 2, "the second call stands out while the first waits");
  free();
  assert.equal((await rows).length, 2, "and both rows come back");
});

test("the rows come back in the order the reader names them", async () => {
  const { get } = wire({ "http://127.0.0.1:2/b": 200 });
  const rows = await hookRows(
    [
      { where: "http://127.0.0.1:1/a", file: "a" },
      { where: "http://127.0.0.1:2/b", file: "b" },
    ],
    get,
  );

  assert.deepEqual(
    rows.map((one) => one[0]),
    ["hook 127.0.0.1:1", "hook 127.0.0.1:2"],
  );
  assert.match(rows[0][1], /^warn/);
  assert.match(rows[1][1], /^stands at/);
});

test("a box naming no hook reads no row", async () => {
  assert.deepEqual(await hookRows([], wire().get), []);
});

const LSP = "/tree/.se/.runtime/bin/se-lsp";

// The frames a language server reads off its input, in the order the probe writes them. [[spec/tickets/every-server-stands-and-answers]]
function framesIn(input) {
  const out = [];
  let rest = String(input ?? "");
  for (;;) {
    const head = /^Content-Length: (\d+)\r\n\r\n/.exec(rest);
    if (!head) return out;
    const length = Number(head[1]);
    out.push(JSON.parse(rest.slice(head[0].length, head[0].length + length)));
    rest = rest.slice(head[0].length + length);
  }
}

const framed = (said) => {
  const body = JSON.stringify({ jsonrpc: "2.0", ...said });
  return `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`;
};

// A server answering each frame the way se-lsp does: the initialize and the shutdown by id, and a note it opens with its diagnostics. [[spec/tickets/every-server-stands-and-answers]]
function answering(codes) {
  const answer = (one) => {
    if (one.method === "initialize" || one.method === "shutdown")
      return framed({ id: one.id, result: {} });
    if (one.method !== "textDocument/didOpen") return "";
    const diagnostics = codes.map((code) => ({ code, message: `${code} fires` }));
    return framed({
      method: "textDocument/publishDiagnostics",
      params: { uri: one.params.textDocument.uri, diagnostics },
    });
  };
  return fakeProc({
    [`${LSP} lsp`]: (_argv, init) => ({
      exitCode: 0,
      stdout: framesIn(init.stdin).map(answer).join(""),
    }),
  });
}

// [[spec/tickets/every-server-stands-and-answers]]
test("a language server that answers draws a row naming each diagnostic it sends", () => {
  const proc = answering(["Schema.Kind", "Voice.Tense"]);
  const row = lspProbe(proc, LSP, ROOT);

  assert.match(row, /^answers, and draws Schema\.Kind, Voice\.Tense on the probe note/);
  const frames = framesIn(proc.ran[0].init.stdin).map((one) => one.method);
  assert.deepEqual(frames, ["initialize", "textDocument/didOpen", "shutdown", "exit"]);
  assert.equal(proc.ran[0].init.cwd, ROOT, "the server reads the tree it stands in");
});

// [[spec/tickets/every-server-stands-and-answers]]
test("a language server that exits draws a warn row naming the exit", () => {
  const proc = fakeProc({
    [`${LSP} lsp`]: { exitCode: 2, stderr: "panic: the checker reads no tree\ngoroutine 1\n" },
  });
  const row = lspProbe(proc, LSP, ROOT);

  assert.match(row, /^warn: se-lsp lsp exits with 2 before it answers/);
  assert.match(row, /panic: the checker reads no tree/);
});

test("a language server standing nowhere draws the install's line", () => {
  assert.equal(lspProbe(fakeProc({}), "", ROOT), "missing, run ./RUNME.sh");
});

// The findings every front reads, driven through fake doors. The check and the
// problems panel read this one list, so a rule reaches both or neither.
// [[spec/design_output/lsp]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { FROM, findingsOver, heldFor, heldOver } from "../../src/bridge/findings.js";
import { boxOf } from "../../src/bridge/server.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ROOT = "/tree";
const LOOSE_NUMBER = "package main\n\nfunc one() int {\n\treturn 7\n}\n";

function doors(answers = {}) {
  return {
    disk: fakeDisk({
      [join(ROOT, "src/one/one.go")]: LOOSE_NUMBER,
      [join(ROOT, "notes.md")]: "# One\n",
    }),
    proc: fakeProc({ vale: { stdout: "{}" }, biome: { stdout: "{}" }, ...answers }),
    join,
    root: ROOT,
    method: ROOT,
    work: ROOT,
    vale: "vale",
    biome: "biome",
    ceilings: { function: 150, file: 600 },
  };
}

test("a rule written in JavaScript reaches the list, named by the front it comes from", async () => {
  const got = await findingsOver(doors(), ["."]);

  assert.equal(got.fault, "");
  const loose = got.found.find((one) => one.rule === "MagicNumber");
  assert.ok(loose, "the loose number stands in the list");
  assert.equal(loose.file, "src/one/one.go");
  assert.equal(loose.source, FROM.tree);
});

test("Vale reading nothing is the fault, and the list stays empty", async () => {
  const got = await findingsOver(
    doors({ vale: { exitCode: 2, stderr: "no config" } }),
    ["."],
  );

  assert.equal(got.fault, "no config");
  assert.deepEqual(got.found, []);
});

// [[spec/design_output/level0#a-crash-writes-its-error]]
test("a path the disk no longer holds reads as no finding, and throws nothing", async () => {
  const got = await findingsOver(doors(), ["HANDOVER.md"]);

  assert.equal(got.fault, "");
  assert.deepEqual(got.found, []);
});

// [[spec/design_output/lsp#the-panel-lints-as-typed]]
test("a held buffer reads through Vale at its own path and the code faults, off no disk", async () => {
  const asked = [];
  const lint = async (text, where) => {
    asked.push({ text, where });
    return {
      ran: true,
      found: [
        {
          file: "stdin.md",
          rule: "Sentence",
          line: 1,
          column: 1,
          message: "long",
          severity: "warning",
        },
      ],
    };
  };
  const got = await heldOver({ lint, ceilings: { function: 150, file: 600 } }, [
    { path: "notes.md", text: "# One\n" },
    { path: "src/one/one.go", text: LOOSE_NUMBER },
    { path: "spec/_draft.md", text: "# Parked\n" },
  ]);

  assert.equal(got.fault, "");
  assert.deepEqual(asked, [{ text: "# One\n", where: "notes.md" }]);
  const long = got.found.find((one) => one.rule === "Sentence");
  assert.equal(long.file, "notes.md");
  assert.equal(long.source, FROM.vale);
  const loose = got.found.find((one) => one.rule === "MagicNumber");
  assert.equal(loose.file, "src/one/one.go");
  assert.equal(loose.source, FROM.tree);
});

test("a held buffer Vale reads nothing of is the fault, and the list stays empty", async () => {
  const lint = async () => ({ ran: false, why: "no vale stands here", found: [] });
  const got = await heldOver({ lint, ceilings: {} }, [{ path: "notes.md", text: "" }]);

  assert.equal(got.fault, "no vale stands here");
  assert.deepEqual(got.found, []);
});

// The route hands the box to heldFor, so the box a root builds carries the Vale door the route reads. [[spec/design_output/lsp#the-panel-lints-as-typed]]
test("POST /findings reads the held buffers through the Vale door of the box the server builds", async () => {
  const asked = [];
  const box = boxOf(ROOT, ROOT, {
    disk: fakeDisk(),
    clock: fakeClock(),
    proc: fakeProc(),
    vale: {
      stands: () => true,
      lint: async (text, where) => {
        asked.push({ text, where });
        return { ran: true, found: [] };
      },
    },
  });

  const said = await heldFor(
    box,
    JSON.stringify({ held: [{ path: "notes.md", text: "# One\n" }] }),
  );

  assert.deepEqual(said, { ok: true, found: [], fault: "" });
  assert.deepEqual(asked, [{ text: "# One\n", where: "notes.md" }]);
  assert.equal((await heldFor(box, "not json")).ok, true);
});

// The lint and the pull open Vale on one argument list, and read one file's text one way. [[spec/design_output/pull#the-voice-reads-the-evidence]]
test("valeArgvOf opens Vale on the assembled config, and readsText names a marker carrying no reason", async () => {
  const { valeArgvOf, readsText } = await import("../../src/bridge/findings.js");
  const it = {
    vale: "vale",
    disk: fakeDisk({}),
    root: ROOT,
    method: ROOT,
    work: ROOT,
    join,
  };
  const argv = valeArgvOf(it);
  assert.equal(argv[0], "vale");
  assert.ok(
    argv.some((one) => one.startsWith("--config=")),
    "the config the assembly writes",
  );
  assert.ok(argv.includes("--output=JSON") && argv.includes("--no-exit"));
  const text = "# One\n\n<!-- vale VoiceParagraph.Characters = NO -->\n\nA line.\n";
  const found = readsText(it, "notes/one.md", text, []);
  assert.ok(
    found.some((one) => /Exemption/.test(String(one.rule))),
    "the marker with no reason stands named",
  );
});

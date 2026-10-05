// Every verb program loads over the real doors and hands its words to a run,
// and the lens names their folder. A verb running in Go carries no program.
// [[spec/tickets/cli-js-leaves]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { disk } from "../../src/doors/disk.js";
import { PROGRAMS } from "../../src/extension/lib/lens.js";
import { VERBS } from "../../src/scripts/verb-run.js";
import { commands, goVerbs } from "./commands.js";

const ROOT = join(import.meta.dirname, "..", "..");

// A verb answers as a program where its file stands, and registers in Go where none does, so a port edits no line here. [[spec/tickets/box-verbs-port-to-go]]
test("every verb of the table loads as a program answering a run, or registers in Go", async () => {
  const go = goVerbs();
  const listed = new Set(commands().keys());
  const files = disk();
  for (const { name: one } of files.list(join(ROOT, ...VERBS))) {
    assert.ok(
      listed.has(one.replace(/\.js$/, "")),
      `${one} answers no verb of the table`,
    );
  }
  for (const verb of listed) {
    const program = join(ROOT, ...VERBS, `${verb}.js`);
    if (files.exists(program)) {
      const { run } = await import(pathToFileURL(program).href);
      assert.equal(typeof run, "function", `${verb} runs`);
    } else {
      assert.ok(go.has(verb), `${verb} stands as no program and registers no Go verb`);
    }
  }
});

test("the lens names the folder the runner owns", () => {
  assert.equal(PROGRAMS, VERBS.join("/"));
});

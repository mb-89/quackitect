// se_file_patch strict op fields — a mistyped find/replace refuses BY
// NAME instead of reading as "0 occurrences" (the e10 lesson).
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { call, freshRoot, readHashesFor } from "./helpers.ts";

test("se_file_patch refuses unknown op fields by name, mapping the common aliases", async () => {
  const root = freshRoot();
  const server = buildServer(root, new Session(root));
  const hashes = readHashesFor(root);
  for (let i = 0; i < 8; i++) {
    const step = await call(server, "se_tick", { advance: true, read_hashes: hashes });
    if (step.body.booted === true) break;
  }
  const r = await call(server, "se_file_patch", { ops: [{ path: "workspace/AGENTS.md", find: "x", replace: "y" }] });
  assert.equal(r.isError, true);
  assert.match(String(r.body.got), /find \(use old_string\)/);
  assert.match(String(r.body.got), /replace \(use new_string\)/);
});

// se_file_patch strict op fields — a mistyped find/replace refuses BY
// NAME instead of reading as "0 occurrences" (the e10 lesson).
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { bootedServer, call, freshRoot, readHashesFor } from "./helpers.ts";

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

// A NEAR MISS GETS NAMED. This refusal fired twelve times in one period and
// its commonest cause is invisible on screen, so "copy the exact text" was
// advice the caller had no way to act on.
test("a patch that misses only on line endings says so", async () => {
  const root = freshRoot();
  writeFileSync(join(root, "crlf.md"), "alpha\r\nbeta\r\ngamma\r\n");
  const server = await bootedServer(root);
  const r = await call(server, "se_file_patch", { ops: [{ path: "crlf.md", old_string: "alpha\nbeta", new_string: "x" }] });
  assert.equal(r.isError, true);
  assert.match(String(r.body.got), /line endings normalised/, "the caller learns the file is CRLF and their text is LF");
});

test("a patch that misses only on indentation says that instead", async () => {
  const root = freshRoot();
  writeFileSync(join(root, "space.md"), "key:      value\n");
  const server = await bootedServer(root);
  const r = await call(server, "se_file_patch", { ops: [{ path: "space.md", old_string: "key: value", new_string: "x" }] });
  assert.equal(r.isError, true);
  assert.match(String(r.body.got), /spaces and tabs collapsed/);
});

test("a genuine absence refuses plainly, with no invented diagnosis", async () => {
  const root = freshRoot();
  writeFileSync(join(root, "plain.md"), "alpha\n");
  const server = await bootedServer(root);
  const r = await call(server, "se_file_patch", { ops: [{ path: "plain.md", old_string: "nowhere at all", new_string: "x" }] });
  assert.equal(r.isError, true);
  assert.doesNotMatch(String(r.body.got), /but it MATCHES/, "a near miss is reported only when there is one");
});

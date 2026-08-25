// se_file_patch strict op fields — a mistyped find/replace refuses BY
// NAME instead of reading as "0 occurrences" (the e10 lesson).
import { strict as assert } from "node:assert";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { bootedServer, call, freshRoot, pullBoot } from "./helpers.ts";

test("se_file_patch refuses unknown op fields by name, mapping the common aliases", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  await pullBoot(server, session);
  const r = await call(server, "se_file_patch", { ops: [{ path: "AGENTS.md", find: "x", replace: "y" }] });
  assert.equal(r.isError, true);
  assert.match(String(r.body.got), /find \(use old_string\)/);
  assert.match(String(r.body.got), /replace \(use new_string\)/);
});

// A NEAR MISS USED TO BE NAMED AND THEN REFUSED ANYWAY. It fired twelve times
// in one period over a difference nobody can see on screen, and the remedy was
// "copy the exact text" — advice the caller had no way to act on.
//
// It is now CORRECTED AND ANNOUNCED: the patch lands
// in the file's own endings and the result says what was changed for you. A
// refusal over an invisible difference spends a round to teach nothing.
test("a patch that misses only on line endings is APPLIED, and says what it corrected", async () => {
  const root = freshRoot();
  writeFileSync(join(root, "crlf.md"), "alpha\r\nbeta\r\ngamma\r\n");
  const server = await bootedServer(root);
  const r = await call(server, "se_file_patch", { ops: [{ path: "crlf.md", old_string: "alpha\nbeta", new_string: "x" }] });
  assert.equal(r.isError, false, JSON.stringify(r.body));
  assert.match(String((r.body.corrected as string[]).join(" ")), /line-ending normalisation/, "a silent correction teaches nothing either");
  assert.equal(readFileSync(join(root, "crlf.md"), "utf8"), "x\r\ngamma\r\n", "and it landed in the file's own endings");
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

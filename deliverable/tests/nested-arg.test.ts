// A KEY IN THE WRONG PLACE IS TOLD WHERE IT BELONGS.
//
// MEASURED ON THE i15 WALK: se_file_patch was called with a top-level `path`.
// That is exactly right for se_file_read and se_file_write, and wrong here —
// the path rides each op. The refusal said "unknown argument: path" and listed
// the two keys the tool does take, which names the mistake without naming the
// fix, so the next call is still a guess.
//
// THE ENGINE ALREADY HELD THE ANSWER. Each op's own schema declares `path`, so
// where the key belongs is a lookup rather than a judgment — the same shape as
// every other cheap half this walk turned up.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { anyGuidanceDoc, bootedServer, call, freshRoot, gitInit } from "./helpers.ts";

async function server() {
  const root = freshRoot();
  gitInit(root);
  spawnSync("git", ["add", "-A"], { cwd: root, encoding: "utf8" });
  spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "f"], { cwd: root, encoding: "utf8" });
  return bootedServer(root);
}

test("a key that belongs inside an op is told so, and told the shape to send", async () => {
  const r = await call(await server(), "se_file_patch", {
    path: anyGuidanceDoc(),
    ops: [{ old_string: "a", new_string: "b" }],
  });
  const body = r.body as { kind?: string; remedy?: { note?: string } };
  assert.equal(body.kind, "rejected", `a top-level path is still accepted: ${JSON.stringify(body).slice(0, 300)}`);
  const note = String(body.remedy?.note ?? "");
  assert.match(note, /belongs INSIDE each ops/, `the refusal does not say where the key belongs: "${note}"`);
  assert.match(note, /ops: \[\{ path/, `the refusal does not show the shape to send instead: "${note}"`);
});

test("a key that belongs nowhere still refuses, and does not claim a home it has not got", async () => {
  const r = await call(await server(), "se_file_patch", {
    unheard_of_key: 1,
    ops: [{ path: anyGuidanceDoc(), old_string: "a", new_string: "b" }],
  });
  const body = r.body as { kind?: string; remedy?: { note?: string } };
  assert.equal(body.kind, "rejected", "an unknown key is accepted");
  assert.doesNotMatch(String(body.remedy?.note ?? ""), /belongs INSIDE/, "a key with no nested home is given one anyway");
});

// The git lane (v2 port): allowlisted git with its laws as refusals —
// no push (SE-C-003), no rebase (SE-C-002), allowlist only (SE-C-004),
// restore unstages only.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { bootedServer, call, freshRoot } from "./helpers.ts";

function gitInit(root: string): void {
  const g = (...a: string[]): void => {
    const r = spawnSync("git", a, { cwd: root, encoding: "utf8", windowsHide: true });
    if (r.status !== 0) throw new Error(`git ${a.join(" ")} failed: ${r.stderr}`);
  };
  g("init");
  g("config", "user.email", "se@test.local");
  g("config", "user.name", "se test");
}

test("se_git: the status/add/commit flow works through the lane", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);
  writeFileSync(join(root, "x.md"), "hi\n");
  const st = await call(server, "se_git", { args: ["status", "--porcelain"] });
  assert.equal(st.isError, false, JSON.stringify(st.body));
  assert.match(String(st.body.stdout), /x\.md/);
  const add = await call(server, "se_git", { args: ["add", "--", "x.md"] });
  assert.equal(add.body.ok, true, JSON.stringify(add.body));
  const ci = await call(server, "se_git", { args: ["commit", "-m", "lane commit"] });
  assert.equal(ci.body.ok, true, JSON.stringify(ci.body));
});

test("se_git laws: no push, no rebase, allowlist only, restore unstages only", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);
  const push = await call(server, "se_git", { args: ["push"] });
  assert.equal(push.isError, true);
  assert.equal(push.body.clause, "SE-C-003");
  const rebase = await call(server, "se_git", { args: ["rebase", "main"] });
  assert.equal(rebase.body.clause, "SE-C-002");
  const clean = await call(server, "se_git", { args: ["clean", "-fd"] });
  assert.equal(clean.body.clause, "SE-C-004");
  const restore = await call(server, "se_git", { args: ["restore", "x.md"] });
  assert.equal(restore.body.clause, "SE-C-004");
  writeFileSync(join(root, "y.md"), "stage me\n");
  await call(server, "se_git", { args: ["add", "--", "y.md"] });
  const unstage = await call(server, "se_git", { args: ["restore", "--staged", "y.md"] });
  assert.equal(unstage.isError, false, JSON.stringify(unstage.body));
});

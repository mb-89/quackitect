// The boot machine and the state gate — the session's first law: nothing
// before boot, everything logged after, nothing after exit.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { compileMachine } from "../engine/machines/compile.ts";
import { bootMachinePath } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { bootedServer, call, freshRoot } from "./helpers.ts";

const REPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

test("the shipped boot.canvas compiles: entry unbooted, legal lists as drawn", () => {
  const m = compileMachine(REPO_ROOT, bootMachinePath(REPO_ROOT));
  assert.equal(m.id, "boot");
  assert.equal(m.initial, "unbooted");
  const unbooted = m.states.find((s) => s.id === "unbooted")!;
  assert.deepEqual(unbooted.legal, ["se_boot"]);
  const idle = m.states.find((s) => s.id === "idle")!;
  assert.deepEqual(idle.legal, ["all"]);
  assert.equal(m.states.find((s) => s.id === "done")!.kind, "terminal");
  assert.ok(unbooted.guidance.length > 0, "boot guidance is served");
});

test("unbooted: every lane tool is refused with se_boot as the remedy", async () => {
  const server = buildServer(freshRoot());
  const r = await call(server, "se_file_list", { dir: "." });
  assert.equal(r.isError, true);
  assert.equal(r.body.clause, "SE-C-110");
  assert.equal((r.body.remedy as { tool: string }).tool, "se_boot");
});

test("se_state is always legal — even unbooted (observability is never gated)", async () => {
  const server = buildServer(freshRoot());
  const r = await call(server, "se_state");
  assert.equal(r.isError, false);
  assert.deepEqual(r.body.active, ["unbooted"]);
  assert.ok((r.body.legal as string[]).includes("se_boot"));
});

test("boot lands in idle, returns the banner, and cannot run twice", async () => {
  const server = buildServer(freshRoot());
  const boot = await call(server, "se_boot");
  assert.equal(boot.isError, false);
  assert.ok(String(boot.body.banner).includes("booted"));
  assert.ok(String(boot.body.display).includes("VERBATIM"));
  assert.deepEqual(boot.body.state, ["idle"]);
  const again = await call(server, "se_boot");
  assert.equal(again.isError, true);
  assert.equal(again.body.clause, "SE-C-110");
});

test("idle opens the whole lane; se_exit closes it; after done only se_state answers", async () => {
  const root = freshRoot();
  const server = await bootedServer(root);
  const w = await call(server, "se_file_write", { path: "x.md", content: "hi", base_hash: null });
  assert.equal(w.isError, false);
  const exit = await call(server, "se_exit");
  assert.equal(exit.isError, false);
  assert.ok(String(exit.body.banner).includes("closed"));
  const after = await call(server, "se_file_read", { path: "x.md" });
  assert.equal(after.isError, true);
  assert.equal(after.body.clause, "SE-C-110");
  assert.ok(String(after.body.got).includes("closed"));
  const state = await call(server, "se_state");
  assert.equal(state.isError, false);
  assert.equal(state.body.status, "closed");
});

test("the gate is logged like everything else — a refused pre-boot call lands in the log", async () => {
  const root = freshRoot();
  const server = buildServer(root);
  await call(server, "se_run", { command: "echo nope" });
  await call(server, "se_boot");
  const q = await call(server, "se_log_query", { filter: { ok: false } });
  const recs = q.body.records as { tool: string; outcome: string }[];
  assert.equal(recs.length, 1);
  assert.equal(recs[0].tool, "se_run");
  assert.equal(recs[0].outcome, "rejected");
});

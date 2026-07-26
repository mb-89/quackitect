// The main machine and the state gate — the session's first law: nothing
// before boot, the boot sub-machine one step at a time, everything logged,
// nothing after exit.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { compileMachine } from "../engine/machines/compile.ts";
import { mainMachinePath } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { bootedServer, call, freshRoot } from "./helpers.ts";

const REPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

test("the shipped main.canvas compiles: start entry, boot nested, pills drawn as terminals", () => {
  const m = compileMachine(REPO_ROOT, mainMachinePath(REPO_ROOT));
  assert.equal(m.id, "main");
  assert.equal(m.initial, "start");
  const start = m.states.find((s) => s.id === "start")!;
  assert.deepEqual(start.legal_tools, ["se_boot"]);
  assert.ok(start.guidance.length > 0, "guidance is a frontmatter field and served");
  const boot = m.states.find((s) => s.id === "boot")!;
  assert.ok(boot.submachine?.endsWith("boot.canvas"), "boot is a sub-machine state");
  assert.deepEqual(m.states.find((s) => s.id === "idle")!.legal_tools, ["all"]);
  assert.equal(m.states.find((s) => s.id === "done")!.kind, "terminal");
});

test("the boot sub-machine compiles: read_contract → prepare_idle → booted", () => {
  const m = compileMachine(REPO_ROOT, mainMachinePath(REPO_ROOT).replace("main.canvas", "boot.canvas"));
  assert.equal(m.initial, "read_contract");
  assert.equal(m.states.find((s) => s.id === "booted")!.kind, "terminal");
  assert.deepEqual(m.states.find((s) => s.id === "read_contract")!.legal_tools, ["se_boot"]);
});

test("at start every lane tool is refused with se_boot as the remedy", async () => {
  const server = buildServer(freshRoot());
  const r = await call(server, "se_file_list", { dir: "." });
  assert.equal(r.isError, true);
  assert.equal(r.body.clause, "SE-C-110");
  assert.equal((r.body.remedy as { tool: string }).tool, "se_boot");
});

test("se_state is always legal — even before boot (observability is never gated)", async () => {
  const server = buildServer(freshRoot());
  const r = await call(server, "se_state");
  assert.equal(r.isError, false);
  assert.deepEqual(r.body.active, ["start"]);
  assert.ok((r.body.legal_tools as string[]).includes("se_boot"));
});

test("boot walks the sub-machine step by step and lands in idle with the banner", async () => {
  const server = buildServer(freshRoot());
  const s1 = await call(server, "se_boot");
  assert.equal(s1.isError, false);
  assert.equal(s1.body.phase, "boot/read_contract");
  assert.ok(String(s1.body.guidance).includes("AGENTS.md"));
  // mid-boot, the lane is still shut and se_state shows the nested position
  const mid = await call(server, "se_state");
  assert.deepEqual(mid.body.active, ["boot/read_contract"]);
  const shut = await call(server, "se_run", { command: "echo nope" });
  assert.equal(shut.body.clause, "SE-C-110");
  const s2 = await call(server, "se_boot");
  assert.equal(s2.body.phase, "boot/prepare_idle");
  const s3 = await call(server, "se_boot");
  assert.equal(s3.body.booted, true);
  assert.ok(String(s3.body.banner).includes("main machine @ idle"));
  assert.ok(String(s3.body.display).includes("VERBATIM"));
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
  const state = await call(server, "se_state");
  assert.equal(state.body.status, "closed");
});

test("the gate is logged like everything else — a refused pre-boot call lands in the log", async () => {
  const root = freshRoot();
  const server = buildServer(root);
  await call(server, "se_run", { command: "echo nope" }); // refused at start
  for (let i = 0; i < 3; i++) await call(server, "se_boot"); // walk to idle
  const q = await call(server, "se_log_query", { filter: { ok: false } });
  const recs = q.body.records as { tool: string; outcome: string }[];
  assert.equal(recs.length, 1);
  assert.equal(recs[0].tool, "se_run");
  assert.equal(recs[0].outcome, "rejected");
});

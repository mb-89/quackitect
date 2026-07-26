// Contract tests speaking real messages to the built server: dispatch,
// guards, logging — the wire behavior the harness will see.
import { strict as assert } from "node:assert";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { buildServer } from "../engine/tools.ts";
import { bootedServer, call, freshRoot as fresh } from "./helpers.ts";

test("initialize and tools/list serve the full lane", async () => {
  const server = buildServer(fresh());
  const init = await server.handle({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
  assert.equal((init?.result as { serverInfo: { name: string } }).serverInfo.name, "se-mcp");
  const list = await server.handle({ jsonrpc: "2.0", id: 2, method: "tools/list" });
  const names = (list?.result as { tools: { name: string }[] }).tools.map((t) => t.name);
  for (const expected of [
    "se_boot",
    "se_exit",
    "se_state",
    "se_file_read",
    "se_file_write",
    "se_file_patch",
    "se_file_delete",
    "se_file_list",
    "se_file_glob",
    "se_file_search",
    "se_run",
    "se_web_fetch",
    "se_web_search",
    "se_log_query",
  ]) {
    assert.ok(names.includes(expected), `missing ${expected}`);
  }
});

test("required args enforced at dispatch (R8) — missing arg refused with remedy", async () => {
  const server = await bootedServer(fresh());
  const r = await call(server, "se_file_read", {});
  assert.equal(r.isError, true);
  assert.equal(r.body.clause, "SE-C-046");
  assert.ok(String(r.body.got).includes("missing: path"));
});

test("unknown arg NAME refused — the String(undefined) incident cannot recur", async () => {
  const root = fresh();
  writeFileSync(join(root, "f.md"), "content");
  const server = await bootedServer(root);
  const r = await call(server, "se_file_search", { pattern: "x", intent: "testing" }); // wrong: 'pattern' not 'query'
  assert.equal(r.isError, true);
  assert.equal(r.body.clause, "SE-C-046"); // missing 'query' reported first, with accepted-args note
  const r2 = await call(server, "se_file_search", { query: "x", intent: "t", pattern: "x" });
  assert.equal(r2.isError, true);
  assert.equal(r2.body.clause, "SE-C-101");
});

test("a full read-edit-verify round trip over the wire, and every call logged", async () => {
  const root = fresh();
  writeFileSync(join(root, "doc.md"), "hello world\n");
  const server = await bootedServer(root);

  const read = await call(server, "se_file_read", { path: "doc.md" });
  assert.equal(read.isError, false);
  const patch = await call(server, "se_file_patch", { ops: [{ path: "doc.md", old_string: "world", new_string: "v3" }] });
  assert.equal(patch.isError, false);
  const again = await call(server, "se_file_read", { path: "doc.md" });
  assert.ok(String(again.body.content).includes("hello v3"));

  const logPath = join(root, ".se", "calls.jsonl");
  assert.ok(existsSync(logPath));
  const lines = readFileSync(logPath, "utf8").trim().split("\n");
  assert.equal(lines.length, 4); // se_boot + the three lane calls
  const first = JSON.parse(lines[1]) as { tool: string; ok: boolean };
  assert.equal(first.tool, "se_file_read");
  assert.equal(first.ok, true);
});

test("se_run captures output and the log keeps it in full; se_log_query fetches by ref", async () => {
  const root = fresh();
  const server = await bootedServer(root);
  const cmd = process.platform === "win32" ? "Write-Output se-v3-proof" : "echo se-v3-proof";
  const r = await call(server, "se_run", { command: cmd });
  assert.equal(r.isError, false);
  assert.ok(String(r.body.stdout).includes("se-v3-proof"));

  const q = await call(server, "se_log_query", { filter: { tool: "se_run" } });
  assert.equal(q.isError, false);
  const recs = q.body.records as { ref: string; response: { stdout: string } }[];
  assert.equal(recs.length, 1);
  const byRef = await call(server, "se_log_query", { ref: recs[0].ref });
  assert.ok(JSON.stringify(byRef.body).includes("se-v3-proof"));
});

test("rejections are results (isError: true), not protocol errors — and carry executable remedies", async () => {
  const server = await bootedServer(fresh());
  const r = await call(server, "se_file_read", { path: "../../etc/passwd" });
  assert.equal(r.isError, true);
  assert.equal(r.body.clause, "SE-C-102");
  const remedy = r.body.remedy as { tool: string };
  assert.equal(remedy.tool, "se_file_list");
});

test("unconfigured web search refuses with setup instructions, never fakes", async () => {
  const prev = process.env.SE_BRAVE_API_KEY;
  delete process.env.SE_BRAVE_API_KEY;
  try {
    const server = await bootedServer(fresh());
    const r = await call(server, "se_web_search", { query: "anything" });
    assert.equal(r.isError, true);
    assert.equal(r.body.clause, "SE-C-106");
  } finally {
    if (prev !== undefined) process.env.SE_BRAVE_API_KEY = prev;
  }
});

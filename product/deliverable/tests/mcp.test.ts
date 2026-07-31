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
    "se_tick",
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
    "se_note_drain",
  ]) {
    assert.ok(names.includes(expected), `missing ${expected}`);
  }
});

test("required args enforced at dispatch (R8) — missing arg refused with remedy", async () => {
  const server = await bootedServer(fresh());
  // se_note is the example because its `text` is genuinely required.
  // se_file_read used to be, and stopped when it learned to take a SET:
  // either `path` or `paths` satisfies it, which no `required` list can say.
  const r = await call(server, "se_note", {});
  assert.equal(r.isError, true);
  assert.equal(r.body.clause, "SE-C-046");
  assert.ok(String(r.body.got).includes("missing: text"), String(r.body.got));
});

test("a tool with ALTERNATIVE required args refuses in its handler, and says both", async () => {
  const server = await bootedServer(fresh());
  const r = await call(server, "se_file_read", {});
  assert.equal(r.isError, true);
  assert.match(String(r.body.expected), /path .*or paths/, "the refusal names both ways to satisfy it");
  assert.ok(r.body.remedy, "and carries a remedy like every other refusal");
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
  assert.equal(lines.length, 8); // 5 walk ticks + the three lane calls
  const first = JSON.parse(lines[5]) as { tool: string; ok: boolean };
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

test("an image rides to the model as a real block, and never into the log", async () => {
  const root = fresh();
  const server = await bootedServer(root);
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
  writeFileSync(join(root, "sketch.png"), png);
  const res = await server.handle({
    jsonrpc: "2.0",
    id: 9,
    method: "tools/call",
    params: { name: "se_file_read", arguments: { path: "sketch.png" } },
  });
  const content = (res?.result as { content: { type: string; text?: string; data?: string; mimeType?: string }[] }).content;
  assert.equal(content.length, 2, "the JSON result, then the picture itself");
  assert.equal(content[1].type, "image");
  assert.equal(content[1].mimeType, "image/png");
  assert.ok(Buffer.from(String(content[1].data), "base64").equals(png));

  // The payload keeps the facts and sheds the bytes.
  const body = JSON.parse(String(content[0].text)) as Record<string, unknown>;
  assert.equal(body.media_type, "image/png");
  assert.equal(body.hash !== undefined, true);
  assert.equal(body._attachments, undefined, "base64 must not reach the JSON payload");

  // And the log stays readable — base64 in calls.jsonl serves no reader.
  const logPath = join(root, ".se", "calls.jsonl");
  assert.ok(existsSync(logPath));
  const log = readFileSync(logPath, "utf8");
  assert.equal(log.includes(String(content[1].data).slice(0, 40)), false, "base64 must not reach calls.jsonl");
});

// THE RETRO'S BOUNDARY (found live 2026-07-29). "last_retro" meant the newest
// drain of any kind. Then e22 let the FRONT DESK drain too, so a desk drain
// minutes old handed the retro a window far too short and nothing said so.
// Only a retro may park or carry a note, so those dispositions mark it exactly.
test("last_retro means the previous RETRO, not the last desk drain", async () => {
  const { CallLog } = await import("../engine/calllog.ts");
  const root = fresh();
  const log = new CallLog(join(root, ".se"));
  const drain = (disposition: string) =>
    log.append({ tool: "se_note_drain", args: { disposition }, ok: true, outcome: "result", duration_ms: 1 });

  drain("backlog"); // a RETRO: the desk is refused this disposition
  log.append({ tool: "se_tick", args: {}, ok: true, outcome: "result", duration_ms: 1 });
  drain("obsolete"); // the front desk may do this one
  log.append({ tool: "se_run", args: {}, ok: true, outcome: "result", duration_ms: 1 });

  // All four, because the window opens at the retro. Before the fix the desk
  // drain moved it and only two records survived.
  assert.equal(log.query({ filter: { since: "last_retro" } }).total, 4);
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

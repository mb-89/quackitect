// Contract test for the hand-rolled MCP transport: real bytes to a spawned
// server process — initialize, tools/list, tools/call, rejection-as-result.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";
import { createInterface } from "node:readline";

const NODE = `---
id: se.adr-mcp
kind: decision
statement: MCP transport is hand-rolled, decided at B2 with implementation data.
---

## Rationale

Thin protocol subset, zero-dep engine, custom dispatch middleware needed anyway.
`;

async function withServer(fn: (send: (msg: object) => Promise<Record<string, unknown>>) => Promise<void>): Promise<void> {
  const root = mkdtempSync(join(tmpdir(), "se-mcp-"));
  mkdirSync(join(root, "ledger", "se"), { recursive: true });
  writeFileSync(join(root, "ledger", "se", "adr-mcp.md"), NODE);

  const bin = join(import.meta.dirname, "..", "bin", "se-mcp.ts");
  const proc = spawn(process.execPath, [bin, "--root", root], { stdio: ["pipe", "pipe", "pipe"] });
  const rl = createInterface({ input: proc.stdout });
  const pending: ((line: string) => void)[] = [];
  rl.on("line", (line) => pending.shift()?.(line));

  let nextId = 1;
  const send = (msg: object): Promise<Record<string, unknown>> => {
    const withId = { jsonrpc: "2.0", id: nextId++, ...msg };
    return new Promise((res, rej) => {
      const t = setTimeout(() => rej(new Error("mcp response timeout")), 10_000);
      pending.push((line) => {
        clearTimeout(t);
        res(JSON.parse(line) as Record<string, unknown>);
      });
      proc.stdin.write(JSON.stringify(withId) + "\n");
    });
  };

  try {
    await fn(send);
  } finally {
    proc.kill();
    await once(proc, "exit").catch(() => {});
    rl.close();
    rmSync(root, { recursive: true, force: true });
  }
}

test("initialize -> tools/list -> tools/call round trip over stdio", async () => {
  await withServer(async (send) => {
    const init = await send({
      method: "initialize",
      params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "0" } },
    });
    const initResult = init.result as { serverInfo: { name: string }; protocolVersion: string };
    assert.equal(initResult.serverInfo.name, "se-mcp");

    const list = await send({ method: "tools/list" });
    const tools = (list.result as { tools: { name: string; title: string }[] }).tools;
    const names = tools.map((t) => t.name);
    assert.ok(names.includes("se_get_node") && names.includes("se_set_apply") && names.includes("se_help"));
    assert.equal(tools.find((t) => t.name === "se_get_node")!.title, "se.get.node");

    const call = await send({
      method: "tools/call",
      params: { name: "se_get_node", arguments: { id: "se.adr-mcp" } },
    });
    const callResult = call.result as { isError: boolean; content: { text: string }[] };
    assert.equal(callResult.isError, false);
    const outline = JSON.parse(callResult.content[0].text) as { id: string; hash: string; sections: string[] };
    assert.equal(outline.id, "se.adr-mcp");
    assert.deepEqual(outline.sections, ["Rationale"]);
  });
});

test("a rejection arrives as an isError result carrying the executable remedy", async () => {
  await withServer(async (send) => {
    const call = await send({
      method: "tools/call",
      params: { name: "se_get_node", arguments: { id: "se.does-not-exist" } },
    });
    const result = call.result as { isError: boolean; content: { text: string }[] };
    assert.equal(result.isError, true);
    const rej = JSON.parse(result.content[0].text) as { kind: string; clause: string; remedy: { tool: string } };
    assert.equal(rej.kind, "rejected");
    assert.equal(rej.clause, "SE-C-012");
    assert.equal(rej.remedy.tool, "se.get.search");
  });
});

test("full write loop over MCP: dry_run then execute with the hash", async () => {
  await withServer(async (send) => {
    const ops = [{ op: "set_field", id: "se.adr-mcp", field: "statement", value: "Amended over MCP." }];
    const dry = await send({
      method: "tools/call",
      params: { name: "se_set_apply", arguments: { ops, dry_run: true } },
    });
    const dryResult = JSON.parse((dry.result as { content: { text: string }[] }).content[0].text) as {
      diff_hash: string;
    };
    assert.ok(dryResult.diff_hash.length === 64);

    const exec = await send({
      method: "tools/call",
      params: { name: "se_set_apply", arguments: { ops, dry_run: false, execute_hash: dryResult.diff_hash } },
    });
    const execResult = JSON.parse((exec.result as { content: { text: string }[] }).content[0].text) as {
      applied: boolean;
    };
    assert.equal(execResult.applied, true);
  });
});

// The lane names its host (tsp-supported-harness-serves-one-lane-contract).
//
// SMALL FILES ON PURPOSE (owner ruling, 2026-07-30). See guidance/craft/software.md.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { McpServer } from "../engine/mcp.ts";

function server(): McpServer {
  return new McpServer({ name: "se-mcp", version: "test" }, [
    {
      name: "se_ping",
      title: "ping",
      description: "a tool that does nothing",
      inputSchema: { type: "object", properties: {} },
      handler: () => ({ ok: true }),
    },
  ]);
}

async function initialize(s: McpServer, clientInfo: unknown): Promise<void> {
  await s.handle({ jsonrpc: "2.0", id: 1, method: "initialize", params: { clientInfo } });
}

describe("the lane names the harness it is talking to", () => {
  test("the host's own name at initialize is kept, not thrown away", async () => {
    const s = server();
    await initialize(s, { name: "Claude Code", version: "1.2.3" });
    assert.deepEqual(s.clientInfo(), { name: "Claude Code", version: "1.2.3" });
  });

  test("the name resolves to a registry entry, so limits are reachable", async () => {
    const s = server();
    await initialize(s, { name: "copilot-cli" });
    assert.equal(s.harness()?.id, "copilot-cli");
    assert.equal(s.harness()?.limits.inlineOutputBytes, 20_480);
  });

  test("the name is available before any work state — one initialize is enough", async () => {
    const s = server();
    assert.equal(s.clientInfo(), undefined, "nothing is known before the host speaks");
    await initialize(s, { name: "Visual Studio Code" });
    assert.equal(s.harness()?.id, "vscode-copilot");
  });

  test("a host nobody measured is named but unmatched, rather than guessed at", async () => {
    const s = server();
    await initialize(s, { name: "some-other-agent" });
    assert.equal(s.clientInfo()?.name, "some-other-agent", "what it called itself is still recorded");
    assert.equal(s.harness(), undefined, "and it resolves to no entry");
  });

  test("a nameless or malformed clientInfo leaves the host unknown and does not throw", async () => {
    for (const bad of [undefined, {}, { name: "" }, { name: 7 }]) {
      const s = server();
      await initialize(s, bad);
      assert.equal(s.clientInfo(), undefined);
    }
  });

  test("every call record carries the host it came from", async () => {
    const s = server();
    const seen: Record<string, unknown>[] = [];
    s.addObserver((r) => seen.push(r as Record<string, unknown>));
    await initialize(s, { name: "copilot-cli" });
    await s.handle({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "se_ping", arguments: {} } });
    assert.equal(seen.length, 1);
    assert.equal(seen[0].client, "copilot-cli");
    assert.equal(seen[0].harness, "copilot-cli");
  });

  test("a record from an unidentified host is unstamped rather than stamped unknown", async () => {
    const s = server();
    const seen: Record<string, unknown>[] = [];
    s.addObserver((r) => seen.push(r as Record<string, unknown>));
    await s.handle({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "se_ping", arguments: {} } });
    assert.equal(seen.length, 1);
    assert.equal("client" in seen[0], false, "a made-up value would pollute every later rate");
  });
});

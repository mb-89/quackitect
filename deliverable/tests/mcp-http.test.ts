// The /mcp mount — MCP over HTTP is the SAME dispatch as stdio: one
// session, one walk, however many harnesses attach. Speaks real bytes to a
// listening mirror, the way a VS Code agent or a url-configured CLI would.
import { strict as assert } from "node:assert";
import type { AddressInfo } from "node:net";
import { describe, test } from "node:test";
import { CallLog } from "../engine/calllog.ts";
import { startMirror } from "../engine/mirror.ts";
import { seDir } from "../engine/paths.ts";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { freshRoot } from "./helpers.ts";

async function listening() {
  const root = freshRoot();
  const session = new Session(root);
  const mcp = buildServer(root, session);
  const mirror = startMirror({ session, root, port: 0, log: new CallLog(seDir(root)), mode: "agent", mcp });
  await new Promise<void>((resolve) => mirror.on("listening", () => resolve()));
  const port = (mirror.address() as AddressInfo).port;
  return { root, session, mirror, port };
}

// DIAL 127.0.0.1, NEVER `localhost`. The mirror binds 127.0.0.1 only. On
// Windows `localhost` resolves to ::1 AND 127.0.0.1, so fetch races both
// families and fails the whole connect when the IPv4 leg misses its short
// attempt window under a loaded battery. Seen once as ETIMEDOUT on
// 127.0.0.1 beside ECONNREFUSED on ::1, from a server that was listening.
function rpc(port: number, body: unknown): Promise<Response> {
  return fetch(`http://127.0.0.1:${port}/mcp`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function toolResult(res: Response): Promise<Record<string, unknown>> {
  const rpcBody = (await res.json()) as { result: { content: { text: string }[] } };
  return JSON.parse(rpcBody.result.content[0].text) as Record<string, unknown>;
}

// Concurrent: every case listens on its own ephemeral port and root.
describe("mcp over http", { concurrency: true }, () => {
  test("the localhost MCP connection stays alive across normal Copilot pauses", async () => {
    const { mirror } = await listening();
    try {
      assert.equal(mirror.keepAliveTimeout, 120_000);
      assert.equal(mirror.headersTimeout, 125_000);
    } finally {
      mirror.close();
    }
  });

  test("initialize and tools/list answer plain POSTs", async () => {
    const { mirror, port } = await listening();
    try {
      const init = await rpc(port, { jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
      assert.equal(init.status, 200);
      const initBody = (await init.json()) as { result: { protocolVersion: string } };
      assert.ok(initBody.result.protocolVersion, "initialize answers with a protocol version");
      const list = await rpc(port, { jsonrpc: "2.0", id: 2, method: "tools/list" });
      const tools = ((await list.json()) as { result: { tools: { name: string }[] } }).result.tools.map((t) => t.name);
      assert.ok(tools.includes("se_pull"), `the lane's tools ride the transport: ${tools.join(", ")}`);
    } finally {
      mirror.close();
    }
  });

  test("a tools/call over HTTP asks the SAME walk the process holds", async () => {
    const { session, mirror, port } = await listening();
    try {
      const r = await rpc(port, {
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: { name: "se_pull", arguments: {} },
      });
      const packet = await toolResult(r);
      // WHAT THIS CASE IS ABOUT is that one walk answered, not two. The
      // position it happens to report is incidental — pinning a particular one
      // made this fail the day reading stopped holding the walk at `start`.
      assert.notEqual(packet.pull, undefined, JSON.stringify(packet));
      assert.deepEqual(packet.where, session.active(), "one walk, not a private engine — the same session answered");
    } finally {
      mirror.close();
    }
  });

  test("a notification is accepted with 202 and no body", async () => {
    const { mirror, port } = await listening();
    try {
      const r = await rpc(port, { jsonrpc: "2.0", method: "notifications/initialized" });
      assert.equal(r.status, 202);
      assert.equal(await r.text(), "");
    } finally {
      mirror.close();
    }
  });

  test("rubbish answers 400 with a JSON-RPC parse error", async () => {
    const { mirror, port } = await listening();
    try {
      const r = await rpc(port, "this is not json");
      assert.equal(r.status, 400);
      const body = (await r.json()) as { error: { code: number } };
      assert.equal(body.error.code, -32700);
    } finally {
      mirror.close();
    }
  });

  test("GET is 405 — the optional push stream is not served; POST carries everything", async () => {
    const { mirror, port } = await listening();
    try {
      const r = await fetch(`http://127.0.0.1:${port}/mcp`);
      assert.equal(r.status, 405);
    } finally {
      mirror.close();
    }
  });
});

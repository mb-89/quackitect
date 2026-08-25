// The durable lifecycle log (tsp-interrupted-call-names-the-stopping-layer).
//
// SMALL FILES ON PURPOSE. See guidance/craft/software.md.
import { strict as assert } from "node:assert";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { recordClientFailures, recordLifecycle } from "../engine/lifecycle.ts";

function root(): string {
  return mkdtempSync(join(tmpdir(), "se-lifecycle-"));
}

function logOf(r: string): string {
  const p = join(r, ".se", "engine.log");
  return existsSync(p) ? readFileSync(p, "utf8") : "";
}

describe("the lifecycle log tells a reset from an exit", () => {
  test("a start and an exit are both recorded, with the pid on each", () => {
    const r = root();
    recordLifecycle(r, "start", "root=somewhere");
    recordLifecycle(r, "exit", "0");
    const lines = logOf(r).trim().split("\n");
    assert.equal(lines.length, 2);
    assert.match(lines[0], /start root=somewhere/);
    assert.match(lines[1], /exit 0/);
    for (const l of lines) assert.match(l, new RegExp(`pid=${String(process.pid)}\\b`));
  });

  test("a client reset is its own event, so silence is no longer the only evidence", () => {
    const r = root();
    recordLifecycle(r, "client-reset", "ECONNRESET socket hang up");
    assert.match(logOf(r), /client-reset ECONNRESET/);
  });

  test("a reset recorded with no exit beside it is what says the server survived", () => {
    const r = root();
    recordLifecycle(r, "listening", "port=7333");
    recordLifecycle(r, "client-reset", "ECONNRESET");
    const text = logOf(r);
    assert.match(text, /listening port=7333/);
    assert.match(text, /client-reset/);
    assert.equal(/\bexit\b/.test(text), false, "no exit line is the positive evidence the process lived");
  });

  test("an unwritable root is survived — a postmortem must not become the cause of death", () => {
    assert.doesNotThrow(() => recordLifecycle("\0not-a-path", "start"));
  });

  test("a live server records the socket failures its clients cause", async () => {
    const r = root();
    const server: Server = createServer((_req, res) => res.end("ok"));
    recordClientFailures(r, server);
    await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
    // Malformed request bytes are what a clientError actually looks like.
    const { connect } = await import("node:net");
    const port = (server.address() as { port: number }).port;
    await new Promise<void>((done) => {
      const sock = connect(port, "127.0.0.1", () => {
        sock.write("this is not http\r\n\r\n");
      });
      sock.on("close", () => done());
      sock.on("error", () => done());
    });
    await new Promise((r2) => setTimeout(r2, 50));
    server.close();
    assert.match(logOf(r), /client-error|client-reset/);
  });
});

// The wire door, against a real socket and a real child process. It listens
// where it is told, hands each request to the handler, and starts a detached
// child that outlives the call.
// [[spec/design_output/level0#the-bridgehead-and-the-server]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { HEADERS, IDLE, wire } from "../../src/doors/wire.js";

test("the door listens on a port, hands a request over, and closes", async () => {
  const it = wire();
  const server = await new Promise((resolve) => {
    const held = it.listen(
      0,
      (request, response) => {
        response.writeHead(200, { "content-type": "application/json" });
        response.end(JSON.stringify({ ok: true, url: request.url }));
      },
      () => resolve(held),
    );
  });
  const port = server.address().port;
  assert.ok(port > 0, "an ephemeral port stands");
  assert.equal(
    server.keepAliveTimeout,
    IDLE,
    "the socket outlives the hook's idle gap",
  );
  assert.equal(server.headersTimeout, HEADERS);
  assert.ok(HEADERS > IDLE, "a kept socket reads the request that follows it");
  const answer = await fetch(`http://127.0.0.1:${port}/health`);
  assert.deepEqual(await answer.json(), { ok: true, url: "/health" });
  await new Promise((resolve) => server.close(resolve));
});

test("the door starts a detached child, and the call returns at once", () => {
  const it = wire();
  assert.doesNotThrow(() => it.respawn(["-e", "process.exit(0)"]));
});

// The wire door, against a real socket. It listens where it is told, and hands
// each request to the handler.
// [[spec/design_output/level0#the-bridgehead-and-the-server]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { restarts } from "../../src/bridge/server.js";
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

// A restart hands the port on while a request stands open, because node's own close callback waits on it. [[spec/tickets/every-server-stands-and-answers]]
test("a restart frees the port while a connection stands open", async () => {
  const it = wire();
  const held = [];
  const old = await new Promise((resolve) => {
    const one = it.listen(
      0,
      (_request, response) => held.push(response),
      () => resolve(one),
    );
  });
  const port = old.address().port;
  const cut = new AbortController();
  const asked = fetch(`http://127.0.0.1:${port}/hold`, { signal: cut.signal }).catch(
    () => "cut",
  );
  while (!held.length) await new Promise((resolve) => setTimeout(resolve, 5));

  await new Promise((resolve) => restarts(old, resolve));
  const next = await new Promise((resolve, reject) => {
    const one = it.listen(port, () => {}, () => resolve(one));
    one.on("error", reject);
  });

  assert.equal(next.address().port, port, "the new server takes the port");
  assert.equal(held[0].socket.destroyed, false, "and the open connection still stands");
  cut.abort();
  assert.equal(await asked, "cut");
  await new Promise((resolve) => next.close(resolve));
});

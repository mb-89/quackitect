// The http door, against a real server on this box. A test above this one
// hands in the fake, which answers the same shape from the routes it holds.
// [[spec/design_output/doors#one-contract-test-per-door]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { fakeHttp } from "../../src/doors/fake/http.js";
import { http } from "../../src/doors/http.js";
import { wire } from "../../src/doors/wire.js";

const BODY = JSON.stringify({ said: "hello" });

async function served(answer) {
  const heard = [];
  let server;
  await new Promise((done) => {
    server = wire().listen(
      0,
      (req, res) => {
        let body = "";
        req.on("data", (part) => {
          body += part;
        });
        req.on("end", () => {
          heard.push({ method: req.method, url: req.url, headers: req.headers, body });
          answer(res);
        });
      },
      done,
    );
  });
  return { url: `http://127.0.0.1:${server.address().port}/fire`, heard, server };
}

const shaped = (said) => ({
  status: typeof said.status,
  text: typeof said.text,
  headers: typeof said.headers,
});

test("the real door sends the method, headers and body, and answers the status, body and headers", async () => {
  const { url, heard, server } = await served((res) => {
    res.writeHead(201, { "Content-Type": "application/json", "Retry-After": "60" });
    res.end(BODY);
  });
  try {
    const said = await http().send(url, {
      method: "POST",
      headers: { Authorization: "Bearer token" },
      body: "{}",
    });
    assert.equal(said.status, 201);
    assert.equal(said.text, BODY);
    assert.equal(said.headers["retry-after"], "60");
    assert.equal(heard[0].method, "POST");
    assert.equal(heard[0].headers.authorization, "Bearer token");
    assert.equal(heard[0].body, "{}");
  } finally {
    server.close();
  }
});

// A caller with a deadline hands its signal in, and the door gives up where it fires. [[spec/design_output/doors#one-door-per-outside-thing]]
test("the real door gives up a send whose signal aborts", { timeout: 2000 }, async () => {
  const { url, server } = await served(() => {});
  try {
    const stop = new AbortController();
    const said = http().send(url, { signal: stop.signal });
    stop.abort();
    await assert.rejects(said, { name: "AbortError" });
  } finally {
    server.closeAllConnections();
    server.close();
  }
});

test("the fake answers what the real door answers", async () => {
  const { url, server } = await served((res) => {
    res.writeHead(200);
    res.end(BODY);
  });
  try {
    const real = await http().send(url, { method: "GET" });
    const fake = await fakeHttp({
      [`GET ${url}`]: () => ({ status: 200, text: BODY, headers: {} }),
    }).send(url, { method: "GET" });
    assert.deepEqual(shaped(fake), shaped(real));
    assert.equal(fake.text, real.text);
  } finally {
    server.close();
  }
});

test("the fake keeps each request, reads a route past its query, and throws on a route it lacks", async () => {
  const door = fakeHttp({
    "GET https://x.example/list": (sent) => ({
      status: 200,
      text: sent.url,
      headers: {},
    }),
  });
  const said = await door.send("https://x.example/list?state=open", { method: "GET" });
  assert.equal(said.text, "https://x.example/list?state=open");
  assert.equal(door.sent.length, 1);
  await assert.rejects(
    door.send("https://x.example/other", { method: "POST" }),
    /POST https:\/\/x\.example\/other/,
  );
});

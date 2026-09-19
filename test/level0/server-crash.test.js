// The server's last word. A crash writes its error to the log before the
// process exits, so the log names why the server falls.
// [[spec/design_output/level0#a-crash-writes-its-error]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { crashed, takesOver } from "../../src/bridge/server.js";

test("a crash writes its error and stack at fatal, then exits with one", async () => {
  const rows = [];
  const own = { log: { say: async (...row) => rows.push(row) } };
  let code = null;

  await crashed(
    own,
    "http://127.0.0.1:6510",
    new Error("the disk answers nothing"),
    (at) => {
      code = at;
    },
  );

  assert.equal(code, 1);
  assert.equal(rows.length, 1);
  const [level, kind, said, detail] = rows[0];
  assert.equal(level, "fatal");
  assert.equal(kind, "bridge");
  assert.match(
    said,
    /the server falls at http:\/\/127\.0\.0\.1:6510: the disk answers nothing/,
  );
  assert.match(detail.stack, /Error: the disk answers nothing/);
});

test("a log that throws still lets the process exit", async () => {
  const own = {
    log: {
      say: async () => {
        throw new Error("no log");
      },
    },
  };
  let code = null;

  await crashed(own, "here", "a plain string", (at) => {
    code = at;
  });

  assert.equal(code, 1);
});

// [[spec/design_output/level0#a-start-takes-the-port]]
test("a bridge standing on the port stops, and the start takes the port", async () => {
  const asked = [];
  let up = true;
  const ask = async (url, init) => {
    asked.push(`${init?.method ?? "GET"} ${url}`);
    if (url.endsWith("/stop")) up = false;
    if (!up) throw new Error("refused");
    return { json: async () => ({ ok: true }) };
  };

  assert.equal(await takesOver(6510, ask, async () => {}), true);
  assert.deepEqual(asked, [
    "GET http://127.0.0.1:6510/health",
    "POST http://127.0.0.1:6510/stop",
    "GET http://127.0.0.1:6510/health",
  ]);
});

test("a free port takes no stop", async () => {
  const asked = [];
  const ask = async (url) => {
    asked.push(url);
    throw new Error("refused");
  };

  assert.equal(await takesOver(6510, ask, async () => {}), false);
  assert.equal(asked.length, 1);
});

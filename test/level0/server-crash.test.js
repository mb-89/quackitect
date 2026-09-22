// The server's last word. A crash writes its error to the log before the
// process exits, so the log names why the server falls.
// [[spec/design_output/level0#a-crash-writes-its-error]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { SERVE } from "../../.claude/skills/level0/lib/log.js";
import { crashed, respawned, takesOver } from "../../src/bridge/server.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ROOT = "/tree";
const START = ["/usr/bin/node", "/tree/src/bridge/server.js", ROOT];
const SERVE_LOG = join(ROOT, ...SERVE.split("/"));

// A box the restart hands over: the serve log so far, and a process door taught what the child does. [[spec/design_output/level0#a-restart-watches-its-child]]
function restarting(answer, wrote = "") {
  const rows = [];
  const disk = fakeDisk({ [SERVE_LOG]: "an older line\n" });
  const proc = fakeProc({
    [START.join(" ")]: () => {
      disk.append(SERVE_LOG, wrote);
      return answer;
    },
  });
  return {
    rows,
    proc,
    own: { work: ROOT, disk, proc, log: { say: async (...row) => rows.push(row) } },
  };
}

// [[spec/tickets/the-respawn-answers-no-server]]
test("a respawn whose server falls writes the reason to the log, and exits with one", async () => {
  const it = restarting(
    { exitCode: 1 },
    "/tree/src/bridge/stop.js:3\nSyntaxError: Unexpected token\nNode.js v22\n",
  );
  let code = null;
  await respawned(
    it.own,
    START,
    (at) => {
      code = at;
    },
    0,
  );

  assert.equal(code, 1);
  assert.equal(it.rows.length, 1);
  const [level, kind, said, detail] = it.rows[0];
  assert.equal(level, "fatal");
  assert.equal(kind, "bridge");
  assert.match(said, /the respawn falls with exit 1: SyntaxError: Unexpected token/);
  assert.match(
    detail.said,
    /^\/tree\/src\/bridge\/stop\.js:3\n/,
    "the words since the respawn, and no older line",
  );
  assert.equal(
    it.proc.ran[0].init.out,
    SERVE_LOG,
    "the child writes into the serve log",
  );
});

test("a respawn whose server stands writes nothing, and exits clean", async () => {
  const it = restarting({ stands: true });
  let code = null;
  await respawned(
    it.own,
    START,
    (at) => {
      code = at;
    },
    0,
  );
  assert.equal(code, 0);
  assert.deepEqual(it.rows, []);
});

test("a respawn that falls with no words names the empty log", async () => {
  const it = restarting({ exitCode: 7 });
  let code = null;
  await respawned(
    it.own,
    START,
    (at) => {
      code = at;
    },
    0,
  );
  assert.equal(code, 1);
  assert.match(it.rows[0][2], /exit 7: it wrote nothing to \.se\/\.log\/serve\.log/);
});

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

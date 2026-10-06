// The hook's door road under new: the cage the config layers decide, the
// refusal a down door answers, and the effects a live one carries.
// [[spec/design_output/level0#the-bridge-says-it-falls]]

import assert from "node:assert/strict";
import test from "node:test";
import { register as level0 } from "../../.claude/skills/level0/hooks/level0.ts";
import { fakeDisk } from "../../src/doors/fake/disk.js";

const STUB = "/stub";

// A box whose hooks door names its port, and whose every post falls. Another writer appends a row to the session log after each read and each post, as a server writing beside the hook does. [[spec/tickets/a-down-index-refuses-calls]]
const DOOR = {
  [`${STUB}/.se/.runtime/hooks.json`]: JSON.stringify({ port: 7001, token: "t0k" }),
};
const LOG = `${STUB}/.se/.log/session.jsonl`;

function caged(layers = DOOR) {
  const files = fakeDisk({ ...layers, [LOG]: "" });
  const runs = [];
  const logged = [];
  let others = 0;
  const another = () => {
    others += 1;
    files.append(LOG, `${JSON.stringify({ kind: "other", n: others })}\n`);
  };
  const at = (rel) => (String(rel).startsWith("/") ? String(rel) : `${STUB}/${rel}`);
  const $ = {
    logged,
    ui: { log: (text) => logged.push(text) },
    fs: {
      read: async (rel) => {
        const said = files.read(at(rel));
        if (at(rel) === LOG) another();
        return said;
      },
      exists: async (rel) => files.exists(at(rel)),
      write: async (rel, text) => files.write(at(rel), text),
    },
    process: {
      run: async (argv) => {
        runs.push(argv);
        // The log verb appends the row the hook hands it. [[spec/tickets/level0-hooks-hold-no-rule]]
        if (argv.includes("--say")) files.append(LOG, `${argv.at(-1)}\n`);
        return { exitCode: 0, stdout: "", stderr: "" };
      },
    },
    http: {
      fetch: async () => {
        another();
        throw new Error("Unable to connect");
      },
    },
  };
  const hooks = {};
  level0((event, fn) => {
    hooks[event] = fn;
  }, {});
  const handed = Object.assign(async (e) => ({ handed: e }), { event: "tool.call" });
  return { files, runs, $, hooks, handed, others: () => others };
}

// [[spec/tickets/a-down-index-refuses-calls]]
test("a stopped hooks door refuses a guarded call and names session/alarms", async () => {
  const box = caged();

  const said = await box.hooks["*"](box.$, { tool: "Bash", command: "ls" }, box.handed);
  await box.hooks["*"](box.$, { tool: "Bash", command: "ls" }, box.handed);

  assert.equal(said?.handed, undefined, "the guarded call goes no further");
  assert.match(
    String(said?.deny ?? ""),
    /session\/alarms/,
    "the refusal names the alarm",
  );
  assert.match(String(said.deny), /\.\/RUNME\.sh /, "and the command that clears it");
  const starts = box.runs.filter((argv) => argv.includes("--bridge"));
  assert.equal(starts.length, 1, "the hook starts the index once");
});

// [[spec/tickets/the-cage-survives-its-index]]
test("a door dying mid-session starts once more, passes the recovery commands, and refuses the rest", async () => {
  const box = caged();
  let up = true;
  box.$.http.fetch = async () => {
    if (!up) throw new Error("Unable to connect");
    return { ok: true, status: 200, text: "{}" };
  };
  const bash = (command) =>
    box.hooks["*"](box.$, { tool: "Bash", command }, box.handed);
  const starts = () =>
    box.runs.filter((argv) => argv.includes("--bridge")).length;

  assert.equal(
    (await bash("ls"))?.handed?.command,
    "ls",
    "a live door passes the call",
  );
  up = false;
  assert.match(
    String((await bash("ls"))?.deny ?? ""),
    /session\/alarms/,
    "the fall refuses it",
  );
  assert.equal(starts(), 1, "the fall starts the index once before it refuses");
  for (const command of [
    "./RUNME.sh serve",
    "./RUNME.sh index standing",
    "pkill -f .se/.runtime/bin/se-index",
    "git add -A",
    "git commit -m 'a-name: saves the work'",
    "git push -u origin work/a-name",
  ]) {
    assert.equal((await bash(command))?.handed?.command, command, `${command} passes`);
  }
  for (const command of [
    "rm -rf .",
    "git push origin main",
    "git push --force origin work/a-name",
  ]) {
    assert.match(
      String((await bash(command))?.deny ?? ""),
      /refuses Bash/,
      `${command} stays refused`,
    );
  }
  assert.equal(starts(), 1, "a door staying down takes no second start");

  up = true;
  await bash("ls");
  up = false;
  await bash("ls");
  assert.equal(starts(), 2, "a door that answers and falls again starts once more");
});

// [[spec/tickets/a-down-index-refuses-calls]]
test("a read passes while the hooks door stands down", async () => {
  const box = caged();
  const call = { tool: "Read", file_path: `${STUB}/a.md` };

  const said = await box.hooks["*"](box.$, call, box.handed);

  assert.deepEqual(said?.handed, call, "the read reaches the harness");
});

// [[spec/tickets/a-down-index-refuses-calls]]
test("a row another writer appends while the index falls stays in the session log", async () => {
  const box = caged();

  await box.hooks["*"](box.$, { tool: "Bash", command: "ls" }, box.handed);

  const rows = String(box.files.read(LOG))
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  const kept = rows.filter((row) => row.kind === "other").map((row) => row.n);
  assert.deepEqual(
    kept,
    Array.from({ length: box.others() }, (_, at) => at + 1),
    "every row the other writer appends stays",
  );
  assert.ok(
    rows.some((row) => row.kind === "bridge"),
    "and the hook's own row lands beside them",
  );
});

// [[spec/tickets/a-down-index-refuses-calls]] [[spec/tickets/the-brief-leaves-the-bridge]]
test("under new a tool call takes the hooks door effects, and a prompt reaches the hooks door too", async () => {
  const box = caged();
  const posts = [];
  box.$.http = {
    fetch: async (url, init) => {
      posts.push({ url, init });
      if (url.endsWith("/hook")) {
        const effects = [{ kind: "result", text: "the door refuses this call" }];
        return { ok: true, status: 200, text: JSON.stringify({ effects }) };
      }
      return { ok: true, status: 200, text: "{}" };
    },
  };

  const said = await box.hooks["*"](box.$, { tool: "Bash", command: "ls" }, box.handed);
  const context = Object.assign(async () => ({ blocks: [] }), {
    event: "prompt.context",
  });
  await box.hooks["*"](box.$, {}, context);

  assert.equal(
    said?.deny,
    "the door refuses this call",
    "the result effect answers the call",
  );
  assert.equal(
    posts[0].url,
    "http://127.0.0.1:7001/hook",
    "the call goes to the hooks door",
  );
  assert.equal(
    posts[0].init.headers.authorization,
    "Bearer t0k",
    "with the token it names",
  );
  assert.equal(JSON.parse(posts[0].init.body).event, "tool.call");
  assert.equal(
    posts[1].url,
    "http://127.0.0.1:7001/hook",
    "and the prompt goes there too",
  );
  assert.equal(JSON.parse(posts[1].init.body).event, "prompt.context");
});

// [[spec/tickets/spoke-answer-reaches-the-door]]
test("under new a held call asks back on agent.spoke with the effect's call id, and the second answer stands", async () => {
  const box = caged();
  const posts = [];
  box.$.session = {
    messages: async () => [{ role: "assistant", id: "a1", text: "the reply" }],
  };
  box.$.http = {
    fetch: async (url, init) => {
      const body = JSON.parse(init.body);
      posts.push({ url, body });
      const effects =
        body.event === "agent.spoke"
          ? [{ kind: "result", text: "the hold refuses" }]
          : [{ kind: "rows", call: "s1.2" }];
      return { ok: true, status: 200, text: JSON.stringify({ effects }) };
    },
  };

  const said = await box.hooks["*"](box.$, { tool: "Bash", command: "ls" }, box.handed);

  assert.deepEqual(said, { deny: "the hold refuses" });
  assert.equal(
    posts[1].url,
    "http://127.0.0.1:7001/hook",
    "the answer goes to the door",
  );
  assert.equal(posts[1].body.event, "agent.spoke");
  assert.equal(posts[1].body.e.call, "s1.2", "and names the call it answers");
  assert.equal(posts[1].body.e.text, "the reply");
});

// A door whose standing file names raw takes the transcript raw on the ask-back and on a prompt, and the fill rides every post. [[spec/tickets/level0-hooks-hold-no-rule]]
test("under a raw door a held call and a prompt carry the raw rows, and every post carries the fill", async () => {
  const box = caged({
    [`${STUB}/.se/.runtime/hooks.json`]: JSON.stringify({ port: 7001, token: "t0k", raw: true }),
  });
  const posts = [];
  box.$.session = {
    messages: async () => [{ role: "assistant", id: "a1", text: "the reply", toolUses: [{}] }],
    usage: async () => ({ context: { tokens: 1234 } }),
  };
  box.$.http = {
    fetch: async (_url, init) => {
      const body = JSON.parse(init.body);
      posts.push(body);
      const effects = body.event === "tool.call" ? [{ kind: "rows", call: "s1.2" }] : [];
      return { ok: true, status: 200, text: JSON.stringify({ effects }) };
    },
  };
  const submit = Object.assign(async (e) => e, { event: "prompt.submit" });

  await box.hooks["*"](box.$, { tool: "Bash", command: "ls" }, box.handed);
  await box.hooks["*"](box.$, { text: "the owner's prompt" }, submit);

  const raw = [{ role: "assistant", id: "a1", text: "the reply", toolUses: 1 }];
  const [call, spoke, prompt] = posts;
  assert.equal(call.fill, 1234, "the call carries the fill");
  assert.equal(prompt.fill, 1234, "and so does the prompt");
  assert.equal(spoke.event, "agent.spoke");
  assert.deepEqual(spoke.messages, raw, "the ask-back carries the raw rows");
  assert.equal("rows" in spoke.e || "texts" in spoke.e, false, "and no trim");
  assert.deepEqual(prompt.messages, raw, "the prompt carries the raw rows");
  assert.equal("before" in prompt.e, false, "and no row id");
});

// A door answering every post, which records each address the hook reaches and hands the prompt context its named blocks. [[spec/tickets/level0-runs-on-the-door]]
function answering(box, posts) {
  box.$.http = {
    fetch: async (url, init) => {
      posts.push({ url, event: JSON.parse(String(init?.body ?? "{}")).event });
      const event = JSON.parse(String(init?.body ?? "{}")).event;
      const effects =
        event === "prompt.context"
          ? [
              { kind: "after", name: "level0-tools", text: "the tools you hold" },
              { kind: "after", name: "level0-canary", text: "Open your FIRST answer" },
            ]
          : [];
      return { ok: true, status: 200, text: JSON.stringify({ effects }) };
    },
  };
}

// [[spec/tickets/level0-runs-on-the-door]]
test("under new the prompt context hands the session the door's named blocks", async () => {
  const box = caged();
  const posts = [];
  answering(box, posts);
  const context = Object.assign(
    async () => ({ blocks: [{ name: "own", text: "x" }] }),
    {
      event: "prompt.context",
    },
  );

  const said = await box.hooks["*"](box.$, {}, context);

  assert.deepEqual(
    (said?.blocks ?? []).map((one) => one.name),
    ["own", "level0-tools", "level0-canary"],
    "the door's blocks ride after the session's own",
  );
});

// [[spec/tickets/level0-runs-on-the-door]]
test("under new no event of a session reaches anything but the hooks door", async () => {
  const box = caged();
  const posts = [];
  answering(box, posts);
  const passing = (event) => Object.assign(async (e) => ({ handed: e }), { event });

  for (const event of [
    "session.start",
    "tool.register",
    "session.root",
    "env.get",
    "session.append",
    "http.fetch",
    "prompt.context",
    "tool.call",
    "classic.Stop",
    "classic.SessionEnd",
  ]) {
    await box.hooks["*"](box.$, { tool: "Bash", command: "ls" }, passing(event));
  }
  const step = Object.assign(
    async function* () {
      yield { kind: "text", text: "an answer" };
    },
    { event: "turn.step" },
  );
  for await (const _ of box.hooks["turn.step"](
    box.$,
    { turnId: "t1", index: 0 },
    step,
  )) {
  }

  const elsewhere = posts.filter((one) => !one.url.endsWith("/hook"));
  assert.deepEqual(elsewhere, [], "every post goes to the hooks door");
  assert.ok(
    posts.some((one) => one.event === "turn.said"),
    "the step's text reaches the door as turn.said",
  );
  assert.ok(
    !box.$.logged.some((one) => /ANSWERS NOTHING/.test(String(one))),
    "the session reads no fall",
  );
});

// [[spec/tickets/level0-runs-on-the-door]]
test("under new a prompt the door rewrites goes on to the harness rewritten", async () => {
  const box = caged();
  const rewritten = { text: "the owner's prompt, with the answer-first line" };
  box.$.http = {
    fetch: async () => ({
      ok: true,
      status: 200,
      text: JSON.stringify({ effects: [{ kind: "event", result: rewritten }] }),
    }),
  };
  const handed = [];
  const submit = Object.assign(
    async (e) => {
      handed.push(e);
      return { handed: e };
    },
    { event: "prompt.submit" },
  );

  const said = await box.hooks["*"](box.$, { text: "the owner's prompt" }, submit);

  assert.deepEqual(handed, [rewritten], "the harness reads the rewritten prompt");
  assert.deepEqual(said, { handed: rewritten }, "and its answer stands");
});

// [[spec/tickets/level0-runs-on-the-door]]
test("under new a prompt context finding the door down while the session start raises it waits, and takes the rules", async () => {
  const box = caged();
  const posts = [];
  let standing = false;
  box.$.http = {
    fetch: async (url, init) => {
      if (!standing) throw new Error("Unable to connect");
      const event = JSON.parse(String(init?.body ?? "{}")).event;
      posts.push({ url, event });
      const effects =
        event === "prompt.context"
          ? [{ kind: "after", name: "level0-canary", text: "Open your FIRST answer" }]
          : [];
      return { ok: true, status: 200, text: JSON.stringify({ effects }) };
    },
  };
  const run = box.$.process.run;
  let road;
  const roads = new Promise((done) => {
    road = done;
  });
  box.$.process.run = async (argv, init) => {
    if (argv.includes("--bridge")) {
      road();
      await new Promise((done) => setTimeout(done, 20));
      standing = true;
    }
    return run(argv, init);
  };
  const start = Object.assign(async (e) => e, { event: "session.start" });
  const context = Object.assign(async () => ({ blocks: [] }), {
    event: "prompt.context",
  });

  const opening = box.hooks["*"](box.$, { cwd: STUB }, start);
  await roads;
  const said = await box.hooks["*"](box.$, {}, context);
  await opening;

  assert.deepEqual(
    (said?.blocks ?? []).map((one) => one.name),
    ["level0-canary"],
    "the context waits on the one start and reads the rules off the door",
  );
});

// [[spec/tickets/level0-runs-on-the-door]]
test("under new a prompt reaches the door with its origin and the newest row before it, and the harness reads it bare", async () => {
  const box = caged();
  const bodies = [];
  box.$.session = { messages: async () => [{ role: "assistant", id: "row-9" }] };
  box.$.http = {
    fetch: async (_url, init) => {
      bodies.push(JSON.parse(String(init?.body ?? "{}")));
      return { ok: true, status: 200, text: JSON.stringify({ effects: [] }) };
    },
  };
  const handed = [];
  const submit = Object.assign(
    async (e) => {
      handed.push(e);
      return e;
    },
    { event: "prompt.submit", origin: { kind: "composer" } },
  );

  await box.hooks["*"](box.$, { text: "the owner's prompt" }, submit);

  const posted = bodies.find((one) => one.event === "prompt.submit");
  assert.deepEqual(
    posted?.e?.origin,
    { kind: "composer" },
    "the door reads who sent it",
  );
  assert.equal(posted?.e?.before, "row-9", "and the newest row before it");
  assert.deepEqual(
    handed,
    [{ text: "the owner's prompt" }],
    "the harness reads the prompt bare",
  );
});

// [[spec/tickets/level0-runs-on-the-door]]
test("under new a door the start road stands up says no fall to the session, and one still down names the door", async () => {
  const box = caged();
  let standing = false;
  box.$.http = {
    fetch: async () => {
      if (!standing) throw new Error("Unable to connect");
      return { ok: true, status: 200, text: JSON.stringify({ effects: [] }) };
    },
  };
  const run = box.$.process.run;
  box.$.process.run = async (argv, init) => {
    if (argv.includes("--bridge")) standing = true;
    return run(argv, init);
  };
  const submit = Object.assign(async (e) => e, { event: "prompt.submit" });

  await box.hooks["*"](box.$, { text: "the owner's prompt" }, submit);

  assert.deepEqual(box.$.logged, [], "the session reads no fall");
  const rows = String(box.files.read(LOG)).split("\n").filter(Boolean);
  assert.ok(
    !rows.some((one) => /answers nothing/.test(one)),
    "and the log keeps no fall row",
  );

  const down = caged();
  await down.hooks["*"](down.$, { text: "the owner's prompt" }, submit);
  assert.equal(down.$.logged.length, 1, "a door still down past the road says so once");
  assert.match(down.$.logged[0], /answers nothing at http:\/\/127\.0\.0\.1:7001\/hook/);
});

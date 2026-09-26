// The bridgehead's install road: a cloud box with an empty register clones
// the upstream, attaches through the vehicle's own verb, and says one line.
// [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]

import assert from "node:assert/strict";
import test from "node:test";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";
import {
  attachOf,
  clonedAt,
  cloneOf,
  register,
  roadsOf,
  serveOf,
} from "../../src/stub/.claude/skills/level0/hooks/bridgehead.js";
import { register as level0 } from "../../.claude/skills/level0/hooks/level0.js";

const STUB = "/stub";
const HOME = "/home/agent";
const CLONED = `${HOME}/.se/vehicles/acme`;
const UPSTREAM = "https://host/acme/acme.git";
const HOOK = ".claude/skills/level0/hooks/level0.js";
const LINK = JSON.stringify({
  vehicle: "abc123",
  name: "acme",
  upstream: UPSTREAM,
  version: "0.1.0",
  made: "2026-01-01T00:00:00.000Z",
});
const ENV = { stdout: JSON.stringify({ home: HOME, vehicle: "", work: STUB }) };

function stub(extra = {}) {
  return fakeDisk({ [`${STUB}/vehicle.json`]: LINK, ...extra });
}

function cloneInto(files) {
  return (argv) => {
    files.write(`${argv[3]}/RUNME.sh`, "run me");
    files.write(`${argv[3]}/${HOOK}`, "the hook");
    return { exitCode: 0 };
  };
}

function attachInto(files) {
  return (argv) => {
    const work = argv[1].replace(/^SE_WORK_ROOT=/, "");
    const vehicle = argv[3].replace(/\/RUNME\.sh$/, "");
    files.write(
      `${work}/.se/.runtime/project.json`,
      JSON.stringify({ driver: "abc123", since: "now" }),
    );
    files.write(
      `${work}/.se/.runtime/vehicle.json`,
      JSON.stringify({ method: vehicle, port: 6510 }),
    );
    files.write(`${work}/${HOOK}`, files.read(`${vehicle}/${HOOK}`));
    return { exitCode: 0 };
  };
}

function hand(files, outside, { answers = false } = {}) {
  const logged = [];
  const at = (rel) => (String(rel).startsWith("/") ? String(rel) : `${STUB}/${rel}`);
  return {
    logged,
    fs: {
      read: async (rel) => files.read(at(rel)),
      exists: async (rel) => files.exists(at(rel)),
      write: async (rel, text) => files.write(at(rel), text),
    },
    process: { run: async (argv, init) => outside.proc.run(argv, init) },
    http: {
      fetch: async () => {
        if (answers) return { ok: true, status: 200, text: "{}" };
        throw new Error("Unable to connect");
      },
    },
    ui: { log: (text) => logged.push(text) },
  };
}

async function started(files, outside, options) {
  const hooks = {};
  register((event, fn) => {
    hooks[event] = fn;
  }, {});
  const $ = hand(files, outside, options);
  await hooks["session.start"]($, { cwd: STUB }, async (e) => e);
  const context = await hooks["prompt.context"]($, {}, async () => ({
    blocks: [{ name: "other", text: "x" }],
  }));
  return { $, hooks, context };
}

function rows(files) {
  return files
    .read(`${STUB}/.se/.log/session.jsonl`)
    .trim()
    .split("\n")
    .map((one) => JSON.parse(one));
}

test("the roads are SE_VEHICLE, the register entry naming the identity, then the folder a cloud box clones into", () => {
  const link = { vehicle: "abc123", name: "acme" };
  const env = { vehicle: "/desk/acme", home: HOME };
  const held = [
    { id: "abc123", method_root: "/elsewhere/acme" },
    { id: "other", method_root: "/x" },
  ];
  assert.deepEqual(roadsOf(link, env, held), ["/desk/acme", "/elsewhere/acme", CLONED]);
  assert.deepEqual(roadsOf(link, { home: HOME }, []), [CLONED]);
  assert.deepEqual(
    roadsOf(link, { home: HOME }),
    [CLONED],
    "no register reads as an empty one",
  );
  assert.equal(clonedAt(link, { home: HOME }), CLONED);
  assert.equal(clonedAt({}, { home: HOME }), "", "no name, no folder");
});

test("the commands carry the upstream, the clone folder, the work root and the vehicle's own RUNME", () => {
  const link = JSON.parse(LINK);
  assert.deepEqual(cloneOf(link, { home: HOME }), ["git", "clone", UPSTREAM, CLONED]);
  assert.deepEqual(attachOf(CLONED, STUB), [
    "env",
    `SE_WORK_ROOT=${STUB}`,
    "sh",
    `${CLONED}/RUNME.sh`,
    "vehicle",
    "attach",
  ]);
  const serve = serveOf(CLONED);
  assert.equal(serve[0], "sh");
  assert.equal(serve.at(-1), CLONED, "the vehicle's folder is the argument");
  assert.match(serve[2], /src\/bridge\/server\.js/);
  assert.match(serve[2], /&\s*$/, "the server runs detached");
});

test("a cloud box with an empty register clones the upstream from vehicle.json, attaches, starts the server and says the vehicle stands", async () => {
  const files = stub();
  const outside = fakeGit(
    { node: ENV, git: cloneInto(files), env: attachInto(files), sh: { exitCode: 0 } },
    STUB,
  );
  const { $, context } = await started(files, outside);

  const argvs = outside.ran.map((one) => one.argv);
  assert.deepEqual(
    argvs[1],
    ["git", "clone", UPSTREAM, CLONED],
    "the clone carries the upstream and the folder",
  );
  assert.deepEqual(
    argvs[2],
    attachOf(CLONED, STUB),
    "the attach runs the cloned vehicle's RUNME over the stub",
  );
  assert.deepEqual(
    argvs[3],
    serveOf(CLONED),
    "nothing answers at the port, so the server starts",
  );
  assert.equal(argvs.length, 4);

  assert.equal(
    JSON.parse(files.read(`${STUB}/.se/.runtime/project.json`)).driver,
    "abc123",
    "the driver names the vehicle",
  );
  assert.equal(
    files.read(`${STUB}/${HOOK}`),
    "the hook",
    "the hook stands in the stub",
  );

  const line = rows(files).at(-1);
  assert.equal(line.kind, "bridge");
  assert.equal(line.level, "info");
  assert.match(line.said, /acme stands/);
  assert.equal(line.vehicle, CLONED);
  assert.equal(line.port, 6510);
  assert.deepEqual($.logged, [line.said], "the hook says the same line once");

  assert.equal(
    context.blocks.length,
    2,
    "one block joins the ones the chain hands back",
  );
  assert.match(context.blocks[1].text, /acme stands/);
  assert.match(context.blocks[1].text, /next session/);
  assert.match(context.blocks[1].text, /end the turn/);
});

test("a stub holding the pointer runs no command and hands no block", async () => {
  const files = stub({
    [`${STUB}/.se/.runtime/vehicle.json`]: JSON.stringify({
      method: "/desk/acme",
      port: 6511,
    }),
  });
  const outside = fakeGit({}, STUB);
  const { context } = await started(files, outside);
  assert.equal(outside.ran.length, 0);
  assert.equal(context.blocks.length, 1);
});

test("a vehicle at SE_VEHICLE clones nothing, and the attach runs its RUNME", async () => {
  const files = stub({
    "/desk/acme/RUNME.sh": "run me",
    [`/desk/acme/${HOOK}`]: "the hook",
  });
  const env = {
    stdout: JSON.stringify({ home: HOME, vehicle: "/desk/acme", work: STUB }),
  };
  const outside = fakeGit({ node: env, env: attachInto(files) }, STUB);
  await started(files, outside, { answers: true });
  const argvs = outside.ran.map((one) => one.argv);
  assert.equal(
    argvs.some((one) => one[0] === "git"),
    false,
    "no clone",
  );
  assert.deepEqual(argvs[1], attachOf("/desk/acme", STUB));
  assert.equal(argvs.length, 2, "a server answering at the port starts no second one");
  assert.equal(
    JSON.parse(files.read(`${STUB}/.se/.runtime/vehicle.json`)).method,
    "/desk/acme",
  );
});

test("a register entry naming the record's identity is the vehicle", async () => {
  const files = stub({
    "/elsewhere/acme/RUNME.sh": "run me",
    [`/elsewhere/acme/${HOOK}`]: "the hook",
    [`${HOME}/.se/.runtime/registry.json`]: JSON.stringify([
      { id: "abc123", method_root: "/elsewhere/acme", port: 6512 },
    ]),
  });
  const outside = fakeGit({ node: ENV, env: attachInto(files) }, STUB);
  await started(files, outside, { answers: true });
  const argvs = outside.ran.map((one) => one.argv);
  assert.deepEqual(argvs[1], attachOf("/elsewhere/acme", STUB));
  assert.equal(argvs.length, 2);
});

test("a clone that fails stops the road, and the log names the step and its last line", async () => {
  const files = stub();
  const outside = fakeGit(
    {
      node: ENV,
      git: {
        exitCode: 128,
        stderr:
          "Cloning into 'acme'...\nfatal: repository 'https://host/acme/acme.git/' not found\n",
      },
    },
    STUB,
  );
  const { $, context } = await started(files, outside);
  assert.equal(outside.ran.length, 2, "the clone is the last command");
  assert.equal(files.exists(`${STUB}/.se/.runtime/project.json`), false, "no driver");
  const line = rows(files).at(-1);
  assert.equal(line.level, "warn");
  assert.equal(line.step, "clone");
  assert.match(line.detail, /^fatal: repository/);
  assert.equal($.logged.length, 1);
  assert.match($.logged[0], /clone/);
  assert.equal(context.blocks.length, 1, "a failed road hands no block");
});

test("a record naming no upstream stops before the clone", async () => {
  const files = stub({
    [`${STUB}/vehicle.json`]: JSON.stringify({
      vehicle: "abc123",
      name: "acme",
      upstream: "",
    }),
  });
  const outside = fakeGit({ node: ENV }, STUB);
  await started(files, outside);
  assert.equal(
    outside.ran.some((one) => one.argv[0] === "git"),
    false,
  );
  const line = rows(files).at(-1);
  assert.equal(line.level, "warn");
  assert.equal(line.step, "clone");
  assert.match(line.detail, /upstream/);
});

// A server tool the harness registered once answers nowhere past the hook, so a dead bridge says so. [[spec/design_output/level0#the-bridge-says-it-falls]]
test("a mcp__level0__plan call with no server answers the line", async () => {
  const hooks = {};
  level0((event, fn) => {
    hooks[event] = fn;
  }, {});
  const files = fakeDisk();
  const $ = hand(files, fakeGit({}, STUB));
  const handed = Object.assign(async (e) => ({ handed: e }), { event: "tool.call" });

  const said = await hooks["*"]($, { tool: "mcp__level0__plan" }, handed);

  assert.match(String(said?.result ?? ""), /no server answers at .*6510/);
  assert.match(String(said.result), /mcp__level0__plan/, "the line names the tool");
  assert.match(
    String(said.result),
    /\.\/RUNME\.sh serve/,
    "the line names the road back",
  );
});

// The client drops the tools when it loads the module again, so the module marks its posts fresh until an answer hands the tools back. [[spec/design_output/level0#the-first-call-pays]]
test("a module loaded again marks its posts fresh until the tools come back", async () => {
  const hooks = {};
  level0((event, fn) => {
    hooks[event] = fn;
  }, {});
  const bodies = [];
  const registered = [];
  let answer = { register: [{ name: "plan" }] };
  const $ = {
    ...hand(fakeDisk(), fakeGit({}, STUB)),
    http: {
      fetch: async (_url, init) => {
        bodies.push(JSON.parse(init.body));
        const said = answer;
        answer = {};
        return { ok: true, status: 200, text: JSON.stringify(said) };
      },
    },
    tool: { register: async (spec) => registered.push(spec) },
  };
  const handed = Object.assign(async (e) => e, { event: "tool.call" });

  await hooks["*"]($, { tool: "Read" }, handed);
  await hooks["*"]($, { tool: "Read" }, handed);

  assert.equal(bodies[0].fresh, true, "the first post asks for the tools");
  assert.deepEqual(registered, [{ name: "plan" }], "the answer registers them");
  assert.equal(bodies[1].fresh, undefined, "and the next post asks no more");
});

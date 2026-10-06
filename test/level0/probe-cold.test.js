// The cold probe's reading, as pure functions over log rows and the client's
// stream. Each fixture is what one road leaves behind on a cold box.
// [[spec/design_output/level0#the-cold-probe]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { INSTALL_SKIP } from "../../.claude/skills/level0/hooks/level0.ts";
import { HEARD } from "../../.claude/skills/level0/lib/guidance.js";
import { rowOf } from "../../.claude/skills/level0/lib/log.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";
import {
  COLD,
  COLD_PATH,
  carriesLogin,
  coldIn,
  coldLines,
  coldPort,
  coldTree,
  logRows,
  probeCold,
  readsCold,
  stepsOf,
} from "../../src/scripts/probe-cold.js";

const AT = "2026-09-26T08:00:00.000Z";
const SENTENCE = "level0 holds this session: 58 rules, 4 notes, the stop hook on.";

const started = () => ({
  at: AT,
  kind: "bridge",
  level: "info",
  said: "no server answered, so the bridgehead starts one",
  event: "session.start",
  detail: "exit 0",
});
const stands = () =>
  rowOf(AT, "info", "bridge", "the server stands at http://127.0.0.1:6601", {
    root: "/tmp/tree",
  });
const context = (detail = "level0-tools level0-canary") =>
  rowOf(AT, "info", "context", "3 block(s) reach the session", {
    detail,
    reason: "first",
  });
const heard = (said) =>
  rowOf(AT, said === HEARD.same ? "info" : "warn", "level0", said, {
    detail: SENTENCE,
  });
const asked = () =>
  rowOf(AT, "debug", "gate", "asked Bash for the canary", { tool: "Bash" });

const whole = () => [started(), stands(), context(), heard(HEARD.same)];

const line = (one) => JSON.stringify(one);
const init = (tools) => line({ type: "system", subtype: "init", tools });
const said = (text, parent = null) =>
  line({
    type: "assistant",
    parent_tool_use_id: parent,
    message: { content: [{ type: "text", text }] },
  });
const calls = (name) =>
  line({
    type: "assistant",
    parent_tool_use_id: null,
    message: { content: [{ type: "tool_use", name, input: {} }] },
  });
const result = (text) => line({ type: "result", result: text });

const stream = (...lines) => `${lines.join("\n")}\n`;
const clean = () =>
  stepsOf(
    stream(
      init(["Read", "Bash", "mcp__level0__find"]),
      said(`${SENTENCE}\n\nI read the README, then the log.`),
      calls("Read"),
      calls("Bash"),
      said("Done.\nTOOLS: mcp__level0__find, mcp__level0__stop"),
      result("Done."),
    ),
  );

const verdict = (checks, name) => checks.find((one) => one.check === name);

test("a stream reads into the tools, the texts and the calls of the session's own", () => {
  const steps = stepsOf(
    stream(
      init(["Read", "mcp__level0__find"]),
      said("one"),
      said("a helper's own", "toolu_1"),
      calls("Bash"),
      "{torn",
      said("two"),
      result("two"),
    ),
  );

  assert.deepEqual(steps.tools, ["Read", "mcp__level0__find"]);
  assert.deepEqual(steps.texts, ["one", "two"]);
  assert.deepEqual(steps.called, ["Bash"]);
  assert.equal(steps.result, "two");
});

test("a whole cold road passes every check", () => {
  const checks = readsCold(whole(), clean());

  assert.deepEqual(
    checks.map((one) => [one.check, one.pass]),
    COLD.checks.map((name) => [name, true]),
  );
});

test("a log holding no bridgehead row and no context row fails the hook", () => {
  const checks = readsCold([stands()], clean());

  assert.equal(verdict(checks, "hook").pass, false);
  assert.match(verdict(checks, "hook").evidence, /no session.start row/);
});

test("a bridgehead row saying the road stood down still proves the hook ran", () => {
  const down = {
    ...started(),
    level: "warn",
    said: "the bridge code fails its self-test",
  };
  const checks = readsCold([down], clean());

  assert.equal(verdict(checks, "hook").pass, true);
  assert.match(verdict(checks, "hook").evidence, /self-test/);
});

test("a log holding the bridgehead's rows alone fails the server", () => {
  const refused = { ...started(), event: "classic.SessionStart", level: "warn" };
  const checks = readsCold([started(), refused], clean());

  assert.equal(verdict(checks, "server").pass, false);
  assert.match(verdict(checks, "server").evidence, /bridgehead alone/);
});

test("a context row naming no canary block fails the rules", () => {
  const checks = readsCold(
    [started(), stands(), context("level0-tools"), heard(HEARD.same)],
    clean(),
  );

  assert.equal(verdict(checks, "rules").pass, false);
  assert.match(verdict(checks, "rules").evidence, /level0-canary/);
});

test("a log holding no context row fails the rules", () => {
  const checks = readsCold([started(), stands()], clean());

  assert.equal(verdict(checks, "rules").pass, false);
  assert.match(verdict(checks, "rules").evidence, /no context row/);
});

// [[spec/tickets/level0-tools-leave-the-bridge]]
test("the pull alone fails the tools, because the index registers the rest", () => {
  const steps = stepsOf(
    stream(
      init(["Read", "mcp__level0__pull"]),
      said(`${SENTENCE}\nTOOLS: mcp__level0__pull`),
    ),
  );
  const checks = readsCold(whole(), steps);

  assert.equal(verdict(checks, "tools").pass, false);
  assert.match(verdict(checks, "tools").evidence, /pull alone/);
});

test("a tool the session calls counts as registered", () => {
  const steps = stepsOf(
    stream(init(["Read"]), said(SENTENCE), calls("mcp__level0__stop")),
  );
  const checks = readsCold(whole(), steps);

  assert.equal(verdict(checks, "tools").pass, true);
  assert.match(verdict(checks, "tools").evidence, /mcp__level0__stop/);
});

test("a session naming no level zero tool fails the tools", () => {
  const steps = stepsOf(stream(init(["Read"]), said(`${SENTENCE}\nTOOLS: none`)));
  const checks = readsCold(whole(), steps);

  assert.equal(verdict(checks, "tools").pass, false);
  assert.match(verdict(checks, "tools").evidence, /no level0 tool/);
});

test("a first text opening on no canary fails the canary", () => {
  const steps = stepsOf(stream(said("I read the README."), said(SENTENCE)));
  const checks = readsCold(whole(), steps);

  assert.equal(verdict(checks, "canary").pass, false);
  assert.match(verdict(checks, "canary").evidence, /opens on none/);
});

test("a canary carrying other counts fails the canary", () => {
  const steps = stepsOf(
    stream(said("level0 holds this session: 1 rules, 1 notes, the stop hook on.")),
  );
  const checks = readsCold(whole(), steps);

  assert.equal(verdict(checks, "canary").pass, false);
  assert.match(verdict(checks, "canary").evidence, /opens on other/);
});

test("a later text repeating the canary fails it", () => {
  const steps = stepsOf(
    stream(said(SENTENCE), calls("Read"), said(`${SENTENCE}\nDone.`)),
  );
  const checks = readsCold(whole(), steps);

  assert.equal(verdict(checks, "canary").pass, false);
  assert.match(verdict(checks, "canary").evidence, /text 2 repeats/);
});

test("a first text saying the canary twice fails it", () => {
  const steps = stepsOf(stream(said(`${SENTENCE}\nAgain: ${SENTENCE}`)));
  const checks = readsCold(whole(), steps);

  assert.equal(verdict(checks, "canary").pass, false);
  assert.match(verdict(checks, "canary").evidence, /text 1 repeats/);
});

test("a repeat row in the log fails the canary", () => {
  const checks = readsCold([...whole(), heard(HEARD.again)], clean());

  assert.equal(verdict(checks, "canary").pass, false);
  assert.match(verdict(checks, "canary").evidence, /second answer/);
});

test("a gate row asking for the canary after the payment fails it", () => {
  const checks = readsCold([...whole(), asked()], clean());

  assert.equal(verdict(checks, "canary").pass, false);
  assert.match(verdict(checks, "canary").evidence, /asks again after the payment/);
});

test("a gate row asking before the payment leaves the canary passing", () => {
  const rows = [started(), stands(), context(), asked(), heard(HEARD.same)];
  const checks = readsCold(rows, clean());

  assert.equal(verdict(checks, "canary").pass, true);
});

test("a log holding no level0 row leaves the canary unjudged, and fails it", () => {
  const checks = readsCold([started(), stands(), context()], clean());

  assert.equal(verdict(checks, "canary").pass, false);
  assert.match(verdict(checks, "canary").evidence, /no level0 row/);
});

test("each check reads as one line, PASS or FAIL with its evidence", () => {
  const lines = coldLines([
    { check: "hook", pass: true, evidence: "a row" },
    { check: "server", pass: false, evidence: "no row" },
  ]);

  assert.deepEqual(lines, ["PASS hook: a row", "FAIL server: no row"]);
});

test("the cold port stands past the base port, so a live server keeps its own", () => {
  assert.ok(coldPort(12345) > 6510);
  assert.equal(coldPort(12345), coldPort(12345));
});

// The runner, driven through the fake doors: the clone, the install, the client, and the cleanup. [[spec/design_output/level0#the-cold-probe]]
function runner(client) {
  const disk = fakeDisk();
  const proc = fakeProc({
    git: { exitCode: 0 },
    sh: { exitCode: 0 },
    node: { exitCode: 0 },
    pkill: { exitCode: 1 },
    claude: client,
  });
  const it = {
    disk,
    proc,
    join: (...parts) => parts.join("/"),
    pid: 12345,
    node: "node",
  };
  return { disk, proc, it };
}

test("the runner clones, installs, runs the client, reads the log, and removes the clone", async () => {
  const log = [...whole()].map(line).join("\n");
  const { disk, proc, it } = runner((_argv, init) => {
    disk.write(`${init.cwd}/.se/.log/session.jsonl`, `${log}\n`);
    return {
      exitCode: 0,
      stdout: stream(said(`${SENTENCE}\nTOOLS: mcp__level0__stop`), calls("Read")),
    };
  });
  const said_ = [];
  const code = await probeCold("/repo", it, "claude", (one) => said_.push(one));

  assert.equal(code, 0, said_.join("\n"));
  const ran = proc.ran.map((one) => one.argv[0]);
  assert.deepEqual(ran.slice(0, 3), ["git", "sh", "claude"]);
  const install = proc.ran.find((one) => one.argv[0] === "sh");
  assert.equal(install.init.env.SE_INSTALL_SKIP, INSTALL_SKIP);
  assert.doesNotMatch(
    INSTALL_SKIP,
    /\bindex\b/,
    "the cold clone builds the index the road starts",
  );
  const client = proc.ran.find((one) => one.argv[0] === "claude");
  assert.ok(client.argv.includes("--plugin-dir"));
  assert.equal(client.init.env.CLAUDE_CODE_REMOTE, "true");
  assert.equal(client.init.env.CLAUDE_CODE_ENABLE_FUNCTION_HOOKS, "1");
  assert.equal(client.init.env.CLAUDE_CONFIG_DIR, "/tmp/se-cold-1/config");
  assert.equal(client.init.env.SE_BRIDGE_PORT, String(coldPort(12345)));
  assert.equal(disk.exists("/tmp/se-cold-1"), false);
});

// The client under a fresh config folder signs in off the desk's login alone. [[spec/tickets/the-probe-carries-the-login]]
test("the desk's login file rides into the fresh config folder, and nothing else of the desk", () => {
  const { disk, it } = runner(() => ({ exitCode: 0 }));
  it.home = "/home/somebody";
  disk.write("/home/somebody/.claude/.credentials.json", '{"login":1}');
  disk.write("/home/somebody/.claude/settings.json", "{}");
  assert.equal(carriesLogin(it, "/tmp/cold/config"), true);
  assert.equal(disk.read("/tmp/cold/config/.credentials.json"), '{"login":1}');
  assert.equal(disk.exists("/tmp/cold/config/settings.json"), false);
});

test("a desk keeping no login file carries none", () => {
  const { disk, it } = runner(() => ({ exitCode: 0 }));
  it.env = { HOME: "/home/nobody" };
  assert.equal(carriesLogin(it, "/tmp/cold/config"), false);
  assert.equal(disk.exists("/tmp/cold/config/.credentials.json"), false);
});

test("a client standing nowhere fails the probe, and the clone still goes", async () => {
  const { disk, it } = runner(() => {
    throw Object.assign(new Error("spawn claude ENOENT"), { code: "ENOENT" });
  });
  const said_ = [];
  const code = await probeCold("/repo", it, "claude", (one) => said_.push(one));

  assert.equal(code, 1);
  assert.match(said_.join("\n"), /claude stands nowhere/);
  assert.equal(disk.exists("/tmp/se-cold-1"), false);
});

// The cold path is the one list the commit verb gates on. [[spec/design_output/level0#the-cold-probe]]
test("a path under the hooks folder or a named cold file sits on the cold path", () => {
  assert.deepEqual(
    coldIn([
      ".claude/skills/level0/hooks/level0.ts",
      "src/quack/main.go",
      "src/scripts/install.sh",
      "src/scripts/probe-cold.js",
    ]),
    [
      ".claude/skills/level0/hooks/level0.ts",
      "src/quack/main.go",
      "src/scripts/install.sh",
      "src/scripts/probe-cold.js",
    ],
  );
  assert.ok(COLD_PATH.includes("src/bridge/guidance.js"));
  assert.ok(COLD_PATH.includes(".claude/skills/level0/lib/guidance.js"));
});

// The install hands the stamp and the setup on, so each runs on the cold road beside it. The setup runs in Go, under src/quack. [[spec/tickets/cold-probe-reads-the-setup]] [[spec/tickets/box-verbs-port-to-go]]
test("the stamp and the setup verb sit on the cold path beside the install", () => {
  const road = ["src/scripts/go-stamp.sh", "src/quack/setup_verb.go"];
  assert.deepEqual(coldIn(road), road);
});

test("a path elsewhere, or one sharing a cold name's prefix alone, sits off the cold path", () => {
  assert.deepEqual(
    coldIn([
      "spec/design_output/level0.md",
      "src/bridge/server.json",
      "src/bridge/guidance-read.js",
      "test/level0/probe-cold.test.js",
    ]),
    [],
  );
});

// The probe clones the commit standing, so a staged change reaches the clone as a patch. [[spec/design_output/level0#the-cold-probe]]
test("a staged delta lands in the clone before the install runs", async () => {
  const { disk, proc, it } = runner({ exitCode: 1, stdout: "" });
  await probeCold("/repo", it, "claude", () => {}, "diff --git a/x b/x\n");

  const ran = proc.ran.map((one) => one.argv.join(" "));
  const applied = ran.indexOf("git apply --index /tmp/se-cold-1/staged.patch");
  const installed = ran.findIndex((one) => one.startsWith("sh "));
  assert.ok(applied > 0 && applied < installed, ran.join("\n"));
  const apply = proc.ran[applied];
  assert.equal(apply.init.cwd, "/tmp/se-cold-1/tree");
  // The clone commits the change, so the clear meets no work standing on the box alone. [[spec/tickets/the-check-takes-a-minute]]
  const committed = ran.findIndex((one) => / commit -q -m /.test(one));
  assert.equal(committed, applied + 1, ran.join("\n"));
  assert.equal(proc.ran[committed].init.cwd, "/tmp/se-cold-1/tree");
  assert.equal(disk.exists("/tmp/se-cold-1"), false);
});

// [[spec/tickets/the-check-takes-a-minute]]
test("a commit the clone refuses fails the probe before the install runs", async () => {
  const { proc, it } = runner({ exitCode: 0, stdout: "" });
  const fresh = proc.run;
  proc.run = (argv, init) =>
    argv.includes("commit")
      ? { exitCode: 1, stdout: "", stderr: "nothing to commit" }
      : fresh(argv, init);
  const said_ = [];
  const code = await probeCold("/repo", it, "claude", (one) => said_.push(one), "x\n");

  assert.equal(code, 1);
  assert.match(said_.join("\n"), /FAIL delta: nothing to commit/);
  assert.ok(!proc.ran.some((one) => one.argv[0] === "sh"));
});

test("a delta the clone refuses fails the probe before the client runs", async () => {
  const { proc, it } = runner({ exitCode: 0, stdout: "" });
  proc.teach(["git", "apply", "--index", "/tmp/se-cold-1/staged.patch"], {
    exitCode: 1,
    stderr: "patch does not apply",
  });
  const said_ = [];
  const code = await probeCold("/repo", it, "claude", (one) => said_.push(one), "x\n");

  assert.equal(code, 1);
  assert.match(said_.join("\n"), /FAIL delta: patch does not apply/);
  assert.ok(!proc.ran.some((one) => one.argv[0] === "claude"));
});

// [[spec/tickets/the-bridge-server-leaves]]
test("the cold path names neither the bridge server nor its self-test", () => {
  assert.equal(COLD_PATH.includes("src/bridge/server.js"), false);
  assert.equal(COLD_PATH.includes("src/bridge/selftest.js"), false);
});

// [[spec/tickets/level0-runs-on-the-door]]
test("a fall past the rules fails the quiet check, and a fall before them passes", () => {
  const fall = {
    level: "warn",
    kind: "bridge",
    event: "env.get",
    said: "the server answers nothing at http://127.0.0.1:6510/event",
  };
  const late = readsCold([...whole(), fall], clean());
  const early = readsCold(
    [{ ...fall, event: "classic.SessionStart" }, ...whole()],
    clean(),
  );

  assert.equal(verdict(late, "quiet").pass, false);
  assert.match(
    verdict(late, "quiet").evidence,
    /1 row\(s\) say the server answers nothing/,
  );
  assert.equal(verdict(early, "quiet").pass, true);
});

// The box both probes stand on. [[spec/tickets/level0-runs-on-the-door]]
test("the fresh box clones, installs and points the hook at a port of its own, and a refused clone stands nothing", () => {
  const { disk, proc, it } = runner(() => ({ exitCode: 0 }));
  const box = { temp: "/t", tree: "/t/tree", port: 6900, delta: "" };

  const config = coldTree("/repo", it, () => {}, box);

  assert.equal(config, "/t/config");
  assert.deepEqual(
    proc.ran.map((one) => one.argv[0]),
    ["git", "sh"],
  );
  assert.equal(JSON.parse(disk.read("/t/tree/.se/.runtime/vehicle.json")).port, 6900);

  const refused = runner(() => ({ exitCode: 0 }));
  const lines = [];
  const bare = {
    ...refused.it,
    proc: { run: () => ({ exitCode: 128, stdout: "", stderr: "no such repo" }) },
  };
  assert.equal(
    coldTree("/repo", bare, (one) => lines.push(one), box),
    "",
  );
  assert.match(lines.join("\n"), /FAIL clone: no such repo/);
});

// Two writers appending at once tear one line, and a probe reads the rest. [[spec/design_output/log#every-writer-appends]]
test("a torn line in the log drops alone, and a log standing nowhere reads as no row", () => {
  const one = rowOf("2026-09-12T08:00:00.000Z", "info", "context", "read");
  const two = rowOf("2026-09-12T08:00:01.000Z", "info", "compact", "ran");
  const disk = fakeDisk({
    log: `${JSON.stringify(one)}\n{"at":"2026\n${JSON.stringify(two)}\n`,
  });
  assert.deepEqual(
    logRows(disk, "log").map((row) => row.kind),
    ["context", "compact"],
  );
  assert.deepEqual(logRows(disk, "gone"), []);
});

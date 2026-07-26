// THE THRESHOLD (owner ruling 2026-07-26): every state carries a priority
// (0.01 mechanical .. 1 killer); the AGENT enters a state by itself only
// when priority <= the session threshold. The human always may — HTTP is
// the human's hand, MCP is the agent's. Reaching end ends the SESSION:
// onClosed fires, the server shuts down, the mirror turns red.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { call, checkDocs, freshRoot, readHashesFor } from "./helpers.ts";

test("threshold 0 is manual mode: the agent's every step is refused, the human walks freely", async () => {
  const root = freshRoot();
  const session = new Session(root);
  session.setThreshold(0);
  const server = buildServer(root, session);
  // The agent's hand (MCP): even the mechanical first step outweighs 0.
  const r = await call(server, "se_tick", { advance: true });
  assert.equal(r.isError, true);
  assert.equal(r.body.clause, "SE-C-113");
  assert.match(String(r.body.got), /boot/);
  assert.match(String((r.body.remedy as { note: string }).note), /park and END YOUR TURN/);
  // Looking is never gated — tick-info still answers the agent.
  const look = await call(server, "se_tick");
  assert.equal(look.isError, false);
  assert.equal(look.body.threshold, 0);
  // The human's hand (default channel): the same step just goes.
  await session.tickAdvance();
  assert.deepEqual(session.active(), ["boot/start"]);
});

test("the slider takes effect live: raise the threshold and the agent's next tick passes", async () => {
  const root = freshRoot();
  const session = new Session(root);
  session.setThreshold(0);
  const server = buildServer(root, session);
  assert.equal((await call(server, "se_tick", { advance: true })).isError, true);
  session.setThreshold(0.5); // the slider's POST lands here
  const r = await call(server, "se_tick", { advance: true });
  assert.equal(r.isError, false);
  assert.deepEqual(r.body.active, ["boot/start"]);
});

test("the gate weighs the TARGET: a 0.5 state refuses the agent at 0.25, the human may anyway", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  // Walk to idle on the human's hand.
  await session.tickAdvance(); await session.tickAdvance();
  checkDocs(session);
  await session.tickAdvance(); await session.tickAdvance(); await session.tickAdvance();
  assert.deepEqual(session.active(), ["idle"]);
  session.setThreshold(0.25);
  // start_expedition weighs 0.5 — above the agent's reach.
  const r = await call(server, "se_tick", { to: "start_expedition" });
  assert.equal(r.isError, true);
  assert.equal(r.body.clause, "SE-C-113");
  // expedition_archive weighs 0.25 — exactly at the threshold, the agent
  // may (with its read proof: entering demands the pull's hashes).
  const ok = await call(server, "se_tick", { to: "expedition_archive", read_hashes: readHashesFor(root) });
  assert.equal(ok.isError, false);
  // Walk the (empty) archive machine back to idle on the human's hand …
  await session.tickAdvance(); await session.tickAdvance();
  assert.deepEqual(session.active(), ["idle"]);
  // … and the human enters the 0.5 state the agent was refused.
  await session.tickAdvance("start_expedition");
  assert.deepEqual(session.active(), ["start_expedition/start"]);
});

test("jump back is entering too: the agent's back-jump is weighed against the threshold", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  await session.tickAdvance(); await session.tickAdvance();
  checkDocs(session);
  await session.tickAdvance(); await session.tickAdvance(); await session.tickAdvance();
  session.setThreshold(0);
  const r = await call(server, "se_tick", { back: "boot" });
  assert.equal(r.isError, true);
  assert.equal(r.body.clause, "SE-C-113");
});

test("priority and threshold ride every packet — the agent can weigh its next states", async () => {
  const session = new Session(freshRoot());
  const info = session.tickInfo() as { threshold: number; states: { priority: number; next: { to: string; priority?: number }[] }[] };
  assert.equal(info.threshold, 0.5);
  assert.equal(info.states[0].priority, 0.01);
  assert.equal(info.states[0].next[0].priority, 0.01); // boot, from its canvas frontmatter
  const peek = session.stateInfo("idle") as { priority: number; next: { to: string; priority?: number }[] };
  assert.equal(peek.priority, 0.01);
  const exp = peek.next.find((n) => n.to === "start_expedition");
  assert.equal(exp?.priority, 0.5);
});

test("the threshold refuses garbage: out-of-range values are typed rejections", () => {
  const session = new Session(freshRoot());
  assert.throws(() => session.setThreshold(1.5), (e) => (e as { clause?: string }).clause === "SE-C-046");
  assert.throws(() => session.setThreshold(Number("nope")), (e) => (e as { clause?: string }).clause === "SE-C-046");
  assert.equal(session.threshold, 0.5, "a refused set leaves the threshold untouched");
});

test("reaching end fires onClosed once and the closing packet says session over", async () => {
  const session = new Session(freshRoot());
  let fired = 0;
  session.onClosed = () => fired++;
  await session.tickAdvance(); await session.tickAdvance();
  checkDocs(session);
  await session.tickAdvance(); await session.tickAdvance(); await session.tickAdvance();
  const over = (await session.tickAdvance("end")) as { session_over?: boolean; banner?: string };
  assert.equal(over.session_over, true);
  assert.match(String(over.banner), /session over/i);
  assert.equal(fired, 1);
});

test("the hold: se_tick {wait} blocks until the slider moves, then the agent walks on", async () => {
  process.env.SE_WAIT_MS = "3000";
  try {
    const root = freshRoot();
    const session = new Session(root);
    session.setThreshold(0);
    const server = buildServer(root, session);
    // The agent is refused, the remedy says park (wait remains the
    // short in-turn variant this test exercises).
    const refused = await call(server, "se_tick", { advance: true });
    assert.equal(refused.body.clause, "SE-C-113");
    assert.equal((refused.body.remedy as { args: { park: boolean } }).args.park, true);
    // The agent holds; the human slides 120ms later; the hold wakes changed.
    const held = call(server, "se_tick", { wait: true });
    setTimeout(() => session.setThreshold(0.4), 120);
    const woke = await held;
    assert.equal(woke.isError, false);
    assert.equal(woke.body.changed, true);
    assert.equal(woke.body.threshold, 0.4);
    // And now the same advance just goes.
    const r = await call(server, "se_tick", { advance: true });
    assert.equal(r.isError, false);
    assert.deepEqual(r.body.active, ["boot/start"]);
  } finally {
    delete process.env.SE_WAIT_MS;
  }
});

test("the hold wakes on the human's tick too, and times out honestly", async () => {
  process.env.SE_WAIT_MS = "150";
  try {
    const root = freshRoot();
    const session = new Session(root);
    session.setThreshold(0);
    const server = buildServer(root, session);
    // Timeout: nothing moves — changed false, note says hold again.
    const idle = await call(server, "se_tick", { wait: true });
    assert.equal(idle.body.changed, false);
    assert.match(String(idle.body.note), /wait: true/);
    // The human's tick wakes a fresh hold.
    process.env.SE_WAIT_MS = "3000";
    const held = call(server, "se_tick", { wait: true });
    setTimeout(() => { void session.tickAdvance(); }, 120); // human hand
    const woke = await held;
    assert.equal(woke.body.changed, true);
    assert.deepEqual(woke.body.active, ["boot/start"]);
  } finally {
    delete process.env.SE_WAIT_MS;
  }
});

test("the mirror over HTTP: slider served, POST /threshold moves the gate, /api/alive reports, end turns it red", async () => {
  const { startMirror } = await import("../engine/mirror.ts");
  const { CallLog } = await import("../engine/calllog.ts");
  const { seDir } = await import("../engine/paths.ts");
  const root = freshRoot();
  const session = new Session(root);
  const server = startMirror({ session, root, port: 0, log: new CallLog(seDir(root)), mode: "agent" });
  await new Promise((r) => server.on("listening", r));
  const port = (server.address() as { port: number }).port;
  const base = `http://localhost:${port}`;
  try {
    const page = await (await fetch(base + "/")).text();
    assert.ok(page.includes('id="thr"'), "the slider is served");
    assert.ok(page.includes("SESSION OVER"), "the over overlay ships in the script");
    const set = await fetch(base + "/threshold", { method: "POST", redirect: "manual", headers: { "content-type": "application/json" }, body: JSON.stringify({ value: 0.75 }) });
    assert.equal(set.status, 303);
    assert.equal(session.threshold, 0.75, "the slider's POST moves the session threshold");
    const alive = await (await fetch(base + "/api/alive")).json() as { status: string; threshold: number; active: string[] };
    assert.equal(alive.status, "open");
    assert.equal(alive.threshold, 0.75);
    assert.deepEqual(alive.active, ["start"]);
    // HTTP ticks are the HUMAN's hand: at threshold 0 they still walk.
    session.setThreshold(0);
    const tick = await fetch(base + "/tick", { method: "POST", redirect: "manual", headers: { "content-type": "application/json" }, body: JSON.stringify({ advance: true }) });
    assert.equal(tick.status, 303);
    assert.deepEqual(session.active(), ["boot/start"]);
  } finally {
    server.close();
  }
});

test("the park: agent marks itself waiting, any change unparks", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  const parked = await call(server, "se_tick", { park: true });
  assert.equal(parked.body.parked, true);
  assert.equal(session.parked, true);
  session.setThreshold(0.7); // the human's hand — the change the park awaited
  assert.equal(session.parked, false);
});

test("the stop hook: exits at once when nothing is parked, wakes the agent when the slider moves", async () => {
  const { startMirror } = await import("../engine/mirror.ts");
  const { CallLog } = await import("../engine/calllog.ts");
  const { seDir } = await import("../engine/paths.ts");
  const { spawn } = await import("node:child_process");
  const { fileURLToPath } = await import("node:url");
  const hookPath = fileURLToPath(new URL("../engine/bin/stop-hook.ts", import.meta.url));
  const root = freshRoot();
  const session = new Session(root);
  const server = startMirror({ session, root, port: 0, log: new CallLog(seDir(root)), mode: "agent" });
  await new Promise((r) => server.on("listening", r));
  const port = (server.address() as { port: number }).port;
  const runHook = (waitMs: number) => new Promise<{ out: string; ms: number }>((resolve) => {
    const t0 = Date.now();
    const child = spawn(process.execPath, [hookPath], { env: { ...process.env, SE_MIRROR_PORT: String(port), SE_STOP_WAIT_MS: String(waitMs) } });
    let out = "";
    child.stdout.on("data", (d) => { out += d; });
    child.stdin.end("{}");
    child.on("close", () => resolve({ out, ms: Date.now() - t0 }));
  });
  try {
    // Not parked: the hook must NOT hold an ordinary stop.
    const plain = await runHook(5000);
    assert.equal(plain.out, "", "no block when nothing waits");
    assert.ok(plain.ms < 2000, `exited at once, took ${plain.ms}ms`);
    // Parked, nothing moves: budget spent, stop proceeds silently.
    session.park();
    const quiet = await runHook(700);
    assert.equal(quiet.out, "", "timeout allows the stop");
    // Parked, the slider moves mid-wait: the hook blocks the stop with the news.
    session.park();
    const waking = runHook(8000);
    setTimeout(() => session.setThreshold(0.9), 250);
    const woke = await waking;
    const verdict = JSON.parse(woke.out) as { decision: string; reason: string };
    assert.equal(verdict.decision, "block");
    assert.match(verdict.reason, /the machine moved/);
    assert.ok(woke.ms < 5000, `woke promptly, took ${woke.ms}ms`);
  } finally {
    server.close();
  }
});

// THE THRESHOLD (owner ruling 2026-07-26): every state carries a priority
// (0 mechanical .. 0.8 killer, 1 ideation); the AGENT enters a state by itself only
// when priority <= the session autonomy. The human always may — HTTP is
// the human's hand, MCP is the agent's. Reaching end ends the SESSION:
// onClosed fires, the server shuts down, the mirror turns red.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { call, checkDocs, freshRoot, readHashesFor } from "./helpers.ts";

test("autonomy 0 is manual mode: mechanical steps stay the agent's, every judgment step is the human's", async () => {
  const root = freshRoot();
  const session = new Session(root);
  session.setAutonomy(0);
  const server = buildServer(root, session);
  // Mechanical (priority 0) passes even at 0 — the uniform scale's floor.
  const r = await call(server, "se_tick", { advance: true });
  assert.equal(r.isError, false);
  assert.deepEqual(r.body.active, ["boot/start"]);
  // Looking is never gated — tick-info still answers the agent.
  const look = await call(server, "se_tick");
  assert.equal(look.isError, false);
  assert.equal(look.body.autonomy, 0);
  // Boot through (all mechanical), then a JUDGMENT step refuses the agent…
  const hashes = readHashesFor(root);
  for (let i = 0; i < 8; i++) {
    const step = await call(server, "se_tick", { advance: true, read_hashes: hashes });
    if (step.body.booted === true) break;
  }
  const refused = await call(server, "se_tick", { to: "start_expedition", read_hashes: hashes });
  assert.equal(refused.isError, true);
  assert.equal(refused.body.clause, "SE-C-113");
  assert.match(String((refused.body.remedy as { note: string }).note), /SEND YOU A MESSAGE/);
  // … and the human's hand (default channel) just goes.
  checkDocs(session);
  await session.tickAdvance("start_expedition");
  assert.deepEqual(session.active(), ["start_expedition/start"]);
});

test("the slider takes effect live: raise the autonomy and the agent's next tick passes", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  const hashes = readHashesFor(root);
  for (let i = 0; i < 8; i++) {
    const step = await call(server, "se_tick", { advance: true, read_hashes: hashes });
    if (step.body.booted === true) break;
  }
  session.setAutonomy(0.2);
  assert.equal((await call(server, "se_tick", { to: "start_expedition", read_hashes: hashes })).isError, true);
  session.setAutonomy(0.4); // the slider's POST lands here
  const r = await call(server, "se_tick", { to: "start_expedition", read_hashes: hashes });
  assert.equal(r.isError, false);
  assert.deepEqual(r.body.active, ["start_expedition/start"]);
});

test("the gate weighs the TARGET: a 0.4 state refuses the agent at 0.2, the human may anyway", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  // Walk to idle on the human's hand.
  await session.tickAdvance(); await session.tickAdvance();
  checkDocs(session);
  await session.tickAdvance(); await session.tickAdvance(); await session.tickAdvance();
  assert.deepEqual(session.active(), ["idle"]);
  session.setAutonomy(0.2);
  // start_expedition weighs 0.4 — above the agent's reach.
  const r = await call(server, "se_tick", { to: "start_expedition" });
  assert.equal(r.isError, true);
  assert.equal(r.body.clause, "SE-C-113");
  // expedition_archive weighs 0.2 — exactly at the autonomy, the agent
  // may (with its read proof: entering demands the pull's hashes).
  const ok = await call(server, "se_tick", { to: "expedition_archive", read_hashes: readHashesFor(root) });
  assert.equal(ok.isError, false);
  // Walk the archive machine (start → browse → end) back to idle on the
  // human's hand …
  await session.tickAdvance(); await session.tickAdvance(); await session.tickAdvance();
  assert.deepEqual(session.active(), ["idle"]);
  // … and the human enters the 0.4 state the agent was refused.
  await session.tickAdvance("start_expedition");
  assert.deepEqual(session.active(), ["start_expedition/start"]);
});

test("jump back is entering too: the agent's back-jump is weighed against the autonomy", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  await session.tickAdvance(); await session.tickAdvance();
  checkDocs(session);
  await session.tickAdvance(); await session.tickAdvance(); await session.tickAdvance();
  // Walk a JUDGMENT state (the archive, 0.2) so there is something above
  // autonomy 0 to jump back to — mechanical states pass at 0 by design.
  await session.tickAdvance("expedition_archive");
  await session.tickAdvance(); await session.tickAdvance(); await session.tickAdvance();
  assert.deepEqual(session.active(), ["idle"]);
  session.setAutonomy(0);
  const r = await call(server, "se_tick", { back: "expedition_archive" });
  assert.equal(r.isError, true);
  assert.equal(r.body.clause, "SE-C-113");
});

test("priority and autonomy ride every packet — the agent can weigh its next states", async () => {
  const session = new Session(freshRoot());
  const info = session.tickInfo() as { autonomy: number; states: { priority: number; next: { to: string; priority?: number }[] }[] };
  assert.equal(info.autonomy, 0.4);
  assert.equal(info.states[0].priority, 0);
  assert.equal(info.states[0].next[0].priority, 0); // boot, from its canvas frontmatter
  const peek = session.stateInfo("idle") as { priority: number; next: { to: string; priority?: number }[] };
  assert.equal(peek.priority, 0);
  const exp = peek.next.find((n) => n.to === "start_expedition");
  assert.equal(exp?.priority, 0.4);
});

test("the autonomy refuses garbage: out-of-range values are typed rejections", () => {
  const session = new Session(freshRoot());
  assert.throws(() => session.setAutonomy(1.5), (e) => (e as { clause?: string }).clause === "SE-C-046");
  assert.throws(() => session.setAutonomy(Number("nope")), (e) => (e as { clause?: string }).clause === "SE-C-046");
  assert.equal(session.autonomy, 0.4, "a refused set leaves the autonomy untouched");
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
    const server = buildServer(root, session);
    await session.tickAdvance(); await session.tickAdvance();
    checkDocs(session);
    await session.tickAdvance(); await session.tickAdvance(); await session.tickAdvance();
    session.setAutonomy(0);
    // The agent is refused on a judgment state (0.4 > 0); the remedy says
    // stop and ask the user to message you.
    const refused = await call(server, "se_tick", { to: "start_expedition", read_hashes: readHashesFor(root) });
    assert.equal(refused.body.clause, "SE-C-113");
    assert.match(String((refused.body.remedy as { note: string }).note), /slider alone cannot wake you/);
    // The agent holds; the human slides 120ms later; the hold wakes changed.
    const held = call(server, "se_tick", { wait: true });
    setTimeout(() => session.setAutonomy(0.4), 120);
    const woke = await held;
    assert.equal(woke.isError, false);
    assert.equal(woke.body.changed, true);
    assert.equal(woke.body.autonomy, 0.4);
    // And now the same advance just goes.
    const r = await call(server, "se_tick", { to: "start_expedition", read_hashes: readHashesFor(root) });
    assert.equal(r.isError, false);
    assert.deepEqual(r.body.active, ["start_expedition/start"]);
  } finally {
    delete process.env.SE_WAIT_MS;
  }
});

test("the hold wakes on the human's tick too, and times out honestly", async () => {
  process.env.SE_WAIT_MS = "150";
  try {
    const root = freshRoot();
    const session = new Session(root);
    session.setAutonomy(0);
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

test("the mirror over HTTP: slider served, POST /autonomy moves the gate, /api/alive reports, end turns it red", async () => {
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
    const set = await fetch(base + "/autonomy", { method: "POST", redirect: "manual", headers: { "content-type": "application/json" }, body: JSON.stringify({ value: 0.75 }) });
    assert.equal(set.status, 303);
    assert.equal(session.autonomy, 0.75, "the slider's POST moves the session autonomy");
    const alive = await (await fetch(base + "/api/alive")).json() as { status: string; autonomy: number; active: string[] };
    assert.equal(alive.status, "open");
    assert.equal(alive.autonomy, 0.75);
    assert.deepEqual(alive.active, ["start"]);
    // HTTP ticks are the HUMAN's hand: at autonomy 0 they still walk.
    session.setAutonomy(0);
    const tick = await fetch(base + "/tick", { method: "POST", redirect: "manual", headers: { "content-type": "application/json" }, body: JSON.stringify({ advance: true }) });
    assert.equal(tick.status, 303);
    assert.deepEqual(session.active(), ["boot/start"]);
    // PARITY: the human's note lands hand-stamped in the feed; a tool
    // click faces the SAME state gate the agent does, answered as JSON.
    const noted = await fetch(base + "/note", { method: "POST", redirect: "manual", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: "a human stray" }) });
    assert.equal(noted.status, 303);
    const feed = await (await fetch(base + "/api/log")).json() as { rows: { type: string; src: string; brief: string }[] };
    assert.ok(feed.rows.some((r) => r.type === "note" && r.src === "human" && r.brief.includes("a human stray")));
    const tool = await (await fetch(base + "/tool", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "se_exp_list", args: {} }) })).json() as { clause?: string };
    assert.equal(tool.clause, "SE-C-110", "the parity lane obeys the state gate");
  } finally {
    server.close();
  }
});

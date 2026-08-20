// THE THRESHOLD (owner ruling 2026-07-26): every state carries a priority
// (0.2 mechanical .. 0.8 strategic, 1 ideation — the rungs of machines/scale.md,
// re-anchored by the owner's tier cut-over of 2026-08-12); the AGENT enters a
// state by itself only
// when priority <= the session autonomy. The human always may — HTTP is
// the human's hand, MCP is the agent's. Reaching end ends the SESSION:
// onClosed fires, the server shuts down, the mirror turns red.
//
// THE AGENT'S SIDE SPEAKS PULL: a step above the slider arrives as the
// instruction `wait`, never as a refusal (v2 §6's law). The human's side
// and the mirror are unchanged — they were never gated.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { DEFAULT_TIER } from "../engine/scale.ts";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { call, checkDocs, freshRoot, readEverything, sessionAtIdle } from "./helpers.ts";

const root = (): string => freshRoot();

test("autonomy 0 is manual mode: the agent's pull waits, the human walks freely", async () => {
  const r = root();
  const session = new Session(r);
  session.setAutonomy(0);
  const server = buildServer(r, session);
  // The agent's hand (MCP): even the mechanical first step outweighs 0 —
  // the 0.2 mechanical rung exists exactly for this, and no state is ever
  // authored at 0 (machines/scale.md). The pull SAYS so instead of refusing,
  // and the saying is the look: where, autonomy, and the step.
  const w = await call(server, "se_pull");
  assert.equal(w.isError, false, "a wall is an instruction, never an error");
  assert.equal(w.body.pull, "wait");
  // THE WORD, AND NO NUMBER (owner ruling 2026-08-14: "that number leaves...
  // there's no call to be made"). The tier IS the autonomy.
  assert.equal(w.body.autonomy, undefined, "no answer carries a bare number");
  assert.equal(w.body.tier, "blocked", "the dial at its floor is the blocked rung");
  assert.match(String(w.body.why), /above this session's blocked/);
  // The served wait says DIAL, matching contract rule 3's own wording.
  assert.match(String(w.body.do), /dial alone cannot wake you/);
  // The human's hand (default channel): the same step just goes.
  await session.advance();
  assert.deepEqual(session.active(), ["boot/start"]);
});

test("the slider takes effect live: raise the autonomy and the agent's next pull passes", async () => {
  const r = root();
  const session = await sessionAtIdle(r);
  const server = buildServer(r, session);
  // Earn every read first: since software and ux left the guidance root the
  // reading is served per WAY, so an unearned one answers read before the
  // threshold gets a word in. The THRESHOLD is this test's subject.
  await readEverything(session);
  session.setAutonomy(0.2);
  const held = await call(server, "se_pull", { form: { choice: "expeditions" } });
  assert.equal(held.body.pull, "wait");
  assert.match(String(held.body.at), /expeditions/, "the wait names the step that waits");
  session.setAutonomy(0.4); // the slider's POST lands here
  const r2 = await call(server, "se_pull");
  assert.equal(r2.body.pull, "do", JSON.stringify(r2.body));
  assert.deepEqual(session.active(), ["expeditions/start"]);
});

test("the gate weighs the TARGET: a 0.4 state waits at 0.2, the archives wait at ANY slider, the human may anyway", async () => {
  const r = root();
  const session = await sessionAtIdle(r);
  const server = buildServer(r, session);
  await readEverything(session);
  session.setAutonomy(0.2);
  // expeditions weighs 0.4 — above the agent's reach. It IS one of idle's
  // offered doors, so answering it is legal; walking it is not.
  const held = await call(server, "se_pull", { form: { choice: "expeditions" } });
  assert.equal(held.body.pull, "wait");
  // The archives sit ABOVE the whole slider (1.5, human-only browsing).
  session.setAutonomy(1);
  session.setTarget(""); // drop the held aim so the doors are offered again
  const arch = await call(server, "se_pull", { form: { choice: "expedition_archive" } });
  assert.equal(arch.body.pull, "wait", "1.5 outweighs even the top rung");
  session.setAutonomy(0.2);
  session.setTarget("");
  // The front desk weighs 0.2 — exactly at the autonomy, the agent may.
  // Its method doc is owed first; the pull says read, the loop drains it.
  const aim = await call(server, "se_pull", { form: { choice: "front_desk" } });
  // Whichever call stops answering `read` is the one that WALKED. Asking
  // again would find the target already cleared and read doors as a failure.
  const desk = aim.body.pull === "read" ? { body: await readEverything(session) } : aim;
  assert.equal(desk.body.pull, "do", JSON.stringify(desk.body));
  assert.deepEqual(session.active(), ["front_desk"]);
  // Walk the desk back to idle on the human's hand — the HUMAN proves by
  // checkboxes, and this session booted on the agent's reading alone.
  checkDocs(session);
  await session.advance();
  assert.deepEqual(session.active(), ["idle"]);
  // … and the human enters the 0.4 state the agent was refused.
  await session.advance("expeditions");
  assert.deepEqual(session.active(), ["expeditions/start"]);
});

test("the hatch is never gated: an escape at autonomy 0 still reaches the desk", async () => {
  // The threshold guards what the agent ENTERS on its own judgment. The
  // escape is the andon cord — going to the desk IS going to ask the
  // person — and a cord that can refuse to be pulled is no cord.
  const r = root();
  const session = await sessionAtIdle(r);
  session.setAutonomy(0);
  const out = (await session.pull({ escape: "the road is blocked, and the person must rule" })) as Record<string, unknown>;
  assert.equal(out.pull, "wait");
  assert.deepEqual(session.active(), ["front_desk"], "the desk weighs 0.2 and the hatch lands there anyway");
});

test("the TIER rides every packet and the autonomy NUMBER does not", () => {
  const session = new Session(freshRoot());
  const info = session.packet() as {
    autonomy?: number;
    tier?: string;
    states: { priority: number; next: { to: string; priority?: number }[] }[];
  };

  // OWNER RULING 2026-08-14: "the number leaves the answer".
  // req-autonomy-is-categorical says no numeric autonomy value survives on any
  // surface, and this packet is the surface the agent reads on every call.
  assert.equal(info.autonomy, undefined, "the agent is handed the tier, never the number behind it");
  assert.equal(typeof info.tier, "string", "and the tier word is what it is handed instead");

  // THE AGENT CAN STILL WEIGH ITS NEXT STATES, which is what the old version
  // of this test was really protecting. It reads `open` and `needs` on the
  // offered doors, in words, rather than comparing two numbers itself.
  //
  // STATE PRIORITIES STILL CARRY NUMBERS. That half is i14's — "every numeric
  // priority left in the engine, the scale and the guidance goes" — and the
  // requirement itself says cut over first, then remove, never both at once.
  assert.equal(info.states[0].priority, 0.2);
  assert.equal(info.states[0].next[0].priority, 0.2); // boot.canvas frontmatter
  const peek = session.stateInfo("idle") as { priority: number; next: { to: string; priority?: number }[] };
  assert.equal(peek.priority, 0.2);
  const exp = peek.next.find((n) => n.to === "expeditions");
  assert.equal(exp?.priority, 0.4);
});

test("the autonomy refuses garbage: out-of-range values are typed rejections", () => {
  const session = new Session(freshRoot());
  assert.throws(
    () => session.setAutonomy(1.5),
    (e) => (e as { clause?: string }).clause === "SE-C-046",
  );
  assert.throws(
    () => session.setAutonomy(Number("nope")),
    (e) => (e as { clause?: string }).clause === "SE-C-046",
  );
  assert.equal(session.tier, DEFAULT_TIER, "a refused set leaves the autonomy on its default rung");
});

test("reaching end fires onClosed once and the closing packet says session over", async () => {
  const r = root();
  const session = new Session(r);
  let fired = 0;
  session.onClosed = () => fired++;
  await session.advance();
  await session.advance();
  checkDocs(session);
  await session.advance();
  await session.advance();
  await session.advance();
  const over = (await session.advance("end")) as { session_over?: boolean; banner?: string };
  assert.equal(over.session_over, true);
  assert.match(String(over.banner), /session over/i);
  assert.equal(fired, 1);
});

test("the mirror's long-poll: waitForChange wakes on the slider and times out honestly", async () => {
  // An agent told `wait` STOPS, and the person's message resumes it. The
  // mirror still long-polls the same primitive to repaint live.
  const session = new Session(root());
  const held = session.waitForChange(3000);
  setTimeout(() => session.setAutonomy(0.75), 120);
  assert.equal(await held, true, "the slider's move wakes the poll");
  assert.equal(await session.waitForChange(120), false, "nothing moved — timed out honestly");
});

test("the mirror over HTTP: slider served, POST /autonomy moves the gate, /api/alive reports, end turns it red", async () => {
  const { startMirror } = await import("../engine/mirror.ts");
  const { CallLog } = await import("../engine/calllog.ts");
  const { seDir } = await import("../engine/paths.ts");
  const r = root();
  const session = new Session(r);
  const server = startMirror({ session, root: r, port: 0, log: new CallLog(seDir(r)), mode: "agent" });
  await new Promise((rs) => server.on("listening", rs));
  const port = (server.address() as { port: number }).port;
  const base = `http://127.0.0.1:${port}`;
  try {
    const page = await (await fetch(`${base}/`)).text();
    assert.ok(page.includes('id="thr"'), "the slider is served");
    assert.ok(page.includes("SESSION OVER"), "the over overlay ships in the script");
    const set = await fetch(`${base}/autonomy`, {
      method: "POST",
      redirect: "manual",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value: 0.75 }),
    });
    assert.equal(set.status, 303);
    assert.equal(session.autonomy, 0.75, "the slider's POST moves the session autonomy");
    const alive = (await (await fetch(`${base}/api/alive`)).json()) as { status: string; autonomy: number; active: string[] };
    assert.equal(alive.status, "open");
    assert.equal(alive.autonomy, 0.75);
    assert.deepEqual(alive.active, ["start"]);
    // NOTHING HERE WALKS THE MACHINE. The walk moves on the agent's pull
    // alone; this surface sets the slider and records, and that is all.
    session.setAutonomy(0);
    // THE TICK ROUTE IS GONE — no handler answers /tick, and posting to it
    // cannot move the walk. It does not 404, because the mirror's router
    // falls through to the page for any unknown POST rather than refusing;
    // that is a router gap, filed as its own note, not this test's subject.
    await fetch(`${base}/tick`, {
      method: "POST",
      redirect: "manual",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ advance: true }),
    });
    assert.deepEqual(session.active(), ["start"], "the retired route moved nothing");
    // PARITY: the human's note lands hand-stamped in the feed; a tool
    // click faces the SAME state gate the agent does, answered as JSON.
    const noted = await fetch(`${base}/note`, {
      method: "POST",
      redirect: "manual",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "a human stray" }),
    });
    assert.equal(noted.status, 303);
    const feed = (await (await fetch(`${base}/api/log`)).json()) as { rows: { type: string; src: string; brief: string }[] };
    assert.ok(feed.rows.some((x) => x.type === "note" && x.src === "human" && x.brief.includes("a human stray")));
    const tool = (await (
      await fetch(`${base}/tool`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "se_seed_expedition", args: {} }),
      })
    ).json()) as { clause?: string };
    assert.equal(tool.clause, "SE-C-110", "the parity lane obeys the state gate");
  } finally {
    server.close();
  }
});

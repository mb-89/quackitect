// HOW OFTEN NARRATION IS OWED IS THE READER'S CHOICE.
//
// One baked-in window cannot fit every harness. A minute of a fast host is
// fifteen calls; a minute of a slow one is two, and the reader watching from
// a terminal sees a different rhythm again. So the cadence is a control they
// hold, counted in calls as well as minutes, and the top notch owes nothing.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { parseUpdate } from "../engine/decisions.ts";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { anyGuidanceDoc, bootedServer, call, freshRoot } from "./helpers.ts";

// A CHAINED BRIEF IS CORRECTED WHATEVER OP CARRIES IT (i11, narration-grace).
//
// An update's chain has been applied as the plan it wanted to be since
// 2026-08-02 — it was the lane's most-hit refusal, 174 of one window's 505.
// A fork's chain still refused, and the split it needed was already computed.
test("a chained fork brief is corrected, and stays a fork", () => {
  const u = parseUpdate({ op: "fork", brief: "the red is stale, the fixture moved, the run never completed" });
  // IT STAYS A FORK. A fork BLOCKS the current item and a plan does not, so
  // rewriting the op would change what the call means.
  assert.equal(u.op, "fork");
  assert.deepEqual(u.items, ["the red is stale", "the fixture moved", "the run never completed"]);
  assert.equal(u.brief, "the red is stale", "the detour is named by its first part");
  assert.match(String(u.corrected ?? ""), /fork kept its shape/, "a correction is announced, never silent");
});

test("an update's chain still becomes a plan, and a resolution's still refuses", () => {
  const u = parseUpdate({ op: "update", brief: "read three files, found the root, fixed it" });
  assert.equal(u.op, "plan", "an update is not a blocking detour, so its chain is a plain checklist");
  assert.equal(u.items?.length, 3);
  // WHICH PART RESOLVED THE NODE IS NOT THE ENGINE'S TO GUESS.
  assert.throws(() => parseUpdate({ op: "done", node: "d1", brief: "fixed a, then b, then c" }));
});

/** Boot on one read, so the toll is armed and the walk stands at the desk. */
async function booted(): Promise<{ server: ReturnType<typeof buildServer>; session: Session }> {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  await call(server, "se_file_read", { path: ".se/reading.md" });
  // The session's default target IS the desk — a bare pull walks there.
  const walked = await call(server, "se_pull");
  assert.equal(walked.body.pull, "do", JSON.stringify(walked.body));
  assert.deepEqual(session.active(), ["front_desk"], JSON.stringify(walked.body));
  return { server, session };
}

test("the cadence rides every pull, so both hands see the same setting", async () => {
  const { server, session } = await booted();
  assert.deepEqual(
    (await call(server, "se_pull", {})).body.narration,
    { minutes: 5, calls: 20 },
    "the default until somebody types over it",
  );
  session.setNarration(2, 8);
  assert.deepEqual((await call(server, "se_pull", {})).body.narration, { minutes: 2, calls: 8 });
});

test("turned off, nothing is ever owed however long the silence runs", async () => {
  const { server, session } = await booted();
  session.setNarration(0, 0); // both clocks stopped — nothing is ever owed
  for (let i = 0; i < 30; i++) {
    const r = await call(server, "se_file_read", { path: anyGuidanceDoc(), offset: 1, limit: 1 });
    assert.equal(r.isError, false, JSON.stringify(r.body));
    assert.equal(r.body.toll_warning, undefined, "silence is legal at the top notch");
  }
});

test("at the tightest notch the calls themselves fall due, warning first", async () => {
  const { server, session } = await booted();
  session.setNarration(1, 5); // every minute, or every 5 calls
  const read = () => call(server, "se_file_read", { path: anyGuidanceDoc(), offset: 1, limit: 1 });
  let warning: string | undefined;
  let refusal: Record<string, unknown> | undefined;
  for (let i = 0; i < 12 && refusal === undefined; i++) {
    const r = await read();
    if (r.isError) {
      refusal = r.body;
      break;
    }
    if (typeof r.body.toll_warning === "string") warning = r.body.toll_warning;
  }
  assert.ok(warning !== undefined, "the grace warning comes before any refusal");
  assert.match(warning, /calls since the last/, "the reason names calls, not minutes — no time passed");
  assert.ok(refusal !== undefined, "ignoring the warning is what earns the refusal");
  assert.match(String(refusal.expected), /5 calls/, "the refusal states the budget the reader chose");
});

test("an update pays, whatever the cadence, and the count starts over", async () => {
  const { server, session } = await booted();
  session.setNarration(1, 5);
  for (let i = 0; i < 20; i++) {
    const r = await call(server, "se_file_read", {
      path: anyGuidanceDoc(),
      offset: 1,
      limit: 1,
      update: { op: "update", brief: "still reading" },
    });
    assert.equal(r.isError, false, `a volunteered update is never stopped: ${JSON.stringify(r.body)}`);
  }
});

test("the control refuses a value outside its notches", async () => {
  const { session } = await booted();
  // Integers only, and no negatives — the row is two line edits now, and a
  // typed value is the one thing a person can get wrong there.
  assert.throws(() => session.setNarration(-1, 5));
  assert.throws(() => session.setNarration(5, -1));
  assert.throws(() => session.setNarration(2.5, 5));
  assert.throws(() => session.setNarration(5, 2.5));
  assert.throws(() => session.setNarration(99999, 5));
  // Zero is LEGAL on either — it stops that clock rather than being invalid.
  session.setNarration(0, 20);
  session.setNarration(5, 0);
});

// THE PAYMENT'S OWN REFUSAL OUTRANKS THE TOLL (note-c883db8c6e12, live
// 2026-08-03): five straight resends each CARRIED an update naming a dead
// node, and each got the bare toll clause back — the actual error was
// invisible. The caller must hear what was wrong with the payment.
test("a failing update is named by the refusal, never masked by the toll", async () => {
  const { server, session } = await booted();
  session.setNarration(1, 5);
  const read = () => call(server, "se_file_read", { path: anyGuidanceDoc(), offset: 1, limit: 1 });
  let warned = false;
  for (let i = 0; i < 12 && !warned; i++) {
    const r = await read();
    if (typeof r.body.toll_warning === "string") warned = true;
  }
  assert.ok(warned, "the grace warning is burnt — the next unpaid call refuses");
  const r = await call(server, "se_file_read", {
    path: anyGuidanceDoc(),
    offset: 1,
    limit: 1,
    update: { op: "done", node: "d9999", brief: "no such node" },
  });
  assert.equal(r.isError, true, "a failed payment still refuses — the toll stays unpaid");
  assert.notEqual(String(r.body.clause), "SE-C-040", "the refusal is the update's own, not the toll mask");
  assert.match(JSON.stringify(r.body), /d9999/, "the refusal names the node that failed to apply");
});

// A NOTE IS THE ONE DOOR THAT NEVER REFUSES, so it becomes the pressure valve.
//
// MEASURED on a recovered inbox of 91 notes from one session: 43 are a single
// pathology. An agent hit a refusal loop and wrote notes instead of moving —
// "Stop note churn. Move the walk.", "final note before pull", "Now moving.",
// "move". Nothing counted it, because every other verb refuses when the walk
// cannot move and this one is deliberately cheap and always says yes.
test("a run of notes with the walk standing still is told so, and never refused", async () => {
  const root = freshRoot();
  const server = await bootedServer(root);

  const said: (string | undefined)[] = [];
  for (let i = 0; i < 5; i++) {
    const r = await call(server, "se_note", { title: `a stray, number ${i + 1}` });
    said.push((r.body as { banner?: string }).banner);
  }

  assert.equal(said.filter((b) => b === undefined).length, 4, "the first four are ordinary captures and say nothing");
  assert.match(String(said[4]), /note is not a move|se_pull/, "the fifth names the shape");

  // AND IT IS NEVER A REFUSAL. A refused note is a lost thought, and the
  // contract says capturing a stray stays cheap.
  const last = await call(server, "se_note", { title: "still captured" });
  assert.ok((last.body as { captured?: string }).captured !== undefined, "the note still landed");
});

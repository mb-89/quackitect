// HOW OFTEN NARRATION IS OWED IS THE READER'S CHOICE.
//
// One baked-in window cannot fit every harness. A minute of a fast host is
// fifteen calls; a minute of a slow one is two, and the reader watching from
// a terminal sees a different rhythm again. So the cadence is a control they
// hold, counted in calls as well as minutes, and the top notch owes nothing.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { buildServer } from "../engine/tools.ts";
import { Session } from "../engine/session.ts";
import { call, freshRoot } from "./helpers.ts";

/** Boot on one read, so the toll is armed and the walk stands at the desk. */
async function booted(): Promise<{ server: ReturnType<typeof buildServer>; session: Session }> {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  await call(server, "se_file_read", { path: ".se/reading.md" });
  const swept = await call(server, "se_tick", { to: "front_desk", sweep: true });
  assert.deepEqual(swept.body.active, ["front_desk"], JSON.stringify(swept.body.refusal));
  return { server, session };
}

test("the cadence rides every packet, so both hands see the same setting", async () => {
  const { server, session } = await booted();
  assert.deepEqual((await call(server, "se_tick", {})).body.narration, { minutes: 5, calls: 20 }, "the default until somebody types over it");
  session.setNarration(2, 8);
  assert.deepEqual((await call(server, "se_tick", {})).body.narration, { minutes: 2, calls: 8 });
});

test("turned off, nothing is ever owed however long the silence runs", async () => {
  const { server, session } = await booted();
  session.setNarration(0, 0); // both clocks stopped — nothing is ever owed
  for (let i = 0; i < 30; i++) {
    const r = await call(server, "se_file_read", { path: "product/guidance/contract.md", offset: 1, limit: 1 });
    assert.equal(r.isError, false, JSON.stringify(r.body));
    assert.equal(r.body.toll_warning, undefined, "silence is legal at the top notch");
  }
});

test("at the tightest notch the calls themselves fall due, warning first", async () => {
  const { server, session } = await booted();
  session.setNarration(1, 5); // every minute, or every 5 calls
  const read = () => call(server, "se_file_read", { path: "product/guidance/contract.md", offset: 1, limit: 1 });
  let warning: string | undefined;
  let refusal: Record<string, unknown> | undefined;
  for (let i = 0; i < 12 && refusal === undefined; i++) {
    const r = await read();
    if (r.isError) { refusal = r.body; break; }
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
      path: "product/guidance/contract.md",
      offset: 1,
      limit: 1,
      update: { op: "update", brief: "still reading" },
    });
    assert.equal(r.isError, false, "a volunteered update is never stopped: " + JSON.stringify(r.body));
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

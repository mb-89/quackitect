// THE NARRATION CADENCE IS THE READER'S CONTROL.
//
// One baked-in window cannot fit every harness. A minute of a fast host is
// fifteen calls; a minute of a slow one is two, and the reader watching from
// a terminal sees a different rhythm again. So the cadence is two numbers they
// type, counted in calls as well as minutes, and it rides every pull.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { bootedServer, call, freshRoot, pullBoot } from "./helpers.ts";

/** A walk standing at the front desk, with the session that holds it. */
async function booted(): Promise<{ server: ReturnType<typeof buildServer>; session: Session }> {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  await pullBoot(server, session);
  assert.deepEqual(session.active(), ["front_desk"]);
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

test("the control refuses a value outside its notches", () => {
  const session = new Session(freshRoot());
  // Integers only, and no negatives — the row is two line edits, and a typed
  // value is the one thing a person can get wrong there.
  assert.throws(() => session.setNarration(-1, 5));
  assert.throws(() => session.setNarration(5, -1));
  assert.throws(() => session.setNarration(2.5, 5));
  assert.throws(() => session.setNarration(5, 2.5));
  assert.throws(() => session.setNarration(99999, 5));
  // Zero is LEGAL on either — the row's own help calls it stopping that clock.
  session.setNarration(0, 20);
  session.setNarration(5, 0);
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

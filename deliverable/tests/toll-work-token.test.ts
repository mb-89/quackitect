// THE NUDGE IS WIRED TO A RESULT, AND NOTHING IS REFUSED FOR NARRATING.
//
// THE ENGINE ASKS RATHER THAN DEMANDS. A piece of work that holds the hand for
// a long time is two things at once. Either it is genuinely one long piece of
// work, or the walker strayed onto something else and owes a token for it.
//
// ONLY THE WALKER KNOWS WHICH, so the question rides a successful answer and
// an answer to it is never owed.
//
// see dsp-narration.md#the-toll
import assert from "node:assert/strict";
import { test } from "node:test";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { anyGuidanceDoc, call, doTheWork, freshRoot, pullBoot, type Server } from "./helpers.ts";

const MINUTE = 60_000;

/** Walk boot to the desk, with a clock the case advances by hand.
 *
 *  ONLY THE TOLL'S CLOCK IS FAKE. Everything else reads the real one, so the
 *  walk behaves exactly as it does in the product. */
async function booted(now: () => number): Promise<{ server: Server; session: Session; root: string }> {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session, { now });
  await pullBoot(server, session);
  assert.equal(session.isBooted(), true, "the walk never reached the desk, so nothing below is about the desk");
  // THE DESK'S OWN STEPS ARE CLEARED FIRST. The question reports the piece of
  // work in hand, and a step left standing there is a piece of work in hand.
  doTheWork(root, "front_desk");
  return { server, session, root };
}

test("the nudge rides a successful result once one piece of work has held the hand a minute", async () => {
  let t = 1_000_000;
  const { server } = await booted(() => t);

  const opened = await call(server, "se_work", { act: "open", id: "", comment: "measuring the nudge" });
  assert.equal(opened.isError, false, `opening a piece of work was refused: ${JSON.stringify(opened.body)}`);

  const soon = await call(server, "se_file_read", { path: anyGuidanceDoc(), offset: 1, limit: 1 });
  assert.equal(soon.body.toll_warning, undefined, "the question was asked before the minute was up");

  t += MINUTE;
  const later = await call(server, "se_file_read", { path: anyGuidanceDoc(), offset: 1, limit: 1 });
  assert.equal(later.isError, false, `the nudge turned a good answer into a refusal: ${JSON.stringify(later.body)}`);
  assert.match(
    String(later.body.toll_warning),
    /measuring the nudge/,
    `the nudge never rode the result, or named other work: ${JSON.stringify(later.body.toll_warning)}`,
  );
});

// THE CADENCE IS SET TO ITS TIGHTEST NOTCH HERE. A person asking to see the
// work more often is asking, and a refusal would make that a tax instead.
test("no call is ever refused for narrating too little", async () => {
  let t = 1_000_000;
  const { server, session } = await booted(() => t);
  session.setNarration(1, 5);

  for (let i = 0; i < 30; i++) {
    t += 5 * MINUTE;
    const r = await call(server, "se_file_read", { path: anyGuidanceDoc(), offset: 1, limit: 1 });
    assert.equal(r.isError, false, `call ${i} was refused after a silent run: ${JSON.stringify(r.body)}`);
  }
});

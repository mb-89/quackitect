// THE POOL IS WHAT IS OFFERED — the iteration's own kill criterion, mechanised.
//
// tsp-the-pool-is-what-is-offered. gate-motivation named "the pool is never
// READ" as the thing that would make the whole extension wrong. These cases are
// what would catch it.
//
// THE FIXTURE IS THE POINT. The condition that matters is a clone that HAS the
// repository and has an EMPTY local note store, because that is the only state
// where reading the wrong source is visible. A root with both stores populated
// would pass over a survey that read either one.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { appendNote, drainNote } from "../engine/inbox.ts";
import { seDir } from "../engine/paths.ts";
import { standingTokens } from "../engine/pool.ts";
import { survey } from "../engine/survey.ts";
import { freshRoot } from "./helpers.ts";

/** Mint `n` options, then hand back a root whose local note store is EMPTY of
 *  anything drained — the state a fresh clone is in. */
function rootWithPool(n: number): string {
  const root = freshRoot();
  for (let i = 0; i < n; i++) {
    const { captured } = appendNote(seDir(root), `raw capture number ${String(i)}`);
    drainNote(seDir(root), captured, "backlog", `ready when thing ${String(i)} is true`, true, `option number ${String(i)} stands`, root);
  }
  return root;
}

describe("what stands open is read from the repository", { concurrency: true }, () => {
  test("every minted option is offered", () => {
    const root = rootWithPool(3);
    const s = survey(root);
    assert.equal(s.counts.backlog, 3, "the offered count is not the pool's own count");
    const ids = s.backlog.map((b) => b.ref).sort();
    assert.deepEqual(
      ids,
      standingTokens(root)
        .map((o: { id: string }) => o.id)
        .sort(),
      "the offer names different things than the pool holds",
    );
  });

  test("an option says what it is and when it comes back, without opening anything else", () => {
    const root = rootWithPool(1);
    const [item] = survey(root).backlog;
    assert.match(item.title, /option number 0 stands/, "the offer does not carry the option's statement");
    assert.match(item.ready_when, /thing 0 is true/, "the offer does not carry the re-entry condition");
  });

  // ASSERTING THE COUNT IS NOT ASSERTING THE SOURCE. A survey reading a stale
  // local store could still report the right number, so the cases assert IDS
  // and the fixture leaves the local store with nothing drained in it.
  test("an undrained capture is not an option, and the pending count still reports it", () => {
    const root = rootWithPool(2);
    appendNote(seDir(root), "something nobody has judged yet");
    const s = survey(root);
    assert.equal(s.counts.notes, 1, "the pending capture left the inbox count");
    assert.equal(s.counts.backlog, 2, "an unjudged capture was offered as an option");
    assert.ok(
      !s.backlog.some((b) => b.title.includes("nobody has judged")),
      "unjudged text appeared in a list of things somebody could commit to",
    );
  });
});

describe("a windowed answer says it was windowed", { concurrency: true }, () => {
  test("the window names how many were shown and how many stand", () => {
    const root = rootWithPool(5);
    const s = survey(root, { limit: 2 });
    assert.equal(s.backlog.length, 2, "the window did not cut the list");
    assert.ok(s.backlog_window !== undefined, "a windowed answer did not say it was windowed");
    assert.equal(s.backlog_window.shown, 2, "the window does not say how many it showed");
    assert.equal(s.backlog_window.remaining, 3, "the window does not say how many stand behind it");
    assert.equal(s.counts.backlog, 5, "the count shrank with the window, so the whole is unknowable");
  });

  test("an unwindowed answer carries no window, so the absence means completeness", () => {
    const root = rootWithPool(3);
    assert.equal(survey(root).backlog_window, undefined, "a complete answer claimed to be a window");
  });
});

describe("one source, two readers", { concurrency: true }, () => {
  test("the lane's answer and the pool agree on the ids at the same moment", () => {
    const root = rootWithPool(4);
    const fromSurvey = survey(root)
      .backlog.map((b) => b.ref)
      .sort();
    const fromPool = standingTokens(root)
      .map((o: { id: string }) => o.id)
      .sort();
    assert.deepEqual(fromSurvey, fromPool, "the two readers of one pool named different options");
  });

  test("a mint is visible to the next read with no reload", () => {
    const root = rootWithPool(1);
    assert.equal(survey(root).counts.backlog, 1, "the first option is not offered");
    const { captured } = appendNote(seDir(root), "a second raw capture");
    drainNote(seDir(root), captured, "backlog", "ready when the second thing is true", true, "a second option stands", root);
    assert.equal(survey(root).counts.backlog, 2, "a freshly minted option was not offered until something reloaded");
  });
});

// NOTHING A PERSON DOES NEEDS A RELOAD (owner, made a standing rule).
//
// THE EDITOR'S HALF OF THIS WIRE IS PINNED in work-instant.test.ts. THE
// DRAWING'S HALF WAS NOT. work-pill-drawn.test.ts renders ONCE, after the work
// already exists, so it proves a snapshot carries the pill and says nothing
// about a token opened while somebody is looking at the page.
//
// THAT IS THE LEG THAT BROKE TWICE. The work store wrote the file and told
// nobody, so a surface re-rendering from a stale index showed the state before
// the reader's own act.
//
// SO THIS RENDERS, OPENS A TOKEN, AND RENDERS AGAIN, with nothing reloaded in
// between — no second Session, no index warmed by hand. If the second drawing
// does not carry the token, the wire is broken at the index.
//
// WHAT IT DOES NOT COVER, said plainly so nobody reads it as more than it is:
// whether the BROWSER-side page repaints when the wake arrives. That is the
// fourth link, it needs a running panel, and rule 10 keeps a screen out of it.
// see ux.md#nothing-a-person-does-needs-a-reload
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { itFind, pinIteration } from "../engine/iterations.ts";
import { renderMirror } from "../engine/render.ts";
import { Session } from "../engine/session.ts";
import { checkDocs, freshRoot, gitInit } from "./helpers.ts";

/** A session standing inside an open iteration, with nothing owed yet. */
async function inARecord(): Promise<{ session: Session; root: string; id: string }> {
  const root = freshRoot();
  gitInit(root, true);
  const session = new Session(root);
  for (let i = 0; i < 2; i++) await session.advance();
  checkDocs(session);
  for (let i = 0; i < 3; i++) await session.advance();
  session.setAutonomy(1);
  const id = String(session.iterationSeed("prove the drawing hears", "a token opened now reaches the drawing now").seeded);
  pinIteration(root, itFind(root, id), "major");
  session.iterationOpen(id);
  return { session, root, id };
}

/** The served drawing, as the panel would be handed it. */
async function drawn(session: Session, root: string): Promise<string> {
  return renderMirror({ session, root, lastPacket: undefined, mode: "manual" }, "machine", "main");
}

/** How many pills the whole drawing carries. */
function pills(html: string): number {
  return (html.match(/class="work-pill /g) ?? []).length;
}

describe("a token opened now reaches the drawing now", { concurrency: false }, () => {
  test("the drawing carries a token opened after it was last served", async () => {
    const { session, root } = await inARecord();

    const before = await drawn(session, root);
    const had = pills(before);

    // THE ORDINARY ACT, through the same verb a hand uses. Nothing else is
    // touched: no reload, no second session, no index warmed by hand.
    session.workOpen("Prove the drawing hears / a token opened mid-look must not need a reload");

    const after = await drawn(session, root);

    assert.ok(
      pills(after) > had,
      `the drawing carried ${String(had)} pills before the token and ${String(pills(after))} after — a write that tells nobody is the reload this rule forbids`,
    );
  });

  test("and settling it takes the pill away again, on the same terms", async () => {
    const { session, root } = await inARecord();
    const opened = session.workOpen("Prove the drawing hears / opened so the settle has something to take away") as {
      opened?: string;
    };
    const id = String(opened.opened ?? "");
    assert.notEqual(id, "", "the open answered with an id");

    const withIt = pills(await drawn(session, root));
    session.workAct("settle", id, "done with it", "done");
    const without = pills(await drawn(session, root));

    assert.ok(
      without < withIt,
      `the drawing carried ${String(withIt)} pills while the token stood and ${String(without)} after it settled — the wire has to carry a close as well as an open`,
    );
  });
});

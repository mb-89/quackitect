// A HEADING NAMING A STATE IS A DOOR.
//
// The owner clicked the retro heading in the work editor and landed at the
// front desk. Both aliased headings did, which is the tell: two wrong targets
// would differ, one shared wrong target is a lookup returning nothing and a
// fallback catching it.
//
// THE MECHANISM, and it is worth pinning because it will recur. `placeLinks`
// gives a heading that is not a place its nearest ANCESTOR's door. The retro
// group sits under the backlog, and the backlog is drawn at the front desk by
// the owner's ruling. So the moment retro stops counting as a place, its
// heading silently leads to the desk.
//
// WHAT DECIDES IT is where the pen files a pending note. Filed with `place`
// set to retro, the store recognises retro and the door resolves. Filed under
// the backlog with retro as a BUCKET, it does not, and the desk catches it.
//
// SO THIS FILE PINS THE FILING, which is the property the link rests on. The
// rendered anchor cannot be asserted here: `workCard` emits about a thousand
// characters and no headings at all, because the table is drawn from the base
// view on the client.
//
// see dsp-the-bucket-editor.md#the-editor-is-the-database
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { appendNote } from "../engine/inbox.ts";
import { seDir } from "../engine/paths.ts";
import { penWork } from "../engine/workpen.ts";
import { BACKLOG, groupIsPlace } from "../engine/workstore.ts";
import { freshRoot } from "./helpers.ts";

describe("the retro heading is a door, not a bucket", { concurrency: false }, () => {
  test("a pending note is filed AT retro, so the heading names a place", () => {
    const root = freshRoot();
    appendNote(seDir(root), "a stray the retro will rule on");

    const notes = penWork(root).filter((i) => i.source === "pen" && i.place === "retro");
    assert.equal(notes.length, 1, "the note is filed at retro");
    assert.equal(notes[0]?.bucket, "", "as a PLACE, never as a bucket — a bucket would borrow the backlog's door");
  });

  test("the store recognises retro once a note stands there", () => {
    const root = freshRoot();
    assert.equal(groupIsPlace(root, "retro"), false, "with no notes, nothing names retro");
    appendNote(seDir(root), "a stray the retro will rule on");
    assert.equal(groupIsPlace(root, "retro"), true, "with one note, retro is a place and its heading resolves");
  });

  test("the backlog stays the one heading the desk may catch", () => {
    const root = freshRoot();
    assert.equal(groupIsPlace(root, BACKLOG), true, "special-cased, because it is the desk's pending bucket");
    assert.equal(groupIsPlace(root, "front_desk"), false, "and the desk itself is not a group anybody files under");
  });
});

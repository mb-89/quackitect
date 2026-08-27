// see dsp-the-work-store.md#work-drawn-from-a-live-source
//
// AN OPEN ISSUE AND AN OPEN DEBT ARE WORK BY THE REGISTER'S OWN DEFINITION,
// and until now nothing mechanical read them. meth-raid.md names the failure
// against itself: an entry with no trigger is filed rather than watched, and
// the register becomes a graveyard the first time nobody re-reads it.
//
// THE OTHER KINDS ARE NOT WORK. A risk has not happened, an assumption is not
// work, and a decision can only be superseded — drawing those would put rows on
// the board that nobody can ever settle.
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { openRegisterWork } from "../engine/register.ts";
import { drawnEndsWith, isDrawn, penWork } from "../engine/workpen.ts";
import { BACKLOG } from "../engine/workstore.ts";

function entry(root: string, id: string, kind: string, status: string, trigger: string): void {
  const dir = join(root, "spec", "trace", "raid");
  mkdirSync(dir, { recursive: true });
  const front = [
    "---",
    `id: ${id}`,
    'type: "[[raid]]"',
    `kind: ${kind}`,
    `statement: ${JSON.stringify(`what ${id} is about`)}`,
    `trigger: ${JSON.stringify(trigger)}`,
    ...(status === "" ? [] : [`status: ${status}`]),
    "---",
    "",
    "## Body",
    "",
  ].join("\n");
  writeFileSync(join(dir, `${id}.md`), front, "utf8");
}

function root(): string {
  return mkdtempSync(join(tmpdir(), "register-"));
}

describe("the register's open work is drawn beside the pool", { concurrency: true }, () => {
  test("an open issue and an open debt are drawn; nothing else is", () => {
    const r = root();
    entry(r, "raid-iss-something-broke", "issue", "open", "the next time anybody reads the offer");
    entry(r, "raid-debt-a-shortcut", "debt", "open", "the next release");
    entry(r, "raid-risk-it-might", "risk", "open", "never");
    entry(r, "raid-asm-we-assume", "assumption", "open", "never");
    entry(r, "raid-dec-we-decided", "decision", "open", "never");

    const ids = openRegisterWork(r)
      .map((e) => e.id)
      .sort();
    assert.deepEqual(ids, ["raid-debt-a-shortcut", "raid-iss-something-broke"], "only what somebody has to do something about");
  });

  test("a closed entry is not drawn, and a missing status reads as open", () => {
    const r = root();
    entry(r, "raid-iss-closed-one", "issue", "closed", "gone");
    entry(r, "raid-iss-no-status", "issue", "", "the next sweep");

    const ids = openRegisterWork(r).map((e) => e.id);
    assert.deepEqual(ids, ["raid-iss-no-status"], "an entry that never said it closed is still standing");
  });

  test("the drawn row sits at the backlog and carries its trigger as the condition", () => {
    const r = root();
    entry(r, "raid-iss-something-broke", "issue", "open", "any state that asks the offer for work");

    const drawn = penWork(r).filter((i) => i.id === "raid-iss-something-broke");
    assert.equal(drawn.length, 1, "one row, once");
    assert.equal(drawn[0].place, BACKLOG, "work nobody has placed sits where work nobody has placed sits");
    assert.equal(drawn[0].body, "any state that asks the offer for work", "the trigger IS the re-entry condition");
    assert.equal(drawn[0].source, "pen", "drawn, never minted");
    assert.equal(drawn[0].status, "open");
  });

  test("a register row is recognised as drawn, and names the act that ends it", () => {
    assert.equal(isDrawn("raid-iss-something-broke"), true, "it has no work file, so no home-naming act can touch it");
    assert.equal(drawnEndsWith("raid-iss-something-broke"), "se_file_patch", "its status on its own face is what closes it");
    assert.equal(drawnEndsWith("note-abc"), "se_note_drain", "the other two are unchanged");
    assert.equal(drawnEndsWith("wt-abc"), "se_seed_iteration");
  });

  test("an unreadable entry costs its own row and no other", () => {
    const r = root();
    entry(r, "raid-iss-fine", "issue", "open", "soon");
    const dir = join(r, "spec", "trace", "raid");
    writeFileSync(join(dir, "raid-iss-broken.md"), '---\nkind: issue\nstatement: "unterminated\n---\n', "utf8");

    const ids = openRegisterWork(r).map((e) => e.id);
    assert.deepEqual(ids, ["raid-iss-fine"], "the board losing every row over one file is worse than losing one");
  });
});

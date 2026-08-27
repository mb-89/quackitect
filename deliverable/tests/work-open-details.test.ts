// A TOKEN CARRIES WHAT WAS ACTUALLY ASKED FOR, not only its four-word name.
//
// FOUR WORDS NAME THE WORK AND CANNOT DESCRIBE IT. A token holding nothing else
// tells the next hand — a person, or another agent — nothing about what to do,
// so the line splits on a forward slash and the rest lands in the body.
//
// IT IS THE NOTE ENTRY'S OWN SEPARATOR. A reader typing one is typing the
// other, and two conventions for one gesture is one too many.
//
// see dsp-the-work-store.md#the-title-is-four-words
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { splitWorkLine } from "../engine/workstore.ts";

describe("a line opening work carries a name and a detail", { concurrency: true }, () => {
  test("the first slash splits them", () => {
    const said = splitWorkLine("Work coloured in log / the log's work lines take the note colour");
    assert.equal(said.statement, "Work coloured in log");
    assert.equal(said.body, "the log's work lines take the note colour");
  });

  test("no slash means no detail, and never a refusal", () => {
    const said = splitWorkLine("Drag lands in place");
    assert.equal(said.statement, "Drag lands in place", "the whole line is the name");
    assert.equal(said.body, "", "naming a stray is the cheap act and stays legal");
  });

  // A PATH, A URL OR A RATIO IN THE DETAIL KEEPS ITS OWN SLASHES. Splitting on
  // the first one and stopping is what makes that true.
  test("only the first slash splits, so the detail keeps its own", () => {
    const said = splitWorkLine("Fix the leaving guard / see notes/some/where.md and the 3/4 case");
    assert.equal(said.statement, "Fix the leaving guard");
    assert.equal(said.body, "see notes/some/where.md and the 3/4 case");
  });

  test("the whitespace around the separator is not part of either half", () => {
    const said = splitWorkLine("  Tokens speak in log   /   they log themselves  ");
    assert.equal(said.statement, "Tokens speak in log");
    assert.equal(said.body, "they log themselves");
  });

  // AN EMPTY HALF IS AN EMPTY HALF, never a stray separator left in the text.
  test("a trailing slash leaves the detail empty rather than blank-looking", () => {
    const said = splitWorkLine("Stop refused over work /");
    assert.equal(said.statement, "Stop refused over work");
    assert.equal(said.body, "");
  });
});

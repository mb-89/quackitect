// AN ITERATION DOES NOT START ON TOP OF AN UNDRAINED INBOX (owner).
//
// A PENDING NOTE IS A RETRO'S UNDONE WORK. The kickoff's retro row used to
// decide by AUTHORSHIP — survey the inbox, and skip the row if nothing pends.
// That is a judgment where a check belongs.
//
// IT BINDS THE FIRST ENTRY AND ONLY THAT ONE, and the RECORD'S OWN STAMP says
// which entry that was. A record carrying `started` has been through the gate.
//
// THE FIRST VERSION HAD NO STAMP and read the check as first-entry-only from
// the shape of an entry condition alone. That premise is false: a reload
// restarts the walk at the beginning, so every route back into a running
// iteration crosses its kickoff again. It shut i63 completely — 96 notes
// pending, the kickoff standing green, and no way forward.
import { strict as assert } from "node:assert";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { recordStarted } from "../engine/records.ts";
import { type RigorMatrixRow, readRigorMatrix } from "../engine/rigor-matrix.ts";
import { freshRoot } from "./helpers.ts";

// THE REAL MATRIX, not a fixture. The question is what THIS project's kickoff
// demands, and a crafted row would answer about the fixture instead.
const REPO = fileURLToPath(new URL("../..", import.meta.url));

function rowNamed(name: string): RigorMatrixRow {
  const row = readRigorMatrix(REPO).rows.find((r: RigorMatrixRow) => r.name === name);
  assert.notEqual(row, undefined, `the matrix carries no row named ${name}`);
  return row as RigorMatrixRow;
}

function engine(name: string): string {
  return readFileSync(fileURLToPath(new URL(`../engine/${name}`, import.meta.url)), "utf8");
}

describe("the kickoff refuses to start over an undrained inbox", { concurrency: true }, () => {
  test("the row declares the check as an entry condition", () => {
    const row = rowNamed("onboard-retro");

    assert.notEqual(row.entry, undefined, "the row carries entry conditions at all");
    assert.deepEqual(row.entry?.no_pending_note, [], "no markers, so every pending note blocks");
  });

  // AN EMPTY LIST IS A DECLARATION, NOT AN ABSENCE. Only a missing key means
  // the check is not there, and the two are one keystroke apart.
  test("an empty marker list survives the parse", () => {
    const src = engine("rigor-matrix.ts");

    assert.match(src, /out\.no_pending_note = asList\(fm\.entry_no_pending_note\)/, "the flat key is read");
    assert.match(src, /fm\.entry_no_pending_note !== undefined/, "and only a MISSING key means absent");
  });

  // THE MIRROR USED TO ASSIGN. A row declaring a check of its own lost it the
  // moment the mirrored state declared a reading, which is exactly this row:
  // it mirrors `retro` and now carries a check the retro does not.
  test("mirroring another state adds to the row's own conditions rather than replacing them", () => {
    const src = engine("rigor-matrix.ts");
    assert.match(src, /row\.entry = \{ \.\.\.inherited, \.\.\.\(row\.entry \?\? \{\}\) \}/, "the row's own keys win, and none is lost");

    const row = rowNamed("onboard-retro");
    assert.equal(row.same_as, "retro", "the row still mirrors the retro");
    assert.deepEqual(row.entry?.no_pending_note, [], "and its own check survived the merge");
  });

  test("no markers means every pending note, where it used to mean none", () => {
    const src = engine("sessionclaims.ts");
    assert.match(src, /markers\.length === 0 \|\| markers\.some/, "an empty list matches everything rather than nothing");
  });

  // THE CONDITION NOTE IS WHAT A READER OPENS FROM THE REFUSAL, so it says who
  // carries it and how to satisfy it.
  test("the condition note names its holder and its remedy", () => {
    const note = readFileSync(fileURLToPath(new URL("../machines/conditions/no_pending_note.md", import.meta.url)), "utf8");

    assert.match(note, /NO MARKERS MEANS EVERY PENDING NOTE/);
    assert.match(note, /onboard-retro/, "the note says which state carries it");
    assert.match(note, /HOW TO SATISFY IT: drain the notes/, "and what to do about it");
    assert.doesNotMatch(note, /No state carries it today/, "the stale claim is gone");
  });
});

// A STARTED RECORD IS RE-ENTERED, AND THE CHECK LETS IT BACK IN.
//
// This is the half that was missing, and its absence was not a wrong answer in
// an edge case — it was the walk unable to reach its own open iteration.
describe("the check binds the first entry and lets a started record back in", { concurrency: true }, () => {
  function recorded(name: string, frontmatter: string): string {
    const root = freshRoot();
    const dir = join(root, "spec", "iterations", name);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "record.md"), `---\nid: ${name}\n${frontmatter}---\n\n# ${name}\n`, "utf8");
    return root;
  }

  test("a started record answers the check met, whatever pends", () => {
    const root = recorded("i-test", "status: open\nstarted: 2026-08-25T13:07:39.976Z\n");

    assert.equal(recordStarted(root, "i-test"), true, "the stamp is read from the record");
  });

  test("a seeded record that never started still faces the check", () => {
    const root = recorded("i-seeded", "status: open\nopened: 2026-08-24T14:43:49.793Z\n");

    assert.equal(recordStarted(root, "i-seeded"), false, "opened is not started");
  });

  test("an empty stamp is not a start", () => {
    const root = recorded("i-blank", "started:\n");

    assert.equal(recordStarted(root, "i-blank"), false, "a key with no value says nothing");
  });

  test("a record nobody can find is not started", () => {
    assert.equal(recordStarted(freshRoot(), "i-absent"), false);
  });

  // THE CHECK ITSELF CONSULTS THE STAMP, and only on the way IN. An exit
  // condition asking the same question would be a different rule.
  test("the entry check consults the stamp", () => {
    const src = engine("session.ts");

    assert.match(
      src,
      /which === "enter" && this\.bound !== undefined && recordStarted\(this\.workRoot\(\), this\.bound\.id\)/,
      "the entry check answers met for a started record",
    );
  });
});

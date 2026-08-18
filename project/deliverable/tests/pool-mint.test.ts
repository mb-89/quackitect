// THE MINT IS THE PRIVACY BOUNDARY, AND THIS FILE IS WHAT HOLDS IT.
//
// tsp-the-mint-crosses-the-boundary. Four requirements, and one of them is the
// only FATAL row in the delta: a raw note may carry anything an agent dumped
// into it, and a rewrite that is really a paste puts that on trunk where
// SE-C-002 means it can never be taken off again.
//
// THE ORACLE IS THE FILE ON DISK, never the return value alone. A mint that
// answers correctly and writes nothing is exactly the failure a return-value
// assertion misses.
//
// EVERY CASE BUILDS ITS OWN ROOT, which is what makes the file concurrent.
import { strict as assert } from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { appendNote, drainNote, readNotes } from "../engine/inbox.ts";
import { seDir } from "../engine/paths.ts";
import { poolDir, standingOptions } from "../engine/pool.ts";
import { freshRoot } from "./helpers.ts";

/** A root with one pending note carrying the text a mint must never copy. */
function rootWithNote(text: string): { root: string; ref: string } {
  const root = freshRoot();
  const { captured } = appendNote(seDir(root), text);
  return { root, ref: captured };
}

const PRIVATE = "the box at /home/somebody/secrets stalls when Fnordwick runs it twice";

/** The drain, as the retro calls it: judgment allowed, pool disposition. */
function mint(root: string, ref: string, statement: string, where: string): ReturnType<typeof drainNote> {
  return drainNote(seDir(root), ref, "backlog", where, true, statement, root);
}

describe("the mint writes what travels", { concurrency: true }, () => {
  test("a drain to the pool writes an option carrying the statement, the condition and its note", () => {
    const { root, ref } = rootWithNote(PRIVATE);
    mint(root, ref, "a repeated run of the box stalls, and nobody knows why", "ready when the box is reproducible");
    const opts = standingOptions(root);
    assert.equal(opts.length, 1, "the pool holds one option after one mint");
    assert.match(opts[0].statement, /repeated run of the box stalls/, "the option does not carry the authored statement");
    assert.match(opts[0].ready_when, /reproducible/, "the option does not carry its re-entry condition");
    assert.equal(opts[0].source, ref, "the option does not name the note it was authored from");
  });

  test("the option is a file under the pool, readable without the note store", () => {
    const { root, ref } = rootWithNote(PRIVATE);
    const res = mint(root, ref, "a repeated run stalls the box", "ready when it reproduces");
    assert.ok(typeof res.minted === "string" && res.minted !== "", "the drain does not say what it minted");
    const dir = poolDir(root);
    assert.ok(existsSync(dir), "the pool directory was never created");
    const body = readFileSync(join(dir, `${res.minted}.md`), "utf8");
    assert.match(body, /a repeated run stalls the box/, "the file does not carry the statement");
  });

  test("the raw note stays on disk, byte for byte, and is marked drained", () => {
    const { root, ref } = rootWithNote(PRIVATE);
    mint(root, ref, "a repeated run stalls the box", "ready when it reproduces");
    const notes = readNotes(seDir(root));
    const note = notes.find((n) => n.ref === ref);
    assert.ok(note !== undefined, "the note was deleted by the mint");
    assert.equal(note.text, PRIVATE, "the note's own text was rewritten by the mint");
    assert.equal(note.drained?.disposition, "backlog", "the note was not marked drained");
  });

  test("nothing the note said reaches the pool", () => {
    const { root, ref } = rootWithNote(PRIVATE);
    mint(root, ref, "a repeated run stalls the box", "ready when it reproduces");
    const body = readFileSync(join(poolDir(root), `${standingOptions(root)[0].id}.md`), "utf8");
    assert.ok(!body.includes("/home/somebody/secrets"), "a path from the note reached the pool");
    assert.ok(!body.includes("Fnordwick"), "a name from the note reached the pool");
  });
});

describe("the mint refuses what would carry the note across", { concurrency: true }, () => {
  test("a statement that appears verbatim in the note is refused, and the refusal quotes it", () => {
    const { root, ref } = rootWithNote(PRIVATE);
    let message = "";
    assert.throws(
      () => mint(root, ref, `noticed: ${PRIVATE}`, "ready when it reproduces"),
      (e: Error) => {
        message = String(e.message);
        return true;
      },
      "a pasted statement was accepted",
    );
    assert.match(message, /stalls when Fnordwick runs it twice/, `the refusal does not quote the overlap back: ${message}`);
  });

  test("a refused mint writes nothing at all", () => {
    const { root, ref } = rootWithNote(PRIVATE);
    try {
      mint(root, ref, `noticed: ${PRIVATE}`, "ready when it reproduces");
    } catch {
      /* the point of the case is what is on disk afterwards */
    }
    assert.equal(standingOptions(root).length, 0, "a refused mint left an option behind");
    assert.equal(readNotes(seDir(root)).find((n) => n.ref === ref)?.drained, undefined, "a refused mint drained the note anyway");
  });

  test("an empty statement is refused", () => {
    const { root, ref } = rootWithNote(PRIVATE);
    assert.throws(() => mint(root, ref, "   ", "ready when it reproduces"), /statement/i, "an empty statement was accepted");
  });

  test("a missing re-entry condition is still refused, as it was before the pool", () => {
    const { root, ref } = rootWithNote(PRIVATE);
    assert.throws(() => mint(root, ref, "a repeated run stalls the box", ""), /ready when/i, "a pool item with no condition was accepted");
  });
});

// A CHECK THAT ONLY EVER REFUSES PASSES ITS OWN TESTS WHILE BEING USELESS.
// These two cases exist to catch an over-strict mint, and without them a mint
// that refused everything would look green.
describe("the mint accepts what an honest author writes", { concurrency: true }, () => {
  test("a statement sharing words with the note is accepted — a run is not a vocabulary", () => {
    const { root, ref } = rootWithNote(PRIVATE);
    mint(root, ref, "the box stalls when it runs twice", "ready when it reproduces");
    assert.equal(standingOptions(root).length, 1, "a statement that merely shares words was refused as a copy");
  });

  test("saying the option cannot be stated cleanly yet is itself a statement", () => {
    const { root, ref } = rootWithNote(PRIVATE);
    mint(root, ref, "this cannot be stated cleanly yet — it needs the owner", "ready when the owner has looked");
    const opts = standingOptions(root);
    assert.equal(opts.length, 1, "an honest open question was refused");
    assert.match(opts[0].statement, /cannot be stated cleanly yet/, "the open question was not kept as written");
  });
});

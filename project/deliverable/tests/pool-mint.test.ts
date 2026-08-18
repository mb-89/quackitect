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
import { fileWrite } from "../engine/files.ts";
import { appendNote, drainNote, readNotes } from "../engine/inbox.ts";
import { seDir } from "../engine/paths.ts";
import { poolDir, standingTokens } from "../engine/pool.ts";
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
  test("a drain to the pool writes a work token carrying the statement, the condition and its note", () => {
    const { root, ref } = rootWithNote(PRIVATE);
    mint(root, ref, "a repeated run of the box stalls, and nobody knows why", "ready when the box is reproducible");
    const opts = standingTokens(root);
    assert.equal(opts.length, 1, "the pool holds one work token after one mint");
    assert.match(opts[0].statement, /repeated run of the box stalls/, "the work token does not carry the authored statement");
    assert.match(opts[0].ready_when, /reproducible/, "the work token does not carry its re-entry condition");
    assert.equal(opts[0].source, ref, "the work token does not name the note it was authored from");
  });

  test("the work token is a file under the pool, readable without the note store", () => {
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
    const body = readFileSync(join(poolDir(root), `${standingTokens(root)[0].id}.md`), "utf8");
    assert.ok(!body.includes("/home/somebody/secrets"), "a path from the note reached the pool");
    assert.ok(!body.includes("Fnordwick"), "a name from the note reached the pool");
  });
});

// A NOTE CARRYING NO ADDRESS, PATH OR SECRET, so the run check is what fires
// and the case can assert what it quotes back.
const WORDY = "the box stalls badly whenever somebody starts it a second time in a row";

describe("the mint refuses what would carry the note across", { concurrency: true }, () => {
  test("a statement that appears verbatim in the note is refused, and the refusal quotes it", () => {
    const { root, ref } = rootWithNote(WORDY);
    let message = "";
    assert.throws(
      () => mint(root, ref, `noticed: ${WORDY}`, "ready when it reproduces"),
      (e: Error) => {
        message = String(e.message);
        return true;
      },
      "a pasted statement was accepted",
    );
    assert.match(message, /stalls badly whenever somebody starts it/, `the refusal does not quote the overlap back: ${message}`);
  });

  // FOUND BY i17's OWN VERIFICATION. A run of six words cannot reach a secret
  // that is ONE word, and that is the ordinary shape of a leak rather than an
  // adversarial one: an author who writes "reach out to maria@example.com" has
  // copied nothing and leaked everything.
  test("a single shared identifier is refused, though no run of words is shared", () => {
    const { root, ref } = rootWithNote(PRIVATE);
    const carried = "somebody should look at /home/somebody/secrets when there is time";
    assert.throws(() => mint(root, ref, carried, "ready when it reproduces"), /carried straight from the note/, `accepted: ${carried}`);
  });

  // THE LIMIT, PINNED AS A FACT RATHER THAN LEFT TO BE REDISCOVERED. A person's
  // NAME is an ordinary word of ordinary length with no separator in it, and
  // nothing distinguishes it from any other word. Lowering the opaque-token
  // threshold far enough to catch it would flag every long word in the
  // language, which is a check nobody would keep.
  //
  // SO A NAME TRAVELS IF AN AUTHOR WRITES ONE, and the only thing standing
  // against that is the author. Recorded on
  // raid-asm-a-verbatim-overlap-check-catches-the-paste-that-matters.
  test("a bare name is NOT caught, and this case exists to say so out loud", () => {
    const { root, ref } = rootWithNote(PRIVATE);
    mint(root, ref, "worth asking Fnordwick about this before anybody else decides", "ready when somebody asks");
    assert.equal(standingTokens(root).length, 1, "the fixture no longer demonstrates the limit this case documents");
  });

  // THE DESIGN SPEC SAID whitespace and case were flattened and the code only
  // split on whitespace, so a hyphen for a space carried the note through
  // verbatim. Same words, same order, different punctuation.
  test("punctuation substituted for spaces does not carry a paste through", () => {
    const { root, ref } = rootWithNote(WORDY);
    assert.throws(
      () => mint(root, ref, WORDY.split(" ").join("-"), "ready when it reproduces"),
      /carried straight from the note/,
      "hyphens for spaces walked the note's own text onto trunk",
    );
  });

  test("a refused mint writes nothing at all", () => {
    const { root, ref } = rootWithNote(PRIVATE);
    try {
      mint(root, ref, `noticed: ${PRIVATE}`, "ready when it reproduces");
    } catch {
      /* the point of the case is what is on disk afterwards */
    }
    assert.equal(standingTokens(root).length, 0, "a refused mint left a work token behind");
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
    assert.equal(standingTokens(root).length, 1, "a statement that merely shares words was refused as a copy");
  });

  test("saying the work token cannot be stated cleanly yet is itself a statement", () => {
    const { root, ref } = rootWithNote(PRIVATE);
    mint(root, ref, "this cannot be stated cleanly yet — it needs the owner", "ready when the owner has looked");
    const opts = standingTokens(root);
    assert.equal(opts.length, 1, "an honest open question was refused");
    assert.match(opts[0].statement, /cannot be stated cleanly yet/, "the open question was not kept as written");
  });
});

// ONE DOOR, AND THIS IS THE CASE THAT MAKES IT A FACT.
//
// i17's verification landed a fabricated work token carrying a third party's
// name onto trunk through `se_file_write`, in one call, with no statement
// check, no SE-C-140 and no note behind it. The whole privacy boundary, gone
// round by the lane's own general writer.
//
// THE INSPECTION SPEC ASKED FOR EXACTLY THIS and could not prove it: only
// reading proves a second path does not exist. What a test CAN prove is that
// the doors it knows about are shut, so it shuts them.
describe("the pool has one door", { concurrency: true }, () => {
  test("the file lane refuses a direct write into the pool, and names the mint", () => {
    const root = freshRoot();
    let message = "";
    let remedy = "";
    assert.throws(
      () =>
        fileWrite(
          root,
          "project/spec/trace/work-token/wt-a-back-door.md",
          '---\nid: wt-a-back-door\nstatement: "anything at all"\n---\n',
          null,
        ),
      (e: Error) => {
        message = String(e.message);
        remedy = (e as { remedy?: { tool?: string } }).remedy?.tool ?? "";
        return true;
      },
      "the file lane wrote a work token with none of the mint's demands",
    );
    assert.match(message, /one door/, `the refusal does not say why: ${message}`);
    assert.equal(remedy, "se_note_drain", "the refusal does not hand back the way in");
    assert.equal(standingTokens(root).length, 0, "a refused back-door write left a token behind");
  });

  test("the guard is about the pool and nothing else", () => {
    const root = freshRoot();
    const ok = fileWrite(root, "project/spec/trace/raid/raid-asm-an-ordinary-node.md", "---\nid: raid-asm-an-ordinary-node\n---\n", null);
    assert.equal(ok.created, true, "the guard refused a write that has nothing to do with the pool");
  });
});

// A NOTE ALREADY IN THE POOL DOES NOT MINT A SECOND TOKEN. Re-draining stays
// the migration mechanism for every other disposition; what is refused is
// splitting one finding into two standing items whose conditions then disagree.
describe("a finding is minted once", { concurrency: true }, () => {
  test("draining the same note to the pool twice is refused, and points at carried", () => {
    const { root, ref } = rootWithNote(WORDY);
    mint(root, ref, "the box needs a second look under load", "ready when somebody can reproduce it");
    let message = "";
    assert.throws(
      () => mint(root, ref, "the box needs a third look under load", "ready when anything changes"),
      (e: Error) => {
        message = String(e.message);
        return true;
      },
      "one note minted two tokens",
    );
    assert.match(message, /already in the pool|carried/, `the refusal does not say what to do instead: ${message}`);
    assert.equal(standingTokens(root).length, 1, "a second token stands for one finding");
  });
});

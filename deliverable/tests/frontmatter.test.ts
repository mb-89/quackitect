// THE WRITER FORMATS, IT DOES NOT SPLICE.
//
// The property that matters is a round trip: reprinting a note's frontmatter
// must not change what it MEANS, on every note in the vault, not on a fixture.
// Everything else here is a consequence of that.
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { coerce, formatNote, kindOf, readKeys, setKeys, splitNote } from "../engine/frontmatter.ts";
import { parseStateNote } from "../engine/notes.ts";
import { readVault } from "../engine/tables.ts";
import { refusalChecked } from "./helpers.ts";

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));
const WHERE = "a-note.md";

const NOTE = ["---", "id: one", "depends_on:", "  - a", "  - b", "count: 3", "open: true", "---", "", "# A note", "", "body text", ""].join(
  "\n",
);

describe("splitting a note", { concurrency: true }, () => {
  test("the body is everything past the closing fence", () => {
    const s = splitNote(NOTE);
    assert.equal(s.fenced, true);
    assert.match(s.body, /# A note/);
    assert.doesNotMatch(s.head, /# A note/);
  });

  test("a note with no frontmatter is all body", () => {
    const s = splitNote("# just a heading\n");
    assert.equal(s.fenced, false);
    assert.equal(s.body, "# just a heading\n");
  });

  test("an unterminated fence is not frontmatter", () => {
    assert.equal(splitNote("---\nid: one\n\n# heading\n").fenced, false);
  });
});

describe("writing a key", { concurrency: true }, () => {
  // THE CASE THE SPLICE COULD NOT DO. 150 of 1,219 real key edits in this repo
  // are list-valued, and they are 100% of depends_on and 100% of evidence.
  test("a list key is written, which is the whole reason this exists", () => {
    const out = setKeys(NOTE, { depends_on: ["x", "y", "z"] }, WHERE);
    assert.deepEqual(readKeys(out, WHERE).depends_on, ["x", "y", "z"]);
    assert.match(out, /# A note/, "and the body is still there");
  });

  test("the body survives byte for byte", () => {
    const out = setKeys(NOTE, { id: "two" }, WHERE);
    assert.equal(splitNote(out).body, splitNote(NOTE).body);
  });

  test("key order is kept, and a new key lands at the end", () => {
    const out = setKeys(NOTE, { count: 9, extra: "new" }, WHERE);
    assert.deepEqual(Object.keys(readKeys(out, WHERE)), ["id", "depends_on", "count", "open", "extra"]);
  });

  test("undefined REMOVES a key, which is how a property is cleared", () => {
    const out = setKeys(NOTE, { count: undefined }, WHERE);
    assert.equal("count" in readKeys(out, WHERE), false);
    assert.equal(readKeys(out, WHERE).id, "one");
  });

  test("an emptied block keeps its fences", () => {
    const out = setKeys(NOTE, { id: undefined, depends_on: undefined, count: undefined, open: undefined }, WHERE);
    assert.equal(splitNote(out).fenced, true, "a note that silently lost its fences reads as a different kind of file");
    assert.deepEqual(readKeys(out, WHERE), {});
  });

  // A folded scalar would reflow every long statement in the vault the first
  // time any unrelated key on that note was touched.
  test("a long value is never folded across lines", () => {
    const long = "x".repeat(400);
    const out = setKeys(NOTE, { statement: long }, WHERE);
    assert.equal(readKeys(out, WHERE).statement, long);
    assert.ok(
      out.split("\n").some((l) => l.includes(long)),
      "the value stays on one line",
    );
  });

  test("a note's own line ending is not changed under it", () => {
    const crlf = NOTE.split("\n").join("\r\n");
    const out = setKeys(crlf, { id: "two" }, WHERE);
    assert.ok(out.includes("\r\n"), "CRLF in, CRLF out");
    assert.doesNotMatch(out.replace(/\r\n/g, ""), /\n/, "and no bare LF is introduced");
  });

  test("frontmatter that does not parse refuses rather than being rewritten", () => {
    assert.match(refusalChecked(() => readKeys("---\nid: [unclosed\n---\nbody\n", WHERE)).got, /a-note\.md/);
    assert.match(refusalChecked(() => readKeys("---\n- a\n- b\n---\n", WHERE)).got, /a list/);
  });
});

describe("what a typed cell accepts", { concurrency: true }, () => {
  test("the previous value decides the type, not the text", () => {
    assert.deepEqual(coerce(["a"], "x, y ,z"), ["x", "y", "z"]);
    assert.equal(coerce(3, "42"), 42);
    assert.equal(coerce(true, "no"), false);
    assert.equal(coerce("draft", "final"), "final");
  });

  // Guessing a type from the shape of the text is how "1.0" becomes 1.
  test("with no previous value the answer is a string", () => {
    assert.equal(coerce(undefined, "1.0"), "1.0");
    assert.equal(coerce(null, "true"), "true");
  });

  test("emptying clears the key, and an empty list is a list", () => {
    assert.equal(coerce("draft", "   "), undefined);
    assert.deepEqual(coerce(["a"], ""), []);
  });

  test("a wrong type refuses instead of writing nonsense", () => {
    assert.match(refusalChecked(() => coerce(3, "seven")).expected, /number/);
    assert.match(refusalChecked(() => coerce(false, "maybe")).expected, /yes or no/);
    assert.match(refusalChecked(() => coerce({ a: 1 }, "x")).got, /nested/);
  });

  test("the kind is read off the value, which is what picks the editor", () => {
    assert.equal(kindOf(["a"]), "list");
    assert.equal(kindOf(3), "number");
    assert.equal(kindOf(true), "boolean");
    assert.equal(kindOf("s"), "text");
    assert.equal(kindOf({ a: 1 }), "nested");
    assert.equal(kindOf(undefined), "text");
  });
});

// THE ONE THAT MATTERS. Reprinting must preserve MEANING on every real note,
// and the body must come through untouched. Run against the vault rather than
// a fixture, because the fixtures are the cases somebody already thought of.
describe("the whole vault round-trips", { concurrency: true }, () => {
  test("reprinting changes no note's data and no note's body", () => {
    const rows = readVault(REPO_ROOT);
    const paths = rows.map((r) => `${REPO_ROOT}/${(r.file as { path: string }).path}`);
    let fenced = 0;
    for (const abs of paths) {
      const raw = readFileSync(abs, "utf8");
      if (!splitNote(raw).fenced) continue;
      fenced++;
      const out = formatNote(raw, abs);
      assert.deepEqual(readKeys(out, abs), readKeys(raw, abs), `${abs} means something different after reprinting`);
      assert.equal(parseStateNote(out).body, parseStateNote(raw).body, `${abs} lost or gained body text`);
    }
    assert.ok(fenced > 100, `the vault has frontmatter to check — found ${fenced} blocks`);
  });

  // Not a requirement, but worth knowing and worth failing loudly on: if the
  // formatter disagreed with the authored style on most notes, the first real
  // edit would land in a diff nobody could read.
  test("the formatter already agrees with most of what is authored", () => {
    const rows = readVault(REPO_ROOT);
    let checked = 0;
    let changed = 0;
    for (const r of rows) {
      const abs = `${REPO_ROOT}/${(r.file as { path: string }).path}`;
      const raw = readFileSync(abs, "utf8");
      if (!splitNote(raw).fenced) continue;
      checked++;
      if (formatNote(raw, abs) !== raw) changed++;
    }
    assert.ok(changed / checked < 0.5, `${changed} of ${checked} notes would be reformatted — that is too much churn to read`);
  });
});

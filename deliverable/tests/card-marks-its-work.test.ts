// see dsp-marking-a-card.md#behavior-and-constraints
//
// The failure this file exists to catch is silent in BOTH directions. A
// compiler that infers from shape either mints work nobody owes, or folds
// several acts into one, and the card looks identical either way. So the
// positive and negative cases are separate, never one combined check.
import { strict as assert } from "node:assert";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { cardWork, stampCard } from "../engine/cardwork.ts";

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));
const METHODS = join(REPO_ROOT, "deliverable", "machines", "methods");

describe("a card marks its own work", { concurrency: true }, () => {
  test("a marked heading yields one piece of work", () => {
    const work = cardWork(["## Sweep the claims #work", "", "Look at every claim first.", ""].join("\n"));
    assert.equal(work.length, 1);
    assert.equal(work[0].title, "Sweep the claims");
    assert.equal(work[0].shape, "heading");
    assert.equal(work[0].body, "Look at every claim first.");
  });

  test("a heading's body runs to the next heading of the same level or higher", () => {
    const work = cardWork(
      [
        "## First #work",
        "one",
        "### A subsection that belongs to the first",
        "two",
        "## Second #work",
        "three",
        "# A top-level heading ends it",
        "four",
      ].join("\n"),
    );
    assert.deepEqual(
      work.map((w) => w.title),
      ["First", "Second"],
    );
    assert.match(work[0].body, /A subsection that belongs to the first/);
    assert.doesNotMatch(work[0].body, /three/);
    assert.equal(work[1].body, "three");
  });

  test("a marked top-level list item yields one piece of work, indented block included", () => {
    const work = cardWork(
      [
        "## Steps",
        "",
        "1. Open the record #work",
        "   Read what it says.",
        "",
        "   Then answer it.",
        "2. Close it #work",
        "   Stamp it.",
        "",
      ].join("\n"),
    );
    assert.deepEqual(
      work.map((w) => w.title),
      ["Open the record", "Close it"],
    );
    assert.equal(work[0].shape, "item");
    assert.match(work[0].body, /Read what it says\./);
    assert.match(work[0].body, /Then answer it\./);
    assert.doesNotMatch(work[0].body, /Stamp it\./);
  });

  test("a bulleted top-level item marks the same as a numbered one", () => {
    const work = cardWork(["- Do the thing #work", "* And this one #work", "+ And this #work"].join("\n"));
    assert.equal(work.length, 3);
    for (const w of work) assert.equal(w.shape, "item");
  });

  test("an unmarked heading yields nothing, whatever it contains", () => {
    const work = cardWork(
      ["## Rationale", "Why we chose this.", "## Rejected options", "What we did not do.", "## Do the work #work", "The one act."].join(
        "\n",
      ),
    );
    assert.deepEqual(
      work.map((w) => w.title),
      ["Do the work"],
    );
  });

  test("a card with no marks yields an empty set", () => {
    const work = cardWork(["# A whole card", "## One", "text", "## Two", "text", "### Three", "text"].join("\n"));
    assert.deepEqual(work, []);
  });

  test("depth does not decide — one hash, two and three give the same work", () => {
    const at = (hashes: string) => cardWork([`${hashes} A #work`, "a", `${hashes} B #work`, "b", `${hashes} C #work`, "c"].join("\n"));
    const one = at("#");
    const two = at("##");
    const three = at("###");
    assert.deepEqual(
      one.map((w) => w.title),
      ["A", "B", "C"],
    );
    assert.deepEqual(
      one.map((w) => w.title),
      two.map((w) => w.title),
    );
    assert.deepEqual(
      two.map((w) => w.title),
      three.map((w) => w.title),
    );
    assert.deepEqual(
      one.map((w) => w.body),
      three.map((w) => w.body),
    );
  });

  test("mixed depths in one card each yield their own piece", () => {
    const work = cardWork(["# Top #work", "a", "## Middle #work", "b", "### Deep #work", "c", "- An item #work", "d"].join("\n"));
    assert.deepEqual(
      work.map((w) => w.title),
      ["Top", "Middle", "Deep", "An item"],
    );
  });

  test("a mark inside ordinary prose is not a mark", () => {
    const work = cardWork(
      ["## A heading", "This paragraph mentions #work in the middle of a sentence.", "", "So does #work here."].join("\n"),
    );
    assert.deepEqual(work, []);
  });

  test("a mark inside a fenced block is not a mark, and neither is a hash inside one", () => {
    const work = cardWork(["## Real #work", "```sh", "# not a heading #work", "- not an item #work", "```", "after"].join("\n"));
    assert.deepEqual(
      work.map((w) => w.title),
      ["Real"],
    );
  });

  test("the mark must be a whole tag, never a prefix of a longer word", () => {
    const work = cardWork(["## Not this #workshop", "a", "## Nor this #working", "b", "## But this #work", "c"].join("\n"));
    assert.deepEqual(
      work.map((w) => w.title),
      ["But this"],
    );
  });

  test("a nested list item is not a top-level one", () => {
    const work = cardWork(["- Top #work", "  - Nested #work", "    text"].join("\n"));
    assert.deepEqual(
      work.map((w) => w.title),
      ["Top"],
    );
  });

  test("each piece carries the line it opens on, one-indexed", () => {
    const work = cardWork(["intro", "## One #work", "a", "## Two #work", "b"].join("\n"));
    assert.deepEqual(
      work.map((w) => w.line),
      [2, 4],
    );
  });

  test("a slug is stable, and a repeated title still gets its own", () => {
    const work = cardWork(["## Answer it #work", "a", "## Answer it #work", "b"].join("\n"));
    assert.deepEqual(
      work.map((w) => w.slug),
      ["answer-it", "answer-it-2"],
    );
    const again = cardWork(["## Answer it #work", "a", "## Answer it #work", "b"].join("\n"));
    assert.deepEqual(
      work.map((w) => w.slug),
      again.map((w) => w.slug),
    );
  });

  test("a stamped mark carries the step's identity and the title is still clean", () => {
    const work = cardWork(["## Elements #work/elements", "a"].join("\n"));
    assert.equal(work.length, 1);
    assert.equal(work[0].step, "elements");
    assert.equal(work[0].title, "Elements");
  });

  test("an unstamped mark carries no step identity", () => {
    assert.equal(cardWork(["## Elements #work", "a"].join("\n"))[0].step, "");
  });

  test("stamping is idempotent", () => {
    const once = stampCard(["## Elements #work", "a"].join("\n"));
    assert.equal(once.stamped, 1);
    assert.match(once.text, /#work\/elements/);
    const twice = stampCard(once.text);
    assert.equal(twice.stamped, 0);
    assert.equal(twice.text, once.text);
  });

  // THE WHOLE POINT OF THE STAMP. see dsp-the-work-store.md#the-identity-lives-in-the-card-not-in-the-text
  test("a stamped identity outlives a rewording of its own heading", () => {
    const stamped = stampCard(["## Elements #work", "a"].join("\n")).text;
    const reworded = stamped.replace("## Elements", "## Naming the elements");
    const work = cardWork(reworded);
    assert.equal(work[0].step, "elements");
    assert.equal(work[0].title, "Naming the elements");
    assert.notEqual(work[0].slug, work[0].step, "the slug moved and the identity did not");
  });

  test("a stamped tag is still not a prefix match", () => {
    const work = cardWork(["## No #workshop/elements", "a", "## Yes #work/x", "b"].join("\n"));
    assert.deepEqual(
      work.map((w) => w.title),
      ["Yes"],
    );
  });

  test("the card's own id comes off its frontmatter", () => {
    const work = cardWork(["---", "id: meth-do-a-thing", "type: method", "---", "", "## Step #work", "a"].join("\n"));
    assert.equal(work[0].card, "meth-do-a-thing");
  });

  // THE SAFETY PROPERTY, measured against the real corpus rather than asserted.
  //
  // A CARD CARRYING NO MARK MUST REPORT ZERO WORK rather than falling back to
  // inference. This is what would catch a compiler that quietly starts guessing
  // from heading depth.
  //
  // THE DETECTOR HAS TO KNOW THE STAMPED FORM. Minting writes an identity into
  // the mark, so `#work` becomes `#work/<slug>` the first time a state derives
  // work from the card. A detector matching only the bare tag then reads a
  // stamped card as unmarked, and the case fails on a card that is marked and
  // working correctly. It fired for real once 73 of the 74 cards were stamped.
  const CARRIES_A_MARK = /(?:^|\s)#work(?:\/[A-Za-z0-9_-]+)?(?![\w-])/;

  test("a card carrying no mark yields no work", () => {
    const cards = readdirSync(METHODS).filter((f) => f.endsWith(".md"));
    assert.ok(cards.length > 0, "the methods folder must hold cards");
    const text = (f: string): string => readFileSync(join(METHODS, f), "utf8");
    const bare = cards.filter((f) => !CARRIES_A_MARK.test(text(f)));
    assert.deepEqual(
      bare.filter((f) => cardWork(text(f)).length > 0),
      [],
      "a card carrying no mark reported work anyway",
    );
    // AND THE PROPERTY IS PROVEN ON A FIXTURE, never on whichever real card
    // happens to be bare. A fully marked corpus leaves the list above empty, and
    // an empty list passes forever while proving nothing about the compiler.
    assert.deepEqual(cardWork("---\nkind: method\n---\n\n## A heading nobody marked\n\nProse, and no act in it.\n"), []);
  });

  // AND THE OTHER HALF, which the spec asked for and the file never had. A case
  // that only ever proves the empty direction passes forever once the corpus
  // stops changing, and says nothing about whether the compiler still reads.
  test("a card carrying a mark yields exactly what it marked", () => {
    const cards = readdirSync(METHODS).filter((f) => f.endsWith(".md"));
    const text = (f: string): string => readFileSync(join(METHODS, f), "utf8");
    const marked = cards.filter((f) => CARRIES_A_MARK.test(text(f)));
    assert.ok(marked.length > 50, `the corpus is marked: ${marked.length} of ${cards.length}`);
    assert.deepEqual(
      marked.filter((f) => cardWork(text(f)).length === 0),
      [],
      "a mark that yields nothing is a mark the compiler cannot read",
    );
  });
});

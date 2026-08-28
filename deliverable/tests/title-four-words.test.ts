// A TOKEN NAMES ITS WORK IN FOUR WORDS. It does not describe it.
//
// The bar draws the work in hand beside the position, and a sentence there is
// unreadable at a glance — which is the one thing that chip exists for.
//
// see dsp-the-work-store.md#the-title-is-four-words
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { refuseLongTitle, TITLE_WORDS, titleWords } from "../engine/workstore.ts";
import { refusal } from "./helpers.ts";

/** The verb under test, as a thunk, so the shared catcher can run it. */
const titling = (said: string) => () => {
  refuseLongTitle(said, "open");
};

describe("a token's title is four words", { concurrency: true }, () => {
  test("four words pass and five do not", () => {
    assert.doesNotThrow(titling("fix the leaving guard"), "four words is the whole allowance, not one under it");
    assert.equal(refusal(titling("fix the leaving guard now")).toJSON().clause, "SE-C-153", "a fifth word is refused");
  });

  // EVERY SEPARATOR COUNTS AS A SPACE. Joining words together to fit is the
  // workaround the count exists to close rather than to catch.
  test("an underscore, a dash, a slash and a colon are all word breaks", () => {
    for (const joined of [
      "fix_the_leaving_guard_now",
      "fix-the-leaving-guard-now",
      "fix/the/leaving/guard/now",
      "fix:the:leaving:guard:now",
    ]) {
      assert.equal(refusal(titling(joined)).toJSON().clause, "SE-C-153", `${joined} should not fit five words into four`);
    }
  });

  // NOTHING IS THROWN AWAY. The first four words become the name and the whole
  // line becomes the detail, so the remedy is one call and loses no words.
  test("the refusal hands back four words, a slash, and the rest as detail", () => {
    const long = "a token names its work rather than describing it";
    const said = refusal(titling(long)).toJSON() as { clause?: string; remedy?: { tool?: string; args?: { comment?: string } } };
    assert.equal(said.clause, "SE-C-153");
    assert.equal(said.remedy?.tool, "se_work");
    assert.equal(
      said.remedy?.args?.comment,
      `a token names its / ${long}`,
      "the remedy is runnable, and it carries the detail rather than dropping it",
    );
  });

  test("the refusal says how many words it counted", () => {
    const said = refusal(titling("one two three four five six")).toJSON() as { got?: string };
    assert.match(String(said.got), /6 words/, "a count a reader can check beats an adjective");
  });

  // THE COUNT IS THE ONE A READER MAKES. Punctuation is not a word, and an
  // empty title is a different fault with its own refusal.
  test("the words are what a reader would count", () => {
    assert.deepEqual(titleWords("fix the leaving guard"), ["fix", "the", "leaving", "guard"]);
    assert.deepEqual(titleWords("  spaced   out  "), ["spaced", "out"]);
    assert.deepEqual(titleWords("—"), []);
    assert.equal(TITLE_WORDS, 4);
  });
});

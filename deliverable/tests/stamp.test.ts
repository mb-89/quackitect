// THE STAMP MUST LAND ON A KEY THAT IS PRESENT AND EMPTY. Found live on
// 2026-08-06: a form whose frontmatter carried `signed_off:` with nothing
// after it could be submitted, report met with no problems, and still come
// back unsigned. The writer matched "signed_off: " — colon SPACE — so an empty
// value hit neither branch, and the anchor appended a SECOND key. The parser
// read the first one, which was empty, and the stamp was invisible in a file
// that plainly contained it.
//
// It is not an exotic shape. Every hand-written form and every minted one
// starts that way.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { stripSignedOff, withBy, withSignedOff } from "../engine/forms.ts";

const empty = ["---", "form: write-stories", "by:", "signed_off:", "authors: agent", "---", "", "# body"].join("\n");
const filled = ["---", "form: write-stories", "by: agent", "signed_off: 2026-01-01T00:00:00.000Z", "---", "", "# body"].join("\n");

describe("the sign-off stamp", { concurrency: true }, () => {
  test("an empty signed_off is REPLACED, never joined by a second key", () => {
    const out = withSignedOff(empty, "2026-08-06T10:00:00.000Z");
    const keys = out.split("\n").filter((l) => l.startsWith("signed_off:"));
    assert.equal(keys.length, 1, "one key, not two");
    assert.equal(keys[0], "signed_off: 2026-08-06T10:00:00.000Z");
  });

  test("a filled signed_off is replaced too, so re-attesting moves the date", () => {
    const out = withSignedOff(filled, "2026-08-06T10:00:00.000Z");
    const keys = out.split("\n").filter((l) => l.startsWith("signed_off:"));
    assert.equal(keys.length, 1);
    assert.equal(keys[0], "signed_off: 2026-08-06T10:00:00.000Z");
  });

  test("a form with no signed_off key at all still gets one", () => {
    const none = ["---", "form: write-stories", "---", "", "# body"].join("\n");
    const out = withSignedOff(none, "2026-08-06T10:00:00.000Z");
    assert.equal(out.split("\n").filter((l) => l.startsWith("signed_off:")).length, 1);
  });

  test("an empty `by` is replaced rather than duplicated", () => {
    const out = withBy(empty, "agent");
    const keys = out.split("\n").filter((l) => l.startsWith("by:"));
    assert.equal(keys.length, 1, "one key, not two");
    assert.equal(keys[0], "by: agent");
  });

  test("stripping takes an empty key off as readily as a filled one", () => {
    // Otherwise an empty key survives the strip and defeats the next stamp,
    // which is how the defect stayed alive across four attempts.
    assert.ok(!stripSignedOff(empty).includes("signed_off"), "the empty key goes");
    assert.ok(!stripSignedOff(empty).includes("by:"), "so does the empty by");
    assert.ok(!stripSignedOff(filled).includes("signed_off"), "and the filled one still goes");
  });

  test("stamping an empty key and stripping it again returns the frontmatter it started with", () => {
    const round = stripSignedOff(withSignedOff(withBy(empty, "agent"), "2026-08-06T10:00:00.000Z"));
    assert.ok(!round.includes("signed_off"), "no stamp survives the strip");
    assert.ok(round.includes("form: write-stories"), "and the rest of the form is untouched");
  });
});

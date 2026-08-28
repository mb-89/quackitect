// THE SURFACE PRINTS ITS HOPS, not `[object Object]` ten times over.
//
// A hop is an object and the printer handed it to String(). The heading stayed,
// so the surface looked like a walk with no history rather than like a printer
// that could not read one.
//
// see dsp-mirror-render.md#the-surface-prints-a-hop-rather-than-its-shape
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { mirrorText } from "../engine/mirrortext.ts";
import { Session } from "../engine/session.ts";
import { freshRoot, gitInit } from "./helpers.ts";

/** The module's own source. Reading it is how the cases above check that the
 *  decider is ASKED rather than re-implemented: a behavioural assertion would
 *  need a state that is both signed and owed, which a freshly opened iteration
 *  cannot have. */
function mirrorTextSource(): string {
  return readFileSync(new URL("../engine/mirrortext.ts", import.meta.url), "utf8");
}

// THE TEXT SURFACE ASKS THE ONE PAINT DECIDER, rather than reading a set and
// deciding for itself. It used to read the walk's own `done` set, so every rule
// the decider learned was invisible here — suspect, and the refusal over owed
// work.
// see dsp-mirror-render.md#green-is-refused-over-owed-work
describe("the text surface and the picture agree about a colour", () => {
  test("the words it can print are the decider's own classes, and nothing else", () => {
    const classes = ["state active", "state suspect", "state owed", "state done", "state done proven"];
    const src = mirrorTextSource();

    for (const cls of classes) assert.ok(src.includes(`"${cls}"`), `${cls} has a word of its own`);
  });

  test("it reads the record-backed set, never the live run's", () => {
    const src = mirrorTextSource();

    assert.ok(src.includes('paint: grab("paint")'), "paint is the set it hands the decider");
    assert.ok(!src.includes('grab("done")'), "and the live run's set is not read at all");
  });

  test("a class the table does not name prints itself rather than nothing", () => {
    // A blank would hide a decider that grew a case this surface was never
    // told about, which is exactly how the last one went unnoticed.
    assert.ok(mirrorTextSource().includes("WORD[cls] ?? cls"));
  });
});

describe("the surface prints its last hops", () => {
  test("no hop reads as the shape of a hop", async () => {
    const root = freshRoot();
    gitInit(root, true);
    const session = new Session(root);
    // ENOUGH HOPS TO FILL THE LIST. Boot walks several states, and each one
    // leaves a history entry behind it.
    for (let i = 0; i < 3; i++) await session.advance();

    const text = mirrorText({ session, root, lastPacket: undefined, mode: "manual" });

    assert.ok(!text.includes("[object Object]"), "a hop is printed by its fields, never by its shape");
  });

  test("a hop names the state it left and how it left", async () => {
    const root = freshRoot();
    gitInit(root, true);
    const session = new Session(root);
    for (let i = 0; i < 3; i++) await session.advance();

    const text = mirrorText({ session, root, lastPacket: undefined, mode: "manual" });
    const hops = text.slice(text.indexOf("## Last hops"));

    assert.match(hops, /— filled/, "the outcome rides the line");
    assert.match(hops, /at \d\d:\d\d/, "and the clock time, so a reader can tell how long ago");
  });
});

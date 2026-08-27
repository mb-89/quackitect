// THE AGENT PULLS AND IS GIVEN. It never asks what work is available, and
// there is no list anywhere to read — what a token is doing is deduced from
// where it stands and what status it carries.
//
// TWO BEATS IN ONE STATE. The input comes first; once it is settled, the output
// tokens are what can be started, and a nudge says the agent may open its own.
//
// see dsp-walk-machine.md#the-pull-hands-the-work-that-can-be-started
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const src = (): string => readFileSync(fileURLToPath(new URL("../engine/session.ts", import.meta.url)), "utf8");

const body = (): string => /private workToStart\([\s\S]*?\n {2}\}/.exec(src())?.[0] ?? "";

describe("the pull hands back the work that can be started", { concurrency: true }, () => {
  test("the do answer carries it, so nothing has to be looked up", () => {
    assert.match(src(), /here: this\.pullHere\(\),[\s\S]{0,200}this\.workToStart\(\)/, "the work rides the same answer as the position");
  });

  test("the input comes first, and the output waits for it", () => {
    const b = body();
    assert.notEqual(b, "", "one function decides what can be started");
    assert.match(b, /i\.source === "reading"/, "the input is the reading");
    assert.match(b, /if \(input\.length > 0\) return \{ input:/, "with input owed, nothing else is offered yet");
  });

  // THE NUDGE RIDES THE SECOND BEAT AND NOWHERE ELSE. Before the input is read,
  // an agent opening its own tokens is guessing.
  test("the nudge to open your own arrives with the output, never with the input", () => {
    const b = body();
    const beat = b.slice(b.indexOf("if (input.length > 0)"));
    assert.match(beat, /to_start:/, "the second beat hands the output tokens");
    assert.match(beat, /se_work \{act: "open"/, "and says the agent may open its own");
    const first = b.slice(0, b.indexOf("if (input.length > 0)"));
    assert.doesNotMatch(first, /act: "open"/, "the nudge must not ride the input beat");
  });

  test("pending is not offered, and neither is drawn work", () => {
    const b = body();
    assert.match(b, /i\.slot !== "pending"/, "pending does not block and is not owed here");
    assert.match(b, /!isDrawn\(i\.id\)/, "a note has no file and ends by its own verb");
  });

  test("a token offered says what it is and who holds it", () => {
    const b = body();
    assert.match(b, /statement: i\.statement/, "an id does not travel; the words do");
    assert.match(b, /taken_by: i\.taken_by/, "and a hand already on one is named");
  });
});

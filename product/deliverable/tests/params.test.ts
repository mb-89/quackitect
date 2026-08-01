// THE PANEL IS A SPEC, NOT MARKUP.
//
// The failure this guards is specific and it happened twice in one session:
// the assistant redrew a control bar from a sketch and got the widgets wrong
// both times. A spec that only admits declared types cannot make that
// mistake — the drawing decides, and an unlisted widget refuses.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { Rejection } from "../engine/errors.ts";
import { loadPanel, parsePanel, renderPanel } from "../engine/params.ts";

const REPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

const VALUES = {
  rungs: [
    { value: 0, abbr: "B", name: "blocked" },
    { value: 0.01, abbr: "M", name: "mechanical" },
    { value: 0.2, abbr: "O", name: "operational" },
    { value: 1, abbr: "I", name: "ideation" },
  ],
  autonomy: 0.2,
  ints: { narration_minutes: 5, narration_calls: 20 },
};

describe("parameter panels", { concurrency: true }, () => {
  test("the shipped control bar is read from its spec, not from code", () => {
    const params = loadPanel(REPO_ROOT, "controls");
    assert.ok(params.length >= 4, "the panel declares its parameters");
    assert.deepEqual(params.map((p) => p.type), ["rungs", "int", "int", "action"]);
    const html = renderPanel(params, VALUES);
    assert.match(html, /class="rung on" data-level="0"/, "the lowest lit rung releases to blocked");
    assert.match(html, /id="narration-minutes"[^>]*value="5"/);
    assert.match(html, /id="narration-calls"[^>]*value="20"/);
    assert.match(html, /class="rung param-action" data-post="\/narration-now"/);
    assert.doesNotMatch(html, /type="range"/, "a spec cannot produce a slider");
  });

  // THE LOAD-BEARING GUARANTEE. Skipping an unknown type quietly would let a
  // spec claim a control the surface never drew, which is worse than the
  // hand-written markup this replaces.
  test("an undeclared widget type REFUSES rather than being skipped", () => {
    const rogue = parsePanel("## Parameters\n- danger | slider | whatever | a control nobody declared\n");
    assert.equal(rogue.length, 1);
    assert.throws(
      () => renderPanel(rogue, VALUES),
      (e) => e instanceof Rejection && String((e as Rejection).got).includes("slider"),
      "the renderer names the type it will not draw",
    );
  });

  test("blocked has no button, because no rung pressed is what blocked means", () => {
    const html = renderPanel(loadPanel(REPO_ROOT, "controls"), { ...VALUES, autonomy: 0 });
    assert.doesNotMatch(html, />B</, "the blocked rung is never drawn");
    assert.doesNotMatch(html, /class="rung on"/, "nothing is lit at blocked");
  });

  test("a rung above the next one up is locked, so climbing is one at a time", () => {
    const html = renderPanel(loadPanel(REPO_ROOT, "controls"), { ...VALUES, autonomy: 0.01 });
    assert.match(html, /class="rung locked[^"]*"[^>]*>I</, "ideation cannot be reached in one jump");
  });

  // THE SECOND PANEL. One panel proves nothing about a system; two is where a
  // renderer either generalises or is revealed as the first one in disguise.
  test("the note entry is a panel too, and its separator is declared not baked", () => {
    const params = loadPanel(REPO_ROOT, "note-entry");
    assert.deepEqual(params.map((p) => p.type), ["text", "choice", "action"]);
    const html = renderPanel(params, VALUES);
    // The sketch splits title from body on a forward slash and refuses a value
    // without one. That rule lives in the spec, so changing it is an edit.
    assert.match(html, /data-separator="\/"/, "the separator rides the field");
    assert.match(html, /id="note-body"[^>]*type="text"/);
    assert.match(html, /<select id="note-priority"/);
    assert.match(html, /<option value="could" selected>/, "the first option is the default");
    assert.match(html, /<option value="must">/);
    assert.match(html, /data-post="\/note"/);
  });

  test("a choice renders every option the spec names, and only those", () => {
    const html = renderPanel(loadPanel(REPO_ROOT, "note-entry"), { ...VALUES, choices: { note_priority: "should" } });
    const options = [...html.matchAll(/<option value="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(options, ["could", "should", "must"]);
    assert.match(html, /<option value="should" selected>/, "the current value is the selected one");
  });
});

// THE PANEL IS A SPEC, NOT MARKUP.
//
// The failure this guards is specific and it happened twice in one session:
// the assistant redrew a control bar from a sketch and got the widgets wrong
// both times. A spec that only admits declared types cannot make that
// mistake — the drawing decides, and an unlisted widget refuses.
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { Rejection } from "../engine/errors.ts";
import { loadPanel, parsePanel, renderPanel } from "../engine/params.ts";

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));

const VALUES = {
  rungs: [
    { value: 0, abbr: "B", name: "blocked" },
    { value: 0.01, abbr: "M", name: "mechanical" },
    { value: 0.2, abbr: "O", name: "operational" },
    { value: 1, abbr: "I", name: "ideation" },
  ],
  autonomy: 0.2,
  // THE SECOND BANK, drawn from its own file and its own position.
  stopat: [
    { value: 1, abbr: "SE", name: "state end" },
    { value: 2, abbr: "AJ", name: "agent judgement" },
    { value: 3, abbr: "BL", name: "bless" },
    { value: 4, abbr: "BO", name: "blockers only" },
  ],
  stop_at: 2,
  ints: { narration_minutes: 5, narration_calls: 20 },
};

describe("parameter panels", { concurrency: true }, () => {
  // THE GUARD WAS POINTED AT THE WRONG ARTIFACT. Three assertions already
  // said no slider may survive, and every one of them read the ENGINE's
  // html — while the bar the owner actually touches is the extension's. So
  // a struck slider stayed on screen for a whole expedition, and restarting
  // could never have helped. This reads the surface a person looks at.
  test("the VS Code host draws no control of its own — the bar is the engine's", () => {
    const src = readFileSync(join(REPO_ROOT, "deliverable", "vscode", "extension.js"), "utf8");
    assert.doesNotMatch(src, /type="range"/, "a slider in the host is a second control bar, and it will drift");
    assert.ok(src.includes("/widget/controls"), "the host reads the bar from the engine rather than drawing one");
  });

  // THE ENDPOINT HAS TO HAND IN EVERY STATE THE PANEL CAN DRAW, and a missing
  // one fails SILENTLY: renderPanel reads it as absent and draws the OFF
  // state, so a control that took the click looks like it never did.
  //
  // Both halves of this happened. Emergency was missing, so an armed engine
  // kept drawing the top rung as a plain ideation button - the owner clicked
  // again to check, and that click released the rung and disarmed it. The
  // shutdown toggles had the same hole and could never show a pressed state
  // at all, which nobody noticed because nobody had tried them.
  test("the controls endpoint hands the panel every state it can draw", () => {
    const src = readFileSync(join(REPO_ROOT, "deliverable", "engine", "mirror.ts"), "utf8");
    const at = src.indexOf('"/widget/controls"');
    assert.ok(at > 0, "the controls endpoint is gone");
    // Anchor on the object itself. Slicing to the first "renderPanel" after
    // the route stopped inside a COMMENT that happens to name it.
    const from = src.indexOf("const values = {", at);
    assert.ok(from > at, "the endpoint no longer builds a values object");
    const body = src.slice(from, src.indexOf("};", from));
    for (const key of ["rungs", "autonomy", "emergency", "ints", "toggles", "stopat", "stop_at"]) {
      assert.ok(new RegExp(`\\b${key}\\s*:`).test(body), `/widget/controls never passes ${key}, so the panel draws it as off`);
    }
  });

  test("an armed engine draws E, and a pressed toggle draws pressed", () => {
    const params = loadPanel(REPO_ROOT, "controls");
    const armed = renderPanel(params, {
      ...VALUES,
      autonomy: 1,
      emergency: true,
      toggles: { "block-auto-sleep": true, "shutdown-at-front-desk": false },
    });
    assert.match(armed, />E</, "the armed top rung says so on itself");
    assert.match(armed, /class="rung on danger emergency"/);
    assert.match(armed, /data-toggle="block-auto-sleep"[^>]*aria-pressed="true"/);
    assert.match(armed, /data-toggle="shutdown-at-front-desk"[^>]*aria-pressed="false"/);
  });

  test("the shipped control bar is read from its spec, not from code", () => {
    const params = loadPanel(REPO_ROOT, "controls");
    assert.ok(params.length >= 4, "the panel declares its parameters");
    assert.deepEqual(
      params.map((p) => p.type),
      ["rungs", "rungs", "action", "actions", "int", "int", "action", "text", "toggles"],
    );
    const html = renderPanel(params, VALUES);
    assert.match(html, /class="rung on" data-bank="autonomy" data-level="0"/, "the lowest lit rung releases to blocked");
    assert.match(html, /id="narration-minutes"[^>]*value="5"/);
    assert.match(html, /id="narration-calls"[^>]*value="20"/);
    assert.match(html, /class="rung param-action" data-post="\/narration-now"/);
    // The walk row: one row, label first, two
    // one-shot buttons — aim at the selected state, and the person's pull.
    assert.match(html, /class="rung param-action" data-post="\/target\/selected"/);
    assert.match(html, /class="rung param-action" data-post="\/pull"/);
    assert.doesNotMatch(html, /type="range"/, "a spec cannot produce a slider");
    // THE STOP-AT BANK IS THE SAME CONTROL ASKING A DIFFERENT QUESTION, and
    // the two must never be confused: each button says which bank it posts to.
    assert.match(html, /data-bank="stopat" data-level="3"/, "bless is one press up from the default");
    assert.match(html, /class="rung on" data-bank="stopat" data-level="1" data-rung="2"/, "agent judgement is lit as the default");
    assert.doesNotMatch(
      html,
      /class="[^"]*danger[^"]*" data-bank="stopat"/,
      "no notch is drawn as a hazard — that is autonomy's top rung only",
    );
    // ITS LOWEST NOTCH IS A FLOOR, NOT AN OFF SWITCH. Autonomy's bottom is
    // blocked and releasing into it is the design; not stopping at all is this
    // control's TOP, so its bottom can never be released away.
    assert.doesNotMatch(html, /data-bank="stopat" data-level="0"/, "state end is the tightest setting, never an off");
    assert.match(html, /class="rung param-action" data-post="\/release"/, "and the press that spends one held transition");
    // The shutdown row: two buttons that do not exclude each other, which is
    // why it is `toggles` and not `choice`.
    assert.match(html, /data-toggle="block-auto-sleep"/);
    assert.match(html, /data-toggle="shutdown-at-front-desk"/);
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
    // BLOCKED IS THIS BANK'S BOTTOM, NOT THE BAR'S. The stop-at row beside it
    // is lit at its own default and always will be: `state end` is its
    // tightest setting rather than an off, so a bar-wide "nothing is lit"
    // would be asserting that a second control cannot exist.
    assert.doesNotMatch(html, /class="rung on" data-bank="autonomy"/, "no autonomy rung is lit at blocked");
    assert.match(html, /class="rung on" data-bank="stopat"/, "and the stop-at bank is untouched by the autonomy dial");
  });

  test("a rung above the next one up is locked, so climbing is one at a time", () => {
    const html = renderPanel(loadPanel(REPO_ROOT, "controls"), { ...VALUES, autonomy: 0.01 });
    assert.match(html, /class="rung locked[^"]*"[^>]*>I</, "ideation cannot be reached in one jump");
  });

  // THE SECOND PANEL. One panel proves nothing about a system; two is where a
  // renderer either generalises or is revealed as the first one in disguise.
  test("the note entry is a panel too, and its separator is declared not baked", () => {
    const params = loadPanel(REPO_ROOT, "note-entry");
    // TWO CAPTURES SHARE THIS PANEL. A note and a piece of work are both things
    // a person adds from the controls without leaving what they are doing, so
    // the work line sits under the note line rather than on a surface of its
    // own. see dsp-the-bucket-editor.md#the-editor-is-the-database
    assert.deepEqual(
      params.map((p) => p.type),
      ["text", "choice", "action", "text", "action"],
    );
    const html = renderPanel(params, VALUES);
    // The sketch splits title from body on a forward slash and refuses a value
    // without one. That rule lives in the spec, so changing it is an edit.
    assert.match(html, /data-separator="\/"/, "the separator rides the field");
    assert.match(html, /id="note-body"[^>]*type="text"/);
    assert.match(html, /<select id="note-priority"/);
    assert.match(html, /<option value="could" selected>/, "the first option is the default");
    assert.match(html, /<option value="must">/);
    assert.match(html, /data-post="\/note"/);
    assert.match(html, /id="work-statement"[^>]*type="text"/, "the work line is a field of its own");
    assert.match(html, /data-post="\/work\/mint"/, "and its button mints rather than noting");
  });

  test("a choice renders every option the spec names, and only those", () => {
    const html = renderPanel(loadPanel(REPO_ROOT, "note-entry"), { ...VALUES, choices: { note_priority: "should" } });
    const options = [...html.matchAll(/<option value="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(options, ["could", "should", "must"]);
    assert.match(html, /<option value="should" selected>/, "the current value is the selected one");
  });
});

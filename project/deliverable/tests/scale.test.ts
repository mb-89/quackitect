// A FULL BLOCK MUST BE REACHABLE (owner, 2026-07-29: "I want to be able to
// completely block the agent").
//
// The engine always allowed it — the gate refuses when a state's priority is
// GREATER than the autonomy, so autonomy 0 admits nothing. What was missing
// was a way to GET there. The slider's notches come from scale.md, its lowest
// notch was 0.01, and clicking a notch is how the owner sets the slider. So
// the blocked setting existed and could not be selected.
//
// Two invariants hold the promise up. Both are pinned here.
import { strict as assert } from "node:assert";
import { readFileSync, readdirSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { loadLevels } from "../engine/scale.ts";
import { parseStateNote } from "../engine/notes.ts";
import { renderMirror } from "../engine/render.ts";
import { Session } from "../engine/session.ts";
import { freshRoot } from "./helpers.ts";

const ROOT = fileURLToPath(new URL("../../../", import.meta.url));

test("the scale offers a notch at zero, so a full block is one click away", () => {
  const levels = loadLevels(ROOT);
  const zero = levels.find((l) => l.value === 0);
  assert.ok(zero !== undefined, "the scale declares a level at 0");
  assert.ok(zero.name !== "", "and names it, so the notch says what it does");
  assert.equal(Math.min(...levels.map((l) => l.value)), 0, "nothing sits below it");
});

// BLOCKED IS NOT A BUTTON (owner, 2026-08-01). It is what no rung being
// pressed MEANS, so it is reachable by RELEASING the lowest rung rather than
// by a switch of its own. The control is switches, never a slider.
test("the mirror reaches blocked by releasing the lowest rung", () => {
  const root = freshRoot();
  const html = renderMirror({ session: new Session(root), root, lastPacket: undefined, mode: "manual" });
  assert.doesNotMatch(html, /id="thr" type="range"/, "the autonomy slider is gone");
  assert.doesNotMatch(html, />B</, "blocked has no button of its own");
  assert.match(html, /class="rung on" data-level="0"/, "pressing the lit lowest rung drops to blocked");
});

// THIS IS THE ONE THAT MATTERS. The gate is `priority > autonomy`, so a state
// authored at priority 0 would still run at the blocked setting — 0 > 0 is
// false. One such state anywhere and the block silently stops blocking.
test("no state is authored at priority zero, or the block would not block", () => {
  const dir = fileURLToPath(new URL("../machines/states/", import.meta.url));
  const files = readdirSync(dir).filter((f) => f.endsWith(".md"));
  assert.ok(files.length > 0, "there are authored states to check");
  for (const f of files) {
    const fm = parseStateNote(readFileSync(dir + f, "utf8")).frontmatter;
    if (fm.priority === undefined) continue;
    const p = Number(fm.priority);
    assert.ok(p > 0, `${f} is authored at priority ${p}; autonomy 0 would still admit it`);
  }
});

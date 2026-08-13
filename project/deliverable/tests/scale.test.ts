// A FULL BLOCK MUST BE REACHABLE (owner, 2026-07-29: "I want to be able to
// completely block the agent").
//
// The engine always allowed it — the gate refuses when a state's priority is
// GREATER than the autonomy, so autonomy 0 admits nothing. What was missing
// was a way to GET there. The control's notches come from scale.md, its
// lowest notch was 0.01, and clicking a notch is how the owner sets it. So
// the blocked setting existed and could not be selected.
//
// Two invariants hold the promise up. Both are pinned here.
import { strict as assert } from "node:assert";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { parseStateNote } from "../engine/notes.ts";
import { renderMirror } from "../engine/render.ts";
import { loadLevels, tierOf, valueFor } from "../engine/scale.ts";
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

// THE TIER LADDER IS THE VOCABULARY (owner cut-over ruling 2026-08-12):
// mechanical, operational, tactical, strategic, ideation — the words are
// the truth, the numbers their transitional anchors.
test("the ladder speaks the owner's tiers in order, and the words map to their anchors", () => {
  const levels = loadLevels(ROOT);
  const words = levels
    .filter((l) => l.value > 0)
    .sort((a, b) => a.value - b.value)
    .map((l) => l.name.split(" — ")[0]);
  assert.deepEqual(words, ["mechanical", "operational", "tactical", "strategic", "ideation"]);
  assert.equal(valueFor(levels, "tactical"), 0.6);
  assert.equal(valueFor(levels, "strategic"), 0.8);
  assert.equal(tierOf(levels, 1), "ideation");
  assert.equal(tierOf(levels, 0.4), "operational");
  assert.equal(tierOf(levels, 0.1), "blocked");
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

// THE WORDS ARE THE TRUTH (req-autonomy-is-categorical, tsp-autonomy-tiers).
//
// The cut-over left the state notes speaking tier words and the machine
// canvases carrying bare numbers, and it stayed that way until the i3 tester
// swept for it by hand. A sweep a person has to remember is a sweep that
// runs when the pressure is low, so it runs here instead.
//
// A state may also be authored `blocked`, which the engine reads ABOVE the
// ladder rather than through it — on the control blocked is 0, but a state
// at 0 would run at the blocked setting, which is the opposite of the word.
test("no drawing carries a bare autonomy number", () => {
  const dir = fileURLToPath(new URL("../machines/", import.meta.url));
  const canvases = readdirSync(dir).filter((f) => f.endsWith(".canvas"));
  assert.ok(canvases.length > 3, `expected the drawn machines — found ${canvases.length}`);
  const bare: string[] = [];
  for (const f of canvases) {
    // EVERY match, not the first. A canvas can author more than one.
    for (const m of readFileSync(dir + f, "utf8").matchAll(/"priority":\s*([0-9][^,}\s]*)/g)) {
      bare.push(`${f} authors priority ${m[1]}`);
    }
  }
  assert.deepEqual(bare, [], "a canvas carrying a number instead of a tier word");
});

// THE PAGE THAT TEACHES THE NEXT AUTHOR counts too. The corpus was swept
// clean once while guidance/authoring/machines.md still showed a numeric
// priority in its worked example, so the corpus would have grown back one
// state at a time. Found by the i3 tester, whose point was that a check
// built to stop a regression missed the only thing still broken.
test("the authoring guidance teaches rung words, never numbers", () => {
  const page = fileURLToPath(new URL("../../guidance/authoring/machines.md", import.meta.url));
  const text = readFileSync(page, "utf8");
  const bare = [...text.matchAll(/^\s*priority:\s*([0-9][^\s#]*)/gm)].map((m) => m[1]);
  assert.deepEqual(bare, [], "the worked example authors a number, so every state copied from it will too");
});

// BLOCKED MUST NOT COME BACK FROM THE LADDER (i3 tester, 2026-08-13).
//
// On the control blocked is 0. On a state, 0 is the one value that breaks
// the block, because the gate refuses on `priority > autonomy` and 0 > 0 is
// false. The first guard matched the exact lowercase string, so `Blocked`,
// `BLOCKED` and the abbreviation `B` all fell through to valueFor and
// resolved to 0 — a state that would run at every setting including the one
// promising nothing runs.
//
// valueFor matches the name OR the abbr, case-insensitively, so every one of
// these is a legitimate way to write it.
test("every spelling of blocked resolves above the ladder, never to zero", () => {
  const levels = loadLevels(ROOT);
  for (const word of ["blocked", "Blocked", "BLOCKED", " blocked ", "B", "b"]) {
    assert.equal(valueFor(levels, word), 0, `the ladder still reads ${word} as the control position`);
  }
  const drawn = fileURLToPath(new URL("../machines/expedition_archive.canvas", import.meta.url));
  const fm = JSON.parse(readFileSync(drawn, "utf8")) as { metadata: { frontmatter: { priority: unknown } } };
  assert.equal(fm.metadata.frontmatter.priority, "blocked", "the archive is the drawing this protects");
});

// THIS IS THE ONE THAT MATTERS. The gate is `priority > autonomy`, so a state
// authored at priority 0 would still run at the blocked setting — 0 > 0 is
// false. One such state anywhere and the block silently stops blocking.
test("no state is authored at priority zero, or the block would not block", () => {
  const dir = fileURLToPath(new URL("../machines/states/", import.meta.url));
  const files = readdirSync(dir).filter((f) => f.endsWith(".md"));
  assert.ok(files.length > 0, "there are authored states to check");
  const levels = loadLevels(ROOT);
  for (const f of files) {
    const fm = parseStateNote(readFileSync(dir + f, "utf8")).frontmatter;
    if (fm.priority === undefined) continue;
    const raw = fm.priority;
    const p = typeof raw === "number" || !Number.isNaN(Number(raw)) ? Number(raw) : (valueFor(levels, String(raw)) ?? Number.NaN);
    assert.ok(p > 0, `${f} is authored at priority ${String(raw)} (resolves ${p}); autonomy 0 would still admit it`);
  }
});

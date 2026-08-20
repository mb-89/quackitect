// THE CONTROL BAR'S LEGIBILITY, authored test-first at i33's author-tests.
//
// Two of these four cases are RED on purpose. They state what
// req-a-refused-act-says-why-and-what-next and
// req-a-surface-shows-the-state-an-act-produced demand, and the build has not
// happened yet. observe-red records which.
//
// The other two are GREEN and document behaviour that already stands. They are
// here because the stop-at investigation of 2026-08-17 eliminated two suspected
// causes, and a regression guard is what keeps an elimination from having to be
// redone.
import assert from "node:assert/strict";
import { test } from "node:test";
import { type PanelValues, parsePanel, renderPanel } from "../engine/params.ts";

const PANEL = `## Parameters

- stop @ | rungs | stopat | how far the agent walks before handing back
`;

const NOTCHES = [
  { value: 1, abbr: "SE", name: "state end" },
  { value: 2, abbr: "AJ", name: "agent judgement" },
  { value: 3, abbr: "BL", name: "bless" },
  { value: 4, abbr: "BO", name: "blockers only" },
];

/** The bank at a named position, with everything else the panel can draw. */
function barAt(stop_at: number | undefined): string {
  const values: PanelValues = {
    rungs: [],
    autonomy: 0.4,
    stopat: NOTCHES,
    ...(stop_at === undefined ? {} : { stop_at }),
    ints: {},
  };
  return renderPanel(parsePanel(PANEL), values);
}

/** The one button whose own value is `value`, as its whole tag. */
function notch(html: string, value: number): string {
  const m = html.match(new RegExp(`<button[^>]*data-rung="${value}"[^>]*>`));
  assert.notEqual(m, null, `no button drawn for notch ${value}`);
  return m === null ? "" : m[0];
}

// GREEN, AND IT IS THE REGRESSION GUARD FOR AN ELIMINATION.
//
// The owner reported on 2026-08-17 that `blockers only` would not activate
// from `bless`. This asserts the rung rule itself is sound at that position,
// which is what sent the investigation past params.ts to the POST and the
// stored value. If this ever goes red, the elimination was wrong.
test("the notch above the current one is reachable, never locked", () => {
  const tag = notch(barAt(3), 4);
  assert.ok(!tag.includes("locked"), `blockers only is locked from bless: ${tag}`);
});

// GREEN. A cumulative control's second press releases it, and the control says
// so before the press rather than after — req-a-control-that-undoes-on-a-second-
// press-says-so-first, already satisfied here.
test("a rung that is on says a press releases it, before the press", () => {
  const tag = notch(barAt(3), 3);
  assert.match(tag, /release this rung/, `an on rung does not warn it releases: ${tag}`);
});

// RED. req-a-refused-act-says-why-and-what-next: a refusal shows the reason AND
// the act that unlocks it. Today the title says "unlock the rung below first"
// and never names which rung that is, so the person is told a rule and not a
// next act.
test("a locked notch names the notch that unlocks it", () => {
  const tag = notch(barAt(2), 4);
  assert.match(tag, /bless/, `a locked notch does not name what to press first: ${tag}`);
});

// RED. req-a-surface-shows-the-state-an-act-produced: an absent value must not
// be drawn as a deliberate one. Today `v.stop_at ?? 0` makes "we were handed
// nothing" identical to "the bank sits at zero", which is the exact shape that
// disarmed the emergency rung and blanked the shutdown row.
test("a bank handed no position is distinguishable from one sitting at zero", () => {
  const absent = barAt(undefined);
  const atZero = barAt(0);
  assert.notEqual(absent, atZero, "an absent position renders identically to a deliberate zero");
});

// ── THE TWO BANKS ARE TOLD APART, 2026-08-18 ────────────────────────────
//
// THE OWNER REPORTED IT TWICE: pressing an autonomy rung moved the stop-at
// row, and `blockers only` never unlocked however often `bless` was pressed.
// One cause, and it was in the VS Code handler rather than here — every rung
// posted to /autonomy, because the handler never read the mark this renderer
// has always written.
//
// WHAT THESE TWO CASES GUARD is the CONTRACT the fixed handler depends on:
// the markup must say which control a button belongs to, and each bank must
// carry its own position. They do NOT exercise the handler. That code is
// bundled browser JS with no DOM in the suite, so the click path is still
// covered by hand only.

const BOTH = `## Parameters

- autonomy | rungs | scale | what the agent may decide alone
- stop @ | rungs | stopat | how far the agent walks before handing back
`;

const TIERS = [
  { value: 0.2, abbr: "M", name: "mechanical" },
  { value: 1, abbr: "I", name: "ideation" },
];

function bothBanks(): string {
  return renderPanel(parsePanel(BOTH), { rungs: TIERS, autonomy: 0.2, stopat: NOTCHES, stop_at: 3, ints: {} });
}

test("every rung says which bank it belongs to", () => {
  const html = bothBanks();
  const marks = html.match(/data-bank="(autonomy|stopat)"/g) ?? [];
  const buttons = html.match(/<button[^>]*class="rung/g) ?? [];
  assert.equal(marks.length >= buttons.length, true, "a rung without data-bank cannot be routed by a handler");
  assert.match(html, /data-bank="autonomy"/, "the autonomy bank is unmarked");
  assert.match(html, /data-bank="stopat"/, "the stop-at bank is unmarked");
});

test("each bank carries its own position, so one can be reconciled without the other", () => {
  const html = bothBanks();
  const autonomy = html.match(/<input[^>]*class="bank-at"[^>]*data-bank="autonomy"[^>]*>/);
  const stopat = html.match(/<input[^>]*class="bank-at"[^>]*data-bank="stopat"[^>]*>/);
  assert.notEqual(autonomy, null, "the autonomy bank has no position input");
  assert.notEqual(stopat, null, "the stop-at bank has no position input — a surface can only track one");
  assert.match(String(stopat?.[0]), /value="3"/, "the stop-at input does not carry its own value");
  assert.match(String(autonomy?.[0]), /value="0.2"/, "the autonomy input does not carry its own value");
});

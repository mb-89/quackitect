// WORK PAST ITS BOUND SAYS IT IS WORKING, authored test-first at i33's
// author-tests.
//
// BOTH CASES ARE RED, and neither is red by accident. req-work-past-its-bound-
// says-it-is-working demands a signal that no mechanism produces yet, so these
// state the demand against the surface that will carry it. observe-red records
// them.
//
// WHY THE PANEL AND NOT THE LANE. The requirement binds a person's surface and
// an agent's result alike, and the panel is the half a person sees. The agent
// half rides the call result and is checked where that result is built.
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

/** The panel as it stands, plus whatever the caller says is running. */
function panelWith(extra: Record<string, unknown>): string {
  const values = {
    rungs: [],
    autonomy: 0.4,
    stopat: NOTCHES,
    stop_at: 2,
    ints: {},
    ...extra,
  } as unknown as PanelValues;
  return renderPanel(parsePanel(PANEL), values);
}

// RED. Nothing carries a running operation onto the panel today, so the person
// watching a thirty-second pull sees exactly what they see during a hung one.
test("a running operation past its bound is named on the panel", () => {
  const html = panelWith({ running: { what: "walking to gate-implementation", since_ms: 4200 } });
  assert.match(
    html,
    /walking to gate-implementation/,
    "a running operation is not named on the panel, so a slow call and a hung one look identical",
  );
});

// RED, and it is the half that keeps the fix honest. The demand is explicitly
// non-intrusive: a signal that takes the surface over satisfies the letter and
// fails the owner's framing, which asks for both in one breath.
//
// IT WAS GREEN FROM BIRTH AND THAT WAS A DEFECT IN THIS FILE. The first version
// asserted containment alone, and with no signal built the busy panel and the
// quiet one are identical, so containment was trivially true. observe-red names
// exactly that: green from birth proves nothing. The assertion now demands the
// signal be PRESENT and CONTAINED, which stays one question with one reason to
// fail — does it ride beside what is already there.
test("the running signal does not take the panel over", () => {
  const quiet = panelWith({});
  const busy = panelWith({ running: { what: "walking", since_ms: 4200 } });
  assert.ok(
    busy !== quiet && busy.includes(quiet.trim()),
    "the signal must ride BESIDE what the panel already shows: either none was added, or it replaced the panel instead of joining it",
  );
});

---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: tsp-the-door-regime-s-static-attributes
type: "[[test-spec]]"
statement: The door regime carries no blanket off-switch, expresses each rule in one place read by both callers, and names each door for the conversation it governs.
method: inspection
verifies:
  - req-no-setting-disables-every-rule-at-once
  - req-one-rule-is-expressed-once-and-read-by-two-callers
  - req-a-door-is-named-for-the-conversation-it-governs
files:
  - none — every attribute here is a property of the source as written, and the checklist below is the whole definition
---

## Scope

The three demands that are attributes of the CODE AS WRITTEN rather than of what it does when run.

Each is examined by reading a named file against a named criterion. Two of the three also carry a mechanical check, and where one exists the checklist names it, because a criterion a machine can re-check on every commit is worth more than one a person checks once.

### What is deliberately out

Everything that has to RUN to be judged: the refusals, the enumeration, the sweep's findings. Those live on `tsp-the-door-rule-refuses-and-reports`.

The naming criterion is deliberately NOT mechanised. Whether a name describes a conversation or a technology is a reading, and a word list pretending to decide it would be a false green.

## Approach

INSPECTION, at component level, over the rule module and its two callers.

The design method is a CHECKLIST derived from each requirement's own falsifier. Bartlett puts checklist testing lowest for defects found per case, and that is accepted here rather than argued away: these three are chosen for inspection precisely because running them proves nothing a reading does not.

Risk decides how hard each is examined.

- The blanket off-switch is graded crippling. One switch undoes the reason requirement, the list and the sweep together, so its criterion is exhaustive rather than sampled.
- One-rule-two-callers is graded crippling. A second copy is how a second surface accreted here once over months.
- The naming criterion is graded corrosive. A wrong name misleads every later reader without breaking anything.

## Checklist

- NO BLANKET OFF-SWITCH IN THE RULE MODULE. Read `deliverable/engine/doors.ts` whole. PASSES when no exported function, no constant and no branch turns every rule off at once. Mechanical support: a case in `tests/doors.test.ts` greps the module for an environment-variable read and for a rule-count-zero path, and fails on either.
- NO BLANKET OFF-SWITCH IN THE CALLERS. Read the write-guard call site and the sweep call site. PASSES when neither can skip the rule module for a reason the module does not itself decide. A caller that wraps the guard in its own `if` has moved the switch rather than removed it.
- NO BLANKET OFF-SWITCH IN THE ENVIRONMENT. Read the engine's own list of environment variables the suite sets. PASSES when none of them disables a door. This one is named separately because the suite already sets four guards that turn a tool into a no-op, and that is the exact shape being ruled out.
- ONE PLACE HOLDS EACH RULE. Read `deliverable/engine/doors.ts` and both callers. PASSES when the predicate for a conversation appears once, in the rule module, and each caller imports it. FAILS on any regex, path list or tag list restated in a caller or in a test. Mechanical support: a case asserts that both call sites import from the rule module.
- THE TEST HOLDS NO COPY EITHER. Read `tests/doors.test.ts`. PASSES when it imports the predicate rather than restating it. The widget guard's own test carries this rule in a comment, and it is inherited here.
- EACH DOOR IS NAMED FOR ITS CONVERSATION. Read the `id` and `governs` of every entry in the rule table. PASSES when the name says what the conversation IS and not what carries it. `keeping-a-record-on-disk` passes; `disk`, `fs` and `syscall` fail. The criterion comes from the pattern's own primary source, which identifies technology-named ports as the failure the pattern exists to fix.
- EACH DOOR STATES ITS COVERAGE LIMIT. Read each entry's `governs` line. PASSES when a conversation the guard cannot see is named there rather than implied absent. This one is added by the prototype gate: 38 of 178 modules reach a shell, and a shell carries no path the guard can judge.

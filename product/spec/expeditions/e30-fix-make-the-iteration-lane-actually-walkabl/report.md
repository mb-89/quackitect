---
form: expedition-leave
status: draft
by: agent
files:
---

# e30 — make the iteration lane actually walkable

<!-- PREFILL, 2026-08-02. Every section below is a suggestion and counts as
EMPTY until confirmed. Confirm each one in the mirror, or uncomment it here.
Then set status: done. The close itself weighs 0.6 and is the owner's tick. -->

## What was the goal

<!--
Make the iteration lane actually walkable, so the product iteration can be
opened. The owner chose an expedition over an iteration on 2026-08-01,
because no iteration had ever been walked.

The shutdown row came in as an explicit ask: two buttons that may both be
active at once, block auto-sleep and shutdown at idle, on a timer the machine
owns rather than the agent.

Four rulings were carried into the goal so they would survive a compaction.
The floor law enforced in the compiler as a refusal. The killer flag deleted.
The re-walk built as one mechanism with several triggers. Evidence reaching
the agent as typed fields with per-field guidance.

THE GOAL DRIFTED, and this is where it shows. The expedition became the day's
bucket. Emergency mode and the drumroll were built after the merge, on trunk
directly, and neither is named in the minted goal. software.md says to amend
the goal when the bundle grows past it. That was not done.
-->

## What was done

<!--
THE SHUTDOWN ROW. A new toggles parameter type, for buttons that do not
exclude each other. The machine holds the two flags and serves them. Block
auto-sleep keeps the computer awake; shutdown at idle waits for the walk to
rest, the log to go quiet for about five minutes, and no subagent to be
running. Touched params.ts, controls.md, mirror.ts, render.ts, run.ts and the
VS Code extension. Held by tests/power.test.ts.

EMERGENCY MODE AND THE DRUMROLL. Five presses on ideation arm emergency. The
armed rung says E. The armed button goes deaf for two seconds. The drumroll
counts before every guard, so a locked rung cannot swallow it. Held by
tests/emergency.test.ts and tests/drumroll.test.ts. This half landed on trunk
after the expedition branch merged.

THE FLOOR LAW. Enforced in the compiler as a refusal, with a lint beside it so
a struck floor step is caught while still in the file. Held by
tests/floor.test.ts.

THE KILLER FLAG. Deleted from the documented semantics and removed from all
eight gate rows. It had reached the checker inside an HTML comment that the
checker strips, so it had never done anything. required already defaults true.

THE RE-WALK. One mechanism, several triggers. reopenStates in machine.ts is
joined to the demand diff in iterations.ts. The packet now says what a step
will ask before you enter it.

EVIDENCE TYPING. Every evidence field carries a type and per-field guidance.
The derived type never reaches the agent at all: the machine computes it and
only speaks if it fails. The proposal was written out as
product/spec/evidence-typing-prefill.md, 374 lines, for the owner to walk.

THE ROUNDS EVERY GATE WAS MISSING. STANDARD_ROUNDS is injected by the compiler
into every gate's evidence form. A second, older copy in session.ts emitted
three of the same rounds twice under shorter names; it is gone. Held by
tests/rounds.test.ts.

THE SIZE. 32 files, 2066 lines added and 148 removed, measured across
67a06ad to v3.
-->

## What settled it

<!--
THE BATTERY. 654 tests in 73 suites, 0 failures, 73 seconds, run on the
expedition worktree on 2026-08-02.

THE TWO DEAD FLAGS WERE THE SAME BUG TWICE. The floor law was parsed and read
by nothing. The killer flag reached the checker inside a stripped comment.
Neither had a test that could fail. Both now do, in tests/floor.test.ts and
tests/rounds.test.ts, so cutting the wiring again is caught.

THE DERIVED CLAIM IS CHECKABLE, not asserted. session.ts filters fields of
type derived out of the packet in both places that build one, at lines 2408
and 2598.

THE OWNER'S OWN HAND. Commit e659fe6 is the owner's review of the evidence
typing, written by them rather than by an agent. That is the typing observed,
not claimed.
-->

## What was not done

<!--
THE PULL LANE IS NOT BUILT, and was not started. The lane's verb is still
se_tick; there is no se_next and no se_submit. Only the evidence-form half of
the design landed. note-65c5ea157fe2 finds that the pull lane is v3's own plan
item M1b and was designed twice before, in v2 Pillar 1 and in v3-plan.md, and
says to read v2 sections 5, 6 and 12 before building any of it. The rework is
a return to the plan, not a new direction.

THE GOAL'S OWN TEST IS UNPROVEN. No iteration has been walked end to end.
product/spec/iterations/ does not exist on trunk. The it/i1 branch stands with
a bound worktree, and the owner ruled i1 is not the vehicle
(note-84f06cf44e0a). So the lane being walkable rests on tests, not on a walk.

THE DECISION GRAPH HOLDS 19 OPEN POINTS. All of them come from subagent
fan-outs whose work landed but whose nodes were never resolved. They cannot be
closed from a later session, because prior visits' nodes are not in the live
graph. The leave lint does not see them either, and note-957693d20f66 records
why: openRecordPoints filters by a visit id that never matches the visit
actually recorded.

HAND VERIFICATION OF THE POWER WORK. The buttons exist and the tests press
them. Nobody has watched a real machine refuse to sleep, or shut down at idle.

PARKED DELIBERATELY, not dropped. Machine-picture layout waits, and lifts v2's
ranker when it returns. The specification column waits until a consumer for it
exists.
-->

## Files

<!-- None. Nothing was written to the record's evidence/ folder. -->

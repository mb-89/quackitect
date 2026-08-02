---
form: expedition-leave
status: draft
by: agent
files:
---

# e30 — make the iteration lane actually walkable

<!-- PREFILL, amended a second time on 2026-08-02 after the tick retired.
Every section below is a suggestion and counts as EMPTY until confirmed.
Confirm each one in the mirror, or uncomment it here. Then set status: done.
The close itself weighs 0.6 and is the owner's hand. -->

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

THE GOAL DRIFTED TWICE, and this is where it shows.

First, the expedition became the day's bucket. Emergency mode and the drumroll
were built after the merge, on trunk directly, and neither is named in the
minted goal.

Second, and larger: on 2026-08-02 the owner ruled that the pull lane be built
BEFORE the first iteration is opened, and then — the same day — that the tick
RETIRE with it: the agent pulls, always, and every decision the tick used to
ask of the agent moves into the engine. So the pull lane and the retirement
are now the biggest things in this expedition and neither is in the goal.
software.md says to amend the goal when the bundle grows past it. Amending it
is owed.
-->

## What was done

<!--
THE PULL LANE (2026-08-02). The agent's one verb, se_pull. It answers with an
INSTRUCTION rather than a refusal, which is the whole point.

- `read` — documents are owed; se_reading credits them, so the agent carries
  no hashes at all.
- `fill` — the next step wants evidence. THE MACHINE BUILDS THE FORM and hands
  it over, so the agent never looks one up. It comes back on the next pull.
  There is no submit verb, and pulling without it returns the same form.
- `choose` — the road splits. The options ride along with their weight and
  whether they are open.
- `do` — the happy path, WALKED, every hop to the next branching point in one
  call. Start to front desk has no branch in it and no longer costs a round
  trip per hop.
- `wait` — out of work, or the next step weighs more than the session
  autonomy. It names which step waits and that a message is what resumes.

A choice may be a LIST: one agent walks the first and the rest come back as
not_walked. Multi-agent is not built and the seam is deliberately not designed
shut, which was the owner's instruction.

THE TICK RETIRED (owner ruling 2026-08-02, same day). se_tick is out of the
tool list; se_pull is the agent's one verb. What each side owns now:

- The ENGINE took the hop, the route, the sweep, the peek, the position
  (the from-assertion is deleted — the pull recomputes, so the race is
  gone), and the read proof end to end: read_hashes no longer exists,
  se_reading and se_file_read credit what they serve, and the reads
  refusal's remedy speaks the reading loop.
- The AGENT keeps five decisions, all payload fields on se_pull: choice,
  form, back, pause, escape. The pull grew back/pause/escape for this.
- The DESK's door vocabulary rides se_survey as a live doors list derived
  from idle's edges, replacing the retired peek.
- The BANNER now survives a sweep — it used to be eaten mid-walk, against
  the harness rule that banners are shown verbatim.
- The boot contract, both session hooks, the kickoff prompt, walking.md,
  boot method, front-desk method, contract rule 3, the README and every
  machine state card now speak pull. v3-plan.md's M1b entry records what
  shipped against what was planned.

The full audit — what moved, what stayed, with reasons — is
note-c812ee64df45.

THE SHUTDOWN ROW. A new toggles parameter type, for buttons that do not
exclude each other. The machine holds the two flags and serves them. Block
auto-sleep keeps the computer awake; shutdown at idle waits for the walk to
rest, the log to go quiet for about five minutes, and no subagent to be
running. Held by tests/power.test.ts.

EMERGENCY MODE AND THE DRUMROLL. Five presses on ideation arm emergency. The
armed rung says E. The armed button goes deaf for two seconds. The drumroll
counts before every guard. Held by tests/emergency.test.ts and
tests/drumroll.test.ts.

THE FLOOR LAW, enforced in the compiler as a refusal, with a lint beside it.
Held by tests/floor.test.ts.

THE KILLER FLAG, deleted from the documented semantics and removed from all
eight gate rows. It had reached the checker inside an HTML comment the checker
strips, so it had never done anything.

THE RE-WALK. One mechanism, several triggers. reopenStates in machine.ts is
joined to the demand diff in iterations.ts. The packet says what a step will
ask before you enter it.

EVIDENCE TYPING. Every field carries a type and per-field guidance. The
derived type never reaches the agent: the machine computes it and speaks only
if it fails. The proposal was written out as evidence-typing-prefill.md, 374
lines, and the owner reviewed it in their own hand.

THE ROUNDS EVERY GATE WAS MISSING, injected by the compiler, and the older
duplicate copy in session.ts removed. Held by tests/rounds.test.ts.
-->

## What settled it

<!--
THE BATTERY. 654 tests in 73 suites before the pull lane; 672 in 79 after the
retirement, zero failures. The wall clock sits near 110 seconds — the pull
cases each pay a real boot walk.

THE MIGRATION FOUND FOUR REAL DEFECTS, which is what it was for.

- The reading loop did not serve the human-checked handover demand, so a
  pull could say read for a list that could not satisfy the walk it feeds.
  readingList now unions the human's checked docs.
- The survey's doors landed referencing a session the survey never had —
  a runtime hole invisible to type-stripping. The doors ride a thunk now,
  like the reading.
- The mirror's read pill stayed gray for a credited reading until the
  walk moved; it now greens on a current credit.
- The old needs-retro test silently swallowed a refused hop for weeks —
  a call whose result nobody asserted. The rewrite drives the drawn edge.

THAT COST WAS PAID DELIBERATELY. A pull case needs a session standing at idle
and that means a real boot walk, about eight seconds each. All of them in one
file made that file the slowest thing in the suite, at over a hundred seconds
alone — worse than the whole battery. They are split across three files by
theme so they reach three cores, and the cases that need no walk at all were
gathered into the third, which finishes in four seconds.

A TEST CAUGHT A REAL ORDERING BUG, which is the best evidence here. The pull
originally checked the reading before the slider, so an agent aimed at a step
it was not allowed to take was sent through several documents first and only
then told to stop. The case asserting that a threshold arrives as `wait` failed
with `read`, and the order was corrected. Nothing but a test would have found
that — both orders look right in the code.

THE LAW IS PINNED IN THREE PLACES, because it is the thing that will regress.
A threshold on the first hop, a threshold reached mid-sweep, and the boundary
where illegal stays illegal are all separately asserted.

THE TWO DEAD FLAGS WERE THE SAME BUG TWICE. The floor law was parsed and read
by nothing. The killer flag reached the checker inside a stripped comment.
Neither had a test that could fail. Both do now.

THE DERIVED CLAIM IS CHECKABLE, not asserted. session.ts filters fields of
type derived out of the packet in both places that build one.

THE OWNER'S OWN HAND. Commit e659fe6 is the owner's review of the evidence
typing, written by them rather than by an agent.
-->

## What was not done

<!--
THIS SESSION STILL DROVE THE TICK. The MCP tool list is fixed at connect
time and se_reload swaps the engine but not the list, so the session that
retired the tick could not itself pull. The FIRST session on the new code is
the first real pull walk; its boot is the dogfood this session could not do.

THE ITERATION WALK IS COVERED ON THE HUMAN HAND. iterations.test drives the
bless, the pin and the gate report at session level now — the agent-lane
version of that walk (pull { form } through a kickoff) has no test yet,
because no iteration has ever been walked by an agent at all. The product
iteration will be that test.

THE BATCH IS NOT SIZE-CAPPED. The owner asked how a long batch avoids
overflowing and their hint was "maybe not all the details". The answer taken
here is structural: steps arrive in full, guidance rides se_reading, and
per-field guidance rides the form. No count or token limit is enforced, and a
very long branchless run would still return a long answer.

THE GOAL'S OWN TEST IS UNPROVEN. No iteration has been walked end to end.
product/spec/iterations/ does not exist on trunk. The it/i1 branch stands with
a bound worktree, and the owner ruled i1 is not the vehicle. So the lane being
walkable rests on tests, not on a walk.

THE DECISION GRAPH HOLDS 19 OPEN POINTS from earlier sessions' subagent
fan-outs, whose work landed but whose nodes were never resolved. They cannot
be closed from a later session, because prior visits' nodes are not in the
live graph. The leave lint does not see them either, and note-957693d20f66
records why: openRecordPoints filters by a visit id that never matches the one
actually recorded. That means every expedition closed so far passed the
graph-is-evidence check without it ever looking.

HAND VERIFICATION. Nobody has driven the pull lane by hand from an agent, and
nobody has watched a real machine refuse to sleep or shut down at idle. Both
are covered by tests and neither has been observed.

PARKED DELIBERATELY, not dropped. Machine-picture layout waits, and lifts v2's
ranker when it returns. The specification column waits until a consumer exists.
-->

## Files

<!-- None. Nothing was written to the record's evidence/ folder. -->

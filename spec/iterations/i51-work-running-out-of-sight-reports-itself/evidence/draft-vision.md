---
form: draft-vision
by: agent
signed_off: 2026-08-21T08:43:38.844Z
authors: agent
files: null
---

# Evidence form / draft-vision

## current_situation

Iteration fifty-one is sized. The kickoff gate blessed `major`, and the machine below compiled at that column.

THE RESIDENT VISION IS A FILE. It is `spec/trace/value-prop/vp-the-engine.md`, minted at i2: an engineer draws their own process as a state machine and the engine gives it teeth.

WHAT THIS STATE OWES IS A JUDGMENT, not a re-derivation. The guidance says to point at the resident vision, argue in one paragraph whether the change bends it, and rewrite only the part it bends.

FOUR GOALS STAND from the kickoff. One report for background work, a non-freezing exit script, a test scope that answers for the change, and the standing engine-improvements goal.

## big_idea

THE VISION IS INHERITED AND IT DOES NOT BEND. `vp-the-engine` promises a drawn machine that walks with refusals, forms, gates and the record attached. Nothing here touches what the drawing means, who blesses, or what evidence is owed. It changes only WHEN a hop is allowed to finish, which is the walk's own execution model sitting under the axiom.

THE DELTA IN ONE BREATH: work the agent cannot see should say that it exists and how much longer it needs, and no step should ever hold the agent's only verb hostage while it waits.

WHY THIS IS A DELTA AND NOT A NEW IDEA. The engine already hands work off and returns a handle — `se_run` does it, `se_test` does it. What is missing is the other half of that bargain: something to ask, and an answer worth acting on. This finishes a shape the product already chose.

WHAT MAKES IT WORTH HAVING. A walk that freezes is a dead run on a box nobody watches. A walk that cannot say how long polls every two seconds and fills the only witness there is with nothing.

## to_be_world

AN AGENT STARTS A LONG TEST RUN AND CARRIES ON. It writes the next file, patches the next module, drafts the next form. It never sits polling.

WHEN IT WANTS TO KNOW, IT ASKS ONCE. One call comes back with every piece of work running out of sight — the test run, the shell job, the exit script — in one list rather than two that each hold half.

EACH ENTRY NAMES A TIME. Not a rate, not a percentage. "About forty seconds" means the caller waits forty seconds and asks again, once.

THE FIGURE HAS A BASIS THE READER CAN SEE. It is what the job has already done measured against what it has left, and the entry says which run it was computed from. Where there is no history, the entry says so plainly instead of inventing a number.

A STATE WITH A LONG LEAVING CONDITION LETS GO OF THE WALK. The exit script starts, the pull answers at once, and the verdict arrives on a later call. The agent is never told a call failed while the work behind it was still moving.

AND A DOCUMENTS-ONLY EDIT STOPS FIRING THE WHOLE BATTERY. The engine says which tests answer for this change, and when none do it says that rather than running every test it has.

## goal_system

1. ONE ANSWER COVERS EVERY JOB OUT OF SIGHT. Test runs and shell jobs in one list, never two lists that each hold half.

2. EVERY ENTRY CARRIES A TIME REMAINING, with the basis it was computed from named beside it.

3. A LEAVING CONDITION NEVER FREEZES THE WALK. A step may be left with a verdict still owed, and the machine holds that pending result against the state.

4. THE ENGINE PICKS TESTS THAT ANSWER FOR THE CHANGE, and says so when none do.

5. THE STATE RIDES ORDINARY CALLS. An agent doing other work learns a job finished without having to ask.

CONFLICT ONE: a useful estimate against an honest one. A specific number is believed exactly because it is specific, and the register already records that the timings behind it are corrosive — `raid-asm-battery-timings-measure-work` measured summed case time of 1,534,695 ms against a wall clock of 76,985 ms. RULED FOR HONESTY OVER USEFULNESS. Every figure carries its basis, and a job with no history reports that it cannot estimate rather than guessing. A wrong number costs more than an absent one, because the absent one is not acted on.

CONFLICT TWO: a non-freezing exit against a simple completion contract. Today a hop completes when its exit script returns, and that single rule is what makes green cheap to compute. Deferring the verdict means a state can stand with work outstanding, and every gate below it has to know what that means. RULED FOR THE NON-FREEZING EXIT. A frozen verb is a dead run on an unattended box, and the cost is a contract change made once and made visibly.

CONFLICT THREE: a narrower test scope against catching breaks. Running fewer tests risks missing one that would have caught the change. RULED FOR THE NARROWER SCOPE, because today's fallback is not the safe option it looks like — running every test when none answers for the diff does not answer for the diff either. The safety comes back at verification, where the full battery still fires.

PRIORITY ORDER when they cannot all be had: 3 first, because a frozen walk stops everything and the other four are improvements to a walk that is running. Then 1, then 2, then 4, then 5.

## moore_pitch

FOR the owner and the agents walking Quackitect on machines nobody is watching, WHO today either freeze on a step that takes a minute or poll a status verb every two seconds and fill the only witness of the run with nothing, THE background-work report and the deferred exit verdict ARE an execution-model change inside the walking core THAT lets any step hand its long work off, and answers in one call what is still running and how much longer each piece needs.

UNLIKE a build server's dashboard, which reports on a daemon somebody else runs and shows a human a progress bar, OUR PRODUCT answers the agent itself, in the same lane it already calls, so the estimate is something the walk can act on rather than something a person watches.

WHAT WE GIVE UP, SAID IN THE PITCH BECAUSE IT BELONGS THERE: the estimate rests on timings the register already calls unreliable, and Jenkins derives its equivalent from years of prior builds at scale. We have neither the history nor the scale. We are buying an answer the walk can use with an accuracy we cannot yet claim, and every figure says what it was computed from so the reader can discount it.

## follow_up

The next state defines the actual: where the engine stands today on background work, with the witnesses named.

Two things are parked with their owners rather than left loose here.

- The estimate's basis is the design's question, not the vision's. `raid-asm-battery-timings-measure-work` stands open and is cited against goal two rather than absorbed.
- The no-history case needs an honest answer in the design. `raid-asm-a-first-run-has-timings-to-estimate-from` carries it with its probe.

## anything_else

THE VISION PACKET INHERITS RATHER THAN REWRITES, and that is the whole judgment this state owes.

`vp-the-engine` promises consequences attached to a drawing: a state refuses tools, a gate refuses passage, a write refuses a corpus it would break. None of those three moves.

What moves is underneath them — when a hop is allowed to call itself finished. That is why the kickoff sized this `major` while every surface change in it is additive.

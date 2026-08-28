---
form: gate-inputs
bless: blessed by agent
by: agent
signed_off: 2026-08-21T09:02:21.471Z
authors: agent
files: null
---

# Evidence form / gate-inputs

## current_situation

Milestone two is drafted. The boundary is drawn with a binding exclusion list, the roles are re-checked, three stories are written and three use cases generalise them.

This gate judges the user picture before any system-level writing starts.

The coverage counts are computed and are not asked for here. What this gate asks is what a person can see and the engine cannot.

## picture_judged

THE PICTURE IS RIGHT ON ITS ACTOR, and that is the judgment that mattered most.

All three stories name `stk-agent`. The temptation was `stk-engineer-driving-agents`, because nine of the ten propositions serve that role and the resident story on this exact subject, `sty-the-slow-call-that-says-it-is-working`, is written for a person at a screen.

WHY THE AGENT IS RIGHT HERE. The measured failure happened to a program. A caller was told its work failed while the work had moved. A person watching a screen cannot have that failure, because a person does not act on a returned error.

AND THE TWO PICTURES ARE NOW LINKED RATHER THAN COMPETING. The resident story records six pulls that timed out on a hop into a gate. That is the same cause, seen from the other side, and the two stories now point at each other so neither reads as the whole answer.

WHAT THE PICTURE DOES NOT COVER, AND SHOULD NOT. The mirror's presentation of the same answer. It is in the binding excluded list with its reason: the goal is one lane call, and a screen is a different reader with a different question.

ONE THING ABOUT THE ROLE MAP IS UNCOMFORTABLE AND STANDS ANYWAY. `stk-agent` now carries two measured concerns and no proposition is written for it. That is correct — the role buys nothing and its disposition is neutral by design — but the coverage check runs in one direction only, so a role with real pain and no proposition passes silently. Recorded as an observation about the method, not a defect in this map.

## unspecified_capability

THE WALK WAS DONE BY HAND against the live surface, and it found one gap in the resident spec rather than in this change.

WHAT WAS WALKED. The two lane verbs that own work running out of sight, read from `deliverable/engine/tools-run.ts`, argument by argument.

- `se_run`: command, no_tool_reason, background, job, stop, jobs, timeout_ms, cwd.
- `se_test`: question, force, job.

AGAINST THE THREE NEW USE CASES AND THE RESIDENT ONE that governs this area, `uc-quality-performance-efficiency`.

COVERED. Starting work in the background, asking one handle how it is doing, and listing what this session started are all covered — by the resident use case's steps 4 and 5, and by `uc-report-every-piece-of-work-out-of-sight` for the unified form.

COVERED, AND I EXPECTED IT NOT TO BE. Stopping a job and everything it spawned. `se_run {job, stop: true}` does it, and extension 4a of the resident use case carries it. It is not this iteration's to specify, and it is not a hole.

THE ONE REAL GAP, and it is in the resident spec. `uc-quality-performance-efficiency` step 4 says a call that will take longer than the bound hands off rather than blocking. The state's leaving check does NOT hand off — it is awaited inline — so that step was promised at i1 and has never been delivered for this case.

IT IS NOT A FAIL, BECAUSE IT IS THIS ITERATION'S WORK. The gate's rule is that a hole either belongs in the non-goals, argued, or the gate fails until it has a use case. This hole has a use case: `uc-leave-a-state-whose-check-is-still-running`, written in this milestone.

WHAT I DID ABOUT IT. The resident use case now carries two new extensions, 4b and 5a, naming which of its own promises were unmet and which new use case delivers each. The finding is written where the next reviewer meets it rather than only here.

WHAT THE HAND WALK CANNOT CLAIM. It covered the two verbs in this change's cone, not the whole lane and not the machine's doors. A full mechanical check is note-9c5253b4da67 and is not built. Saying otherwise would be a wider claim than the walk supports.

## passes_concrete

CONCRETE ENOUGH TO SCRIPT, and two of the three are scriptable with no watcher at all.

`sty-ask-once-what-is-still-running` IS THE MOST SCRIPTABLE. Start a battery, start a shell command, make one call, assert the answer holds both, assert each entry names a time and a basis, wait, call again, assert the figure moved. Every step is an assertion over a returned value.

`sty-the-step-that-hands-the-walk-back` IS SCRIPTABLE WITH ONE CLOCK. Stand on a state with a long leaving check, pull, assert the answer came back inside a second and says a check is running. Then pull again after the check lands and assert the walk moved. The pass line is a duration and a payload, both readable.

`sty-a-documents-edit-does-not-fire-the-whole-battery` IS SCRIPTABLE WITH A FIXTURE. Change a markdown file only, ask a test question, assert the decision does not name the battery and its reason names the diff. It needs a controlled tree, which is why it is the least cheap of the three.

WHAT MAKES THEM CONCRETE RATHER THAN ABSTRACT. Every deck names a real file and a real line: `session.ts:3686`, `sessionscript.ts:87`, `tools-run.ts:31`, `:44`, `:144`, `:152`, `discipline.ts:455` and `:463`. A slide pointing at a line is a slide somebody can check.

EVERY EVIDENCE HALF IS EMPTY, which is correct at this stage. The story slides are the formulated examples. Scripting is M6 and demonstration is M8, and nothing here claims to be runnable.

WHAT IS NOT YET CONCRETE. What a time remaining means for a plain shell command has no answer, so the second story's step three cannot be scripted for that case yet. Named in the packet twice already and carried rather than glossed.

## round_0_verify

- evidence vs claims: checked by opening the sources. The live tool surface was read from tools-run.ts lines 280 to 299 and 338 to 356 rather than recalled, and every argument was walked. Both new stakeholder concerns were written into stk-agent and read back. All three story references and all three use-case references resolve to files that exist. The resident use case uc-quality-performance-efficiency was opened and its step 4 read directly, which is where the one real gap came from.
- types: not run, and owed. No typecheck verb is legal at this gate and nothing in milestone two touched code.
- lint: not run, and owed. Carried now from three gates: kickoff, motivation and this one. It belongs to the implementation gate.
- tests: not run, and owed. The battery belongs to verification. The two engine edits made entering this record still carry no test.

## round_1_validate

- exercised against the goal: yes, and this gate's own walk is the exercise. Walking the live surface argument by argument is what the state asks for, and it turned up a promise made at i1 and never delivered, which no amount of reading this iteration's own packet would have found.
- missing: what a time remaining means for a plain shell command. Third time it is named, and it is now certain to reach the design because it sits in three signed forms.
- wrong: nothing found wrong. One expectation was overturned: stopping a job looked like an unspecified capability and turned out to be covered by extension 4a of the resident use case.
- out of scope: nothing pulled in. The resident use case gained two extensions naming which of its promises this iteration delivers, which is annotation rather than new scope.
- prior art: Cockburn's shape was followed and that is a borrowed form rather than a comparison. No new prior-art claim is made at this gate, and the M1 comparison stands with its stated limit that the Jenkins derivation rule was not read.

## goals_served

- One lane call reports every piece of work running out of sight, each entry saying how much longer it needs.: served, and its use case is the most fully branched of the three. Seven extensions, including two that collapse into one honest answer when no basis exists. The unified form is specified; the surface it is reached through is deliberately not.
- A step whose leaving condition runs a long program answers at once and hands its verdict back on a later call.: served, and this gate found that the promise predates the iteration. uc-quality-performance-efficiency step 4 has said since i1 that a long call hands off rather than blocking, and the leaving check never did.
- The engine picks which tests answer for a change, so a documents-only edit stops firing the whole battery.: served, and its use case names all seven branches the live code takes, including the two that produce the fallback this iteration narrows.
- Engine improvements, the standing goal, holding the two defects found entering this record.: served. Nothing new was found in milestone two beyond the resident spec gap, which is recorded on the node rather than treated as a defect to patch.

## bound_breaches

- if-agent-harness-to-entrypoint: none breached in this window, and the interface itself was extended rather than crossed. nbr-agent-harness listed cancellation as a harness-controlled limit with no consequence attached; it now carries the consequence, because a call outliving that limit is reported to the agent as a failure the lane never hears about. THE SIX mirror_slow RECORDS NAMED AT THE MOTIVATION GATE STILL STAND and no more were sought here, because nothing about milestone two would change their count. They remain uncaused and unminted, and the motivation gate's follow-up says which state should mint an entry once a cause is established.

## round_2_red_team

- The hand walk is not a walk: two verbs out of a lane of thirty is a sample, and calling it a survey of unspecified capability is the disclosure this gate exists to refuse. => Partly right and it is stated in the field rather than hidden. The walk covered the change's cone, which is what the row scopes it to for a change rather than a product. What makes it more than a sample is that it was done argument by argument against the live schema, and it overturned one of its own expectations. What it cannot claim is coverage of the lane or the doors, and note-9c5253b4da67 is the mechanical check that would.
- The gate found a gap and passed anyway, which is the exact failure the row names. => The row's rule is that a hole either belongs in the non-goals argued, or the gate fails until it has a use case. This hole has a use case, written in this milestone, and the resident node now names it. Passing with a hole that has an owner is different from passing with a hole that has a list entry.
- The picture serves a role nothing is being built for: stk-agent buys nothing and its disposition is neutral by design, so a picture centred on it may be a picture of the builders' convenience. => The role's neutrality is about goodwill, not about whether the product serves it. The propositions are written for who chooses the product; the concerns are written for who the product must serve. A failure measured on a role with no proposition is still a failure, and it happened.
- Three stories and three use cases is one-to-one, which usually means the generalisation did no work. => It is the fair test and the answer is in the extensions. The stories carry eighteen slides between them and the use cases carry twenty-two branches, most of which no story tells. Three of those branches were new findings rather than restatements. A one-to-one map with a branch count like that is generalisation that worked.
- The gate still judges work it authored, unchanged from two gates ago. => True, and now two gates deep. The one thing that is different here is the same thing as last time: the strongest finding came from an artifact written at i1 by somebody answering a different question.

## raid_additions

- none

## verdict

pass — the picture is right on its actor, the live surface was walked argument by argument, and the one gap it found has a use case rather than a list entry

WHAT THE PASS RESTS ON. A hand walk of the two verbs in this change's cone against four use cases, which overturned one expectation and found one promise made at i1 and never delivered.

WHAT IT DOES NOT CLAIM. That the walk covered the lane or the machine's doors. It covered the change's cone, and the mechanical check that would cover the rest is not built.

WHAT IT DOES NOT CLAIM, SECOND. Lint, types and tests are owed from three gates now, and every one of them says so rather than leaving the field blank.

WHAT THE COVERAGE CHECKS ALREADY PROVED, so this gate did not restate them: every proposition has a story, and every story sits inside a use case. Both are computed and both are green, or the feeder states would not have signed.

THE DISSENT WORTH RECORDING. Three stories and three use cases is one-to-one, and that shape usually means the generalisation was mechanical. Here it was not, on the branch count, but a reviewer is right to check that first.

## follow_up

Milestone three comes next: the requirements, derived from these use cases' steps and extensions.

Three things are parked with their owners.

- What a time remaining means for a plain shell command is now named in three signed forms and belongs to the requirements.
- Extension 7a of the first use case says a verdict whose ground moved while it ran is stale, and nothing decides how staleness is detected. That is the design's.
- The lint and test debt from round zero is carried from three gates and belongs to the implementation gate.

## anything_else

THE BEST FINDING IN THIS GATE WAS FIVE MILESTONES OLD.

`uc-quality-performance-efficiency` was written at i1. Its step 4 says a call that will take longer than the bound hands off rather than blocking, and returns a handle.

The state's leaving check has never done that. The promise sat in a signed use case for fifty iterations while the behaviour underneath it went the other way.

WHAT WOULD HAVE CAUGHT IT SOONER. Nothing that exists. A use-case step is prose, and nothing compares a step to the code that ought to satisfy it.

That is worth more than one finding. It is the shape of a check nobody has built.

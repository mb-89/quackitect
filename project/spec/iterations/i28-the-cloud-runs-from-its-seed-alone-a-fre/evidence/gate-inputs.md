---
form: gate-inputs
amended: "2026-08-15T15:29:52.947Z by agent — The story this gate judged was withdrawn as a duplicate on the owner's check, and the offline answer it rested on contradicted a standing ruling."
bless: blessed by human
by: agent
signed_off: 2026-08-15T15:22:12.718Z
authors: agent
files:
---

# Evidence form / gate-inputs

## current_situation

M2 is complete. draw-context, map-stakeholders, write-stories and generalize-use-cases are all signed.

WHAT M2 ADDED, after two owner corrections on 2026-08-15: one neighbour node for the cloud, two concerns on standing roles, one slide on a standing story, and one use case with nine extensions. The register stands at nine entries.

THE STORY THIS GATE FIRST JUDGED IS WITHDRAWN. A new story was written for the unattended machine and removed the same day, because the owner asked whether it overlapped the bootstrap story and it did. What survived is one slide on [[sty-work-on-two-machines]], and the use case now refines that story.

THIS GATE IS SUBMITTED UNBLESSED, on the owner's ruling that gates become strategic and a tactical dial blocks them.

## picture_judged

ARE THESE THE RIGHT JOURNEYS. Yes, and the set did NOT need a new one — which is the correction this gate now carries.

WHAT WAS TRIED AND WITHDRAWN. A story was written for a machine nobody configured. The owner asked whether it overlapped the existing bootstrap story. It did, on nearly every slide:

- installing and booting belong to [[sty-ramp-up]] by the method's own rule that they live in that one story
- seeing seeds in git and claiming belong to [[sty-work-on-two-machines]]
- walking unattended to a gate belongs to [[sty-hand-over-and-walk-away]]

SO THE JOURNEY ALREADY EXISTED and only one fact about it was new: the second machine need not be one anybody owns or configured. That is now a slide on the story that already owns the goal.

THE LESSON THE GATE SHOULD HAVE CAUGHT ITSELF. A new story is the expensive answer and the overlap check is cheap. This gate passed the first version without running that check against all 27 standing stories, and a person caught it instead.

IS ANY STORY WRONG. One remains questionable and it is not one this iteration wrote. [[sty-hand-over-and-walk-away]] slide 7 says the kickoff gate stops the walk because the change size is the person's decision. This iteration's kickoff was blessed by the agent, because gate rows carry tactical autonomy. THE STORY WAS RIGHT AND THE MATRIX IS WRONG, and the owner ruled gates become strategic.

## unspecified_capability

EVERY CAPABILITY THIS ITERATION PUTS IN SCOPE, checked against the use cases one by one.

- THE OPEN TEST READING FROM GIT: covered, [[uc-start-an-unattended-machine]] step 4, with extension 4a for the unreachable remote.
- MATERIALISE ON ENTRY: covered, step 5.
- THE CLOSE REMOVING THE FOLDER: covered by [[uc-close-a-record]], which is the actor goal it belongs to.
- THE GREYED CLAIMED ITERATION: covered, extension 5a, which names the holder and refuses.
- ENTERING OFFLINE: covered, extension 5b — the claim is attempted, fails, WARNS, and the walk continues unclaimed with the desync risk accepted. This is a correction: the first version of this milestone said entering offline was impossible, which contradicted a ruling settled before the iteration opened.
- THE FETCH REFSPEC: covered, step 4.
- THE ENTRYPOINT AND ITS ONE-SENTENCE FAILURE: covered, steps 1 to 3 and extension 2a.
- THE PORT LIFECYCLE: covered, extensions 3a and 3b, which also resolve an apparent contradiction with [[uc-install-quackitect]].
- THE HEALTH ANSWER: covered, step 3.
- itAdopt AS A LANE VERB: covered, step 5.
- SURVIVING BACKGROUNDING: covered, step 3.
- ENTRY NEVER REQUIRING REPAIR: covered across extensions 2a, 4b and 5a.
- ALL GATES CAN WRITE: covered by [[uc-adjudicate-a-gate]], whose actor goal is unchanged and whose means are what this widens.

TWO THINGS ARE DELIBERATELY UNCOVERED, each with its reason.

- THE ONE-TIME DISK SWEEP of 27 stale folders is a MIGRATION ACT inside the build, not a capability the product ships. After this iteration no folder can go stale.
- THE WORKTREE LANE VERB exists so the agent can perform the close, and the close is [[uc-close-a-record]]. Retiring a worktree is not a goal any actor holds.

NO IN-SCOPE CAPABILITY IS LEFT UNCOVERED.

## passes_concrete

IS EVERY PASS SCRIPTABLE AT M6. The unattended pass is, and it is now told on [[sty-work-on-two-machines]] rather than in a story of its own.

WHAT IS CONCRETE ENOUGH TO SCRIPT, from that story plus the use case beneath it:

- a bare host with a shell and a network route and nothing else, which a fixture can build
- an observable per step: a clone completing, a lane answering its health check, git returning an iteration that was never on disk, a claim recorded or warned about, a folder appearing
- a named exit per failure rather than a mood, so the assertion is a string rather than a feeling

WHAT IS NOT, AND WHY IT IS NOT A WRITING DEFECT. The end state asserts two machines and an archive that reads the same from either. Scripting that needs a second machine this one cannot make. It is [[raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make]], owned by the owner.

THE EVIDENCE HALVES on the new slide and on the use case's extensions are OWED rather than blank, so a reader at M8 knows what to fill.

## round_0_verify

- evidence vs claims: pass — every claim in M2 cites a node, a line of code or a measurement, and the two judgments that cannot be checked from here are stated as judgments
- types: pass by vacuity — M2 changed no code, and the four nodes written are markdown
- lint: NOT RUN and not claimed — se_lint is refused at a gate under SE-C-110, which is now the owner's own case for making gates able to write; nine register entries, one story, one use case and one neighbour stand unlinted
- tests: NOT RUN and not needed — the last battery stands green at 1314 of 1314 from i12's close and no code has changed since

## round_1_validate

- exercised against the goal: pass — M2 turned the goal into one journey with a starting state, six steps and nine extensions that requirements can be derived from
- missing: no in-scope capability is uncovered, and the two deliberate exclusions carry reasons; what is missing is the demonstration, which is a named debt
- wrong: TWO THINGS WERE WRONG AND ARE NOW CORRECTED, both caught by the owner rather than by this gate — a new story that duplicated three standing ones, and an offline answer that contradicted a ruling settled before the iteration opened; a third stands open, since sty-hand-over-and-walk-away says a person blesses the kickoff and the matrix let the agent do it
- out of scope: the disk sweep and the worktree verb are covered by build steps rather than use cases, with the reason on each
- prior art: not re-made at M2, deliberately — the comparison was made at M1 against Codespaces, Gitpod, devcontainers and our own written handover, with what each does better stated first, and nothing in M2 changed the field

## round_2_red_team

- STEELMAN: one use case and no new story is a thin M2 for a MAJOR change => answered by the coverage check rather than by assertion, since every in-scope capability maps to a step or an extension; and thinness was the CORRECT answer here, because the first attempt added a story that duplicated three standing ones
- THE GATE PASSED A DUPLICATE STORY ON ITS FIRST ROUND, and a person caught what the review did not => conceded without defence; the overlap check against 27 standing stories is cheap and was not run, and this gate's own picture_judged field is exactly where it should have happened
- THE OFFLINE ANSWER CONTRADICTED A STANDING RULING and was carried through M1's gate into M2 => corrected in the register entry, the use case and both gates; the lesson is that a finding folded upstream at a pressure test never got checked against what had already been decided
- THE USE CASE MAY BE TWO, at six steps and nine extensions => kept as one, because splitting creates a use case whose guarantee is a machine that is ready and doing nothing, which is the failure this iteration removes
- KILL-CRITERION FOR M2: this milestone is wrong if a capability in scope has no pass anybody described => looked for capability by capability, thirteen in scope and all thirteen covered
- THE GATE IS JUDGING ITS OWN AUTHOR'S WORK, with no second reader => true, unchanged, and demonstrated twice today by the two corrections above; the owner's ruling that gates become strategic is the first real answer to it

## raid_additions

- none

## verdict

pass — every in-scope capability maps to a step or an extension, the journey set is right at 27 rather than 28, and the two deliberate exclusions carry reasons a reader can argue with.

THIS VERDICT SURVIVED TWO CORRECTIONS RATHER THAN PRECEDING THEM, and that is stated rather than smoothed. A duplicate story and a wrong offline answer both passed this gate's first round and were caught by the owner. The verdict is unchanged because neither correction removed a capability from coverage; what changed is that the picture is now right.

THE THUMB IS NOT MINE. Submitted and left unblessed. The owner ruled on 2026-08-15 that gates become strategic, so a tactical dial blocks them, and the dial stands at tactical.

WHAT A READER SHOULD CHECK FIRST: the unspecified-capability list. It is the field that can fail this gate, thirteen items walked one at a time.

NO OVERRIDES.

## follow_up

- THE BLESS IS OWED BY THE OWNER, and the walk stands here until it comes
- M3 derives requirements from the eight extensions, and extension 4a is the offline constraint in its testable form
- M3 settles mechanically whether the adjudicator is a role of its own, by whether the authorised-in-advance requirements source to a role that exists
- the lint sweep is still owed and has now been refused at two gates, which is the owner's own case for gates being able to write
- the crashed-walk assumption has a written probe and it has not run
- nothing is parked from this state

## anything_else

RAID ADDITIONS ARE `none` AND THAT IS A REAL ANSWER RATHER THAN A SHRUG. This review looked for an assumption this milestone treats as true without establishing it, and the only candidate was already recorded: whether the unattended operator is a role of its own. map-stakeholders logged it with a mechanical test at M3 rather than a belief, so a register entry would duplicate it.

The verdict is a plain pass, so the rule that `pass with overrides` refuses while additions say none does not apply here.

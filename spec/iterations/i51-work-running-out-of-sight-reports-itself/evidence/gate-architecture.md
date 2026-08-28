---
form: gate-architecture
bless: blessed by agent
by: agent
signed_off: 2026-08-21T10:28:52.579Z
authors: agent
files: null
---

# Evidence form / gate-architecture

## current_situation

The decomposition stands and the walk is done.

ONE NEW ELEMENT, [[el-work-registry]], holds every piece of long work in one place. Two functions that had no implementer now have one each.

FIVE CROSSINGS WERE OWED and all five are declared. Three are new nodes, one joined a standing contract, and one is minted for a flow that leaves the system.

FORTY-EIGHT QUALITY SCENARIOS ARE RULED. Seven moved and five were ruled for the first time.

TWO NEW RISKS ARE IN THE REGISTER, both from the same source: a step's third standing is true only while a process is alive.

THE BATTERY RAN GREEN TODAY at 09:11:44Z — 1716 tests, 0 failed. Nothing since then touched a line of TypeScript; every edit in M5 was a markdown node.

## round_0_verify

- evidence vs claims: every verdict line names the node it rests on, and the two moved-to-at-risk lines each cite the requirement's own breaks_if_removed rather than a paraphrase. The one-second figures come from the standing risk entry, dated.
- types: not run — se_run and se_test are not legal in this state or the two before it. No TypeScript changed in M5, so the last green still covers the tree.
- lint: not run, same reason. Every edit was a markdown trace node, and each passed the item template's own checks at write time or was refused.
- tests: green at 2026-08-21T09:11:44Z, 1716 tests and 0 failed, recorded in .se/test-last-run.json.

## round_1_validate

- exercised against the goal: yes. The goal is one call listing every background job with how much longer it needs, plus a long exit script that stops freezing the pull. The registry answers the first and the handback answers the second, and each has an element and a contract.
- missing: the rule for what a fresh session does with a step it finds still deciding. Recorded as a fatal risk rather than invented here, because it is M7's choice.
- wrong: one thing was, and is corrected. flow-work-under-way said the world takes it and had no producer, so the matrix could compute no crossing for the work itself.
- out of scope: the screen. flow-work-account says in its own body that whether the account reaches a display is outside this iteration, and no element paints anything.
- prior art: the shell job table in deliverable/engine/tools-run.ts is the seed the new element grows from, named in its realization paragraph rather than reinvented.

## goals_served

- One lane call reports every piece of work running out of sight, each entry saying how much longer it needs.: served by [[el-work-registry]], which holds every kind in one list and returns a duration with its basis beside it.
- A step whose leaving condition runs a long program answers at once and hands its verdict back on a later call.: served by [[el-walk-engine]] implementing the handback, with the verdict landing through [[if-walk-engine-to-work-registry]].
- The engine picks which tests answer for a change, so a documents-only edit stops firing the whole battery.: served by [[el-test-runner]], which carries req-a-diff-no-test-answers-for-is-reported-not-swept; the structure did not move for it, and the demand is on the function it already implements.
- Engine improvements, the standing goal, holding the two defects found entering this record.: served. The freeze is the handback and the missing job list is the registry, and both defects now have an element rather than a note.

## bound_breaches

- if-agent-harness-to-entrypoint: still breached and narrowed by this change. The standing measurement is 89 of 1520 lane calls over the second, 87 of them se_pull, p99 16285 ms. The inline await at deliverable/engine/session.ts:3686 is the largest single named contributor and the handback removes it. The rest of the serving loop's walk computation is untouched, so the breach stays open and the entry stays open with it.

## round_2_red_team

- The registry dies with the session, so a detached job started by an earlier session is invisible to the account that claims to list everything => accepted, and it is the same hole as [[raid-ar-walk-resumes-from-repo]]. The registry is session-scoped on purpose; a durable one would be a second record store. The risk carries it to M7 rather than the design pretending otherwise.
- The account rides every answer, so a caller that never asked for it pays for composing it => priced, at [[raid-ar-one-operation-reads-its-input-once]]. The mitigation is that the registry already holds the list, so the account is a read and not a computation. The cost that remains scales with live operations and is not measured.
- flow-work-under-way has three producers and only two are modelled as functions => argued at decompose-structure. The third is a background shell command, whose job table lives inside the registry itself, so nothing crosses a boundary there.
- [[if-work-registry-to-walk-engine]] is undemanded and the matrix will flag it on every look => accepted cost. The alternative was adding an input to serve-a-step, a function signed in i1, to record a fact about this design. A permanent flag is cheaper than a mechanism leaking into the solution-neutral layer.
- The duration's basis rests on one measurement of one battery => true, and it is the weakest evidence in the design. [[raid-asm-battery-timings-measure-work]] holds it as an assumption. The mitigation is structural rather than statistical: the basis travels beside every figure, so a reader can discount it.
- el-walk-engine now implements ten functions and is the largest element in the tree => real cohesion cost, and splitting it would be worse. The handback shares serve-a-step's own flows, so a separate element would mint interfaces on the hottest path in the system.

## raid_additions

- [[raid-ar-walk-resumes-from-repo]]
- [[raid-ar-a-machine-decision-repeats]]

## verdict

pass — the decomposition closes both function holes, every owed crossing is declared, all forty-eight scenarios are ruled, and the two costs this architecture carries are in the register with owners and triggers rather than in prose. THE STRONGEST CASE FOR FAILING IS [[raid-ar-walk-resumes-from-repo]], which is graded fatal against a fatal must. It does not fail this gate because the structure has the place to put the answer — req-a-pending-verdict-is-recorded-against-its-state and the settle call on [[if-walk-engine-to-work-registry]] — and what is undecided is the rule a fresh session applies, which is M7's to choose. It must close in M7 and not later.

## follow_up

M6 IS NEXT: rank-unknowns, run-spikes, fold-back, then gate-prototype.

TWO RISKS RIDE INTO IT and both are ranking candidates. [[raid-ar-walk-resumes-from-repo]] is the fatal one and its unknown is cheap to probe: what does a fresh session see when a step is left deciding.

[[raid-ar-a-machine-decision-repeats]] is the second. A recorded start time is the likely answer and it has not been compared against waiting for the window.

ONE STANDING RISK NEEDS CLOSING, not carrying. `raid-ar-work-past-its-bound-says-it-is-working` stands against a requirement this architecture now answers.

GIT IS STILL OUT OF REACH. se_git is legal at M7_40_build-steps and three later states, and nothing is committed yet. The owner has said committing at milestones is fine; the machine decides where.

## anything_else


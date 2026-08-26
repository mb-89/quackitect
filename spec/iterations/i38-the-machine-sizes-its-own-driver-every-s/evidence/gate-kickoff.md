---
form: gate-kickoff
bless: blessed by agent
by: agent
signed_off: 2026-08-20T09:36:27.690Z
authors: agent
files: null
---

# Evidence form / gate-kickoff

## current_situation

i38 is seeded and unwalked. Its record carries seven owner rulings from the discussion that seeded it, written into record.md rather than left as notes, because .se/ never travels.

The onboard-retro signed with an empty inbox: nothing pended, so nothing was drained.

The matrix this iteration is about stands at 53 rows carrying 89 evidence fields between them. Nothing in project/deliverable/ carries a complexity key, a model list, or a model field on the call record today - all three are this iteration's work.

The walk is on a cloud box at strategic autonomy with the stop notch at blockers only, so this gate is the agent's to bless.

## retro_drained

- none — the inbox stood at zero on se_survey before the onboard-retro was entered, so nothing was pending and nothing was judged.

## goals

- Every state in the rigor matrix carries a complexity rating on a five-rung ladder (C0 derive, C1 transcribe-or-rule, C2 apply, C3 author, C4 frame), each rated with evidence rather than asserted.
- ONE fixed model list lives in the repo, identical on every host, mapping each rung to a model name.
- Each milestone names the driver it needs before it is walked, computed live from the matrix and never pinned into a record's demands.
- Every call in the lane records which model actually answered it, so a walk can be attributed after the fact.
- A submachine takes the MAXIMUM complexity over its items, so one walker strong enough for the hardest item walks all of them and a fan-out never becomes a fleet.

## pulled_in

- The five-rung complexity ladder C0..C4 — from the seeding discussion of 2026-08-20, written into the record because it existed only in a chat artifact a walking agent cannot read.
- The bounded fan-out ruling — owner, 2026-08-20, correcting an earlier reading that fan-out should be dropped.
- The cast: a guide that never pulls, a walker that does, a reviewer at gates, a researcher where research is asked for — owner, 2026-08-20.
- The engine names the driver and never spawns it — owner ruling of 2026-08-20, on the record.
- The fixed model list, and the asymmetry that a stronger model needs no argument while a weaker one needs a recorded reason — owner, 2026-08-20.
- The read-live constraint: complexity is read from the matrix, never pinned into seeded.json demands — a hazard found before building, on the record.
- The measured split of drawn versus authored evidence fields — this iteration's own C0 evidence, on the record, and re-counted at this gate.

## left_out

- Per-host model resolution and runtime model discovery — explicitly rejected on the record: a system that behaves differently per machine is the thing being avoided.
- The autonomy-by-complexity grid — considered and dropped on the record; two independent lookups instead, because the cell says nothing the row and column do not.
- Engine-side agent spawning — stays outside the machine; the milestone names the driver and whoever is driving performs the spawn.
- The ratings themselves as seed input — they are this iteration's work and belong in states with evidence behind them, never pasted in from the discussion.
- The three engine leads this run's retro found (a remedy naming a script where a verb exists, group_by clause returning (none), an unknown filter key answering instead of refusing) — out of scope here, written into the iteration's field report so they outlive this box.

## change_size

major — the walk is FLAT by declaration (iterations.ts:5) and a milestone is a string cut off a filename (rigor-matrix.ts:363), so naming a driver per milestone has no seam and every way of making one edits a row's depends_on, which is the first element of shapeOf and reopens standing claims.

## round_0_verify

- evidence vs claims: EVERY MEASURED FIGURE IN THE SEED IS ONE SWEEP OUT OF DATE, and the sweep predates i9's M5_27 graft-onto-the-winner of 2026-08-19. (a) 52 states claimed, 53 on disk; tests/rigor-matrix.test.ts:68 already asserts 53 and line 66 dates the change, so the seed's warning that the test will turn red is spent. (b) 86 evidence fields claimed, 89 declared across 43 of the 53 rows. (c) 23 drawn fields claimed; re-derived independently as 25 of 89, and the two extra are graft-onto-the-winner's own — I had first let the 23 stand as undisputed and that was wrong, the numerator is stale by the same row as the denominator. (d) the seed says M0 through M3 hold ONE drawn field between them; there are three (onboard-retro notes_drained, gate-kickoff retro_drained, probe-assumptions probes) — the qualitative claim that the front half is authorship survives, the number does not. (e) the seed says there is no agent-spawning code anywhere in the engine; engine/bin/se-start.ts:225 declares launch(), :242 probes with spawnSync(agent, ["--version"]), :245 spawns it with the briefing, and :278 defaults the command to claude, overridable with --agent. The narrow claim survives — the RUNNING lane never spawns — but the inference from it does not: the per-harness adapter the seed says would be needed already exists and is one argument wide. The ruling stands on the lane's grain, which never needed the premise. A third stale count sits outside the record entirely, at project/guidance/method/tour.md:70, which tells a newcomer the matrix has 50 rows.
- types: not run here, and not skipped silently — this gate's legal tools carry no se_test and no se_run, so the check belongs to a state that has them. What is known: boot's smoketest and the conformance sweep ran green on this box at 09:10 (smoke 0.5s, sweep 1984 nodes in 716 ms) over the same tree, and nothing has been written to project/deliverable since.
- lint: not run here, same reason and same evidence. preflight went red once on this box and only on the prompt-layer projection being stale on a fresh clone; it passed after one re-place, with all four other scripts green.
- tests: NOT RUN ON THIS BOX AT ALL, and that is a real gap rather than a formality. record-inspect said so on the way in: no test verdicts stand in the log, so its own item 12 proved nothing. The battery is the engine's and fires at verification; nothing at M0 may call it. i38 therefore opens with no green baseline measured HERE, only the one carried in the repository.

## round_1_validate

- exercised against the goal: PARTLY, AND THE PART THAT IS NOT IS NAMED. The goal has five limbs. Limbs 1, 2 and 5 (rate every state, one fixed list, a submachine takes the max) are coherent, scoped and buildable from where this gate stands. Limb 3 (each milestone names its driver) is exercised only as far as discovering that it has no seam to land on, which is the finding that sized the column. Limb 4 (every call records which model answered) is exercised as far as the transport, and the transport carries no model — so the limb is reachable today only by self-report. Nothing here has been BUILT, correctly: M0 sizes the bet and the machine below grows to match.
- missing: THE ERROR SIGNAL, AND IT IS THE LARGEST GAP. Every live routing system compared against carries one and ours has none — nothing in the design tells us a rung is wrong. Also missing: the fallback contract, undefined for a named model a host cannot serve; the reconciliation report that would compare a declared rung against what the work turned out to need; the test assertion holding complexity out of the demand ledger; and the state that produces 53 rated rows, which no row is yet named to hold.
- wrong: THE FAN-OUT COST FIGURE IS RIGHT AND ITS BASE IS NOT OURS. The record cites roughly fifteen times the tokens for a parallel setup, from Anthropic's multi-agent research system write-up of 2025-06-13. The primary source says multi-agent runs use about 15x the tokens of a CHAT interaction and that a single agent already uses about 4x chat. Our baseline is an agent walk, not a chat, so against our own baseline the multiplier is nearer 3.75x. The bounding ruling survives — 3.75x is still expensive — but a state that budgets against 15x will over-bound by about four-fold. The same post also reports that token usage alone explains 80% of the variance on its benchmark, which cuts against the topology argument and for the cheaper lever.
- out of scope: The three engine leads from this run's retro (a remedy naming a script where a verb exists, group_by clause returning (none), an unknown filter key answering instead of refusing). The tour.md row count. The subagents.md seam between a rated state and an ad-hoc task. The reconciliation report, which is a whole mechanism and its own record. Each is in the iteration's field report with its durable home named.
- prior art: SCANNED AT THE GATE by a researcher against primary sources, and it found us on the wrong side of a well-measured line. THE FIELD SPLITS: everyone who SHIPS A ROUTER computes difficulty at runtime and is corrected by outcomes — Cursor's Compass emits a continuous 0-1 complexity score trained on live traffic and labelled by whether the user proceeded or corrected (68% and 41% cost reductions, improving after launch purely from retraining); Bedrock Intelligent Prompt Routing predicts per-request response quality against a tunable threshold; OpenRouter's Auto Router classifies into ~30 task types and ranks on a rolling 7-day spend index. Every agent FRAMEWORK, by contrast, declares statically like we do — Claude Code's subagent model is frontmatter defaulting to inherit, the OpenAI Agents SDK makes it a constructor argument and offers no routing, LiteLLM's router strategies are all about infrastructure state rather than task difficulty. WHAT THEY DO BETTER, first: they have an error signal and we have none, so nothing in our design can ever tell us a rung is wrong. WHAT THE SCHEDULERS LEARNED, and it is older and harsher: Kubernetes REFUSES to let anyone declare a QoS class — it is computed from requests and limits, a consequence of measurable quantities rather than a label an author types, which is exactly the inversion of our authored rung. Google's Autopilot measured hand-managed jobs at 46% slack against 23% autopiloted, and Cast AI's 2026 report over 23,000+ clusters found 69% of requested CPU unused, cause stated as configurations that rarely get updated. THE STRUCTURAL LESSON: in every one of these systems under-declaration fails LOUDLY and over-declaration fails SILENTLY, which is why measured drift always runs toward over-provisioning — and a state marked C4 that is really C1 costs forever and raises no signal. Our bounded fan-out makes that worse by construction, since taking the maximum over a submachine turns one hard item into N expensive ones. WHAT OURS SHEDS AND WHY THE TRADE IS DEFENSIBLE ANYWAY: we shed per-item resolution, the feedback loop and the measured cost/quality frontier; we keep DETERMINISM AND DISCLOSURE, which the live systems give up — Cursor hides the routed model by default, Copilot code review never discloses it, and both accept it varying between turns. For an auditable process that is the right trade and it is the one axis where we are ahead. TWO-AXIS SEPARATION IS WELL FOUNDED: GitHub Actions puts runner selection in runs-on and human approval in environment protection rules, configured entirely separately — the grid was rightly dropped. THE C2/C3 SEAM IS NOVEL AND UNVALIDATED: rating work a priori by whether a checker could catch a wrong answer is, as far as the scan established, mirrored by no shipped system. What production does is CASCADING — run cheap, verify the OUTPUT, escalate on failure — which is the same judgment made after generation rather than before it. The nearest published proposal (arXiv:2604.07494, April 2026) routes SWE tasks to tiers on COMPUTED code-health metrics and its own author says it is an idea not yet proven. Bloom's taxonomy is the closest shape and is used in research on LLMs, never as a shipped routing key. NOT ESTABLISHED, said rather than left blank: whether Martian's router is still a shipped product; whether Not Diamond powers OpenRouter's Auto today; and whether Langfuse, LangSmith, Helicone or Braintrust carry a distinct requested-versus-served model field — one API-reference fetch each would settle the last.

## bound_breaches

- if-agent-harness-to-entrypoint: BREACHED and measured. Bound is one second; four se_pull calls exceeded it over 88 records — 8341 ms entering the iteration, 3025 ms at boot/prepare_idle, 2901 ms entering the front desk, 1053 ms entering this gate, plus a 1928 ms record predating the first pull that belongs to the lane's own startup. All four are state-boundary costs (compiling a machine, running five conformance scripts, re-walking a drawing) rather than per-call costs, and the ordinary working calls answered well inside the bound. Not i38's to fix and not waved through: the node already carries this shape from i33's measurement of 1834 slow calls in 8424, so it is a standing breach with a home, recorded in this iteration's field report and owned by the milestone that owns lane latency.

## round_2_red_team

- STEELMAN, THE CASE FOR minor ARGUED AT ITS STRONGEST (put to a reviewer with no shared context, and it came back stronger than expected): the design space is already closed, so the 24 rows minor strikes — all of M6, most of M5, M4's enumerate-space through gate-design — have nothing to select among, because the record's seven rulings killed the grid, per-host resolution, engine-side spawning and pinning by name; every change named is ADDITIVE (a new frontmatter key, a new optional field beside an already-optional actor, one new data file), and "the architecture holds" is exactly what an additive change predicts; the blast-radius hazard argues FOR minor because the record already designed it away, and citing a mitigated hazard as a reason to size up is having it both ways; and the gate row says more than three goals argues for major, while goal 5 is a sentence of the same mechanism as goals 1 to 3 => TAKEN SERIOUSLY AND NOT DECISIVE. The first argument is the strongest and it establishes that the struck states would be CHEAP, never that the architecture HOLDS — different questions, and only the second one sizes the column.
- THIS BRIEF CONTRADICTED ITSELF, and the contradiction turned out to be the whole answer: goal 3 says each milestone's setup names the driver before the milestone is walked, while the first draft's "what does not move" line said the state graph does not move => BOTH CANNOT BE TRUE, AND THE FIX IS THE FINDING. There is no milestone-setup seam. engine/iterations.ts:5 declares the walk FLAT — milestones are groups on the states, never sub-machines — and rigor-matrix.ts:363 derives a milestone by splitting a filename on an underscore, so a milestone has no open, no close and no state. Goal 3 needs new rows or a first-class boundary, and either moves the graph. change_size now names THAT cone; the one it entered with was wrong.
- THE RECORD LOCKED THE HASH DOOR AND LEFT THE SHAPE DOOR OPEN, and the same iteration walks through it: iterations.ts:294 stores shape on every demand, :329 defines shapeOf over [depends_on sorted, busbar, seeds, runs], and :350-364 reopens a step when the two shapes differ, with the absent-shape escape at :357-359 shielding only pins taken before the field existed — live pins in i9, i36 and i27 carry shape on every demand => REGISTERED AS A RISK with the reading behind it. Inserting a state before a milestone changes the following row's depends_on, moves its shape, and reopens that step and its downstream cone in every standing iteration. Four stand open and i9 alone pins 53 demands. This is the expensive one and it was found by a reviewer, not by the walker.
- THE RECORD'S RESOLUTION THAT COMPLEXITY STAYS OUT OF THE DEMANDS IS PROSE WITH NO MECHANISM UNDER IT — verified true today, since demandOf serialises evidence-field structure and shapeOf reads four named keys and a new frontmatter key enters neither => TRUE NOW, UNGUARDED LATER. One test assertion would hold it and it does not exist. Named in the risk entry rather than built here; building it is not M0's work.
- GOAL 4 HAS NO MECHANISM AT ALL: engine/mcp.ts:58 and :68 declare clientInfo as {name, version?}, the transport carries no model and no environment variable does either, so the answering model can only be self-reported by the agent being measured => REGISTERED AS AN ASSUMPTION, and load-bearing, because the design's one safety rule asks a weaker model to declare that it is the weaker model.
- ONE FIXED LIST IS ASSUMED PORTABLE while engine/harness.ts registers three hosts of which two are GitHub Copilot and do not serve our vendor's model-name namespace => REGISTERED AS AN ASSUMPTION, with the resolution that keeps the ruling intact: one list in the repo, identical everywhere, with a wider row, is not per-host RESOLUTION.
- A STANDING OWNER GRANT CONTRADICTS THE FIXED-LIST RULING — project/guidance/method/subagents.md:31 reads "JUDGE IT PER SUBAGENT (owner grant 2026-07-11). There is no fixed mapping and none should be invented." => RESOLVED RATHER THAN OUTRANKED, because letting the newer ruling simply win would drop a half that is still true. The two govern different subjects: subagents.md governs an AD-HOC TASK the walker invented, where no rating exists and there is nothing to look up, and there the walker judges from what the answer does; i38's list governs a RATED STATE, where the machine holds a value and a lookup is not an invention. The seam is rated-state versus ad-hoc-task, and both halves stay true across it. The seam is written down nowhere yet, and that is follow-up.
- THE RATINGS ARE NAMED AS THIS ITERATION'S OWN WORK AND NO STATE IS NAMED TO HOLD THEM, though 53 rated states with evidence behind each is a substantial authored artifact => UNRESOLVED AT M0 AND CORRECTLY SO. Which row produces it is M1's and M3's question. Named here so it is not discovered late.
- KILL-CRITERION, NAMED AND LOOKED FOR: major is the wrong call only if BOTH (a) the state graph does not move, the driver being named inside a row that already exists with no new rows and no changed depends_on, AND (b) the design space really is closed so the struck states have nothing to select among => NOT MET. (b) IS met — the record closes every alternative by name. (a) is NOT, and cannot be established from where this gate stands, because the flat walk has no seam and every way of making one edits a dependency. THE TRIPWIRE: if a later state finds a way to name the driver inside an existing row with no dependency edit, (a) becomes true, both halves hold, and this column was too heavy. That tripwire is written into the risk entry as the thing that would make the cascade not happen.
- SO WHAT SURVIVES: major survives, on a different argument than it entered with => IT ENTERED CITING A HAZARD THE RECORD HAD ALREADY DESIGNED AWAY, and it leaves citing a seam that does not exist and a cascade door nobody had opened.

## raid_additions

- raid-risk-naming-a-driver-per-milestone-moves-the-step-shapes-and-reopens-standing-claims
- raid-risk-a-hand-declared-rung-drifts-upward-and-nothing-ever-says-so
- raid-asm-the-answering-model-can-be-recorded-when-only-the-agent-knows-it
- raid-asm-one-model-list-serves-every-host-the-engine-supports
- raid-iss-the-engine-does-spawn-an-agent-and-the-seed-says-it-does-not
- raid-iss-the-i38-seed-counts-a-matrix-that-has-since-moved

## verdict

pass with overrides — the column is right and six register entries stand open behind it: the milestone seam has no home and every way of making one reopens standing claims, the rung has no error signal, the answering model can only be self-reported, one list is not one list across hosts, and two of the seed's own claims are false.

## follow_up

- M1 opens with the ratings themselves. They are the iteration's own work and want evidence per state, not a pasted table.
- The three corrections to the seed recorded at this gate travel with the record, so the states below rate against the live matrix rather than the seed's counts.
- The field report at project/spec/iterations/i38-the-machine-sizes-its-own-driver-every-s/field-report.md is the durable home for anything this run finds that is not i38's own work. It exists because .se/ dies with the container.

## anything_else

FIVE THINGS THE PRIOR-ART SCAN SAYS ARE WORTH STEALING.

Input to the design states below, not decisions taken here — M0 sizes the bet
and does not make the design.

1. DERIVE THE RUNG INSTEAD OF TYPING IT.

Require every state to name what will judge its output. A machine checker — a
schema, a test, a compiler, a diff against a live source — caps the rung at C2.

A state whose only judge is a reader is at least C3. The rung then becomes a
consequence of a testable fact, and the engine can recompute the whole table
and refuse where it disagrees.

This is the Kubernetes QoS inversion, and it is the largest structural gap the
scan found.

2. COMPARE THE SERVED MODEL AGAINST THE NAMED ONE, and make a divergence loud.

The design already stamps; the missing half is the comparison.

This harness moves a session to another model on a classifier flag and
suppresses the notice under machine-readable output, so the divergence is real
and silent today.

3. BUILD THE RECONCILIATION.

Record the declared rung beside an outcome signal, and report the states whose
rung has never once been contradicted.

Without it, nothing in the system can ever say a rating was wrong.

4. DEFINE THE FALLBACK CONTRACT BEFORE THE FIRST HOST DISAGREES.

A default entry, and an explicit fail-open or fail-closed switch.

Urgent rather than theoretical: an alias already resolves to different models
on different providers, so "identical on every host" is false in effect unless
full names are pinned.

5. CONSIDER MAKING A RUNG A (MODEL, EFFORT) PAIR.

The vendor exposes a per-request effort ladder orthogonal to model choice, and
it affects tool calls as well as tokens — the right lever for a C1 transcribe
state.

Two caveats to carry: the scale is calibrated per model, so the same word means
different things across models; and changing it between requests invalidates
prompt caching, so it should hold constant within a walk.

ONE ARGUMENT TO REPLACE RATHER THAN REPAIR.

The bounded-fan-out ruling is right and its stated reason is the weaker one
available.

A 2026 study found single agents matching or beating multi-agent systems on
multi-hop reasoning under EQUAL thinking-token budgets, and argued that
reported multi-agent gains are often confounded by unaccounted computation.

Its own stated exception is the honest justification for bounding rather than
dropping: multi-agent wins when a single agent's context utilisation degrades.

Argue from context exhaustion, not from a token multiplier.

WHAT THE SCAN COULD NOT ESTABLISH, recorded rather than left blank.

Whether one named router product still ships; whether a named vendor still
powers a competitor's auto-router; and whether four named observability
platforms carry a distinct requested-versus-served model field.

The last is one API-reference fetch each, and it matters to recommendation 2.

ON THE RESEARCH AND THE REVIEW THEMSELVES.

Both were subagents, per the record's own cast ruling, and both earned their
keep: the reviewer found the shape cascade that changed this gate's answer, and
the scan corrected a number and supplied the evidence behind two of the six
register entries.

Neither was taken on trust. Every claim either of them made that this brief now
rests on was reopened and read, in the tree or in a primary source.

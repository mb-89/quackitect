---
id: evidence-typing-prefill
statement: A PREFILL. Proposed type and guidance for all 122 evidence fields, for the owner to correct. Nothing is applied.
---

# Evidence typing — a prefill, not a decision

THIS IS A SUGGESTION. Nothing here has been written into any row. The matrix
is untouched. Walk it, strike what is wrong, and the corrected table is what
gets applied.

HOW TO CORRECT IT: edit the `type` cell, or write your answer after the arrow
in the guidance cell. Anything you do not touch is taken as agreed.

HOW IT WAS MADE: ten agents, one per milestone, each reading its rows whole.
Then one reconcile pass that challenged every `derived` and retyped lazy
`prose`. Coverage was checked mechanically against the matrix: 122 of 122
fields, none invented, none missed.

## The shape of the answer

| type | fields | what it buys |
| --- | --- | --- |
| `derived` | 38 | THE ENGINE COMPUTES IT and refuses a hand-written value |
| `table` | 34 | rows over declared columns, so a missing column is visible |
| `claim` | 24 | an assertion plus its argument, judged met or unmet |
| `list` | 14 | one item per line, so items can be counted |
| `files` | 5 | paths that must exist in the record's evidence folder |
| `prose` | 4 | free paragraphs — the honest fallback, and today's only behaviour |
| `verdict` | 3 | one of a closed set, plus a mandatory reason |

Prose is 4 of 122. Every one of those is a field where nothing
stronger fitted, not a field nobody looked at.

## The derived fields — read these first

These are the consequential ones. A derived field is NOT shown to the agent at
all: the engine computes it and speaks only if it fails. Get one wrong and you
block work that is legitimately manual.

REVIEW Abbreviations
[1] OK, implement if missing
[2] can be mechanical as cheap first check, but review team review also
[3] dont understand, lets discuss
[4] not sure, i think we can let the engine do very much here (compute the whole table)
[5] i dont think its stricly "exactly once". lets discuss. for software yes, but what does state of the art say about others? (open question)

|REVIEW | row | field | what the engine would read |
| --- | --- | --- | --- |
|1| onboard-retro | `notes_drained` | the notes store (.se/notes.jsonl) plus the se_note_drain calls: pending count at state entry, pending count at exit, and each note's recorded disposition |
|1| gate-kickoff | `retro_drained` | the notes store (.se/notes.jsonl): the count of notes still pending when the gate is judged, and whether any "needs retro" note is undrained. Zero pending passes. |
|2| gate-motivation | `vision_scope_stated` | the fill state of big_idea, to_be_world, goal_system and moore_pitch on draft-vision, plus scope and non_goals on scope-non-goals |
|2| gate-motivation | `success_measurable` | the value_props table on frame-delta: every need row carrying a non-empty pass line |
|non-empty might be acceptable, but risks can be linted. also: risks are still reviewed at review gate| gate-motivation | `risks_logged` | the raid_opened table on log-risks: the register non-empty and every entry carrying kind, owner and trigger |
|2| gate-inputs | `props_realized` | the prop column of frame-delta's value_props table, joined against the prop each story names in write-stories' stories table |
|2| gate-inputs | `stories_generalized` | write-stories' story names, joined against the covered-stories column of generalize-use-cases' use_cases table |
|2| gate-inputs | `excluded_stated` | presence and non-emptiness of draw-context's excluded_use list |
|2| derive-functions | `coverage` | the requirement column of function_structure joined against write-requirements' register, and the steps column of generalize-use-cases' use_cases joined against the same function rows - the engine lists requirements with no function and steps no function covers |
|2| gate-requirements | `verifiable` | the verify_method column on every row of write-requirements' register - empty, TBD, or outside test / analysis / inspection / demonstration counts as failing |
|2| gate-requirements | `traced` | each register row's source column, resolved against the roles list, the stories table and the recorded norms - unresolved ones are the empty rows |
|2| gate-requirements | `functions_cover` | the same computation as derive-functions' coverage - function_structure's requirement links and use_cases' steps - recomputed at gate time rather than inherited from the earlier step's result |
|2| gate-requirements | `breaks_if_removed` | the breaks_if_removed column on every row of write-requirements' register - empty or TBD counts as unfilled |
|2| derive-criteria | `criteria` | write-requirements' register: every row carrying a high weight and a non-empty scoring definition, collected with its weight, its definition and its requirement id |
|3| run-candidates | `candidate_records` | the machine this row declares `runs: candidates`: one compose sub-state per shortlisted combination, each sub-state's own record carrying its allocation, interfaces, metrics and rationale |
|4| evaluate-set | `front` | the scores table: the candidates no other candidate beats on every criterion and metric, using the better-is direction carried on each register row's scoring definition |
|5| gate-candidates | `complete_allocation` | the partitioned function set against each candidate's allocation in its compose sub-record: every function allocated exactly once per candidate, plus the presence of that candidate's interfaces and rationale |
|2| gate-candidates | `criteria_traced` | each criterion's requirement id from derive-criteria, the weight and scoring definition read off that register row, and the requirements column on map-stakeholders' tensions table |
|2| gate-candidates | `front_recorded` | the candidate set checked against evaluate-set's front and eliminations: every candidate is either on the front or eliminated with a non-empty reason |
|2| consolidate-baseline | `allocation_exact` | the allocation grid named in baseline (originating from the winning candidate's compose record): count element assignments per function row and refuse any count other than one |
|2| consolidate-baseline | `interfaces_both_ends` | the element grid and interface set named in baseline: every declared interface must have its reciprocal entry at the far element |
|2| gate-architecture | `sensitivity_ruled` | the sensitivity verdict and the tripwires rows from reverse-sensitivity, each tripwire's RAID link resolved against log-risks' raid_opened register |
|2| gate-architecture | `evaluation_recorded` | the register rows of kind quality (each carrying its six-part scenario), joined to the scenario column of evaluate-baseline's walk table: every scenario must carry a verdict |
|2| gate-architecture | `adrs_traced` | the addresses key in the frontmatter of each file cited by record-adrs' adrs list: every deciding ADR must resolve to a requirement or risk entry |
|2| rank-unknowns | `seeded` | the spike drawing this row declares `seeds: spikes` - the iteration record's machines/spikes.md: one state per spike with its id, question and timebox, or the drawing's explicit none and its reason |
|2| run-spikes | `spike_records` | the machine this row declares `runs: spikes` - each spike's question and timebox from the drawing, its verdict and evidence from that spike sub-state's own record; or the drawing's explicit none when nothing ran |
|2| gate-prototype | `results_recorded` | the spikes machine - every spike sub-state closed with its own evidence recorded, or the drawing's explicit none - together with fold-back's promotions field being filled or explicitly none |
|2| plan-build | `build_machine` | the sub-machine this row declares `seeds: build-chunks`: its chunk states, its dependency edges, and the realization kind declared on each chunk |
|2| build-steps | `build_record` | the walked sub-machine this row declares `runs: build-chunks`: per-chunk fill status, the actor recorded on each fill, and the path of the sub-record file |
|2| verification | `battery` | the engine's own execution of the command declared on this row (`npm --prefix project/deliverable test`): the captured run and its exit code, across all iterations |
|2| gate-implementation | `build_planned` | the build-chunks sub-machine: that it was seeded at plan-build and that its walk completed at build-steps |
|2| gate-implementation | `red_observed` | the per-check failures recorded in observe-red's red_observed table, joined to the checks authored in author-tests' checks table |
|2| gate-implementation | `verification_green` | the verification row's engine-filled battery run: its captured exit code, across all iterations |
|2| fill-story-evidence | `slides_filled` | the deck manifests named in write-stories' stories table, across all iterations: which slides carry an evidence_ref into the shipped system and which are still empty |
|2| fill-story-evidence | `demos_seeded` | the drawing this row declares `seeds: demos`, its states matched against the killer use cases - the use_cases rows covering a story marked killer in write-stories' stories table |
|2| gate-validation | `gaps_logged` | the entries opened by this iteration in log-gaps' gaps table, cross-checked against the slides left empty at fill-story-evidence: every unfilled slide must have an entry |
|2| gate-release | `packaged` | the paths cited by package's package and entry_script fields resolving in the evidence directory, plus the recorded skip where the realization kind has no entry script |
|2| gate-release | `dependencies_ruled` | the ruling column on every row of ship-review's review table being non-empty, checked against the standing sticky ruling record for divergence |

### Thirty-eight is more than I expected, and here is the catch

The research estimated about eight. The proposal returned thirty-eight, and the
reasoning behind each one holds: every entry above names concrete state the
engine already has.

BUT ALMOST ALL OF THEM READ ANOTHER FIELD'S STRUCTURE. `success_measurable`
counts pass lines in a table. `verifiable` reads a column on every register
row. `complete_allocation` counts allocations per function.

Those tables are prose today. So a derived field is a TARGET, not a switch:

- it needs the table it reads to actually carry columns, and
- it needs someone to write the computation.

Turning one on before both exist would refuse a hand-written answer and offer
no computed one — a gate with no way through.
REVIEW: We will fix this in iter 1 when it happens. still build in the mechanical check. 
REVIEW: but i agree, if the agent doesnt know he needs to fill, it wont be filled. so contrary to what I said earlier, we still must pass this to the agent, but tell him that its evaluated mechanically and he just needs to do it without additional evidence

SO THE ORDER MATTERS. Type the tables first and let them fill for a while.
Promote a field to derived only when its inputs are structured and its
computation is written. Marking a field derived here is agreeing with the
DESTINATION, not scheduling it.

FOUR OF 122 CAME BACK PROSE, which is the opposite worry. The reconcile pass
was told that heavy prose meant lazy typing, and it may have pushed too far the
other way. If a field genuinely wants a paragraph, say so — prose is a real
answer, not a failure.

REVIEW: Prose is still reviewed in the review gates

## Where the proposal argues with itself, or with the code

Each of these carries a reason worth your eye before you accept the type.

- **onboard-retro.waste_leads** — `list`. CHANGED: kept the proposal's promotion from optional to required-with-none, but flagged that the row declares required:false today - the owner must ratify the tightening, because an empty optional field currently cannot be distinguished from nobody looking. REVIEW: required with none is ok
- **gate-kickoff.retro_drained** — `derived`. CHANGED: added `when`. onboard-retro is struck at patch and this gate's patch note says "No retro rides in" - without the condition the derived field hard-refuses and deadlocks the patch lane. REVIEW: agreed: patch needs no retro
- **gate-kickoff.change_size** — `verdict`. A closed four-value set with mandatory reasoning. Note this field is never checked today: iterations.ts:490 builds the kickoff as kind `work`, so the gate-report check at session.ts:2297 never fires on it. REVIEW: Id rather call it "set_size". the iter doesnt have a size before kickoff. until kickoff, all iters look the same, they get seeded once the decision is made. so id also say its a "work"
- **frame-delta.why_now** — `claim`. An assertion with an argument; as prose the "what changed" half quietly goes unsaid. REVIEW:agreed
- **frame-delta.value_props** — `table`. CHANGED: rows are needs, not props. Two gate fields count pass lines per need (success_measurable) and join props to stories (props_realized); with needs nested inside a prop row neither count is computable and both derived fields become fiction. REVIEW: dont understand: i thought props are items and needs live in them, is then not the prop the row?
- **frame-delta.business_case** — `claim`. CHANGED: dropped `when`. The description says "skip with a recorded reason where no acquirer exists" - that is an explicit none, not a condition. The spec is explicit that both genuine `when` fields are market-related (market_tier, market_block); this is not one of them. REVIEW: dont understand, to me "when" can stay

- **map-stakeholders.tensions** — `table`. CHANGED: added the requirements column. gate-candidates.criteria_traced derives weights from "requirements and tensions"; without a requirement reference on the tension row that half of the trace is not computable and the derived field is unsatisfiable. REVIEW: agreed

- **generalize-use-cases.use_cases** — `table`. CHANGED: added the steps column. Two derived fields (derive-functions.coverage, gate-requirements.functions_cover) claim to check that every use-case step is covered by a function; with steps living only in prose neither can compute and both would refuse forever. REVIEW: lets discuss. every use-case-step? sounds too much




- **write-requirements.register** — `table`. CHANGED: added the scoring definition and its better-is direction as columns. derive-criteria.criteria filters on "high weight plus filled scoring definition" and evaluate-set.front needs a direction to compute non-domination - neither is derivable if those live nowhere. REVIEW: dont understand

- **derive-functions.coverage** — `derived`. CHANGED: derived_from now names both typed sources explicitly. It stays derived because the spec_note already calls the coverage matrix a derived table, but it is only computable once use_cases carries its steps column.REVIEW: agreed

- **gate-requirements.functions_cover** — `derived`. CHANGED: derived_from made word-for-word parallel with coverage. The two fields are the same check under two names, which is the matrix's own convention for a gate re-running a work row's computation. REVIEW: agreed

- **partition-functions.partitioning** — `table`. CHANGED: derived to table. Nothing in the engine parses function nodes or their edges, so the derived_from named a source that does not exist and would block M4 outright. The clustering is a human judgement authored HERE and nowhere else; the spec_note's ban is on the hand-drawn figure, not on the edge data. This is the strongest genuine `matrix` candidate for when that deferral lifts. REVIEW: i guess that is correct, but clustering will be algorithmically derived (at least first draft) via algorithms over the matrix, so it is at least derived with additioan judgement. we need a way to make sure the algos ge used.

- **gate-candidates.viable_set** — `claim`. CHANGED: dropped none_ok. The description's "or the no-real-alternatives case is argued and recorded" is a second branch of the same claim, not an empty answer; none_ok would let the gate be passed with the word "none" and no argument at all. REVIEW: but maybe there is no viable candidate? in that case the gate is not passed i guess


- **gate-candidates.criteria_traced** — `derived`. CHANGED: derived_from now names the tensions table's requirements column as the second source - the half of "weights derived from requirements and tensions" that the original proposal left with nowhere to read from. REVIEW: so now its derived? or not? dont understand

- **gate-candidates.feasibility_checked** — `table`. Several rough checks per survivor, and a table makes a survivor that was never checked obvious. REVIEW: agreed

- **converge-pugh.matrix_runs** — `table`. CHANGED: bound the columns to the existing decision-matrix form the row already mandates, so the type and the template cannot drift apart. Runs, datums and weighted criteria are columns; a run column keeps table lossless while matrix is deferred. REVIEW: dont understand, but i think matrix fits more and its partly derived. lets discuss

- **record-adrs.adrs** — `files`. CHANGED: made the addresses key in frontmatter mandatory in the guidance. gate-architecture.adrs_traced derives from that edge, and a file list whose shape is undeclared gives the engine nothing to resolve. EVIEW: agreed

- **consolidate-baseline.baseline** — `files`. CHANGED: required the grids to be machine-readable. The row forbids redrawing so files is right, but allocation_exact and interfaces_both_ends compute over data inside these paths, and an opaque file list makes both of them underivable. EVIEW: agreed


- **consolidate-baseline.allocation_exact** — `derived`. CHANGED: derived_from now points at the grid as an addressable artifact rather than at "the baseline". The row's own guidance says this column property is "review-class now, engine-computed later", so the owner has already ruled the direction. REVIEW: agreed

- **consolidate-baseline.interfaces_both_ends** — `derived`. CHANGED: derived_from now names the grid artifact. A symmetry property the row's guidance already calls engine-computed later. EVIEW: agreed
- **gate-architecture.sensitivity_ruled** — `derived`. CHANGED: added `when`. reverse-sensitivity is struck at minor and patch while this gate still runs at minor, so without the condition the derived field refuses on a row that never executed. REVIEW: agreed

- **gate-architecture.evaluation_recorded** — `derived`. CHANGED: derived_from now names where the scenario set actually lives - register rows of kind quality - rather than an undeclared "quality-scenario set". REVIEW: agreed

- **observe-red.red_observed** — `table`. CHANGED: kept as table but flagged the name collision - gate-implementation carries a field of the SAME NAME typed derived. That is a naming defect, not a typing one: every other gate re-check in the matrix uses a distinct name (coverage/functions_cover, allocation_exact/complete_allocation, front/front_recorded), and this pair should follow suit. The command column is also the matrix's truest run_ref candidate for when that deferral lifts, as the row's own guidance anticipates. REVIEW: so we change the name? thats fine

- **build-steps.build_record** — `derived`. CHANGED: added `when`. plan-build is struck at patch while this row survives as tailored and its note says "no sub-machine runs" - the derived field would refuse on a machine that was never seeded. REVIEW: agreed 
- **gate-implementation.build_planned** — `derived`. CHANGED: added `when`. plan-build is struck at patch while this gate still runs tailored; the patch_note says so explicitly, and a derived field with no condition would refuse every patch at the delivery gate. REVIEW: agreed
- **gate-implementation.red_observed** — `derived`. CHANGED: kept derived but flagged the collision - this is the only field name in the matrix used at both a work row and its gate. The typing is right on both sides (one authors, one joins); the NAME is the defect, and the owner should rename this one, e.g. red_confirmed. REVIEW: so we change the name? thats ok (then we keep the name higher up?)
- **fill-story-evidence.slides_filled** — `derived`. CHANGED: guidance now says an empty slide passes as a finding. The description says "or findings named", so a derived that refused on any empty slide would block work the row explicitly allows; routing the finding to log-gaps keeps the count honest without deadlocking. REVIEW: ok. we might not have story evidence
- **fill-story-evidence.demos_seeded** — `derived`. CHANGED: added `when`, and named the two-hop join. The description says one demo per killer USE CASE while the killer flag is marked on STORIES - the engine has to go stories(killer) then use_cases(covers) to get there, and that hop was unstated. REVIEW: not sure I understand.






- **gate-validation.killers_demonstrated** — `claim`. CHANGED: derived to claim, and this is the most consequential change in the list. No row anywhere declares `runs: demos` - fill-story-evidence seeds the machine and nothing walks it. A derived field reading "each demonstration's terminal outcome" reads a machine that never runs, so it can never be satisfied and would block the validation gate permanently. It becomes derived the day the missing runner row exists (spec open question 9). REVIEW: we will add the derivation test at i1. stays as derived

- **finalize-docs.docs** — `claim`. CHANGED: added - this row and the whole of M9 were missing from the proposals (10 of the matrix's 122 fields had no agent). The emitted set is deterministic but the match against the actual surface is the judgement the row exists for, so it is an assertion with an argument. REVIEW:agreed

- **package.package** — `files`. CHANGED: added - missing from the proposals. A package is a path that either exists or does not, which is the one check files buys and nothing else does.
REVIEW:agreed
- **package.entry_script** — `files`. CHANGED: added - missing from the proposals. A path that must exist, with the description's "or the recorded skip" as the none_ok modifier.
REVIEW:agreed
- **ship-review.review** — `table`. CHANGED: added - missing from the proposals. "the dependency list with rulings; new asks answered" names its own columns, and the release gate's check reads the ruling column. REVIEW:agreed (as in: the shipped package should be reviewed. If its done in the gate, thats enough)

- **ship-review.upstream** — `list`. CHANGED: added - missing from the proposals. A plural with no columns and the description's own explicit none. REVIEW: Dont understand
- **gate-release.docs_match** — `claim`. CHANGED: added - missing from the proposals. A judgement whose input is itself a judgement (finalize-docs' docs), so nothing here is computable.
REVIEW: Dont understand. i think it belongs in, if it was not, adding was right

- **gate-release.packaged** — `derived`. CHANGED: added - missing from the proposals. An existence check over two files fields. Note a real inconsistency in the source data: this gate's patch_note says the packaging line falls away "with its row", but M9_20_package is patch: tailored, not none - the owner should settle which is right. REVIEW:agreed
- **gate-release.dependencies_ruled** — `derived`. CHANGED: added - missing from the proposals. A completeness count over a typed table plus a link against the standing rulings; `when` because ship-review is struck at patch while this gate survives tailored. 
- **gate-release.handover_accepted** — `verdict`. CHANGED: added - missing from the proposals. The description says "the bless is the acceptance": a gate outcome from a closed set with a mandatory reason, which is the definition of verdict. REVIEW:agreed
- **gate-release.market_block** — `claim`. CHANGED: added - missing from the proposals. The second of the two genuine `when` fields the spec identifies. Kept a claim rather than derived over market_tier: whether the real-world results are good enough to ship is the judgement, not the count. REVIEW: dont understand what this is for

## Every field


REVIEW: not gonna check them all here, well do it live in I1
### M0

| row | field | type | guidance for whoever fills it | why not prose |
| --- | --- | --- | --- | --- |
| onboard-retro | `field_feedback` | `list` <br>none_ok | One line per thing that came back from users or the field since the last look. If nothing came back, write "nothing yet" rather than leaving it empty. | A plural with no columns and an explicit empty answer named in the description. |
| onboard-retro | `notes_drained` | `derived` | Do not type this. Drain every pending note with the drain tool and the counts and dispositions appear on their own. | The engine holds every note and every disposition as live state; a hand-written count is the cheapest thing in the system to fabricate. |
| onboard-retro | `call_log_mined` | `table` | One row per thing the log ranked since the last retro: the clause or tool, how often it fired, and the lead you drew from it. Write "no lead" where a count is just noise - never leave the lead blank. | Counts come from se_log_query but the lead column is the only judgement, so table beats derived. |
| onboard-retro | `waste_leads` | `list` <br>none_ok | One line per piece of rework, reversal or rebuild-instead-of-reuse you found in the record: what was wasted and where. If the hunt came up empty, write "none found". | CHANGED: kept the proposal's promotion from optional to required-with-none, but flagged that the row declares required:false today - the owner must ratify the tightening, because an empty optional field currently cannot be distinguished from nobody looking. |
| onboard-retro | `process_stale` | `claim` | Say whether the way of working has fallen behind current practice, and name what you compared it against. A specific comparable and a specific verdict, not a general feeling. | An assertion with an argument judged sound or not; only its reasoning makes the yes/no checkable. |
| gate-kickoff | `retro_drained` | `derived` <br>when: the change size runs a retro - the patch column's note says no retro rides in | Do not type this. The gate reads the inbox itself and opens only when nothing is still pending. | CHANGED: added `when`. onboard-retro is struck at patch and this gate's patch note says "No retro rides in" - without the condition the derived field hard-refuses and deadlocks the patch lane. |
| gate-kickoff | `goal` | `prose` | The iteration's goal in one sentence, in the wording the owner confirmed. One outcome only - if it needs an "and", it is two iterations. | A single free line with no columns, no items and nothing to judge met or unmet. |
| gate-kickoff | `pulled_in` | `table` | One row per item this iteration takes on, with where it came from - the note, the backlog entry, or who asked. Nothing enters scope without a traceable origin. | The description names the columns outright: each item with its origin. |
| gate-kickoff | `left_out` | `table` <br>none_ok | One row per item you considered and deliberately excluded, with where it went - backlogged with its ready-when condition, dropped, or handed on. If nothing was excluded, say so explicitly. | Two columns named in the description; the explicit none stops an empty cell reading as "nothing was considered". |
| gate-kickoff | `change_size` | `verdict` | Pick exactly one: patch, minor, major or product. Give the reason in a sentence or two and name any steps you propose to skip. This is a proposal - the owner's bless is the decision. | A closed four-value set with mandatory reasoning. Note this field is never checked today: iterations.ts:490 builds the kickoff as kind `work`, so the gate-report check at session.ts:2297 never fires on it. |

### M1

| row | field | type | guidance for whoever fills it | why not prose |
| --- | --- | --- | --- | --- |
| draft-vision | `big_idea` | `prose` | Write the idea in one breath, a few sentences a stranger could read cold and understand. Name what it builds on. | A standalone statement with nothing to enumerate and no assertion to judge - the honest prose case. |
| draft-vision | `to_be_world` | `prose` | Describe a day in the world once this exists: who does what, concretely, by name. Write it as a scene, not a definition. | The description demands it be alive rather than abstract; a grid would kill exactly what is asked for. |
| draft-vision | `goal_system` | `table` | One row per goal with its priority rank. Where a goal fights another, name the other one and say how you ruled the fight. | Rank and conflict ruling are per-goal attributes a flat list cannot carry; the render can still print it as a list. |
| draft-vision | `moore_pitch` | `list` | Five lines, one per slot: for whom, who need what, this is a what, that does what, unlike what. Fill all five. | A fixed five-slot shape, so one line per slot makes a missing slot visible and countable. |
| define-actual | `as_is` | `table` | One row per standing fact about how things work today, the good ones as well as the painful ones. Say what shows each is true: field research, your own history, a reported pattern. | Every fact carries its witness and the row's own note makes the pains nodes later work points at one at a time. |
| log-risks | `raid_opened` | `table` | One row per entry: what it is, whether it is a risk, assumption, issue or dependency, who owns it, and what event makes you look at it again. | The description names the columns outright and the spec_note forbids a hand-tabled register - entries are edited, the table assembles. |
| frame-delta | `gap_claim` | `claim` | State the thing no existing alternative does. Back it by walking the alternatives you looked at and saying what each one drops. | The row calls it the gap as a claim: an assertion that stands or falls on the alternatives sweep behind it. |
| frame-delta | `why_now` | `claim` | State that this gap can be closed now, and name what changed to make that true: the technology, the price, the audience. | An assertion with an argument; as prose the "what changed" half quietly goes unsaid. |
| frame-delta | `value_props` | `table` | One row per NEED, not per one-pager: the need, the prop and audience it belongs to, the outcome, today's alternative, your difference, and the pass line that says how you will know it succeeded. Every need row gets its own pass line. | CHANGED: rows are needs, not props. Two gate fields count pass lines per need (success_measurable) and join props to stories (props_realized); with needs nested inside a prop row neither count is computable and both derived fields become fiction. |
| frame-delta | `business_case` | `claim` <br>none_ok | State what this effort buys and for whom, in the currency that person actually counts in. If nobody is buying, say so and say why. | CHANGED: dropped `when`. The description says "skip with a recorded reason where no acquirer exists" - that is an explicit none, not a condition. The spec is explicit that both genuine `when` fields are market-related (market_tier, market_block); this is not one of them. |
| scope-non-goals | `scope` | `list` | One line per thing this effort takes on. | A plain enumeration with no per-item attributes; the spec_note's document form is two lists. |
| scope-non-goals | `non_goals` | `list` | One line per thing this effort deliberately leaves alone. | The description says "one line each". |
| pressure-test | `prfaq` | `files` | Put the press release and the hostile FAQ in the evidence folder and name the files here. Do not paste them into the field. | The spec_note calls it an evidence document, linked and never inlined, so the check is that the paths exist. |
| pressure-test | `findings_folded` | `list` <br>none_ok | One line per thing the test changed and where you changed it. If it changed nothing, say so and say why nothing came back. | A short enumeration of fold-backs; the description's "or none-with-reason" is the none_ok modifier. |
| gate-motivation | `vision_scope_stated` | `derived` | Nothing to write. The engine reports whether all six parts of the packet were filled and names any that were not. | Pure completeness over six named fields the engine already holds fill state for (forms.ts:96), and the cheapest of all claims to assert falsely. |
| gate-motivation | `problem_agreed` | `claim` | Argue that the gap is real and the goal worth having. This is the one place the idea can still be turned down, so make the case rather than assert it. | The description says "argue it here"; it is the judgement the whole gate exists for and no machine can settle it. |
| gate-motivation | `prior_art_positioned` | `claim` | Say where this sits against what already exists and against what has been tried and failed. Name the specific things, not the categories. | A judgement of positioning: that a scan happened is not the same as the positioning holding up. |
| gate-motivation | `success_measurable` | `derived` | Nothing to write. The engine checks every need for its pass line and names any need that has none. | A universal count over a table the engine parses - computable only because value_props is now one row per need. |
| gate-motivation | `risks_logged` | `derived` | Nothing to write. The engine checks the register is open and that every entry carries an owner and a revisit trigger. | Column completeness over a table the engine parses; a hand-written yes proves nothing. |

### M2

| row | field | type | guidance for whoever fills it | why not prose |
| --- | --- | --- | --- | --- |
| draw-context | `boundary` | `table` | One row per neighbour the system touches: name it, say whether it sits inside or outside the boundary, and name the interface across it. No neighbour the running code talks to may be missing. | The description names the columns in English - inside, outside, neighbour, interface - and the context figure derives from these rows. |
| draw-context | `intended_use` | `prose` | Write one paragraph saying what the system is for, in the words its users would use. Describe what it actually does, not what it is meant to become. | The description literally says "one honest paragraph"; nothing to enumerate or compute. |
| draw-context | `excluded_use` | `list` | One line per thing the system deliberately does not do. Write down the ones people will assume it does anyway - those are the lines that do the work. | A plural set of one-line entries with no columns, and gate-inputs needs the entries individually rather than buried in a paragraph. |
| map-stakeholders | `roles` | `list` | One line per role, named by what the role does. Never a person's name, and include the roles that lose something as well as the ones that gain. | "one line each" is stated outright in the description. |
| map-stakeholders | `tensions` | `table` <br>none_ok | One row per pair of roles that pull against each other: name both roles, say what each wants that the other cannot have, and name the requirements the tension pulls apart. If you looked and found no conflicting pair, record that explicitly. | CHANGED: added the requirements column. gate-candidates.criteria_traced derives weights from "requirements and tensions"; without a requirement reference on the tension row that half of the trace is not computable and the derived field is unsatisfiable. |
| write-stories | `stories` | `table` | One row per story: its name, the single value prop it makes real, where its slideshow lives, and whether it is a killer - a story the product cannot survive failing. Leave the slides' evidence side empty until validation fills it. | Each story carries a named prop and a killer flag, so it is a record with fields; plain files would keep the paths but lose the prop mapping gate-inputs joins against. |
| generalize-use-cases | `use_cases` | `table` | One row per use case: its name, the actor whose goal it serves, every story it covers, and its numbered main-path steps. Each story must show up against at least one use case; if one will not fit, add a new case rather than stretching an old one. | CHANGED: added the steps column. Two derived fields (derive-functions.coverage, gate-requirements.functions_cover) claim to check that every use-case step is covered by a function; with steps living only in prose neither can compute and both would refuse forever. |
| gate-inputs | `props_realized` | `derived` | Do not write this. The engine matches every value prop against the stories that name it and reports any prop no story realizes. | A coverage count over two typed tables the engine holds; "every prop is covered" is the cheapest sentence an agent can fabricate. |
| gate-inputs | `stories_generalized` | `derived` | Do not write this. The engine checks that each story appears in at least one use case and names the ones that do not. | A pure join over two on-record tables; a hand-written "all generalized" asserts the work rather than showing it. |
| gate-inputs | `roles_covered` | `claim` | State that no stakeholder role is missing, and say how you know - where you went looking for roles nobody had written down. Point at the tensions you recorded, or say plainly that you searched and found none. | The engine cannot see a role that was never written down, so completeness here is an argument to be judged, not a computation. |
| gate-inputs | `excluded_stated` | `derived` | Do not write this. The engine reads the excluded-use list from the context step and fails the gate if it is absent or empty. | An existence check on a field the engine already stores - exactly the claim that sounds like work and costs nothing to assert. |
| gate-inputs | `examples_formulated` | `list` | One line per example the later work will be checked against, each naming the use-case step or the story slide it comes from. List only the ones you are committing to check, not everything written so far. | This is the checkable set M3 consumes, so it must be enumerated; a claim that examples exist hands M3 nothing. If the rule ever becomes that every path and slide counts automatically, it turns derived and this gate check goes vacuous. |

### M3

| row | field | type | guidance for whoever fills it | why not prose |
| --- | --- | --- | --- | --- |
| write-requirements | `register` | `table` | One row per requirement: the EARS sentence, its kind, its verify_method, what breaks without it, its weight, its scoring definition and which direction is better where the weight is high, and what it came from. Leave no cell as TBD. | CHANGED: added the scoring definition and its better-is direction as columns. derive-criteria.criteria filters on "high weight plus filled scoring definition" and evaluate-set.front needs a direction to compute non-domination - neither is derivable if those live nowhere. |
| write-requirements | `set_criteria` | `claim` | Argue four things about the set as a whole: it is complete, consistent, affordable and bounded. One short argument each, naming what you actually checked. | The description ends in the word "argued" - an assertion judged met or unmet, not a shape. |
| derive-functions | `function_structure` | `table` | One row per function: a verb-plus-noun name, the function it sits under, and the requirements it serves. Name no technology, product or component. | The parent link and the requirement links only survive as columns, and both the figure and the coverage check read them. |
| derive-functions | `coverage` | `derived` | Do not write this. If it comes back short, add the missing requirement-to-function links or the missing functions, then re-run. | CHANGED: derived_from now names both typed sources explicitly. It stays derived because the spec_note already calls the coverage matrix a derived table, but it is only computable once use_cases carries its steps column. |
| probe-assumptions | `probes` | `table` <br>none_ok | One row per environment assumption: the assumption, the requirement resting on it, the probe you actually ran, its result, and when the probe goes stale. If this change introduced no new assumptions, say that explicitly. | The description names assumption, probe and result as columns; the staleness column is what makes the re-run rule bite. |
| gate-requirements | `verifiable` | `derived` | Do not write this. If a requirement comes back unverifiable, name its check on the requirement itself, or rewrite it, or drop it. | A presence-and-enum check over a column the engine reads on every requirement row - the strongest non-runtime derived in the matrix. |
| gate-requirements | `traced` | `derived` | Do not write this. If a requirement comes back untraced, add its source on the requirement itself. | The description names the matrix's own empty-row filter as the test, and the spec names this exact wording as a derived example. |
| gate-requirements | `functions_cover` | `derived` | Do not write this. If it comes back short, close the gap in the function structure and re-run the gate. | CHANGED: derived_from made word-for-word parallel with coverage. The two fields are the same check under two names, which is the matrix's own convention for a gate re-running a work row's computation. |
| gate-requirements | `set_holds` | `claim` | Argue that the register as it now stands is complete, consistent, affordable and bounded. Argue it for the whole register, not only for rows this change added. | Four judgements needing an argument; only the no-TBD half is machine-checkable. |
| gate-requirements | `breaks_if_removed` | `derived` | Do not write this. If a requirement comes back empty, fill the field on that requirement. | The description is literally "filled on every requirement", which is a count, not a claim. |
| gate-requirements | `assumptions_probed` | `claim` | State that every environment assumption the requirements rest on has been probed. Name any you are deferring, why, and when they get settled; a probe past its staleness date counts as unprobed. | The probed ones are countable, but a deferral needs a reason and a date someone stands behind - the engine cannot judge "scheduled with reason". |

### M4

| row | field | type | guidance for whoever fills it | why not prose |
| --- | --- | --- | --- | --- |
| derive-criteria | `criteria` | `derived` | Do not write criteria here. Put the weight and the scoring definition on the requirements themselves; the high-weight ones are collected into this list with their ids. | The row's guidance says a filled scoring definition on a high-weight requirement IS what makes it a criterion, so the set is a filter over a typed table - a computation, not a judgement. |
| partition-functions | `partitioning` | `table` | Declare the one relation the matrix is about, then one row per coupling edge: the two functions, the coupling reason, and the cluster each ends up in with its quality class (basic, additional, safety, support). The DSM figure is drawn from these rows - never paste a drawn matrix in. | CHANGED: derived to table. Nothing in the engine parses function nodes or their edges, so the derived_from named a source that does not exist and would block M4 outright. The clustering is a human judgement authored HERE and nowhere else; the spec_note's ban is on the hand-drawn figure, not on the edge data. This is the strongest genuine `matrix` candidate for when that deferral lifts. |
| enumerate-space | `chart` | `table` | One row per option: the function it serves, the option itself, where it came from, whether it is pruned, and the reason if it is. Keep pruned options in the table. | Prunable cells with reasons is the literal matrix case, but matrix is deferred and the spec_note already says table; one row per option carries the reason losslessly. |
| enumerate-space | `shortlist` | `list` | One line per shortlisted combination: name it and say which option it takes for each function. Each line becomes one candidate to compose. | The description says "one line each", and these lines are exactly what seed the candidate machine. |
| run-candidates | `candidate_records` | `derived` | Nothing to write here. Compose each candidate in its own state and the set is collected from those records. | The row runs a sub-machine the engine walks and whose sub-records it holds; re-typing them is where candidates that were never composed get invented. |
| evaluate-set | `scores` | `table` | One row per candidate, one column per criterion holding the score and the anchor it matched, plus the structure metrics carried over from that candidate's record. Every candidate gets a score on every criterion; no blanks. | A full grid with no prunable cells is a table, not a matrix, and naming the columns makes a missing score visible. |
| evaluate-set | `front` | `derived` | Do not name the survivors. Fill in every score and the surviving set falls out of the arithmetic. | Non-domination is arithmetic over a typed table, and a hand-named survivor set is the cheapest possible assertion - computable now that the register carries a better-is direction. |
| evaluate-set | `eliminations` | `table` <br>none_ok | One row per candidate that did not survive: the candidate, which survivor beats it, and a one-line reason. If nothing was eliminated, say so explicitly. | "each dominated candidate with its reason" names its own columns; an all-surviving set is a real answer, so an explicit none must be allowed. |
| gate-candidates | `viable_set` | `claim` | State that at least two candidates are genuinely viable and say what makes each one a real option, not a strawman. If there truly were no alternatives, argue that case instead - and argue it, do not just declare it. | CHANGED: dropped none_ok. The description's "or the no-real-alternatives case is argued and recorded" is a second branch of the same claim, not an empty answer; none_ok would let the gate be passed with the word "none" and no argument at all. |
| gate-candidates | `complete_allocation` | `derived` | Nothing to assert. Make sure each candidate allocates every function and has its interfaces and rationale filled in; anything unallocated is reported back. | Counting full coverage over the allocations is the engine's job and the spec names this exact claim as a derived example. |
| gate-candidates | `criteria_traced` | `derived` | Do not write a trace. Keep every weight on its requirement and let each tension name the requirements it pulls apart. | CHANGED: derived_from now names the tensions table's requirements column as the second source - the half of "weights derived from requirements and tensions" that the original proposal left with nowhere to read from. |
| gate-candidates | `front_recorded` | `derived` | Nothing to write here. Record the front and give every eliminated candidate its reason; a candidate that is neither is reported back. | Whether front plus reasoned eliminations partitions the whole candidate set is a completeness check the machine runs. |
| gate-candidates | `feasibility_checked` | `table` | One row per surviving candidate and check: what was checked, what it showed, and whether anything blocks. Cover every survivor. | Several rough checks per survivor, and a table makes a survivor that was never checked obvious. |

### M5

| row | field | type | guidance for whoever fills it | why not prose |
| --- | --- | --- | --- | --- |
| converge-pugh | `matrix_runs` | `table` | Record every convergence run, not just the last: the datum you scored against and each candidate's score on each weighted criterion. Columns are run, datum, candidate, criterion, weight, score. The shape must match machines/forms/decision-matrix.md, which the row declares as the only accepted output form. | CHANGED: bound the columns to the existing decision-matrix form the row already mandates, so the type and the template cannot drift apart. Runs, datums and weighted criteria are columns; a run column keeps table lossless while matrix is deferred. |
| converge-pugh | `winner` | `claim` | Name the candidate you chose and say why it wins beyond the totals. Give the qualitative reason that survived the discussion, not the arithmetic. | The description says "the why beyond the arithmetic" - an assertion plus an argument the totals cannot supply. |
| reverse-sensitivity | `sensitivity` | `verdict` | Say robust or weight-sensitive, and give the reason. If weight-sensitive, name the weight changes that flip the winner. | The description hands you a closed pair and demands the flip conditions as the mandatory reason. |
| reverse-sensitivity | `tripwires` | `table` <br>none_ok | One row per credible flip: the condition that would make it true, the fallback if it does, and the RAID entry watching it. Write an explicit none only if no flip was credible. | Condition, fallback and RAID link are per-item columns; prose lets a tripwire be filed without its fallback, which is the silent dismissal the guidance forbids. |
| record-adrs | `adrs` | `files` | Give the path to each decision record you wrote, one per line. Each file's frontmatter must carry kind: decision and an addresses key naming the requirement or risk that forced it; context, options and the rejected loser go inside the file, not here. | CHANGED: made the addresses key in frontmatter mandatory in the guidance. gate-architecture.adrs_traced derives from that edge, and a file list whose shape is undeclared gives the engine nothing to resolve. |
| consolidate-baseline | `baseline` | `files` | Point at the consolidated baseline in the evidence folder: the allocation grid, the element grid, the interface set, the metrics, and the black-box description per element. The two grids must land as machine-readable grids, not prose - the two checks below read them. Do not retype their contents here. | CHANGED: required the grids to be machine-readable. The row forbids redrawing so files is right, but allocation_exact and interfaces_both_ends compute over data inside these paths, and an opaque file list makes both of them underivable. |
| consolidate-baseline | `allocation_exact` | `derived` | Nothing to write. The engine reads the allocation grid and refuses if any function lands in zero elements or in more than one. | CHANGED: derived_from now points at the grid as an addressable artifact rather than at "the baseline". The row's own guidance says this column property is "review-class now, engine-computed later", so the owner has already ruled the direction. |
| consolidate-baseline | `interfaces_both_ends` | `derived` | Nothing to write. The engine checks each declared interface appears at both elements it connects and refuses a one-sided one. | CHANGED: derived_from now names the grid artifact. A symmetry property the row's guidance already calls engine-computed later. |
| evaluate-baseline | `walk` | `table` | One row per quality scenario: the scenario, whether it is addressed, at-risk or unaddressed, and the decision or element that carries it. Include the scenarios that came out badly. | The spec_note names the columns outright: scenario, verdict, carrying decision. |
| evaluate-baseline | `fitness_candidates` | `list` | One line per scenario that could be measured automatically later. Say what would be measured, not how to build the check. | A plural with no columns named anywhere in the row; one candidate per line is the whole shape. |
| gate-architecture | `choice_traced` | `claim` | State that the winner follows from the weighted criteria and show the trace back to them. Where the datum was the status quo, confirm both runs are on the record. | The trace carries an argument the owner judges; only the run-count half is computable, so the field stays a claim. |
| gate-architecture | `sensitivity_ruled` | `derived` <br>when: a convergence ran - the minor column strikes converge-pugh and reverse-sensitivity | Nothing to write. The engine reads the recorded verdict and checks each tripwire resolves to a live RAID entry. | CHANGED: added `when`. reverse-sensitivity is struck at minor and patch while this gate still runs at minor, so without the condition the derived field refuses on a row that never executed. |
| gate-architecture | `matrix_review` | `claim` | State that the decomposition, clustering, allocation and interfaces were reviewed as data rather than as a picture, and say what the review found. Name anything sent back. | The guidance calls this the killer judgement at this gate; no machine can say whether the decomposition is right. |
| gate-architecture | `evaluation_recorded` | `derived` | Nothing to write. The engine checks every quality scenario carries a verdict in the walk and names any that is missing. | CHANGED: derived_from now names where the scenario set actually lives - register rows of kind quality - rather than an undeclared "quality-scenario set". |
| gate-architecture | `adrs_traced` | `derived` | Nothing to write. The engine checks every decision record carries a link to the requirement or risk that forced it. | A graph completeness check over an edge the row's guidance makes mandatory on every decision file - concrete only because adrs now declares that frontmatter shape. |

### M6

| row | field | type | guidance for whoever fills it | why not prose |
| --- | --- | --- | --- | --- |
| rank-unknowns | `ranking` | `table` | One row per unknown, worst first: the unknown, what breaks if you guessed wrong, and whether it gets a spike or an explicit no. Keep the rows short enough to scan. | The description and the spec_note both name the columns - unknown, what-if-wrong, spike or none. |
| rank-unknowns | `seeded` | `derived` | Do not write this field. Put the spikes in the drawing - one state each with its question and timebox - or a single explicit none saying why nothing runs. | The row authors the drawing the engine reads and refuses on; a hand-written copy can only drift from it. An explicit none in the drawing is data too, so zero spikes passes without ceremony. |
| run-spikes | `spike_records` | `derived` | Do not write this field. Record each spike's result inside that spike's own state - what it asked, what the timebox cost, what the evidence showed - and this assembles itself. | The row runs the drawing rather than authoring anything, so a summary here re-types records the engine already holds. |
| fold-back | `folded` | `table` <br>when: spikes ran - with the drawing's explicit none there is nothing to fold | One row per spike: what its evidence showed, and what you changed because of it - name the requirement, decision or risk entry you edited. If it only confirmed what you already believed, say that in the row. | One row per spike with a named target makes an unfolded spike visible as an empty row; a paragraph hides it. |
| fold-back | `promotions` | `list` <br>none_ok | One line per piece of spike output you want carried into the build, saying what it is and which spike produced it. Write an explicit none if you are keeping nothing. | A plural with no columns, and the description already offers the explicit none. |
| gate-prototype | `assumptions_validated` | `claim` | State that the worst unknowns are now settled, and argue it: for each one, say it held or the design changed to suit. Point at the evidence rather than repeating the ranking. | A gate assertion judged met or unmet; the underlying rows already exist, so what is owed here is the argument. |
| gate-prototype | `buildable` | `claim` | State that the design can be built as it now stands, and give the evidence that convinced you. Name anything still unproven that you are choosing to accept. | An assertion about the design that has to be argued, not enumerated. |
| gate-prototype | `results_recorded` | `derived` | Do not write this field. If it comes back short, finish the spike record or the promotions line it names, then re-enter the gate. | "every spike pinned, promotions marked" is a completeness count the engine runs. No `when` is needed: an explicit none in the drawing is data the engine resolves, so a no-spike minor passes rather than refusing. |

### M7

| row | field | type | guidance for whoever fills it | why not prose |
| --- | --- | --- | --- | --- |
| author-tests | `checks` | `table` | One row per requirement in scope, naming the check you wrote for it and where that check lives. Say for each whether it runs mechanically or needs a person to judge it. | The description pairs each requirement with its authored check, and the spec_note calls the result the requirement-to-check table. |
| plan-build | `build_machine` | `derived` | You do not write this. Seed the chunk drawing and the engine reads the chunks, their dependencies and each chunk's realization kind straight out of it. | The row seeds the sub-machine, so the engine holds the drawing; re-typing its contents costs nothing and proves nothing. |
| plan-build | `promotions_placed` | `list` <br>none_ok | One line per promoted spike output, naming the chunk it enters as a pre-verified starting point. Write none if no spike was promoted. | A plural with no columns anywhere in the description; the trailing "or none" is the none_ok modifier, not part of the type. |
| observe-red | `red_observed` | `table` | One row per new check: name the check, the command that ran it, and the failure it produced. Record the failure you actually saw, not the one you expect. | CHANGED: kept as table but flagged the name collision - gate-implementation carries a field of the SAME NAME typed derived. That is a naming defect, not a typing one: every other gate re-check in the matrix uses a distinct name (coverage/functions_cover, allocation_exact/complete_allocation, front/front_recorded), and this pair should follow suit. The command column is also the matrix's truest run_ref candidate for when that deferral lifts, as the row's own guidance anticipates. |
| build-steps | `build_record` | `derived` <br>when: a chunk machine was seeded - the patch column says no sub-machine runs | You do not write this. Walk the chunks; the engine records which chunk each actor filled and where the sub-record landed. | CHANGED: added `when`. plan-build is struck at patch while this row survives as tailored and its note says "no sub-machine runs" - the derived field would refuse on a machine that was never seeded. |
| verification | `battery` | `derived` | You do not write this. The engine runs the battery command declared on the step and records the run with its pass or fail. | The row is filled_by: engine and carries the command, so nobody is citing anything - run_ref would fit if an author cited a run for the engine to resolve, but here the engine is the one running it. The single strongest derived in the matrix. |
| fix-findings | `findings_fixed` | `table` | One row per finding the failed run surfaced: what failed, and the fix you made for it. Collect every finding before fixing anything, and leave no finding without a row. | The description pairs each finding with its fix; the finding half comes off the failed run and the fix half is authored, so a row per finding is the only shape that shows one pass covered them all. |
| gate-implementation | `build_planned` | `derived` <br>when: a chunk machine was seeded - the patch column tailors this gate to three checks and says the rest assumes a planned build that did not happen | You do not write this. The engine confirms the chunk drawing was seeded and that every chunk in it was walked. | CHANGED: added `when`. plan-build is struck at patch while this gate still runs tailored; the patch_note says so explicitly, and a derived field with no condition would refuse every patch at the delivery gate. |
| gate-implementation | `models_adhered` | `table` | One row per element the build touched, pointing at the allocation that sanctioned it. An element with nothing to point at is unsanctioned and stops the gate. | The guidance calls this a matrix check and elements against allocations with prunable cells is the true shape, but matrix is deferred, so a row per touched element with its sanctioning allocation is the survivable stand-in; a bare claim would hide exactly the element that is unsanctioned. |
| gate-implementation | `red_observed` | `derived` | You do not write this. The engine checks the failures recorded at observe-red against the checks authored for this iteration. | CHANGED: kept derived but flagged the collision - this is the only field name in the matrix used at both a work row and its gate. The typing is right on both sides (one authors, one joins); the NAME is the defect, and the owner should rename this one, e.g. red_confirmed. |
| gate-implementation | `designs_realized` | `table` | One row per requirement in scope, naming the design that realizes it and where that design landed in the build. A requirement with no row is the finding. | A coverage assertion whose only real argument is the requirement-to-design join; a bare claim passes without ever naming the requirement that was missed, a row per requirement cannot. |
| gate-implementation | `verification_green` | `derived` | You do not write this. The engine reads the battery run from verification and reports its result across all iterations. | The spec names this field by name as derived; an agent asserting the battery passes sounds like work, costs nothing, and the engine already has the exit code. |
| gate-implementation | `quality_ok` | `claim` | State whether the code's internal quality is good enough to ship and give the reasons that got you there. Name what you looked at and what you deliberately let stand. | A judgement with no fixed columns and nothing the engine can compute; the assertion plus its argument is the whole of the evidence. |
| gate-implementation | `risks_acceptable` | `claim` | State whether the risks this build introduced are acceptable and say why. Point at the RAID entries you added or updated. | The gate stands or falls on the judgement, not on a list; the register already holds the rows, so this field carries only the argument that they are tolerable. |

### M8

| row | field | type | guidance for whoever fills it | why not prose |
| --- | --- | --- | --- | --- |
| fill-story-evidence | `slides_filled` | `derived` | Do not write this. Fill the evidence side of each slide in the decks themselves; the engine reports which slides are still empty. An unfilled slide is not a failure here - it is a finding, and it must appear in log-gaps. | CHANGED: guidance now says an empty slide passes as a finding. The description says "or findings named", so a derived that refused on any empty slide would block work the row explicitly allows; routing the finding to log-gaps keeps the count honest without deadlocking. |
| fill-story-evidence | `demos_seeded` | `derived` <br>when: the change size seeds a demo machine - the patch column says no demo machine is seeded | Do not write this. Author the demo drawing with one demonstration per killer use case; the engine matches the drawing against the killers. | CHANGED: added `when`, and named the two-hop join. The description says one demo per killer USE CASE while the killer flag is marked on STORIES - the engine has to go stories(killer) then use_cases(covers) to get there, and that hop was unstated. |
| sweep-consistency | `swept` | `table` | One row per thing this iteration changed, listing every document or note that teaches it and what you did to each - updated, or marked. The method and task notes count as surfaces. | The description names two columns already, the changes and the surfaces per change; prose hides the change that got no surface. |
| log-gaps | `gaps` | `table` <br>none_ok | One row per gap you found: what it is, its kind, who owns it, and the trigger that brings it back. Finding none is a normal outcome - say so explicitly. | Register entries are fixed columns - kind, owner, trigger - the same shape as raid_opened, which opens the same register. |
| gate-validation | `meets_need` | `claim` | State that every need's pass lines are demonstrated, and give what carries it - which story, which slide, which run. Name any need you could not carry. | Whether the evidence actually meets the pass line is the acceptance judgement, and only an argument carries it. |
| gate-validation | `killers_demonstrated` | `claim` | State that each killer use case was exercised end to end, and say what carries it: who ran it, against what, and what the run showed. Name any killer you could not exercise. | CHANGED: derived to claim, and this is the most consequential change in the list. No row anywhere declares `runs: demos` - fill-story-evidence seeds the machine and nothing walks it. A derived field reading "each demonstration's terminal outcome" reads a machine that never runs, so it can never be satisfied and would block the validation gate permanently. It becomes derived the day the missing runner row exists (spec open question 9). |
| gate-validation | `acceptance_converted` | `table` <br>none_ok | One row per validated slice that could be executed: the slice, and the acceptance scenario it became or the reason it stayed manual. If no slice was executable, say so. | Each slice carries its own outcome and its own reason; a paragraph lets an unconverted slice pass unnamed. |
| gate-validation | `consistency_swept` | `claim` | State that no document still teaches the superseded behavior, and say what you checked to be sure. Name anything left disagreeing and why it stands. | Agreement between documents and behavior is a judgement the sweep table supports but never proves. |
| gate-validation | `gaps_logged` | `derived` | Do not write this. Put every validation gap into the register with its owner and trigger; the engine reads the register. | A count over a typed register cross-checked against the slide count - the join is what makes it load-bearing rather than a tautology. |
| gate-validation | `market_tier` | `table` <br>when: the iteration is declared to market | One row per real-world check - cold read, measurement, pilot - with who ran it and how it came out. | One of the two genuine `when` fields the spec identifies (both market-related, both faking it with required:false today). Three distinct checks with separate outcomes; a single "green" hides which one was skipped. |

### M9

| row | field | type | guidance for whoever fills it | why not prose |
| --- | --- | --- | --- | --- |
| finalize-docs | `docs` | `claim` | State that the emitted set matches the shipped surface and say what you read it against. Name what is missing or badly written, and whether the Diataxis modes stayed apart. | CHANGED: added - this row and the whole of M9 were missing from the proposals (10 of the matrix's 122 fields had no agent). The emitted set is deterministic but the match against the actual surface is the judgement the row exists for, so it is an assertion with an argument. |
| package | `package` | `files` | Name the versioned artifact in the evidence folder and the manifest listing its contents. State the version in the manifest, not here. Do not retype the contents. | CHANGED: added - missing from the proposals. A package is a path that either exists or does not, which is the one check files buys and nothing else does. |
| package | `entry_script` | `files` <br>none_ok | Name the one-script entry that installs and runs the thing on a fresh machine. If the realization kind has none, record the skip and its reason instead. | CHANGED: added - missing from the proposals. A path that must exist, with the description's "or the recorded skip" as the none_ok modifier. |
| ship-review | `review` | `table` | One row per dependency: what it is, its ruling, whether the ruling is a standing sticky one or newly asked, and whether it diverged. Display everything; ask only where no sticky ruling exists or the state changed. | CHANGED: added - missing from the proposals. "the dependency list with rulings; new asks answered" names its own columns, and the release gate's check reads the ruling column. |
| ship-review | `upstream` | `list` <br>none_ok | One line per proposal deposited upstream, naming where it went. Write none owed if nothing was. | CHANGED: added - missing from the proposals. A plural with no columns and the description's own explicit none. |
| gate-release | `docs_match` | `claim` | State that the docs are complete and match the actual shipped surface, scoped to what this change touched. Say what you compared against. | CHANGED: added - missing from the proposals. A judgement whose input is itself a judgement (finalize-docs' docs), so nothing here is computable. |
| gate-release | `packaged` | `derived` <br>when: the change size repackages - the patch column's note says the packaging line falls away | You do not write this. The engine checks the versioned artifact and the entry script are where the package row said they are. | CHANGED: added - missing from the proposals. An existence check over two files fields. Note a real inconsistency in the source data: this gate's patch_note says the packaging line falls away "with its row", but M9_20_package is patch: tailored, not none - the owner should settle which is right. |
| gate-release | `dependencies_ruled` | `derived` <br>when: dependencies moved - ship-review is struck at patch | You do not write this. The engine checks every dependency in the review carries a ruling and that the sticky ones were honored. | CHANGED: added - missing from the proposals. A completeness count over a typed table plus a link against the standing rulings; `when` because ship-review is struck at patch while this gate survives tailored. |
| gate-release | `handover_accepted` | `verdict` | Accepted or rejected, with the reason. A rejection names exactly what to redo. This bless is the ship - there is no second sign-off artifact. | CHANGED: added - missing from the proposals. The description says "the bless is the acceptance": a gate outcome from a closed set with a mandatory reason, which is the definition of verdict. |
| gate-release | `market_block` | `claim` <br>when: the iteration is declared to market | State that the real-world validation came back good enough to ship, pointing at the market checks recorded at the validation gate. Name anything you are shipping despite. | CHANGED: added - missing from the proposals. The second of the two genuine `when` fields the spec identifies. Kept a claim rather than derived over market_tier: whether the real-world results are good enough to ship is the judgement, not the count. |

---
form: gate-requirements
bless: blessed by agent
by: agent
signed_off: 2026-08-28T10:53:40.440Z
authors: agent
files:
---

# Evidence form / gate-requirements

## current_situation

Design input is complete for the delta. Five requirements stand, two functions were extended to serve them, and the assumption sweep ran per source.

The register grew by six nodes this milestone: five requirements and two assumptions, plus one issue found while probing.

The quality sweep answered all nine ISO characteristics at write-requirements, and this gate adjudicates its gaps rather than re-asking it.

## round_0_verify

- evidence vs claims: Every number in the design input is measured or cited. The 24 doubled headings were re-counted today. The 2,549-node sweep timing is from this session's own boot. The no-TBD sweep was run, not assumed, and returned zero over the whole register.
- types: Not run. No engine code was written this milestone. The five rows are specification, and the type check becomes legal at verification.
- lint: Boot's preflight, smoke test, conformance sweep, prose inspection and record inspection all stand green. One node was broken and repaired inside this milestone, and the repair is what surfaced the guard gap.
- tests: Not run. The five rows name test as their verify_method, and those tests are authored in the next milestone.

## round_1_validate

- exercised against the goal: The five rows map one to one onto the five lints the scope named. Nothing in the register is unsourced, and nothing in the scope is unrepresented.
- missing: Two things, both named rather than hidden. The repairs themselves carry no requirement, because a one-off edit is an act and not a standing demand. References written in evidence PROSE are outside every armed sweep, and that stands as a register issue.
- wrong: One thing was wrong and is fixed. A patch of mine put an unquoted colon into a YAML value and broke a node. The repair took one call; what it exposed took four more and became an issue.
- out of scope: Seven exclusions stand from scope-non-goals, unchanged. The patch-guard fix is an eighth, and it is engine work outside a corpus-repair minor.
- prior art: Compared at the motivation gate with both sides named, and nothing has changed it. markdownlint's MD024 and remark-validate-links cover two of the five lints; neither expresses a typed reference between typed nodes, and neither refuses a boot. Still read off their documentation rather than a trial.

## goals_served

- Sweep the duplicate headings and duplicate reference entries out of the corpus.: Served by req-a-heading-appears-once-in-a-node, whose pass line is the count reaching zero from twenty-four.
- Make every id-shaped and path-shaped reference resolve, or carry an explicit marker saying why it cannot.: Served by req-a-reference-key-resolves-or-is-marked, the only must in the set.
- Rewrite stale narration bodies into the past tense, and reconcile rows that contradict newer rulings.: Served by no row, deliberately. This is repair work, and a requirement saying the corpus shall have no stale prose today would be unverifiable tomorrow.
- Land the work-token vocabulary wherever the pool spec still teaches the old noun.: Served by req-the-dead-vocabulary-sweep-reaches-the-trace, which is what stops the old noun coming back after the rename.
- Take the dead git verbs out of the use cases and the story that teach them.: Served by the same row, and one more member of the class was found today in the pool function's own statement.
- Settle the test-spec layer's file and path references on the repository root.: Served by req-a-reference-key-resolves-or-is-marked and by req-a-code-citation-names-something-that-exists between them.
- Arm the lints that make each of the above impossible to reintroduce.: Served by all five rows. This goal IS the register.

## bound_breaches

- if-agent-harness-to-entrypoint: none breached. Nothing has been measured against this interface since the gate last signed, because it has never signed before. The window's only slow records are mirror page loads, which this interface does not cover.

## round_2_red_team

- Steelman: the five rows are ceremony over a script somebody could write in an afternoon => At its strongest, the case is that a lint is fifty lines and a requirement node is a hundred, so the specification costs more than the thing. It fails on the register's own job: the rows say what counts as PASSING, and three of the five draw a line that is not obvious. The reference row's marker clause is a ruling, not a detail, and no script carries a ruling.
- Kill-criterion: two of the five are already solved off the shelf => This would be the wrong call if markdownlint and remark-validate-links covered the typed-reference case. The claim that they do not is read off their documentation and was NOT tested against this corpus. That is the weakest evidence in this gate, and it is the same weakness the motivation gate recorded.
- The quality sweep answered six of nine as untouched => Every one of those six is defensible on its own line, but six untouched out of nine is the shape a sweep takes when it is being satisfied rather than run. The two that matter, maintainability and reliability, carry the argument, and performance efficiency carries a measurement.
- A guard gap was found and is not being fixed here => The patch verb writes past the corpus guard, which is the same concern this iteration exists to serve. Leaving it is a real cost and it is recorded rather than argued away. The reason is scope, and the owner has been told rather than the finding being filed quietly.
- The assumption sweep covered 11 of 84 open entries => A keyword filter decided which triggers had fired. It is a filter and not a proof, and the state's own evidence says so in those words. A trigger worded around those keywords would have been missed.

## raid_additions

- raid-asm-the-corpus-stays-small-enough-for-the-sweeps-to-fit-in-boot
- raid-asm-line-endings-do-not-change-what-counts-as-the-same-heading
- raid-iss-the-patch-verb-writes-past-the-corpus-guard

## verdict

pass — The rows are verifiable, traced both ways, function-covered and probed or scheduled with a reason. The set criteria hold for the register as extended, and the nine-characteristic sweep is adjudicated below with no gap left unruled. The dissent worth recording is unchanged from the motivation gate: two of the five lints have mature off-the-shelf equivalents, and the argument that they do not fit rests on their documentation rather than a trial against this corpus. That is enough to proceed and not enough to close the question.

## follow_up

Author an executable check for every one of the five rows, then build them.

THE QUALITY SWEEP, ADJUDICATED. Six of the nine characteristics answered untouched: compatibility, interaction capability, security, flexibility, safety, and the untouched half of performance efficiency. Every one stays open with its stated reason, and no row is owed for any of them.

The three that are touched carry rows: functional suitability across all five, maintainability as the iteration's own point, and reliability through the reference row.

Two probes remain owed at verification, each naming its own fixture or measurement.

## anything_else

THE PATCH-GUARD ISSUE IS THE FINDING THIS MILESTONE DID NOT GO LOOKING FOR. It was found by making the mistake the guard exists to catch, and then asking why nothing stopped it.

It is put to the owner in chat rather than filed silently, because folding an engine fix into a blessed corpus-repair minor is scope the agent does not take alone.

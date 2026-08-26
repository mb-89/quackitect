---
form: gate-requirements
bless: blessed by agent
by: agent
signed_off: 2026-08-21T09:16:53.292Z
authors: agent
files: null
---

# Evidence form / gate-requirements

## current_situation

Design input ends here. Five requirement rows, three functions, three new flows and six probed assumptions stand.

The gate carries no fields of its own by ruling, because six mechanical checks are settled elsewhere. What it adjudicates is the nine-characteristic sweep and the four rounds.

Two probes came back false since the last gate, and both are now issues with their fallout traced.

## round_0_verify

- evidence vs claims: checked against the real channel rather than a document, which is what makes this gate's evidence different from the last two. Six probes ran. `.se/test-progress.jsonl` was read while a run was going and held 313 lines 15 seconds in. `.se/test-timings.jsonl` and `.se/test-last-run.json` were both ENOENT. The handoff call's duration was read from the log at 7 ms, ref `call-6321f0fbd388`. The resolution probe ran over 290 calls. Every requirement, function and flow reference in the three feeder forms resolves to a file that exists.
- types: GREEN. The battery's lint pass ran biome over 350 files in 936 ms with no fixes applied, which covers the static check this project runs.
- lint: GREEN, and the debt carried from three gates is discharged. Biome checked 350 files and applied nothing.
- tests: GREEN, and the debt carried from three gates is discharged. 1716 tests passed across 153 suites with 0 failures, preflight green, and the corpus sweep green over 2429 nodes under spec. Job `test-mt2qcwhz-1`, decided scope `battery` because no battery had run on this container before. The two engine edits made entering this record are inside that green, which is the first time this iteration can say so; they still carry no test OF THEIR OWN and that stays owed to the implementation gate.

## round_1_validate

- exercised against the goal: yes, and further than any earlier gate. The design's hardest open question was answered by running a probe rather than by arguing. A live time remaining was computed from a running job: 49 of 175 files at 26,062 ms elapsed, implying 67,017 ms left.
- missing: nothing new, and the packet's three open questions are now two. What a time remaining rests on is answered. How a passed verdict is noticed to have gone stale is still open and is the last transition in row one's behaviour model. What a duration means for a plain shell command is answered in principle by row four and unproven for that kind of work.
- wrong: TWO THINGS, both found by probing rather than reading. The iteration's rough vision says the estimate comes from the previous run's case count, and that clause is false on any fresh machine. An i37 assumption said a one-second bound is fine enough to time a lane call, and the median call is a thousandth of that unit.
- out of scope: nothing pulled in. The i37 issue was probed because the state says probe every standing assumption, and its fallout is named rather than fixed, because those interfaces belong to the benchmark's cone.
- prior art: no new comparison at this gate and none owed. The requirement shapes follow EARS and the register follows RAID, both borrowed forms rather than compared alternatives, and the M1 comparison stands with its stated limit that the Jenkins derivation rule was not read.

## goals_served

- One lane call reports every piece of work running out of sight, each entry saying how much longer it needs.: served, and the build is smaller than the packet assumed. The status verb already returns `progress: {cases_done: 803, files_touched: 69, files_total: 175}` beside `elapsed_ms: 39739`. Numerator, denominator and clock are all on the answer; what is missing is the division and the unified list.
- A step whose leaving condition runs a long program answers at once and hands its verdict back on a later call.: served, and one of its two risks is now smaller. Handed-off work survived its call for ninety seconds on Linux, so the POSIX branch this depends on is no longer unexercised. It is not discharged: the leaving check is different code and has never run detached.
- The engine picks which tests answer for a change, so a documents-only edit stops firing the whole battery.: served by row five, and this gate's own battery is evidence for it. The run was decided `battery` because no baseline existed — a legitimate fallback that row five does not touch — and it took over ninety seconds to answer a question about markdown edits.
- Engine improvements, the standing goal, holding the two defects found entering this record.: served, and it grew. Two register entries were corrected earlier for carrying grade words the scales do not have. Two assumptions were falsified and re-kinded as issues. An i37 probe that had been written and never run was run.
- THE NINE-CHARACTERISTIC SWEEP, ADJUDICATED: five say not touched and each names its reason. Interaction capability — the actor is a program in all three use cases and the screen is excluded; RULED, stays open, no row owed. Compatibility — no interface with another system changes; RULED, stays open. Security — no new data crosses a boundary and no new process is spawned; RULED, stays open. Flexibility — nothing is host-specific and the one host-dependent fact is deliberately not read; RULED, and it is the one I looked hardest at, because `raid-asm-a-check-left-running-survives-on-every-platform` is a portability concern. It is carried as a register entry with a probe rather than as a requirement, which is the right home for something that could turn out false. Safety — nothing here can hurt anybody; RULED, stays open. NO ROW IS OWED BY ANY OF THE FIVE.

## bound_breaches

- if-agent-harness-to-entrypoint: none breached, and this gate can now say something measured about the bound rather than only about the window. Over 290 calls with a recorded duration, 271 came in under a second and 19 did not, which is 6.6 percent. The maximum was 2275 ms and every one of them was received. SO THE BOUND IS BREACHED ROUTINELY AND THE INTERFACE STILL WORKS, which is two facts rather than one: the one-second demand is real and unmet, and the harness's own limit is comfortably above it. The six mirror_slow records named at the two earlier gates are five of those 19, and they are still uncaused. What is new is the denominator, which no earlier gate had.

## round_2_red_team

- The gate is blessing a register whose vision it just falsified: the iteration's own rough vision says the estimate comes from the previous run, and that is now known false. A gate should not pass a set whose stated premise did not survive. => The premise that failed is the seed's wording, not the signed packet's. The blessed vision packet says "what the job has already done measured against what it has left", which is exactly what the probe confirmed. What died is a clause in an unsigned seed, and the replacement is stronger than the original: no history is needed at all.
- Five rows is a thin register for a major: a change that moves the walk's completion contract deserves more than five demands. => The fan-out heuristic argues the other way, and it is the method's own number. Five is under the threshold for every use case, and the method says a thousand atomic rows is the failure rather than the discipline. What would make five thin is a use-case step with no row, and the coverage check runs both ways.
- Probing was cheap here and that should make you suspicious: six probes in one state, four holding, is the shape of a walk that probed what it already believed. => Two of the six came back false, one of them from another iteration entirely, and one more came back only partly probed with two reasons written down. A pass rate of four in six is not the shape of a rubber stamp. What is fair in the objection is that the cheap probes were run and the expensive ones were not — 85 assumptions carry older dates and were not re-run, and that is stated rather than hidden.
- The battery this gate leans on was decided by a fallback the iteration is trying to remove: it ran everything because no baseline existed, which is exactly the branch row five narrows. => True, and it is the honest reading. Row five does not touch that branch — no baseline is a legitimate reason to run everything, and its use case keeps it as extension 2b. The green is still green.
- The gate still judges work it authored, three gates deep. => Unchanged, and this is the first gate where it matters less. The strongest evidence here was produced by running code and reading files, neither of which cares who wrote the argument. A probe result cannot be written into being.

## raid_additions

- [[raid-asm-the-callers-limit-is-longer-than-a-second]]
- [[raid-asm-work-under-way-records-progress-before-it-ends]]
- [[raid-asm-a-check-left-running-survives-on-every-platform]]
- [[raid-asm-starting-a-judgment-is-far-cheaper-than-answering]]

## verdict

pass — design input closes on a register whose hardest assumption was probed rather than argued, with the battery green and two falsehoods removed

WHAT THE PASS RESTS ON. Six probes against the real channel, four holding and two falsified. A working time remaining computed live from a running job. A green battery: 1716 tests, 0 failures, lint clean over 350 files, sweep clean over 2429 nodes.

WHAT IT DOES NOT CLAIM. That 85 older assumptions were re-probed. They carry dates from the iterations that wrote them and re-running them is not minutes of work. Named as skipped.

WHAT IT DOES NOT CLAIM, SECOND. That the two engine edits made entering this record have tests of their own. They are inside a green battery and that is not the same thing. Still owed at the implementation gate.

THE NINE-CHARACTERISTIC SWEEP IS RULED. Five characteristics say not touched, each with a reason, and no row is owed by any of them.

THE DISSENT WORTH RECORDING. The cheap probes were run and the expensive ones were not. Four of six holding looks comfortable until you notice which six were chosen — they were chosen by having an empty field, which is a mechanical selection rather than a convenient one, and that is the best defence available.

## follow_up

Milestone four opens the solution space: the criteria and the function partition.

Two things are parked with their owners.

- How a passed verdict is noticed to have gone stale is the design's, and it is the last transition in row one's behaviour model.
- The two interfaces resting on the falsified one-second assumption belong to the benchmark's cone, and the entry now carries the numbers whoever takes that work will need.

One debt is discharged and will not be carried forward again. Lint and tests are green, measured, with the job reference on the record.

## anything_else


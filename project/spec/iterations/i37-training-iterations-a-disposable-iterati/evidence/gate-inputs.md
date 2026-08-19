---
form: gate-inputs
bless: blessed by agent
by: agent
signed_off: 2026-08-19T17:11:36.758Z
authors: agent
files:
---

# Evidence form / gate-inputs

## current_situation

M2 is complete. draw-context, map-stakeholders, write-stories and generalize-use-cases are signed.

The boundary does not move and the stakeholder set is unchanged, both argued rather than asserted. Two stories and two use cases are minted, one pair per role the delta actually changes.

Nothing is built. The register carries five entries from M1, two graded fatal, and both are still open.

## picture_judged

THESE ARE THE RIGHT TWO JOURNEYS, and the judgment is that there are exactly two rather than one or five.

WHY NOT ONE. The engineer reads a number; the agent is unable to reach an answer. Same mechanism, opposite sides. A single use case would have made the agent a step inside the engineer's scenario, and the agent's constraints — the ceiling, the concealment, the discarded output — would have become footnotes on somebody else's journey.

WHY NOT MORE. Three candidates were considered and rejected.
- A journey for authoring the report template. That is build work, not a use of the system.
- A journey for reading a trend across many reports. It is the engineer's journey run repeatedly, and a use case per repetition is a use case per Tuesday.
- A journey for the owner ruling on a benchmark result. Nothing in the mechanism asks for a ruling. If one is ever needed, that is a gate, not a use case.

IS ANY ONE OF THEM WRONG. One is thin and it is worth saying so. The engineer's journey ends at "reads the report and takes the delta", and extension 7a admits the first run has nothing to compare against. So the primary journey does not deliver its headline value on first use. That is honest rather than broken — a baseline is a real outcome — but it means the value arrives on the second run, not the first.

WHAT THE COUNTS CANNOT SEE. Both journeys assume the archive keeps growing. If the project stops shipping iterations, the pool freezes and every later run re-walks the same eleven records. Nothing in the design fails at that point; it just stops getting richer.

## unspecified_capability

EVERY LANE TOOL AND EVERY DOOR, AGAINST THE TWO USE CASES.

COVERED BY THE AGENT'S USE CASE, because it walks the machine normally: se_pull, se_file_read, se_file_write, se_file_patch, se_file_search, se_file_glob, se_file_list, se_answer, se_note, se_update, se_test, se_lint, se_run.

COVERED WITH A NEW CONSTRAINT ON IT: se_git. Steps 3 and 4 and extensions 4a and 4b are entirely about this verb. It is the only existing tool whose behaviour this iteration changes.

COVERED BY THE ENGINEER'S USE CASE: se_survey and se_log_query, which are how the reports folder and the call log are read.

UNCOVERED CAPABILITIES, and each is a deliberate absence rather than a gap.
- se_seed_iteration and se_seed_expedition. A benchmark seeds nothing. It re-walks a record that already exists, and the record it walks is never modified.
- se_note_drain and the pool. A run mints no token. Its findings ride the report, and only a finding worth acting on becomes a note afterwards.
- se_web_search and se_web_fetch. Available to the agent as normal. Nothing in either use case constrains them, and nothing needs to: the outside world is not where the answers to a past iteration live.
- The archive doors and the front desk. A benchmark run is not offered at the desk in either use case. That is unspecified rather than ruled, and it is the one real gap this section found.

WHAT IS MISSING ENTIRELY. There is no verb yet for any of it. No se_benchmark, no report template, no folder. Every step in both use cases that touches the mechanism reads NOT YET BUILT in its story deck's proof column, and that is exactly what M2 is supposed to leave behind.

## passes_concrete

SCRIPTABLE, WITH ONE EXCEPTION NAMED BELOW.

WHAT IS CONCRETE ENOUGH TO SCRIPT AT M6. Every step that touches the mechanism names the thing it acts on rather than describing it. The rewind point is the parent of the commit whose message is `iteration <id>: started`, and that resolved to 20abd831 for i33 when it was tried. The ceiling's test is ancestry against a named commit. The choice is an id, a size, or nothing. The concealment is one folder for the length of one binding.

THE EXAMPLE THAT ALREADY EXISTS. i33 at 5f85977f^ is a fully formulated pass: a real iteration, a real rewind commit, and a record read back with status seeded carrying goal, vision and inputs. A spike can run against that pair today.

THE EXCEPTION, and it is the honest one. Extension 5a on the agent's use case says the re-walk's tests may differ from the original's and nothing corrects it. That is a claim about what does NOT happen, and an absence cannot be scripted. It is checkable by inspection only, the same way i34's one-tree requirement was.

WHAT IS NOT YET CONCRETE AND DOES NOT NEED TO BE HERE. The stop point takes a gate name, and no checkpoint vocabulary exists. M3 is where that becomes a requirement.

## round_0_verify

- evidence vs claims: Every claim in M2 either points at a node that now exists or at a measurement from M1. Two stories, two use cases, three referenced neighbours and four referenced roles, all resolving. The one claim that carries no evidence is draw-context's boundary claim, which is falsifiable by construction and marked as such.
- types: Nothing built. No engine code exists in this iteration, so there is nothing to typecheck. An empty set rather than a pass.
- lint: Nothing built. What M2 wrote is corpus prose: two story decks, two use cases and four evidence forms.
- tests: Nothing built, and the battery is not earned here. It belongs to verification and is fired by that state's own exit script.

## round_1_validate

- exercised against the goal: The goal of M2 is to establish the inputs — who, where the boundary runs, and which journeys. All three are answered and two of the three answers are that nothing changed, argued rather than assumed.
- missing: The front desk does not offer a benchmark run in either use case. That is the one uncovered door and it is named at unspecified_capability rather than glossed. No checkpoint vocabulary exists for the stop point; that is M3's.
- wrong: Nothing found wrong in M1's output while writing M2. One M1 claim was strengthened rather than corrected: the bias direction on the honesty assumption.
- out of scope: A quality diff between the re-walk's tests and the original's is out of scope and is now blocked in writing, by extension 5a. It looks like a free signal and is not one.
- prior art: Prior art was positioned at M1 and M2 added nothing to it. The Cockburn shape came from the method card the machine served on the way in.

## goals_served

- A benchmark run re-walks a named archived iteration from the commit before that iteration started.: SERVED. uc-measure-a-machine-change-against-a-finished-iteration states it as a seven-step scenario, and sty-know-whether-a-machine-change-helped proves the input exists at 5f85977f^.
- The lane refuses to resolve any commit that is not an ancestor of the run's rewind point, so the original answers are unreachable while the run is bound.: SERVED AS THE FIRST-RANKED GOAL. uc-walk-an-iteration-from-a-tree-that-cannot-see-its-future makes it step 4, and extension 4a states the fail-closed rule as a step rather than as a note.
- A run is chosen by iteration id, or drawn by size, and a draw records its seed so it repeats.: SERVED. Extensions 1a and 1b on the engineer's use case carry the three ways in: named, drawn by size with its seed recorded, or unnamed.
- Runs cycle through the archive rather than repeating the last one, and the reports folder is the only scheduler state.: SERVED. Extension 1a says the system takes the least recently benchmarked iteration and states which and why, reading the reports folder and nothing else.
- A run fills a benchmark-run item template, and the filled report is the only thing committed.: SERVED. Step 6 fills the report and step 7 reads it. Extension 5a adds what nothing else had said — a failed run is a measurement too and its report records where it stopped.
- The benchmarks folder is concealed while a run is bound and visible everywhere else.: SERVED, and it is the only goal whose use-case step carries a live dependency. Extension 6a conceals the benchmarks folder for the length of a run.
- Where a run stops is configurable, and the whole walk is the default.: SERVED. Extension 1c takes a stop point and requires the report to say so, because a run stopped early cannot be compared with one that was not.
- vp-rigor-without-toil gains one success criterion measuring whether the machine carries more of the weight over time.: SERVED AT M1 AS ARTIFACT, and unchanged here. M2 added no criterion; it added the journeys the criterion measures.

## bound_breaches

- if-agent-harness-to-entrypoint: none observed since gate-motivation signed. Nothing in M2 exercised the entrypoint interface. The same caution stands as at the last gate: nothing was modelled or measured against a bound here, so this is an absence of evidence rather than a clean bill.

## round_2_red_team

- STEELMAN: M2 concluded that the boundary does not move and the stakeholder set is unchanged, which is what an agent concludes when it wants to reach M3 quickly => the objection is right about the incentive and wrong about this case. Both conclusions were argued against a named candidate that was considered and rejected: a neighbour for the past tree, and a role for the benchmark reader. Each was rejected for the same stated reason, that it would put an existing thing in the diagram twice.
- Two use cases from two stories from one iteration is suspiciously tidy => it is tidy because the split was made at map-stakeholders and everything downstream inherited it. If the split is wrong, three artifacts are wrong together. The test is whether stk-agent is really a stakeholder here or just a component, and the answer that keeps it a stakeholder is that its behaviour under a stated condition is the measurement itself.
- The primary journey delivers nothing on first use => true, and admitted in extension 7a. A baseline is a real outcome, but the headline value arrives on the second run. Anyone reading the value proposition should know the payback is one run away, not zero.
- Nothing in M2 is buildable, so the gate passes air => M2 is the inputs milestone. What it owes is journeys and a boundary, and it produced both with their extensions. The correct complaint would be if M3 also produced nothing.
- The ceiling now appears in a register entry, a story slide, a use-case step and an extension. Repetition is not evidence => correct, and it is repetition rather than corroboration. The single piece of evidence under all four is that se_git allows show, log and diff with nothing bounding the commit, read once from gitlane.ts. It has not been tested and nothing here claims it has.
- Extension 6a conceals the benchmarks folder, and the folder does not exist => the extension is written against a mechanism with a known dependency, which is why the dependency is a register entry graded expected rather than a hope.

## raid_additions

- none — M2 opened no new entry. The five from log-risks stand, and each acquired a place in a journey: the ceiling risk is step 4 and extension 4a, the rewind assumption is the precondition, the exclusion issue is extension 6a, the honesty assumption is step 1, and the decision is the whole shape of both use cases.

## verdict

pass — the inputs are established, the two conclusions that look like shortcuts were argued against named alternatives, and every journey step that touches the mechanism says plainly that the mechanism does not exist yet.

WHAT THIS GATE ENDORSES. The boundary, the roles, the two journeys and their extensions.

WHAT IT DOES NOT ENDORSE. Nothing about the mechanism. No requirement is written and nothing is built.

BLESSED BY THE AGENT UNDER A GRANT. The owner said on 2026-08-19 that this walk runs at full autonomy and the agent may bless the gates.

THE DISSENT WORTH RECORDING, and it is the same one as at gate-motivation, one milestone older. The rewind assumption is graded fatal and is still unprobed. It is now the PRECONDITION of a use case, which raises what it costs to be wrong. M3 carries probe-assumptions and that is where it stops being defensible to walk past it.

## follow_up

- M3 is next: write-requirements, derive-functions, identify-assumptions, probe-assumptions, then gate-requirements.
- probe-assumptions is the state that matters most in this iteration. Take the trace nodes naming i33 and ask whether each path resolves at 5f85977f^. If any node the walk must derive is present, the rewind is not a mask.
- write-requirements turns the two use cases into requirements. The ceiling needs the most testable statement, and the fail-closed rule is the part that must be phrased so a test can fail.
- The front desk not offering a benchmark run is an open question rather than a decision. It belongs in write-requirements or in a note.
- The report template needs a standing line saying a stopped run is still a measurement, from extension 5a.

## anything_else

ONE THING THIS GATE NOTICED THAT NO FIELD ASKED FOR.

The ceiling now appears in four places: a register entry, a story slide, a use-case step and an extension. That looks like a well-traced requirement and it is not one yet.

ALL FOUR REST ON A SINGLE READ of gitlane.ts, which showed show, log and diff on the allowlist with nothing bounding the commit. Nothing has been run. Repetition across artifacts is how a corpus makes one observation look like four.

THAT IS WORTH REMEMBERING WHEN THE ITERATION IS READ BACK. The trace will show dense coverage of the ceiling. The evidence under it is one file read on 2026-08-19.

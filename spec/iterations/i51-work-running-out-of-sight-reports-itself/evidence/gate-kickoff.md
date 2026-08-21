---
form: gate-kickoff
by: agent
signed_off: 2026-08-20T21:10:03.815Z
authors: agent
files:
---

# Evidence form / gate-kickoff

## current_situation

Iteration fifty one stands at its kickoff gate, with M0's retro row skipped on an empty inbox.

Two defects were found and fixed on the way into this gate, and both are recorded below as pulled-in work.

The first: ten rigor-matrix gate rows carried literal backslash-n where newlines belonged. Five of them swallowed their whole evidence block into the legal-tools list.

The kickoff gate was one of the five. It could not ask for a change size, which is the one thing it exists to set.

The second: a record with no pin never refreshes the machine frame it walks on, so the row fix could not reach this gate until the walk left the record and came back.

Both are patched. This form is the proof of the first, because the gate is asking for a change size again.

## retro_drained

- note-d8a5d4acd938 — OWNER RULING 2026-08-20: the contract's "THERE I: pending on purpose, and it is mine — the owner's ruling that the contract's no-handover-file line is wrong; the guidance edit is build work inside this iteration, and the note drains when that lands

## goals

- One lane call reports every piece of work running out of sight, each entry saying how much longer it needs.
- A step whose leaving condition runs a long program answers at once and hands its verdict back on a later call.
- The engine picks which tests answer for a change, so a documents-only edit stops firing the whole battery.
- Engine improvements, the standing goal, holding the two defects found entering this record.

## pulled_in

- The job report with a time remaining, from wt-one-lane-call-should-report-the-state-of-every-piece-of-work.
- The non-freezing exit script, from wt-a-step-whose-leaving-condition-runs-a-long-program-should-no.
- The battery-scope fallback, from note-d393a93e0112, whose argument the iteration record already carries as no longer optional.
- The ten corrupted matrix gate rows, found and patched entering this gate.
- The unpinned-record frame freeze, found and patched entering this gate.
- The contract's handover-file line, which the owner ruled wrong on 2026-08-20.

## left_out

- Work started by another session or another clone. One agent works one clone, so the report covers this lane's own jobs.
- The mirror's presentation of the job list. The goal is one lane call; the screen is a separate question.
- Retiring se_run with jobs true. It stays until the unified report has proven itself.
- Repairing the battery's timing instrument. That is raid-asm-battery-timings-measure-work, and it is cited as a risk to the estimate rather than absorbed as scope.

## change_size

major — the walk's hop-completion contract moves, and four goals sit on it

WHICH PART OF THE BASELINE THIS IS EXPECTED TO MOVE, which is what this column owes.

Today a hop completes when its exit script returns. The second goal changes that: a step may leave with a verdict still owed, and the machine has to hold a pending result against a state.

That is the walking core's own execution model, not a requirement sitting on top of it. The work token says as much in its re-entry condition, which names the walking core being opened as the precondition.

THE COUNT AGREES. Four goals, and this row's own rule says more than two or three argues for major.

WHAT ARGUES THE OTHER WAY, stated because it is real. Every piece is additive. The job table exists, the asynchronous handoff shape exists one lane over in se_run and se_test, and nothing is being replaced.

WHY THAT DOES NOT WIN. Additive at the surface still moves the contract underneath. A state that can be left with work outstanding changes what green means for every gate below it.

NO STRIKES. Major is full on every row, and nothing here reduces the walk.

## round_0_verify

- evidence vs claims: checked by opening the sources, not by trusting the summary. The matrix corruption was proven by a patch that matched a literal backslash-n and by the gate serving change_size afterwards. The frame freeze was proven by reading the early return in driftReopen and the false answer pinIsStale gives with no pin.
- types: clean. npx tsc --noEmit over the deliverable project exited 0 after both engine edits, run at the front desk before re-entry.
- lint: not run, and owed. No lint verb is legal at this gate, so it moves to the implementation gate.
- tests: not run, and owed. The battery belongs to verification and se_test is illegal here. The two engine edits carry no test yet, and writing one is build work inside this iteration.

## round_1_validate

- exercised against the goal: partly. The gate's own output is a brief, and the brief answers the four goals with scope and a column. Nothing is built yet, so nothing else can be exercised.
- missing: what the report answers when it cannot estimate. The vision states the arithmetic as fact and never says what a first run returns. Minted as raid-asm-a-first-run-has-timings-to-estimate-from.
- wrong: the vision's claim that a battery knows its case count from the previous run. True on a machine that has run before, false on a fresh container, which is every unattended run's first test call.
- out of scope: nothing pulled in that the goals do not carry. The two defects found entering the record sit under the standing engine-improvements goal rather than widening the four.
- prior art: compared, and the first comparison I reached for did not survive checking. GitHub Actions publishes job execution time after the fact, not a time remaining for a running job, per its own monitoring documentation. Jenkins does carry the shape this iteration wants: hudson.model.Run in Jenkins core 2.578 declares an estimated-duration member, and a running build is presented against it. WHAT JENKINS DOES BETTER: the estimate is derived from prior builds of the same job and has run at scale for years, which ours has not. WHAT OURS SHEDS: no daemon, no dashboard, no broker. The job table already lives in the lane process, so the report is one more answer on a call the agent already makes. PRIMARY SEEN for the declaration itself; the derivation rule behind it was not read, and that is stated rather than assumed.

## bound_breaches

- if-agent-harness-to-entrypoint: none breached. This gate has never signed, so the window is this session, and nothing in it was recorded against that interface. Two mirror_slow records stand in the same window, on the mirror's own HTTP surface rather than this one, and they are named here as an observation rather than counted as this bound's breach.

## round_2_red_team

- STEELMAN, the case against building this at all => The strongest opposing case is that polling is cheap and an estimate is a lie with a number on it. An agent that calls a status verb every few seconds gets the truth, costs almost nothing per call, and never misleads. An estimate built on contended timings can be wrong by a factor of twenty and will be believed exactly because it is specific. On that reading the honest product is a better status verb, not an estimate at all.
- The answer => The steelman is right about the danger and wrong about the cost. The token records the cost as measured: a step froze the agent's only verb for sixty-eight seconds, and two calls timed out at the tool boundary with one of them having partly landed. That is not cheap polling, that is a caller told the work failed while it had in fact moved. The estimate is the second-order want; the non-freezing verb is the first, and it stands on its own.
- KILL-CRITERION, what would make major the wrong column => That the hop-completion path turns out to already support a deferred verdict, so nothing in the walking core moves. Looked for it, did not find it. The exit script is awaited inline today, which is exactly why the pull froze.
- The estimate rests on an instrument the register already calls corrosive => raid-asm-battery-timings-measure-work stands open and says a case's recorded duration is its own work plus whatever it waited for, with one run showing summed case time of 1534695 ms against a wall of 76985 ms. An estimate computed from those figures inherits that error. This is cited against the first goal rather than dismissed, and left_out says plainly that repairing the instrument is not absorbed here.
- A fresh container has no history at all => Minted as an assumption with a probe. The design owes an honest answer for the no-history case, and a figure with nothing behind it is worse than none.
- The gate is judging work it also authored => True, and it is the weakest thing about this round. The kickoff brief and this review are the same pass. What is checkable is checked: the size parser was read rather than assumed, and the prior-art claim was dropped when the source did not support it.

## raid_additions

- raid-asm-a-first-run-has-timings-to-estimate-from
- raid-asm-battery-timings-measure-work

## verdict

pass — the brief carries its goals, its scope and a column with the architectural suspicion named

WHAT THIS PASS DOES NOT CLAIM. Lint and tests are owed and said so in round 0, rather than left blank. The two engine edits made entering this gate carry no test yet.

WHAT IT RESTS ON. The gate is asking for a change size again, which is the direct proof that the matrix repair landed. The typecheck stands clean over both engine files.

THE DISSENT WORTH RECORDING. This gate reviewed a brief it wrote in the same pass, which is the structural weakness of round 2 and cannot be fixed from inside it.

## follow_up

The walk continues into the milestones the major column compiles.

Three things are parked with their owners rather than left loose.

- The lint and test debt from round 0 belongs to the implementation gate.
- The guidance edit for the handover-file ruling is build work here, and note-d8a5d4acd938 drains when it lands.
- The estimate assumption carries its own probe and is the design's to answer, not this gate's.

## anything_else

The refusal that finally exposed the matrix corruption printed [object Object] in its list of legal tools.

That is the broken parse rendered directly into the one message an agent is guaranteed to read, and nothing named it as a fault.

A lint refusing a literal backslash-n in matrix-row frontmatter would have caught all ten rows at the write that made them. It is a two-character signature that cannot occur legitimately in a tool name.

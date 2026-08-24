---
form: gate-requirements
bless: blessed by agent
by: agent
signed_off: 2026-08-24T16:13:46.747Z
authors: agent
files:
---

# Evidence form / gate-requirements

## current_situation

Design input ends here. Six requirement rows, three functions, four flows and three assumptions stand for the delta, and one standing use case gained an extension.

All four assumptions in play were probed against the real channel today, on the platform branch the register says had never run. All four hold.

This gate carries no mechanical fields of its own. What it asks is the four rounds, plus an adjudication of the nine-characteristic sweep answered at write-requirements.

## round_0_verify

- evidence vs claims: every claim in the register traces. The probe figures are from a run whose full output is in the call log, not from memory. The two prior-art behaviours are from pages fetched during this record. The two partial fixes already in the engine are cited by file and line.
- types: not run. No source file has changed. This record has written specification nodes and nothing the typechecker reads.
- lint: not run, for the same reason.
- tests: not run, and correctly so. The engine decides scope from what changed, and nothing it tests has changed.

## round_1_validate

- exercised against the goal: the register is checked row by row against the record's vision. Every goal the kickoff signed has a row, except the retention ruling, which is a decision and belongs at record-adrs.
- missing: a restart policy, named as out of scope at the motivation gate and unchanged here. Also Windows measurement for two probes, which is stated rather than assumed.
- wrong: one thing was WRONG and is now corrected. The register was written treating asking a pid and asking a handle as one mechanism. The probe showed they are not: a pid is reused, so a reaped child's number can report a dead run as alive. The requirement's Detail already said ask the handle; the probe is what made that a measured choice rather than a preference.
- out of scope: nothing new. The helper-budget timing fault remains a work token.
- prior art: COMPARED at the motivation gate, at the primaries, and not re-argued here. The comparison is not re-opened because the vision is axiom past that gate.

- THE NINE-CHARACTERISTIC SWEEP, ADJUDICATED. Four characteristics were answered NOT TOUCHED at write-requirements: interaction capability, security, flexibility, and nothing else. Each stays open with its reason, and none owes a row. Interaction capability: no surface changes, and the account's shape is unchanged. Security: nothing changes what may be launched or by whom, and the widening is per argument and adds no capability. Flexibility: no new host, no new configuration surface. RULED: no gap in the sweep owes a requirement before this gate blesses.

## goals_served

- The engine holds the live end of every process it launched and asks it, on a fixed interval, whether it is still there.: served by req-the-engine-holds-what-it-launched-and-asks-whether-it-exists, and its load-bearing assumption is now probed and holding.
- Silence past that interval ends the process and closes its entry.: served by the same row, with the existence-not-responsiveness ruling written into its Detail.
- A test run closes its own entry when the process behind it exits, so the heartbeat is a backstop and not the only guard.: served by req-a-run-closes-its-own-entry-when-its-process-exits, widened from test runs to every kind the job table holds.
- No wait is silent. A wait carries a duration, and expiry does something rather than nothing.: served by req-every-wait-declares-a-bound-and-expiry-acts, and it is the row that catches a hung process the existence question cannot see.
- How long a completed task's file is kept is decided first, and only then is the clearing built.: NOT served by a requirement, deliberately. It is a decision and it is owed at record-adrs. Named here so the gap is ruled rather than discovered.
- One engine holds a given folder and its network port, and a second one that cannot bind says so instead of running on half-alive.: served by req-one-instance-holds-a-folder-and-its-port, and the probe showed the port releases on a kill, so the counter-risk does not fire.
- Registering a spawned hand works from wherever the walk stands.: served by req-registering-a-spawned-hand-is-accepted-wherever-the-walk-stands, traced through extension 6e of a standing use case rather than a new one.

## bound_breaches

- if-agent-harness-to-entrypoint: no breach since this gate's phase opened. The one crossing in this record was at M0 and its disposition is recorded there: a hand was spawned, the budget refused to count it, and the hand was closed. Nothing crossed the boundary in M2 or M3.

## round_2_red_team

- STEELMAN: the strongest case against this register is that it specifies a process supervisor, a solved problem, and the honest move is to adopt one rather than write six rows => REJECTED, and the probe is why. Both mature supervisors need the supervised thing to cooperate, and this product launches shells, test runners and exit scripts that were never written to answer. Adopting one would mean rewriting every child, which is larger than what is specified here.
- KILL-CRITERION carried from the motivation gate: this is wrong if a launched process cannot be asked whether it exists => LOOKED FOR IT AND ANSWERED IT. Measured on linux, node v22.22.2: the handle reads exitCode 0 after a normal exit and signalCode SIGKILL after a kill. The criterion is closed for POSIX and open for Windows.
- A NEW KILL-CRITERION THE PROBE CREATED: this is wrong if the design asks the pid rather than the handle, because a pid is reused and a reaped child's number can come back attached to an unrelated process => the requirement's Detail names the handle, and M4 must treat the two as different candidates rather than two spellings of one.
- The two-closer design could disagree about the OUTCOME rather than the timing => the idempotence row keeps the first outcome and records the disagreement. If disagreements turn out common, that row needs a precedence rule and not only idempotence.
- The single-engine row was written as a logging concern and turns out to be load-bearing for something else => probing the standing one-agent-per-clone assumption showed two writers on one tree are safe only because one engine serialises them. It is left at `should` anyway, because nothing in this record's scope fails without it and inflating it would defeat the consumer at M4.
- The weakest part of this gate is unchanged from the last one, and it is not a finding about the work => one hand authored this register and blesses it. The walker ceiling is zero by the owner's word, so the separation a reviewer buys was not bought, and a reader should weigh the gate accordingly.

## raid_additions

- none

## verdict

pass — the register is verifiable, traced, function-covered, and its assumptions are probed rather than asserted.

WHAT THIS VERDICT RESTS ON. Six rows each carrying a verify method and a measure. Coverage checked mechanically in both directions at two states. Four assumptions probed against the real channel today, with the run's output in the call log.

WHAT IT DOES NOT REST ON. Any built artifact, any test run, or any measurement on Windows. Two of the three new probes are POSIX-only, and the register says plainly which half is unmeasured rather than leaving a blank that reads as done.

ONE FINDING CHANGED THE DESIGN RATHER THAN CONFIRMING IT, and it is the reason this gate is worth more than a rubber stamp. Asking a pid and asking a handle are different mechanisms, and only the probe showed it. M4 inherits that as a real distinction between candidates.

THE DISSENT WORTH RECORDING: the hand that wrote this register is the hand blessing it. A reader should weigh this gate accordingly.

WHAT WOULD REOPEN IT: a Windows measurement contradicting either POSIX probe, or a disagreement between the two closers that turns out to be about outcome rather than timing.

## follow_up

Design input is closed. M4 opens the solution space from these functions.

TWO THINGS TRAVEL FORWARD BY NAME.

- The handle-against-pid distinction is a candidate-level difference, not an implementation detail. A design that asks the pid is a different design, and it is a worse one for a measured reason.
- The retention length is still owed as a decision at record-adrs, and the completed-task pile keeps growing until the sweep that acts on it is built. That sweep is a named non-goal of this record.

## anything_else


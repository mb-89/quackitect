---
form: gate-implementation
bless: blessed by agent
by: agent
signed_off: 2026-08-24T17:14:07.061Z
authors: agent
files: null
---

# Evidence form / gate-implementation

## current_situation

The battery is green: 1,816 cases, 157 suites, no failures. The corpus sweep, the linter and the preflight are green beside it.

i62 asked for background work that reports its own end. Six behaviours landed. An entry closes itself when its process exits. A sweep closes what is already gone. Every wait declares a bound. Expiry acts without ending live work. One instance holds a folder and its port. Registering a spawned hand works from any state.

A reviewer with fresh eyes read the delta twice. It found seven defects in the first build and five more in the fixes for those. All twelve are closed.

The three heaviest were in code written to close the earlier ones. That is the shape worth naming: the second pass over a defect is where the worse defect went in.

One kickoff goal is served as a ruling with no code, by design. One is served differently from how it was worded, and the reason is in the register.

## quality_ok

- [x] Dependencies stay layered
- [x] Every new element carries one stated responsibility
- [x] The linter and the complexity ceiling are clean, with no new suppression
- [x] Every new behavior carries its check, and the battery is green at rest
- [x] Nothing speculative shipped
- [x] What changed is findable
- [x] Every quick-and-dirty taken stands as a visible raid debt entry

## debt_taken

- none

## risks_acceptable

acceptable — every risk this record added is registered with a trigger, and the one new one has a bounded worst case.

The register gained one risk this record did not have: every bound in the product is the same thirty-minute default, so the bound measures duration rather than trouble.

What makes it acceptable is that its worst outcome is now bounded. An expiry no longer closes an entry for good. A real ending replaces it and puts the entry back in front of a reader, and a handle that says the process is there is never expired at all.

So the cost is one wrong answer in a window, not lost work.

The standing risk about the existence check was re-read and still holds. Asking whether a process exists is a weaker signal than asking whether it answers, and this build accepts that deliberately, because only existence can be asked of an arbitrary child.

Against the praise: nothing here was proven on Windows, and no case runs there.

## round_0_verify

- evidence vs claims: every claim in the step evidence was read back against the code it names. Two were overstated and were rewritten: a confirm run I called green before its verdict existed, and a design note asserting nothing reachable could throw.
- types: clean. The typechecker runs after every edit and its last answer carried no error.
- lint: clean, with no suppression added. One function crossed the complexity ceiling and was split rather than exempted.
- tests: green. 1,816 cases, 157 suites, 0 failures, 111 seconds. A scoped run over the two changed test files is green beside it.

## round_1_validate

- exercised against the goal: yes, on this machine. Three assumptions were probed with a real script rather than reasoned about, and one of them changed a design choice: a handle names how a process ended, a process number only says something with that number is there.
- missing: the retention ruling the scope promised. The scope said the number is decided and written down here, and nothing had written it. It is now in the work-account design spec, seven days after settling, with its reasoning and with who chose it.
- wrong: the first bound closed entries whose process the engine could see running, which is the fault this record opened against, inverted. Fixed: existence beats the clock.
- out of scope: nothing was widened. The sweep that clears the completed-task pile stays a named non-goal, and the helper-budget timing stays a work token.
- prior art: the engine's own reap-at-startup already closed what a previous engine left behind. This record covers what dies while the engine is still running, which nothing did.

## goals_served

- The engine holds the live end of every process it launched and asks it, on a fixed interval, whether it is still there.: served. The registry keeps the handle and the number, and asks on the reads that compose the account.
- Silence past that interval ends the process and closes its entry.: served differently, and the difference is deliberate. The sweep asks whether the process EXISTS, never whether it answered, and it never ends the process. Liveness and responsiveness are different questions and only the first can be asked of an arbitrary child. The reasoning stands in raid-risk-the-heartbeat-ends-a-process-that-is-alive-but-quiet.
- A test run closes its own entry when the process behind it exits, so the heartbeat is a backstop and not the only guard.: served. The exit listener settles the entry it was made for, and the sweep is the backstop for work that never reaches it.
- No wait is silent. A wait carries a duration, and expiry does something rather than nothing.: served. Every entry carries a bound with the word that says whether it was measured or defaulted, and expiry produces an outcome naming both.
- How long a completed task's file is kept is decided first, and only then is the clearing built.: served as a RULING only, and the ruling had to be written during this gate because the scope promised it and nothing carried it. Seven days after settling, in dsp-the-work-account.md. The sweep that acts on it is a named non-goal, so the pile keeps growing until it is built.
- One engine holds a given folder and its network port, and a second one that cannot bind says so instead of running on half-alive.: served. The take blocks the boot and does not wait on the mirror, so nothing touches the folder before the hold is decided.
- Registering a spawned hand works from wherever the walk stands.: served. The exemption pins the value and the whole call shape, and it sits below the closed-machine guard.

## bound_breaches

- if-agent-harness-to-entrypoint: no breach. Nothing in this record changed what crosses that boundary. The entrypoint gained one blocking call before it serves, which is inside it rather than across it.

## round_2_red_team

- The bound closes an entry whose work is still running, and the real verdict then never reaches a reader => Fixed. An expiry marks the entry correctable rather than final. A real ending replaces the bound's string and clears the account's marks, so the corrected entry rides an answer again.
- The bound ignores a handle that says the process is alive => Fixed. Existence outranks the clock. The clock decides only where existence cannot be asked.
- A bound outcome followed by a real outcome is filed as two closers disagreeing => Fixed. An expiry is not a closer, so the real ending replaces it instead of being recorded as a fight.
- A refused second instance kills the first instance's live jobs on its way out => Fixed. The take is awaited before anything touches the folder, so the reap never runs before the hold is decided.
- No workspace hold is taken at all when the mirror is disabled => Fixed. The take no longer sits behind the mirror check. That configuration is the likely one on an unattended machine.
- The registration exemption tested key presence, never value, so a shell command ran in every state => Fixed in the first pass, and re-verified here against nine call shapes. It pins the value and the whole call shape, and it sits below the closed-machine guard.
- A write that throws on the account path fails every lane call rather than one verb => Fixed. The writer records its own failure on the entry and says it once, and never raises.
- One entry that throws leaves every later entry unswept => Fixed. Each close is isolated, and a case with a handle that refuses to be asked proves it.
- The sweep closes work belonging to a folder nobody asked about => Fixed. The sweep is scoped to the folder, and the throttle is per folder.
- Entries closed by the sweep or the exit listener never reach the estimate calibration => Fixed. All three closers grade the prediction.
- Nothing pins that the registration exemption sits BELOW the closed-machine guard, so a future edit could move it and break nothing visible => Accepted, and captured as a note. The predicate carries the whole decision and the gate's use of it is one line.
- No case runs on Windows => Accepted risk, unchanged from before this record. It is the standing condition of this tree rather than something this record introduced.

## raid_additions

- spec/trace/raid/raid-risk-one-blanket-bound-is-given-to-work-nobody-measured.md
- spec/trace/raid/raid-iss-a-finished-run-keeps-reporting-itself-as-running.md
- spec/trace/raid/raid-risk-the-heartbeat-ends-a-process-that-is-alive-but-quiet.md
- spec/trace/raid/raid-risk-two-closers-reach-one-entry-and-disagree.md
- spec/trace/raid/raid-risk-two-engines-run-one-folder-and-neither-says-so.md
- spec/trace/raid/raid-risk-the-one-engine-guard-locks-out-a-restart-after-a-crash.md
- spec/trace/raid/raid-risk-widening-a-verb-s-legality-weakens-the-state-gate.md
- spec/trace/raid/raid-asm-a-launched-process-can-be-asked-whether-it-still-exists.md
- spec/trace/raid/raid-asm-asking-every-held-handle-on-an-interval-costs-nothing-measurable.md
- spec/trace/raid/raid-asm-a-crash-releases-whatever-carries-the-workspace-hold.md

## verdict

pass — every measured fault the record named is closed, each pinned by a case that was red before it, and the tree is green at rest.

What argues against a plain pass, said first. One kickoff goal is served as a ruling with no code, and I had to make that ruling myself during this gate because the scope had promised it and nobody had written it. A number that governs deletion, chosen alone, is the kind of decision the owner may want back.

The second argument against: the reviewer found more defects in my fixes than in the original build, and three of them were worse than what they replaced. The tree is green now and the reviewer re-read every one, but that pattern is a fact about this record's build and it belongs in the verdict rather than under it.

What carries the pass. The two spec contradictions a fresh reader found are resolved in favour of keeping both halves true rather than dropping one. Nothing was widened past the scope.

## follow_up

- BUILD THE SWEEP THAT CLEARS THE COMPLETED-TASK PILE. The number it needs is now decided: seven days after settling, in dsp-the-work-account.md. Ready when somebody opens a record for it.
- MEASURE A BOUND PER KIND OF WORK. Every bound in the product is the same default, registered as raid-risk-one-blanket-bound-is-given-to-work-nobody-measured. Ready when a week of settled entries has been counted.
- PIN THE GATE'S ORDER AROUND THE REGISTRATION EXEMPTION. Captured as a note. Ready when the state gate is next opened for other reasons.
- FIX WHEN THE HELPER BUDGET IS SET. The setup state asks for a hand before the gate that agrees one, so at the first milestone the request is always refused. It stands as a work token and this record did not touch it.

## anything_else


---
form: gate-prototype
bless: blessed by agent
by: agent
signed_off: 2026-08-14T14:44:26.516Z
reopened: 2026-08-14T14:37:56.590Z — the register moved under it at author-tests — two assumptions probed and req-entry-binds-worktree deleted — and the claim guard reports it not standing while se_why reports…
authors: agent
files: null
---

# Evidence form / gate-prototype

## current_situation

FOUR SPIKES RAN AND ALL FOUR HOLD. Every one answered with a number and none exceeded its budget.

- ONE SEAM. The seam is achievable. The shell is inside it for free, the platform refuses nothing, and the bypass surface is 40 resolver call sites against 88 direct joins.
- CHANNEL COST. 144 microseconds per crossing, against a budget of a million.
- SATELLITE START. 306.9 ms with the engine module load included, which is a third of the budget.
- INFLIGHT DEATH. Three break kinds give one observable end state inside 100 ms.

TWO BOARD FIGURES WERE CORRECTED. The start figure of 36 to 67 ms was a floor read as a total, and the real number is five to eight times larger.

ONE REGISTER ENTRY CHANGED KIND. raid-risk-a-write-lands-in-the-wrong-tree-silently is an issue rather than a risk, because the probe recorded it happening twice on one day.

NOTHING PROMOTES INTO THE BUILD from this round's four probes. The findings are the product.

## buildable

yes — every measured number sits inside its budget, the one open question the architecture could not answer for itself now has an ordinary answer for three of its four cases, and the fourth needs a decision rather than a discovery.

## round_0_verify

- evidence vs claims: the four experiment nodes were opened and their numbers match the forms. One real defect found: the fold-back's node-table wrote a TRUNCATED folds_to onto all four nodes, cut mid-sentence with an ellipsis. Repaired by hand and filed as note-324983b06229. RE-EARNED 2026-08-14 after two assumptions were probed and one row deleted: raid-asm-machine-wide-state-serves-over-a-local-channel holds at 144 microseconds a crossing, raid-asm-session-identity-survives-a-reload holds by inspection of the shim, and req-entry-binds-worktree was deleted on the owner's ruling with its last live edge cut from fn-run-a-governed-walk.hold-the-work. All three strengthen this claim and none moves it.
- types: unchanged since the clean run at gate-architecture. No engine source was touched this milestone, and the three probe scripts live outside the product at .se/spike/.
- lint: the four experiment nodes this milestone wrote are clean, after 8 findings were fixed. 13 findings stand on four nodes from earlier records and were left alone.
- tests: no run was earned. No engine code changed, so there is no question a scoped run would answer. The probes ran as standalone scripts and reported their own numbers.

## round_1_validate

- exercised against the goal: the goal is a bound walk that never leaves its worktree, and a write that lands where the walk stands. The seam probe went straight at the second half and found it BROKEN today, with two dated instances. That is the strongest evidence this record is worth building, and it came from a probe rather than an argument.
- missing: nothing here runs two processes at once. No satellite exists, so contention between satellites, a seam running in two address spaces, and a levelling under load are all untested. They need something built and no spike could have reached them.
- wrong: the board's satellite-start figure. 36 ms warm and 67 ms cold was the floor of a bare process, read as the cost of a start. The probe reproduced both numbers exactly in its bare column and then measured 306.9 ms with the engine loaded.
- out of scope: the profile of where the time goes in normal work. The owner ruled on 2026-08-14 that no decision hangs on it, because the throughput argument was scored at zero and the winner won anyway.
- prior art: NOT COMPARED THIS ROUND, and the reason is that these probes measured our own platform rather than anyone's design. The design comparison was made at gate-architecture against nginx and PostgreSQL at their own documentation, and it produced raid-risk-a-broken-engine-delta-has-no-way-back. Nothing this round would have been sharpened by repeating it.

## round_2_red_team

- STEELMAN, the opposing case at its strongest: four probes designed by the agent that wants the design to work came back four for four. That is what a rigged set looks like, and a set that never disagrees with its author is worth less than one red result. => The pattern is real and the defence is narrow: none of the four tested the architecture against a hostile case. They tested whether the platform can do what the design assumes, and the platform is ordinary server machinery doing ordinary things. A green result there is expected rather than impressive.
- THE KILL-CRITERION for this gate: the design is not buildable if a measured number exceeds its budget. => None did. The closest is the satellite start at 306.9 ms against 1000, and it is affordable only because a start happens when a record opens rather than when a call arrives.
- The probes were written and judged by one agent, with no blind pass. The M4 scoring was blind-audited twice and this was not. => True, and it is the weakest methodological point here. The defence is that these are numbers rather than judgments: the three scripts stand at .se/spike/ and anybody can re-run them. Reproducibility is a weaker check than a blind scorer and it is a real one.
- The seam property became an ISSUE at this gate, so the design's core promise is broken in the shipped product today. => Yes, and that is an argument for building rather than against. The issue is the thing i27 exists to fix, and the probe turned it from a prediction into two dated instances with exact paths.
- The 307 ms start eats a third of the one-second budget, and the probe did not include levelling a tree or rebasing a delta. => Accepted. The real start is that number plus work nobody has measured, and the levelling is the part most likely to dominate. The lever the build has is loading less eagerly: the walk kernel alone is 223 ms against the verb surface's 307.
- A hung satellite is invisible, so the requirement that every break kind reaches one end state is not met by the platform. => Confirmed, and it narrows to one number. The supervisor's watch act needs a deadline above 94 ms, because a crashing process takes that long to reach the caller and a deadline below it would call a crash a hang.

## raid_additions

- none

## verdict

pass — four of four riskiest assumptions were probed and hold, no measured number exceeded its budget, and the one entry that moved moved toward the evidence rather than away from it.

## follow_up

WHAT THE BUILD INHERITS, in the order the numbers put it.

- THE DIRECT-APPEND FLOOR at 124.7 microseconds, because the file is opened and closed each time. A kept-open handle is worth more than any channel design could win back.
- THE RESOLVER SWEEP. 88 paths built with a direct join against 40 through the resolver. The dispatch layer is nearly clean at 7 against 1, so the work is in modules that read for themselves, and lint.ts is the worked example.
- THE DEADLINE on the supervisor's watch act, above 94 ms.
- THE START CONSTRAINT. A satellite starts when a record opens, and at 307 ms nothing else is affordable.

WHAT NO LONGER NEEDS DESIGNING. Detection of a dead satellite. The channel reports it in under 100 ms whether the process exited, crashed or was killed, so no heartbeat protocol is owed.

THREE FORM DEFECTS FOUND WHILE WALKING THIS MILESTONE, all the same class. A surface computes or copies a value and the author cannot see what it did.

- The node-table truncates a long cell into the node, silently (note-324983b06229).
- The exit script passes a grade that is still a mint comment, so 32 entries fell off the exposure chart while the check read green (note-3465043278d3).
- Nothing stops a computed matrix being written into prose, where it goes stale under a signature (note-6fd08080090f).

## anything_else

WHY raid_additions IS none, said rather than left blank.

The review looked for an assumption this milestone treats as true without establishing it. The nearest candidate is that the measured channel cost transfers to whatever channel the design finally picks, since the probe used loopback TCP and if-core-satellite says only local channel.

It was not filed, because its failure mode is one-directional and favourable: a named pipe or a stdio channel would be faster than loopback TCP, not slower. An entry whose only way of being wrong is being better is register noise.

WHAT WOULD CHANGE THAT. A channel choice that adds serialisation the probe did not pay for, such as JSON over HTTP. If the build goes that way the number is re-owed and this paragraph is the trigger.

---
form: fold-back
by: agent
signed_off: 2026-08-14T14:03:57.058Z
authors: agent
files:
---

# Evidence form / fold-back

## current_situation

FOUR SPIKES RAN AND ALL FOUR HOLD. Each answered its question with a number, and two of them corrected a figure the board had been carrying.

- ONE SEAM. The seam is achievable. The shell is inside it for free, the platform refuses nothing, and the bypass surface is 40 resolver call sites against 88 direct joins.
- CHANNEL COST. A crossing costs 144 microseconds per append, against a budget of a million.
- SATELLITE START. 306.9 ms with the engine module load included, against the 36 to 67 the board recorded with it excluded.
- INFLIGHT DEATH. Three break kinds give one observable end state inside 100 ms. A hung satellite gives none at all.

ONE ENTRY CHANGED KIND. raid-risk-a-write-lands-in-the-wrong-tree-silently is now an issue rather than a risk, because the probe recorded it happening twice on one day.

NOTHING PROMOTES INTO THE BUILD. All four probes produced findings, and the throwaway law holds: the finding is the product.

## folded

| experiment | folds_to | promote |
| --- | --- | --- |
| [[exp-channel-cost]] | raid-asm-machine-wide-state-serves-over-a-local-channel probed for the call log at 144 microseconds a crossing; el-core keeps the call log and no requirement moves | none — the build attacks the 124.7 microsecond direct-append floor first, by keeping a handle open |
| [[exp-claim-verb-race]] | raid-asm-remote-serializes-claims carries the dated local-half measurement extended to the whole verb; nothing upstream moves — the winner and its ADR stand as decided | the verb's mechanism as measured — record then announce, rebase-and-retry on rejection, release as a second commit — enters the M7 build through the gate; the spike code itself is throwaway |
| [[exp-inflight-death]] | raid-ar-crash-lands-safe re-grounded — the channel detects a dead satellite in under 100 ms, so el-satellite-supervisor's WATCH act owes a deadline rather than a detector | none — the deadline is one number for specify-build, and it must sit above the 94 ms a crash takes to reach the caller |
| [[exp-kill-and-resume]] | raid-ar-resume-needs-no-person carries the dated probe — the hinge holds today, and the hard-kill variant stays deferred with the POSIX until | none — the files-only property holds by construction, and the build must not erode it |
| [[exp-latency-ledger]] | raid-ar-call-answers-in-one-second re-grounded on the dated ledger and the stale 274 retired — the demand stands and is missed today | none — the fix is the async round's ticket desk, chartered in the backlog |
| [[exp-one-seam]] | raid-risk-a-write-lands-in-the-wrong-tree-silently moves from risk to issue on two dated instances; el-resolution-seam's refuse act is confirmed required, because the platform serves an escaping path without complaint | none — the work is routing the modules that read the filesystem for themselves through the resolver, and lint.ts is the worked example |
| [[exp-satellite-start]] | raid-ar-call-answers-in-one-second re-grounded at 306.9 ms with the module load; el-satellite-supervisor's start-per-record becomes a constraint rather than a preference | none — the constraint enters specify-build as a property of the START act, and loading less eagerly is the lever it has |
| [[exp-trunk-read-cost]] | raid-dec-thin-tree carries the dated measurement — the bet holds in the batch-reader shape only, and no requirement moves | the long-lived batch reader as the M7 build's trunk-read shape — a spawn per read is ruled out by measurement |

## follow_up

WHAT THE BUILD INHERITS, in the order the numbers put it.

- THE DIRECT-APPEND FLOOR. 124.7 microseconds per append, because the file is opened and closed each time. Keeping a handle open is worth more than any channel design could win back.
- THE RESOLVER SWEEP. 88 paths built with a direct join, against 40 through the resolver. The dispatch layer is nearly clean at 7 against 1, so the work is in modules that read for themselves.
- THE DEADLINE. One number on the supervisor's WATCH act, above 94 ms.
- THE START CONSTRAINT. A satellite starts when a record opens. At 307 ms nothing else is affordable.

WHAT NO LONGER NEEDS DESIGNING. Detection of a dead satellite. The channel reports it in under 100 ms whether the process exited, crashed or was killed, so no heartbeat protocol is owed.

THE ADR THAT READS DECIDED AND IS UNBUILT still stands. raid-dec-thin-tree was probed for its read half in an earlier record and the winner rests on it. M6 did not touch that.

WHAT THE SPIKES DID NOT REACH. No satellite exists, so nothing here tests a seam in two processes, contention between satellites, or a levelling under load. All three ride with the build.

## anything_else

TWO BOARD FIGURES WERE WRONG AND BOTH WERE WRONG THE SAME WAY. They measured a floor and were read as a total.

The start figure said 36 ms warm and 67 ms cold, with the engine module load named as excluded. The probe reproduced both numbers exactly in its bare-Node column, which is what makes the comparison sound, and then measured 306.9 ms with the load. Between five and eight times larger.

That is the value of naming an exclusion rather than hiding it. The old figure was honest about what it left out, so the correction took one measurement rather than an argument.

WHY ALL FOUR HELD. Worth saying plainly, because four green probes invite less scrutiny than one red one. None of them tested the architecture against a hostile case. They tested whether the platform can do what the design assumes, and the platform is ordinary server machinery doing ordinary things.

The questions that could still fall are the ones no spike could reach: contention, levelling under load, and a seam running in two processes at once. Those need something built.

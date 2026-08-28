---
form: probe-assumptions
by: agent
signed_off: 2026-08-21T09:15:33.830Z
authors: agent
files: null
---

# Evidence form / probe-assumptions

## current_situation

The register holds 92 assumption nodes. Seven carried an empty probed field and six of those were open.

Those six were probed against the real channel, not against a document. Four hold, two are false and are now issues.

The other 85 carry a probed date from an earlier iteration and were not re-run here. That is stated in the outcomes rather than left implied.

## probes

- raid-asm-work-under-way-records-progress-before-it-ends: HOLDS, and more strongly than the entry claimed. A run was started and its record read while it was still going. `.se/test-progress.jsonl` is appended live — 15 seconds in it already held 313 lines with a two-second-old modification time. The denominator is in the first line: `files_total: 175`. Each later line carries its own elapsed clock. THE ARITHMETIC WAS RUN LIVE: at 26,062 ms elapsed, 49 of 175 files had reported, implying 93,079 ms total and 67,017 ms remaining. A working time remaining, computed from data that already exists.
- raid-asm-a-first-run-has-timings-to-estimate-from: FALSE, and the kind is now ISSUE because it has already happened on this run. `.se/test-timings.jsonl` and `.se/test-last-run.json` were both absent on this container, reported ENOENT. The product said so honestly when asked — "No earlier battery is on record to size the wait" — which is already the house behaviour rather than something to build. THE DEMAND SURVIVES AND THE BASIS CHANGED: history is not needed, because a run reports its own progress.
- raid-asm-the-callers-limit-is-longer-than-a-second: HOLDS on the one harness measured, and it needed no deliberate delay. This session's own log carries 290 calls with a duration; p99 is 1712 ms and the maximum is 2275 ms, all received. STAYS OPEN for the other harnesses, because one observation does not settle a statement about every harness.
- raid-asm-starting-a-judgment-is-far-cheaper-than-answering: HOLDS with two orders of magnitude of margin. The existing handoff was used as the stand-in because it does exactly what the deferred verdict will do. Call `call-6321f0fbd388` started a 175-file run and returned in 7 ms against a 1000 ms measure, and a later status read cost 1 ms. NOT SETTLED FOR A LOADED OR SMALL MACHINE, which was the entry's actual concern; the margin is wide enough to downgrade it rather than close it.
- raid-asm-a-check-left-running-survives-on-every-platform: PARTLY PROBED, and it stays open. The POSIX branch is no longer unexercised — this run is on Linux, and handed-off work survived its call for ninety seconds with its verdict readable afterwards. TWO REASONS IT IS NOT DISCHARGED: a test job and a state's leaving check are started by different code, and the leaving check has never run detached at all; and one platform is not every platform.
- raid-asm-one-second-resolution-is-enough-to-time-a-lane-call: FALSE for the median, TRUE for the tail, and the kind is now ISSUE. This entry is i37's and its probe was written and never run; it asked for a count of resolutions per lane call, so that count was run. Over 290 calls: median 1 ms, p90 580 ms, p99 1712 ms, maximum 2275 ms, with 271 under a second. THE MEDIAN IS A THOUSANDTH OF THE CONVENTION'S UNIT, so a one-second bound cannot express a demand about a typical call. THE TAIL WAS NOT PREDICTED: 19 of 290 exceeded the second, 6.6 percent, so the bound is breached routinely rather than being an unbreachable ceiling.
- the other 85 standing assumptions: NOT RE-PROBED HERE, and the reason is that each carries a probed date from the iteration that wrote it. The method says a probe result decays and that nothing enforces a re-probe interval today. Re-running 85 probes is not minutes of work, so it is named as skipped rather than claimed.

## follow_up

The requirements gate comes next, and it now has two probed facts it would otherwise have had to take on trust.

The lint and test debt carried from three gates is DISCHARGED. The battery ran green while these probes were being written: 1716 tests pass and 0 fail across 153 suites, lint checked 350 files with no fixes applied, preflight green, and the corpus sweep green over 2429 nodes.

One thing goes to the design rather than the gate. The status verb already returns `progress: {cases_done, files_touched, files_total}` beside `elapsed_ms`. The numerator, the denominator and the clock are all on the answer already, and what is missing is the division. That is a smaller build than the packet assumed.

## anything_else

THE BEST PROBE COST ONE CALL AND OVERTURNED THE DESIGN'S HARDEST QUESTION.

The packet asked three times, across three signed forms, what a time remaining rests on when a machine has no history. The answer everybody expected was "nothing, so say so".

THE REAL ANSWER IS THAT HISTORY WAS NEVER THE RIGHT BASIS. A run reports its own progress, live, with the denominator in the first line it writes. The container this ran on had no history at all and a working estimate was computed from it anyway.

WHAT MADE THAT FINDABLE was the method's own rule: check the real channel, not the datasheet. The description of the timing record said "recorded per run", which reads as "written when the run ends". Reading the folder found a different file nobody had named.

AND THE PRODUCT WAS ALREADY HONEST WHERE IT COULD NOT ESTIMATE. "No earlier battery is on record to size the wait" is the exact behaviour `req-a-time-remaining-names-its-basis` demands, shipped before the row was written.

## fallout

- raid-asm-a-first-run-has-timings-to-estimate-from: the iteration's rough vision rests on it. Its words are that a battery knows its case count from the previous run, so the estimate is arithmetic rather than a guess. THE CLAUSE "FROM THE PREVIOUS RUN" IS NOW KNOWN FALSE. What replaces it is better: the run's own live progress record, which needs no history and was measured working. The signed vision packet does not carry the false clause — its wording is "what the job has already done measured against what it has left" — so nothing signed rests on it.
- req-a-time-remaining-names-its-basis: names this entry in its source_refs and does NOT rest on it. The row demands a basis and honesty where none exists; it never named history as the basis. It now has a probed basis instead of an assumed one, which strengthens it.
- raid-asm-one-second-resolution-is-enough-to-time-a-lane-call: two interfaces rest on it, `if-benchmark-binding-to-guard` and its sibling. Both carry a one-second bound. They are now known to be documenting a demand about the slow tail while saying nothing about the body of the distribution. NOT FIXED HERE, because they belong to the benchmark's cone rather than this change's, and the entry now carries the numbers whoever takes that work will need.
- the benchmark's cost ranking rests on it too. Ranking states by a one-second bound orders them by rounding. Ranking them by the recorded `duration_ms` does not, because the call log has always been millisecond-resolution. The fix is to stop reading the interface convention as the benchmark's clock, and that is written into the entry.

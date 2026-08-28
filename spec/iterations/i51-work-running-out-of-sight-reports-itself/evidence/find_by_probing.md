---
form: find_by_probing
by: agent
signed_off: 2026-08-21T09:35:19.475Z
authors: agent
files: null
---

# Evidence form / find_by_probing

## current_situation

The last of the seven finders. Six are signed.

This one runs rather than reasons, and both its probes used the real channel: a recorded run of this session's own battery, and a live background job started and left running.

One option came out of it, measured rather than argued. Two dead ends came out with it, and both are worth as much.

## applies

yes

## probes

| question | timebox | what_was_faked | verdict |
| --- | --- | --- | --- |
| does a linear estimate from the work's own unit count track the real remaining time, or is it wrong enough to be useless | one script | nothing; this session's own recorded run of 175 test files was replayed | IT WORKS AND IT ERRS SAFE. Over-predicts at every point measured: 1.44 at a tenth through, 1.11 at halfway, 1.01 at three quarters. The pre-agreed fallback was a factor of two at halfway, and it was not triggered |
| does work handed off survive its call on this platform, and is its output readable afterwards | one job, twelve seconds | nothing; a real background job was started through the lane | IT SURVIVES. The starting call returned in 5 ms, and a later listing showed the job at 7,740 ms elapsed with seven ticks of output readable |
| does the existing listing already hold every kind of work out of sight | the same listing call | nothing | IT DOES NOT. The listing returned seven shell jobs and zero test jobs, with the test job from the same session absent. The two-table split, demonstrated live rather than argued |

## options

- [[opt-the-estimate-is-linear-on-the-work-s-own-count]]

## dead_ends

- ESTIMATING A PLAIN SHELL COMMAND IS NOT POSSIBLE, and this is the answer to a question the packet has carried through six states. The listing shows every shell job with `running` and `duration_ms` and nothing else. There is no denominator, because a shell command does not say how many things it will do. WHAT KILLED IT: direct observation, not reasoning. The honest answer for those entries is that no estimate can be given, which is `req-a-time-remaining-names-its-basis` working rather than a gap in it.
- THE EXISTING LISTING IS NOT A HEAD START. It already carries `running`, elapsed, the command and partial output per job, which looks like most of the report. It holds one kind of work by construction, so extending it is not the cheap path it appears to be. WHAT KILLED IT: the test job was missing from a listing taken in the same session that started it.
- A PROBE OF THE DEFERRED EXIT WAS NOT ATTEMPTED, and that is a limit rather than a finding. Making the leaving check hand back needs a real change to the walking core, which is build work rather than a throwaway. It belongs to M6 as a seeded spike, and `raid-asm-a-check-left-running-survives-on-every-platform` is the entry that carries it.

## follow_up

The chart is built next, and all seven finders have now fed it.

One probe result belongs in the register rather than only here. Handed-off work survived its call on this platform, which is the nearest evidence there is for `raid-asm-a-check-left-running-survives-on-every-platform`. That entry already records this probe and stays open, because a test job and a leaving check are started by different code.

One question is now closed that was open in three signed forms. A plain shell command cannot be estimated, and the reason is that it has nothing to count.

## anything_else

THE PROBE CHANGED A DECISION RATHER THAN CONFIRMING ONE, which is the only reason it was worth running.

BEFORE IT, the estimate was the expensive half of this iteration. It carried two register entries, rested on an instrument recorded as wrong by a factor of twenty, and the trimming finder had just minted the option of dropping it entirely.

AFTER IT, the estimate is a division over numbers the product already writes down, with a measured error that errs safe and converges to one percent.

WHAT MADE THE DIFFERENCE was noticing that the instrument everybody distrusted was the wrong instrument. `raid-asm-battery-timings-measure-work` is about summed CASE durations, which include waiting. The progress record counts FILES against a wall clock, and the two are different measurements of different things.

NOBODY REASONED THEIR WAY TO THAT. It came from reading a file that turned out to exist.

THE THROWAWAY LAW HELD. Nothing built here survives. What survives is three rows of measurement and two dead ends.

# quackitect bench: results

**Interim, 2026-10-11 04:40 UTC: Haiku 5.5, the first 10 tasks × 3 arms, hidden tests graded.**
More Haiku tasks and a Sonnet 5.5 sample are running; the full checks (`./RUNME.sh check` on
every resolved tree) wait for an idle machine. This file is replaced when they land.

## Verdict so far

On ten of the owner's own closed tickets (the ten the screen rated best specified; §4 of
DESIGN.md), with Haiku 5.5 in every arm and nobody answering:

| | plain | plain + stop rule | v5 |
|---|---|---|---|
| hidden tests pass | 8/10 | **10/10** | 6/10 |
| mean cost per task | $0.027 | **$0.021** | $0.488 |
| mean wall-clock | 13.6 min | **9.8 min** | 26.7 min |
| mean turns | 25 | 21 | 110 |
| ended needing the owner (asked, stuck, at the cap, or the harness down) | 0/10 | 0/10 | 8/10 |

- **v5 does not make Haiku better at the work here.** v5 resolved 2 fewer tasks than plain
  (−20 points, 95% bootstrap CI −60 to +20; exact sign-flip p = 0.63) and 4 fewer than plain with
  the stopping rule (all four discordant tasks went to plain+stop; exact p = 0.125). Ten paired
  tasks can only detect a difference of about ±50 points (§Power), so "not better" here means
  "not better by a large margin"; a small benefit is not ruled out by this sample.
- **v5 costs 15× plain** (geometric mean of per-task ratios, 95% CI 8.3× to 27×, p = 0.002) and
  **19× plain+stop**, and takes 1.8× and 2.6× the wall-clock. That is far beyond the 2–4× the clean
  rooms measured for their own harnesses.
- **v5 ends needing the owner in 8 of 10 sessions**, the plain arms in none. Two hit the 45-minute
  cap, one met level zero's door stuck at "starting" and stopped, five ended on
  `stop: the-owner-holds-the-step` (two of those after resolving the task). Two v5 runs carried
  the group to done and stopped only at the pull request, which this sandbox cannot open; those
  two are not counted as needing the owner.
- **The stopping rule, not the harness, is what helps.** plain+stop resolved every task, at the
  lowest cost and time. This repeats team B's finding on real tickets.

## What the harness did, per v5 session (mean of 10)

| | value |
|---|---|
| assistant turns | 110 (plain 25) |
| stop-hook blocks (the turn held open, a stop reason demanded) | 18.4 |
| door refusals (a write or a command refused by level zero) | 7.4 |
| commits | 8.4 (plain 1.0) |
| ticket files written | 1.7 |
| model calls the harness made outside the session (the commit door's cold probe, on Sonnet) | 3 in 10 sessions, $0.045 a session on average |
| task's own ticket closed by the end | 6/10 |
| group carried to done (`retro/cloud` passed) | 4/10 |

Where the extra cost goes, read off the transcripts: every write and command must name a ticket
(refused otherwise); the plan tool must be answered before reads continue; the commit goes
through `./RUNME.sh commit`, which runs the full check and a cold probe of a fresh clone; the
hand-back of a step demands evidence in a set form (refused when, for example, a test run came
from Go's cache); the stop hook refuses a turn's end until a stop reason from its list fits, and
after the child closes the group's own route (sync, split, children, accept, retro notes, write,
cloud) still waits. The two sessions that hit the cap were re-running the check for `branch done` when it fell; one of
them had closed its ticket long before, and in between the pull had handed it an unrelated open
ticket from the tree.

## Failures, task by task

| task | arm | what failed |
|---|---|---|
| check-errors-names-the-part | v5 | 170/171 hidden tests: under `--errors` a green run must print the no-red line alone, and the v5 change let the parts' own lines through. The agent had named this exact reading as a choice for the owner to confirm, and stopped |
| hand-spawn-skips-session-tag | v5 | did not add `q.HandOfItsOwn`, which the interface note in its ticket names, so the hidden tests do not build; fixed the bug another way; then `branch done` refused a closed group and it stopped for the owner |
| proc-empty-argv-never-starts | v5 | level zero's write door answered "starting" on seven calls; the agent stopped after two minutes with the red test written and the fix not applied |
| tui-swap-fails-loud | plain, v5 | `TestTuiFailedSwapFailsTheVerbAndAsksNotForGo`: the verb's exit code and output differ from the test's; v5 then waited on the owner about the evidence format |
| signalled-meets-notstarted-readers | plain | `TestTheBranchTakeRunsTheRoadOnTheCallersStreams`: the take answers 1 with empty streams |

Every other run passed every FAIL_TO_PASS and PASS_TO_PASS test of its task.

## How to read this

- Paired by task: every arm worked the same ten tasks, from the same base, with the same model,
  tools, permissions and 45-minute cap; v5's ask is the same text inside its ticket.
- One run per task and arm (seed 1). With ten tasks the resolve-rate comparison is weak (§Power);
  the cost and time comparisons are not.
- The ten tasks are the first ten of the frozen set's best-specified tier, in a random order
  fixed before the runs (`tasks.jsonl`).
- Batches before this one are excluded and kept in `results/_excluded/` with the reason
  (contention, a two-core pinning that broke timing-bound tests, git hooks leaking into the plain
  arm). DESIGN.md §6.2 tells that story.

<!-- generated below -->

## Batch `haiku-1`

#### haiku-1, all: Overview (all tasks: 10, runs: 30)

| arm | runs | resolved | check green (of measured) | mean $ | median $ | mean min | median min | mean turns | mean tool calls | files outside scope | needs owner | killed at cap |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| plain | 10 | 8/10 (80%) | 0/0 | 0.027 | 0.025 | 13.6 | 12.0 | 25 | 26 | 0.2 | 0/10 | 0/10 |
| plain+stop | 10 | 10/10 (100%) | 0/0 | 0.021 | 0.021 | 9.8 | 8.4 | 21 | 22 | 0.0 | 0/10 | 0/10 |
| v5 | 10 | 6/10 (60%) | 0/0 | 0.488 | 0.409 | 26.7 | 26.4 | 110 | 95 | 0.4 | 8/10 | 2/10 |

#### What the harness did

| arm | runs | session $ (mean) | harness-side $ (mean) | harness-side calls | stop-hook blocks (mean) | door refusals (mean) | ticket files written (mean) | commits (mean) | subagents (mean) | models seen | ended at cap | ended on an owner stop |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| plain | 10 | 0.027 | 0.000 | 0 | 0.0 | 0.0 | 0.1 | 1.0 | 0.0 | claude-haiku-5-5 | 0 | 0 |
| plain+stop | 10 | 0.021 | 0.000 | 0 | 0.0 | 0.0 | 0.1 | 1.0 | 0.0 | claude-haiku-5-5 | 0 | 0 |
| v5 | 10 | 0.443 | 0.045 | 3 | 18.4 | 7.4 | 1.7 | 8.4 | 0.2 | claude-haiku-5-5 | 2 | 5 |

#### Paired comparisons (B against A, per task; seeds averaged)

| comparison | tasks | resolved (A → B) | B − A, 95% CI | p (sign-flip) | McNemar seed 1 (B only / A only, p) | cost B/A, 95% CI | p | wall-clock B/A, 95% CI | p | turns B/A |
|---|---|---|---|---|---|---|---|---|---|---|
| v5 vs plain | 10 | 80% → 60% | -20 pts [-60, 20] | 0.625 | 1 / 3, p=0.625 | 14.88× [8.30, 27.17] | 0.002 | 1.77× [1.07, 2.80] | 0.059 | 4.41× |
| plain+stop vs plain | 10 | 80% → 100% | 20 pts [0, 50] | 0.500 | 2 / 0, p=0.500 | 0.78× [0.65, 0.93] | 0.033 | 0.69× [0.48, 0.99] | 0.094 | 0.85× |
| v5 vs plain+stop | 10 | 100% → 60% | -40 pts [-70, -10] | 0.125 | 0 / 4, p=0.125 | 19.16× [10.43, 35.68] | 0.002 | 2.56× [1.13, 5.43] | 0.045 | 5.21× |

#### Power at this sample

- v5 vs plain: 10 paired tasks, 40% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±50 pts; smallest cost ratio detectable: 2.47×.
- plain+stop vs plain: 10 paired tasks, 20% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±35 pts; smallest cost ratio detectable: 1.32×.
- v5 vs plain+stop: 10 paired tasks, 40% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±50 pts; smallest cost ratio detectable: 2.55×.

#### Per task

| task | kind | verified | plain: resolved, $, min | plain+stop: resolved, $, min | v5: resolved, $, min |
|---|---|---|---|---|---|
| check-errors-names-the-part | interface | yes | ✓ 0.039 8 | ✓ 0.023 8 | ✗ 0.315 27 |
| example-retro-gaps-shown-name | interface | yes | ✓ 0.020 19 | ✓ 0.011 7 | ✓ 0.196 26 |
| go-pull-desk-remedy-once | behavioral | yes | ✓ 0.025 23 | ✓ 0.032 16 | ✓ 0.386 45 |
| hand-spawn-skips-session-tag | interface | yes | ✓ 0.023 8 | ✓ 0.019 7 | ✗ 0.296 17 |
| index-why-prints-text | behavioral | yes | ✓ 0.009 6 | ✓ 0.006 2 | ✓ 0.857 45 |
| proc-empty-argv-never-starts | behavioral | yes | ✓ 0.011 7 | ✓ 0.010 14 | ✗ 0.025 2 |
| signalled-meets-notstarted-readers | behavioral | yes | ✗ 0.025 16 | ✓ 0.019 9 | ✓ 1.138 20 |
| standing-pull-takes-auto-merge | behavioral | yes | ✓ 0.027 24 | ✓ 0.028 18 | ✓ 0.698 34 |
| tui-swap-fails-loud | interface | yes | ✗ 0.027 7 | ✓ 0.026 10 | ✗ 0.431 18 |
| vale-retries-its-timeout | interface | yes | ✓ 0.068 16 | ✓ 0.031 8 | ✓ 0.537 32 |


#### haiku-1, verified: Overview (verified tasks: 10, runs: 30)

| arm | runs | resolved | check green (of measured) | mean $ | median $ | mean min | median min | mean turns | mean tool calls | files outside scope | needs owner | killed at cap |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| plain | 10 | 8/10 (80%) | 0/0 | 0.027 | 0.025 | 13.6 | 12.0 | 25 | 26 | 0.2 | 0/10 | 0/10 |
| plain+stop | 10 | 10/10 (100%) | 0/0 | 0.021 | 0.021 | 9.8 | 8.4 | 21 | 22 | 0.0 | 0/10 | 0/10 |
| v5 | 10 | 6/10 (60%) | 0/0 | 0.488 | 0.409 | 26.7 | 26.4 | 110 | 95 | 0.4 | 8/10 | 2/10 |

#### What the harness did

| arm | runs | session $ (mean) | harness-side $ (mean) | harness-side calls | stop-hook blocks (mean) | door refusals (mean) | ticket files written (mean) | commits (mean) | subagents (mean) | models seen | ended at cap | ended on an owner stop |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| plain | 10 | 0.027 | 0.000 | 0 | 0.0 | 0.0 | 0.1 | 1.0 | 0.0 | claude-haiku-5-5 | 0 | 0 |
| plain+stop | 10 | 0.021 | 0.000 | 0 | 0.0 | 0.0 | 0.1 | 1.0 | 0.0 | claude-haiku-5-5 | 0 | 0 |
| v5 | 10 | 0.443 | 0.045 | 3 | 18.4 | 7.4 | 1.7 | 8.4 | 0.2 | claude-haiku-5-5 | 2 | 5 |

#### Paired comparisons (B against A, per task; seeds averaged)

| comparison | tasks | resolved (A → B) | B − A, 95% CI | p (sign-flip) | McNemar seed 1 (B only / A only, p) | cost B/A, 95% CI | p | wall-clock B/A, 95% CI | p | turns B/A |
|---|---|---|---|---|---|---|---|---|---|---|
| v5 vs plain | 10 | 80% → 60% | -20 pts [-60, 20] | 0.625 | 1 / 3, p=0.625 | 14.88× [8.30, 27.17] | 0.002 | 1.77× [1.07, 2.80] | 0.059 | 4.41× |
| plain+stop vs plain | 10 | 80% → 100% | 20 pts [0, 50] | 0.500 | 2 / 0, p=0.500 | 0.78× [0.65, 0.93] | 0.033 | 0.69× [0.48, 0.99] | 0.094 | 0.85× |
| v5 vs plain+stop | 10 | 100% → 60% | -40 pts [-70, -10] | 0.125 | 0 / 4, p=0.125 | 19.16× [10.43, 35.68] | 0.002 | 2.56× [1.13, 5.43] | 0.045 | 5.21× |

#### Power at this sample

- v5 vs plain: 10 paired tasks, 40% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±50 pts; smallest cost ratio detectable: 2.47×.
- plain+stop vs plain: 10 paired tasks, 20% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±35 pts; smallest cost ratio detectable: 1.32×.
- v5 vs plain+stop: 10 paired tasks, 40% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±50 pts; smallest cost ratio detectable: 2.55×.

#### Per task

| task | kind | verified | plain: resolved, $, min | plain+stop: resolved, $, min | v5: resolved, $, min |
|---|---|---|---|---|---|
| check-errors-names-the-part | interface | yes | ✓ 0.039 8 | ✓ 0.023 8 | ✗ 0.315 27 |
| example-retro-gaps-shown-name | interface | yes | ✓ 0.020 19 | ✓ 0.011 7 | ✓ 0.196 26 |
| go-pull-desk-remedy-once | behavioral | yes | ✓ 0.025 23 | ✓ 0.032 16 | ✓ 0.386 45 |
| hand-spawn-skips-session-tag | interface | yes | ✓ 0.023 8 | ✓ 0.019 7 | ✗ 0.296 17 |
| index-why-prints-text | behavioral | yes | ✓ 0.009 6 | ✓ 0.006 2 | ✓ 0.857 45 |
| proc-empty-argv-never-starts | behavioral | yes | ✓ 0.011 7 | ✓ 0.010 14 | ✗ 0.025 2 |
| signalled-meets-notstarted-readers | behavioral | yes | ✗ 0.025 16 | ✓ 0.019 9 | ✓ 1.138 20 |
| standing-pull-takes-auto-merge | behavioral | yes | ✓ 0.027 24 | ✓ 0.028 18 | ✓ 0.698 34 |
| tui-swap-fails-loud | interface | yes | ✗ 0.027 7 | ✓ 0.026 10 | ✗ 0.431 18 |
| vale-retries-its-timeout | interface | yes | ✓ 0.068 16 | ✓ 0.031 8 | ✓ 0.537 32 |


#### haiku-1, behavioral: Overview (behavioral tasks: 5, runs: 15)

| arm | runs | resolved | check green (of measured) | mean $ | median $ | mean min | median min | mean turns | mean tool calls | files outside scope | needs owner | killed at cap |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| plain | 5 | 4/5 (80%) | 0/0 | 0.019 | 0.025 | 15.3 | 15.7 | 19 | 19 | 0.0 | 0/5 | 0/5 |
| plain+stop | 5 | 5/5 (100%) | 0/0 | 0.019 | 0.019 | 11.7 | 14.0 | 22 | 23 | 0.0 | 0/5 | 0/5 |
| v5 | 5 | 4/5 (80%) | 0/0 | 0.621 | 0.698 | 29.3 | 34.0 | 124 | 105 | 0.6 | 4/5 | 2/5 |

#### What the harness did

| arm | runs | session $ (mean) | harness-side $ (mean) | harness-side calls | stop-hook blocks (mean) | door refusals (mean) | ticket files written (mean) | commits (mean) | subagents (mean) | models seen | ended at cap | ended on an owner stop |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| plain | 5 | 0.019 | 0.000 | 0 | 0.0 | 0.0 | 0.0 | 1.0 | 0.0 | claude-haiku-5-5 | 0 | 0 |
| plain+stop | 5 | 0.019 | 0.000 | 0 | 0.0 | 0.0 | 0.0 | 1.0 | 0.0 | claude-haiku-5-5 | 0 | 0 |
| v5 | 5 | 0.593 | 0.028 | 1 | 23.4 | 7.2 | 1.6 | 6.8 | 0.0 | claude-haiku-5-5 | 2 | 1 |

#### Paired comparisons (B against A, per task; seeds averaged)

| comparison | tasks | resolved (A → B) | B − A, 95% CI | p (sign-flip) | McNemar seed 1 (B only / A only, p) | cost B/A, 95% CI | p | wall-clock B/A, 95% CI | p | turns B/A |
|---|---|---|---|---|---|---|---|---|---|---|
| v5 vs plain | 5 | 80% → 80% | 0 pts [-60, 60] | 1.000 | 1 / 1, p=1.000 | 20.87× [6.84, 56.79] | 0.062 | 1.47× [0.56, 3.70] | 0.562 | 5.66× |
| plain+stop vs plain | 5 | 80% → 100% | 20 pts [0, 60] | 1.000 | 1 / 0, p=1.000 | 0.91× [0.75, 1.10] | 0.375 | 0.67× [0.37, 1.25] | 0.375 | 1.05× |
| v5 vs plain+stop | 5 | 100% → 80% | -20 pts [-60, 0] | 1.000 | 0 / 1, p=1.000 | 22.91× [6.38, 73.14] | 0.062 | 2.19× [0.43, 10.72] | 0.500 | 5.38× |

#### Power at this sample

- v5 vs plain: 5 paired tasks, 40% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±61 pts; smallest cost ratio detectable: 5.79×.
- plain+stop vs plain: 5 paired tasks, 20% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±43 pts; smallest cost ratio detectable: 1.36×.
- v5 vs plain+stop: 5 paired tasks, 20% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±43 pts; smallest cost ratio detectable: 7.03×.

#### Per task

| task | kind | verified | plain: resolved, $, min | plain+stop: resolved, $, min | v5: resolved, $, min |
|---|---|---|---|---|---|
| go-pull-desk-remedy-once | behavioral | yes | ✓ 0.025 23 | ✓ 0.032 16 | ✓ 0.386 45 |
| index-why-prints-text | behavioral | yes | ✓ 0.009 6 | ✓ 0.006 2 | ✓ 0.857 45 |
| proc-empty-argv-never-starts | behavioral | yes | ✓ 0.011 7 | ✓ 0.010 14 | ✗ 0.025 2 |
| signalled-meets-notstarted-readers | behavioral | yes | ✗ 0.025 16 | ✓ 0.019 9 | ✓ 1.138 20 |
| standing-pull-takes-auto-merge | behavioral | yes | ✓ 0.027 24 | ✓ 0.028 18 | ✓ 0.698 34 |


#### haiku-1, interface: Overview (interface tasks: 5, runs: 15)

| arm | runs | resolved | check green (of measured) | mean $ | median $ | mean min | median min | mean turns | mean tool calls | files outside scope | needs owner | killed at cap |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| plain | 5 | 4/5 (80%) | 0/0 | 0.035 | 0.027 | 11.9 | 8.3 | 30 | 32 | 0.4 | 0/5 | 0/5 |
| plain+stop | 5 | 5/5 (100%) | 0/0 | 0.022 | 0.023 | 7.9 | 7.7 | 20 | 21 | 0.0 | 0/5 | 0/5 |
| v5 | 5 | 2/5 (40%) | 0/0 | 0.355 | 0.315 | 24.0 | 26.2 | 96 | 84 | 0.2 | 4/5 | 0/5 |

#### What the harness did

| arm | runs | session $ (mean) | harness-side $ (mean) | harness-side calls | stop-hook blocks (mean) | door refusals (mean) | ticket files written (mean) | commits (mean) | subagents (mean) | models seen | ended at cap | ended on an owner stop |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| plain | 5 | 0.035 | 0.000 | 0 | 0.0 | 0.0 | 0.2 | 1.0 | 0.0 | claude-haiku-5-5 | 0 | 0 |
| plain+stop | 5 | 0.022 | 0.000 | 0 | 0.0 | 0.0 | 0.2 | 1.0 | 0.0 | claude-haiku-5-5 | 0 | 0 |
| v5 | 5 | 0.292 | 0.063 | 2 | 13.4 | 7.6 | 1.8 | 10.0 | 0.4 | claude-haiku-5-5 | 0 | 4 |

#### Paired comparisons (B against A, per task; seeds averaged)

| comparison | tasks | resolved (A → B) | B − A, 95% CI | p (sign-flip) | McNemar seed 1 (B only / A only, p) | cost B/A, 95% CI | p | wall-clock B/A, 95% CI | p | turns B/A |
|---|---|---|---|---|---|---|---|---|---|---|
| v5 vs plain | 5 | 80% → 40% | -40 pts [-80, 0] | 0.500 | 0 / 2, p=0.500 | 10.61× [8.39, 13.42] | 0.062 | 2.13× [1.65, 2.70] | 0.062 | 3.43× |
| plain+stop vs plain | 5 | 80% → 100% | 20 pts [0, 60] | 1.000 | 1 / 0, p=1.000 | 0.66× [0.53, 0.85] | 0.062 | 0.71× [0.46, 1.06] | 0.312 | 0.68× |
| v5 vs plain+stop | 5 | 100% → 40% | -60 pts [-100, -20] | 0.250 | 0 / 3, p=0.250 | 16.02× [14.86, 17.03] | 0.062 | 2.99× [2.23, 3.84] | 0.062 | 5.05× |

#### Power at this sample

- v5 vs plain: 5 paired tasks, 40% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±61 pts; smallest cost ratio detectable: 1.46×.
- plain+stop vs plain: 5 paired tasks, 20% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±43 pts; smallest cost ratio detectable: 1.46×.
- v5 vs plain+stop: 5 paired tasks, 60% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±75 pts; smallest cost ratio detectable: 1.12×.

#### Per task

| task | kind | verified | plain: resolved, $, min | plain+stop: resolved, $, min | v5: resolved, $, min |
|---|---|---|---|---|---|
| check-errors-names-the-part | interface | yes | ✓ 0.039 8 | ✓ 0.023 8 | ✗ 0.315 27 |
| example-retro-gaps-shown-name | interface | yes | ✓ 0.020 19 | ✓ 0.011 7 | ✓ 0.196 26 |
| hand-spawn-skips-session-tag | interface | yes | ✓ 0.023 8 | ✓ 0.019 7 | ✗ 0.296 17 |
| tui-swap-fails-loud | interface | yes | ✗ 0.027 7 | ✓ 0.026 10 | ✗ 0.431 18 |
| vale-retries-its-timeout | interface | yes | ✓ 0.068 16 | ✓ 0.031 8 | ✓ 0.537 32 |


#### haiku-1: every run

| task | arm | resolved | hidden F2P | ended | cost $ (nested) | min | turns | note |
|---|---|---|---|---|---|---|---|---|
| check-errors-names-the-part | plain+stop | yes | 171/171 | success | 0.023 (0.000) | 8 | 21 |  |
| check-errors-names-the-part | plain | yes | 171/171 | success | 0.039 (0.000) | 8 | 29 |  |
| check-errors-names-the-part | v5 | no | 170/171 | the-owner-holds-the-step | 0.315 (0.000) | 27 | 99 | TestCheckVerb:  |
| example-retro-gaps-shown-name | plain+stop | yes | 50/50 | success | 0.011 (0.000) | 7 | 10 |  |
| example-retro-gaps-shown-name | plain | yes | 50/50 | success | 0.020 (0.000) | 19 | 26 |  |
| example-retro-gaps-shown-name | v5 | yes | 50/50 | the-work-stands-complete | 0.196 (0.000) | 26 | 112 |  |
| go-pull-desk-remedy-once | plain+stop | yes | 1/1 | success | 0.032 (0.000) | 16 | 37 |  |
| go-pull-desk-remedy-once | plain | yes | 1/1 | success | 0.025 (0.000) | 23 | 28 |  |
| go-pull-desk-remedy-once | v5 | yes | 1/1 | cap | 0.386 (0.000) | 45 | 89 |  |
| hand-spawn-skips-session-tag | plain+stop | yes | 257/257 | success | 0.019 (0.000) | 7 | 19 |  |
| hand-spawn-skips-session-tag | plain | yes | 257/257 | success | 0.023 (0.000) | 8 | 21 |  |
| hand-spawn-skips-session-tag | v5 | no | 0/257 | the-owner-holds-the-step | 0.296 (0.162) | 17 | 81 | quackitect/src/modules/hooks.test:  |
| index-why-prints-text | plain+stop | yes | 1/1 | success | 0.006 (0.000) | 2 | 8 |  |
| index-why-prints-text | plain | yes | 1/1 | success | 0.009 (0.000) | 6 | 11 |  |
| index-why-prints-text | v5 | yes | 1/1 | cap | 0.857 (0.140) | 45 | 149 |  |
| proc-empty-argv-never-starts | plain+stop | yes | 4/4 | success | 0.010 (0.000) | 14 | 17 |  |
| proc-empty-argv-never-starts | plain | yes | 4/4 | success | 0.011 (0.000) | 7 | 15 |  |
| proc-empty-argv-never-starts | v5 | no | 1/4 | success | 0.025 (0.000) | 2 | 33 | no code change |
| signalled-meets-notstarted-readers | plain+stop | yes | 2/2 | success | 0.019 (0.000) | 9 | 17 |  |
| signalled-meets-notstarted-readers | plain | no | 0/2 | success | 0.025 (0.000) | 16 | 20 | TestARoadVerbAnswersItsStreamsAsOneText: spawns_runner_test.go:60: the road answers 1, "roadVerbOver runs no road yet", and wants 3 and both streams as one text |
| signalled-meets-notstarted-readers | v5 | yes | 2/2 | the-owner-holds-the-step | 1.138 (0.000) | 20 | 217 |  |
| standing-pull-takes-auto-merge | plain+stop | yes | 1/1 | success | 0.028 (0.000) | 18 | 32 |  |
| standing-pull-takes-auto-merge | plain | yes | 1/1 | success | 0.027 (0.000) | 24 | 23 |  |
| standing-pull-takes-auto-merge | v5 | yes | 1/1 | the-work-stands-complete | 0.698 (0.000) | 34 | 130 |  |
| tui-swap-fails-loud | plain+stop | yes | 440/440 | success | 0.026 (0.000) | 10 | 20 |  |
| tui-swap-fails-loud | plain | no | 439/440 | success | 0.027 (0.000) | 7 | 19 | TestTuiFailedSwapFailsTheVerbAndAsksNotForGo: tui_verb_test.go:315: code 1 out ".se/.log/session.jsonl\n03:04:05.678 warn  note   hello\n             1=1.5 2=two detail=d list=1,,2,3 obj=[object Object] n=null b=true big |
| tui-swap-fails-loud | v5 | no | 439/440 | the-owner-holds-the-step | 0.431 (0.152) | 18 | 81 | TestTuiFailedSwapFailsTheVerbAndAsksNotForGo: tui_verb_test.go:315: code 0 out ".se/.log/session.jsonl\n03:04:05.678 warn  note   hello\n             1=1.5 2=two detail=d list=1,,2,3 obj=[object Object] n=null b=true big |
| vale-retries-its-timeout | plain+stop | yes | 23/23 | success | 0.031 (0.000) | 8 | 30 |  |
| vale-retries-its-timeout | plain | yes | 23/23 | success | 0.068 (0.000) | 16 | 55 |  |
| vale-retries-its-timeout | v5 | yes | 23/23 | the-owner-holds-the-step | 0.537 (0.000) | 32 | 108 |  |

## Cost log

Every model call this benchmark paid for, from `costlog.jsonl` (excluded batches and probes included: the money was spent).

| batch | arm | model | calls | $ total | of which harness-side $ |
|---|---|---|---|---|---|
| haiku-1 | plain | claude-haiku-5-5 | 12 | 0.338 | 0.000 |
| haiku-1 | plain+stop | claude-haiku-5-5 | 12 | 0.251 | 0.000 |
| haiku-1 | v5 | claude-haiku-5-5 | 11 | 6.061 | 0.782 |
| haiku-main | plain+stop | claude-haiku-5-5 | 1 | 0.035 | 0.000 |
| probe1 | plain | claude-haiku-5-5 | 1 | 0.015 | 0.000 |
| probe1 | plain+stop | claude-haiku-5-5 | 1 | 0.017 | 0.000 |
| probe3 | plain | claude-haiku-5-5 | 1 | 0.015 | 0.000 |
| probe3 | plain+stop | claude-haiku-5-5 | 1 | 0.018 | 0.000 |
| probe3 | v5 | claude-haiku-5-5 | 1 | 0.568 | 0.351 |
| verify | judge | claude-opus-5-5 | 61 | 3.061 | 0.000 |
| **all** | | | 102 | **10.38** | 1.132 |


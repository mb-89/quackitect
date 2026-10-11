# quackitect bench: results

Run 2026-10-10/11 on one four-core cloud box, Claude Code 2.1.296 headless. Tasks are the
owner's own closed tickets (DESIGN.md §2–§4); every arm works the same task from the same base
with the same model, tools, permissions and 45-minute cap (§6). The hidden tests are the tests
the original work added, withheld and validated three times on the base and on the true
solution (§3). v5 ran headless as it ships: the level0 plugin with its doors, MCP tools and stop
hook, the session hooks, `AGENTS.md`, the work skill pulling the task as a ticket of a group the
owner's own verbs set up. The one step it could not take here is opening the pull request (no
GitHub in the sandbox); a session that ended there is not counted against it.

## Verdict

**v5 does not make the coding agent better on this work, and it makes it 11 to 16 times more
expensive and 2 to 13 times slower than a plain session. What helps is a stopping rule.**

| Haiku 5.5, 12 tasks × 3 arms | plain | plain + stop rule | v5 |
|---|---|---|---|
| hidden tests pass | 10/12 | **12/12** | 8/12 |
| full check green, of the runs that passed | 10/10 | 12/12 | 8/8 |
| mean cost per task | $0.027 | **$0.020** | $0.501 |
| mean session tokens, output / cache read | 14k / 1.1M | 11k / 0.67M | 47k / 9.0M |
| mean wall-clock | 13.1 min | **10.1 min** | 29.7 min |
| mean turns / tool calls | 25 / 26 | 20 / 21 | 103 / 91 |
| ended needing the owner | 0/12 | 0/12 | 10/12 |
| hit the 45-minute cap | 0/12 | 0/12 | 4/12 |
| changed files outside the true change's directories | 2/12 | 0/12 | 2/12 |

| Sonnet 5.5, 5 tasks × 3 arms | plain | plain + stop rule | v5 |
|---|---|---|---|
| hidden tests pass | 2/5 | **3/5** | **3/5** |
| full check green, of the runs that passed | 2/2 | 3/3 | 3/3 |
| mean cost per task | $0.115 | **$0.107** | $1.264 |
| mean session tokens, output / cache read | 2.9k / 0.13M | 2.6k / 0.11M | 22k / 4.5M |
| mean wall-clock | 3.5 min | **2.1 min** | 34.8 min |
| mean turns / tool calls | 8 / 8 | 7 / 7 | 81 / 79 |
| ended needing the owner | 0/5 | 0/5 | 2/5 |
| hit the 45-minute cap | 0/5 | 0/5 | 2/5 |
| changed files outside the true change's directories | 0/5 | 0/5 | 2/5 |

The Sonnet tasks are the first five of the Haiku twelve.

1. **Quality: no gain from v5.** With Haiku, v5 resolved 2 fewer tasks than plain (−17 points,
   95% bootstrap CI −50 to +17; exact sign-flip p = 0.63) and 4 fewer than plain with the stopping
   rule (all four discordant tasks went to plain+stop; exact p = 0.125). With Sonnet, v5 resolved
   one more than plain (3/5 against 2/5; +20 points, CI −40 to +80, p = 1.0) and exactly the three
   plain+stop resolved. Every resolved tree, in every arm, also passes the repository's full check
   (below), so the check changes none of this.
2. **Cost and time: v5 costs about 16× plain with Haiku** (geometric mean of per-task ratios, 95%
   CI 9.4× to 26×, p < 0.001) **and 21× plain+stop; with Sonnet 11× plain** (CI 7.0× to 18.6×)
   **and 12× plain+stop**. It takes 2.1× and 2.8× the wall-clock with Haiku (p = 0.015 and 0.014),
   and 13× and 21× with Sonnet, whose plain sessions finish in two to four minutes. Every Sonnet
   ratio points the same way on all five tasks (p = 0.06, the smallest an exact two-sided test
   reaches on five). These are far past the 2–4× the clean rooms measured for their own harnesses.
3. **The owner: v5 needs the owner in 10 of 12 Haiku sessions; plain needs it in none.** Four hit
   the cap, five ended on `stop: the-owner-holds-the-step`, one met level zero's door stuck at
   "starting" and stopped. Two carried the group to done and stopped only at the pull request,
   which this sandbox cannot open; those two are not counted. With Sonnet the route goes through:
   every v5 session closed the task's ticket and four of five carried the group to done; the two
   counted hit the cap at the route's very end (one opening the pull request, one handing back a
   ticket it had pulled from the backlog, point 6).
4. **The stopping rule is what helps.** plain+stop resolved every Haiku task, at the lowest cost
   and time, which repeats team B's finding on the owner's real tickets. With Sonnet it resolved
   the same three tasks as v5 at about a twelfth of the cost and a twentieth of the time.
5. **How sure.** Twelve paired Haiku tasks detect a resolve-rate difference of about ±42 points
   at 80% power (the discordance observed was 33%); five Sonnet tasks detect only ±75. So the
   quality result reads "v5 is not better by a large margin"; a small benefit or a small harm is
   not ruled out. The cost and time results are far outside their uncertainty.
6. **With Sonnet, v5 also works tickets nobody asked for.** Once the group's child closed, every
   Sonnet session went on to another ticket: four took one the pull handed out from the
   repository's backlog (an open ticket of another group), one minted a follow-up and worked it.
   Three of those tickets were closed, on the group's work branch, at 11% to 29% of the session's
   cost (17% on average). Whether the pull should hand a box another group's ticket is the
   owner's call; here it is cost and scope the ask did not ask for.

## The full check

`./RUNME.sh check` is the repository's own gate: CI runs it on every pull request, and auto-merge
waits on it. It ran on the final tree of every run that passed its hidden tests, after the
sessions, one at a time on the idle machine, with up to three attempts while red (DESIGN.md §3).

| full check green, of the runs that passed | plain | plain + stop rule | v5 |
|---|---|---|---|
| Haiku | 10/10 | 12/12 | 8/8 |
| Sonnet | 2/2 | 3/3 | 3/3 |

**Every tree that passed its hidden tests also passes the full check, in every arm.** So
"resolved and check green" equals "resolved", and the check does not separate v5 from the plain
arms on this work: v5's commit door holds each of its commits to a green check, and the plain
arms' trees came out green without that door.

Two trees needed a second attempt. Haiku's plain and plain+stop trees of
example-retro-gaps-shown-name were first checked beside a live Sonnet session (load average above
20) and went red on Vale's two-second rule bound (`VoiceParagraph.Vocabulary: did not finish
within 2s`) and, for plain+stop, on a git wait bound (`exec: WaitDelay expired`); on the idle
machine both were green. That load flake is the repository's own: the base of
vale-retries-its-timeout, the ticket that fixes it, checks red on `rules` for the same reason (the
one base of the twelve that is not green), and every arm's tree of that task checks green. It is
also the red that v5 sessions met mid-session and chased, since v5's door wants the check green
before a commit (the index-why session under "What v5 does with the time and money").

Two machine faults were taken out of the record and the checks run again: the cached base check of
go-pull-desk-remedy-once met the Go build cache being emptied under it, and when the box restarted
mid-pass, the checks still running failed at the Vale download because the session's proxy had
moved. Neither touched an agent's tree (DESIGN.md §3).

## What v5 does with the time and money

Per session, mean (the other two arms behave like plain):

| per session (mean) | Haiku v5 (12) | Haiku plain (12) | Sonnet v5 (5) | Sonnet plain (5) |
|---|---|---|---|---|
| tool calls | 90.7 | 25.9 | 79.4 | 8.0 |
| harness verbs and tools | 25.6 | 0.1 | 29.4 | 0.0 |
| check, commit or push | 19.5 | 2.6 | 11.8 | 0.8 |
| reading code | 11.3 | 1.4 | 2.4 | 2.4 |
| editing code | 6.1 | 4.1 | 7.8 | 0.0 |
| running tests | 5.2 | 3.7 | 3.6 | 1.2 |
| stop-hook blocks | 15.5 | 0.0 | 2.2 | 0.0 |
| door refusals | 6.9 | 0.0 | 6.6 | 0.0 |
| commits | 8.0 | 1.0 | 13.4 | 1.0 |
| harness-side model calls | 8 in 5 of 12 sessions, $0.10 a session | none | 9 in 5 of 5 sessions, $0.26 a session | none |
| task's ticket closed | 6/12 | – | 5/5 | – |
| group carried to done | 4/12 | – | 4/5 | – |
| another ticket worked (from the backlog / minted) | 0/12 (0 / 0), 0% of the cost | – | 5/5 (4 / 1), 17% of the cost | – |

"Harness verbs and tools" are `ticket pull`, `branch take/done`, the plan tool, mint, guidance and
the level0 MCP tools; `check, commit or push` each run the repository's full check (`commit` also
runs a cold probe of a fresh clone); level0's `patch` tool counts as an edit (Sonnet's plain
sessions edited through the shell, so their edits sit under neither). Stop-hook blocks are turns
the stop hook held open until a stop reason from its list fit; door refusals are writes or
commands level zero refused. The harness-side calls are the commit door's cold probe, on the
client's default model (Sonnet), priced into v5's cost.

Read off the transcripts, the extra work is the route, not the change. Every write and command
must name its ticket; the plan tool must be answered before reads go on; the commit goes through
`./RUNME.sh commit`, which runs the full check and the cold probe; the hand-back of a step wants
its evidence in a set form; the stop hook refuses a turn's end until a stop reason from its list
fits; and after the child closes, the group's own route (sync, split, children, accept, retro
notes, write, cloud) still waits. When the cap fell, three of the four capped Haiku sessions were
re-running the full check (for a gate, or for `branch done` on a newer commit) and the fourth
was re-sending a step's evidence the engine kept refusing (its `tests` field wanted the word
`green`, and the `go test` line answered `ok`).

The rule that the check be green also pulls v5 out of scope. One Haiku session (index-why) met
the check's Vale rules timing out at their two-second bound under the machine's load, tried to
stop and hand that to the owner, was told by the stop hook that a cloud box decides such
questions itself, and rewrote level zero's own paragraph-rule generator, a generated Vale rule
and its test, to make the rule faster: three harness files for a task about one verb's output.
No door holds the plain arms to a green check, so a red they did not cause costs them nothing.

With Sonnet the route completes, and then it grows (`growth.py`; each call is put on the ticket
it names, as level zero makes every call name one):

| model | task | other tickets worked | share of the session's cost | minutes | turns |
|---|---|---|---|---|---|
| Sonnet | check-errors-names-the-part | `check-reads-the-road-root` (backlog, closed) | 11% | 5 of 21 | 7 of 62 |
| Sonnet | hand-spawn-skips-session-tag | `hand-line-stands-twice` (minted in the session) | 13% | 3 of 20 | 9 of 95 |
| Sonnet | index-why-prints-text | `lint-row-keeps-floor` (backlog, closed) | 29% | 8 of 41 | 28 of 96 |
| Sonnet | signalled-meets-notstarted-readers | `quack-spawns-all-take-the-runner` (backlog), `spawn-stubs-match-the-draft` (backlog) | 16% | 3 of 42 | 9 of 78 |
| Sonnet | tui-swap-fails-loud | `vehicle-test-comment-current` (backlog, closed) | 17% | 14 of 45 | 14 of 76 |

## Failures, task by task

| model | task | arm | what failed |
|---|---|---|---|
| Haiku | check-errors-names-the-part | v5 | 170/171: under `--errors` a green run must print the no-red line alone, and the change let the parts' own lines through. The agent had named exactly this reading as a choice for the owner to confirm, and stopped |
| Haiku | hand-spawn-skips-session-tag | v5 | did not add `q.HandOfItsOwn`, which the interface note in its ticket names, so the hidden tests do not build; fixed the bug another way; then `branch done` refused a closed group and it stopped for the owner |
| Haiku | proc-empty-argv-never-starts | v5 | level zero's write door answered "starting" on seven calls; the agent stopped after two minutes with the red test written and the fix not applied (the one run where the harness itself was down) |
| Haiku | tui-swap-fails-loud | plain, v5 | `TestTuiFailedSwapFailsTheVerbAndAsksNotForGo`: the verb's exit code and output differ from the test's (plain answers 1, v5 0); v5 then waited on the owner about the evidence format |
| Haiku | signalled-meets-notstarted-readers | plain | both FAIL_TO_PASS tests: the shell and the Vale run answer a wrapped error ("shell line ends by a signal: killed") where the tests want the fault itself |
| Sonnet | check-errors-names-the-part | all three | the same subtest as Haiku's v5 run: every Sonnet arm let the parts' own lines through under `--errors`. The screen rated the ask clear (spec 1), but the test reads one point the ask leaves open; Haiku's plain arms happened to meet it |
| Sonnet | hand-spawn-skips-session-tag | plain | wrote `q.HandOfItsOwn` as "You are a hand of your own on this box, named " and joined the name onto it; the hidden test wants the line to end on a word. The interface note names the constant without its value (DESIGN.md §4) |
| Sonnet | signalled-meets-notstarted-readers | plain | both FAIL_TO_PASS tests, as Haiku's plain run: the shell answers no fault for a run a signal ends, and the Vale run a wrapped one ("vale: a signal ended the run: killed") |
| Sonnet | tui-swap-fails-loud | plain+stop | committed the built binary `src/quack/quack` (27 MB) with `git add -A`; the tree's file-size rule (`TestTwinGoldens`, a PASS_TO_PASS test) fails on it. The task's own test passed |
| Sonnet | tui-swap-fails-loud | v5 | `TestTuiFailedSwapFailsTheVerbAndAsksNotForGo`: the verb answers 0 where the test wants it to fail, as Haiku's v5 run; then the session closed the group, worked a backlog ticket and hit the cap opening the pull request |

Every other run passed every FAIL_TO_PASS and PASS_TO_PASS test of its task. No run touched
GitHub or the upstream (`leak_flags` empty in every transcript). The outward reaches were v5's
own last step: six v5 sessions that reached the pull request ran `gh pr create`, `gh pr list` or
`gh auth status` (two Haiku, four Sonnet), in a sandbox with no `gh` and no route to GitHub.

## Threats to validity

- **Small n.** Twelve Haiku tasks, five Sonnet tasks, one run each. The resolve-rate comparison
  is weak; the cost and time comparisons are not.
- **Task shape.** These are tickets one session closed in minutes: small, well-scoped, with tests,
  and the best-specified fifth of the mined set. They are v5's commonest unit of work, but not the
  long, multi-session work its leases, handovers and rescue branches exist for, and nothing here
  injects a crash, a compaction or an owner's answer. v5 may pay where this bench does not look.
- **The machine.** Two sessions shared four cores. v5 is the arm most sensitive to load (its
  index server, its door's Vale runs, the full check on every commit); one v5 run met its server
  stuck at "starting", and capped runs were mid-check. On a dedicated box v5 would be somewhat
  faster; it would not be 16× cheaper. The full checks of §"The full check" ran afterwards, alone
  on the idle machine.
- **Same model in every arm**, including v5's helpers (set to the arm's model; the shipped
  defaults put change and decide helpers on Opus) and excluding v5's cold probe, which runs on
  the client's default model as shipped and is priced into v5's cost.
- **The harness at each task's base** is the one that shipped that day (2026-10-04 to 10-08), not
  today's `main`.
- **The interface notes** of six tasks name a constant without its value (DESIGN.md §4); every arm
  got the same note. One failure above (Sonnet plain, hand-spawn) turns on it.
- **Hidden tests read details the ask leaves open** on at least one task (check-errors); every
  arm meets the same test, so this lowers every arm's pass rate rather than favouring one.

## Spend

All model calls this benchmark paid for, from `costlog.jsonl`: $19.03, of which the measured
batches $6.58 (Haiku) and $7.43 (Sonnet), the Opus task screen $3.06, and the
probes and excluded batches $1.96. Sessions killed before they reported a cost (a handful of
Haiku runs while the setup was being fixed) are not in the log; at Haiku's prices they are a few
cents each. The table is under "Cost log" below.

## Running it again

`python3 bench.py run --name <batch>` runs the frozen 60-task set (or `--only` a subset) in all
three arms, grades it, runs the full checks on the idle machine, and writes
`results/<batch>/REPORT.md`; `python3 bench.py compare --baseline <A> --candidate <B> --arm v5`
pairs one arm across two batches. DESIGN.md §9 says how to measure a change to v5 (new tasks
mined after the change, plain arms as the control).

<!-- generated below -->

## Batch `haiku-1`

#### haiku-1, all: Overview (all tasks: 12, runs: 36)

| arm | runs | resolved | check green (of measured) | resolved and check green | mean $ | median $ | mean tokens out / cache read | mean min | median min | mean turns | mean tool calls | files outside scope | needs owner | killed at cap |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| plain | 12 | 10/12 (83%) | 10/10 | 10/12 | 0.027 | 0.025 | 14.2k / 1.09M | 13.1 | 11.1 | 25 | 26 | 0.2 | 0/12 | 0/12 |
| plain+stop | 12 | 12/12 (100%) | 12/12 | 12/12 | 0.020 | 0.019 | 11.4k / 0.67M | 10.1 | 8.4 | 20 | 21 | 0.0 | 0/12 | 0/12 |
| v5 | 12 | 8/12 (67%) | 8/8 | 8/12 | 0.501 | 0.409 | 47.2k / 9.04M | 29.7 | 29.4 | 103 | 91 | 0.3 | 10/12 | 4/12 |

#### What the harness did

| arm | runs | session $ (mean) | harness-side $ (mean) | harness-side calls | stop-hook blocks (mean) | door refusals (mean) | ticket files written (mean) | commits (mean) | subagents (mean) | models seen | ended at cap | ended on an owner stop |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| plain | 12 | 0.027 | 0.000 | 0 | 0.0 | 0.0 | 0.1 | 1.0 | 0.0 | claude-haiku-5-5 | 0 | 0 |
| plain+stop | 12 | 0.020 | 0.000 | 0 | 0.0 | 0.0 | 0.1 | 1.0 | 0.0 | claude-haiku-5-5 | 0 | 0 |
| v5 | 12 | 0.397 | 0.104 | 8 | 15.5 | 6.9 | 1.7 | 8.0 | 0.2 | claude-haiku-5-5 | 4 | 5 |

#### Paired comparisons (B against A, per task; seeds averaged)

| comparison | tasks | resolved (A → B) | B − A, 95% CI | p (sign-flip) | McNemar seed 1 (B only / A only, p) | resolved and check green (A → B), B − A, 95% CI, p | cost B/A, 95% CI | p | wall-clock B/A, 95% CI | p | turns B/A |
|---|---|---|---|---|---|---|---|---|---|---|---|
| v5 vs plain | 12 | 83% → 67% | -17 pts [-50, 17] | 0.625 | 1 / 3, p=0.625 | 83% → 67%, -17 pts [-50, 17], p=0.625 | 15.77× [9.41, 26.00] | 0.000 | 2.07× [1.27, 3.17] | 0.015 | 3.98× |
| plain+stop vs plain | 12 | 83% → 100% | 17 pts [0, 42] | 0.500 | 2 / 0, p=0.500 | 83% → 100%, 17 pts [0, 42], p=0.500 | 0.75× [0.62, 0.91] | 0.021 | 0.74× [0.51, 1.08] | 0.157 | 0.80× |
| v5 vs plain+stop | 12 | 100% → 67% | -33 pts [-58, -8] | 0.125 | 0 / 4, p=0.125 | 100% → 67%, -33 pts [-58, -8], p=0.125 | 20.97× [11.95, 35.67] | 0.000 | 2.80× [1.37, 5.21] | 0.014 | 4.98× |

#### Power at this sample

- v5 vs plain: 12 paired tasks, 33% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±42 pts; smallest cost ratio detectable: 2.13×.
- plain+stop vs plain: 12 paired tasks, 17% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±30 pts; smallest cost ratio detectable: 1.34×.
- v5 vs plain+stop: 12 paired tasks, 33% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±42 pts; smallest cost ratio detectable: 2.24×.

#### Per task

| task | kind | verified | plain: resolved, $, min | plain+stop: resolved, $, min | v5: resolved, $, min |
|---|---|---|---|---|---|
| check-errors-names-the-part | interface | yes | ✓ 0.039 8 | ✓ 0.023 8 | ✗ 0.315 27 |
| example-retro-gaps-shown-name | interface | yes | ✓ 0.020 19 | ✓ 0.011 7 | ✓ 0.196 26 |
| go-pull-desk-remedy-once | behavioral | yes | ✓ 0.025 23 | ✓ 0.032 16 | ✓ 0.386 45 |
| hand-spawn-skips-session-tag | interface | yes | ✓ 0.023 8 | ✓ 0.019 7 | ✗ 0.296 17 |
| index-why-prints-text | behavioral | yes | ✓ 0.009 6 | ✓ 0.006 2 | ✓ 0.857 45 |
| lint-row-keeps-floor | interface | yes | ✓ 0.044 14 | ✓ 0.017 6 | ✓ 0.890 45 |
| proc-empty-argv-never-starts | behavioral | yes | ✓ 0.011 7 | ✓ 0.010 14 | ✗ 0.025 2 |
| set-refuses-closed-group | behavioral | yes | ✓ 0.011 7 | ✓ 0.012 18 | ✓ 0.244 45 |
| signalled-meets-notstarted-readers | behavioral | yes | ✗ 0.025 16 | ✓ 0.019 9 | ✓ 1.138 20 |
| standing-pull-takes-auto-merge | behavioral | yes | ✓ 0.027 24 | ✓ 0.028 18 | ✓ 0.698 34 |
| tui-swap-fails-loud | interface | yes | ✗ 0.027 7 | ✓ 0.026 10 | ✗ 0.431 18 |
| vale-retries-its-timeout | interface | yes | ✓ 0.068 16 | ✓ 0.031 8 | ✓ 0.537 32 |


#### haiku-1, verified: Overview (verified tasks: 12, runs: 36)

| arm | runs | resolved | check green (of measured) | resolved and check green | mean $ | median $ | mean tokens out / cache read | mean min | median min | mean turns | mean tool calls | files outside scope | needs owner | killed at cap |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| plain | 12 | 10/12 (83%) | 10/10 | 10/12 | 0.027 | 0.025 | 14.2k / 1.09M | 13.1 | 11.1 | 25 | 26 | 0.2 | 0/12 | 0/12 |
| plain+stop | 12 | 12/12 (100%) | 12/12 | 12/12 | 0.020 | 0.019 | 11.4k / 0.67M | 10.1 | 8.4 | 20 | 21 | 0.0 | 0/12 | 0/12 |
| v5 | 12 | 8/12 (67%) | 8/8 | 8/12 | 0.501 | 0.409 | 47.2k / 9.04M | 29.7 | 29.4 | 103 | 91 | 0.3 | 10/12 | 4/12 |

#### What the harness did

| arm | runs | session $ (mean) | harness-side $ (mean) | harness-side calls | stop-hook blocks (mean) | door refusals (mean) | ticket files written (mean) | commits (mean) | subagents (mean) | models seen | ended at cap | ended on an owner stop |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| plain | 12 | 0.027 | 0.000 | 0 | 0.0 | 0.0 | 0.1 | 1.0 | 0.0 | claude-haiku-5-5 | 0 | 0 |
| plain+stop | 12 | 0.020 | 0.000 | 0 | 0.0 | 0.0 | 0.1 | 1.0 | 0.0 | claude-haiku-5-5 | 0 | 0 |
| v5 | 12 | 0.397 | 0.104 | 8 | 15.5 | 6.9 | 1.7 | 8.0 | 0.2 | claude-haiku-5-5 | 4 | 5 |

#### Paired comparisons (B against A, per task; seeds averaged)

| comparison | tasks | resolved (A → B) | B − A, 95% CI | p (sign-flip) | McNemar seed 1 (B only / A only, p) | resolved and check green (A → B), B − A, 95% CI, p | cost B/A, 95% CI | p | wall-clock B/A, 95% CI | p | turns B/A |
|---|---|---|---|---|---|---|---|---|---|---|---|
| v5 vs plain | 12 | 83% → 67% | -17 pts [-50, 17] | 0.625 | 1 / 3, p=0.625 | 83% → 67%, -17 pts [-50, 17], p=0.625 | 15.77× [9.41, 26.00] | 0.000 | 2.07× [1.27, 3.17] | 0.015 | 3.98× |
| plain+stop vs plain | 12 | 83% → 100% | 17 pts [0, 42] | 0.500 | 2 / 0, p=0.500 | 83% → 100%, 17 pts [0, 42], p=0.500 | 0.75× [0.62, 0.91] | 0.021 | 0.74× [0.51, 1.08] | 0.157 | 0.80× |
| v5 vs plain+stop | 12 | 100% → 67% | -33 pts [-58, -8] | 0.125 | 0 / 4, p=0.125 | 100% → 67%, -33 pts [-58, -8], p=0.125 | 20.97× [11.95, 35.67] | 0.000 | 2.80× [1.37, 5.21] | 0.014 | 4.98× |

#### Power at this sample

- v5 vs plain: 12 paired tasks, 33% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±42 pts; smallest cost ratio detectable: 2.13×.
- plain+stop vs plain: 12 paired tasks, 17% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±30 pts; smallest cost ratio detectable: 1.34×.
- v5 vs plain+stop: 12 paired tasks, 33% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±42 pts; smallest cost ratio detectable: 2.24×.

#### Per task

| task | kind | verified | plain: resolved, $, min | plain+stop: resolved, $, min | v5: resolved, $, min |
|---|---|---|---|---|---|
| check-errors-names-the-part | interface | yes | ✓ 0.039 8 | ✓ 0.023 8 | ✗ 0.315 27 |
| example-retro-gaps-shown-name | interface | yes | ✓ 0.020 19 | ✓ 0.011 7 | ✓ 0.196 26 |
| go-pull-desk-remedy-once | behavioral | yes | ✓ 0.025 23 | ✓ 0.032 16 | ✓ 0.386 45 |
| hand-spawn-skips-session-tag | interface | yes | ✓ 0.023 8 | ✓ 0.019 7 | ✗ 0.296 17 |
| index-why-prints-text | behavioral | yes | ✓ 0.009 6 | ✓ 0.006 2 | ✓ 0.857 45 |
| lint-row-keeps-floor | interface | yes | ✓ 0.044 14 | ✓ 0.017 6 | ✓ 0.890 45 |
| proc-empty-argv-never-starts | behavioral | yes | ✓ 0.011 7 | ✓ 0.010 14 | ✗ 0.025 2 |
| set-refuses-closed-group | behavioral | yes | ✓ 0.011 7 | ✓ 0.012 18 | ✓ 0.244 45 |
| signalled-meets-notstarted-readers | behavioral | yes | ✗ 0.025 16 | ✓ 0.019 9 | ✓ 1.138 20 |
| standing-pull-takes-auto-merge | behavioral | yes | ✓ 0.027 24 | ✓ 0.028 18 | ✓ 0.698 34 |
| tui-swap-fails-loud | interface | yes | ✗ 0.027 7 | ✓ 0.026 10 | ✗ 0.431 18 |
| vale-retries-its-timeout | interface | yes | ✓ 0.068 16 | ✓ 0.031 8 | ✓ 0.537 32 |


#### haiku-1, behavioral: Overview (behavioral tasks: 6, runs: 18)

| arm | runs | resolved | check green (of measured) | resolved and check green | mean $ | median $ | mean tokens out / cache read | mean min | median min | mean turns | mean tool calls | files outside scope | needs owner | killed at cap |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| plain | 6 | 5/6 (83%) | 5/5 | 5/6 | 0.018 | 0.018 | 9.6k / 0.62M | 14.0 | 11.4 | 18 | 18 | 0.0 | 0/6 | 0/6 |
| plain+stop | 6 | 6/6 (100%) | 6/6 | 6/6 | 0.018 | 0.015 | 10.2k / 0.65M | 12.7 | 15.3 | 21 | 21 | 0.0 | 0/6 | 0/6 |
| v5 | 6 | 5/6 (83%) | 5/5 | 5/6 | 0.558 | 0.542 | 44.7k / 10.28M | 31.9 | 39.5 | 109 | 94 | 0.5 | 5/6 | 3/6 |

#### What the harness did

| arm | runs | session $ (mean) | harness-side $ (mean) | harness-side calls | stop-hook blocks (mean) | door refusals (mean) | ticket files written (mean) | commits (mean) | subagents (mean) | models seen | ended at cap | ended on an owner stop |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| plain | 6 | 0.018 | 0.000 | 0 | 0.0 | 0.0 | 0.0 | 1.0 | 0.0 | claude-haiku-5-5 | 0 | 0 |
| plain+stop | 6 | 0.018 | 0.000 | 0 | 0.0 | 0.0 | 0.0 | 1.0 | 0.0 | claude-haiku-5-5 | 0 | 0 |
| v5 | 6 | 0.500 | 0.058 | 2 | 19.5 | 6.2 | 1.5 | 6.3 | 0.0 | claude-haiku-5-5 | 3 | 1 |

#### Paired comparisons (B against A, per task; seeds averaged)

| comparison | tasks | resolved (A → B) | B − A, 95% CI | p (sign-flip) | McNemar seed 1 (B only / A only, p) | resolved and check green (A → B), B − A, 95% CI, p | cost B/A, 95% CI | p | wall-clock B/A, 95% CI | p | turns B/A |
|---|---|---|---|---|---|---|---|---|---|---|---|
| v5 vs plain | 6 | 83% → 83% | 0 pts [-50, 50] | 1.000 | 1 / 1, p=1.000 | 83% → 83%, 0 pts [-50, 50], p=1.000 | 21.06× [7.81, 48.49] | 0.031 | 1.87× [0.79, 4.19] | 0.281 | 4.92× |
| plain+stop vs plain | 6 | 83% → 100% | 17 pts [0, 50] | 1.000 | 1 / 0, p=1.000 | 83% → 100%, 17 pts [0, 50], p=1.000 | 0.93× [0.79, 1.09] | 0.500 | 0.84× [0.45, 1.58] | 0.688 | 1.04× |
| v5 vs plain+stop | 6 | 100% → 83% | -17 pts [-50, 0] | 1.000 | 0 / 1, p=1.000 | 100% → 83%, -17 pts [-50, 0], p=1.000 | 22.56× [8.01, 59.78] | 0.031 | 2.24× [0.58, 8.23] | 0.375 | 4.71× |

#### Power at this sample

- v5 vs plain: 6 paired tasks, 33% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±54 pts; smallest cost ratio detectable: 4.20×.
- plain+stop vs plain: 6 paired tasks, 17% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±38 pts; smallest cost ratio detectable: 1.30×.
- v5 vs plain+stop: 6 paired tasks, 17% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±38 pts; smallest cost ratio detectable: 4.92×.

#### Per task

| task | kind | verified | plain: resolved, $, min | plain+stop: resolved, $, min | v5: resolved, $, min |
|---|---|---|---|---|---|
| go-pull-desk-remedy-once | behavioral | yes | ✓ 0.025 23 | ✓ 0.032 16 | ✓ 0.386 45 |
| index-why-prints-text | behavioral | yes | ✓ 0.009 6 | ✓ 0.006 2 | ✓ 0.857 45 |
| proc-empty-argv-never-starts | behavioral | yes | ✓ 0.011 7 | ✓ 0.010 14 | ✗ 0.025 2 |
| set-refuses-closed-group | behavioral | yes | ✓ 0.011 7 | ✓ 0.012 18 | ✓ 0.244 45 |
| signalled-meets-notstarted-readers | behavioral | yes | ✗ 0.025 16 | ✓ 0.019 9 | ✓ 1.138 20 |
| standing-pull-takes-auto-merge | behavioral | yes | ✓ 0.027 24 | ✓ 0.028 18 | ✓ 0.698 34 |


#### haiku-1, interface: Overview (interface tasks: 6, runs: 18)

| arm | runs | resolved | check green (of measured) | resolved and check green | mean $ | median $ | mean tokens out / cache read | mean min | median min | mean turns | mean tool calls | files outside scope | needs owner | killed at cap |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| plain | 6 | 5/6 (83%) | 5/5 | 5/6 | 0.037 | 0.033 | 18.9k / 1.56M | 12.2 | 11.1 | 32 | 34 | 0.3 | 0/6 | 0/6 |
| plain+stop | 6 | 6/6 (100%) | 6/6 | 6/6 | 0.021 | 0.021 | 12.5k / 0.69M | 7.6 | 7.3 | 19 | 20 | 0.0 | 0/6 | 0/6 |
| v5 | 6 | 3/6 (50%) | 3/3 | 3/6 | 0.444 | 0.373 | 49.6k / 7.80M | 27.5 | 26.4 | 96 | 88 | 0.2 | 5/6 | 1/6 |

#### What the harness did

| arm | runs | session $ (mean) | harness-side $ (mean) | harness-side calls | stop-hook blocks (mean) | door refusals (mean) | ticket files written (mean) | commits (mean) | subagents (mean) | models seen | ended at cap | ended on an owner stop |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| plain | 6 | 0.037 | 0.000 | 0 | 0.0 | 0.0 | 0.2 | 1.0 | 0.0 | claude-haiku-5-5 | 0 | 0 |
| plain+stop | 6 | 0.021 | 0.000 | 0 | 0.0 | 0.0 | 0.2 | 1.0 | 0.0 | claude-haiku-5-5 | 0 | 0 |
| v5 | 6 | 0.295 | 0.149 | 6 | 11.5 | 7.7 | 1.8 | 9.7 | 0.3 | claude-haiku-5-5 | 1 | 4 |

#### Paired comparisons (B against A, per task; seeds averaged)

| comparison | tasks | resolved (A → B) | B − A, 95% CI | p (sign-flip) | McNemar seed 1 (B only / A only, p) | resolved and check green (A → B), B − A, 95% CI, p | cost B/A, 95% CI | p | wall-clock B/A, 95% CI | p | turns B/A |
|---|---|---|---|---|---|---|---|---|---|---|---|
| v5 vs plain | 6 | 83% → 50% | -33 pts [-67, 0] | 0.500 | 0 / 2, p=0.500 | 83% → 50%, -33 pts [-67, 0], p=0.500 | 11.81× [9.03, 15.55] | 0.031 | 2.29× [1.79, 2.86] | 0.031 | 3.22× |
| plain+stop vs plain | 6 | 83% → 100% | 17 pts [0, 50] | 1.000 | 1 / 0, p=1.000 | 83% → 100%, 17 pts [0, 50], p=1.000 | 0.61× [0.47, 0.78] | 0.031 | 0.65× [0.45, 0.96] | 0.156 | 0.61× |
| v5 vs plain+stop | 6 | 100% → 50% | -50 pts [-83, -17] | 0.250 | 0 / 3, p=0.250 | 100% → 50%, -50 pts [-83, -17], p=0.250 | 19.48× [15.23, 29.36] | 0.031 | 3.49× [2.48, 4.98] | 0.031 | 5.27× |

#### Power at this sample

- v5 vs plain: 6 paired tasks, 33% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±54 pts; smallest cost ratio detectable: 1.54×.
- plain+stop vs plain: 6 paired tasks, 17% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±38 pts; smallest cost ratio detectable: 1.49×.
- v5 vs plain+stop: 6 paired tasks, 50% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±66 pts; smallest cost ratio detectable: 1.74×.

#### Per task

| task | kind | verified | plain: resolved, $, min | plain+stop: resolved, $, min | v5: resolved, $, min |
|---|---|---|---|---|---|
| check-errors-names-the-part | interface | yes | ✓ 0.039 8 | ✓ 0.023 8 | ✗ 0.315 27 |
| example-retro-gaps-shown-name | interface | yes | ✓ 0.020 19 | ✓ 0.011 7 | ✓ 0.196 26 |
| hand-spawn-skips-session-tag | interface | yes | ✓ 0.023 8 | ✓ 0.019 7 | ✗ 0.296 17 |
| lint-row-keeps-floor | interface | yes | ✓ 0.044 14 | ✓ 0.017 6 | ✓ 0.890 45 |
| tui-swap-fails-loud | interface | yes | ✗ 0.027 7 | ✓ 0.026 10 | ✗ 0.431 18 |
| vale-retries-its-timeout | interface | yes | ✓ 0.068 16 | ✓ 0.031 8 | ✓ 0.537 32 |


#### haiku-1: every run

| task | arm | resolved | hidden F2P | full check | ended | cost $ (nested) | min | turns | note |
|---|---|---|---|---|---|---|---|---|---|
| check-errors-names-the-part | plain+stop | yes | 171/171 | green | success | 0.023 (0.000) | 8 | 21 |  |
| check-errors-names-the-part | plain | yes | 171/171 | green | success | 0.039 (0.000) | 8 | 29 |  |
| check-errors-names-the-part | v5 | no | 170/171 | – | the-owner-holds-the-step | 0.315 (0.000) | 27 | 99 | TestCheckVerb/a green run under --errors prints the no-red line alone, past the parts' own lines: the run answers 0, "The red list stands apart until its tests-green closes: test/level0/a.test.js\nThe server stands at http://127.0.0.1:6510/health.\nThe check n |
| example-retro-gaps-shown-name | plain+stop | yes | 50/50 | green (attempt 2 of 2) | success | 0.011 (0.000) | 7 | 10 |  |
| example-retro-gaps-shown-name | plain | yes | 50/50 | green (attempt 2 of 2) | success | 0.020 (0.000) | 19 | 26 |  |
| example-retro-gaps-shown-name | v5 | yes | 50/50 | green | the-work-stands-complete | 0.196 (0.000) | 26 | 112 |  |
| go-pull-desk-remedy-once | plain+stop | yes | 1/1 | green | success | 0.032 (0.000) | 16 | 37 |  |
| go-pull-desk-remedy-once | plain | yes | 1/1 | green | success | 0.025 (0.000) | 23 | 28 |  |
| go-pull-desk-remedy-once | v5 | yes | 1/1 | green | cap | 0.386 (0.000) | 45 | 89 |  |
| hand-spawn-skips-session-tag | plain+stop | yes | 257/257 | green | success | 0.019 (0.000) | 7 | 19 |  |
| hand-spawn-skips-session-tag | plain | yes | 257/257 | green | success | 0.023 (0.000) | 8 | 21 |  |
| hand-spawn-skips-session-tag | v5 | no | 0/257 | – | the-owner-holds-the-step | 0.296 (0.162) | 17 | 81 | TestACallTakesTheDefaultWaitOffItsKey, TestACallsArgumentsSpreadOnTheEventReachTheAction, TestAClearOpensTheDebtAgain failed |
| index-why-prints-text | plain+stop | yes | 1/1 | green | success | 0.006 (0.000) | 2 | 8 |  |
| index-why-prints-text | plain | yes | 1/1 | green | success | 0.009 (0.000) | 6 | 11 |  |
| index-why-prints-text | v5 | yes | 1/1 | green | cap | 0.857 (0.140) | 45 | 149 |  |
| lint-row-keeps-floor | plain+stop | yes | 168/168 | green | success | 0.017 (0.000) | 6 | 15 |  |
| lint-row-keeps-floor | plain | yes | 168/168 | green | success | 0.044 (0.000) | 14 | 42 |  |
| lint-row-keeps-floor | v5 | yes | 168/168 | green | cap | 0.890 (0.579) | 45 | 98 |  |
| proc-empty-argv-never-starts | plain+stop | yes | 4/4 | green | success | 0.010 (0.000) | 14 | 17 |  |
| proc-empty-argv-never-starts | plain | yes | 4/4 | green | success | 0.011 (0.000) | 7 | 15 |  |
| proc-empty-argv-never-starts | v5 | no | 2/4 | – | success | 0.025 (0.000) | 2 | 33 | no code change |
| set-refuses-closed-group | plain+stop | yes | 1/1 | green | success | 0.012 (0.000) | 18 | 14 |  |
| set-refuses-closed-group | plain | yes | 1/1 | green | success | 0.011 (0.000) | 7 | 14 |  |
| set-refuses-closed-group | v5 | yes | 1/1 | green | cap | 0.244 (0.211) | 45 | 34 |  |
| signalled-meets-notstarted-readers | plain+stop | yes | 2/2 | green | success | 0.019 (0.000) | 9 | 17 |  |
| signalled-meets-notstarted-readers | plain | no | 0/2 | – | success | 0.025 (0.000) | 16 | 20 | TestVoiceRunsValeAnswersTheFaultOfAValeASignalEnds: a Vale a signal ends answers "" vale ends by a signal: killed, and wants the fault killed |
| signalled-meets-notstarted-readers | v5 | yes | 2/2 | green | the-owner-holds-the-step | 1.138 (0.000) | 20 | 217 |  |
| standing-pull-takes-auto-merge | plain+stop | yes | 1/1 | green | success | 0.028 (0.000) | 18 | 32 |  |
| standing-pull-takes-auto-merge | plain | yes | 1/1 | green | success | 0.027 (0.000) | 24 | 23 |  |
| standing-pull-takes-auto-merge | v5 | yes | 1/1 | green | the-work-stands-complete | 0.698 (0.000) | 34 | 130 |  |
| tui-swap-fails-loud | plain+stop | yes | 440/440 | green | success | 0.026 (0.000) | 10 | 20 |  |
| tui-swap-fails-loud | plain | no | 439/440 | – | success | 0.027 (0.000) | 7 | 19 | TestTuiFailedSwapFailsTheVerbAndAsksNotForGo: code 1 out ".se/.log/session.jsonl\n03:04:05.678 warn  note   hello\n             1=1.5 2=two detail=d list=1,,2,3 obj=[object Object] n=null b=true big=1e+21 small=1e-7\n03:04:05.678 info  status plain\n undefined |
| tui-swap-fails-loud | v5 | no | 439/440 | – | the-owner-holds-the-step | 0.431 (0.152) | 18 | 81 | TestTuiFailedSwapFailsTheVerbAndAsksNotForGo: code 0 out ".se/.log/session.jsonl\n03:04:05.678 warn  note   hello\n             1=1.5 2=two detail=d list=1,,2,3 obj=[object Object] n=null b=true big=1e+21 small=1e-7\n03:04:05.678 info  status plain\n undefined |
| vale-retries-its-timeout | plain+stop | yes | 23/23 | green | success | 0.031 (0.000) | 8 | 30 |  |
| vale-retries-its-timeout | plain | yes | 23/23 | green | success | 0.068 (0.000) | 16 | 55 |  |
| vale-retries-its-timeout | v5 | yes | 23/23 | green | the-owner-holds-the-step | 0.537 (0.000) | 32 | 108 |  |

## Batch `sonnet-1`

#### sonnet-1, all: Overview (all tasks: 5, runs: 15)

| arm | runs | resolved | check green (of measured) | resolved and check green | mean $ | median $ | mean tokens out / cache read | mean min | median min | mean turns | mean tool calls | files outside scope | needs owner | killed at cap |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| plain | 5 | 2/5 (40%) | 2/2 | 2/5 | 0.115 | 0.133 | 2.9k / 0.13M | 3.5 | 4.1 | 8 | 8 | 0.0 | 0/5 | 0/5 |
| plain+stop | 5 | 3/5 (60%) | 3/3 | 3/5 | 0.107 | 0.111 | 2.6k / 0.11M | 2.1 | 1.2 | 7 | 7 | 0.0 | 0/5 | 0/5 |
| v5 | 5 | 3/5 (60%) | 3/3 | 3/5 | 1.264 | 1.292 | 22.2k / 4.54M | 34.8 | 41.3 | 81 | 79 | 0.6 | 2/5 | 2/5 |

#### What the harness did

| arm | runs | session $ (mean) | harness-side $ (mean) | harness-side calls | stop-hook blocks (mean) | door refusals (mean) | ticket files written (mean) | commits (mean) | subagents (mean) | models seen | ended at cap | ended on an owner stop |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| plain | 5 | 0.115 | 0.000 | 0 | 0.0 | 0.0 | 0.0 | 1.0 | 0.0 | claude-sonnet-5-5 | 0 | 0 |
| plain+stop | 5 | 0.107 | 0.000 | 0 | 0.0 | 0.0 | 0.0 | 1.0 | 0.0 | claude-sonnet-5-5 | 0 | 0 |
| v5 | 5 | 1.001 | 0.263 | 9 | 2.2 | 6.6 | 3.0 | 13.4 | 0.0 | claude-sonnet-5-5 | 2 | 1 |

#### Paired comparisons (B against A, per task; seeds averaged)

| comparison | tasks | resolved (A → B) | B − A, 95% CI | p (sign-flip) | McNemar seed 1 (B only / A only, p) | resolved and check green (A → B), B − A, 95% CI, p | cost B/A, 95% CI | p | wall-clock B/A, 95% CI | p | turns B/A |
|---|---|---|---|---|---|---|---|---|---|---|---|
| v5 vs plain | 5 | 40% → 60% | 20 pts [-40, 80] | 1.000 | 2 / 1, p=1.000 | 40% → 60%, 20 pts [-40, 80], p=1.000 | 11.06× [6.98, 18.60] | 0.062 | 12.68× [5.11, 31.61] | 0.062 | 10.92× |
| plain+stop vs plain | 5 | 40% → 60% | 20 pts [-40, 80] | 1.000 | 2 / 1, p=1.000 | 40% → 60%, 20 pts [-40, 80], p=1.000 | 0.96× [0.68, 1.32] | 0.875 | 0.60× [0.28, 1.29] | 0.500 | 0.97× |
| v5 vs plain+stop | 5 | 60% → 60% | 0 pts [0, 0] | 1.000 | 0 / 0, p=1.000 | 60% → 60%, 0 pts [0, 0], p=1.000 | 11.57× [7.94, 16.18] | 0.062 | 21.24× [8.35, 39.05] | 0.062 | 11.31× |

#### Power at this sample

- v5 vs plain: 5 paired tasks, 60% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±75 pts; smallest cost ratio detectable: 2.21×.
- plain+stop vs plain: 5 paired tasks, 60% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±75 pts; smallest cost ratio detectable: 1.73×.
- v5 vs plain+stop: 5 paired tasks, 0% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±53 pts; smallest cost ratio detectable: 1.78×.

#### Per task

| task | kind | verified | plain: resolved, $, min | plain+stop: resolved, $, min | v5: resolved, $, min |
|---|---|---|---|---|---|
| check-errors-names-the-part | interface | yes | ✗ 0.133 5 | ✗ 0.111 1 | ✗ 1.292 22 |
| hand-spawn-skips-session-tag | interface | yes | ✗ 0.093 4 | ✓ 0.133 6 | ✓ 1.319 21 |
| index-why-prints-text | behavioral | yes | ✓ 0.061 1 | ✓ 0.090 1 | ✓ 1.725 41 |
| signalled-meets-notstarted-readers | behavioral | yes | ✗ 0.157 7 | ✓ 0.080 1 | ✓ 1.287 45 |
| tui-swap-fails-loud | interface | yes | ✓ 0.133 1 | ✗ 0.119 1 | ✗ 0.694 45 |


#### sonnet-1, verified: Overview (verified tasks: 5, runs: 15)

| arm | runs | resolved | check green (of measured) | resolved and check green | mean $ | median $ | mean tokens out / cache read | mean min | median min | mean turns | mean tool calls | files outside scope | needs owner | killed at cap |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| plain | 5 | 2/5 (40%) | 2/2 | 2/5 | 0.115 | 0.133 | 2.9k / 0.13M | 3.5 | 4.1 | 8 | 8 | 0.0 | 0/5 | 0/5 |
| plain+stop | 5 | 3/5 (60%) | 3/3 | 3/5 | 0.107 | 0.111 | 2.6k / 0.11M | 2.1 | 1.2 | 7 | 7 | 0.0 | 0/5 | 0/5 |
| v5 | 5 | 3/5 (60%) | 3/3 | 3/5 | 1.264 | 1.292 | 22.2k / 4.54M | 34.8 | 41.3 | 81 | 79 | 0.6 | 2/5 | 2/5 |

#### What the harness did

| arm | runs | session $ (mean) | harness-side $ (mean) | harness-side calls | stop-hook blocks (mean) | door refusals (mean) | ticket files written (mean) | commits (mean) | subagents (mean) | models seen | ended at cap | ended on an owner stop |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| plain | 5 | 0.115 | 0.000 | 0 | 0.0 | 0.0 | 0.0 | 1.0 | 0.0 | claude-sonnet-5-5 | 0 | 0 |
| plain+stop | 5 | 0.107 | 0.000 | 0 | 0.0 | 0.0 | 0.0 | 1.0 | 0.0 | claude-sonnet-5-5 | 0 | 0 |
| v5 | 5 | 1.001 | 0.263 | 9 | 2.2 | 6.6 | 3.0 | 13.4 | 0.0 | claude-sonnet-5-5 | 2 | 1 |

#### Paired comparisons (B against A, per task; seeds averaged)

| comparison | tasks | resolved (A → B) | B − A, 95% CI | p (sign-flip) | McNemar seed 1 (B only / A only, p) | resolved and check green (A → B), B − A, 95% CI, p | cost B/A, 95% CI | p | wall-clock B/A, 95% CI | p | turns B/A |
|---|---|---|---|---|---|---|---|---|---|---|---|
| v5 vs plain | 5 | 40% → 60% | 20 pts [-40, 80] | 1.000 | 2 / 1, p=1.000 | 40% → 60%, 20 pts [-40, 80], p=1.000 | 11.06× [6.98, 18.60] | 0.062 | 12.68× [5.11, 31.61] | 0.062 | 10.92× |
| plain+stop vs plain | 5 | 40% → 60% | 20 pts [-40, 80] | 1.000 | 2 / 1, p=1.000 | 40% → 60%, 20 pts [-40, 80], p=1.000 | 0.96× [0.68, 1.32] | 0.875 | 0.60× [0.28, 1.29] | 0.500 | 0.97× |
| v5 vs plain+stop | 5 | 60% → 60% | 0 pts [0, 0] | 1.000 | 0 / 0, p=1.000 | 60% → 60%, 0 pts [0, 0], p=1.000 | 11.57× [7.94, 16.18] | 0.062 | 21.24× [8.35, 39.05] | 0.062 | 11.31× |

#### Power at this sample

- v5 vs plain: 5 paired tasks, 60% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±75 pts; smallest cost ratio detectable: 2.21×.
- plain+stop vs plain: 5 paired tasks, 60% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±75 pts; smallest cost ratio detectable: 1.73×.
- v5 vs plain+stop: 5 paired tasks, 0% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±53 pts; smallest cost ratio detectable: 1.78×.

#### Per task

| task | kind | verified | plain: resolved, $, min | plain+stop: resolved, $, min | v5: resolved, $, min |
|---|---|---|---|---|---|
| check-errors-names-the-part | interface | yes | ✗ 0.133 5 | ✗ 0.111 1 | ✗ 1.292 22 |
| hand-spawn-skips-session-tag | interface | yes | ✗ 0.093 4 | ✓ 0.133 6 | ✓ 1.319 21 |
| index-why-prints-text | behavioral | yes | ✓ 0.061 1 | ✓ 0.090 1 | ✓ 1.725 41 |
| signalled-meets-notstarted-readers | behavioral | yes | ✗ 0.157 7 | ✓ 0.080 1 | ✓ 1.287 45 |
| tui-swap-fails-loud | interface | yes | ✓ 0.133 1 | ✗ 0.119 1 | ✗ 0.694 45 |


#### sonnet-1, behavioral: Overview (behavioral tasks: 2, runs: 6)

| arm | runs | resolved | check green (of measured) | resolved and check green | mean $ | median $ | mean tokens out / cache read | mean min | median min | mean turns | mean tool calls | files outside scope | needs owner | killed at cap |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| plain | 2 | 1/2 (50%) | 1/1 | 1/2 | 0.109 | 0.109 | 2.8k / 0.13M | 3.7 | 3.7 | 8 | 10 | 0.0 | 0/2 | 0/2 |
| plain+stop | 2 | 2/2 (100%) | 2/2 | 2/2 | 0.085 | 0.085 | 1.8k / 0.09M | 1.1 | 1.1 | 6 | 6 | 0.0 | 0/2 | 0/2 |
| v5 | 2 | 2/2 (100%) | 2/2 | 2/2 | 1.506 | 1.506 | 25.8k / 5.46M | 43.1 | 43.1 | 87 | 86 | 1.0 | 1/2 | 1/2 |

#### What the harness did

| arm | runs | session $ (mean) | harness-side $ (mean) | harness-side calls | stop-hook blocks (mean) | door refusals (mean) | ticket files written (mean) | commits (mean) | subagents (mean) | models seen | ended at cap | ended on an owner stop |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| plain | 2 | 0.109 | 0.000 | 0 | 0.0 | 0.0 | 0.0 | 1.0 | 0.0 | claude-sonnet-5-5 | 0 | 0 |
| plain+stop | 2 | 0.085 | 0.000 | 0 | 0.0 | 0.0 | 0.0 | 1.0 | 0.0 | claude-sonnet-5-5 | 0 | 0 |
| v5 | 2 | 1.161 | 0.345 | 5 | 1.0 | 7.5 | 3.0 | 11.0 | 0.0 | claude-sonnet-5-5 | 1 | 0 |

#### Paired comparisons (B against A, per task; seeds averaged)

| comparison | tasks | resolved (A → B) | B − A, 95% CI | p (sign-flip) | McNemar seed 1 (B only / A only, p) | resolved and check green (A → B), B − A, 95% CI, p | cost B/A, 95% CI | p | wall-clock B/A, 95% CI | p | turns B/A |
|---|---|---|---|---|---|---|---|---|---|---|---|
| v5 vs plain | 2 | 50% → 100% | 50 pts [0, 100] | 1.000 | 1 / 0, p=1.000 | 50% → 100%, 50 pts [0, 100], p=1.000 | 15.17× [8.19, 28.08] | 0.500 | 19.06× [6.75, 53.81] | 0.500 | 11.67× |
| plain+stop vs plain | 2 | 50% → 100% | 50 pts [0, 100] | 1.000 | 1 / 0, p=1.000 | 50% → 100%, 50 pts [0, 100], p=1.000 | 0.87× [0.51, 1.47] | 1.000 | 0.49× [0.19, 1.26] | 1.000 | 0.87× |
| v5 vs plain+stop | 2 | 100% → 100% | 0 pts [0, 0] | 1.000 | 0 / 0, p=1.000 | 100% → 100%, 0 pts [0, 0], p=1.000 | 17.53× [16.08, 19.11] | 0.500 | 38.92× [35.56, 42.60] | 0.500 | 13.35× |

#### Power at this sample

- v5 vs plain: 2 paired tasks, 50% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±71 pts; smallest cost ratio detectable: 5.62×.
- plain+stop vs plain: 2 paired tasks, 50% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±71 pts; smallest cost ratio detectable: 4.41×.
- v5 vs plain+stop: 2 paired tasks, 0% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±55 pts; smallest cost ratio detectable: 1.27×.

#### Per task

| task | kind | verified | plain: resolved, $, min | plain+stop: resolved, $, min | v5: resolved, $, min |
|---|---|---|---|---|---|
| index-why-prints-text | behavioral | yes | ✓ 0.061 1 | ✓ 0.090 1 | ✓ 1.725 41 |
| signalled-meets-notstarted-readers | behavioral | yes | ✗ 0.157 7 | ✓ 0.080 1 | ✓ 1.287 45 |


#### sonnet-1, interface: Overview (interface tasks: 3, runs: 9)

| arm | runs | resolved | check green (of measured) | resolved and check green | mean $ | median $ | mean tokens out / cache read | mean min | median min | mean turns | mean tool calls | files outside scope | needs owner | killed at cap |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| plain | 3 | 1/3 (33%) | 1/1 | 1/3 | 0.120 | 0.133 | 3.0k / 0.14M | 3.4 | 4.1 | 7 | 7 | 0.0 | 0/3 | 0/3 |
| plain+stop | 3 | 1/3 (33%) | 1/1 | 1/3 | 0.121 | 0.119 | 3.2k / 0.13M | 2.7 | 1.2 | 8 | 8 | 0.0 | 0/3 | 0/3 |
| v5 | 3 | 1/3 (33%) | 1/1 | 1/3 | 1.102 | 1.292 | 19.8k / 3.93M | 29.2 | 21.5 | 78 | 75 | 0.3 | 1/3 | 1/3 |

#### What the harness did

| arm | runs | session $ (mean) | harness-side $ (mean) | harness-side calls | stop-hook blocks (mean) | door refusals (mean) | ticket files written (mean) | commits (mean) | subagents (mean) | models seen | ended at cap | ended on an owner stop |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| plain | 3 | 0.120 | 0.000 | 0 | 0.0 | 0.0 | 0.0 | 1.0 | 0.0 | claude-sonnet-5-5 | 0 | 0 |
| plain+stop | 3 | 0.121 | 0.000 | 0 | 0.0 | 0.0 | 0.0 | 1.0 | 0.0 | claude-sonnet-5-5 | 0 | 0 |
| v5 | 3 | 0.894 | 0.208 | 4 | 3.0 | 6.0 | 3.0 | 15.0 | 0.0 | claude-sonnet-5-5 | 1 | 1 |

#### Paired comparisons (B against A, per task; seeds averaged)

| comparison | tasks | resolved (A → B) | B − A, 95% CI | p (sign-flip) | McNemar seed 1 (B only / A only, p) | resolved and check green (A → B), B − A, 95% CI, p | cost B/A, 95% CI | p | wall-clock B/A, 95% CI | p | turns B/A |
|---|---|---|---|---|---|---|---|---|---|---|---|
| v5 vs plain | 3 | 33% → 33% | 0 pts [-100, 100] | 1.000 | 1 / 1, p=1.000 | 33% → 33%, 0 pts [-100, 100], p=1.000 | 8.96× [5.23, 14.13] | 0.250 | 9.66× [4.45, 39.73] | 0.250 | 10.45× |
| plain+stop vs plain | 3 | 33% → 33% | 0 pts [-100, 100] | 1.000 | 1 / 1, p=1.000 | 33% → 33%, 0 pts [-100, 100], p=1.000 | 1.02× [0.83, 1.43] | 1.000 | 0.68× [0.21, 1.44] | 1.000 | 1.03× |
| v5 vs plain+stop | 3 | 33% → 33% | 0 pts [0, 0] | 1.000 | 0 / 0, p=1.000 | 33% → 33%, 0 pts [0, 0], p=1.000 | 8.77× [5.84, 11.68] | 0.250 | 14.18× [3.54, 37.52] | 0.250 | 10.12× |

#### Power at this sample

- v5 vs plain: 3 paired tasks, 67% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±82 pts; smallest cost ratio detectable: 2.25×.
- plain+stop vs plain: 3 paired tasks, 67% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±82 pts; smallest cost ratio detectable: 1.61×.
- v5 vs plain+stop: 3 paired tasks, 0% discordant → smallest resolve-rate difference detectable at 80% power, α=0.05: ±55 pts; smallest cost ratio detectable: 1.80×.

#### Per task

| task | kind | verified | plain: resolved, $, min | plain+stop: resolved, $, min | v5: resolved, $, min |
|---|---|---|---|---|---|
| check-errors-names-the-part | interface | yes | ✗ 0.133 5 | ✗ 0.111 1 | ✗ 1.292 22 |
| hand-spawn-skips-session-tag | interface | yes | ✗ 0.093 4 | ✓ 0.133 6 | ✓ 1.319 21 |
| tui-swap-fails-loud | interface | yes | ✓ 0.133 1 | ✗ 0.119 1 | ✗ 0.694 45 |


#### sonnet-1: every run

| task | arm | resolved | hidden F2P | full check | ended | cost $ (nested) | min | turns | note |
|---|---|---|---|---|---|---|---|---|---|
| check-errors-names-the-part | plain+stop | no | 170/171 | – | success | 0.111 (0.000) | 1 | 6 | TestCheckVerb/a green run under --errors prints the no-red line alone, past the parts' own lines: the run answers 0, "The red list stands apart until its tests-green closes: test/level0/a.test.js\nThe server stands at http://127.0.0.1:6510/health.\nThe check n |
| check-errors-names-the-part | plain | no | 170/171 | – | success | 0.133 (0.000) | 5 | 7 | TestCheckVerb/a green run under --errors prints the no-red line alone, past the parts' own lines: the run answers 0, "The red list stands apart until its tests-green closes: test/level0/a.test.js\nThe server stands at http://127.0.0.1:6510/health.\nThe check n |
| check-errors-names-the-part | v5 | no | 170/171 | – | the-work-stands-complete | 1.292 (0.318) | 22 | 62 | TestCheckVerb/a green run under --errors prints the no-red line alone, past the parts' own lines: the run answers 0, "The red list stands apart until its tests-green closes: test/level0/a.test.js\nThe server stands at http://127.0.0.1:6510/health.\nThe check n |
| hand-spawn-skips-session-tag | plain+stop | yes | 257/257 | green | success | 0.133 (0.000) | 6 | 9 |  |
| hand-spawn-skips-session-tag | plain | no | 255/257 | – | success | 0.093 (0.000) | 4 | 7 | TestTheHandPromptOpensOnTheHandLine: the prompt opens on "You are a hand of your own on this box, named helper-1, and you work one step of one ticket." |
| hand-spawn-skips-session-tag | v5 | yes | 257/257 | green | the-work-stands-complete | 1.319 (0.143) | 21 | 95 |  |
| index-why-prints-text | plain+stop | yes | 1/1 | green | success | 0.090 (0.000) | 1 | 6 |  |
| index-why-prints-text | plain | yes | 1/1 | green | success | 0.061 (0.000) | 1 | 5 |  |
| index-why-prints-text | v5 | yes | 1/1 | green | the-work-stands-complete | 1.725 (0.522) | 41 | 96 |  |
| signalled-meets-notstarted-readers | plain+stop | yes | 2/2 | green | success | 0.080 (0.000) | 1 | 7 |  |
| signalled-meets-notstarted-readers | plain | no | 0/2 | – | success | 0.157 (0.000) | 7 | 11 | TestTheShellRunsALineThroughShInTheRootAndReadsAProgramThatNeverStartsAsAFault, TestVoiceRunsValeAnswersTheFaultOfAValeASignalEnds failed |
| signalled-meets-notstarted-readers | v5 | yes | 2/2 | green | cap | 1.287 (0.168) | 45 | 78 |  |
| tui-swap-fails-loud | plain+stop | no | 439/440 | – | success | 0.119 (0.000) | 1 | 8 | TestTwinGoldens failed |
| tui-swap-fails-loud | plain | yes | 440/440 | green | success | 0.133 (0.000) | 1 | 8 |  |
| tui-swap-fails-loud | v5 | no | 439/440 | – | cap | 0.694 (0.163) | 45 | 76 | TestTuiFailedSwapFailsTheVerbAndAsksNotForGo: code 0 out ".se/.log/session.jsonl\n03:04:05.678 warn  note   hello\n             1=1.5 2=two detail=d list=1,,2,3 obj=[object Object] n=null b=true big=1e+21 small=1e-7\n03:04:05.678 info  status plain\n undefined |

## Full checks

`./RUNME.sh check` on the final tree of every run that passed its hidden tests, after the sessions, one at a time, up to three attempts while red (DESIGN.md §3).

| batch | arm | hidden-pass runs | check measured | green | green only on a later attempt | red |
|---|---|---|---|---|---|---|
| haiku-1 | plain | 10 | 10 | 10 | 1 | 0 |
| haiku-1 | plain+stop | 12 | 12 | 12 | 1 | 0 |
| haiku-1 | v5 | 8 | 8 | 8 | 0 | 0 |
| sonnet-1 | plain | 2 | 2 | 2 | 0 | 0 |
| sonnet-1 | plain+stop | 3 | 3 | 3 | 0 | 0 |
| sonnet-1 | v5 | 3 | 3 | 3 | 0 | 0 |

## Cost log

Every model call this benchmark paid for, from `costlog.jsonl` (excluded batches and probes included: the money was spent).

| batch | arm | model | calls | $ total | of which harness-side $ |
|---|---|---|---|---|---|
| haiku-1 | plain | claude-haiku-5-5 | 14 | 0.393 | 0.000 |
| haiku-1 | plain+stop | claude-haiku-5-5 | 14 | 0.280 | 0.000 |
| haiku-1 | v5 | claude-haiku-5-5 | 13 | 7.195 | 1.572 |
| haiku-main | plain+stop | claude-haiku-5-5 | 1 | 0.035 | 0.000 |
| probe1 | plain | claude-haiku-5-5 | 1 | 0.015 | 0.000 |
| probe1 | plain+stop | claude-haiku-5-5 | 1 | 0.017 | 0.000 |
| probe3 | plain | claude-haiku-5-5 | 1 | 0.015 | 0.000 |
| probe3 | plain+stop | claude-haiku-5-5 | 1 | 0.018 | 0.000 |
| probe3 | v5 | claude-haiku-5-5 | 1 | 0.568 | 0.351 |
| sonnet-1 | plain | claude-sonnet-5-5 | 5 | 0.577 | 0.000 |
| sonnet-1 | plain+stop | claude-sonnet-5-5 | 5 | 0.533 | 0.000 |
| sonnet-1 | v5 | claude-sonnet-5-5 | 5 | 6.318 | 1.314 |
| verify | judge | claude-opus-5-5 | 61 | 3.061 | 0.000 |
| **all** | | | 123 | **19.03** | 3.236 |

Of the $19.03: the measured batches haiku-1 $6.58, sonnet-1 $7.43; the task screen $3.06; probes and excluded batches $1.96.


# Live runs: the service driving Claude Code

Two runs on toy repositories, the worker a headless Claude Code session
per attempt, the model the default Sonnet. Each run is a demonstration
that the seams hold, not a measurement.

## Run 1: the `mvp` route

The setup: a repository with one commit on `main` and an empty branch
`ticket/roman`, the service with a supervisor, one ticket.

```sh
python3 -m harness serve --repo toy --db live.db --port 8799 --worker claude --model sonnet --max-turns 30 --until-idle
python3 -m harness mint fizz "A function fizz(n) in fizz.py at the repository root: 'Fizz' for multiples of 3, \
  'Buzz' for multiples of 5, 'FizzBuzz' for both, str(n) otherwise. Tests live under tests/ and run with: \
  python3 -m unittest discover -s tests -q" --route mvp --branch ticket/fizz
```

The supervisor's log:

```
harness at http://127.0.0.1:8799  (owner page: http://127.0.0.1:8799/ )
19:04:54 ticket fizz: step test -> attempt 1
19:04:54 attempt 1: launching claude in .../work/fizz
19:05:11 attempt 1: exit 0, turns 6, cost 0.0723233
19:05:12 ticket fizz: step implement -> attempt 2
19:05:12 attempt 2: launching claude in .../work/fizz
19:05:26 attempt 2: exit 0, turns 6, cost 0.0630933
19:05:26 ticket fizz: step review -> attempt 3
19:05:26 attempt 3: launching claude in .../work/fizz
19:05:39 attempt 3: exit 0, turns 5, cost 0.064762
idle: nothing open or active
```

The ticket's timeline, from the event log:

```
19:04:52 minted               {"route": "mvp", "group": null, "branch": "ticket/fizz"}
19:04:52 step_entered         {"step": "test", "round": 1}
19:04:54 attempt_opened       {"attempt": 1, "step": "test", "worker": "claude", "number": 1, "of": 3}
19:05:03 evidence_filed       {"attempt": 1, "step": "test", "kind": "commit", "evidence": 1}
19:05:04 gating               {"attempt": 1, "step": "test"}
19:05:05 gate                 {"attempt": 1, "step": "test", "verdict": "pass", "detail": "`python3 -m unittest discover -s tests -q` fails at 5eeb58d..."}
19:05:05 attempt_ended        {"attempt": 1, "step": "test", "outcome": "passed"}
19:05:05 step_entered         {"step": "implement", "round": 1}
19:05:12 attempt_opened       {"attempt": 2, "step": "implement", "worker": "claude", "number": 1, "of": 4}
19:05:21 evidence_filed       {"attempt": 2, "step": "implement", "kind": "commit", "evidence": 2}
19:05:21 gating               {"attempt": 2, "step": "implement"}
19:05:22 gate                 {"attempt": 2, "step": "implement", "verdict": "pass", "detail": "`python3 -m unittest discover -s tests -q` passes at a0d49f3..."}
19:05:22 attempt_ended        {"attempt": 2, "step": "implement", "outcome": "passed"}
19:05:22 step_entered         {"step": "review", "round": 1}
19:05:26 attempt_opened       {"attempt": 3, "step": "review", "worker": "claude", "number": 1, "of": 2}
19:05:33 evidence_filed       {"attempt": 3, "step": "review", "kind": "review", "evidence": 3}
19:05:34 gating               {"attempt": 3, "step": "review"}
19:05:34 gate                 {"attempt": 3, "step": "review", "verdict": "pass", "detail": "review: approve; notes: ['fizz.py is correct: checks %15 ..."}
19:05:34 attempt_ended        {"attempt": 3, "step": "review", "outcome": "passed"}
19:05:34 done                 {}
```

The branch afterwards:

```
a0d49f3 Implement fizz(n)
5eeb58d Add failing tests for fizz(n)
f213940 init
```

Each attempt's closing words, abridged:

> **attempt 1 (test):** The test step passed the gate. I committed the
> tests on `ticket/fizz` and haven't pushed. The next step is
> `implement`. They fail at that commit because `fizz.py` doesn't exist
> yet. The commit also includes `tests/__pycache__/...pyc`, because I
> ran the tests before staging and there's no `.gitignore`.

> **attempt 2 (implement):** I implemented `fizz(n)` in `fizz.py`, and
> the gate passed. I left the existing tests unchanged, so no
> `test_change` evidence was needed.

> **attempt 3 (review):** I approved the diff, and the harness gate
> passed. This attempt changed no code. Two non-blocking points: the
> committed `.pyc` should be removed and ignored; no test covers `n=0`
> or negative numbers, which the goal doesn't specify.

What the run shows:

| seam | evidence it held |
|---|---|
| briefing in through SessionStart | the launch prompt names no step; each attempt knew its step, its branch and its definition of done |
| verbs out through MCP | three `commit` or `review` evidences filed, three `harness_done` calls, no stray stop |
| the gate verifies, the worker does not | the red and green verdicts carry the test command's result from a clean checkout |
| separation of duties | the reviewer attempt had a fresh context and raised what the implementer let through (the `.pyc`, the unspecified cases) |
| stop refused without a verb | no attempt ended with the step open; every attempt's outcome is `passed` |
| cost | three attempts, seventeen turns, about twenty cents, under a minute of wall clock |

## Run 2: the `default` route with the owner's gate

The setup: a fresh toy repository, the service without `--until-idle`,
the owner on the command line.

```sh
python3 -m harness serve --repo toy2 --db live2.db --port 8798 --worker claude --model sonnet --max-turns 30
python3 -m harness mint roman "A function roman(n) in roman.py at the repository root that returns the Roman numeral \
  for an integer n from 1 to 3999 as a string, and raises ValueError outside that range. Tests live under tests/ \
  and run with: python3 -m unittest discover -s tests -q" --route default --branch ticket/roman
```

The attempts, from the supervisor's log and the store:

| attempt | step | role | outcome | turns | what happened |
|---|---|---|---|---|---|
| 1 | draft | agent | passed | 5 | filed a plan with five criteria and seven named tests |
| 2 | design | agent | passed | 5 | filed the files and the interface |
| 3 | test | agent | passed | 6 | committed failing tests; the red gate verified the failure in a clean checkout |
| 4 | implement | agent | passed | 6 | committed `roman.py`; the green gate verified the pass |
| 5 | review | helper | failed | 5 | **request_changes**: the code is right, but three tests the plan named are missing |
| 6 | implement | agent | passed | 7 | added the missing tests with a `test_change` note, as the briefing's rule asks |
| 7 | review | helper | passed | 5 | approve |
| | accept | owner | | | the inbox card; `harness decide roman reject --note "add a one-line docstring ..."` |
| 8 | implement | agent | failed | 10 | added the docstring; **the green gate failed on a false positive** (see below) |
| 9 | implement | agent | passed | 7 | read the gate's reason in the handover, filed a `test_change` note naming the earlier commit, passed |
| 10 | review | helper | passed | 5 | approve |
| | accept | owner | | | `harness decide roman approve` |
| 11 | retro | agent | failed | 7 | sent `slow` as a string; the evidence was refused; **called `harness_done` anyway**; the gate failed; the ticket held as stuck |
| | retro | owner | | | `harness retry roman "file retro.slow and retro.change as lists of strings"` |
| 12 | retro | agent | passed | 6 | filed the retro; done |

Twelve attempts, about seventy turns, about ninety cents, five
minutes of wall clock, two owner decisions and one owner retry.

The branch afterwards:

```
8e47160 Add docstring to roman() naming the 1 to 3999 range
7331672 Add tests for non-integers, round trip, boundaries
b4b04b5 Implement roman()
bc8b778 Add failing tests for roman()
6be49d6 init
```

The reviewer's findings at attempt 5, abridged:

> roman.py is correct: greedy table, ValueError outside 1..3999,
> rejects bool/float/str/None (verified manually). Suite passes (2
> tests). Plan criterion 'ValueError for non-integers' is implemented
> but has no test; planned test_non_integer_raises_valueerror is
> missing. Planned test_round_trip_all_values is missing; no full
> 1..3999 check, so correctness across the range rests on spot values.

The worker's own words at attempt 8, after the gate failed:

> It says `tests/test_roman.py` changed since the test step, and no
> `test_change` evidence explains why. I didn't touch that file. My
> commit changed only `roman.py`, and the one earlier commit that
> modified a test file was "Add tests for non-integers, round trip,
> boundaries" (7331672), which predates this attempt. I'm stopping, as
> the harness instructed. Next attempt: either file `test_change`
> evidence explaining that commit 7331672 added tests, or ask the owner.

The retro the worker filed at attempt 12, abridged:

> slow: the earlier retro attempt requested the gate without filing
> retro evidence. The owner's late note (add a docstring) came after the
> implementation, which cost an extra commit. I only had git log and
> harness status as the timeline, so per-attempt timing is not visible.
> change: put the docstring and range wording in the original ask.

### What the run found, and what changed

| finding | where | the fix |
|---|---|---|
| the green gate's tamper check compared every round against the test step's commit, so a test change explained and accepted in one round failed the next | attempt 8 | the baseline moves with every green pass: the last commit that passed this step's gate, else the test step's commit (`_accepted_tests_sha`) |
| a worker whose evidence was refused called `harness_done` anyway, burned a gate failure, and held the ticket | attempt 11 | `harness_done` with required evidence missing is refused with `not_ready`, and the attempt goes on |
| a worker sent a list field as a string | attempt 11 | a string in a list field is wrapped, not refused |
| the retro worker had no view of the timeline it was asked to read | attempt 12 | the retro briefing carries every attempt, gate and decision |

Each fix has a test in `tests/test_engine.py` naming the run that found it.

### What the run shows

| claim in DESIGN.md | what happened |
|---|---|
| a fresh reviewer catches what the implementer let through | attempt 5 compared the tests with the plan and sent the ticket back; attempt 7 and 10 approved after the fix |
| the handover carries the reason into the next attempt | attempt 9 read the gate's reason and filed the note the gate asked for |
| the owner's note lands in the next briefing | attempt 8 added the docstring the owner's reject asked for |
| a stuck ticket is one tap away from running again | `harness retry` with a note; attempt 12 filed the retro the note described |
| a worker stops only through a verb | every attempt's outcome is one of passed or failed; none ended open |

## The owner's page during run 2

The inbox at a phone viewport, the ticket page, and the desktop view are
under [docs/](docs/): `inbox-phone.png`, `ticket-phone.png`,
`inbox-desktop.png`.

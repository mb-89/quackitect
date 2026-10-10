# baton: evaluation

| question | answer |
|---|---|
| Does baton beat a single agent? | Not at the scale I could measure. Full baton costs 2 to 4 times as much for equal quality. Lite beat a plain solo agent on the one task too big for its sessions, but a solo agent given one stopping rule matched lite there at lower cost. |
| What did measuring change? | Five rounds of changes to the design, each traced to a logged failure: three bugs in baton itself, and two rules about gates and prompts. |
| How sure is this? | Small samples: three to six chains per cell, 195 completed chains in all. Read the differences that repeat, and treat the rest as direction. |

**TL;DR**

- On small tasks (`dur`, `rpn`, `inv`, `kv`), solo and baton reach the same hidden-test score. Baton costs more sessions and more money, and in early versions it stalled on its own gates.
- On the largest task (`sheet`, Haiku, 5-turn sessions), plain solo never declared done in 12 sessions. Every commit it made was correct, yet each new session kept reworking the code, and the last one left a broken, uncommitted refactor (7 of 21 hidden tests). Lite (card, baton, one gated step) finished 3 of 3 in 4 sessions.
- **The control undid that win.** Solo told *"stop when tests cover every rule and pass; do not polish working code"* finished 6 of 6, all correct, in 4.8 sessions, cheaper than lite. Lite's win was its stopping rule, not its card.
- The harness's own faults dominated the early numbers. An append-only log made every one of them diagnosable from the record alone.
- The next measurement that matters puts something in the work that the repo cannot carry: an owner's answer, a crash mid-edit, a second agent. It is below.

## The headline table

The final design, against solo, on clean cells only. Solo comes from v1 (easy tasks) and v2 (kv). Baton is v3, lite is v2 (easy) and v3 (kv); sheet ran as one grid. Rows: `eval/results/*.jsonl`.

| task size | model, turns per session | arm | n | all hidden pass | claimed done, hidden fail | never claimed done | mean sessions | mean cost $ |
|---|---|---|---|---|---|---|---|---|
| small (dur, rpn, inv) | haiku t5 | solo | 9 | 9/9 | 0 | 0 | 3.0 | 0.021 |
| | | baton | 9 | 9/9 | 0 | 2 | 5.9 | 0.042 |
| | | lite | 9 | 9/9 | 0 | 0 | 2.7 | 0.021 |
| | haiku t12 | solo | 9 | 9/9 | 0 | 0 | 1.0 | 0.013 |
| | | baton | 9 | 9/9 | 0 | 2 | 4.3 | 0.038 |
| | sonnet t5 | solo | 6 | 6/6 | 0 | 0 | 1.0 | 0.090 |
| | | baton | 6 | 6/6 | 0 | 0 | 3.8 | 0.331 |
| medium (kv) | haiku t5 | solo | 3 | 3/3 | 0 | 0 | 5.0 | 0.050 |
| | | baton | 3 | 2/3 | 1 | 1 | 7.0 | 0.059 |
| | | lite | 3 | 2/3 | 1 | 0 | 2.0 | 0.021 |
| | haiku t12 | solo | 3 | 3/3 | 0 | 0 | 1.3 | 0.021 |
| | | baton | 3 | 0/3 | 3 | 0 | 2.0 | 0.026 |
| | sonnet t5 / t12 | solo | 6 | 6/6 | 0 | 0 | 1.0 | 0.131 |
| | | baton | 6 | 6/6 | 0 | 0 | 3.3 | 0.370 |
| large (sheet) | haiku t5 | solo | 3 | 2/3 | 0 | **3** | 12.0 | 0.173 |
| | | baton | 3 | 3/3 | 0 | 2 | 10.7 | 0.120 |
| | | lite | 3 | **3/3** | 0 | **0** | **4.0** | **0.063** |
| | sonnet t5 | solo | 3 | 3/3 | 0 | 0 | 1.0 | 0.181 |
| | | baton | 3 | 3/3 | 0 | 0 | 5.7 | 0.675 |
| | | lite | 3 | 3/3 | 0 | 0 | 1.0 | 0.181 |

How to read it:

- **Solo wins wherever one session holds the task.** Sonnet holds every task here in one session, even at 5 turns. Haiku holds the small ones.
- **Full baton costs 2 to 4 times as much** in money and sessions, mostly for its separate review session and the turns its claims take. On small and medium tasks it bought nothing that solo lacked.
- **Lite costs what solo costs** on small tasks, and beat plain solo on the one task Haiku cannot hold in a 5-turn session, the only cell where the relay condition bit. The stop control below then matched lite with one prompt line.
- **Baton's `claimed done, hidden fail` on kv** is one rule (a non-string key must raise `ValueError`), missed under baton and never under solo. v4 below traces it to the route's prompts.

## What the sheet cell shows

The solo Haiku chains on sheet each ran all 12 sessions and never said TASK COMPLETE. Scoring each commit of one chain separately:

| commit | hidden tests |
|---|---|
| first implementation | 21/21 |
| "Evaluate each formula cell once per get" | 21/21 |
| "Order formula evaluation iteratively" | 21/21 |
| the working tree when session 12 hit its turn cap | 7/21, and 40 errors in its own suite |

The agent was right from its first commit. What it lacked was a reason to stop: each new session re-read the repo, found something to improve, and the last one ran out of turns halfway through an uncommitted refactor. A handover receives the tree as it stands, so the broken tree is the result. Lite's one gate (a clean tree, tests committed, tests pass) is an external stopping rule, and the card tells the next session the work is done. The design argued that this pair of failures (no stopping rule, a crash in the middle of an edit) is the core of long work. This cell is the only direct evidence for it here, at n = 3.

### The stop control

The obvious objection was that a solo prompt naming a stopping rule might do as well. I ran it: 6 chains each, sheet, Haiku, 5-turn sessions. Rows: `eval/results/stop.jsonl`.

| arm | n | all hidden pass | never claimed done | mean sessions | mean cost $ |
|---|---|---|---|---|---|
| solo, told when to stop | 6 | 6/6 | 0 | 4.8 | 0.068 |
| lite (v4 goals) | 6 | 6/6 | 1 | 5.3 | 0.082 |

It does as well, for less. The sheet result was the absence of a stopping rule in the plain solo prompt, and a stopping rule fits in one line. At this scale, the card, the gate and the log add cost and no quality.

This takes nothing from the failures baton was built for, because none of them occurred here: a session that dies without a turn cap's tidy ending, an owner's answer that lives nowhere in the repo, two agents on one queue, a work stalled for hours. The relay condition tested *handover through the repo*, and the repo, read by a capable model, turned out to be enough of a handover for tasks this size.

## v1: the first design, measured

48 chains: three small tasks (`dur`, `rpn`, `inv`), Haiku at 5 and 12 turns per session and Sonnet at 5, both arms. Raw rows: `eval/results/v1-main.jsonl`.

| arm | n | all hidden pass | never claimed done | claimed done, hidden fail | mean sessions | mean cost $ |
|---|---|---|---|---|---|---|
| haiku t5 solo | 9 | 9/9 | 0 | 0/9 | 3.0 | 0.021 |
| haiku t5 baton | 9 | 9/9 | 3 | 0/6 | 7.7 | 0.041 |
| haiku t12 solo | 9 | 9/9 | 0 | 0/9 | 1.0 | 0.013 |
| haiku t12 baton | 9 | 9/9 | 6 | 0/3 | 8.8 | 0.044 |
| sonnet t5 solo | 6 | 6/6 | 0 | 0/6 | 1.0 | 0.090 |
| sonnet t5 baton | 6 | 5/6 | 3 | 0/3 | 9.2 | 0.637 |

Solo won outright: the same quality, never stuck, at a fraction of the cost. The tasks sat inside both models' reach even in 5-turn slices, so there was no wrong *done* for baton to stop, and its route was pure overhead. Every one of baton's 12 unfinished chains traces to baton itself:

| cause | chains | what happened |
|---|---|---|
| frozen tests met a wrong test | 8 | the agent's own `red` test was wrong (`90 s + 1h30m` expected as `2h`), or a reviewer asked for a test `green` may not add; the agent asked the owner, correctly, and no owner sat in the loop |
| review loop | 2 | reviewer and author circled over test changes `green` could not make; one escalated |
| the MCP server crashed | 2 | a string where the schema said object killed the server; later sessions retried into a dead server |

In most of these chains the code passed every hidden test: the gates held back right work. Two more observations from the logs:

- Agents ended a session with an explicit `handoff` twice; leases expired after a session 66 times. Sessions end on the turn cap, where Claude Code fires no Stop hook, and the agent does not know its budget. Every relay handover ran on the crash path: the lease expired, and the next card carried the baton from the last claim.
- Separate sessions shared nothing but the repo and the log. Nested `claude -p` runs inherit the parent's session id and write into one transcript file, but each opens on the bare prompt and re-explores the repo: no hidden memory crossed sessions in either arm.

## What the claim is

baton claims to beat a single agent working alone on long work, where *long*
means longer than one session can hold: the session ends, crashes or compacts,
and someone has to carry on. It claims nothing on work one session finishes.
The measurement has to put both arms in that regime on purpose, with tasks
whose correctness a program can judge without trusting either arm.

## The relay experiment

One task, worked by a chain of short sessions. Each session gets a hard turn
budget (`--max-turns`), so no session can finish the task alone unless the
budget is generous; the work finishes only if what one session leaves behind
lets the next carry on. A crash, a context reset and a handover all compress
into that one condition.

| | solo | baton |
|---|---|---|
| each session gets | the task text, the repo as the last session left it, "you may be one of several sessions; commit as you go; say TASK COMPLETE when done" | the baton hooks and MCP tools; the card carries the task, the step, the gates and the last baton |
| the chain ends when | a session says TASK COMPLETE | the route (spec, red, green, review) is done, or the work waits on the owner |
| review | none | a separate session as a different actor |
| route | none | spec, red, green, review (`relay`) |
| cap | 12 sessions | 12 sessions |

A third arm, **lite**, is level 1 of DESIGN.md section 4: the same hooks, card and baton, and one step that closes on a clean tree, committed tests and a passing test command. No `red`, no freeze, no reviewer.

All arms see the same task text, the same model, the same turn budget, the
same empty repo with a `tests/` folder, and the same tools (Bash, Edit, Write,
Read, Glob, Grep). Sessions run headless (`claude -p`) in a scratch folder
outside any project, so no project instructions leak in.

**Scoring.** Each task has hidden acceptance tests, one per rule of the ask,
that neither arm sees. A reference solution passes all of them (checked:
`eval/tasks/*/reference.py`); an empty repo passes none. After the chain, the
scorer copies the repo, drops the hidden tests in, and counts passes.

| metric | what it shows |
|---|---|
| all hidden pass | the work is right |
| mean hidden score | partial credit |
| claimed done, hidden fail | the arm said done and was wrong: the failure baton exists to stop |
| never claimed done | the chain ran out of sessions or stopped on the owner |
| owner needed | the chain stopped on a question for the owner |
| mean sessions, cost, minutes | the price |

**Tasks.**

| task | ask | hidden tests |
|---|---|---|
| `dur` | parse, format and add durations; a CLI | 13 |
| `rpn` | an RPN evaluator with variables and assignment | 12 |
| `inv` | an inventory class with CSV persistence | 11 |
| `kv` | a key-value store with nested transactions, expiry and a command language | 20 |
| `sheet` | a spreadsheet engine: formulas, ranges, cycle detection, error values that propagate | 21 |

## v2 to v4: what each round fixed, and what it found next

| round | change | what it showed | rows |
|---|---|---|---|
| v2 | `reopen`; tools never crash | agents used `reopen` 10 times, correctly (a wrong test, a test a reviewer asked for). But a reopened `red` still demanded failing tests while the code existed, so it could not close: 8 of 24 easy baton chains stopped on that question. A second defect showed on kv: the card cut asks over 2000 characters, so lite and baton agents built from a spec cut mid-rule. Sonnet noticed and asked; Haiku claimed done at 17 of 20 | `v2.jsonl`, `v2-lite.jsonl` |
| v3 | `red` must fail on its first pass only; the card never shortens the ask | owner stops fell from 8 to 5 of 24 on the easy tasks. One was a real contradiction in my own `rpn` ask (`2 -1 ^` cannot be an int), which is the question an owner should get; four were escalations from reviewers rejecting edge cases the ask never names. On kv, Haiku under baton missed one rule in 4 of 6 chains | `v3.jsonl` |
| v4 | `green`: "the tests are a floor, not the target"; `review`: "reject naming each rule the code breaks" | the kv rule miss fell from 3 of 3 to 1 of 6 at 12 turns; lite's from 1 of 3 to 0 of 6. A direction, at this n | `v4.jsonl` |

The kv miss is worth a sentence, because it is the one place baton made the *work* worse. The ask says a non-string key raises `ValueError`; Python's habit is `TypeError`. Solo agents never slipped. Baton agents wrote their own tests at `red`, the tests never covered that rule, and `green` told them to make the tests pass, so the tests became the target and the rule fell out of view. The reviewer approved against the same tests. Naming the ask as the target in both goals mostly fixed it. A gate checks only what it checks, and a step's goal is a prompt, so the goal must name the ask itself, never a proxy for it.

## The harness's own faults

The measurement found more faults in baton than in the agents:

| fault | found by | cost before the fix |
|---|---|---|
| the MCP server died on a string where an object was due | v1 logs | 3 Sonnet chains |
| the card cut long asks | v2 logs | Haiku's only false *done* on kv in v2 |
| a reopened `red` could never close | v2 logs | 8 owner stops |
| a `cmd` gate with no repo ran tests in the engine's own folder | the screenshot seed | none in the eval; wrong closes in use |
| twelve defects in argument checking, lease and step races, skip-worktree, independence, the web form | an independent code review | none measured; each now has a test |

Every one was found from the record: the event log of the chain, the transcript, or the code. The append-only log paid for itself here more than anywhere else.

## How to run it

```
python eval/relay.py --task kv --cond baton --model claude-haiku-5-5 --max-turns 5 --out /tmp/run1
python eval/run_all.py /tmp/grid --grid main --jobs 8     # the full grid
python eval/summarize.py /tmp/grid/results.jsonl
```

## Threats to validity

- **Small n.** A few chains per cell. Differences of one chain are noise; I
  report counts, not rates, and read only differences that repeat across
  tasks and models.
- **The tasks are small.** They are what fits a few hours of measurement. The
  relay condition (tiny turn budgets) stands in for long work; it compresses
  the *handover* problem but not the *drift* problem of a session that runs
  for hundreds of steps. Drift needs longer tasks than I could run here.
- **The arms differ in more than one way.** baton brings a route, gates,
  a card and a reviewer at once. The experiment tests the package; an
  ablation (card only; gates only; review only) is the next run.
- **The solo prompt is fair but not maximal.** It tells the agent about the
  relay and to commit. A stronger solo prompt ("keep a NOTES.md") would close
  part of the gap the card opens, and is the obvious next control.
- **One model family** plays author, reviewer and baseline.

## The next runs

In order of what they would settle:

1. **Done: the solo control told when to stop.** It closed the sheet gap (above).
2. **Conditions the repo cannot carry**: an owner answer given mid-work, a decision recorded nowhere in the code, a session killed mid-edit, two agents on one queue. These are where the card, the log and the lease should pay, if they pay anywhere; this experiment never created them.
3. **Larger tasks** than sheet, where Sonnet also needs several sessions: that is where full baton's review should start paying, if it ever does.
4. **Ablations of full baton**: lite + review; lite + `red`/frozen; to price each piece.

## Measuring it properly

The experiment above is what fits in one sandbox in an afternoon. The real
measurement, which I would run next:

1. **Tasks long enough to matter.** 20 to 40 real issues from open-source
   repos with merged fixes and hidden tests (SWE-bench style; Jimenez et al.,
   2024), each needing more than one session's context.
2. **Paired design.** Each task runs in both arms with the same model and
   seed budget; report the paired difference with a bootstrap interval.
3. **Ablations.** card only; card + gates; card + gates + review; full baton.
4. **The owner's attention as a metric.** Count interrupts (questions,
   approvals, escalations) per landed work, and time-to-answer; a harness that
   wins on quality by asking the owner everything has not won.
5. **Pre-registered prediction.** baton loses on cost for single-session work
   and wins on *claimed done, hidden fail* and on completion once the work
   spans three or more sessions. If the second half fails on long tasks,
   the core claim is wrong.

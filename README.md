# baton

A harness that keeps an LLM agent on track over long, multi-step work. The
log holds the state; programs close steps; every session starts from a card
rendered out of the log. The design and its reasons stand in
[DESIGN.md](DESIGN.md); the measurement in [EVAL.md](EVAL.md); the comparison
with the owner's own attempt in [COMPARE.md](COMPARE.md).

Python 3.11 or later, standard library only. git on the path.

## Run it

| to | run |
|---|---|
| run the tests | `python -m unittest discover -s tests -t .` |
| watch a whole route, scripted, no model | `python demo.py` |
| file a work | `python -m baton --db baton.db new "Title" --ask "..." --repo path/to/repo` |
| read the owner's inbox | `python -m baton --db baton.db inbox` |
| open the owner's page (phone first) | `python -m baton --db baton.db serve --port 8077` |
| run the supervisor | `python -m baton --db baton.db tick --every 60` |
| act as an agent by hand | `python -m baton --db baton.db --as agent:me take`, then `card`, `done -e name=text -b "baton"` |
| attach a Claude Code session | `claude $(python -m baton --db baton.db --as agent:a1 install path/to/repo)` |

`install` writes an MCP config and a hooks file beside the database, never
inside the repo, and prints the flags that load them: `--mcp-config`,
`--settings` and `--allowedTools mcp__baton__*`. The session then gets its
card at start and after every compaction, a heartbeat on every tool call, and a
stop hook that will not let it leave holding work.

Set `BATON_TOKEN` before `serve` to require `?t=<token>` on first visit; a
cookie carries it after.

## The owner's page

At phone width, seeded with a work in every state the owner meets:
[the inbox](docs/owner-inbox.png), and [one work's page](docs/owner-work.png).

## Layout

| path | holds |
|---|---|
| `baton/store.py` | the append-only event log (SQLite) |
| `baton/routes.py` | the routes: standard, trivial, unattended, relay, lite, and the v4 goals (relay4, lite4) |
| `baton/gates.py` | the gates: evidence, clean, cmd, touched, frozen, verdict, ci, human |
| `baton/engine.py` | the fold from events to work state, every verb, the supervisor, the inbox |
| `baton/card.py` | the card and the three-line re-anchor |
| `baton/mcp.py` | the stdio MCP server: the agent's verbs |
| `baton/hooks.py` | the Claude Code hooks: session-start, post-tool-use, stop |
| `baton/web.py` | the owner's page |
| `baton/cli.py` | the command line |
| `tests/` | the engine, the gates against real git repos, the hooks, the MCP protocol, the page, `reopen`, and one test per defect the code review found |
| `eval/` | the relay experiment: tasks with hidden tests and reference solutions, the driver, the grid runner, the scorer, the summariser |
| `eval/results/` | every chain's result row, one file per round |
| `docs/` | the owner's page at phone width |
| `demo.py` | the scripted run the transcript below comes from |

## Demo transcript

`python demo.py`, shortened where marked. The agent's edits are scripted; the
harness's answers are real.

```
## The owner files a work
$ baton new 'Add mul' --ask 'Add mul(a, b) to calc.py.' --group calc --repo .../repo --ci local
W1

## An agent takes it; its card
$ baton --as agent:a1 take
W1
$ baton --as agent:a1 card
BATON CARD for agent:a1: W1 "Add mul" (group calc)
Branch work/w1. Lease: yours, renewed by every tool call
ASK
  Add mul(a, b) to calc.py.
STEP 1/7: draft (owner: agent)
  Restate the ask as a short spec: what changes, what stays, and how anyone can tell it works.
Route: [draft] > design > red > green > review > accept > retro
DONE WHEN (the harness checks these; your word does not close a step):
  - evidence 'spec' attached (at least 80 chars)
[...]

## A claim without evidence is refused
$ baton --as agent:a1 done --baton 'spec done'
Claim refused; the step stays open. Fix this and claim again:
[evidence] evidence 'spec' is missing or under 80 characters; attach it as evidence={'spec': ...}

## red: the tests must fail before the code exists
$ baton --as agent:a1 done --baton 'test written'
Claim refused; the step stays open. Fix this and claim again:
[clean] uncommitted changes (tests/test_mul.py); commit first, because evidence binds to a commit
# (the agent edits files and commits: failing test for mul)
$ baton --as agent:a1 done --baton 'tests/test_mul.py fails on missing mul(); next: implement'
Gates passed: step 'red' closed. Next step is yours:
[... the green card ...]

## The agent's session dies here. Another agent takes over from the card.
$ baton --as agent:a2 take
W1

## green: editing the tests is refused
# (the agent edits files and commits: delete the hard test)
$ baton --as agent:a2 done --baton 'tests pass'
Claim refused; the step stays open. Fix this and claim again:
[frozen] test files changed since step 'red' closed: tests/test_mul.py. Tests are frozen after red; revert them, or ask the owner if a test is wrong
# (the agent edits files and commits: revert the cheat, implement mul)
$ baton --as agent:a2 done --baton 'mul implemented, tests pass; next: review'
Gates passed: step 'green' closed. The next step belongs to helper; your lease is released. Call take() for more work, or stop.

## review: a helper who wrote nothing sends it back
$ baton --as helper:r1 take
W1
$ baton --as helper:r1 verdict reject -f 'mul has no docstring'
Sent back to step 'green': mul has no docstring
[... agent:a2 adds the docstring, claims green again; helper:r1 approves ...]

## The owner's inbox, then one tap
$ baton inbox
NEEDS YOU (1)
  W1 [approve] Add mul @ accept 6/7
      The owner checks the result and lands it. Baton: docstring added; next: review again
MOVING (0)
DONE (0)
$ baton approve W1
W1: accept closed; next: retro (agent)
```

## Limits of the prototype

- The forge adapter (GitHub pull requests, merge, CI webhooks) is an outbox of
  `forge.request` events; nothing consumes it. `baton ci W1 <sha> pass` stands
  in for a webhook, and `--ci local` runs the test command as CI.
- One SQLite file serves every process on one machine. The cloud desk (the
  same engine behind HTTP) is designed, not built.
- The owner's page has no push notifications; `/api/inbox` is the hook for one.

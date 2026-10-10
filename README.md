# harness

A prototype of the design in [DESIGN.md](DESIGN.md): a supervisor that
hands an LLM agent one step of one ticket at a time, verifies the
agent's claims itself, hands work over between attempts, and asks the
owner only when it cannot decide.

Python 3.11 or later, standard library only. Git on the path.

## Layout

| path | holds |
|---|---|
| `harness/routes.py` | routes: the steps, gates and budgets, loaded from `routes/*.toml` |
| `harness/store.py` | SQLite, one writer, the event log beside the view tables |
| `harness/engine.py` | tickets, attempts, evidence, handovers, gates, leases, owner verbs |
| `harness/repo.py` | the git adapter the gates use, and a fake for simulation |
| `harness/server.py`, `harness/page.py` | the HTTP API and the owner's page |
| `harness/mcp_server.py` | the six verbs a worker calls, as an MCP server over stdio |
| `harness/hooks.py` | the Claude Code hooks: briefing in, stop refused, git fenced, heartbeat |
| `harness/worker.py`, `harness/supervisor.py` | the Claude Code worker and the loop that launches it |
| `harness/sim.py` | the simulation EVAL.md reports |
| `harness/cli.py` | `python3 -m harness ...` |
| `tests/` | unit tests on the fake repo, gate tests on real git, service tests over a socket |

## Run

```sh
# the tests
python3 -m unittest discover -s tests -t .

# the scripted demo: the default route end to end on a toy repository
python3 -m harness demo

# the simulation: harness mechanics against a lone agent
python3 -m harness sim --n 400

# the service with the owner's page, on a repository of your own
python3 -m harness serve --repo /path/to/repo --db harness.db --port 8787
#   open http://127.0.0.1:8787/ on the phone or the desktop

# mint a ticket (the branch must exist in the repository)
python3 -m harness mint fizz "fizz(n) as a function" --route mvp --branch ticket/fizz

# the inbox and the board, in text
python3 -m harness status

# the owner's verbs
python3 -m harness decide fizz approve
python3 -m harness decide fizz reject --note "rename to fizzbuzz"
python3 -m harness answer fizz "no, return '0'"
python3 -m harness note fizz "keep the public name"
python3 -m harness retry fizz
python3 -m harness pause fizz

# the service plus a supervisor that runs Claude Code as the worker
python3 -m harness serve --repo /path/to/repo --worker claude --model sonnet --until-idle
```

## How a worker is wired

The supervisor launches `claude -p` per attempt with a settings file that
names four hooks and an MCP config that names one server. Both are
written under the work directory per attempt.

| moment | hook | what happens |
|---|---|---|
| session start, resume, after compaction | `SessionStart` | the briefing is injected as additional context |
| every tool call | `PostToolUse` | a heartbeat renews the lease; a pending hand-over request is relayed |
| a git write | `PreToolUse` on Bash | force push, push off the ticket's branch, checkout of main, rebase and hard reset are denied |
| the worker wants to stop | `Stop` | refused until `harness_done`, `harness_handover` or `harness_ask` was called |

The six verbs the worker has: `harness_status`, `harness_evidence`,
`harness_handover`, `harness_done`, `harness_ask`, `harness_note`.
Every verb carries the attempt's token; a stale token is refused.

## Demo transcript

`python3 -m harness demo`, abridged. A scripted worker plays every agent
role and the owner; the gates run against a real git repository in a
temporary directory.

```
$ harness mint fizz --route default
minted fizz on branch ticket/fizz, step draft

--- attempt 1 (agent) takes step draft
    gate default/draft: pass -> design
--- attempt 2 (agent) takes step design
    gate default/design: pass -> test
--- attempt 3 (agent) takes step test
    gate default/test: pass -> implement
      `python3 -m unittest discover -s tests -q` fails at a9917b66dd (exit 1); tests changed: ['tests/__init__.py', 'tests/test_fizz.py']

# a wrong implementation claims done
--- attempt 4 (agent) takes step implement
    gate default/implement: fail -> implement
      `python3 -m unittest discover -s tests -q` fails at 33b0a19ba6 (exit 1):

# the next attempt crashes with no handover; its lease expires
--- attempt 5 (agent) takes step implement
    handover done: attempt 4 requested the implement gate
    handover remaining: the gate failed: `python3 -m unittest discover -s tests -q` fails at 33b0a19b
    tick: expired attempts [5]; the harness synthesised a handover

# the next attempt reads the synthesised handover, sees the commit on the branch, and files it
--- attempt 6 (agent) takes step implement
    briefing: # ticket fizz · step implement · attempt 2 of 4 · branch ticket/fizz
    handover done: evidence filed: none; commits on the branch since the attempt began: 1
    handover remaining: unknown: the attempt ended by expired and left no handover; read the branch diff
    gate default/implement: pass -> review

# a fresh reviewer sends it back once, then approves
--- attempt 7 (reviewer) takes step review
    gate default/review: fail -> implement
      review requested changes: ["fizz(0) returns 'FizzBuzz'; the goal says str(n) for 0?"]
--- attempt 8 (agent) takes step implement
    handover remaining: the gate failed: review requested changes: ["fizz(0) returns 'FizzBuzz'; ...
    gate default/implement: pass -> review
--- attempt 9 (reviewer) takes step review
    gate default/review: pass -> accept

# the ticket waits in the owner's inbox
    [fizz · accept · decision] fizz(n): 'Fizz' on multiples of 3, 'Buzz' on multiples of 5,
    review: approve · last gate: pass: `python3 -m unittest discover -s tests -q` passes at b3733ff5b1
    files: ['fizz.py', 'tests/__init__.py', 'tests/test_fizz.py']
    actions: ['approve', 'reject', 'pause']
$ harness decide fizz reject --note 'add a docstring'
    -> step implement, state open
--- attempt 10 (agent) takes step implement
    handover remaining: the owner rejected: add a docstring
    gate default/implement: pass -> review
--- attempt 11 (reviewer) takes step review
    gate default/review: pass -> accept
$ harness decide fizz approve
    -> step retro, state open
--- attempt 12 (agent) takes step retro
    gate default/retro: pass -> done

ticket fizz: state done, stalls 1, attempts 12, gates 13
```

## Live run with Claude Code

See [LIVE.md](LIVE.md) for a transcript of the service driving Claude
Code through the `mvp` route on a toy repository.

## The owner's page

`GET /` serves one page. On a phone the inbox is the first screen: one
card per decision with two or three buttons. Under it the board: one
row per ticket with step, state, holder, lease left, attempts, fails and
stalls. A tap on a ticket opens its gates, evidence, handovers, attempts
and event timeline. The page polls the API every few seconds.

# A harness for long agent work

The bottom line: the LLM is a stateless function, and the harness owns
everything else. A supervisor process holds the process state in one
small store, hands a worker exactly one step at a time, re-grounds the
worker from the store on every start and every context reset, verifies
the worker's claims itself, and asks the owner only when it cannot
decide. The owner steers from a decision inbox on a phone.

| question | answer |
|---|---|
| 1. How does it hook into the LLM? | A supervisor runs Claude Code headless as a disposable worker per step attempt. State enters through a briefing (SessionStart hook), verbs enter through one MCP server, enforcement sits in the Stop and PreToolUse hooks. See [Hooking into the LLM](#1-hooking-into-the-llm). |
| 2. What is the backend? | One single-writer service over SQLite with an append-only event log. Routes and tickets are versioned in git. GitHub mirrors state and verifies claims, and is never the source of truth. See [The backend](#2-the-backend). |
| 3. What does the owner see? | A decision inbox first, a board and a timeline second. Three verbs: decide, note, pause. The agent sees one step and nothing else. See [The owner's interface](#3-the-owners-interface). |
| 4. Smallest version that beats one agent? | Durable briefing plus mandatory handover, a red-then-green test gate, a separate reviewer attempt, a lease with stall kill. Proved by a fault-injected benchmark on hidden tests. See [The smallest useful version](#4-the-smallest-useful-version). |

Contents

1. [Hooking into the LLM](#1-hooking-into-the-llm)
2. [The backend](#2-the-backend)
3. [The owner's interface](#3-the-owners-interface)
4. [The smallest useful version](#4-the-smallest-useful-version)
5. [Data model](#5-data-model)
6. [The main loops](#6-the-main-loops)
7. [Failure handling](#7-failure-handling)
8. [Trade-offs rejected](#8-trade-offs-rejected)
9. [What the prototype covers](#9-what-the-prototype-covers)

## 0. Terms

| term | meaning |
|---|---|
| ticket | one unit of work: a goal, a route, a group, a branch |
| route | the ordered steps a ticket passes, with a gate on each |
| step | one stage of a route: who owns it, what evidence closes it, what budget it has |
| attempt | one worker holding one step of one ticket under a lease |
| evidence | a typed record an attempt files: a commit, a test run, a review, a decision |
| gate | the check that closes a step, yielding pass, fail or hold |
| handover | what an attempt leaves for the next attempt on the same step |
| group | tickets that land together on one branch through one pull request |
| inbox | the owner's list of open decisions |
| supervisor | the harness process: leases, launches, watches, verifies |
| worker | the agent process for one attempt |
| briefing | the text a worker gets at start and after every context reset |

## 1. Hooking into the LLM

### The choice

Run the agent as a **subordinate worker under a supervisor you own**,
and reach it through three narrow seams:

| seam | mechanism | carries |
|---|---|---|
| in: grounding | SessionStart hook (matchers `startup`, `resume`, `compact`) prints the briefing as additional context | ticket, step, definition of done, last handover, owner notes, budget |
| in/out: verbs | one MCP server, `harness`, with six tools | status, evidence, handover, done, ask, note |
| enforcement | Stop hook and PreToolUse hook | refuses stopping without evidence or handover, refuses git writes off the step's branch |

The worker is Claude Code in headless mode (`claude -p`) with a
settings file naming the hooks and the MCP server. The supervisor
launches one worker per attempt and never talks to it after launch
except through the store. The Agent SDK fits the same seam: the
supervisor's `Worker` interface is `run(attempt) -> outcome`, and the
SDK adapter is a second implementation. The prototype ships a scripted
worker for tests and a Claude Code adapter for the live demo.

Why this seam and not a loop you own: owning the loop means rebuilding
the tool set, the sandbox, the permission model and compaction that
Claude Code already has. Owning the loop buys control of every turn.
The harness does not need every turn. It needs the start, the reset,
the end and the writes, and hooks give exactly those four.

Why not prompts and skills alone: a skill tells the model what to do,
and a model under pressure skips it. Only a hook can refuse. The rule
of this design is **a skill explains, a hook enforces, a verifier
checks**. Anything that matters sits at the second or third level.

### What the model sees

At start and after every compaction the worker sees one briefing, kept
under about two thousand tokens:

```
# ticket fizz-1 · step implement · attempt 3 of 5 · branch group/fizz
## Goal
<the ticket's ask, verbatim>
## This step closes when
- a commit on group/fizz is filed as evidence kind=commit
- `python -m pytest -q` at that commit exits 0
- the test files from step test are unchanged, or a test_change note explains the change
## Last handover (attempt 2, expired)
done: parsing in fizz.py; remaining: the 15 case; files: fizz.py
## Owner notes
keep the public function name fizz(n)
## Verbs
harness_status · harness_evidence · harness_handover · harness_done · harness_ask · harness_note
## Rules
File evidence as you go. Call harness_done to request the gate.
If you cannot finish, call harness_handover and stop.
## Budget
lease 20 min, renewed by every verb · about 40 tool calls left
```

Every verb response repeats the one-line header (ticket, step, attempt,
what still closes the step). Re-grounding is continuous and costs a
line, not a page.

The worker never sees other tickets, the board, or the implementer's
reasoning when it reviews. A narrow view keeps attempts interchangeable
and keeps the reviewer honest.

### How state survives a context reset

State never lives in the context. Four mechanisms:

1. **Evidence is filed as it happens.** A commit is filed when it is
   made, a test run when it ran. The store, not the transcript, is the
   record.
2. **The branch is the checkpoint.** Code lives on the group's branch.
   A new attempt checks the branch out and sees every commit the last
   one made.
3. **A handover is mandatory.** The Stop hook refuses to end an attempt
   whose step is open unless a handover is filed. A handover is five
   fields: done, remaining, blockers, files touched, next command.
4. **The supervisor synthesises what a crash leaves out.** When a worker
   dies with no handover, the supervisor writes one from facts it has:
   evidence filed, commits on the branch since the attempt began, the
   last verb called.

After compaction the SessionStart hook (matcher `compact`) injects the
briefing again, with the current evidence list, so the worker continues
from the store rather than from its own summary.

## 2. The backend

### Where state lives

| what | where | why |
|---|---|---|
| route definitions | git, `routes/*.toml` | reviewed like code, versioned with the code they govern |
| ticket asks | git, `tickets/*.toml`, or minted through the API | the owner edits them where they edit everything else |
| runtime state: attempts, leases, evidence, gates, handovers, decisions | the service, SQLite, one writer | leases need a clock, stall detection needs a clock, fencing needs a single writer; git has none of the three |
| event log | the service, append-only table | audit, timeline, replay |
| code | the group's branch | the branch is the checkpoint |
| pull request, checks | GitHub | mirror and verifier, never source of truth |

The service is one process with an HTTP API. Agents and hooks reach it
with a per-attempt token. It can run on the smallest machine anywhere;
the prototype runs it on the laptop.

### The step and route model

A route is a list of steps. Each step names:

| field | meaning |
|---|---|
| `owner` | `agent`, `helper` or `human` |
| `requires` | evidence kinds that must be on file before the gate runs |
| `gate` | the check: `mechanical`, `red`, `green`, `review`, `human` |
| `on_pass` | the next step, or `done` |
| `on_fail` | the step to return to, or `hold` |
| `max_fails` | gate failures before the ticket holds for the owner |
| `max_attempts` | attempts before the ticket holds |
| `lease_minutes` | how long one attempt may stay silent |
| `brief` | extra lines for the briefing |

The default coding route:

```
draft ──► design ──► test ──► implement ──► review ──► accept ──► retro ──► done
 agent     agent     agent      agent       helper     human      agent
 plan      design    red        green       review     decision   retro
                                  ▲            │
                                  └── fail ────┘   (third fail: hold)
```

| step | owner | gate | pass when |
|---|---|---|---|
| draft | agent | mechanical | a `plan` with at least one acceptance criterion and one named test |
| design | agent | mechanical | a `design` naming the files and interfaces to change |
| test | agent | red | a `commit` is filed, and the test command at that commit **fails** |
| implement | agent | green | a `commit` is filed, the test command at that commit **passes**, and the test files from `test` are unchanged or a `test_change` note explains why |
| review | helper | review | a fresh attempt files a `review` with verdict `approve`; `request_changes` sends the ticket back to `implement` with the findings in the handover |
| accept | human | human | the owner decides `approve` in the inbox; a group on autopilot passes on green CI |
| retro | agent | mechanical | a `retro` with at least one line under `change` |

A `trivial` route is `implement → accept`.

### How gates and evidence work

Evidence is **a claim with a reference**, and the gate verifies the
reference. The worker files `test_run {cmd, exit, sha}`. The gate does
not trust `exit`. It checks the commit out in a clean worktree and runs
`cmd` itself. CI does the same on the pull request. The agent's claim
is a hint that tells the gate where to look.

Gate kinds:

| kind | who verifies | what it checks |
|---|---|---|
| mechanical | the service | required evidence present, with shape |
| red | the service, in a clean checkout | the test command fails at the filed commit |
| green | the service, in a clean checkout | the test command passes at the filed commit, and the tests from the `test` step still stand |
| review | a separate attempt, fresh context | the reviewer's verdict |
| human | the owner | the decision in the inbox |

Separation of duties is enforced, not asked for: the service refuses a
`review` evidence from the attempt that filed the step's `commit`, and
refuses a `decision` from any attempt at all.

### How parallel agents coordinate

- **One group, one branch, one worker at a time.** Parallelism runs
  across groups. Inside a group, tickets run in order of declared
  dependencies. This gives up some throughput for zero merge surface
  inside a branch.
- **Leases with fencing.** An attempt holds a lease with a time to live
  and a token. Every verb renews the lease. A verb with a stale token
  is refused with `stale_lease`, so a zombie worker that lost its lease
  cannot write.
- **Handover is the only channel.** Workers never message each other.
  The next attempt reads the store.
- **A sync step, not an ad-hoc rebase.** When `main` moves under a
  group, the supervisor inserts a `sync` step that merges `main` into
  the group branch. A conflict the merge cannot resolve holds for the
  owner.

### How it talks to git and CI

Through one adapter with six calls, so a hosted forge is swappable:

| call | used by |
|---|---|
| `commit_exists(branch, sha)` | the `commit` evidence check |
| `run_at(sha, cmd)` | the red and green gates |
| `changed_files(sha_a, sha_b, paths)` | the green gate's test-tamper check |
| `open_pr(branch, title, body)` | the accept step |
| `enable_auto_merge(pr)` | the accept step |
| `ci_status(sha)` | the accept step, also fed by a webhook into `/api/ci` |

The PreToolUse hook refuses `git push` to any branch but the ticket's
and refuses `git checkout main`. The push itself is the worker's: the
supervisor only stops it from landing anywhere else.

## 3. The owner's interface

### What the owner's attention is for

The owner decides what the harness cannot: a gate marked `human`, a
ticket that held after repeated failure, a question an agent asked. All
else is a board they may look at and need not.

### The phone

The first screen is the **inbox**: one card per open decision.

```
┌──────────────────────────────────────────┐
│ fizz-1 · accept                          │
│ "fizzbuzz as a CLI"                       │
│ review: approve · tests: 7 pass          │
│ +41 −0 in fizz.py, tests/test_fizz.py    │
│ [ Approve ]  [ Send back ]  [ Pause ]    │
└──────────────────────────────────────────┘
┌──────────────────────────────────────────┐
│ auth-3 · held after 3 failed attempts    │
│ last handover: "token refresh loops      │
│ when the clock skews; need a decision    │
│ on tolerance"                            │
│ [ Note ]  [ Retry ]  [ Pause ]           │
└──────────────────────────────────────────┘
```

Each card carries the one line the decision turns on, the evidence that
matters, and two or three buttons. Send back and Note open a one-line
text field. Nothing else is on the phone screen above the fold.

Notifications fire only for inbox items, batched into a digest, with a
quiet-hours window. A group can be set to **autopilot**, which turns
its `human` gates into `mechanical` ones on green CI. The owner's cost
is measured: taps per merged ticket.

### The desktop

| view | shows |
|---|---|
| board | one column per group, one row per ticket: step, holder, last heartbeat, attempts used, budget left |
| ticket | the timeline from the event log, evidence with its verification result, every handover, the live worker log |
| inbox | the same cards as the phone, with the full diff behind a fold |

### Steering verbs

| verb | effect |
|---|---|
| decide | passes or fails a `human` gate; a fail carries a note into the next briefing |
| note | lands in the next briefing of that ticket |
| pause / resume | the lease is not renewed; the worker is told to hand over at its next verb |
| retry | opens the held step again with a fresh attempt |
| edit ask | makes a new ticket version; the running attempt is told to hand over |
| reprioritise | reorders the ready queue |

### How the agent's view differs

| the owner sees | the agent sees |
|---|---|
| every group and ticket | one ticket, one step |
| every attempt and handover | the last handover on its step |
| the diff and the evidence with verification | the definition of done and its own evidence list |
| the reasons a gate failed | the findings, not the reviewer's reasoning |
| the budget spent | the budget left |

## 4. The smallest useful version

### What is in it

| piece | failure of a lone agent it removes |
|---|---|
| briefing on every start and reset, handover mandatory | losing its place at a context reset or crash |
| red-then-green test gate, verified in a clean checkout | calling work done when the tests do not pass, or passing tests that never failed |
| a reviewer attempt with a fresh context | marking its own work done |
| lease with stall kill and bounded retry | spinning forever, or dying silently |

Not in it: groups, pull request automation, the board, notifications,
a retro step, a sync step. A `status` command and one HTML page are the
whole interface.

### How to prove it

Run the same tasks under two conditions with the same model and the
same token budget:

- **lone**: one Claude Code session per task, told to write tests and
  implement, allowed to call itself done.
- **harness**: the four-step route above.

Inject faults the lone agent also meets in the field: kill the worker
at a random point in a fraction of runs, and cap the context to force
compaction. Score every run on hidden tests the agent never sees.

| measure | what it tells |
|---|---|
| hidden-test pass rate | did the work get done |
| false-done rate: claimed done, hidden tests fail | does the gate catch the claim |
| completion under kill | does the handover carry the work across a crash |
| tokens and wall clock per completed task | what the harness costs |
| owner decisions per completed task | what the owner pays |

The claim this makes, and what breaks it: the harness completes more
tasks under fault injection and reports fewer false dones, at a token
cost of under twice the lone agent. If the lone agent matches the
completion rate with faults on, the handover and the lease are not
earning their cost. If the false-done rates match, the gate is not. If
the cost is over twice, the briefing is too long or the retries too
many. EVAL.md gives the protocol and the measurement run here.

## 5. Data model

The event log is the source. The tables beside it are views the
service keeps in the same transaction.

```
route ─────< ticket >───── group
               │
               ├──< attempt ──< evidence
               │       │
               │       └──< handover
               ├──< gate_result
               ├──< decision
               └──< event
```

| table | key fields |
|---|---|
| ticket | id, group, route, goal, branch, step, state, fails_on_step, attempts_on_step, stalls, notes |
| attempt | id, ticket, step, role, worker, token, started, lease_until, last_progress, ended, outcome |
| evidence | id, ticket, step, attempt, kind, body (JSON), verified, verify_detail |
| handover | id, attempt, done, remaining, blockers, files, next, synthesized |
| gate_result | id, ticket, step, attempt, verdict, detail |
| decision | id, ticket, step, verdict, note |
| event | seq, ts, ticket, kind, body |

Ticket states:

```
open ──► active ──► gating ──► open (next step)
            │          │
            │          └── fail ──► open (on_fail step)   or   held
            ├── expired/handover ──► open (same step)
            ├── pause ──► paused ──► open
            └── ask ──► held ──► open
                                  done
```

Attempt outcomes: `passed`, `failed`, `handover`, `expired`, `killed`,
`asked`, `stale`.

Evidence kinds and shape:

| kind | body |
|---|---|
| plan | `criteria: [..], tests: [..], files: [..]` |
| design | `files: [..], interfaces: [..]` |
| commit | `sha` |
| test_run | `cmd, exit, sha` |
| test_change | `why` |
| review | `verdict: approve or request_changes, findings: [..]` |
| decision | `verdict, note` (owner only) |
| retro | `slow: [..], change: [..]` |
| note | `text` |
| ci | `sha, status` (webhook only) |

## 6. The main loops

### The supervisor tick

Runs every few seconds.

```
for each attempt with lease_until < now:
    end it as expired, synthesise a handover, reopen the step
for each active attempt with last_progress older than progress_ttl:
    set handover_requested; after grace, kill and treat as expired
for each ticket in state open, by priority, while workers are free:
    if its group has an active attempt: skip
    if the step owner is human: make an inbox item, state held
    else: open an attempt, launch a worker with the briefing
for each ticket in state gating:
    run the gate, record gate_result, route by verdict
if main moved under a group with open tickets: insert a sync step
```

### The attempt

```
launch worker with HARNESS_URL, HARNESS_ATTEMPT, HARNESS_TOKEN
SessionStart hook prints the briefing
worker works, filing evidence through verbs; each verb renews the lease
worker calls harness_done            ──► state gating, attempt outcome passed/failed by the gate
   or harness_handover               ──► attempt outcome handover, step stays open
   or harness_ask                    ──► inbox item, ticket held, attempt outcome asked
   or dies                           ──► lease expires, supervisor synthesises the handover
Stop hook: refuses to stop unless one of the three verbs was called
```

### The gate

```
check required evidence is present and well formed      else fail "missing <kind>"
verify each referenced claim through the git adapter     else fail with the verifier's output
run the kind-specific check (red, green, review, human)
record gate_result
pass  ──► ticket.step = on_pass; reset fails and attempts on step
fail  ──► fails_on_step += 1
          fails_on_step > max_fails  ──► held, inbox item
          else ticket.step = on_fail, the failure detail becomes the handover
hold  ──► held, inbox item
```

### The reviewer

A `helper` step launches a worker with a reviewer briefing: the goal,
the diff between the branch base and the filed commit, the tests, the
plan. Not the implementer's handovers or reasoning. It files one
`review`. The service refuses the review if the attempt also filed the
step's commit.

## 7. Failure handling

| failure | detection | response |
|---|---|---|
| worker crashes | lease expires | synthesise handover from evidence and branch, reopen step, stalls += 1 |
| context exhausted | compaction fires | SessionStart `compact` re-injects the briefing; evidence already filed stands |
| worker spins | heartbeat alive, no new evidence or commit past progress_ttl | request handover; kill after grace |
| worker stops without handover | Stop hook | refused; the worker must file one |
| worker claims done, tests fail | green gate in clean checkout | fail with the test output; back to implement |
| worker deletes or weakens tests | green gate's test-tamper check | fail unless a `test_change` explains it |
| worker reviews its own work | service refuses the evidence | the review step waits for a fresh attempt |
| zombie worker after lease loss | fencing token | `stale_lease`, writes refused |
| step fails max_fails times | gate counter | held, inbox card with the last failure |
| step exhausts max_attempts | attempt counter | held, inbox card with the last handover |
| owner unreachable | inbox age | reminder in the digest; nothing auto-approves outside autopilot |
| main moves under a group | supervisor tick | `sync` step inserted; conflict holds for the owner |
| gate verifier itself fails (CI down, checkout fails) | verifier error, not a test failure | gate result `error`, retried on the next tick, held after three |
| service restarts | process start | views rebuilt from the event log; leases resume from stored `lease_until` |
| two services | not allowed | one writer by design; a second instance refuses to start on a locked store |

## 8. Trade-offs rejected

| rejected | why |
|---|---|
| state in files inside the repo | every state change is a commit, branches fork the state, and git has no clock for leases or stalls |
| GitHub as the whole backend: issues as tickets, labels as state | rate limits, no leases, a five-minute scheduler floor, eventual consistency; kept as mirror and verifier |
| prompts and skills alone | a model under pressure skips an instruction; only a hook refuses |
| owning the agent loop through the API | rebuilds tools, sandbox, permissions and compaction that Claude Code has; the hook seam gives the four moments that matter |
| agents messaging each other | nondeterministic, unauditable; the store is the only channel |
| a general workflow engine with a DAG per ticket | a linear route with verdict back-edges covers the cases and reads on a phone |
| parallel workers inside one group branch | merge surface and lost work; parallelism runs across groups |
| trusting the worker's test result | the one claim most often wrong; the gate reruns it |
| a dashboard as the owner's first screen | the owner has decisions to make, not graphs to read |
| auto-approval on timeout | silent approval is the one thing the owner cannot undo; autopilot is explicit, per group |
| one long-lived agent per ticket | its context is the single point of failure; disposable attempts make the store the point of truth |

## 9. What the prototype covers

| piece | status |
|---|---|
| store, routes, tickets, attempts, evidence, handovers, gates, event log | runs, tested |
| red and green gates in a clean git worktree, test-tamper check | runs, tested |
| separation of duties on review and decision | runs, tested |
| leases, fencing, stall kill, synthesised handover, bounded retry, hold | runs, tested |
| supervisor tick with a scripted worker and fault injection | runs, tested |
| HTTP API, owner page (inbox, board, ticket timeline), steering verbs | runs; phone and desktop screenshots under docs/ |
| MCP server, hooks, Claude Code worker adapter | runs; two live runs in LIVE.md, four faults found there fixed and tested |
| groups and dependency order | data model only |
| pull request, auto-merge, CI webhook | adapter interface and webhook endpoint; forge calls stubbed |
| sync step, notifications, autopilot | design only |
| event-log replay on restart | logged, not replayed |

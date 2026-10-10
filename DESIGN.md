# baton: design

| question | answer in one line | section |
|---|---|---|
| (1) How does the harness hook into the LLM? | Claude Code stays the agent; baton attaches as one MCP server with nine verbs and three hooks. Every session starts from a card rendered out of the log. | [1](#1-the-hook-into-the-model) |
| (2) What is the backend? | An append-only event log, one route per work, gates that are programs, leases with heartbeats, and a supervisor tick. Code lives in git; process lives in the log. | [2](#2-the-backend) |
| (3) What does the owner see? | One inbox of decisions, phone first: *needs you*, *moving*, *done*. Every decision takes one tap. | [3](#3-the-owners-interface) |
| (4) What is the smallest version that beats one agent? | Measured: a stopping rule, one prompt line. It matched every baton variant at the scale I could test, where full baton cost 2 to 4 times as much. The log, card and lease are for what this experiment never created: crashes, owner answers outside the repo, parallel agents. | [4](#4-the-smallest-version-that-wins) |

**TL;DR**

- The state lives outside the model, in an append-only log. The model never writes state; it makes *claims*, and programs (*gates*) decide.
- Every session starts from a *card*: a page rendered from the log that says what the work is, which step it stands on, what closes the step, and what the last agent said (*the baton*). A context reset, a crash and a handover are then the same event, and the harness handles all three with one mechanism.
- Evidence binds to a commit. A review, a CI result or an approval stops counting the moment HEAD moves.
- A lease with a heartbeat from every tool call tells a dead agent from a busy one; a closed step tells a busy agent from a productive one.
- The owner sees decisions, not activity.

## 0. Where the framing goes wrong

The brief frames reliability as *process*: steps, owners, gates, handovers. I think that puts the cause after the effect. Long agent runs fail through *state*, and the step model follows from fixing that:

| how long runs fail | the cause under it | baton's mechanism |
|---|---|---|
| loses the plot after compaction, a crash or a new session | the state lives in the transcript | the card, rendered from the log, injected at every session start, compaction included |
| declares done too early | the party being checked writes the verdict | claims; gates close steps |
| drifts off the step over many tool calls | nothing re-anchors a long horizon | a three-line re-anchor every 25 tool calls; the step goal on the card |
| edits the tests until they pass | the same agent writes tests and code | `red` must fail, tests freeze after `red`, an independent reviewer approves the exact commit |
| dies or hangs silently | nothing has a clock | a lease renewed by every tool call; the supervisor expires it |
| stays busy and gets nowhere | activity is mistaken for progress | progress means a closed step; a nudge, then an escalation |
| ends the session holding work | the session's end is invisible | the stop hook refuses once, then hands off on the agent's behalf |
| waits on a human forever, or floods them | questions arrive as prose, everywhere | one inbox, decisions only, with options as buttons |
| a review approves, then the code changes | evidence floats free of the code | every gate result carries the commit it saw |

The first two rows carry most of the weight. A model that reads its state from a page it did not write, and that cannot close a step by saying so, has little room left to wander. Everything else in this design is machinery I justify against a named failure in this table.

## 1. The hook into the model

**Recommendation: keep Claude Code as the agent and attach baton from outside, through MCP and hooks.** Cost: baton depends on Claude Code's hook contract, and controls only what enters the context at hook points, not the whole prompt.

```
            Claude Code session (one per agent, any sandbox)
  +---------------------------------------------------------------+
  |  SessionStart hook --> card (startup, resume, clear, compact) |
  |  PostToolUse hook  --> heartbeat; every 25th call: re-anchor  |
  |  Stop hook         --> refuse once while holding a lease      |
  |  MCP server baton  --> card take done note ask handoff        |
  |                        verdict mint                           |
  +-------------------------------|-------------------------------+
                                  v
                    the log (SQLite locally, HTTP in the cloud)
```

### What the model sees

| moment | what enters the context | size |
|---|---|---|
| session start, and again after every compaction | the card | 40 to 120 lines |
| an ordinary tool call | nothing | 0 |
| every 25th tool call | `[baton] W3 step green (4/7). Done when: ...` plus the last baton | 3 lines |
| a nudged agent, every 5th tool call | the nudge text | 1 line |
| a claim (`done`, `verdict`) | the gate results, or the next step's card | 1 to 100 lines |
| an attempt to stop while holding work | the stop hook's refusal and the three ways out | 5 lines |

A card, as the prototype renders it (`python -m baton card`), shortened where marked:

```
BATON CARD for agent:a2: W1 "Add mul" (group calc)
Branch work/w1. Lease: yours, renewed by every tool call

ASK
  Add a mul function to calc.

STEP 4/7: green (owner: agent)
  Make the tests pass without changing them. Commit.
Route: draft ok > design ok > red ok > [green] > review > accept > retro
DONE WHEN (the harness checks these; your word does not close a step):
  - working tree clean: commit before you claim
  - files under tests/ unchanged since step 'red' closed
  - `python -m unittest discover -s tests -t . -q` passes at HEAD

BATON (from agent:a1, 4 min ago)
  tests/test_mul.py fails on the missing mul(); implement it in calc.py

OPEN FINDINGS (sent back 1 time(s))
  - mul lacks a docstring

EVIDENCE FROM CLOSED STEPS
  draft/spec: ...
  design/design: ...
VERBS: card() . done(evidence, baton) . note(text, baton) . ask(question, options) . handoff(baton)
RULES: this card is the truth; your memory of earlier turns is not. ...
```

### How state survives a context reset

It has nothing to survive, because the context never held it. The card is a pure function of the log, so a session after compaction, a new session on the same box, and a different agent on another box all read the same page. The one piece of memory the model writes is **the baton**: one or two lines for a stranger on where things stand and what comes next. `done` and `handoff` refuse a call without one, so the baton is never older than the last claim. A `note` may update it at any time.

The compaction summary Claude Code writes is lossy prose the model wrote about itself. baton does not depend on it; the card arrives after it and outranks it ("this card is the truth").

### The verbs

| verb | who | what it does |
|---|---|---|
| `card()` | any | the card for the work you hold |
| `take(work?)` | any | lease the next work your role may do |
| `done(evidence, baton)` | agent | claim the step; gates decide |
| `note(text, baton?)` | any | journal a line; never progress |
| `reopen(step, reason)` | agent | send the work back to an earlier step of your own; counts as a bounce; the reviewer sees it |
| `ask(question, options)` | agent | a question to the owner; releases the lease |
| `handoff(baton)` | any | release the lease with a baton |
| `verdict(approve, findings)` | helper | approve HEAD, or send back with findings |
| `mint(title, ask)` | agent | propose new work; the owner approves its spec |

The list is short on purpose. Each verb either moves the work, or tells the owner something.

A tool call never takes the server down: a malformed argument answers a tool error naming the schema, and the agent retries. The first measurement lost three chains to a server that died on a string where an object was due (EVAL.md, v1).

### Alternatives I refused

| alternative | its strongest form | why I refuse it |
|---|---|---|
| own the loop on the raw API | full control of every token in the prompt; no dependency on a client's hook contract | the card already controls what matters, and an own loop re-implements editing, search, shell, permissions and compaction that Claude Code keeps improving. The protocol (card + claims) ports to the Agent SDK unchanged if the dependency ever hurts. |
| instructions alone: CLAUDE.md, a skill, a TODO file | zero machinery; strong models follow instructions well | instructions without enforcement leave the model as its own checker, and a TODO list in the context dies with the context. A skill is the right *packaging* for baton's prompt text, not a replacement for its gates. |
| a plugin | one install for the MCP server and the hooks | I accept it as the distribution format. It is the same design. |
| a sub-agent per step | fresh context per step; no drift | a handover per step costs context reconstruction every time. baton hands over at *role* boundaries (author to reviewer to owner), where independence pays for it, and at failures. |

## 2. The backend

### Data model

One table. Everything else is a fold.

```
Event(seq, ts, work, actor, kind, data)

actor  = role ":" id           role in {owner, agent, helper, ci, baton}
Work   = fold(events of that work)
  route        list of Step, copied in at creation
  step         index into route
  status       ready | active | waiting | paused | escalated | done   (derived)
  lease        actor, until
  baton        text, by, ts
  evidence     step -> name -> text
  closed       step -> {actor, sha, ts}
  verdicts, approvals, ci (sha -> ok), findings, bounces, expiries, ...
Step   = {step, owner: agent|helper|human, goal, gates: [Gate], on_reject?}
Gate   = {kind, ...}
```

Event kinds: `work.created`, `lease.taken`, `heartbeat`, `lease.released`, `lease.expired`, `evidence`, `baton`, `note`, `claim.failed`, `gate.record`, `park`, `step.closed`, `bounce`, `ask`, `answer`, `owner.note`, `approve`, `verdict`, `ci`, `nudge`, `escalate`, `pause`, `resume`, `prio`, `forge.request`.

Status is never stored; `_rest_status` derives it after every event. Two writers cannot disagree about a status, because no one writes it.

### Routes and gates

A route is a list, with one kind of back edge: `on_reject` sends the work to an earlier step with the findings attached. The standard route:

| step | owner | closes when |
|---|---|---|
| draft | agent | evidence `spec` (80+ chars); the owner's yes if an agent minted the work |
| design | agent | evidence `design` (80+ chars) |
| red | agent | tree clean; tests changed in this step; the test command **fails** (on the first pass only; a reopened `red` closes on changed, committed tests) |
| green | agent | tree clean; tests unchanged since `red`; the test command passes |
| review | helper | a verdict approving HEAD, by an actor who authored no step; reject goes back to `green` |
| accept | human | CI green at HEAD; the owner approves HEAD; reject goes back to `green` |
| retro | agent | evidence `retro`: what slowed the work, and one change that would have prevented it |

| gate | pass | fail | pending |
|---|---|---|---|
| `evidence` | named text at least `min` chars | missing or short | - |
| `clean` | no uncommitted change | dirty tree | - |
| `cmd` | exit code matches `expect` | otherwise, with the output tail | - |
| `touched` | test files changed since the step opened | none changed | - |
| `frozen` | test files unchanged since step X closed | changed, with the file list | - |
| `verdict` | an approve at HEAD by a non-author | a reject; the author reviewing | no verdict, or HEAD moved since |
| `ci` | green at HEAD | red at HEAD | no result for HEAD |
| `human` | the owner approved at HEAD | - | otherwise |

What a gate's answer does:

- **pass** on every gate closes the step. The engine records the commit and opens the next step.
- **fail** on an agent's step refuses the claim. The step stays open, and the reason goes on the card under LAST CLAIM FAILED.
- **fail** on a helper's or the owner's step bounces the work to `on_reject` with the reason as a finding. After `max_bounces`, the owner is asked.
- **pending** parks the work: the lease drops, and the event that can satisfy the gate (an approval, a CI result) re-runs the gates.

Gates run in a fixed order and stop at the first failure, so the cheap `clean` check spares the expensive test run.

### Evidence binds to a commit

Every sha-bound gate reads `git rev-parse HEAD` and refuses a dirty tree. The review verdict, the CI result and the owner's approval each carry the sha they saw. When HEAD moves, the old verdict reads *pending: HEAD moved since the last review*. This one rule closes the commonest way a gated process leaks: approve, then change.

### Parallel agents and handover

- **Leases.** One actor holds at most one work; one work has at most one holder. `take` runs in a `BEGIN IMMEDIATE` transaction, which is the whole compare-and-swap a lease needs.
- **Roles decide who may take.** A work is takeable by the role that owns its current step. When a step closes and the next step's owner differs, the lease drops. Handover is therefore the *normal* path at every role boundary, not a rare recovery path, so the mechanism a crash relies on runs dozens of times a day.
- **Independence.** A helper who authored any step of a work cannot take it.
- **Dependencies and order.** `after: [W1]` holds a work until W1 is done. `prio` orders, then age; an agent prefers work whose last baton it wrote.
- **Heartbeats.** Every tool call renews the lease (PostToolUse) and counts toward `calls`.

### The supervisor

`tick` runs every minute.

| condition | action |
|---|---|
| lease past `lease_ttl` with no heartbeat | `lease.expired`; the work is takeable again with its baton |
| the same step lost its agent `max_expiries` times | escalate: the step kills agents |
| no closed step for `spin_after`, or `spin_calls` tool calls | nudge, shown on the card and every 5th tool call |
| still nothing after half that again | escalate |
| `max_bounces` rejections | escalate (at bounce time) |

An escalated work leaves the queue until the owner resumes it, usually with a pinned hint.

### Git, pull requests and CI

- One work, one branch (`work/<id>`), one pull request. A group is a label plus `after` edges, never a branch. Small PRs land on their own.
- The engine writes `forge.request` events (an outbox) when steps close: `red` opens a draft PR, `review` marks it ready, `accept` merges. A forge adapter (a small process holding the GitHub token) consumes them. The prototype records the requests; the adapter is out of scope.
- CI results arrive by webhook as `ci` events keyed by sha. Gates run inside the agent's sandbox are the agent's evidence; CI is the trusted re-run, and `accept` requires CI at the same sha.
- A merge conflict reported by the forge bounces the work to `green` with the finding *merge base into branch*; the frozen-tests gate still holds.

### Where state lives, and why not git

Locally: one SQLite file. In the cloud: the same engine behind an HTTP API ("the desk"), and each sandbox's MCP server calls it. Gates that need the code run in the sandbox; the desk records results.

| refused store | strongest form | why not |
|---|---|---|
| git (a state branch or notes) | already shared by every sandbox; survives everything; auditable | no clock and no compare-and-swap, so leases and stall detection need a second system anyway; every heartbeat would be a push race |
| GitHub issues and labels | the owner already reads them on the phone | rate limits, no atomic claim, and a notification for every state change |
| a workflow engine (Temporal and kin) | durable timers, retries, history | a server, an SDK and a mental model for a problem one table solves |

To survive the desk's loss, the forge adapter writes each work's events to its PR description at every step close; a lost desk rebuilds from open PRs. Not built.

### Failure handling

| failure | what happens |
|---|---|
| the agent crashes or the sandbox dies | heartbeats stop; the lease expires; the next agent's card carries the baton; twice on one step escalates |
| the context fills up | compaction; SessionStart(compact) re-injects the card; nothing is lost that was in the log |
| the turn budget ends mid-step | Claude Code fires no Stop hook on a turn cap, and the agent does not know its remaining budget, so it rarely hands off in time (v1: 2 handoffs against 66 expiries). The lease expires and the next card carries the baton from the last claim. This is why the baton is mandatory on every claim, and not written at the end |
| the agent ends its turn holding work | the stop hook refuses once and asks for a handoff; on the second stop it hands off on the agent's behalf |
| an agent loops without progress | nudge, then escalate with the last baton |
| the agent needs the owner | `ask` parks the work and frees the agent for other work |
| a test written at `red` is wrong | the agent cannot edit it at `green`; it calls `reopen("red", reason)`, fixes the test, and claims `red` again. The reopen counts as a bounce and stands on the reviewer's card, so a weakened test meets a reader who knows to look |
| a reviewer asks for a new test | the author reopens `red`, adds it, and walks `red` and `green` again |
| reviewer and author disagree forever | `max_bounces`, then the owner |
| CI red at accept | a bounce to `green` with the finding |
| the desk is down | hooks fail open (never block a working agent); claims fail closed (no step closes unseen) |
| two agents race for one work | the transaction serialises them; the loser gets the next work |

## 3. The owner's interface

**Recommendation: one inbox of decisions, phone first, with three lists.** Cost: the owner sees little of *how* the work happens unless they open a work's page.

```
+-------------------------------------+
| baton . 2 need you                  |
+-------------------------------------+
| NEEDS YOU                           |
| QUESTION . draft 1/7                |
| W4 CSV export                       |
| Comma or semicolon as separator?    |
| [ comma ] [ semicolon ] [ answer ]  |
|-------------------------------------|
| APPROVE . accept 6/7                |
| W1 Add mul                          |
| Baton: mul implemented, reviewed    |
| [ Approve ]  [ Send back: ____ ]    |
+-------------------------------------+
| MOVING                              |
| o W2 Parser    ok    green 4/7      |
| o W3 Docs      slow  design 2/7     |
| o W5 Cache     queued draft 1/7     |
+-------------------------------------+
| DONE                                |
+-------------------------------------+
```

- **Needs you** holds the only items that wait on the owner: questions (with the agent's options as buttons), approvals (spec of agent-minted work, accept), and stuck work (resume with a hint, or pause). Push notifications fire for this list alone, batched.
- **Moving** is one line per work: a health word (`ok`, `queued`, `slow`, `waiting`, `stuck`), the step and position, and the baton. The owner reads the baton the agent wrote for the next agent; there is no second status report to write.
- **Done** lists what landed.
- **A work's page** holds the route, the ask, the baton, the evidence per step, the timeline, and the steering: pin a note (it appears on the agent's card under OWNER SAYS), pause, resume.
- **Desktop** is the same page wider, plus the CLI (`baton inbox`, `baton approve W1`).

| | the agent's view | the owner's view |
|---|---|---|
| scope | one work, deep | every work, one line each |
| form | the card, plain text in the context | the inbox, HTML with buttons |
| it acts by | claims, which gates judge | decisions, which take effect at once |
| it reads | the step, the gates, the baton, the findings | the decisions due, and the batons |

The attention budget: a standard work costs the owner one tap (accept), plus one per question, one per escalation, and one more if an agent minted the work. EVAL.md measures the taps.

## 4. The smallest version that wins

| level | pieces | beats one agent alone because |
|---|---|---|
| 1 | log, card at SessionStart, `done` with `clean` + `cmd` gates, the stop hook, the baton | a reset or a new session resumes from the card; premature done is refused |
| 2 | + `red`/`frozen` gates, + review by a fresh actor at the sha | gaming the tests stops paying; a second reader catches spec misses |
| 3 | + leases, tick, inbox, multiple agents | parallel work, stall detection, the owner in the loop |

Level 1 is a few hundred lines and needs no server. Proof, and the result of running it here, stand in [EVAL.md](EVAL.md).

**What the measurement said first, before its control:** level 1 (*lite*) cost the same as solo on small tasks, and was the best arm on the one task too big for a session, where plain solo agents were right from their first commit and never stopped reworking, until a turn cap left a broken tree. Full baton (level 2) paid 2 to 4 times solo's cost on small and medium tasks for no gain in hidden-test score. Its review step caught only faults the ask never named, and the same reviewer produced most owner interrupts until its goal was bounded. Without a reviewer, a wrong test that passes and a misread rule both land; whether review pays for that at larger scale is open.

The prediction this rested on, and what broke it: I credited lite's sheet win to its stopping rule plus the card, and named the falsifier: a solo agent told exactly when to stop. I ran it, and it matched lite at lower cost (EVAL.md, the stop control). So I was wrong about the card at this scale. The flaw under the error: the plain solo prompt I compared against never told the agent when it was finished, so I measured a missing stopping rule and credited the machinery.

**The answer to (4), replaced:** the smallest thing that beats a single agent alone, at the scale measured, is a stopping rule in the prompt, plus commit discipline. Build level 1 only when the work holds something the repo cannot carry: an owner's answer, a decision outside the code, a crash mid-edit, a second agent. That is where the card, the log and the lease should pay, and it is the next experiment, not a result.

## The main loops

```
agent session                      supervisor (every minute)          owner
-------------                      ------------------------           -----
SessionStart: take, card           expire dead leases                 inbox
loop:                              nudge spinners                     approve / send back
  work (tool calls = heartbeats)   escalate the stuck                 answer
  done(evidence, baton)            dispatch a session per ready       pin note, pause,
    gates pass  -> next step         work whose role has none           resume, prio
    gates fail  -> fix, claim again
    gates wait  -> parked, lease freed
  next step not mine -> stop
Stop: refuse once, then handoff
```

## The strongest objection, and my answer

*"A strong model with a good CLAUDE.md, a TODO list and a test suite already does all this. The harness adds turns, tokens and a server, and a model determined to pass a gate games it anyway."*

The objection is right about short work: below the length where a session ends or compacts, baton is overhead, and the relay experiment is built to show where that line falls. It is wrong about long work for three reasons. A TODO list in the context dies with the context, and a TODO file the model edits is self-certified. Nothing in a single agent detects that it died, or that it is spinning. And no instruction makes the reviewer independent of the author. On gaming: baton does not make cheating impossible. It makes the cheap cheats (edit the tests, approve then change, claim without committing) fail mechanically, and leaves the expensive ones to an independent reviewer at the exact commit.

## What the first measurement changed

The v1 relay run (EVAL.md) found that freezing tests after `red` turned every wrong test the agent wrote into an owner question: 8 of 24 baton chains stopped on one, though their code was right. Freezing was guarding against the agent weakening a test; the cost was that the agent could not repair an honest mistake. v2 keeps the freeze and adds the way back:

- `reopen` returns the work to `red` with a reason, so the agent repairs its own test without the owner.
- Every reopen counts toward `max_bounces`, so a loop still reaches the owner.
- The reviewer's card lists every send-back under SENT BACK BEFORE, so the weakened-test case meets the one reader paid to catch it.
- v2 then showed that a reopened `red` could never close: the gate still demanded failing tests while the code already existed, so honest repaired tests passed and the agent asked the owner again. "Tests fail first" guarantees something only on the first pass, when no code exists; v3 drops it on a reopened `red`.

The rule this follows: a guard that blocks honest repair costs more than the cheat it stops. Make the repair possible, logged, and visible to the independent reader.

The measurement also caught two bugs in baton itself, each worth a rule:

| bug | what it cost | the rule now |
|---|---|---|
| the MCP server died on a string where the schema said object | three Sonnet chains retried a dead server until their sessions ran out | a tool call never takes the server down; a bad call answers an error naming the schema |
| the card cut the ask at a fixed length | Haiku built from a spec cut mid-rule and claimed done at 17 of 20 hidden tests: the one false *done* in the study, caused by the harness | the card never shortens the ask; anything else it shortens says so and says where the rest stands |

v3 surfaced two failures of the route's *prompts*, not its code:

| failure | evidence | the change (v4) |
|---|---|---|
| tunnel vision at `green` | on kv, Haiku under baton raised `TypeError` where the ask said `ValueError`, in 4 of 6 chains; solo never did. The agents' own tests never covered that rule, and `green` said "make the tests pass" | `green` reads "implement the whole ask, rule by rule; the tests are a floor, not the target" |
| the reviewer gold-plates | four escalations came from reviewers rejecting for edge cases the ask never names (overflow, complex powers, a non-numeric `ttl`), one bounce each until `max_bounces` | `review` reads "reject naming each rule of the ask the code breaks"; anything else is a non-blocking note |

Both say the same thing: a step's goal is a prompt, and a gate only checks what it checks. Whatever a step's goal names becomes the agent's target, so each goal must name the ask, not a proxy for it.

An independent code review of the prototype then found twelve defects, now fixed and each pinned by a test (`tests/test_review_fixes.py`). The ones that touch the design: arguments are checked against the tool schema before anything reaches the log, since one malformed value poisoned the fold for every work; a claim re-checks its lease and its step inside the closing transaction; `clean` refuses files hidden from `git status` by skip-worktree; the independence rule compares sessions, not role-qualified names; the owner's page refuses cross-site posts.

Both bugs share a shape: the harness is the agent's only window onto the work, so a fault in the window reads to the agent as a fault in the world. A harness has to be held to a higher standard than the agent it steers, and tested against real models, not only its unit tests; the unit tests passed both bugs.

## Known weaknesses

- `red` accepts any failing exit code; a syntax error passes it. The reviewer is the only guard. A stronger gate parses the test report and counts failing tests.
- A reviewer from the same model family shares the author's blind spots. A different model, or a different prompt, for helpers is cheap to try.
- The fold reads every event of a work on every call. Fine for thousands of events; past that, a snapshot per work.
- One desk is one point of failure; the PR-description export is the planned answer.
- The card grows with evidence. The prototype caps each field; a longer route needs a summary step.

## Sources

- Fowler, M. (2005). *Event Sourcing*. The log-as-state pattern.
- Gray, C. and Cheriton, D. (1989). *Leases: an efficient fault-tolerant mechanism for distributed file cache consistency*. The lease with a timeout.
- Huang, J. et al. (2024). *Large Language Models Cannot Self-Correct Reasoning Yet*. Why the checker must not be the author. Cited from memory, unchecked here.
- Liu, N. F. et al. (2023). *Lost in the Middle*. Long contexts lose material in the middle; a short card at the end of the context avoids depending on recall. Cited from memory, unchecked here.
- Anthropic (2024). *Building effective agents*. Simple, composable patterns before frameworks. Cited from memory, unchecked here.

# hx: a harness for long, gated, multi-agent work

Clean-room design C. It was written before I looked at any prior implementation; see COMPARE.md for that.

## 0. The answer on one screen

| Question | Answer |
|---|---|
| **How does the harness hook into the LLM?** | The harness owns the **outer loop**: tickets, steps, sessions and leases. The agent runtime (Claude Code, locally or in a cloud sandbox) owns the **inner loop**: turns and tools. There is exactly one interface, a CLI called `hx`. The model calls it through Bash. **Claude Code hooks** call the same CLI to inject the brief at session start and after compaction, to deny forbidden tool calls (frozen tests, zombie sessions, reviewer edits, force pushes), to refuse a premature stop, and to send a heartbeat. A **skill** documents the protocol. An MCP server is an optional thin wrapper. Each turn the model sees only a compact *brief*, which is a projection of durable state, plus one-line *notices* when something changed. State survives context resets because nothing that matters is held only in the context. |
| **What is the backend?** | An **append-only event log with a deterministic fold**. One pure function `apply(state, event)` validates every transition. It runs on append when a single writer or a compare-and-swap store is used, and on fold when a log has no CAS. **Processes are data**: steps, each with a role, a gate, the evidence kinds it accepts, routes by outcome, loop limits, an approval policy and a timebox. **Evidence is a pointer to something immutable**, normally a commit SHA, plus the report of a *verifier*. Gates are computed by the engine and never asserted by the agent. **Leases carry epochs**, and the epoch is the fencing token. Expiry is an explicit, conditional event. **Stalls follow a ladder**: first a nudge, then a fresh agent, and only then the owner. Parallel work is coordinated by a dependency DAG, scope-overlap scheduling and a serial merge queue (the `land` step). |
| **What does the owner's UI look like, and how does the agent's view differ?** | The owner **manages by exception**. The UI is one responsive web app. **Inbox** first: one-tap decisions, each with a summary of 280 characters or less, options and a default. **Board** second: tickets by step, coloured by health. **Detail** third: the gate checklist, evidence, the last checkpoint and a timeline, plus controls. A push goes out only when something blocks and has no default, or when health is red. Everything else goes into a digest. The **agent** never sees the board. It sees one imperative brief about one ticket and one step: what to do, what counts as done (the gate checklist), what the owner answered and what the previous holder left behind. |
| **What is the smallest version that beats a single agent?** | The route `red → green → review → accept`, with three gates. *Red*: at a pushed SHA the new tests load, run and fail, and each acceptance criterion is referenced by a test. *Green*: the same frozen tests pass at a descendant SHA in a clean checkout. *Review*: a non-author approves on that exact SHA. Add the brief, plus Stop and PreToolUse hooks, and keep a local log. Parallelism is not needed to win on quality. **To prove it**, run a paired A/B on tasks that have hidden acceptance tests (same model, same budget), with fault injection. See EVAL.md. |

The prototype in this repository implements the engine, the gates and verifiers, the CLI, the Claude Code hooks, the clock (expiry, nudges, escalation, dispatch, the merge queue), two stores (a JSONL file, a git ref) plus an HTTP client for remote agents and a phone-first owner UI (checked in headless Chromium), with 74 tests and a deterministic demo. Real Claude Code sessions (the `claude` CLI 2.1, haiku) ran tickets through it end to end, which confirmed the hook contract (EVAL.md §3.2). Section 10 lists what building and piloting it changed.

---

## 1. First principles

1. **Agents are unreliable narrators.** "Tests pass" is a claim. A green run of the frozen tests at commit `abc123`, in a clean checkout, is evidence. The harness accepts only evidence it can re-check, and it never lets the claimant be the checker.
2. **Context is a cache, not a store.** Any session can die at any moment: a crash, a context limit, a sandbox reaping, a human closing a laptop. Everything that matters has to be in durable state or in git *before* it matters. The context is rebuilt from state on demand. That rebuilt context is the *brief*.
3. **The process is a state machine the agent cannot leave.** The agent cannot "go to the next step". It can only ask (`hx done`), and the engine decides by evaluating the gate. Hooks make the forbidden moves fail fast. Gates make them impossible.
4. **Separate claim, verification and decision.** The agent claims, a verifier (CI or a clean checkout) verifies, and the gate (pure code) decides. Some steps need a human decision. That decision is a typed event from an authenticated owner, never a string an agent can type.
5. **Owner attention is the scarcest resource.** It is scarcer than tokens or compute. Every interrupt must be answerable from a phone in about ten seconds, which means a summary, options and a default. Anything the harness can retry, it retries before it asks.
6. **A fresh context is the cheapest fix for a stuck agent.** A long, confused context is the commonest cause of looping. Escalate in this order: nudge, then a fresh session given the brief and the checkpoint, then the owner.
7. **Make what lands exactly what was verified.** The merge queue lands the reviewed SHA, not the branch tip. Evidence is chained: the green SHA descends from the red SHA, and the review covers the green SHA.
8. **Determinism over cleverness.** The engine never reads the clock or the network. Time and verification results arrive as data in events. Replaying the log always gives the same state, and that is what makes audit, simulation and every recovery path possible.

---

## 2. Q1: How the harness hooks into the LLM

### 2.1 Outer loop and inner loop

```
        harness (outer loop)                         agent runtime (inner loop)
 ┌───────────────────────────────┐            ┌──────────────────────────────────┐
 │ tick: expire, nudge, escalate │  launch    │ Claude Code session (local/cloud) │
 │ dispatch ready steps ─────────┼──────────▶ │  SessionStart hook → hx brief     │
 │                               │            │  model ⇄ tools (Bash/Edit/…)      │
 │ engine: apply(state, event)   │ ◀──────────┼─ hx claim/checkpoint/submit/done  │
 │ gates over verified evidence  │   CLI/HTTP │  PreToolUse hook → guards         │
 │ event log (file/git/http)     │ ◀──────────┼─ PostToolUse hook → heartbeat     │
 │                               │            │  Stop hook → refuse early stop    │
 └───────────────────────────────┘            └──────────────────────────────────┘
```

**Owners of steps.** Every step has a role:

- **worker**: the main agent.
- **reviewer**: a *helper agent*, meaning a separate session with a narrower brief and narrower tools.
  Hooks deny it edits, commits and pushes, and the engine forbids it from having authored the ticket.
  The same pattern serves any other helper role, such as a retro writer or a researcher.
- **owner**: the human, who decides through the inbox and can also claim any agent step ("take over").
- **auto**: the clock, for example the merge queue.

Sub-agents that a session spawns *inside* its own turn loop (Claude Code's Task tool) are invisible to the
harness by design. They are part of the inner loop, and only the holder's evidence counts.

A **session** holds at most one **lease**: one step-run of one ticket. By default a step is worked by a fresh session. A session may continue to the next step when the process allows it (`red → green` by the same worker is fine), and must not when separation of duties forbids it (review). The harness never steers individual turns. It shapes what the model sees at the boundaries (start, compaction, notices) and polices what it is allowed to do.

### 2.2 Interfaces, and why each one exists

| Mechanism | Role | Why it is there |
|---|---|---|
| `hx` CLI | **The** interface: `claim`, `brief`, `checkpoint`, `submit`, `ask`, `done`, `release`, plus the owner and clock commands | Every agent with a shell can use it, and so can every hook, CI job and human. It is testable. Its output is plain text written for a model. |
| Claude Code hooks (`hx hook <event>`) | Enforcement, context injection and liveness | Hooks are the only mechanism that acts *without the model choosing to*. They inject the brief at SessionStart (startup, resume or compact). PreToolUse denies forbidden calls. Stop refuses to stop while a step is open. PostToolUse sends a throttled heartbeat and nags about checkpoints. SessionEnd releases the lease. |
| Skill (`SKILL.md`) | Protocol documentation for the model | It is cheap, portable and loaded on demand. It explains *why*, so the model cooperates instead of fighting the hooks. |
| MCP wrapper (optional) | The same commands as typed tools | Structured arguments help weaker models. It is not the primary interface, because MCP cannot inject context at session start or enforce anything. |
| Claude Code plugin (packaging; designed, not built) | Distribution | Bundles the hook config, the skill and the optional MCP server into one installable unit, so any repo or cloud sandbox gets the whole agent side with one install. The prototype ships the pieces as `examples/claude-settings.json` and `examples/skill/SKILL.md`. |
| Agent SDK or own loop | **Not** the primary runtime | It would re-implement tools, permissions and compaction, and would give up the cloud-sandbox product. The engine is runtime-agnostic, so an own loop could call the same library. |

**Hooks give feedback; gates give guarantees.** A hook sees a tool call before it runs and has to guess
what a shell command will do. A gate checks the result: the frozen blobs at a pushed SHA, a clean
checkout, a verified review. So hooks are written to be *conservative*. When in doubt they allow, and
they fail open when the store is unreachable. The real-model pilot showed why this matters. A first
version treated `2>/dev/null` as a write, and the reviewer's `git checkout <sha>` as a change to the
repository. That refused six harmless inspection commands in two sessions, and agents burned turns
working around them. Every refused command is now a regression test. The guarantee never depended on
the hook: a tampered test still fails the green gate.

### 2.3 What the model sees, turn by turn

| Moment | What is injected | Size |
|---|---|---|
| Session start (`startup`) | The system prompt and CLAUDE.md as usual, plus **the brief**: role, ticket, acceptance criteria, the current step and its instructions, the gate checklist with ticks, evidence so far (as pointers), the last checkpoint, owner answers, the branch to use, and the exact commands | measured 240–550 tokens (budget ≤ 1.5k) |
| Ordinary turns | Nothing extra. Tool outputs as usual. | 0 |
| A tool call while something changed | A one-line **notice**: an owner answer arrived, the criteria were edited, a nudge, "checkpoint overdue (30 calls)", "context large, consider checkpoint and release" | ~1 line |
| A forbidden tool call | A deny reason, for example "tests/test_x.py is frozen since red@a1b2c3; make the code pass the tests instead" | 1-3 lines |
| An attempt to stop with the step open | The Stop hook blocks with the unmet gate checks and the three legal exits (`done`, `ask`, `release`) | ~5 lines |
| After compaction (`compact`) | **The brief again**, plus "if your memory conflicts with the brief, the brief wins" | same as above |
| After a crash or handover | A new session, and a brief with a "previous holder went silent at T. Last checkpoint: … Commits after it: …" section | measured about 400 tokens |

### 2.4 How state survives context resets

There are three layers. The model is told that only the first two are real.

1. **Durable process state**, in the event log: the step, gate status, verified evidence, questions and answers, and checkpoints.
2. **Durable work state**, in git: commits pushed to the ticket branch. A submission is only valid for a SHA that exists on the shared remote, so "push before submit" is enforced. A crash can lose at most the unpushed edits since the last checkpoint.
3. **Ephemeral context**: whatever the model currently remembers.

`hx checkpoint "<done; next; risks>"` writes the soft state (intent, plan, gotchas). The PostToolUse hook nags after N tool calls without a checkpoint, and again when the transcript gets large. A **proactive handover** before compaction (`hx release --note`) is preferred to compaction itself, because a fresh session reading a clean brief does better than a session reading its own lossy summary.

---

## 3. Q2: The backend

### 3.1 Event log and fold

```
event  = {seq, ts, actor:{kind: agent|owner|system|verifier, id}, type, ticket, data}
state  = fold(apply, events)       # pure; no clock or I/O inside apply
apply(state, e) -> state'  or  raise Rejected(reason)
```

* `seq` and `ts` are assigned by the **store** at append time. Agent clocks are irrelevant.
* **Validate on append** (single writer or CAS store): the writer takes the lock, folds, applies the new event and appends it only if it is valid. The caller gets the rejection, such as a gate report, synchronously.
* **Validate on fold** (a transport with total order but no CAS, for example comments on an issue): any event may be appended. The fold skips invalid ones deterministically and records them as rejected. Every reader computes the same state.
* **Conditional events** close the races in which time plays a part. The clock's `expire` carries the `last_activity_seq` it observed. If the holder did anything after that, the expiry is rejected, so a live agent never loses its lease to a stale tick.
* The process definition is **embedded in `ticket.create`**. Replay is deterministic even after the templates change, and running tickets keep the process version they started with.

Stores and transports in the prototype:

| Store or transport | Concurrency | When to use it |
|---|---|---|
| `FileStore`: JSONL plus `flock` | serialised append under an exclusive lock | single host: local agents and the coordinator |
| `GitRefStore`: the log as `log.jsonl` in the commit a git ref points to | CAS through `git update-ref ref new old`, with retry. Against a remote, the same commit is pushed fast-forward-only; that part is designed, not built. | serverless; a mirror and backup of the coordinator's log in GitHub |
| `RemoteHx` (`hx/client.py`): the CLI talks to `hx serve` | the server is the single writer, behind whichever store it uses | agents in cloud sandboxes |
| comments or another log without CAS | validate-on-fold (tested in `test_validate_on_fold_matches_validate_on_append`) | designed only |

Heartbeats are ordinary events, **coalesced** to at most one per ⅓ of the lease TTL per holder, so about 12 per hour per active agent. That keeps liveness inside the deterministic fold, so the clock needs no side channel.

**Cost of the fold.** A CLI call folds the whole log. Measured: 26–44 ms for 1,758 events, and 50–90 ms end to end per hook call including Python start-up. Hooks run on every tool call, so a long-lived deployment should either have the coordinator answer from its in-memory state, or snapshot the folded state every N events. The prototype does neither.

**Session identity.** The dispatcher chooses the session id and starts the session with `HX_SESSION`, `HX_TICKET` and `HX_ROLE` set. Hooks and the CLI both prefer `HX_SESSION`, so they always agree. Without it, hooks use the hook input's `session_id` and write it to `.hx/local/session`, which the CLI reads.

### 3.2 Data model

```
Process   {name, version, first, steps:{id: StepDef}}
StepDef   {role: worker|reviewer|owner|auto, instructions, evidence:[kind], gate:[check],
           next, routes:{outcome: step}, max_visits, expect_min,
           approval: never|always|risk>=medium|risk>=high, skip_if_gate}
Ticket    {id, title, body, criteria:[{id:"AC1", text}], process (embedded copy),
           parent (group), children[], deps:[id], scope:[path prefix],
           risk: low|medium|high, priority, test_cmd, ci_cmd, branch,
           status: queued|open|paused|done|cancelled, step, run,
           visits{step:n}, extra_visits{step:n}, evidence[], history[], authors[],
           frozen{path: blob}, heads{red, candidate, merged}, approvals{step#visit},
           epoch, version, notices[], last_checkpoint,
           stats{claims, handovers, rejected_evidence, owner_decisions}}
Run       {step, visit, status: ready|active|waiting, role, holder, epoch, claim_seq,
           opened_ts, claimed_ts, last_activity_{ts,seq}, last_progress_ts, head,
           checkpoint{done,next,risks,ts,by}, nudges, handovers, releases, claims,
           crashed{holder,ts,why}, waiting_on[qid], notes[], dispatched{ts,launch,n},
           reserved (owner)}
Evidence  {id, step, visit, kind, payload, verified, verifier, report, by, epoch, ts}
Question  {id, ticket, step, visit, kind: agent|approval|escalation, reason, text,
           summary, options, default, deadline_ts, blocking, status, answer, notified_ts}
```

Separation of duties uses `authors`, the sessions that held worker steps. Reviewers must not be in it.

Events: `ticket.create · ticket.edit · ticket.pause · ticket.resume · ticket.cancel · system.pause · system.resume · system.config · claim · heartbeat · checkpoint · evidence · ask · answer · done · release · expire · nudge · revoke · override · land · dispatch · notify · escalate`.

### 3.3 Route model: the processes that ship with it

The **feature** process (the full lifecycle in the brief):

```
draft ──▶ design ──▶ red ──▶ green ──▶ review ──approve──▶ accept ──▶ land ──▶ retro ──▶ done
 (skip if    │ approval   (failing   (implement,  │  ▲  changes      │ changes   │ conflict
  criteria)  │ if risk≥med  tests)    tests frozen)│  └──────────────┘ to green   ▼
             └─ changes ─▶ design (visit+1)        └─ reject ─▶ design         rebase ──▶ land
```

| Step | Role | Gate (all must hold) | Evidence |
|---|---|---|---|
| draft | worker | `criteria`: at least one acceptance criterion; skipped when already satisfied | the ticket itself |
| design | worker | `doc:design` (the file at the SHA has the headings Approach, Test plan, Risks), plus `approval` when risk ≥ medium | `doc` |
| red | worker | `tests_red`: at the SHA the test files changed since the merge-base, they load and run, and at least one fails (an assertion, or an error raised by a stub of the code under test). Every AC id appears in them. They become frozen. | `tests_red` |
| green | worker | `tests_green`: the SHA descends from red, the frozen blobs are unchanged, `test_cmd` and `ci_cmd` pass in a clean checkout | `tests_green` |
| review | reviewer (≠ every author) | `review`: a verdict on the green SHA with a per-AC assessment. The outcome routes. | `review` |
| accept | owner | `approval`; auto-approved by policy when risk = low and review = approve | the owner's decision |
| land | auto (merge queue) | `merged`: the reviewed SHA merged onto main in a scratch checkout, `ci_cmd` passes on the merge, and main moves by CAS. Otherwise the route is `conflict` to `rebase`. | `land` |
| rebase | worker | `tests_green` again: merge `origin/main` into the branch (never rebase), frozen tests unchanged, green. Then back to `land`. | `tests_green` |
| retro | worker | `retro`: a note with `went_well`, `went_badly` and `change` | `retro` |

The **bugfix** process is `red → green → review → accept → land` (with `rebase` on conflict); **mvp** is the same route under the hx-0 name. The **chore** process is `work → review → land`, and its gate is `ci` (the suite passes at the SHA). The **group** process is `plan` (skipped if the children exist) `→ run` (auto, gate `children_done`) `→ retro`.

**Loop limits.** `max_visits` defaults to 3. Routing into a step that has reached its limit opens an *escalation* question ("review↔green has looped 3 times: [one more round] [owner takes over] [back to design] [cancel]") instead of looping again.

**Approval as a gate check.** When the only unmet checks are approvals, `done` does not fail. It creates the approval question, puts the run into `waiting` and releases the lease. When the owner answers, the step completes, or with `changes` it routes back. Workers never wait for humans while holding a lease.

### 3.4 Gates and evidence

* **Evidence points at immutable things**: SHAs, blob hashes and test reports. The verifier runs **in a clean checkout of the SHA on the shared remote** (in production, in CI), never in the agent's working directory. Uncommitted or unpushed work cannot count.
* **The frozen-test chain**: red freezes `{path: blob}` for the test files touched since the merge-base. Green requires the same blobs and ancestry from the red SHA, and review is pinned to the green SHA. Land merges that same SHA. A change to tests after red needs an owner decision (unfreeze), which is visible in the log.
* **"Broken red" is rejected.** A syntax error, an import failure at collection, or zero tests run is not a meaningful red. The agent is told to add a stub, so the tests load and run and then fail.
* **Coverage of the acceptance criteria is checked mechanically.** Every `ACn` id must appear in the frozen tests, as a test name or a comment. The reviewer checks that the mapping is honest. Each check is cheap, and together they are strong.
* **Separation of duties lives in the engine.** A reviewer must not be an author of the ticket. Owner-only steps need an owner actor. Overrides are owner-only and always carry a reason.
* **Trust.** Gates count evidence only with `verified=true` from a verifier actor. In local mode the CLI is the verifier (the agent is honest but fallible). In production the coordinator or CI is, and agent-side verification is only a preview.

### 3.5 Leases, liveness, stalls and handover

* `claim` sets `epoch += 1` (per ticket, monotonic). Every mutating call carries the epoch, and a stale epoch gets `LEASE_LOST`. The hooks check the local lease against the engine and **deny every non-read tool** to a zombie, so a session that lost its lease stops within one tool call.
* **Activity** means any accepted event from the holder, heartbeats included. **Progress** means a checkpoint, a piece of evidence, or a change of HEAD (reported in the heartbeat). They are different signals with different responses:

| Signal | Threshold (default) | Response |
|---|---|---|
| no activity | lease TTL of 15 min | `expire` (conditional), run → ready, `handovers+1`, and the brief flags the crash |
| activity without progress | 1.5 × `expect_min` | `nudge`: the hook delivers "checkpoint and decide: continue, ask or release" |
| still no progress after the nudge | + `expect_min` | `revoke`: run → ready, handover to a **fresh** session |
| handovers ≥ 3 on one run | n/a | escalation question to the owner, run → waiting |
| dispatched but not claimed | 10 min | re-dispatch; after 3 tries, escalate |
| a question past its deadline | per question | apply the default if one exists (only reversible questions get one), otherwise re-notify with backoff |

**Handover** carries everything except the dead context: the ticket, the step, the gate status, verified evidence, the last checkpoint (`done/next/risks`), the commits pushed since that checkpoint, owner answers, and the note "previous holder went silent". A graceful `release --note` gives the best handover. The Stop hook asks for one before it gives up, SessionEnd releases a held step, and after compaction the brief is re-injected (PreCompact only records that it happened).

### 3.6 Parallel coordination

* **Dependencies**: a ticket stays `queued` until its `deps` are done (landed). It opens automatically when they are.
* **Scope-overlap scheduling**: each ticket declares path prefixes (refined by the design step). The dispatcher does not start a code-changing step whose scope overlaps that of another ticket that is in flight and not yet landed. This is cheap and prevents most conflicts. An empty scope means unconstrained, plus a warning.
* **WIP and priority**: global capacity and per-group WIP limits. Steps of tickets already in progress come before new tickets, so work in progress is finished before more is started.
* **Serial merge queue**: `land` runs one ticket at a time. It merges the reviewed SHA into current main in a scratch checkout, runs `ci_cmd` on the result, and moves main by CAS. A conflict or red build routes to a `rebase` step, with the conflicting files in the brief. "Merge main into your branch; never rebase" keeps the evidence chain valid.

### 3.7 Git and CI integration

| Concept | Local prototype | GitHub production |
|---|---|---|
| Shared remote | a bare repo `origin.git` | the GitHub repo |
| Ticket branch | `hx/<ticket>` pushed to origin | the same, with a draft PR opened at red and marked ready at review |
| Verification | `git archive <sha>` from origin into a scratch directory, then run `test_cmd` and `ci_cmd` | CI check-runs on the SHA; the coordinator reads the results as evidence |
| Review evidence | `hx submit review --verdict … --ac AC1=ok …` | the same, mirrored as a PR review comment |
| Acceptance | owner taps Accept in the hx UI | the hx UI, or a GitHub PR approval from the owner's account (separate identity) |
| Land | `hx tick` merge queue, with CAS on `refs/heads/main` | GitHub merge queue or auto-merge with required checks; the merge event is the evidence |

If the platform only lets a session push to its own assigned branch, the coordinator records `epoch → session branch` and **promotes** a gated SHA to `hx/<ticket>` after verification. The branch name becomes the fencing token: zombie pushes land on a branch nobody promotes.

### 3.8 Deployment topology (recommendation)

* **Tier 0 (proves the value, single machine).** FileStore, with workers as local Claude Code processes in clones or worktrees, launched by `hx tick --dispatch` or by hand. The owner opens `hx serve` over the LAN or a tailnet.
* **Tier 1 (cloud agents, recommended).** One small always-on **coordinator** runs `hx serve`: the API, the UI, a tick every 60 s, and a single writer. It mirrors the log to the git ref `hx/state` for durability and audit. Sandboxes reach it over HTTPS with per-session tokens issued at dispatch. GitHub stays the code and CI plane, and the coordinator is the process plane. Owner pushes go out via ntfy, a webhook or email.
* **Tier 1′ (no always-on host).** A GitRefStore on `hx/state`, with GitHub Actions or a scheduled routine running `hx tick` as the clock and dispatcher. Agents write with CAS on push where allowed, or through the coordinator's promotion path. Latency is minutes instead of seconds, and owner authentication must come from a channel agents cannot use (a separate GitHub identity, or signed UI actions).

I recommend Tier 1, because a single writer is the simplest correct concurrency model and its failure mode is benign. If the coordinator is down, hooks fail open, agents keep coding, and leases cannot expire because the clock is down too. GitHub-as-database was considered and rejected (section 8).

### 3.9 Failure handling

| Failure | Detection | Automatic response | Owner involvement |
|---|---|---|---|
| Agent crash or sandbox death | no activity for the TTL | `expire` → ready, then a new session with a crash-flagged brief | only after 3 handovers |
| Context exhaustion | transcript size or PreCompact | notice "checkpoint and release"; after compaction the brief is re-injected | none |
| Premature stop | Stop hook | block (at most 2 times) with the gate report, then auto-release as a handover | none |
| False "done" | gate at `hx done` | rejected with the failing checks and hints | none |
| Test tampering | PreToolUse deny on frozen paths, plus a blob check in the green gate | denied or rejected | counted in the retro |
| Broken red (tests do not load) | the verifier classifies it as `broken` | rejected: "add stubs so they load, run and fail" | none |
| Spinning (alive, no progress) | progress clock | nudge, then revoke and hand to a fresh agent, then escalate | after the ladder |
| Zombie (lost its lease) | epoch mismatch | hooks deny tools and writes are rejected | none |
| Waiting on the owner | a blocking question | lease released, no compute burned; push only if urgent | one tap |
| Owner silent | deadline passed | apply the default if reversible, otherwise re-notify with backoff | digest |
| Review loop never converges | `max_visits` | escalation card | one tap |
| Merge conflict, or main red after the merge | merge queue | route back to green with the conflict list | none |
| Gate impossible (bad `test_cmd`, missing tooling) | repeated rejections or handovers | escalate: "gate cannot pass: …" | one decision |
| Store or coordinator unreachable | an hx call fails | hooks fail open, the CLI reports it, and agents keep working | the phone UI cannot load, which is itself the alarm |
| Double claim | serialised append | the second claim is rejected and it picks other work | none |

---

## 4. Q3: The owner's UI, and how the agent's view differs

### 4.1 The attention budget

The target is **at most one owner interaction per low-risk ticket (often zero), and two for medium or high risk** (design approval and acceptance), plus genuine questions. The harness spends retries, fresh sessions and defaults before it spends the owner.

### 4.2 Surfaces (one responsive web app plus push)

1. **Push**, at most one per 15 minutes outside urgent events. Push only (a) a blocking question with no default, or one whose deadline is under an hour, and (b) a ticket going red (an escalation). Each push deep-links to its card.
2. **Inbox**, the first screen on the phone. Each card has a ticket, a kind, a summary of 280 characters or less, large option buttons, an optional text field and the default with its deadline. An approval card shows the AC checklist with the reviewer's per-AC verdicts, the diff stat, the test summary and a risk badge, with [Accept] [Changes…] [Open PR]. An escalation card shows why it escalated (the ladder history) with [Retry fresh] [Take over] [Back to design] [Cancel].
3. **Board**: groups, then tickets. One row per ticket: a health dot, ID, title, a step chip, the holder and its age, and a *why* line ("waiting: owner approval", "stalled: 2 handovers", "queued: deps T-1"). A kanban by step for desktop is designed but not built; the prototype shows the grouped list next to the detail pane.
4. **Detail**: the gate checklist (live), the last checkpoint, evidence, the agent's current brief ("what the holder sees"), the timeline, and controls. The prototype has pause, resume, reassign (revoke), override with a reason, and cancel; take over, edit criteria and priority exist in the CLI and API.
5. **Digest**: a text summary since the last digest (landed, waiting, stalled, cost), for a daily push or for reading on the bus.
6. **Global kill switch**: pause everything. Hooks then deny all tools except reads and hx calls.

**Health** is green (progressing, or ready with capacity), amber (waiting on the owner, nudged, or no capacity for a long time) or red (escalated or stalled past the ladder). It is grey for queued, done and cancelled.

### 4.3 Phone and desktop

The app and the data are the same. The phone puts the inbox first, then the board as a list, and drills into detail. The desktop shows three panes (inbox, board as kanban, detail with diffs and links). Nothing on the phone requires reading a diff. If a decision does need the diff, the summary says so and links the PR.

### 4.4 Agent view and owner view

| | Agent | Owner |
|---|---|---|
| Scope | one ticket, one step | every ticket and group |
| Form | an imperative brief: "do X; done when [checklist]" | a declarative board: "state; needs you: Z" |
| Freshness | at session start, after compaction, plus notices | live (the prototype polls every 5 s) |
| History | the last checkpoint and pointers to evidence | the full timeline |
| Controls | `claim / checkpoint / submit / ask / done / release` | answer, approve, pause, cancel, reassign, take over, override, edit |
| Cannot | approve, override, edit frozen tests, touch other tickets | (nothing is hidden) |

---

## 5. Q4: The smallest version that beats a single agent, and how to prove it

**The minimum (hx-0)** is the `mvp` process in the prototype, with no server:

1. A ticket: title, ACs and `test_cmd`.
2. The route `red → green → review → accept` (plus `land`).
3. Gates: red (it loads, runs and fails, the ACs are referenced, it is frozen), green (frozen and passing in a clean checkout, descending from red), and review (by a non-author, on the green SHA).
4. Hooks: SessionStart brief, Stop guard, PreToolUse frozen-file guard.
5. A local JSONL log and `hx status`.

**Why it should win.** A single agent's dominant failures on multi-step work each have a matching mechanism:

- **Premature or false "done".** The Stop guard plus the green gate.
- **Tests that do not test the requirement, or tests edited to pass.** Red first, AC references, freezing and review.
- **Losing the thread after a reset.** The brief.
- **Nobody checking.** A fresh-context reviewer.

These are quality gains, so they show up without any parallelism. Parallelism, handover and the owner inbox add throughput and robustness on top.

**Proof.** Run a paired A/B on N ≥ 40 tasks with owner-written **hidden** acceptance tests. Use the same model, the same token and time budget, and three seeds. The primary metric is hidden-test pass rate (McNemar, paired). Secondary metrics are the false-done rate, the regression rate on main, cost per accepted ticket, owner minutes, and the recovery rate under injected crashes. Ablations remove one mechanism at a time. EVAL.md has the protocol and the measurements that could be run in this sandbox: mechanism coverage, a real-model pilot, a Monte Carlo on the real engine, and overhead.

---

## 6. Loops

| Loop | Period | Driver | What it does |
|---|---|---|---|
| Inner (turns) | seconds | Claude Code | model ⇄ tools; hooks add the brief, notices and guards |
| Step | minutes to hours | session | claim → work → checkpoint* → submit → done or release |
| Ticket | hours to days | engine | routes by outcome, loops back on changes, enforces loop limits |
| Clock | 60 s | `hx tick` | expire, nudge, revoke, escalate, deadlines, open deps, land queue, dispatch, notify |
| Owner | minutes to hours | phone | push or digest → decision → engine |
| Improvement | per group or week | retro | metrics plus retros → proposed process changes → the owner approves a new process version |

---

## 7. Security and control

* Owner-only events (answer, override, pause, cancel, edit) need the owner actor. In server mode that means an owner token. Agents should get per-session tokens bound to their lease; the prototype uses one shared agent token. Agent-written text (checkpoints, findings) is untrusted input to the owner UI, which escapes everything.
* Agents cannot write frozen files, approve, or touch other tickets' leases. Hooks deny these and the engine rejects them.
* There are no secrets in the log. Evidence is pointers and reports.
* The kill switch is one event, `system.pause`. Hooks consult it on every tool call.

---

## 8. Rejected trade-offs

1. **The harness owns the agent loop (Agent SDK), and Claude Code is not used.** It would give total control of the context, but it rebuilds tools, permissions, compaction and the sandbox product. Hooks give about 90% of the control at about 5% of the cost. The engine is kept runtime-agnostic so this stays possible.
2. **MCP as the only integration.** MCP cannot inject the brief at start or after compaction, cannot block a stop, and cannot deny a file edit. It is kept as an optional wrapper.
3. **GitHub issues, labels and comments as the source of truth.** There are no atomic transitions, the schema drifts, comments are noisy, there are rate limits, and Actions cron latency is high. Worst, agents and the owner often share one GitHub identity, so "owner approved" cannot be authenticated. Comments remain usable as a *transport* through validate-on-fold, and GitHub remains the code, CI and notification plane.
4. **A state file on main, changed through PRs.** Every transition would cost a PR and a CI run, and all writers would conflict on one file.
5. **One long-lived agent per ticket across all steps.** Context rot, no independent review, and the cost of a crash grows with time. Fresh sessions plus the brief are cheaper.
6. **Agent self-reports as evidence.** Rejected outright. Evidence must be reproducible from a commit by someone else.
7. **Heartbeat-only stall detection.** "Alive" is not "progressing". Activity and progress are tracked separately.
8. **Human approval at every step.** It burns the attention budget. Approvals are driven by a risk policy, with auto-accept for low risk plus a review plus CI.
9. **File locks between parallel agents.** They are too coarse and deadlock-prone. Scope scheduling, a serial merge queue and a rebase route are used instead.
10. **A general workflow engine (Temporal, Airflow, Step Functions).** Heavy to operate, not git-native, and a one-person team cannot run it. The needed semantics (log, fold, leases, clock) fit in a small library.
11. **Long-term or vector memory for agents.** Checkpoints, evidence, git and retros are enough, and retros change *processes*, not hidden memories.
12. **A push for every event.** It causes notification fatigue, after which the owner ignores everything. Inbox, digest and urgent-only push instead.
13. **Rebase-based branch hygiene.** It breaks the red → green ancestry chain. The rule is merge-from-main.
14. **Implicit lease expiry computed from `now` inside the fold.** That would make replay depend on the clock. Expiry is an explicit, conditional event.

---

## 9. Open questions and known limitations

* Weak tests that still reference every AC id get past the mechanical checks. The defence is the reviewer plus optional owner-held hidden tests for high-risk tickets. Mutation testing would be a stronger gate, at a cost.
* Frozen tests that main legitimately changes while a ticket is in flight need an owner unfreeze. That is rare, but it is friction.
* Scope declarations can be wrong. The merge queue catches the consequences late but safely.
* Local mode trusts the CLI as verifier, which is fine for honest-but-fallible agents. Adversarial agents need CI as the verifier (Tier 1).
* Proactive handover thresholds (transcript bytes as a proxy for tokens) are heuristics to tune from data.
* The `rebase` step lands a re-merged candidate without a second review. The merge commit can, in principle, hide a bad conflict resolution. CI on the merge result is the only guard. A risk policy could route `rebase` to review for medium and high risk.
* The prototype has no notion of cost budgets per step. Token and dollar caps live in the launcher (for example `--max-budget-usd`), and the engine only sees their consequences: handovers and escalations.

---

## 10. What building and piloting it changed

The design above was written before any code. These are the points where the prototype, the demo or
the real-model pilot proved it wrong or incomplete. They have been folded back into the sections above.

1. **"Fail on assertions" was the wrong wording for red.** A stub that raises `NotImplementedError` makes
   tests *error* rather than *fail*, and that is a perfectly good red. The real distinction is between
   tests that *load, run and fail* and tests that *do not load or never run*, which are "broken". §3.4
   and the verifier now say exactly that.
2. **Hook heuristics produced false positives against real agents** (§2.2). This was the most important
   pilot finding. It is cheap to fix, but only visible with real transcripts, so the hook false-positive
   rate is now a standing metric (EVAL §5).
3. **The dispatcher can fail silently.** In a draft of the demo, a launched session never started. After
   three unclaimed dispatches the clock escalated "launcher or environment broken", which is a failure
   mode the original failure table had only implicitly. It is now an explicit row, with a test.
4. **Incomplete scope declarations are normal.** Both demo designs forgot the shared
   `textkit/__init__.py`. Scope scheduling let them run in parallel, and the merge queue caught the
   conflict, so main never broke. Both retros proposed a template change ("list shared files under
   Scope"). That is the improvement loop working as intended: the system does not promise perfect
   scheduling, it promises that mistakes stay cheap and turn into process changes.
5. **The group retro needs data, not prose.** The group's brief now lists each child's claims,
   handovers, rejected evidence, review rounds, owner decisions and retro proposal. These come from
   per-ticket `stats` kept by the engine, so the retro agent proposes process changes from numbers.
6. **The brief is small.** The measured size is 240–550 tokens against a budget of 1.5k. That leaves
   room to add the diff stat for reviewers (done) and, later, links to relevant earlier tickets.
7. **The per-session overhead is real and shows up on easy tickets.** On small, well-specified tickets,
   real haiku sessions solved everything in both conditions, and hx cost about 1.8× as much (EVAL §3.2).
   That is the "perfect agent" corner of the model. Practical consequence: route small, low-risk tickets
   through `chore` or `mvp` with `--continue` (one session runs red and green), and keep the full
   `feature` process for tickets long enough to have failures worth catching.
8. **Handover works with a real model, and "push before submit" earns its keep.** In the fault-injected
   pilot, a red session committed its tests and ran `hx submit` without pushing. The verifier refused,
   because the commit was not on the shared remote. Then the session hit its turn cap. SessionEnd released
   the lease. The next session's brief opened with "HANDOVER: previous holder … session ended", and that
   session inspected git, found the unpushed commit, pushed, submitted and passed the gate in 5 turns
   (EVAL §3.2). Without the remote-only evidence rule, a sandbox death at that moment would have lost the
   step's work while the log claimed it existed.
9. **Reviews were not resumable, and successors redid finished work.** Under forced interruptions, no cut
   reviewer checkpointed, so every successor started its review over. One successor re-reviewed even though
   its predecessor had already submitted a verified review, which meant the gate was satisfied. The brief
   now says so up front ("THE GATE IS ALREADY SATISFIED … run `hx done` now"). After any involuntary
   handover it also advises small increments (commit, push and checkpoint after each sub-step; reviewers
   checkpoint their findings so far). A before/after pilot could not yet attribute an effect to this
   change (EVAL §3.2). The general point: *evidence survives its holder*. A step's gate counts verified
   evidence regardless of which session produced it, and the brief must make that visible, or agents
   redo work.

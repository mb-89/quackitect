# EVAL: does hx beat a single agent, and how would we know?

## 1. The claim and what would falsify it

**Claim.** On multi-step tickets, hx produces more *correct, landed* work per unit of owner attention than
a single agent with the same model and budget, at a comparable cost per correct ticket. The advantage
should grow with:

- ticket length (more steps, more context resets)
- the agents' base rates of false "done", test tampering, missed requirements, crashes and spins

**Falsified if** a paired A/B on realistic tickets (§2) shows no gain in hidden-test pass rate, or an
owner-attention gain bought with more than about 1.5× cost per correct ticket. It is also falsified if
the gain disappears when only the brief is kept (that is, if the gates, review and handover add nothing).
§3.3 states the model's own falsifier: with agents that never fail, hx is about 1.4× more expensive for
the same result.

## 2. The protocol (the measurement that matters)

**Task suite.** Use 40–100 tickets from the owner's real backlog, or curated to look like it. Most should
be multi-step (3–8 hours for a human). The suite includes:

- groups with dependencies
- tickets that touch shared files, so that conflicts happen
- some medium- and high-risk tickets

Each ticket has acceptance criteria visible to the agents and **hidden acceptance tests** held by the
owner. Hidden tests may only test what the criteria state (§3.2 shows how this pilot checked that, with
reference implementations).

**Conditions.** All conditions use the same model, the same total budget per ticket, the same sandbox
image, the same ticket text and the same landing path (a PR with CI).

| Id | Condition |
|---|---|
| S | **Single agent.** One Claude Code session per ticket, with a strong prompt (TDD, full suite, push a PR). It is restarted with "continue" if it dies, up to the same budget. |
| H | **hx.** The full process (or `mvp` for small tickets), with dispatcher, hooks and gates. |
| H−rev | hx without the review step (attributes the reviewer). |
| H−gate | hx where gates always pass (attributes verification). |
| H−brief | hx where hooks inject nothing and the agent must run `hx brief` (attributes context injection). |
| S+notes | A single agent told to keep its own NOTES.md (a cheap alternative to checkpoints). |

**Fault injection.** This applies to every condition, with identical seeds. Kill a session at a random
tool call with probability p (for example, 0.15 per session), and force one compaction mid-step on
long steps. A killed S run restarts from the repo, and a killed H run hands over.

**Metrics.** These are logged automatically. The hx event log already records the owner's actions.

| Metric | Definition |
|---|---|
| **Primary** | Hidden-test pass rate of landed tickets |
| False done | The ticket was declared done (S) or landed (H), but the hidden tests fail |
| Regressions | main red after a landing, and the hidden tests of *earlier* tickets failing after later ones land |
| Cost | $ and tokens per ticket and per *correct* ticket; wall-clock time to landed |
| Owner attention | Number of interactions, and seconds spent (measured in the UI), per ticket |
| Recovery | Share of fault-injected tickets that still land correctly; minutes from a kill to resumed progress |
| Mechanisms (H only) | Gate rejections, hook denials (and the share that were false positives, judged by hand on a sample), review rounds, handovers, escalations |

**Statistics.** Pair the conditions per ticket and use McNemar's test for pass/fail. Use a
cluster-bootstrap over tickets for cost and attention. With 3 seeds per ticket, cluster by ticket. Power
(α = 0.05 two-sided, power 0.8, computed in §3.5):

| Single agent | hx | Paired tickets needed |
|---|---|---|
| 0.70 | 0.95 | ~38 |
| 0.75 | 0.95 | ~52 |
| 0.75 | 0.90 | ~102 |
| 0.85 | 0.95 | ~143 |
| 0.90 | 0.95 | ~437 |

A 40-ticket suite only detects large effects. That is acceptable for a go/no-go decision, but not for
fine-tuning.

**Threats to validity.**

- Hidden tests that encode unstated expectations, which favours whichever condition asks more questions.
  Fix: hidden tests may only test the stated criteria, and a reference solution must pass them.
- Prompt quality differences. Fix: S gets the same ticket text plus the strongest single-agent prompt we
  can write, reviewed by someone who does not want hx to win.
- Budget parity. Fix: the same dollar cap per ticket, and report the cost curves too.
- Model drift between runs. Fix: interleave conditions over time.
- Owner effort measured in clicks rather than time. Fix: the UI timestamps card open and answer.

## 3. What was measured in this sandbox

### 3.1 Mechanism coverage (deterministic, real code)

Each single-agent failure mode below has a test in which a scripted agent commits the failure against
the real engine, hooks and verifiers. The "without hx" column says what happens with a bare agent and a
PR with CI.

| Failure mode | Without hx | With hx (test that proves it) |
|---|---|---|
| Claims done with failing tests | CI is red; the owner must notice and re-prompt | Gate refuses `done`, exit 2 with the checklist (`test_gate_rejects_done_without_evidence…`, demo §2) |
| Edits tests to pass | CI goes green with weakened tests | PreToolUse denies the edit, and the green gate rejects changed frozen blobs (`test_green_rejects_tampered_tests`, `test_frozen_tests_and_git_guards`) |
| Tests that do not test anything yet | Nobody checks that tests failed first | Red must load, run and fail, and reference every AC (`test_red_*`) |
| Session crashes mid-step | Work since the last push is lost; the owner restarts it, with no notes | Lease expires (conditional on no newer activity), and a fresh session gets the checkpoint and the commits since it (`test_expired_lease_fences_the_zombie`, demo §5–6) |
| Crashed session comes back (zombie) | Two agents edit one branch | Epoch fencing rejects its writes, and hooks deny its tools (`test_zombie_is_stopped_but_may_read`, demo §6) |
| Spins without progress | Burns budget until a human looks | Nudge, then revoke to a fresh session, then escalate (`test_spin_gets_nudged_then_revoked_then_escalated`) |
| Stops early ("I'm done") | The session ends; the owner finds out later | Stop hook refuses twice with the unmet gate, then hands over (`test_stop_is_refused_twice_then_hands_over`, demo §10) |
| Review loop never converges | n/a | Escalation card after `max_visits` (`test_review_changes_loop_hits_limit_and_escalates`) |
| Merge conflict between parallel tickets | Discovered at merge time by the owner | Merge queue refuses and routes to `rebase`, and main never breaks (`test_land_conflict_reports_files`, demo §7–8) |
| Waiting for the owner | The agent idles or guesses | Lease released, step waits, push batched; a fresh session resumes with the answer (`test_blocking_ask_releases…`, demo §9) |
| Dispatcher or launcher broken | Silent | Escalates after 3 unclaimed dispatches (`test_dispatch_failures_escalate`; it happened for real in a first draft of the demo) |

### 3.2 Real-model pilot (Claude Code CLI 2.1, haiku, print mode)

`eval/pilot.py` runs real `claude -p` sessions under a dollar cap: one session per ticket for S, and the
`mvp` route (red → green → review → accept → land) for H. The hooks are installed through
`.claude/settings.json`. Hidden tests score the result.

**Hook contract confirmed on the real binary.**

- SessionStart `additionalContext` was delivered (about 1.8–2.2k characters).
- The model acted on the brief without any other instructions.
- PreToolUse `deny` was honored, and the reason was shown to the model as `PreToolUse:Bash hook error: <reason>`.
- Every session ended through `hx done`, and every gate verified pushed SHAs.

**Bugs the pilot found that 70 unit tests had not.** The first hook version denied six read-only
commands (`2>/dev/null` read as a write; a reviewer's `git checkout <sha>` read as a change). Both are
fixed and are now regression tests (§DESIGN 2.2).

PILOT_RESULTS_PLACEHOLDER

### 3.3 Monte Carlo on the real engine (`eval/sim.py`)

The agents are simulated and the harness is real: engine, gates, leases, expiry, nudges, escalations and
merge queue. Every hx run is also checked for invariants:

- one holder per active run
- leases match runs
- no step passed without verified evidence
- epochs count claims exactly
- replaying the log equals the live state

All of 1,000 tickets (plus 1,750 in the sweeps) pass. This makes the simulation a randomized
fault-injection test of the engine as well as a model.

**Assumptions** (not measurements; change them in `DEFAULTS`):

| Parameter | Value |
|---|---|
| Crash per session | 0.08 |
| Spin | 0.05 |
| First implementation fails the visible tests | 0.5 |
| Fix succeeds per attempt | 0.7 |
| False "done" at a failing point | 0.25 |
| Tampering at a failing point | 0.10 |
| Missed requirement | 0.25 |
| Own tests miss it: single agent / hx | 0.6 / 0.35 |
| Restart without notes introduces a miss | 0.15 |
| Reviewer catches a hidden miss | 0.6 |
| Owner skimming catches it | 0.3 |
| Medium-risk share | 0.3 |

The baseline is deliberately strong: a PR with CI catches false "done" with failing visible tests, the
owner restarts dead or spinning sessions, and both conditions use the same acceptance policy.

**Default assumptions, 1,000 tickets per condition.** Seed 1, with seed 2 in brackets.

| Metric | Single agent | hx |
|---|---|---|
| Done and correct (hidden) | 72.8% [75.9%] | **96.1%** [95.6%] |
| Done but wrong ("false done") | 24.5% [21.5%] | 3.9% [4.4%] |
| Agent minutes per ticket | 146 [136] | 175 [173] |
| Agent minutes per *correct* ticket | 200 [180] | 182 [181] |
| Wall-clock hours per ticket | 3.5 [3.3] | 3.1 [3.0] |
| Owner interactions per ticket | 1.08 [1.01] | **0.63** [0.60] |
| Sessions per ticket | 1.8 | 6.0 |

**Sensitivity**, as the done-and-correct rate, with agent minutes per correct ticket after the slash:

| Scenario | Single agent | hx |
|---|---|---|
| Perfect agents (all failure rates 0) | 100% / 80 | 100% / **110** |
| Failure rates ×0.5 | 91.6% / 123 | 98.8% / 145 |
| Failure rates ×1.5 | 58.8% / 311 | 96.0% / 196 |
| No false done, no tampering | 86.8% / 147 | 97.6% / 181 |
| Crash-heavy (p_crash 0.3) | 59.6% / 268 | 97.2% / 217 |
| Weak reviewer (catches 20%) | 75.2% / 204 | 94.4% / 180 |
| hx tests as weak as the single agent's | 75.2% / 204 | 94.8% / 191 |

How to read it:

- **hx converts silent failures into time.** False "done", tampering, crashes and spins become retries and
  handovers that cost minutes but not correctness.
- **The cost per correct ticket breaks even** at roughly today's assumed failure rates. hx wins clearly when
  agents fail more, and loses (about 1.4×) when they do not fail at all.
- **The owner gains in every scenario with failures.** hx asks the owner only for medium-risk approvals and
  escalations. The single agent's owner restarts dead sessions and re-prompts red PRs.
- **No single mechanism carries the result.** Weakening the reviewer or the red-first tests costs hx 1–2
  points.

### 3.4 Overhead (`eval/overhead.py`, real numbers)

Measured on this sandbox (Python 3.11):

| Log size (events) | Fold | `hx brief` | `hook pre-tool` | `hook post-tool` |
|---|---|---|---|---|
| 9 | 0.3 ms | 47 ms | 53 ms | 52 ms |
| 345 | 4 ms | 55 ms | 62 ms | 57 ms |
| 1,758 | 26 ms | 83 ms | 87 ms | 88 ms |

These are medians and include Python start-up.

- **Per tool call:** the agent pays about 0.1–0.18 s of hook time (pre- and post-tool). That is small
  next to model latency, but it grows with the log because every CLI call folds the whole log. A
  production deployment answers hooks from the coordinator's in-memory state, or adds snapshots.
- **Brief:** 240 tokens for an active green step. Demo briefs run 360–410 tokens, and real pilot
  SessionStart contexts were about 440–540 tokens. That is far below the 1.5k budget in DESIGN §2.3.
- **Stores:** FileStore appends about 1,970 events/s (0.5 ms each, including validation). GitRefStore
  appends about 62 events/s (16 ms, one commit each). Both are orders of magnitude above the need, which
  is around 12 heartbeats per agent-hour plus a handful of transitions.
- **Events:** the demo's group of 3 tickets plus 1 group produced 94 events (claims 21, evidence 21,
  done 19, dispatch 15, land 4, …), so about 25 events per ticket.

### 3.5 Power calculation

The sample sizes in §2 come from the standard paired-proportions (McNemar) approximation. Discordant
cells are taken as p10 = p_H(1−p_S) and p01 = p_S(1−p_H), and
n = (z_{α/2}·√(p10+p01) + z_β·√(p10+p01−(p10−p01)²))² / (p10−p01)².

## 4. Reading the results honestly

READING_PLACEHOLDER

## 5. Next measurements, in order

1. **Run the §2 protocol on 40 real tickets** with the owner's usual model, and fault injection on.
   That is the decision-grade measurement this sandbox cannot provide.
2. **Ablations H−rev, H−gate and H−brief**, to find out which mechanism earns its cost. The model
   predicts the reviewer and the frozen-test gate matter most, and the brief matters most under
   compaction.
3. **Owner-attention timing** from the UI (card shown → answered), against the S owner's time spent on
   re-prompting and PR review.
4. **Hook false-positive rate** on real transcripts. Every denial is logged, so a weekly sample can be
   judged by hand. Target under 1% of tool calls.

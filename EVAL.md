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

**Decision rule, fixed before running.** Adopt hx as the default for a class of tickets if, on that
class:

- the hidden-test pass rate improves by at least 10 points (McNemar p < 0.05), **or** owner interactions
  per landed ticket fall by at least 30% at an equal pass rate;
- **and** the cost per *correct* ticket is at most 1.5× the single agent's.

Report the result per ticket-length bucket. The pilot below and the model in §3.3 both predict a
*routing* answer rather than a global one: send short, well-specified tickets to a single agent (or the
cheap `mvp` / `chore` routes), and long or risky tickets to the full process.

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

**A/B on 7 small tickets, without faults.** Each ticket has 4 acceptance criteria. Every hidden-test
file was first validated against an independent reference implementation, so all of them are
satisfiable. One borderline hidden case that the criteria do not state was removed before the runs.

| Ticket | Single agent: hidden | $ | s | hx-0: hidden | $ | s | Sessions | Review rounds |
|---|---|---|---|---|---|---|---|---|
| parse_duration | 4/4 | 0.012 | 21 | 4/4 | 0.015 | 49 | 3 | 1 |
| wrap | 4/4 | 0.009 | 34 | 4/4 | 0.020 | 66 | 3 | 1 |
| roman | 4/4 | 0.007 | 23 | 4/4 | 0.016 | 55 | 3 | 1 |
| intervals | 3/3 | 0.007 | 28 | 3/3 | 0.014 | 46 | 3 | 1 |
| csv_split | 4/4 | 0.007 | 22 | 4/4 | 0.016 | 51 | 3 | 1 |
| TTLCache | 6/6 | 0.010 | 34 | 6/6 | 0.018 | 55 | 3 | 1 |
| semver | 4/4 | 0.008 | 26 | 4/4 | 0.033 | 102 | 5 | **2** |
| **Total** | **7/7** | **0.060** | 188 | **7/7** | **0.131** (2.2×) | 424 (2.3×) | 23 | 8 |

What this shows:

- **No quality difference on small, well-specified tickets.** The model solves them alone. This is the
  "perfect agent" corner of §3.3, and there hx is pure overhead: 2.2× the dollars and 2.3× the wall
  clock.
- **The overhead is per-session orientation.** The single agent used 8–9 turns per ticket. hx used
  20–27 turns across three fresh sessions, each re-reading the repo, but each turn is cheaper because the
  context is small. So 3× the turns cost 2.2× the dollars.
- **The review gate caught a real defect beyond the acceptance tests.** On semver, hx's worker anchored
  its regex with `$`, which in Python accepts a trailing newline, so `semver_compare("1.0.0\n", ...)`
  silently passed invalid input. The fresh reviewer found it, routed the ticket back to green with the
  finding, and the second green fixed it (`\Z`) before landing. The single agent's own implementation did
  not have this bug. So this is evidence that the mechanism works, not that hx beat the single agent.
- **No gate rejections, tampering or false "done"** happened in 23 sessions of this model on these tickets.
  The failure modes hx exists for did not occur at this size, which is the honest finding.

**Fault-injected variant: every session is cut at 5 turns**, below the 8–9 a single agent needs for a whole
ticket. Both conditions get the same cap. A cut single agent is restarted in the same working directory
with "continue" (up to 4 restarts). A cut hx session is handed over: SessionEnd releases the lease, and the
next session for the same step continues in the same directory with a fresh brief. Files survive in both
conditions, so what is compared is the handover itself, not the disk.

| Ticket | Single agent: hidden | Sessions | $ | hx-0: hidden | Sessions (cut) | $ | Involuntary handovers | Owner escalations |
|---|---|---|---|---|---|---|---|---|
| parse_duration | 4/4 | 2 | 0.008 | 4/4 | 4 (1) | 0.018 | 1 | 0 |
| TTLCache | 6/6 | 2 | 0.011 | 6/6 | 6 (4) | 0.028 | 3 | 0 |
| semver | 4/4 | 3 | 0.016 | 4/4 | 9 (8) | 0.048 | 6 | 1 |
| **Total** | **3/3** | 7 | **0.035** | **3/3** | 19 (13 cut) | **0.093** (2.7×) | 10 | 1 |

A cut session that had already passed its step before the cut holds no lease, so it releases nothing.
That is why cuts (13) exceed involuntary handovers (10).

What this shows:

- **Handover works with a real model.** Every cut hx session was continued by its successor, and all three
  tickets landed with the hidden tests green. The cleanest trace is in DESIGN §10.8: an unpushed commit was
  refused as evidence, the session was cut, and the next session read "HANDOVER: … session ended", pushed,
  submitted and passed.
- **The stall ladder fired as designed.** After 3 involuntary handovers on semver's review step, the clock
  escalated to the owner. The driver answered "retry", which in production is one tap.
- **Under tight caps, hx's per-session orientation hurts.** It needed 19 sessions against 7. The single
  agent's "continue in the same directory" is a good recovery strategy *when the repo holds all the state*,
  which it does for one-file tickets.
- **Two design gaps, found by this run and fixed after it:**
  1. Reviews were not resumable. No cut reviewer checkpointed, so each successor started its review over.
  2. Successors whose gate was *already satisfied* re-did the work. Reviewer 7 submitted a verified review
     and was cut. Reviewers 8 and 9 each started with "[x] review: review approve … by semver-7-review" in
     their brief, and each reviewed again before one of them finally ran `hx done`. A tick in a checklist
     was not a strong enough signal for this model.

  The brief now opens with "THE GATE IS ALREADY SATISFIED … run `hx done` now" when that is the case.
  After any involuntary handover it advises small increments (commit, push and checkpoint after each
  sub-step, with reviewers putting partial findings in the checkpoint). Both behaviours are unit-tested.

**Did the fix help? Not measurably at this sample size.** Same fault injection, semver and TTLCache, two
runs each. *Before* is the committed brief in a separate git worktree; *after* is the fixed brief; both
use the same driver.

| | Solved | Sessions | Review sessions | Involuntary handovers | $ |
|---|---|---|---|---|---|
| Before | 4/4 | 21 | 6 | 7 | 0.104 |
| After | 4/4 | 15 | 4 | 3 | 0.072 |

The totals moved the right way, by about 30%, but the session logs do not support crediting the change.
The "gate already satisfied" line never triggered in these runs, and the increments advice appeared in
only 2 briefs. The difference is within the run-to-run noise visible in the first fault-injected run
(semver needed 9 sessions there and 5–6 here, with the same code). Both behaviours stay, because they are
cheap and unit-tested. Their effect needs the §2 protocol. Lesson for the protocol: **attribute through
the logs** (did the mechanism fire?), not only through totals.

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

1. **The mechanisms work, including against a real model.** Every failure mode in §3.1 is caught by
   construction and by tests. The real sessions confirmed the parts no unit test can:
   - Claude Code honors the hook contract.
   - Agents follow the brief.
   - Evidence gates hold.
   - Handovers resume work.
   - The stall ladder reaches the owner.

   The pilot also found three real defects that 70 unit tests had missed: hook false positives,
   non-resumable reviews, and redoing work behind an already-satisfied gate. A real pilot is part of the
   test suite, not an afterthought.
2. **The pilot did not show hx beating a single agent, and it could not have.** On small, well-specified
   tickets this model failed zero times in 30+ sessions. With no false "done", tampering or missed
   requirement to catch, hx can only add cost: 2.2× without faults and 2.7× under forced interruptions. That
   matches the model's "perfect agent" row. It means small tickets should take cheap routes; it does not
   refute the claim.
3. **The claim lives where the pilot could not go:** long tickets, context resets in the middle of a
   design, owner decisions that must survive several sessions, parallel work on shared code, and sandbox
   deaths that lose files. That is what the §2 protocol measures. The model (§3.3) says the gain should be
   large in quality (+20 points at the default assumptions) and roughly cost-neutral per correct ticket.
   But its failure rates are assumptions, and the pilot suggests they are *too high for small tickets*.
   They may well be too low for long ones. Only §2 can say.
4. **The most robust prediction is owner attention, not quality.** In every simulated scenario with
   failures, hx needs fewer owner interactions (0.6 against 1.0 per ticket), because restarts, re-prompts
   and handovers are automatic and only true decisions reach the phone. Both pilot drivers automated the
   owner, so this is untested. It is the first thing to measure with the UI's timestamps.
5. **What would change the design.** Suppose §2 shows single agents on long tickets rarely claim false
   "done" or tamper, and recover well from the repo alone. Then the right product is a lighter harness:
   - a single session per ticket, plus push-only evidence
   - a fresh-context reviewer
   - the owner inbox and the stall ladder

   It would drop per-step sessions and the red/green split, which is where most of the 2–3× overhead comes
   from. If they do fail often, the full process pays for itself, and the remaining work is cutting
   orientation cost (`--continue` across worker steps, richer checkpoints).

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

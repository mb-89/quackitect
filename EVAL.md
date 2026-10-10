# Measuring the harness against a lone agent

The claim: under the same model and token budget, the harness completes
more tasks under fault injection and delivers fewer false dones than a
lone agent, at under twice the lone agent's cost per completed task.

What breaks it:

| if | then |
|---|---|
| the lone agent matches the completion rate with crashes injected | the handover and the lease earn nothing |
| the false-done rates match | the red-then-green gate earns nothing |
| the cost per completed task is over twice the lone agent's | the briefing is too long or the retries too many |
| the owner taps per completed task exceed one | the holds are too eager |

## 1. The benchmark to run with a real model

| element | choice |
|---|---|
| tasks | small coding tasks with a goal, a visible test command, and hidden tests the agent never sees; a mix the agent can and cannot finish in one sitting |
| conditions | lone: one Claude Code session per task, told to write tests then implement, free to call itself done. harness: the `mvp` route (test, implement, review) with the same model |
| faults | kill the worker at a uniformly random point in a share of runs; cap the context window to force compaction in another share |
| budget | the same token ceiling per task for both conditions; the harness spends it over attempts |
| repetitions | each task under each condition at least five times, seeds recorded |

Measures, per task and condition:

| measure | reads as |
|---|---|
| hidden-test pass rate | did the work get done |
| false-done rate: the agent claimed done and the hidden tests fail | does the gate catch the claim |
| completion under kill | does the handover carry the work across a crash |
| tokens and wall clock per completed task | what the harness costs |
| owner decisions per completed task | what the owner pays |

Analysis: paired by task and seed, a difference in proportions with a
bootstrap interval. Report the four breaking conditions above directly.

Not measured by this benchmark, and worth a second one: whether the
reviewer attempt catches defects a self-review misses on the same
diffs, with a fixed set of diffs that carry planted defects.

## 2. What ran here

### The simulation

`python3 -m harness sim --n 400` drives the real engine (gates, leases,
handovers, holds, the review step) with a scripted worker over the fake
repository, and models the lone agent directly. It measures what the
mechanics do with a crash, a stall, a vacuous test, a false claim of
done and a hidden defect. It does not measure model capability: both
conditions draw the same per-step outcomes. The fault model is the
assumption, and every number below depends on it.

| assumption | value | meaning |
|---|---|---|
| p_crash | 0 to 0.4 | per attempt, the worker dies mid-step with no handover |
| p_stall | 0.05 | per attempt, the worker spins with no progress |
| p_vacuous_test | 0.10 | the test step writes tests that pass with no implementation |
| p_broken | 0.30 | the implementation fails the visible tests |
| p_defect | 0.20 | the implementation passes the visible tests and fails the hidden ones |
| p_false_done | 0.50 | a lone agent claims done over failing visible tests |
| p_review_catch | 0.70 | a fresh reviewer catches a hidden defect |
| p_self_catch | 0.30 | the lone agent's own review catches a hidden defect |
| rework | 0.50 | the share of progress a lone restart loses with no handover |
| lone_attempts | 3 | restarts a lone agent gets; the harness has the route's max_attempts per step |
| owner_patience | 2 | retries the owner grants a stuck ticket |
| units | 10 | tool calls one clean step costs; a stall burns 20 under the harness, 40 alone |

Result, 400 tasks per cell, seed 1:

| setting | condition | success | defect delivered | incomplete | cost | cost per success | owner taps |
|---|---|---|---|---|---|---|---|
| p_crash=0 | lone | 0.68 | 0.32 | 0.00 | 39.4 | 58.2 | 0.00 |
| p_crash=0 | harness | 0.92 | 0.09 | 0.00 | 48.2 | 52.7 | 0.01 |
| p_crash=0.1 | lone | 0.68 | 0.30 | 0.02 | 42.5 | 62.8 | 0.00 |
| p_crash=0.1 | harness | 0.94 | 0.06 | 0.00 | 49.8 | 52.9 | 0.04 |
| p_crash=0.2 | lone | 0.61 | 0.28 | 0.12 | 46.1 | 75.9 | 0.00 |
| p_crash=0.2 | harness | 0.93 | 0.07 | 0.00 | 51.2 | 55.1 | 0.08 |
| p_crash=0.4 | lone | 0.40 | 0.17 | 0.44 | 45.6 | 115.6 | 0.00 |
| p_crash=0.4 | harness | 0.90 | 0.07 | 0.03 | 52.4 | 58.0 | 0.46 |

Reading it:

- **Defects delivered** drop from about a third to under a tenth, and
  the drop does not depend on the crash rate. That is the gate and the
  fresh reviewer: the residual is the share of defects the reviewer
  misses, which the model fixes at p_defect times (1 minus
  p_review_catch). The gate removes false dones entirely; the lone
  agent's false dones are the bulk of its defects.
- **Completion under crashes** holds near full for the harness and
  falls with the crash rate for the lone agent. That is the handover
  and the lease: committed progress survives, and the next attempt
  knows what remains.
- **Cost** is higher per task (the gates, the reviewer, the retries) and
  lower per completed task at every crash rate. The ratio stays well
  under two.
- **Owner taps** rise with the crash rate: a ticket that burns its
  attempts holds for the owner. At the highest crash rate about one
  ticket in two needs a tap. The route's max_attempts is the knob.

What the simulation cannot show: whether a real reviewer attempt
catches defects at anything like 0.7, whether a real worker files
evidence as it goes, and whether the briefing re-grounds a real model
after compaction. Those are the benchmark's job.

Sensitivity worth running before trusting any one number:
`--p-review-catch 0.3` (a weak reviewer), `--rework 0` (a lone restart
that loses nothing, the most favourable case for the lone agent), and
`--p-false-done 0.1` (a careful lone agent).

### The live run

[LIVE.md](LIVE.md) records one run of the service driving Claude Code
through the `mvp` route. One run is a demonstration that the seams hold
(briefing in, verbs out, gates verified, stop refused), not a
measurement.

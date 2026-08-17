---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: vp-the-unattended-arrival
type: "[[value-prop]]"
statement: As an engineer, I need a box nobody is watching to reach the lane by itself, so the agent I sent spends its time on my work instead of on its own setup.
audience: stk-engineer-driving-agents
outcome: a fresh clone becomes a caged agent on a live lane with no act of mine, and nothing it worked out has to be worked out again
priority: must
---

## Success criteria

- A fresh clone reaches its first `se_pull` with no hand-work.
  Metric: agent-minutes between session start and the first pull. Target: under one.
  MEASURED BEFORE THE CHANGE, i35 on 2026-08-17: most of an hour, spent on a runtime below the pin, an install, a shallow clone with no `main`, a cage, and a hand-written JSON-RPC client.
- The arrival costs nothing when it has already happened.
  Metric: acts required on a second run. Target: none — it reuses the lane already answering.
- Every `ref:` the corpus cites resolves on arrival.
  Metric: records citing `ref: main` that fail on a fresh cloud clone. Target: none.
  A fetch alone does not buy this. `git show main:...` fails against `origin/main`, so the local branch is the half that is skipped.
- An arrival that fails does not cost the session.
  Metric: sessions ended by the arrival step. Target: none. Every ending is a printed line and exit 0.

## Why it is its own value prop

[[vp-autonomy-range]] carries the WALK — at full autonomy an unattended walk
stops only at the gates that matter. This one carries everything BEFORE the
walk, which that criterion assumes and never states: an agent that never
reaches the lane has no autonomy setting at all.

THE TWO FAIL DIFFERENTLY, which is why one node cannot hold both. A walk that
stops at the wrong gate is visible in the log. An arrival that never completes
leaves an agent holding native tools, uncaged, with nothing recording that it
happened.

## Unlike

A devcontainer or a Codespace, which solves the same arrival and solves one part
of it better: the setup runs BEFORE the agent exists, so there is no window in
which an uncaged agent is holding native tools. That is not available here,
because the cage is per-session and a cloud chat session starts already running.

What this sheds is the image. The arrival needs a checkout and a runtime, and it
repairs a shallow clone in place — which a prepared image does not attempt,
because it assumes the clone it was built around.

And unlike a README section, it executes. The five acts existed as prose for
three cloud runs and were performed by hand on every one of them.

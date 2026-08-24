---
minted_in: i62-background-work-reports-its-own-end-the-
id: raid-risk-the-heartbeat-ends-a-process-that-is-alive-but-quiet
type: "[[raid]]"
kind: risk
statement: "A heartbeat that ends what does not answer will eventually end a process that is working and simply has nothing to say."
owner: the maintainer
trigger: "the first report of work that stopped without finishing, and every change to what the ping asks or how long it waits"
status: open
looked: 2026-08-24
impact: "Losing a long run mid-flight costs the whole run, and it costs it silently. The account would report the entry closed, which is exactly the shape of a successful close, so the loss looks like the fix working."
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - i62-background-work-reports-its-own-end-the-
weighs_with: raid-iss-a-finished-run-keeps-reporting-itself-as-running
weighs_against: none
---

## The story, with no coincidence in it

A test file drives a real server and blocks for longer than the interval. The
ping goes out, nothing answers, and the run is ended at the point it was
about to pass.

That needs one ordinary event, so it is plausible rather than conceivable.

## What the goal conflict ruled

RULED FOR ASKING THE WRONG QUESTION DELIBERATELY. The ping asks the handle
whether the process EXISTS. It never asks whether the process ANSWERED.

LIVENESS AND RESPONSIVENESS ARE DIFFERENT QUESTIONS, and only the first can be
asked of an arbitrary child. A supervisor that demands a reply can supervise
only processes written to reply, and this engine launches shells, test runners
and exit scripts that were never written to.

## What is still exposed after that ruling

A PROCESS CAN EXIST AND BE HUNG. Existence is a weaker signal than an answer,
and this design accepts that on purpose: the measured fault is entries that
outlive dead processes, not processes that hang.

SO A HANG IS STILL CAUGHT BY THE CEILING, not by the heartbeat. The two guards
answer different questions and neither replaces the other.

## What would make this the wrong call

A measured case where a process existed, was genuinely dead to the work, and
the heartbeat reported it alive for long enough to hold a walk. That would say
existence is too weak a signal, and the answer would be a ceiling per kind of
job rather than a stronger ping.

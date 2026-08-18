---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: req-the-pool-answers-a-person-and-an-agent-from-one-source
type: "[[requirement]]"
statement: "The system shall serve the standing options to a rendered surface and to a lane caller from the same source, so the two answers cannot disagree."
kind: interface
verify_method: test
breaks_if_removed: "Two readers of one pool drift, and the drift is silent: a person reading a panel and an agent filling a record scope both believe they have the list. Whichever is stale, the disagreement surfaces as a decision made against work that was already taken or already dropped."
breaks_how_badly: corrosive
refines:
  - uc-see-the-whole-pool-from-any-clone
source_refs:
  - vp-what-is-learned-outlives-the-machine
  - req-open-work-is-answered-from-the-repository-not-a-local-store
priority: must
---

## Detail

BOTH SIDES NAMED, because an interface row only one side knows about is a
future integration failure.

| side | who owns it | what it is owed |
| --- | --- | --- |
| the lane caller, agent-facing | the engine's survey | the options as facts, with statement and condition |
| the rendered surface, person-facing | whatever draws the desk | the same options, rendered |

WHAT IS NOT SPECIFIED HERE: what the surface looks like. Surfaces are i23's
business, and this row survives a rewrite of every screen it touches. What it
demands is that both sides read one source.

## Pass line

Metric: standing options present in one reader's answer and absent from the
other's, taken at the same moment. Target: zero.

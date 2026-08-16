---
minted_in: i11-the-engine-fix-bundle-about-twenty-named
id: raid-dec-blocking-and-the-battery-refusal-ship-together
type: "[[raid]]"
kind: decision
statement: se_test blocking and the full-battery refusal outside verification ship in the same pass, because blocking alone removes the cost that currently discourages a run.
owner: the adjudicator
trigger: any build step that lands one of the two without the other, or any measurement showing test calls rising after the change
status: decided
impact: shipping the block alone makes running a battery instant and free, so the agent runs more of them, and the measured problem gets worse rather than better.
breaks_how_badly: crippling
how_likely: plausible
weighs_with: none
weighs_against: none
source_refs:
  - req-test-scope-discipline
  - req-test-run-carries-its-question
  - vp-rigor-without-toil
  - i11 gate-kickoff round 2, the named hazard
  - "measured 2026-08-16: 494 se_test calls produced 66 verdicts"
  - "M7_50_verification: filled_by engine, the one place the full battery runs, its verdict records itself"
---

## The decision

TWO ITEMS IN THIS BUNDLE LOOK INDEPENDENT AND ARE NOT.

- se_test BLOCKS or pushes, instead of handing back a job id to poll.
- The lane REFUSES an agent-initiated full battery outside verification.

THEY SHIP TOGETHER. Neither lands alone.

## Why, stated as the failure it prevents

TODAY THE POLLING IS ITSELF A DETERRENT. A full battery costs a handoff plus
ten calls of watching, and that cost is part of why five were run rather than
fifty. It is a bad deterrent — it wastes calls instead of preventing them —
but it is doing work.

BLOCKING REMOVES THAT COST ENTIRELY. A battery becomes one call that returns
an answer. The friction that discouraged a run is gone, and the judgment that
replaces it is the agent's own, which is exactly the judgment the measurement
says was wrong five times in one day.

SO THE BLOCK ALONE MAKES THE MEASURED PROBLEM WORSE. The refusal is what
replaces the accidental deterrent with a designed one.

## Rejected options

- SHIP THE BLOCK ALONE AND WATCH. The cheapest option and the one this entry exists to refuse. It removes the deterrent first and adds the replacement later, so the gap between them is a window where a battery costs one call and nothing governs it. The measurement says the agent's judgment filled five such windows in a single day.
- SHIP THE REFUSAL ALONE. Safe and it strands the polling. 428 wasted calls stay wasted, which is the number that made this iteration exist.
- KEEP THE POLLING AS THE DETERRENT. It works by accident and costs ten calls to watch a fifty-second run. A deterrent that bills the caller for waiting is not a design, and defending it would mean defending the waste.
- GATE EVERY TEST RUN ON A SUBMIT. The owner's own earlier idea, recorded UNDECIDED at note-e4f043ef21d2. Wider than needed: scoped runs answer questions during a build and stopping them would slow the work this iteration is meant to speed up. Left standing for the owner rather than ruled out here.

## Consequences

- THE TWO LAND IN ONE BUILD STEP, not two, and specify-build schedules them that way.
- A SCOPED RUN STAYS FREE and answers immediately, which is what the build discipline asks for.
- THE AGENT LOSES THE CHOICE to run a full battery when it feels uneasy. That is the point: the row already said the engine owns it.
- VERIFICATION BECOMES THE ONLY PLACE a full battery runs, so a red there is the signal rather than one of forty verdicts a day.
- IF THE PAIR CANNOT SHIP TOGETHER, neither ships. The refusal alone is tolerable; the block alone is not.

## What the refusal is not

IT DOES NOT RUN FEWER BATTERIES. The engine still runs the full battery at
verification, where M7_50 already says it belongs and where its verdict
records itself. What is refused is the agent deciding to run one somewhere
else, which the row never sanctioned.

SCOPED RUNS STAY FREE. They answer a question about a change and they are what
the build discipline asks for.

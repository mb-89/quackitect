---
minted_in: i4-the-panel-round-the-archived-iteration-b
id: raid-delegated-writing-is-off-by-default
type: "[[raid]]"
kind: decision
statement: A record runs zero walkers by default. Delegated WRITING is off; a reviewer at a gate and a researcher where research happens are unaffected and do not count against the ceiling.
owner: the owner
trigger: a round that wants delegated writing and can brief a hand without making it rebuild context the guide already holds; or a controlled comparison being published
status: decided
impact: The guide authors every state. Wall-clock for a record is bounded by one agent, and no writing runs in parallel, ever. In exchange the record stops paying context-transfer cost on work the guide has already located.
breaks_how_badly: cosmetic
how_likely: expected
source_refs:
  - spec/iterations/i4-the-panel-round-the-archived-iteration-b/research-multi-agent-orchestration.md
  - https://arxiv.org/abs/2503.13657
  - https://www.anthropic.com/engineering/multi-agent-research-system
  - https://blog.langchain.com/how-and-when-to-build-multi-agent-systems/
---

THE DECISION. `walkers` defaults to zero at the kickoff gate. Asking for one is
a deliberate choice, argued in that field's rationale.

## What was measured

FOUR WALKERS AND ONE REVIEWER RAN ON 2026-08-23, on this record.

- THREE WALKERS EACH SPENT ABOUT FIFTEEN MINUTES reading before their first
  edit, on tasks where the guide had supplied the file names and the line
  numbers. The guide out-produced all three in the same window.
- ONE WALKER PRODUCED NOTHING, because its brief named a state instead of the
  walking, and the walk moved.
- ONE WALKER AUTHORED A GATE WELL, in sixteen minutes: twelve fields, a
  capability walk with its narrowing declared, two findings resolved rather
  than listed, and a live prior-art scan.
- THE REVIEWER FOUND TWO REAL GAPS in a gate the guide had already blessed.
- THE RESEARCHER PRODUCED the report this decision rests on.

## What the field says

READS PARALLELISE AND WRITES DO NOT. LangChain's reconciliation of the two
opposing positions is one sentence: "read actions are inherently more
parallelizable than write actions."

ANTHROPIC'S OWN CAVEAT MATCHES: "most coding tasks involve fewer truly
parallelizable tasks than research, and LLM agents are not yet great at
coordinating and delegating to other agents in real time." Their 90.2% result
is a READING task, and the writing in that system is one agent in one call.

THIS PROCESS MACHINE IS A WRITING MACHINE.

METAGPT IS THE CLOSEST PUBLISHED RELATIVE — standard operating procedures
encoded as prompt sequences, roles on an assembly line — and its traces are in
the MAST failure dataset, where two failure modes were characterised from them.

## The honest counter-case

ONE DAY IS ONE SAMPLE, on one record, with dispatching the guide itself calls
poor throughout. A fair test of delegated writing needs briefs that do not make
a hand rebuild what the guide already holds.

THE SIXTEEN-MINUTE GATE CUTS AGAINST THIS DECISION and is recorded above
rather than omitted. A hand authored a state better than the guide would have.

NOBODY HAS PUBLISHED THE COMPARISON. The report looked and found no controlled
measurement of a single agent against an orchestrated fleet on a
process-machine software workflow, and none of AutoGen or CrewAI beating a
single agent on a matched task.

## The sharper line, which is what actually held

THE DIFFERENCE IS NOT READ VERSUS WRITE. It is whether the CONTEXT TRANSFER is
the work.

- A LOCATED EDIT — file and line already named — pays twice. The thinking is
  done; only the typing is handed over.
- A STATE'S AUTHORING can earn its cost, because the deciding is the job and a
  hand that did not write the surrounding record brings something the guide
  cannot.

ZERO IS THE DEFAULT ANYWAY, because the first case is common and the second is
rare, and a default that has to be argued down is safer than one that has to be
argued up.

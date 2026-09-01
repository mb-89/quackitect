---
id: wk-f1f0ea41d7
seq: 1000057
type: work
title: findings become checks
status: backlogged
assignee: main
scope: single-step
traced: true
minted_by: cowork
---

## detail

A finding is a sentence and the worker answers the sentence. A check is a command and it cannot be answered by anything except going green. So a finding that can be a check is written as one, by the reviewer, in the round that found it.

THE SHAPE.

1. The reviewer writes the check. Ad hoc, in .se/scratchpad/, in whatever this machine has. Not into util/checks/, which only a retro fills. See wk-b42c0e9a53.

2. The engine runs it once over the whole tree. Where it is red is the extent, measured. Nothing is tagged and nothing is declared, because a tag goes stale the moment somebody moves a file and a run cannot. This closes a class that keeps returning: an extent inherited from the finding that reported it rather than measured against the file.

3. The check goes onto the token under review as a criterion, carrying the whole red set. The engine already runs criteria at submission and refuses on red, and already refuses a criterion that is green before the work is done, so the reviewer watched it red by construction and the next round has to pass it everywhere.

4. THE AGENT THAT GETS IT BACK FIXES ALL OF IT. Not only where the finding pointed. There is no second token for the rest of the red, and no blame to divide. An agent that fixes its own instance and leaves the same defect in the next file has done half the work, and the owner ruled that dividing this between agents is not wanted.

5. Small enough to do in the moment, the reviewer does it. Changing one line of prose is not worth a round.

6. AT THE RETRO, EACH AD HOC CHECK IS JUDGED. Promoted into util/checks/ as a real test, or dropped with the scratchpad. That is the only way the standing set grows, so it grows at a known moment by a deliberate act, and a reviewer can write as many checks as it likes without any of them surviving unexamined.

WHAT IS ALREADY TRUE. Criteria are commands and the engine runs them at submission. A rejection already needs a finding and a lesson token, and the engine refuses one without either. AGENTS.md already says ad hoc scripts live in the scratchpad, that the ones which earn it become part of the method, and that standing checks live in util/checks/ because a retro that drains the scratchpad must not take what judges the next submission.

WHAT IS NOT TRUE YET, MEASURED. Every check now in util/checks/ was born in .se/scratchpad/ and written by main, the worker, not by a reviewer. Then it was promoted, by hand, mid-work, with no retro. One, counts-are-derived.py, was written straight into util/checks/ on 1 September and is not there now. So the standing set is already being grown and pruned outside any retro, which is the bound this ruling is for. That path is guarded by wk-b42c0e9a53, which refuses a write into util/checks/ outside a retro.

WHAT DOES NOT WORK MECHANICALLY, AND WHY IT IS NOT NEEDED. Telling other open tokens that a check applies to them would need the engine to know what each token touched. It does not: of 5966 tool calls in the record, 5517 are Bash and Bash carries no path, so only 379 calls name a file. Git could answer it, since committing what you changed by name is already a rule, but that link does not exist. It is not needed here, because the extent rides the token under review rather than being distributed.

Raised from outside the working session.


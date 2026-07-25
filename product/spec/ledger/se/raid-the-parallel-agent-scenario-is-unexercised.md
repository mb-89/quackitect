---
id: se.raid-the-parallel-agent-scenario-is-unexercised
kind: raid
statement: "THE MECHANISM IS PROVEN AND THE SCENARIO HAS NEVER RUN. Owner: whoever first runs two iterations at once. Trigger: fires the first time a second agent opens an iteration while another is live.\n\nWHAT IS PROVEN: engine promotion under its four rules, exercised six times with five refusals, each restoring trunk untouched and naming what failed. The suite ran green IN TRUNK before every commit.\n\nWHAT IS NOT: two agents running at the same time against one judge. Never done. The whole justification for promotion - that a per-worktree engine would let two iterations be judged by DIFFERENT machines, so a gate stops meaning one thing - rests on a scenario nobody has yet played.\n\nTHE RELATED UNPROBED ASSUMPTION: the ambiguous-root refusal, which fires when more than one iteration is open. It is covered by a test on synthetic roots; the LIVE case, where ambiguity arises from real project state, is untested. Opening a second iteration purely to watch a refusal was work the owner did not ask for.\n\nWHY IT IS ACCEPTABLE TO CARRY: every part is individually tested, the failure would be loud (a refusal, not a wrong answer), and the scenario will be exercised by ordinary use rather than needing a staged test.\n\nWHAT WOULD MAKE IT URGENT: any plan to fan chunks out to sub-agents. This iteration deliberately did not, because the mechanism that makes parallel agents safe was itself one of the chunks being built."
provenance:
  iteration: i12-tool-surface
  ai_involvement: agent-drafted
---



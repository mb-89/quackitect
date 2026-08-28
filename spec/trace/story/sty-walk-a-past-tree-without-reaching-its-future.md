---
minted_in: i37-training-iterations-a-disposable-iterati
id: sty-walk-a-past-tree-without-reaching-its-future
type: "[[story]]"
statement: When I am handed a rewound tree and asked to walk an iteration that has already been finished once, without being able to look up what it concluded, I want every door to the future closed by the lane itself, so my walk measures the machine rather than my ability to find the answer.
actor: stk-agent
refines:
  - vp-rigor-without-toil
priority: must
---

## Deck

The agent is bound to a benchmark run and told plainly that this iteration was walked before and that its output will be discarded.
|||
OPEN RATHER THAN BLIND, by owner ruling 2026-08-19. The cost is on the register as raid-asm-an-agent-told-its-work-is-discarded-still-walks-the-machine-the-same-way, graded corrosive, with the bias direction named: the number understates.
---

The agent works normally. It reads the corpus, searches the trace, asks git what changed. None of those acts is an attempt to cheat, and any of them could surface the original answer.
|||
DO NOT DESIGN AGAINST A MALICIOUS AGENT, by owner ruling 2026-08-19. The honest read is the one that has to be handled, and the log catches the other kind afterwards.
---

Every commit newer than the rewind point is refused by the lane, so the answer is not reachable through any door the agent has.
|||
NOT YET BUILT, AND THE DOORS ARE COUNTED. se_git allows show, log and diff with nothing bounding which commit they reach. se_file_read and se_file_search both take a ref. The shell half is already closed: engine/discipline.ts refuses a git command through se_run after one warned run.
---

The agent writes its own requirements, its own tests, and watches them go red before it makes them pass.
|||
GENUINE AND FREE. A re-walked iteration writes real tests against the real tree, which is why the sandbox package this iteration first proposed was struck. The original code is in the future and the ceiling hides it.
---

Nothing the agent produces survives except the report, and the tree is thrown away.
|||
BY OWNER RULING 2026-08-19, nothing about the run is committed except the filled report. The seed and the iteration id are the whole handover, so another machine regenerates a run rather than fetching one.

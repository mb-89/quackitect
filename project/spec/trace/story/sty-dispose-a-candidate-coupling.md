---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: sty-dispose-a-candidate-coupling
type: "[[story]]"
statement: When an agent is about to couple a change to another part of the system that the trace graph's edges do not name, I want a ranked list of candidate coupled nodes, so I can dispose of each one before the change ships rather than finding the miss in a red-team round.
actor: stk-agent
refines:
  - vp-rigor-without-toil
priority: must
---

## Deck

An agent is about to make a change that couples to another part of the system. The trace graph answers structural coupling exactly through its edges, but a coupling no edge names is invisible until someone happens to grep the right words.
|||
MEASURED THIS RUN, and it is the sharpest example the corpus has. i35 built `se-arrive.ts` and only the ELEMENT DECOMPOSITION revealed that four of its functions were already implemented in `se-start.ts`. No edge named that coupling; two files simply looked similar until the matrix put their implementers side by side.
---

gate-kickoff's own framing of the BM25 sibling stands: the graph answers structural coupling exactly, and this is built to answer the rest — the coupling nobody drew an edge for yet.
|||
THE FRAMING HOLDS. The graph answered i35's structural coupling exactly — `el-arrival` implements seven functions, and every flow crossing was computable. What it could not answer is the one that mattered: that another element already did four of them.
---

The agent describes the change in plain words and asks the BM25 sibling for candidate coupled nodes.
|||
NOT YET AVAILABLE. The BM25 sibling belongs to i15, which stands `status: open`, so there is no verb to ask. i35 found its coupling by drawing the element and reading the matrix — which works, and only after the code is written.
---

The sibling ranks the corpus by relevance to that description and returns a scored list of candidates, not a single guess.
|||
UNMEASURED. No ranked candidate list has been produced by this system yet, because the sibling does not exist.
---

The agent goes through every candidate and disposes of it — real coupling, or not — rather than picking the top hit and moving on.
|||
THE FORCED DISPOSITION IS PROVEN, THOUGH NOT BY BM25. i35 met the same mechanism twice this run: `probe-assumptions` handed back 42 rows and refused until each was answered, and `observe-red` handed back 15 and refused until each was checked or owed. The pattern that makes this story valuable is live; only the candidate SOURCE is missing.
---

A candidate turns out to be a real, previously unnamed coupling. The agent handles it before the change ships, instead of a red team or an incident finding it later.
|||
THIS IS EXACTLY WHAT HAPPENED, by a slower route. The unnamed coupling between the two entrypoints was found before the change shipped, not by a red team afterwards, and it is filed as `raid-iss-two-entrypoints-place-the-cage-and-nothing-compares-them` with a written repayment.
---

The missed edge that gap_claim describes — invisible until someone happens to grep the right words — surfaces during the change itself, because disposing of every candidate is forced, not optional.
|||
THE COST OF NOT HAVING IT IS NOW ON RECORD. The coupling surfaced during the change — but only because a human-authored decomposition step happened to sit between the build and the gate. Nothing forced it, and an iteration that skipped the element matrix would have shipped the duplication unnamed.

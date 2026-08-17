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


---

gate-kickoff's own framing of the BM25 sibling stands: the graph answers structural coupling exactly, and this is built to answer the rest — the coupling nobody drew an edge for yet.
|||


---

The agent describes the change in plain words and asks the BM25 sibling for candidate coupled nodes.
|||


---

The sibling ranks the corpus by relevance to that description and returns a scored list of candidates, not a single guess.
|||


---

The agent goes through every candidate and disposes of it — real coupling, or not — rather than picking the top hit and moving on.
|||


---

A candidate turns out to be a real, previously unnamed coupling. The agent handles it before the change ships, instead of a red team or an incident finding it later.
|||


---

The missed edge that gap_claim describes — invisible until someone happens to grep the right words — surfaces during the change itself, because disposing of every candidate is forced, not optional.
|||


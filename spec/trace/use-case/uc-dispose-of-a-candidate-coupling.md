---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: uc-dispose-of-a-candidate-coupling
type: "[[use-case]]"
kind: interaction
statement: dispose of every candidate coupling a change might have, before the change ships
actor: stk-agent
trigger: the agent is about to make a change that may couple to another part of the system, and the trace graph's edges do not name the coupling
precondition: se_couplings ranks the corpus by BM25 relevance to a plain-words description and stamps a pending disposition row per candidate
guarantee: every candidate the verb proposed has been disposed of — marked a real coupling or not — before the change ships
refines:
  - sty-dispose-a-candidate-coupling
priority: must
---

## Main scenario

1. The agent describes the change in plain words.
2. The agent asks se_couplings for candidate coupled nodes matching that description.
3. se_couplings ranks the corpus by BM25 relevance and returns a disposition row per candidate, each stamped pending — nothing the ranker proposes is silently dropped.
4. The agent disposes of each candidate in turn — real coupling, or not.
5. Where a candidate is a real, previously unnamed coupling, the agent handles it as part of the change.

## Extensions

3a. No candidate scores above the verb's threshold. The agent records an empty result rather than skipping the check.

4a. The agent cannot judge a candidate from the description alone. It reads the candidate's own file before disposing of it.

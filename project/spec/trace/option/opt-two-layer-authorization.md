---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: opt-two-layer-authorization
type: "[[option]]"
statement: separate which tools a step exposes from whether this call with these argument values is allowed here
cluster: cluster-the-walk
found_by: prior-art
source: "Capability Gates Are Not Authorization: Confused-Deputy Failures in LLM Agent Frameworks, https://arxiv.org/html/2606.28679v1"
---

## Mechanism

The paper separates two things most frameworks conflate. A CAPABILITY GATE
decides which tools are visible to the agent. PER-CALL AUTHORIZATION decides
whether one concrete call, with its actual arguments, in its actual context,
may proceed. Holding only the first is the confused-deputy shape: the tool
was legal, the call was not.

WHAT IT WOULD COST HERE. This system has the first layer and calls it
`legal_tools`. The second exists only in scattered places — the method-write
guard, the test scope check, the archive's person-only rule — each written
by hand where somebody noticed. Adopting the split means naming it as one
mechanism, and every existing hand-written guard becomes a policy rather
than a special case.

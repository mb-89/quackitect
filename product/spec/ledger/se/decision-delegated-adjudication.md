---
id: se.decision-delegated-adjudication
kind: decision
statement: "The owner may delegate gate adjudication for a declared iteration: the agent blesses its own gates, every grant stamps adjudicated_by=agent with delegated_via pointing here, and the owner reviews the finished iteration."
provenance:
  iteration: i5-worktrees
  ai_involvement: agent-drafted
  adjudicated_by: owner
  channel: chat
breaks_if_removed: Self-blesses become indistinguishable from forged owner blesses - the transparency that makes delegation legal dies.
---

## Ruling

Owner, in chat, 2026-07-24 (verbatim core): "we don't have a hard rule that you can't bless your own gates. It just needs to be transparent... I want to be able to tell you: here is an iteration, it's completely mechanical, we've discussed it, you can do it by yourself... do it by yourself and not wait for me on the gates. I will look at it once the whole iteration is done."

## Scope and mechanics

- Delegation is PER ITERATION and granted by the owner in chat; it is never assumed.
- Granted scope (owner chat, 2026-07-24, final): i5-worktrees, then i8-phone-lane, strictly IN SEQUENCE - no parallel run this time (the parallel try waits for the next such opportunity). i9-board-rounds is explicitly NOT delegated: the owner named it judgment work.
- Every delegated bless still runs the full gate: evidence, offer, hash-bound grant.
- The grant records adjudicated_by: agent, channel: chat-grant, delegated_via: this decision - never the owner's stamp.
- The owner reviews the shipped iterations; anything they reject reopens through the normal machinery.
- Items needing genuine owner judgment or the owner's person (phone pairing, from-away bless, design rounds) are NOT covered - they park as RAID entries or stay in the note inbox.

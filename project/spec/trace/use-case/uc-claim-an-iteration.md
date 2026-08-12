---
minted_in: i2-parallel-iterations-across-machines-seed
id: uc-claim-an-iteration
type: "[[use-case]]"
statement: Claim an unclaimed iteration from the shared pool so this machine may work it and no peer takes it too.
actor: stk-engineer-driving-agents
trigger: a machine is free and seeded iterations stand unclaimed on the remote
precondition: the product stands installed with its minted machine id, and the remote is configured
guarantee: exactly one machine holds the claim, the claim is visible to every peer, and the iteration's work stays attributable to the claimant
refines:
  - sty-work-on-two-machines
priority: must
---

## Main scenario

1. The person or their agent asks for work, and the machinery lists the seeded iterations with each one's claim state and age.
2. They pick an unclaimed iteration whose dependencies have shipped.
3. The engine writes the claim - the machine id and the time - and pushes it as a machinery act.
4. The remote accepts the push, and every peer sees the iteration as taken from its next fetch.
5. The walk enters the claimed iteration as any other.

## Extensions

- 2a. Every unclaimed iteration has unshipped dependencies. The machinery says which dependency blocks which iteration, and nothing is claimable yet.
- 3a. The remote is unreachable. The claim is taken locally and unpushed, the desync knowingly accepted (owner ruling 2026-08-11); it reconciles at the next push, and a conflict there is the person's to resolve.
- 4a. A peer's claim push won the race. The push rejects, the engine re-fetches, marks the iteration taken, and offers the next unclaimed one.
- 5a. A claim stands but its machine has gone silent. A person judges abandonment and releases it with the quiet force flag - against silence, never malice.

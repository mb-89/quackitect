---
minted_in: i2-parallel-iterations-across-machines-seed
id: sty-work-on-two-machines
type: "[[story]]"
statement: An engineer seeds a batch at the desk, opens the laptop, and each machine claims and ships its own iteration - two shipped in the time one used to take.
actor: stk-engineer-driving-agents
refines:
  - vp-the-engine
priority: must
---

## Deck

The engineer owns two capable machines and one of them is always idle. The desk grinds an iteration while the laptop sits closed - half the fleet does nothing because work cannot be shared.
|||
<!-- evidence at M8 -->

---

The product stands on both machines - the same repo, the same remote, an engine and an agent on each. A batch of seeded iterations waits, and nothing marks who should take what.
|||
<!-- evidence at M8 -->

---

At the desk they seed the batch. Every stub lands on the remote the moment it exists - git knows each iteration before anyone works it.
|||
<!-- evidence at M8 -->

---

They open the laptop and its desk lists the same iterations, fresh from the remote. They say "take one" - the laptop's agent claims the first unclaimed iteration with a single push.
|||
<!-- evidence at M8 -->

---

Back at the desk, that iteration wears the laptop's claim - machine id and age visible. The desk's agent claims a different one; when both ever race for the same stub, the remote accepts one push and the loser picks the next.
|||
<!-- evidence at M8 -->

---

Both machines walk their iterations through the same gates. The engineer blesses each gate from wherever they sit, and neither machine ever waits on the other.
|||
<!-- evidence at M8 -->

---

Two iterations ship in the time one used to take. The archive holds both, each attributed to its machine, and the one ledger answers who did what and why - same rigor, twice the hands.
|||
<!-- evidence at M8 -->

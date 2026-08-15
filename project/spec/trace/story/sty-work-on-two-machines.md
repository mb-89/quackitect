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
The claim lane shipped this iteration answers it: engine/claims.ts on git plumbing, demonstrated 2026-08-12 in the fresh-eyes scratch lab (the run log rides job-msq7b2bq-3).

---

The product stands on both machines - the same repo, the same remote, an engine and an agent on each. A batch of seeded iterations waits, and nothing marks who should take what.
|||
Demonstrated with two clones (m1, m2) of one bare origin. Each minted its own machine id on first use (1e77e2bf, 1f263c7e) - no name typed, nothing configured.

---

The second machine need not be one they own. A rented host with a shell and nothing else becomes the second pair of hands from one pasted line, with nobody at its keyboard afterwards.
|||
OWED, and it is i28's subject. Today a fresh clone sees no iterations at all, because the reader asks the disk rather than git. [[nbr-cloud-host]] carries the four properties that make an unattended host different: unconfigured, unattended, ephemeral, and no session to wake.

---

At the desk they seed the batch. Every stub lands on the remote the moment it exists - git knows each iteration before anyone works it.
|||
itSeed answered announced: true, and ls-remote showed refs/heads/it/i1-claim-lane-demo on the origin immediately after the seeding act.

---

They open the laptop and its desk lists the same iterations, fresh from the remote. They say "take one" - the laptop's agent claims the first unclaimed iteration with a single push.
|||
m2's listing named the seed unclaimed straight off the remote; its entry answered claimed_now: true, one add-only file on origin/claims carrying the machine id and the time.

---

Back at the desk, that iteration wears the laptop's claim - machine id and age visible. The desk's agent claims a different one; when both ever race for the same stub, the remote accepts one push and the loser picks the next.
|||
m1's listing named the holder (machine 1f263c7e, age in milliseconds) and m1's own entry refused, naming the holder. The race case in tests/claims.test.ts shows two simultaneous pushes: one wins, the loser is refused and rebuilds.

---

Both machines walk their iterations through the same gates. The engineer blesses each gate from wherever they sit, and neither machine ever waits on the other.
|||
Owed: the full both-machines walk needs the real second machine (raid-asm-peer-runs-supported-platform - it runs Windows). The pool-opening act and the holder view on the desk are the named debt raid-debt-claim-pool-surfaces.

---

Two iterations ship in the time one used to take. The archive holds both, each attributed to its machine, and the one ledger answers who did what and why - same rigor, twice the hands.
|||
Owed with the slide before it: two concurrently shipped iterations are the population claim. The mechanics beneath - push as lock, attribution by machine id - stand demonstrated.

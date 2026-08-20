---
minted_in: i2-parallel-iterations-across-machines-seed
id: sty-work-on-two-machines
type: "[[story]]"
statement: An engineer seeds a batch at the desk, opens the laptop, and each machine walks its own iteration — two shipped in the time one used to take.
actor: stk-engineer-driving-agents
refines:
  - vp-the-engine
priority: must
---

## Why this story came back at i34

IT WAS DELETED AND THAT WAS WRONG. i34 retired the machine-locking
specification whole, and this story went with it, because its middle slides
rested on the claim ledger.

THE NEED NEVER RESTED ON THE MECHANISM. The engineer's want is two machines
working at once. A lock was one way to divide the work between them, and it is
not the only one.

THE OWNER'S OWN WORDS, 2026-08-16: "I can't run two agents in parallel on
different worktrees. It doesn't happen. It's just two agents on two different
clones."

SO THE STORY STANDS AND ITS MECHANISM CHANGES. Two clones, one agent each, and
the engineer says which machine takes which iteration.

WHAT WOULD HAVE BEEN LOST. [[uc-start-an-unattended-machine]] refines this
story and nothing else, and it is live — i28 built it and its code is on
trunk. Deleting the story left a working use case refining nothing.

## Deck

The engineer owns two capable machines and one of them is always idle. The desk grinds an iteration while the laptop sits closed — half the fleet does nothing because work cannot be shared.
|||
Answered by cloning. Each machine holds its own clone of the same origin, and each walks its own record on its own trunk.

---

The product stands on both machines — the same repo, the same remote, an engine and an agent on each. A batch of seeded iterations waits, and the engineer says who takes what.
|||
Demonstrated with two clones (m1, m2) of one bare origin, 2026-08-12 in the fresh-eyes scratch lab. What is NO LONGER demonstrated is any automatic division: i34 removed it, so the division is the person's.

---

The second machine need not be one they own. A rented host with a shell and nothing else becomes the second pair of hands from one pasted line, with nobody at its keyboard afterwards.
|||
THE MECHANISM IS BUILT IN i28 AND THE DEMONSTRATION IS STILL OWED. `engine/bin/se-start.ts` takes a cloned host from one command to a walking agent, each step failing by its own name. What has not happened is the run: no host nobody prepared has been observed reaching a walking agent, and that is [[raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make]]. [[nbr-cloud-host]] carries the four properties that make an unattended host different: unconfigured, unattended, ephemeral, and no session to wake.

---

At the desk they seed the batch. Every stub stands in the tree the moment it exists, so both machines see the same list from a fetch.
|||
Since i34 a seeded record is a folder on trunk rather than a branch with a worktree, so a clone that fetches trunk has every stub by construction.

---

They open the laptop and its desk lists the same iterations. They say which one it takes, and it takes that one.
|||
THE DIVISION IS THE PERSON'S, and that is the change i34 makes. Contract rule 9 already said a record opens on the person's word; before i34 an agent could also take one by claiming it, and now it cannot.

---

Nothing stops both machines opening the same iteration, and nothing needs to, because nobody asks two machines to walk one record.
|||
RECORDED AS AN ASSUMPTION RATHER THAN GUARDED: [[raid-asm-only-one-agent-works-a-clone-at-a-time]]. Its trigger is the first time two agents are asked to work the same checkout, and the way back is named on [[raid-dec-one-tree-beats-a-record-travelling-between-machines]].

---

Both machines walk their iterations through the same gates. The engineer blesses each gate from wherever they sit, and neither machine ever waits on the other.
|||
Owed: the full both-machines walk needs a real second machine. [[raid-asm-peer-runs-supported-platform]] records that the one peer that actually appeared ran Linux rather than the Windows the installer targets.

---

Two iterations ship in the time one used to take. The archive holds both, and the one ledger answers who did what and why — same rigor, twice the hands.
|||
Owed with the slide before it: two concurrently shipped iterations are the population claim. What stands demonstrated is the shape — two clones, two engines, two records — not the throughput.

## What i9 adds, 2026-08-19

THE SECOND MACHINE PAYS A ONE-TIME COST at the collapse, and this story is
where it lands.

THE MACHINE-STATE FOLDER IS IGNORED BY VERSION CONTROL, so no commit can carry
it. The machine that makes the move relocates it as a file operation. Every
OTHER clone keeps it where it was, and the engine then looks in the new place
and finds nothing.

AND FINDING NOTHING IS A LEGAL STATE, because a folder nobody has driven has
none either. So a long-driven clone reads as a fresh one, with its history
intact one level up and nothing pointing at it.

THE OWNER RULED IT ACCEPTABLE, 2026-08-19, on the grounds that this concerns
one project on two machines. No mechanism is built. The migration is one folder
move by hand, and it is written out on
[[raid-risk-an-existing-checkout-keeps-its-state-where-the-move-left]] with its
verification step.

WHY IT BELONGS ON THIS STORY RATHER THAN ONLY IN THE REGISTER. This deck is the
only place in the corpus where two machines holding two clones is the subject.
A reader working out what the second machine needs comes here first.

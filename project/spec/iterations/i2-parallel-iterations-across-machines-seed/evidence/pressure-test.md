---
form: pressure-test
by: agent
signed_off: 2026-08-11T16:09:20.124Z
authors: agent
files:
---

# Evidence form / pressure-test

## current_situation

The packet stands drafted through scope; this leg pressure-tests it with the working-backwards PR-FAQ before the gate.

## prfaq

PRESS RELEASE. Quackitect ships parallel iterations. An engineer seeds a batch of iterations at the desk; each stub is on git the moment it exists. Their laptop claims one on the train, a colleague's machine claims another, the desk keeps a third - one push each, no coordinator, no meeting. Every machine walks its own iteration under the same enforced order, and the product's one ledger says afterwards who did what and why. Abandoned work does not wedge: a claim wears its age, and a quiet force releases it.

HOSTILE FAQ, against the architectural move.

- Why is git the coordinator - where is the server? There is none, deliberately. The remote already serializes pushes; a lock server would be a second thing to install, secure and keep alive on every site, and its absence is the feature.
- What happens when two machines claim at once? Both push; the remote accepts one; the loser's push rejects, it re-fetches, sees the claim, picks another iteration. The race IS the lock, and the register carries the assumption with a probe run against origin before the mechanism is called done.
- A machine dies holding a claim - now what? The claim wears its machine id and timestamp. A person judges abandonment at the desk and the quiet force flag releases it. Silence is the threat model, not malice - the owner's ruling.
- Does the engine pushing not break the never-push law? The relaxation is surgical: the seed stub and the claim file, as machinery acts. Work never pushes; v3 stays the owner's hand.
- What about a machine that is offline? It cannot claim - honestly. It keeps walking what it already holds; claiming needs the remote by construction.
- Will parallel trunk landings not collide? That risk stands on the register (raid-risk-many-writers-one-ledger) with the one-trunk merge discipline as mitigation and the sync duplicate sweep riding this very iteration.
- And the autonomy rework in the same iteration - scope creep? The standing rule pulls mechanical work in beside one novel idea; the walking-breakage risk is registered with the cut-over-then-remove mitigation.

## findings_folded

Two folds, both sharpenings rather than breaks.

- The claim must WEAR ITS AGE where a person looks: the container shows each claimed iteration's machine id and claim time, or abandonment cannot be judged. Folded into the claim design; becomes a requirement at M3.
- Offline machines cannot claim, and that limit is stated plainly rather than engineered around. Folded into the non-goals' spirit; the M3 register gets it as a stated constraint.

No question broke the vision or the move; the FAQ's sharpest edge (the lock could be fiction) already stands as the register assumption with its probe.

## follow_up

The busbar is fed: all M1 legs stand stamped. The gate presents to the owner - their bless was reserved in their own words.

## anything_else


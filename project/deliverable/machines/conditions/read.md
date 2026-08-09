---
condition: read
---

# read — proven reading of the listed documents

Arguments: the documents (root-relative paths) that must be READ before the
state can be left (exit) or entered (entry).

A PULLED DOCUMENT IS A READ DEMAND. There is no second kind of obligation
(owner ruling 2026-07-31). Guidance bound to a state by a tag or by the root
joins the same list, is proven the same way, and is refused the same way.
What differs is only PROVENANCE, and every document carries its own
`sources` saying what put it there — authored on the state, bound by a tag,
or consumed. Boot is the one exemption, and it is a bootstrap rule: guidance
cannot be demanded before the contract explaining guidance has been read.

THERE IS NO SESSION HANDOVER TO READ ANY MORE (owner ruling 2026-08-07).
`.se/HANDOVER.md` used to join boot's exit list and be destroyed as the state
was left, with a matching demand refusing `end` until one was written. Both
are gone. The duty only discharged on the tidy path, and sessions are killed
rather than ended, so it almost never fired.

The last session is DERIVED from the call log instead and rides the boot
banner. Nothing to read, nothing to prove, nothing to remember to write.

The proof is per hand:

- **The agent reads, and reading IS the proof.** `se_file_read` credits a
  document as it serves it. The pull serves one document and names its
  LAST WORDS; handing those back credits it, at the version served.
  The tail is asked for because a host that truncates a large result
  drops the END — so the tail is what a preview cannot produce. An
  EDITED document drops its credit and is asked again; after a
  compaction the pull simply answers `read` again.
- **The human checks the box.** In the mirror, each doc carries a
  checkbox: one check per VERSION of the file. The check pins the doc's
  current hash; an edited doc unchecks itself and asks again.

The condition's status shows met when EITHER hand has proven every listed
doc at its current version — the agent's passing walk turns the mirror's
pill green too. The checkbox stays the human's alone: a green pill with
empty boxes means the agent read, the human did not. An edited doc drops
both proofs and asks again.

THE TAKEOVER RULE: the human's checked docs are the SESSION's reading
list (`human_checked` in every packet). When the agent takes over — the
slider rises mid-walk — its walk must earn that same reading through the
lane, even past transitions the human already walked: their checkmark is
not the agent's reading.

IT WAS CALLED THE HANDOVER RULE until 2026-08-07, which collided with the
session handover file that has since been retired. Two unrelated ideas under
one name cost a diagnosis, so this one is named for what it describes: one
hand taking over from the other mid-walk.

Reading is what the machine is FOR — the credit proves the doc passed
through the agent's hands at its current version, and the engine will
not walk over a document that has not.

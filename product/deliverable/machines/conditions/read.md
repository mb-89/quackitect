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
cannot be demanded before the contract explaining guidance has been read. A left-behind session handover
(.se/HANDOVER.md) joins boot read_contract's exit list while it exists — and
the engine DESTROYS it as that state is left, so it is read exactly once
(owner ruling 2026-07-31). The matching demand sits at the other end: the
main machine refuses to reach `end` without a handover written that session.

The proof is per hand:

- **The agent reads, and reading IS the proof.** `se_reading` and
  `se_file_read` credit each document as they serve it, at the version
  they served. Nothing is handed in — the hash-supplying lane retired
  with the tick (2026-08-02), because a proof you can type is a proof
  you can fake. An EDITED document drops its credit and is asked again;
  after a compaction the pull simply answers `read` and the loop
  re-serves what must be read — that is the point.
- **The human checks the box.** In the mirror, each doc carries a
  checkbox: one check per VERSION of the file. The check pins the doc's
  current hash; an edited doc unchecks itself and asks again.

The condition's status shows met when EITHER hand has proven every listed
doc at its current version — the agent's passing walk turns the mirror's
pill green too. The checkbox stays the human's alone: a green pill with
empty boxes means the agent read, the human did not. An edited doc drops
both proofs and asks again.

THE HANDOVER RULE: the human's checked docs are the SESSION's reading
list (`human_checked` in every packet). When the agent takes over — the
slider rises mid-walk — its walk must earn that same reading through the
lane, even past transitions the human already walked: their checkmark is
not the agent's reading.

Reading is what the machine is FOR — the credit proves the doc passed
through the agent's hands at its current version, and the engine will
not walk over a document that has not.

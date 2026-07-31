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

- **The agent sends hashes.** A doc's hash is a token you can only hold by
  reading through the lane — `se_file_read` returns it; packets never
  print it. Tick with `read_hashes: {"<path>": "<hash>", ...}`; every hash
  must match the doc AS IT STANDS, and it is demanded fresh on every tick.
  After a compaction the tokens are gone from your head — re-read, that is
  the point.
- **The human checks the box.** In the mirror, each doc carries a
  checkbox: one check per VERSION of the file. The check pins the doc's
  current hash; an edited doc unchecks itself and asks again.

The condition's status shows met when EITHER hand has proven every listed
doc at its current version — the agent's passing tick turns the mirror's
pill green too. The checkbox stays the human's alone: a green pill with
empty boxes means the agent read, the human did not. An edited doc drops
both proofs and asks again.

THE HANDOVER RULE: the human's checked docs are the SESSION's reading
list (`human_checked` in every packet). When the agent takes over — the
slider rises mid-walk — its advances must prove that same list by hash,
even past transitions the human already walked: their checkmark is not
the agent's reading.

Sending a hash without reading defeats the machine's whole purpose — the
hash proves the doc passed through your hands, not your head. Reading is
what the machine is FOR.

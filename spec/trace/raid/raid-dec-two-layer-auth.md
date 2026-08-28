---
unreachable_refs:
  - cand-thin-worktree
minted_in: i1
id: raid-dec-two-layer-auth
type: "[[raid]]"
kind: decision
statement: Authorisation splits in two — which tools a step exposes, and whether this call's path is allowed here — so a write is judged by its path.
owner: the maintainer
trigger: any write landing outside the record from inside a bound walk
status: decided
impact: Wrong, the 2026-08-07 breach class returns and a record's copy fans out over trunk.
breaks_how_badly: crippling
how_likely: conceivable
source_refs:
  - opt-two-layer-authorization
  - cand-thin-worktree
  - req-acts-carry-role-and-channel
  - req-nothing-a-copy-does-reaches-its-source
---

The third seam, and where the thin tree pays off: with the record's tree
holding only the record, "inside is writable, outside is not" is a one-line
path judgment instead of a rule about verbs.

## Rejected options

- [[opt-token-block-with-staff-and-ticket]] — authorisation as a granted
  token, judged at issue time rather than at the write.
- [[opt-the-slider-decides-who-blesses]] as the ONLY layer — the dial says
  who decides, and says nothing about where a write may land.

## Consequences

- The state's legal-tools list stays the first layer, unchanged.
- The path judgment is the second layer, and it is mechanical.

---
minted_in: i1
id: req-overlay-drift-reported
type: "[[requirement]]"
statement: When the loaded engine no longer matches what the overlay or the vendored folder expects, the engine shall report every diverged identity and path instead of serving a default.
kind: functional
verify_method: test
breaks_if_removed: An engine update silently swaps a builder's method back to the shipped one, and nobody sees it happen.
breaks_how_badly: crippling
refines:
  - uc-vendor-and-overlay
source_refs:
  - uc-vendor-and-overlay ext 6a
  - ".se/req-mine-v1.md: refusals and honesty (a cache miss is labeled distinctly from a failure)"
  - uc-vendor-and-overlay ext 3a
  - ".se/req-mine-v2.md: dependencies and the ship review (divergence is mechanically detected; diverged never flips silently)"
priority: should
weighs_against:
  - req-open-notes-stay-visible >
  - req-the-source-keeps-no-record-of-a-copy > — a silent fallback is the DEFAULT behaviour of any naive implementation, so it bites without anybody choosing it; a registry of copies requires somebody to build one first
---

## Detail

Each drift it names:

- When an overlay entry names an identity the loaded engine version no longer provides, the pull shall report that identity as unresolved instead of serving the engine's default.
- When a copy's content differs from the version it was copied from, the system shall be able to report every differing path, AS A STATEMENT OF WHAT THIS COPY HAS CHANGED rather than as a fault. A copy's owner may change anything it carries, so divergence here is the ordinary case and not an alarm.
- Where an update is about to land, that same report is what makes the update decidable: it is the only thing that can say which of the copy's own changes the update touches.

---
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
  - uc-vendor-and-overlay ext 1a
  - ".se/req-mine-v2.md: dependencies and the ship review (divergence is mechanically detected; diverged never flips silently)"
priority: should
weighs_against:
  - req-open-notes-stay-visible >
---

## Detail

Each drift it names:

- When an overlay entry names an identity the loaded engine version no longer provides, the pull shall report that identity as unresolved instead of serving the engine's default.
- When the engine loads over a vendored folder whose content differs from the shipped snapshot, the engine shall report every diverged path.

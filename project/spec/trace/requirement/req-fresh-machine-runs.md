---
minted_in: i1
id: req-fresh-machine-runs
type: "[[requirement]]"
statement: When a person sets up the product on a fresh machine, the engine shall reach a verified working state through the published entry point with zero steps outside it.
kind: quality
verify_method: demonstration
breaks_if_removed: A colleague cannot run a clone, and the vehicle-owner audience is cut off.
breaks_how_badly: crippling
refines:
  - uc-quality-flexibility
source_refs:
  - uc-quality-flexibility step 1
  - uc-quality-flexibility ext 1a
  - ".se/req-mine-v2.md: distribution (v2-098)"
  - ".se/req-mine-v1.md: lifecycle and distribution"
  - stk-vehicle-owner
priority: should
weighs_against:
  - req-setup-floor-editor-shell >
  - req-newcomer-leaves-able-to-ask > — crippling outranks abrasive on the damage scale
  - req-desk-offers-a-tour > — both touch a newcomer's first hour, and a machine that will not install has no tour to offer. THIS REPLACES AN UNREASONED EDGE IN THE OPPOSITE DIRECTION, which made the standing judgments cyclic: this row already sat above the whole tour chain, and the tour's own bottom pointed back up at it
---

## Detail

- The bar: install and verify through the published entry plus the platform's stock package tool alone.
- The bar holds cross-platform; the vehicle-owner's colleague cloning the vehicle is the reference case.

## Scenario

- source: a person at a machine that has never seen the product, the vehicle-owner's colleague included
- stimulus: they run the published install entry
- artifact: the installed system and its self-verification
- environment: a fresh machine on a supported platform
- response: the system installs, verifies itself and reports ready
- response measure: steps outside the published entry = 0; the demo runs on the first attempt

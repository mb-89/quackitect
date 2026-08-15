---
minted_in: i1
id: req-entry-speaks-plainly
type: "[[requirement]]"
statement: The entry documents shall carry zero bare method terms, with every method term present linked to its definition.
kind: quality
verify_method: inspection
breaks_if_removed: Newcomers bounce off the front door, and the i17 red-team and i19 cold-read rework repeats.
breaks_how_badly: corrosive
refines:
  - uc-quality-interaction-capability
source_refs:
  - uc-quality-interaction-capability step 2
  - uc-quality-interaction-capability ext 2a
  - stk-newcomer
  - owner law 2026-07-12 — entry documents carry no method jargon
  - ".se/req-mine-v1.md: voice, entry, and readability"
priority: should
weighs_against:
  - req-newcomer-leaves-able-to-ask >
---

## Scenario

- source: a newcomer with no method vocabulary
- stimulus: they read a front-door document
- artifact: the entry documents: the README and what the entry chain names first
- environment: first contact, nobody beside them
- response: every sentence reads plainly, and a method term appears only with its definition one link away
- response measure: bare method terms in entry documents = 0

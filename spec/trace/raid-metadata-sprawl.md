---
id: raid-metadata-sprawl
type: raid
kind: assumption
probability: 0.4
impact: 0.6
mitigation: derive over store - no per-node audience tags
owner: project-owner
status: mitigated
statement: DITA-style metadata sprawl was the recorded M1 risk.
class: review
killer: false
---
DITA-style metadata sprawl was the recorded M1 risk. The mitigation held: audience and status stay DERIVED; only judgment classifications (facets) are stored, vocabularies type-gated.
(Backfilled at the i12 pilot migration from M1-frame.md and M6-evidence.md.)

---
id: req-recommendation-carries-alternative
type: "[[requirement]]"
statement: "When the desk recommends a vehicle, the desk shall recommend the smallest vehicle that honours the gates, and the recommendation shall carry every part the Detail table names."
kind: functional
verify_method: inspection
breaks_if_removed: "The person chooses blind, with no reason to trust the pick and no alternative to weigh."
refines:
  - uc-get-work-routed
source_refs:
  - uc-get-work-routed step 4
priority: should
---

## Detail

## Detail

| part | content | bound |
| --- | --- | --- |
| vehicle | the smallest that honours the gates | exactly 1 |
| reason | why this vehicle fits this work | its cost named |
| second-best | the next option and what it costs | exactly 1, with its cost |

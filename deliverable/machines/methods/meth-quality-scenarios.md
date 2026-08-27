---
kind: method
statement: A quality demand becomes measurable when it is written as a six-part scenario. The six parts are below.
---

## Situation
M3: qualities are requirements of kind quality, each carried by a scenario. The ISO 25010 tree is the elicitation aid - walk it to find the qualities that matter; write scenarios only for those.

## The nine characteristics, walked as a checklist #work

ISO/IEC 25010:2023 names nine. Each stands as a node in spec/trace/use-case/, carrying its own sub-characteristics.

- FUNCTIONAL SUITABILITY. The functions the need calls for, under stated conditions.
- PERFORMANCE EFFICIENCY. Time and resources spent doing that.
- COMPATIBILITY. Sharing an environment, and exchanging information with what is there.
- INTERACTION CAPABILITY. Specified users working it through its interface.
  - Replaced usability in 2023.
- RELIABILITY. Performing over a stated period, and surviving a fault.
- SECURITY. Access matching authorisation, and an act staying attributable.
- MAINTAINABILITY. Being changed to improve, correct or adapt.
- FLEXIBILITY. Being adapted to a new requirement, context or environment.
  - Replaced portability in 2023.
- SAFETY. Avoiding a state that endangers life, health, property or the environment.
  - New in 2023.

WALK ALL NINE, WRITE SCENARIOS FOR FEW. The walk is the elicitation aid and it is now a set question at write-requirements, answered one line per characteristic. A characteristic the change does not touch is answered and left alone.

THE NINE quality-area USE CASES ARE FIXED, never freely authored — see the
closed-list rule in deliverable/machines/items/use-case.md. A quality requirement
`refines` one of the nine; it never gets a new use case or value prop of its
own.

## Form #work
- source (who/what initiates) | stimulus (the event) | artifact (what is hit) | environment (under which conditions) | response (what the system does) | response measure (the pass line, with tolerance).

## Procedure #work
- The response measure is the requirement's pass line. No measure, no
  requirement.
- A quality scenario is also a formulated example.
  - At M5 it is walked analytically against the baseline.
  - At M7 the measurable ones become fitness checks.

## Sources

- The SEI ATAM scenario form.
- The ISO 25010 tree.
- The SyA NFR deck.

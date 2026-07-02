---
id: uc-monotonic-walk
type: usecase
refines: [need-engage]
statement: A composed checklist cannot let `quack next` jump a later milestone ahead of an unblessed gate — milestone-monotonic wiring is verified mechanically, not by composer discipline.
class: review
killer: false
---
## Rationale (not load-bearing)
Caught live in i0002: M6 build-* checks were ready before the M5 spike. The compose rule exists in engage.md; this makes the engine enforce it. Pulled from backlog at the i8 M1 gate (markus, 2026-07-02).

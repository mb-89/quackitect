# Override (M1) — accept the large i0003 scope as one iteration

Logged at the M1 gate, per `guides/milestone-review.md` ("an override blesses past a red-team flag; log it WITH its dissent").

**Decision (human, i0003 M1):** keep the full scope in one iteration — Go port, engine/vehicle split, overlay resolver, hand-rolled parsing, cli-help fix, dependency-check prompt, unique-id guard, and the report trace-graph filter. Do not split.

**Rationale:** the classic over-scope caution is calibrated for human teams' cognitive limits and is weaker for AI-driven work. For a human team the human would have split this iteration. The port-is-separation synergy also means a split would do the separation work twice (the rework the retro hunts).

**Dissent (the red-team position being overridden):** standard systems-engineering guidance says split a large iteration to cut risk and cognitive load. That position is acknowledged and set aside for the reason above.

**Kill-criterion:** if the M5 spike shows report determinism or behavior parity (R1 / R2) is shakier than expected, split the report-shell + trace-filter work out into a follow-on version rather than forcing it into i0003. Re-raise at the M5 gate.

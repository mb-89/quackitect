# Override — M1 scope (i0002)

**Gate:** M1 (frame + success).

**Finding (milestone review, red-team round):** i0002 bundles ~7 concerns at systematic rigor —
trace/task split, version management, metrics (+ attest migration), ship-label, verify tool,
review-system + start/end brackets, milestone-structured plans + report rework. Over-scoped; the
review recommended splitting metrics, version-management, and the review-system into their own
versions, since one M4 ADR cannot soundly decide trace-model + attest-event-log + review-process
together.

**Decision (human): OVERRIDE — no split, keep all in.**

**Reasoning:** tool/infra improvements should be done as early as possible, not deferred to
dedicated iterations; the classic over-scope caution is calibrated for human teams' cognitive
limits and is weaker for AI-driven work, which holds broader scope/context.

**Dissent (stands, not erased):** the blast radius spans the engine, the report, the attest
format, and every rigor policy; risk of a milestone gate that cannot be honestly reviewed.

**Kill-criterion:** if the bundled scope produces thrash — a milestone review that cannot honestly
pass, or high rework/reversal — raise it at the next retro and split.

# M3 — Candidate architectures (i0024_hygiene)

## alternatives elaborated -> i24-m3-2-alternatives-elaborated

Two decision axes, two elaborated rivals each:

- Reload lane: `cand-supervisor-child` vs `cand-console-first`.
- Query substrate: `cand-query-in-engine` vs `cand-query-obsidian-cli`.

The remaining scope items are single-shape fixes with no viable architectural rival:

- the voice wave
- the root hashing
- the two guards
- the scaffold arming

Their alternatives were behavioral. They got lettered on the M1 risk cards instead.

## criteria weighted -> i24-m3-criteria-weighted-derived

Derived from the requirement set, weights sum to 1:

- Trust chain intact (hashed, tested, deterministic): 0.35 — carries req-root-content, req-query, the whole ledger premise.
- Zero dependencies, one binary: 0.25 — the engine's standing law, req-mcp-birth's Go-less machines.
- Same-session agent experience: 0.25 — the owner's explicit ask behind req-query and req-mcp-reload.
- Build cost and moving parts: 0.15 — hygiene iteration, small steps.

## feasibility rough-checked -> i24-m3-feasibility-rough-checked

- `cand-supervisor-child`: Go child-process proxy over stdio is stock library work. The staged-binary path already exists (the build's stage-and-adopt). Risk is the swap seam; mcpmon proves the buffer-then-notify sequence. Feasible.
- `cand-console-first`: trivially feasible; it is today's behavior.
- `cand-query-in-engine`: the Bases evaluator exists (base.go, pooled queries). Plumbing plus output shaping. Feasible.
- `cand-query-obsidian-cli`: feasible mechanically. It breaks the zero-dep battery. It puts an unhashed evaluator in the read lane. Disqualified on criteria, not on feasibility.

## Review Verdict -> i24-m3-gate

Verify: four candidate nodes exist with honest rival elaboration; criteria trace to requirements.

Validate: both axes answer the owner's actual asks; no rival is a straw man — console-first is genuinely viable and cheaper.

Red-team: the strongest case against the supervisor is complexity for a convenience. Priced: if the M5 probe shows the harness does not adopt list_changed live, the supervisor loses its main payoff and console-first wins on cost. That kill-criterion rides the M4 decision.

Verdict: pass. Ready for the gate bless.

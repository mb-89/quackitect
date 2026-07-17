# M4 — Decide the architecture (i0024_hygiene)

## chosen architecture stated -> i24-m4-chosen-architecture-stated

Two winners, one per axis:

- Reload lane: `cand-supervisor-child`. The MCP surface becomes a thin parent over a swappable child engine.
- Query substrate: `cand-query-in-engine`. The pinned Bases subset answers all agent reads.

Deciding ADRs:

- [adr-mcp-supervisor](../../decisions/adr-mcp-supervisor.md)
- [adr-query-in-engine](../../decisions/adr-query-in-engine.md)
- [adr-voice-ratchet](../../decisions/adr-voice-ratchet.md)

## choice traced to the weighted criteria -> i24-m4-choice-traced-to

Pugh, reload axis. Datum: `cand-console-first` (the strongest viable rival).

- trust chain (0.35): 0 — both stay engine-owned
- zero dependencies (0.25): 0 — the proxy is stock library work
- same-session experience (0.25): +1 — the owner's explicit ask
- cost and moving parts (0.15): -1 — the proxy seam is real complexity

Weighted score: +0.10. The supervisor wins on the criterion the owner set.

Pugh, query axis. Datum: `cand-query-obsidian-cli` (full-fidelity rival).

- trust chain (0.35): +1 — hashed, tested, in the battery
- zero dependencies (0.25): +1 — no external runtime
- same-session experience (0.25): 0 — both answer live
- cost (0.15): +1 — the evaluator already exists

Weighted score: +0.75. In-engine wins decisively.

Sensitivity, reversed: the supervisor LOSES the moment same-session adoption fails on the live harness. That world is credible — the docs promise it, but no probe has run here. Recorded tripwire: the M5 `list_changed` probe. Fallback: `cand-console-first`, and `req-mcp-reload` re-scopes to the console lane. The query axis has no credible flip: the subset-cost world re-opens `adr-query-in-engine` only if a needed query exceeds the pinned subset.

## views chosen -> i24-m4-views-chosen-model

Two models, the default budget:

- [model-agent-lanes](../../models/model-agent-lanes.md) — element-tree. Question: where do the lanes and guards live? It allocates every element the build fills.
- [model-reload-sequence](../../models/model-reload-sequence.md) — sequence. Question: how does a staged binary reach a live session?

Rejected kinds, with reasons:

- context: the workspace context is unchanged; the existing context view holds.
- state: the swap has no state machine worth a view; the sequence carries it.

## structuring method considered -> i24-m4-structuring-method-considered

Skipped, recorded: ten elements on one axis is below any DSM payoff. The cut is obvious.

## ADR recorded and traced -> i24-m4-adr-recorded-and

Three ADRs, each addressing its requirement. The derived check computes live.

## architecture model ready -> i24-m4-architecture-model-ready

Both models exist with elements allocated ahead of code. The build fills exactly these blocks. A new element found mid-build returns to architecture review.

## Review Verdict -> i24-m4-gate

Verify: both models render. The ADRs trace. The Pugh runs use honest datums.

Validate: the decision answers the owner's two asks. The kill-criterion from M3 rides the sequence model.

Red-team: the supervisor's proxy seam is the riskiest element. The refusal-exit crash from this walk proves the class is live. The seam therefore carries its own element in the model, and M6 guards it with the JSON-RPC error rule.

Verdict: pass. The owner reviews the two diagrams at this gate.

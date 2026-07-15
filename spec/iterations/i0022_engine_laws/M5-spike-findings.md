# M5 — Prove the riskiest unknowns (evidence)

## riskiest assumptions validated  → i22-m5-riskiest-assumptions-validated

Three spikes, run 2026-07-14 evening.

Spike 1 — is "a milestone review is in hand" computable at dispatch? YES.
`StatusMap` (engine.go) already computes every check's state for `next`; a gate is
identifiable by its milestone field and `-gate` id; readiness is dep satisfaction —
the exact computation `cmdNext` (ops.go) runs today. The guard reuses it, no new
state. Cost: one status pass on a selftest call — a command that runs the full
battery anyway.

Finding that ADVANCED the design (the spike's job): an unconditional selftest
refusal would also hit the M6 slot-end hand-back battery the implementation
fragment currently names. The evidence (owner complaint, 72 selftest calls in
i21) says the battery belongs to GATES. Resolution recorded: the refusal targets
the FULL battery only; single-test selftests and quack verify stay lawful
everywhere; the fragment's slot-end wording is re-documented at the M7
consistency sweep. req-selftest-gate.1 and test-selftest-gate amended BEFORE any
red observation (no stranded red).

Spike 2 — will this harness load the MCP tools? THE GAP IS FOUND AND NAMED.
.mcp.json is present and `quack mcp` answers tools/list (M2 probe). Neither
.claude/settings.json nor settings.local.json approves the project server
(no `enabledMcpjsonServers`). Claude Code loads project MCP servers only after
approval. Fix at M6: commit `enabledMcpjsonServers: ["quack"]` in
.claude/settings.json (the repo-durable home). A FRESH session is needed to load
it — the M7 live demo of the tools belongs to the next session's opening, exactly
like i21's phone-lane demo.

Spike 3 — do grant events fit the ledger? YES.
`Event` (engine.go) carries Action, Actor, Channel, and omitempty fields; a
grant-open/grant-close Action pair plus one `grant` omitempty stamp on covered
bless events is additive — old readers ignore unknown fields, hashes and the
prev_hash chain stay untouched (the migrate-actors precedent for additive event
changes).

## design is buildable  → i22-m5-design-is-buildable

Every model-guard-tree leaf has a located seam: the dispatch pass wraps the
existing command switch (cli.go); the verdict guard wraps the one cache-write
path (spike 3 of i21's hazard note located it); the battery trio lives in the
runner loop; the lints extend the existing lint pass and selftest corpus; the
grant rides the attest event store. No leaf needs a new subsystem. The three
RAID mitigations are all assertion- or message-level — nothing structural.

## spike results recorded  → i22-m5-spike-results-recorded

Design advanced twice from evidence: the full-battery-only refusal (spike 1,
requirement amended pre-red) and the settings.json approval as part of
req-mcp-discoverable's realization (spike 2). No requirement fell; no
architecture changed; the two models stand.

## Review rounds and verdict  → i22-m5-gate

Round 1, verify: each spike names its file-level evidence (StatusMap/cmdNext,
the settings files' contents, the Event struct). The requirement amendment
happened before any observe-red — no stranded record.

Round 2, validate: the three spiked unknowns are exactly the three the M1 kill
criterion and raid-over-blocking pointed at. The kill criterion did NOT fire:
the predicate is computable, so req-selftest-gate ships as shaped.

Round 3, red-team: sharpest attack — spike 2 "validated" the MCP fix without
seeing the tools load. True and held honestly: loading needs a fresh session by
the harness's design; the M7 demo carries a recorded tripwire (adr-mcp-lane-declared),
and the block stays inactive until the lane demonstrably works.

Verdict: PASS. Blessed under the standing grant; collected for the morning review.

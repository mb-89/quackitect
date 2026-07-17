# M6 — Build & verify (evidence)

## build planned  → i22-m6-build-planned-decomposed

Ten steps, children of the build task - each one design concern and one durable
checkpoint. Real prerequisites only:

- b2 needs b1's store.
- b4 needs b3's guard layer.
- b8 needs b5's guarded write.

Everything else hangs flat off the M5 gate.

- i22-b1-grant-store: grant events (go-grant-store)
- i22-b2-grant-review: the collection surface (go-grant-review) ← b1
- i22-b3-guard-selftest: dispatch guard layer + battery predicate (go-guard-selftest)
- i22-b4-guard-cli: declared lane + refusal + harness approval (go-guard-cli) ← b3
- i22-b5-verdict-guard: busy discard + first-green withhold (go-verdict-guard)
- i22-b6-battery-progress: the n/N line (go-battery-progress)
- i22-b7-battery-batch: cache answer on unchanged content (go-battery-batch)
- i22-b8-battery-parallel: bounded worker pool (go-battery-parallel) ← b5
- i22-b9-voice-lint: the statement lint (go-voice-lint)
- i22-b10-recital-chain: the wording-chain selftest (go-recital-chain)

Per-step ritual, binding: author the test → `observe-red` RECORDS the failure →
implement to green → targeted selftest only. The battery waits for the gate.
All 11 reds were observed 2026-07-14 ~20:56 before any implementation landed.
One slip: the statement-3 honesty amendment of req-standing-grant landed AFTER
the red, stranding test-standing-grant's record. Marked exempt with the reason
(adr-red-unobservable) and noted for the retro (the i21 b13 class recurred).

## grant ledger events  → i22-b1-grant-store

go-grant-store in [i22_laws.go](../../../product/engine-go/i22_laws.go):

- grant-open and grant-close events with scope and expiry.
- blessGrantCheck refuses an uncovered agent killer-bless (cmdBless wires it,
  exit 5).
- a covered bless stamps `grant:`.
- grant open on the agent channel needs an explicit --by user delegation.

selftest:standing-grant green. Proven live the same minute:
grant-20260714-213558 (scope i22-*, 12 h) records the owner's chat delegation
of this stretch.

## morning-review surface  → i22-b2-grant-review

go-grant-review: `quack grant review` lists the latest grant's collected blesses for the
owner's confirmation; `grant close` prints the same collection at the stretch's end.

## dispatch guard layer  → i22-b3-guard-selftest

go-guard-selftest: walkGuard runs as ONE pass in Dispatch before any handler.
The pure rule (walkGuardDecision) refuses an agent-channel FULL battery while
no milestone gate of the active version is ready or suspect, naming verify and
the gate as the lawful lanes. The readiness pass runs lazy, so the guard never
runs tests to decide whether tests may run. selftest:selftest-gate green.

## declared agent lane  → i22-b4-guard-cli

go-guard-cli: `agent_lane = "mcp"` in spec/project.toml activates the piped-ledger
refusal with the MCP pointer (q-cli-steering ruling A; adr-mcp-lane-declared's
activation boundary). The harness approval (`enabledMcpjsonServers: ["quack"]`) is
committed in .claude/settings.json. The declaration itself stays UNSET until the next
session demonstrates the tools loading (raid-over-blocking escape).
selftest:cli-steer and selftest:mcp-surface green.

## verdict-write guards  → i22-b5-verdict-guard

go-verdict-guard wraps the one cache-write path in runSelftestCached: a run that
CONSUMED a vacuous busy answer is discarded with a printed reason; a first green on
a current-iteration test with no red record and no exemption is withheld and flagged.
The discard fired LIVE during its own selftest run.

Sharpened mid-walk by the first battery pass: the naive counter discarded the
render-TRIGGERING test too (its nested probes tripped while it got the real render),
so each pass lost one verdict. The rule is now DEPTH-SCOPED (runSelftestTracked):
a frame discards only when a busy consult happened at its own depth. The selftest
guards both sides of the class: the vacuous consumer discards, the parent of a
nested trip records. selftest:busy-no-record and selftest:first-green-guard green.

## battery progress line  → i22-b6-battery-progress

go-battery-progress: the full battery prints `[n/N] selftest <name> <status>` per test.
selftest:battery-progress green.

## battery batch answer  → i22-b7-battery-batch

go-battery-batch: the full battery consults the verdict cache under `battery:` keys
with the merkle root as input - an unchanged workspace answers from the cache, any
content move or rebuild re-runs. Standalone workspace watchers are excluded (they stay
live, adr-standalone-suite). selftest:battery-batch green.

## battery worker pool  → i22-b8-battery-parallel

go-battery-parallel: the SAFE set (an explicit and deliberately grown
allowlist - pure predicates and read-only checks) runs on a bounded pool.
Results return to the main goroutine, which owns every verdict write. Overlap
is proven by handshake, not by timing (raid-guard-timing-flakes).
selftest:battery-parallel green.

## voice lint  → i22-b9-voice-lint

go-voice-lint: an ADVISORY lint lane over authored statement fields - spaced-dash
clause joins (three-plus words a side) and sentences past thirty words flag, capped at
twenty printed findings. selftest:voice-lint green.

## models adhered-to  → i22-m6-models-adhered-to

All ten leaves of model-guard-tree are realized as `design:` regions in
[i22_laws.go](../../../product/engine-go/i22_laws.go). The onion
(model-engine-layers) allocates every one by essence (seven rim, three band).
The sky-fall lint ran RED first (seven unallocated regions). The allocation
landed. It now runs clean - the conformance loop worked as designed. No
element was invented beside the diagram. One region was restructured (grant
review extracted from the grant store) to keep regions unnested.

## implementation risks acceptable  → i22-m6-implementation-risks-acceptable

- raid-over-blocking: held. The console takes no new refusal; every refusal names its lawful lane; the CLI block stays INACTIVE (agent_lane unset) until the next session proves the MCP tools load.
- raid-grant-rubberstamp: held. The live grant (grant-20260714-213558) collects every bless; `grant review` lists them; the metric clause is in need-engage.
- raid-guard-timing-flakes: held. The concurrency proof is a handshake, not a stopwatch; no test asserts durations.
- New risk found and closed in-walk: the CLI block would have stranded the walk (chicken-and-egg, M4); the activation boundary answers it.
- Residual: the busy-discard is conservative under concurrency (one busy trip discards the run that saw it); a wrongly discarded verdict re-runs later - the safe direction.

## internal quality ok  → i22-m6-internal-quality-ok

gofmt runs clean over product/engine-go. The new code is two files plus
surgical seam edits. Pure rules sit apart from console shells. The guards
reuse existing predicates (channelInteractive / StatusMap / attestGatedCmds)
instead of new state.

Lint:

- coverage clean.
- EARS clean.
- conformance clean for i22.
- the remaining blocking finding is the book drift the ship regenerates.

Two pre-existing RAID field-enum findings were drained in passing (status
closed).

## recital chain selftest  → i22-b10-recital-chain

go-recital-chain: the engine's contract resource must carry the question-tool recital
mechanism + the TL;DR-card ruling + the preview lane; a present AGENTS.md must still
name the recital and the question. selftest:recital-chain green.

## suite observed RED  → i22-m6-suite-observed-red

Ten red records at pre-implementation hashes plus one honest exemption
(test-standing-grant, adr-red-unobservable) - the derived rule computes it.

## verification green  → i22-m6-verification-green-every

The full battery ran eagerly through `quack verify` in its own visible console,
three passes. Pass one caught a REAL regression my contract edit introduced (a
provenance smear the retired-vocabulary sweep refuses) - fixed at the source.
Pass two exposed the busy-guard over-eagerness (see the verdict-guard section) -
the rule was depth-scoped and its selftest sharpened. Pass three: every test
green across all iterations, coverage:tests-pass computes DONE.

## Review rounds and verdict  → i22-m6-gate

Round 1, verify: ten build steps - each with its design region + selftest +
evidence section. The derived checks (tests authored / suite red / designs
realized / verification green) all compute from the trace.

Round 2, validate: the build fills exactly the M4-allocated elements - the
sky-fall lint ran red on the missing onion allocations and clean after. No
element entered beside the diagram. The M1 criteria 1-5 and 7 are demonstrably
in. Criterion 6 (MCP lane live) is deliberately half-armed pending the fresh
session (adr-mcp-lane-declared).

Round 3, red-team: the battery's own three-pass history is the strongest
argument AGAINST self-certification here - two defects surfaced only under the
full run. Both were fixed at the class level with sharpened tests, not patched
around. Remaining doubt: the grant machinery was proven partly on its own
adjudications (this very gate's bless rides it); the morning review holds the
final word on every one of them.

Verdict: PASS. Blessed under grant-20260714-213558; the bless event itself
carries the grant stamp - the feature records its own audit trail.

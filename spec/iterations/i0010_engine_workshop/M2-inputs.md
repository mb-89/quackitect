# M2 — Requirements (i0010_engine_workshop)

## Inputs captured  → i10-m2-inputs-captured

**Context diagram (system-in-focus: the quack engine).**

```
                 ┌────────────────────────────────────────────┐
  user ────────► │                quack engine                │ ◄──── driving agent
  (console)      │                                            │       (harness, --key)
   status/why/   │  status · why · notes · mint · progress    │
   notes/report  │  build · selftest · start init/stubs       │
                 └──┬───────────┬───────────┬────────────┬────┘
                    │           │           │            │
              IN: spec/    IN/OUT: data home        OUT: vehicle
              (nodes,      (verdict cache NEW,      workspace
              ledger,      calls.jsonl NEW,         (scaffold,
              designs)     notes, logs, out)        launcher, entries)
                    │
              IN: vendored engine source ──► OUT: global binary (ratchet)
```

- **IN:** spec nodes + ledger, product design markers, vendored engine source, notes home, session key.
- **OUT:** board (status/report), pagers, minted nodes, calls.jsonl (new), verdict records (new), emitted vehicles, the global binary.

**Stakeholders by role.**

- **User** — reads the board, asks why, lists notes, runs retros. Wants ≤1s answers and real explanations.
- **Adjudicator** — answers pagers. Wants one hand-off per ready pair, not two.
- **Driving agent** — walks checks with a key. Wants deterministic, scriptable output.
- **Maintainer** — edits engine source. Wants the cache invalidated by build identity, not manually.
- **Vehicle owner** — scaffolds new projects. Wants the emitted world to match the current engine.

**Function tree (delta of this iteration).**

- Answer fast → record verdicts → key by input hash + build id → announce re-runs.
- Explain → name derived rule + delta in `why`.
- Show pending work → list notes (inbox; `--all` adds backlog/archive).
- Observe itself → append redacted call lines → aggregate at retro.
- Mint cleanly → dedupe sink → accept `--rationale`.
- Emit modern vehicles → project.toml root, launcher, vendored source, pointer-chain entries → ratchet by version.
- Hand over once → merge last-killer + gate pagers.
- Speak of the user → sweep prose/CLI wording, allowlist stamps.

**ISO 25010 quality tree — the vital qualities, as 6-part scenarios.**

1. **Performance efficiency:** user runs `quack status` on the reference machine with a warm cache (source: user; stimulus: status; artifact: engine; environment: warm cache) → board prints; measure: ≤ 1s.
2. **Reliability (cache honesty):** maintainer edits any test input or rebuilds the engine (stimulus: evaluation after change) → exactly the missed verdicts re-run; measure: zero stale verdicts served, proven by selftest.
3. **Usability (feedback):** a battery re-runs (stimulus: cache miss) → stderr announces before the first test, names each test >1s; measure: silent only when fully cached.
4. **Security (log hygiene):** agent passes `--key`/`--answer`/grant codes (stimulus: any dispatch) → calls.jsonl carries them redacted; measure: zero secret bytes at rest.
5. **Portability (vehicle):** vehicle owner runs `start init` on a clean machine (stimulus: emission) → workspace drives from inside via the launcher; measure: driveFromInside green, no `.quack`.

**Use cases.** The eight minted at compose: [uc-fast-board](uc-fast-board.md), [uc-explain-suspect](uc-explain-suspect.md), [uc-notes-visible](uc-notes-visible.md), [uc-call-observability](uc-call-observability.md), [uc-decision-hygiene](uc-decision-hygiene.md), [uc-modern-vehicle](uc-modern-vehicle.md), [uc-single-handoff](uc-single-handoff.md), [uc-user-wording](uc-user-wording.md).

**Environment assumptions, field-checked (per the M2 method line).**

- **Git clones stamp checkout-time mtimes** — the ratchet hazard's premise. Documented Git behavior and the exact failure observed in the 13:06 note; the M5 spike reproduces it with a fixture before the fix is designed.
- **The selftest battery is the only verification runner** — confirmed in code: `coverage:tests-pass` resolves through the one selftest registry (selftest.go); the cache sits at one choke point.
- **report-live costs ~5s per render** — measured 2026-07-04 (perf note); it is the battery's dominant cost and must be cached per build identity.
- **Harness auto-load channel** — field-proven today: Claude Code loads CLAUDE.md only; the scaffold must emit the pointer chain, not AGENTS.md alone.

## Stakeholder coverage  → i10-m2-stakeholder-coverage

Five roles enumerated above; each maps to at least one use case: user → uc-fast-board/uc-explain-suspect/uc-notes-visible/uc-user-wording; adjudicator → uc-single-handoff; driving agent → uc-decision-hygiene; maintainer → uc-call-observability (retro data) + cache invalidation (uc-fast-board); vehicle owner → uc-modern-vehicle. No role without a stake; no use case without a role.

## Requirements verifiable  → i10-m2-requirements-verifiable

Derived (`coverage:req-has-test`): every one of the 12 requirements carries a minted test wired `verify: selftest:<name>`. The engine computes this live.

## Requirements traced  → i10-m2-requirements-traced

Derived (`coverage:req-traced`): every requirement refines a use case; every use case refines one of the four existing needs (need-review, need-note, need-engage, need-workspace-drive). The engine computes this live.

## Milestone review  → i10-m2-gate

**Round 1 — verify.** 12 requirements, all EARS-shaped (`quack lint`: ears clean, 0 exemptions). Both derived checks compute green: every requirement has a test, every requirement traces to a need. The context, roles, function tree, and quality scenarios above anchor each requirement.

**Round 2 — validate.** Coverage against the M1 scope is 1:1 — cache (req-verify-cache, req-verify-feedback, req-status-fast), why (req-why-derived), notes (req-notes-list), call log (req-call-log), mint (req-mint-dedupe, req-mint-rationale), scaffold (req-scaffold-modern), ratchet (req-ratchet-semantic), pager (req-pager-merge), wording (req-user-wording). No scope item without a requirement; no requirement outside scope.

**Round 3 — red-team.** Weakest statements probed: (a) req-status-fast leans on "reference machine" — defined in the responsiveness guide, measured by a timed selftest, acceptable. (b) req-user-wording's stamp allowlist could become a loophole — bounded: the allowlist is exactly the recorded actor-stamp vocabulary, and its content is an M4 decision, not sweep-time discretion. (c) req-verify-cache covers report-live too, since selftests ARE the executed tests — the dominant 5s cost is inside the cache boundary. No unmet kill-criterion.

**Verdict: PASS** — proceed to bless. No reopened checks.

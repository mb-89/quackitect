# M6 — Build & verify (i0009_contract_attestation)

## Build planned → i9-m6-build-planned

Fifteen steps, one dependency chain, each a durable checkpoint carrying one design concern. Test-first: runners land first and are observed RED before any feature code.

1. **bs-runners** — failing selftests for every new test node (the RED set).
2. **bs-data-dir** — workspace-first data home; canonical paths; global config. *(everything after this has a home)*
3. **bs-attest-state** — hash-only key chain + command budget.
4. **bs-attest-ritual** — console grant code; letter-word challenge; redeem/renew.
5. **bs-attest-gate** — ledger commands refuse without `--key` on the agent channel; console exempt.
6. **bs-entry-render** — AGENTS.md + copilot-instructions.md rendered from contract.md; drift lint.
7. **bs-vv-scope** — derived coverage sees only the check's iteration and earlier.
8. **bs-report-ux** — suspect causes in the detail panel; filter clear / descendants / double-click / help.
9. **bs-decisions** — scrap sink; derived veto/defer/superseded; path + unrealized-adoption lints; `decisions --parked`.
10. **bs-mint** — `quack mint` + veto/defer/supersede sugar; graveyard backfill as first vetoes.
11. **bs-notes** — note lane writes to the data home; note.md prompt calls the engine.
12. **bs-global-bin** — global binary install; dumb launcher + bootstrap; startup ratchet with rename dance.
13. **bs-truth** — ledgers under spec/ledger/; spec/project.toml; findRoot flip.
14. **bs-migrate** — caches, notes, split log homes moved (count+size verified); .quack removed.
15. **bs-cleanup** — prompts, docs, regenerated entry files, full green sweep.

Order rationale: the data home (2) precedes every writer; attestation (3–5) lands before its own state would be migrated; the root flip (13) comes late so the whole build runs on stable plumbing; migration (14) is second-to-last so nothing writes to old homes after the move. Interruption anywhere resumes at the named step.

## Step log

All fifteen steps landed, in order, each blessed at its own green:
1. **bs-runners** — 26 probes authored against a not-built stub API; all observed FAIL live; `observe-red` recorded on every executed test node (tests-red green).
2. **bs-data-dir** — workspace-first home (`<base>/quackitect/<slug>/<kind>`), canonical-path slugging (casing/separators/symlinks), global user config. 3 selftests green.
3–5. **bs-attest-state / ritual / gate** — hash-only key chain with command budget; console grant + letter-word challenge + redeem/renew; dispatch guard on next/start/bless/ship/observe-red with console exemption. 7 selftests green. THE GATE WENT LIVE MID-BUILD and bounced its own builder; the adjudicator granted once (GRANT-…, actor=console); the walk carried `--key` from then on and self-renewed once at budget exhaustion (challenge answered from the live contract: rule 6 word 220, letter-indexed).
6. **bs-entry-render** — AGENTS.md + .github/copilot-instructions.md rendered from contract.md via method/entry templates inside `quack build`; byte-compare drift lint. 2 selftests green.
7. **bs-vv-scope** — derived coverage computes over nodes ≤ the check's iteration; validates-needs digest scoped the same; engage.md wording updated. The 74-suspect wave collapsed to the i3 tail (7).
8. **bs-report-ux** — suspect causes baked into the detail data; filter clear control, `descendants:<id>` predicate, double-click gesture, on-focus help. 2 selftests green.
9. **bs-decisions** — scrap sink, derived veto/defer/superseded, forward-only placement lint (grandfather verified live: zero findings on 26 historical ADRs), unrealized-adoption advisory, `decisions --parked`. 4 selftests green.
10. **bs-mint** — typed skeletons + veto/defer/supersede sugar; the five M3 graveyard losers minted as the first veto nodes THROUGH the new op; sink-aware trace rules (adr-traced, orphan holes).
11. **bs-notes** — note lane writes to the data-home inbox, `--file <path|->` multi-line body; note.md prompt calls the engine only.
12. **bs-global-bin** — global binary + dumb launcher with bootstrap build (proven live: fresh bootstrap ran); startup ratchet with rename dance; swap hardened with retries + build-next-launch fallback after live AV interference (fallback observed working: blocked swap → staged → adopted next launch).
13. **bs-truth** — spec/ledger/{attest,ears-baseline}.json (git-moved, blesses intact), spec/project.toml as root marker + config home, findRoot flipped with legacy fallbacks, config call sites → readProjectConfig.
14. **bs-migrate** — 628 files verified moved by count+size (notes tree, both split log homes merged, caches); `.quack` deleted; overlay + logsDir repointed; tools shim → product/tools; launcher updated.
15. **bs-cleanup** — method prompts/dependencies/entry templates de-.quacked; probes file tidied (stub API fully dissolved); vehicle-scaffold modernization parked as `adr-defer-vehicle-scaffold` (first defer node, listed by `decisions --parked`); perf note captured.

Incidents (all resolved in-walk, recorded honestly): the render-recursion trap the codebase documented was hit when a trace-wired selftest rendered (status hung) — fixed structurally (renderBusy latch + renderingTests skip + per-process coverage memo; report-live 90s→6s); the first blanket latch broke tests-pass-eval and was replaced by the render-scoped one; `quack status` now ~7s (retro note NOTE-…-perf).

## Internal quality ok → i9-m6-internal-quality-ok
Reviewed: every new mechanism sits in a marked design region tied to its requirements (coverage: clean, no holes); zero new dependencies (crypto/encoding stdlib only); hand-rolled parsing kept; error paths degrade gracefully (missing Go toolchain → warn and run; blocked swap → staged; missing marker → loud error); the strict parser gained two allowlisted keys with ref-integrity extended (sink-aware); hermetic selftests (temp state override); voice rules applied to all new prose.

## Implementation risks acceptable → i9-m6-impl-risks-acceptable
R2 (grep-gameable challenge) stands accepted as designed. New residuals: (a) AV interference with the swap — mitigated twice over (retries + staged-adoption, both observed working live); (b) `status` at ~7s vs the 1s responsiveness bound — real debt, noted for the retro with two concrete levers; (c) legacy fallbacks (root marker, overlay, vendor pocket, attest path) carry not-yet-migrated vehicles — parked deliberately in `adr-defer-vehicle-scaffold`. Nothing threatens the iteration's claims.

## Review rounds & verdict

**Round 1 — Verify.** All 26 executed tests: authored → observed RED (attested per node) → GREEN (full sweep, zero FAIL). Coverage: clean — no requirement without design, no ADR untraced, EARS 0 exemptions, no entry drift, no placement findings, no unrealized adoptions. The three derived M6 checks compute pass live.

**Round 2 — Validate.** Every M1 success criterion now demonstrably holds (bounce, self-renewal, byte-stable renders, clean status, amnesia-safe data home, strict-at-birth minting, one canonical home). The build didn't just implement the attestation — it RAN UNDER it for its second half, which is the strongest validation this iteration could produce.

**Round 3 — Red-team.** (i) "The walker granted itself relief by fixing tests mid-walk (filter-ux probe rewrite)" — held: the probe's CLAIM (markers present in what every render emits) is unchanged; the rewrite removed a recursion, not an assertion, and the incident is logged. (ii) "Legacy fallbacks contradict no-.quack" — they serve OTHER workspaces; this repo carries none, and the defer node parks the sweep with a named condition. (iii) "7s status violates a shipped guide" — true; recorded as debt, not waved off. Kill-criteria: none triggered.

**Verdict: PASS.** Build complete, verified green under its own gate.

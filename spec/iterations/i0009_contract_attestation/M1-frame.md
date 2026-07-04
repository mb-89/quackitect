# M1 — Frame the problem & vision (i0009_contract_attestation)

## Problem agreed → i9-m1-problem-agreed

Two deltas, both field-proven:

**The contract is dodgeable.** Prompt-level delivery of the binding rules fails in practice — obedience is a property of the harness, not the wording. Evidence: (1) Copilot never followed the AGENTS.md → contract.md pointer and never ran the engine at all (i6 field feedback, archived note `origin-field-i6-field-feedback-b`); (2) on 2026-07-04, Claude Code — a *thick* harness, mid-`engage start` — skipped the per-engage contract re-read and reordered retro steps until the owner intervened twice (origin of note `block-the-ledger-until-the-contr`). Both ready-when conditions on the parked thin-harness notes fired on this evidence. The failure mode is drift/optimization, not malice; the countermeasure must be structural, not advisory.

**The repo holds more than truth.** `.quack/` mixes committed truth (attest ledger, ears baseline, config) with regenerable caches (evidence, gather, overlay, report, golden) and private material (raw notes with personal data, 2026-07-03 walkthrough). Decisions live scattered as iteration-folder ADRs plus raw backlog notes with no derived classification; notes and trace nodes are hand-minted by agents, which produced format drift in this very session. The owner's directive 2026-07-04: fold the agreed data-leg redesign into this iteration rather than a separate one.

## Vision & scope stated → i9-m1-vision-scope-stated

**For** the owner (and anyone driving a quackitect workspace with an AI agent), **who** needs agents that provably operate under the contract and checkouts that hold nothing but truth, **the** i9 trust-and-data hardening **is** an engine release **that** (a) gates ledger-advancing commands behind an attestation ritual — read the contract, answer a deterministic challenge, recite to the adjudicator, one grant per session, chained context-bound keys with autonomous renewal — (b) renders every harness entry file (AGENTS.md, .github/copilot-instructions.md) from contract.md as single source, and (c) restructures state so the repository contains only recorded truth: no .quack anywhere, caches and raw notes in the per-workspace user data home, one global ratcheting engine binary, decisions as immutable classified nodes in spec/decisions/, all nodes engine-minted. **Unlike** advisory instructions and TTL/PID session heuristics, the session boundary is defined by key possession — the only storage that is born and dies with a context window.

Out of scope: spec-book (parked, backlog), methodology map, SyA gap bundles, evidence-merkle (parked). The engine-bypass ceiling stands: a harness that never runs quack is detected (pre-commit/status), not prevented — recorded, not solved here.

## Success is measurable → i9-m1-success-measurable

Ch1 criteria, each mechanically checkable at M7:
1. A keyless agent-channel ledger command exits nonzero naming contract.md (selftest:attest-block).
2. A granted session renews keys without further grants for its whole life (selftest:attest-renewal).
3. Entry files regenerate byte-identically from contract.md; drift is linted (selftest:contract-render, render-drift).
4. `git status` is clean after every non-truth command (selftest:clean-status).
5. Deleting the user data dir loses nothing adjudicated; a fresh clone renders the same board (amnesia test).
6. Every minted node passes the strict parser at birth (selftest:mint).
7. One log/data home per workspace regardless of shell or path casing (selftest:logs-canonical).

## Top risks logged (RAID) → i9-m1-top-risks-logged

Risks:
- R1 Grant friction: an unattended run's FIRST session stalls on the console grant. Mitigation: grant is once-per-session by design (owner-accepted); challenge-only renewals carry the rest.
- R2 Grep-gameable challenge: proves file-in-context, not comprehension. Accepted: target is drift, not adversaries; recitation covers comprehension socially.
- R3 Key lost to compaction mid-session → stall for re-grant. Accepted as rare-and-arguably-correct; agent may restate the key in working notes.
- R4 MSYS/mintty channel quirk mis-stamps console as agent → over-asks. Harmless direction (i8 precedent).
- R5 findRoot migration: switching the root marker breaks any existing vendored vehicle (duckpond). Mitigation: M5 spike + migration step; ratchet rebuild covers old engines.
- R6 Ship-a-zip bootstrap: client without global install AND without Go toolchain cannot run. Unchanged from today (build was always local); documented, not solved.
- R7 Migration churn: notes (30+), state files, split log homes — verified-move pattern (count+size) as in i8.
- R8 Scope: two themes in one iteration (owner-directed). Mitigation: M6 build plan slices them into independent resumable chains.

Assumptions: Go toolchain present wherever rebuild is needed; i8 channel detection remains sound.
Issues: logs already split across two homes (c5212d/9cb46b) — merge rides the build.
Dependencies: contract.md stability during the iteration (renders re-run on change); spec/project.toml format lands before findRoot flips.

## Review rounds & verdict

**Round 1 — Verify (built it right).** All four inputs delivered: the problem claim cites two dated field incidents whose archived notes exist (`origin-field-i6-field-feedback-b`, `block-the-ledger-until-the-contr`) and whose ready-when conditions demonstrably fired; the vision covers both scopes in Moore form with explicit out-of-scope; all 7 success criteria map to a mechanical check; risks are RAID-complete with mitigations. problem-agreed blessed by the owner (actor=human, pager y).

**Round 2 — Validate (built the right thing).** The frame matches the owner's directives verbatim: attestation + data-leg folded into one iteration (their call, 2026-07-04), ratchet model recorded, spec-book excluded. The unifying principle (structural enforcement over advisory; repo = truth only) is coherent, not a grab-bag. Watch item: R8 (combined scope) is real — its mitigation is deferred to the M6 build slicing, which is the right home.

**Round 3 — Red-team.** Strongest opposing case: "two killer-ADR themes in one iteration risks a mid-iteration invalidation (e.g. the root-marker decision moving the attestation state home under the gate's feet)." Counter: folding REMOVES the collision — separate iterations would have moved attestation state twice; here M4 decides both homes in one sitting. Second case: "the gate can't stop an engine-bypassing harness" — true, recorded as the honest ceiling (detection, not prevention), not claimed otherwise. Kill-criterion carried forward: if M5 cannot demonstrate a once-per-session portable console grant, R1 invalidates the attestation vision — the M5 spike targets exactly this.

**Verdict: PASS.** Frame is grounded, measurable, honestly bounded. Proceed to M2.

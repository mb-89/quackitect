# M7 — Validate & accept (i0009_contract_attestation)

## Meets the need → i9-m7-meets-need

Validated against every need up to this iteration (the scoped rule this iteration built):
- **need-engage** — the whole iteration was walked through the loop, and its second half ran UNDER the new gate: every ledger command since bs-attest-gate carried a live session key.
- **need-note** — capture runs through the engine lane only (single- and multi-line proven), into the private data home; the note prompt can no longer instruct hand-writing.
- **need-review** — the readout gained what the adjudicator asked for mid-walk: suspects explain themselves in the report, the filter clears/descends/double-clicks, pagers carried every hand-off.
- **need-implementation** — 26 tests authored → observed RED (attested per node) → GREEN; the test-first discipline held for the entire build.
- **need-workspace-drive** — one global binary now serves every workspace (bootstrap proven live), `--base` untouched, legacy markers keep old vehicles running.
- **need-qualities** — the trust story this iteration exists for: structural contract enforcement demonstrated on its own builder, honest ledger preserved through migration (git-moved, zero blesses lost), the amnesia test PASSED LIVE (below).

Ch1 criteria, each demonstrated for real: (1) keyless bounce — happened to the builder, exit 3 naming contract.md; (2) renewal without a grant — performed at budget exhaustion (rule 6, word 220); (3) byte-stable renders — selftest + re-render in every build; (4) clean `git status` — the repo tree holds spec/, product/, entry files, launcher, nothing else; (5) amnesia — data home parked and DELETED-equivalent mid-session: board identical (347 gates, 0 suspect), restored without loss; (6) strict-at-birth — five vetoes and one defer minted through the op, all parse strict; (7) one home — canonical-path slugging live, both legacy split homes merged into it.

## Killer use-cases demonstrated end-to-end → i9-m7-killer-ucs-demonstrated

- **uc-attested-session**, in production, not simulation: bounce → console grant (adjudicator) → challenge answered from the contract in context → key → 20-command budget consumed by the real walk → autonomous renewal → successor key finishing the build.
- **uc-repo-holds-only-truth**: the live amnesia demo above; plus `spec/ledger/` carrying every historical bless through a `git mv`.
- **uc-contract-delivery**: AGENTS.md regenerated with the full contract inline; `.github/copilot-instructions.md` exists for the first time — the pointer Copilot never followed is gone. (A real Copilot session on this repo is the remaining FIELD half — logged as a gap below, it needs a different harness than the one walking now.)
- **uc-global-engine**: fresh-bootstrap run observed; ratchet swap observed including its AV-blocked fallback path.

## Acceptance obtained → i9-m7-acceptance-obtained
The adjudicator drove every gate M1–M6 in person this session: pager y's on M1–M5 (each recorded actor=human), scope rulings mid-walk (data-leg fold, filter UX, backward V&V, killer demotion), one console grant, and the explicit delegated batch at M6 ("bless both": the gate + the i3 tail, all recorded --by human). The attest ledger is the sign-off.

## Validation gaps captured (RAID) → i9-m7-validation-gaps
- **Field half of thin-harness delivery**: copilot-instructions.md is rendered but no real Copilot session has run against it yet — next field feedback question at the coming `engage start`.
- **Recitation's social half**: the challenge proves contract-in-context; whether a paraphrase truly reached a person stays humanly-adjudicated (accepted at M1, R2).
- **status ~7s** vs the 1s responsiveness guide — debt, noted with levers (perf note in the inbox).
- **Vehicle scaffolding** still emits the legacy layout — parked as `adr-defer-vehicle-scaffold` with a named ready-when.

## Review rounds & verdict

**Round 1 — Verify.** Every claim above has a referent that happened in this session's record: the bounce output, the grant/renewal exchanges, the migration counts, the amnesia status lines, the ledger diff (git-moved, blesses intact), the sweep (69 ok, 0 FAIL).

**Round 2 — Validate.** The needs are met by DEMONSTRATION rather than argument — the iteration's product enforced the iteration's own walk, which is the strongest validation available to a trust feature. Nothing validated here contradicts an older need: the backward-scoped V&V healed the old iterations rather than reopening them, and the i3 tail was re-attested by the adjudicator, not waved through.

**Round 3 — Red-team.** (i) "Self-demonstration is circular — the builder benefits from the gate it built." The gate BLOCKED the builder and cost real interaction; circularity would require the gate to be trivially satisfiable, and its budget/renewal mechanics were exercised at their edges. (ii) "The Copilot claim is unproven." Correct — deliberately recorded as the open field gap, not claimed. (iii) "One session's demos are anecdotes." They are attested anecdotes: every one left a ledger event, a selftest, or a committed artifact that re-verifies mechanically.

**Verdict: PASS.** Needs met and demonstrated; gaps named; acceptance recorded.

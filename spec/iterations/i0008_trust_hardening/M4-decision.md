# M4 — Decide the architecture (i0008_trust_hardening)

Evidence for the M4 gate. The chosen architecture, its trace to the weighted criteria, and the recorded ADRs.

## Chosen architecture stated  → i8-m4-architecture-stated
One sentence per choice, scored against M3's Pugh criteria (fidelity 5 · determinism 4 · non-brickage 4 · zero-dep 3 · churn 3 · simplicity 2):
1. **Strict at every load** (`adr-strict-load`): C1a beat C1b/C1c 19–14–9 — the read path is where the lie reaches the human; recognition rule = first-line `---` fence, `iteration.md` as its own strict class.
2. **Char-device channel stat + `--by`** (`adr-actor-channel-stat`): C2a beat C2c/C2b 17–15–8 — stdlib-only, deterministic per channel, quirk errs harmless.
3. **Committed EARS baseline corpus** (`adr-ears-baseline`): C3b beat C3c/C3a 18–12–10 — one set-membership test gives exactly "new or genuinely re-stated", blessed history structurally unflaggable.
4. **User-dir log resolution, engine-owned** (`adr-logs-user-dir`): C4b beat C4a/C4c 16–9–8 — durable-data semantics, directive-exact paths, name+hash slug.
5. **In-code corpora + fixed-seed xorshift** (`adr-kernel-corpus`): C5a+c beat C5b 16–13 — the kernel's truth stays in one reviewed file; the PRNG stream is ours.
6. **Case-preserving `normWS` region hash** (`adr-region-hash-ws`): C6b beat C6a 17–15 — a case rename is content; only whitespace is noise.

## Choice traced to the weighted criteria  → i8-m4-choice-traced
Every winner wins on **record fidelity** first — the criterion the directive weighted highest — and no winner loses on **determinism** or **zero-dep**. Sensitivity checks on the two closest calls:
- **C6 (17–15):** if "same norm as statements" is read literally (lowercase), the decision flips on DRY/simplicity alone; it does NOT flip on any fidelity/determinism criterion — and fidelity outweighs. Robust.
- **C2 (17 vs 15):** if the M5 terminal spike shows char-device stat unreliable on real consoles, C2c (always-agent) takes over with zero fidelity loss — the fallback is pre-agreed in the ADR, so the decision is spike-proof.
- All other margins ≥3 and stable under ±1 weight perturbation on any single criterion.

## ADRs recorded and traced  → i8-m4-adr-recorded  *(derived: coverage:adr-traced)*
Computed live by the engine: six ADRs, each `addresses:` its requirement(s) — `adr-strict-load` → `req-strict-frontmatter`+`req-ref-integrity`; `adr-actor-channel-stat` → `req-actor-channels`; `adr-ears-baseline` → `req-ears-lint`; `adr-logs-user-dir` → `req-logs-out-of-repo`; `adr-kernel-corpus` → `req-kernel-selftest`; `adr-region-hash-ws` → `req-design-hash-norm`. (The pulled item `req-monotonic-lint` and the method item `req-ears-method` are direct realizations of an already-recorded convention or instruction — no architectural decision to record; deliberately no filler ADRs. `req-cli-help` dissolved at M5 — already realized in i0003.)

---

## Milestone review (increasing scrutiny)

**Round 1 — Verify.** Each ADR names its losers and the reason they lost, in the criteria's own terms; each traces to requirement(s) via `addresses:` and the derived check computes green. The two killer-class ADRs (`adr-strict-load`, `adr-actor-channel-stat`, `adr-ears-baseline` — the three whose failure falsifies the record) carry their kill-criteria/fallbacks inline.

**Round 2 — Validate.** The decision set covers every M3 load-bearing choice; no choice was decided that M3 didn't surface (no scope-invention at decision time). Decisions honor the directive verbatim where it bound (log paths, forward-only, one hash) and exercise judgment only where it delegated (mechanisms).

**Round 3 — Red-team.** Argued against the set as a whole: is this over-engineered for six small features? The counter holds — every ADR removes a class of silent record corruption, and the two spike-gated ADRs (strict-load's no-brick, channel-stat's terminal reality) are exactly the ones a hasty build would get wrong. Residual risk honestly carried: the EARS baseline file is tamper-diffable but not tamper-proof (deferred to evidence-into-merkle, recorded in the ADR).

**Verdict: PASS.** Decisions stated, traced, sensitivity-checked; ADRs recorded and computing green. Proceed to the human bless of `i8-m4-gate`.

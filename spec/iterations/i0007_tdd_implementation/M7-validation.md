# M7 — Validate & accept (i0007_tdd_implementation)

## Meets the need  → i7-m7-meets-need  *(killer)*
Validated against **all needs, every iteration** (V&V is global):
- **need-implementation** — test-first build realized: `tests-red` rule + `red-observed`/`observe-red` + the shared fragment (imported by lean & systematic) + the pluggable role seam. Verified.
- **need-qualities / uc-reliability** — evidence honesty (#8): hash-keyed cache + no vacuous/unknown passes; `selftest:evidence-honesty` green.
- **need-review** — verdict links (163 attestation verdicts + 24 self-certified in the report, closing the i6 gap) and build/test nesting (all 7 steps nest under the build task).
- **need-engage** — research is a referenced, pluggable capability (never vendored).
- **No regression** — `coverage:tests-pass` DONE across **every** iteration; `quack selftest` 0 FAIL; `lint` clean.

## Killer use-cases demonstrated end-to-end  → i7-m7-killer-ucs-demonstrated
Demonstrated live, not merely "tests green":
1. **Import reaches compose** — `quack gather` now bundles `_shared/implementation.md` + `roles/` (a real gap **caught and fixed during this validation** — `gather` had iterated only the vibe/lean/systematic floors).
2. **tests-red loop** — `observe-red <test>` records a red-observation at the test's current hash; an edit changes the hash and re-suspects it (`selftest:tests-red` proves record → match → re-suspect → re-observe, and that a bless is not a red-observation).
3. **Verdicts render** — every DONE check exposes its bless attestation even without an evidence doc.

## Acceptance obtained  → i7-m7-acceptance-obtained
M1–M6 killer/milestone gates were adjudicated by the human via handover pagers (stamped `actor=human`); non-killer reviews stamped `actor=agent`. Sign-off recorded in the attest log.

## Validation gaps (RAID)  → i7-m7-validation-gaps
- **Fixed in-flight:** `gather` omitted `_shared/` — would have broken the import at the next compose. Fixed + re-verified.
- **Intentional:** `tests-red` is built as a capability (rule + op + selftest) and seeded into the shared fragment for **future** iterations to gate on; it is not retro-wired as a gate on i0001–i0007. This iteration builds the capability; later iterations walk it.
- **Parked:** the descoped cross-harness cluster (contract-render, commit gate) sits in the backlog.

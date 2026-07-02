# M7 — Validate & accept (i0008_trust_hardening)

Evidence for the M7 gate. Validation against every need across all iterations; killer use-cases exercised for real.

## Meets the need  → i8-m7-meets-need  *(killer)*
Validated against ALL needs (global validation — every iteration's needs, not just i8's):
- **need-qualities** (the iteration's home): every Ch1 criterion demonstrated live — see the killer-UC section below, item by item against the M1 list.
- **need-engage**: the loop itself ran this iteration end-to-end (start → M1–M6 gates → here) on the hardened engine; the monotonic lint now guards the walk's own wiring; `engage`'s compose reference carries the EARS instruction for the next start.
- **need-review**: `status`/`report`/`progress --pager` drove every gate stop this session on the new binary; verdict links and nesting intact (selftests report-verdict/report-nesting green).
- **need-note**: the capture lane stayed available throughout — including by design while a malformed graph is refused (`note` loads no graph).
- **need-implementation**: the TDD sequence (i7's need) was honored by this very build — stubs, observed RED, implement to green, `coverage:tests-red` now gating for the first time.
- **need-workspace-drive**: drive-from-inside selftest green from the shipped binary; workspace hygiene strengthened (logs in the user dir, engine-owned resolution).

## Killer use-cases demonstrated end-to-end  → i8-m7-killer-ucs-demonstrated
Each exercised against the SHIPPED binary on the LIVE repo, not merely "tests green":
1. **A bad key rejected live** — a `depends-on` typo node written into `spec/`: `STRICT: 1 issue(s) — graph refused`, exit 1, file+key named; removal restores a clean board. Demonstrated for both a plain file AND the realistic accident (PowerShell's BOM'd UTF-8 — see the discovery below).
2. **Agent blesses stamped agent** — the attest record of this walk: all nine `i8-m6-bs-*` blesses carry `actor=agent` (the last six via pure channel default — no env var involved), `i8-m6-gate` carries `actor=human` via `--by human`.
3. **Reformat reopens nothing; content does** — live root comparison: whitespace-mangling a code line inside a `design:` region left `quack root` byte-identical; a one-word comment edit inside the region changed it; revert restored it.
4. **Kernel proves itself from the shipped binary** — full battery 44/44 ok, including the four kernel batteries and the real attest chain verifying end-to-end.
5. **Logs outside the repo** — `quack version` prints `%LOCALAPPDATA%\quackitect\logs\quackitect-c5212d`; 577 files / 122.1 MB live there; `.quack/logs` no longer exists.
6. **A weasel requirement flagged** — a new "should respond quickly and be user-friendly" requirement drew `ears: 2 finding(s)` (no EARS shape; should, quickly, user-friendly) with exit 1; blessed history drew zero flags before, during, and after.

**Validation discovery (the demo doing its job).** Demo 1's first run used PowerShell's default BOM'd UTF-8 — and the BOM slipped the file past the strict guard's recognition while the lenient loader still parsed it: guard and loader disagreed on what a node IS. Fixed test-first at M7: a BOM fixture case added to `selftest:parser-strict` (red), then `nodeFence` — ONE recognition rule (BOM-tolerant first-line fence) now shared by guard, `LoadAll`, and `scanIDs` — nothing loads unchecked. Battery re-run green; the original failing scenario re-demonstrated refused.

## Acceptance obtained  → i8-m7-acceptance-obtained
markus adjudicated every milestone gate M1–M6 in person this session (attest: `actor=human` on each gate and killer subtask), pulled two backlog items in at M1, amended the report-PNG target at M3, ordered the log-location prompt pointer at M4, and ran the console half of the M5 channel spike himself. The M7 gate bless below completes acceptance; sign-off is the attest record itself.

## Validation gaps captured (RAID)  → i8-m7-validation-gaps
- **R (accepted): the EARS baseline is diffable, not tamper-proof** — attest-grade protection belongs to the deferred evidence-into-merkle work (recorded in `adr-ears-baseline`).
- **R (accepted): exotic-terminal channel detection** — MSYS/mintty consoles read as pipes and stamp `agent`; the error direction is designed-harmless and `--by human` is the escape (recorded in `adr-actor-channel-stat`).
- **R (open, recorded): evidence docs (`M<n>-*.md`) are still not hashed** — a post-bless edit does not reopen the gate; this IS the deferred evidence-into-merkle item, unchanged in i8 by directive.
- **I (minor): a node file in a non-UTF-8 encoding (e.g. UTF-16) is not recognized and silently absent** — if anything references it, the dangling-ref check fires loudly; an unreferenced one is invisible. Judged acceptable: the repo convention is UTF-8, and the failure requires an unreferenced node nothing depends on.

---

## Milestone review (increasing scrutiny)

**Round 1 — Verify.** Every demo above is a executed fact from this session with its output recorded; nothing is claimed from test-green alone (the BOM catch is the proof the demos exercised reality the fixtures missed).

**Round 2 — Validate.** The six Ch1 criteria from M1-frame map one-to-one onto demonstrated behaviors; the two M1-pulled items resolved honestly (monotonic lint live; cli-help dissolved as already-realized). No need across any iteration regressed — the full battery includes every prior iteration's tests.

**Round 3 — Red-team.** (i) "The BOM fix landed at M7 — isn't validation supposed to only OBSERVE?" The fix followed the full discipline in miniature (red fixture first, single-rule design, battery green, re-demo) and is recorded here for the adjudicator; parking it would have shipped a known bypass of the iteration's headline feature. (ii) "Demo 2's first three agent stamps rode the old env dance" — true (they predate bs-actor-by landing mid-walk); the last six are pure channel default, which is the claim under test. (iii) The UTF-16 residual is honestly scoped, not hidden.

**Verdict: PASS.** Proceed to the human bless of `i8-m7-meets-need` (killer) and `i8-m7-gate`.

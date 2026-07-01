# M4 — Build & test (i0006_harness_and_readout)

Evidence for the M4 (Build & test) gate. Lean L4 → M4.

## Build planned  → i6-m4-build-planned
The build was decomposed by requirement cluster: (1) readout engine functions, (2) contract/method
edits, (3) Copilot channel, (4) bootstrap onboarding, (5) README, (6) correctness/lean-trace,
(7) selftests. Two retro "bug" notes (no-trace-gate, tests-pass-eval) were found already realized in
i0004 and dropped as duplicates; their notes archived.

## Build  → i6-m4-build
Realized across product/:
- `product/engine-go/readout.go` — `ProgressBar`, `HandoverPager`, `fence`/width, `cmdProgress`
  (designs go-progress-bar, go-handover-pager, go-readout-width, go-progress-cmd).
- `product/engine-go/cli.go` — `progress` command wired into dispatch + usage.
- `product/quackitect/method/prompts/contract.md` — confirm-back + active-imperative delivery
  (method-contract-delivery); y=console-bless + killer-relax (method-adjudication).
- `product/quackitect/method/prompts/integrate.md` — "Start a new project" flow + empty-spec rule
  (method-bootstrap).
- `product/quackitect/method/rigor/lean/checklist.md` — derived coverage checks (method-lean-trace).
- `.github/copilot-instructions.md`, `AGENTS.md`, `README.md` — root artifacts (design specs live in
  the method files above, since only product/ is scanned for design markers).

## Designs realized  → i6-m4-designs-realized
Every i6 requirement has a `design:` marker under product/ (coverage:designs-realized). `quack lint`
reports 0 holes for i6 after the build.

## Verification green  → i6-m4-tests-pass
New selftests all pass live: `selftest:readout`, `selftest:contract`, `selftest:bootstrap`,
`selftest:correctness`. **CAVEAT (open):** `selftest:workspace` (an i5 drive-from-inside test) FAILs
when re-run live via `quack selftest`, though `status` shows tests-pass DONE via cached evidence. Not an
i6 regression (launcher/driveFromInside/status untouched) — captured as a note for investigation. This
means the global `tests-pass` is honestly SUSPECT when re-run, and the human should weigh it.

## Internal quality ok  → i6-m4-internal-quality
Engine compiles clean via `quack build`; golden re-baselined. Readout output is deterministic and
width-bounded (asserted by selftest:readout). Duplicate correctness reqs removed (DRY).

## Review & verdict
Verify: new selftests green; engine builds. Validate: the readout, contract-delivery, bootstrap, and
lean-trace features are realized and traced. Red-team: the workspace/tests-pass cache caveat is the one
open honesty gap — surfaced, not hidden. **Verdict: pending human adjudication (meet at M4).**

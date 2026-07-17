# M6 — Build & verify (i0015_mobile_adapter, systematic)

## Build planned  → i15-m6-build-planned  (killer)

Eight steps under `i15-m6-build`, each a unit of durable progress with one verification concern. Wired by real prerequisites only:

1. **b1-tests** — the thirteen executed selftests with production stubs; every one observed RED. All thirteen mechanize: the adapters test against `net/http/httptest` fakes (hermetic, stdlib). The loop tests against a dummy adapter. Timeouts test against an injectable clock.
2. **b2-ask-core** — the ask model and store:
   - correlation ids
   - kinds
   - options
   - timeout
   - first-wins state
3. **b3-seam** — the seam pieces:
   - the adapter interface
   - the registry
   - the exec lane (the role-seam file contract, reused)
4. **b4-loop** — the loop operations:
   - dispatch
   - poll
   - correlate
   - apply (a gate answer records the bless with `actor=user` and the channel)
   - expire and supersede
5. **b5-pairing** — `quack pair`: one op. Credential minted. Disclaimer and lockscreen instruction printed.
6. **b6-ntfy** — the adapter the spike already walked, as code.
7. **b8-integrate** — `quack ask <check>` sends. `quack await <ask> [--timeout]` blocks until the answer arrives and applies it. The driving agent runs it in the background at a hand-off. So a phone bless RESUMES the walk immediately (owner requirement, 2026-07-09). EVERY engine run additionally drains pending answers as the fallback. The pager and the method prompts name the lane.

SCOPE AMENDMENT (owner ruling 2026-07-09, answering ask i15-ask-003 with option 3): **Slack leaves i15** — step b7 removed. req-slack-channel deferred by decision (adr-dmvbh5y) to the corporate wave. adr-slack-text-poll stands as the pre-decided shape for its return. Twelve requirements remain in scope; the selftest count drops to twelve.

Residency decision baked into the plan: no listener and no daemon — `await` is a bounded foreground command the caller chooses to run, and any engine run drains answers as the fallback. Asks live in the DATA HOME (runtime state, not truth). The resolved gate answer lands in the ledger through the existing bless path.

Poll cadence (owner question, 2026-07-09): ntfy awaits over a held-open streaming GET. No interval. Answers arrive instantly. Reconnect with `since=<last>` is lossless. Slack has no stream: `await` polls `conversations.history` every 5 seconds, backing off to 30 seconds after ten idle minutes (well inside the Tier-3 rate limit). Outside `await`, no cadence exists — one drain per engine run.

## The build record  → i15-m6-build

- **b1**: fourteen executed selftests authored (twelve planned + two mid-build requirements), every one observed RED before its code. Hermetic throughout: httptest fakes, injected clocks, config seams.
- **b2..b6**: the ask core, the seam with its exec lane, the loop (dispatch → poll → correlate → first-wins apply → expire), `quack pair`, and the ntfy adapter — all in `ask.go`/`ask_ops.go`/`qr.go`, each region design-marked. The battery greens all fourteen.
- **b8**: `quack ask <gate>` sends; `quack await` blocks on the held-open ntfy stream and APPLIES the tap (a phone bless resumes the walk); EVERY run drains as the fallback; the pager renders the 📱 MOBILE line when paired; the agent guide and engage.md carry the ops. `ask`/`await` ride the attest gate; the drain executes the USER's tap and is deliberately ungated (adr-answer-authenticity).
- **Mid-build owner requirements, captured with the full ritual** (req + test + red + green):
  - [req-first-wins-lanes](req-first-wins-lanes.md): mobile is the DEFAULT when paired — the console bless supersedes the pending mobile asks (cmdBless hook), the later tap is idempotently ignored.
  - [req-pair-qr](req-pair-qr.md): `quack pair` renders the subscribe link as a HAND-ROLLED QR (byte mode, ECC-L, single-block v1–5, computed BCH format bits — zero-dep, and the credential never leaves the machine). Structural validity is tested; the real scan is the M7 demo.
- **A live engine bug found and fixed under the bugfix law**: a DEFERRED requirement (req-slack-channel) holed `designs-realized` forever — the defer mechanism did not carry into the coverage rules. Class-guard `test-defer-excludes-coverage` observed red; the fix (one `deferredReqs` helper feeding the rule, the delta lister, and the hole lister) greens it; coverage computes clean.

## Internal quality  → i15-m6-internal-quality

- The battery is green in one process; coverage, EARS, and wiring lint clean.
- The QR encoder is the one honestly-uncertain artifact: structurally valid and self-checked, but scannability is proven only by a real phone at M7 — flagged, not hidden.
- The drain hook runs on every dispatch behind a cheap pairing-config stat; unpaired workspaces pay one file probe.
- DRY held under pressure: the deferral exclusion was extracted to ONE helper after briefly existing in three copies.

## Implementation risks  → i15-m6-impl-risks

Reviewed against the RAID log:

- lockscreen (pairing text ships the instruction ✓)
- forgery (accepted-risk ADR stands; high-entropy topics minted ✓)
- dangling notifications (expiry engine-driven, idempotent answers ✓)
- retention (disclaimer printed at pairing ✓)

New risk accepted and recorded here: the fallback drain applies user taps without a session key — deliberate, per the trust model (possession of the paired credential IS the authorization).

Interruption test: losing any single step loses at most one concern; every step leaves the battery green or observably red at its seam.

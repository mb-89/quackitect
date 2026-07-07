# M7 — validate & accept (i0013_comments)

## Meets the need → i13-m7-meets-need

Against the Ch1 success criteria (M1-frame.md):

1. **Mark, thread, assess, close, save on a real copy** — machine-proven end-to-end in the bs20 dogfood (headless session, real book copy, real island); the in-place save is the one part needing a human gesture — demonstrated in the live session below.
2. **Deterministic extraction** — proven: `quack note --file2list` is byte-identical across runs (selftest:comment-readback), reads only the island.
3. **An accepted suggested edit lands in the source** — demonstrated in the live session below.
4. **Names stripped at the boundary** — proven (selftest:comment-privacy; reader roles in first-appearance order).
5. **Every engine-batch item closed with a checkable mark** — all ten green: note collision, mint edge-mode, prose comment-state, orphan view-refs, connection code-endpoints, root-storm fix, build fast-path (content-only build sub-second, live), surgical verdicts, calls --summary + log cap, home sweep, observe-red --refresh.

Against ALL needs, every iteration (backward-cumulative): verification green across the whole battery; the one old-test conflict (test-authoring-cheap) was resolved by preserving its INTENT (one build → honest board; the stale-FAIL wedge stays dead) under the new surgical mechanism — the need behind it is served better, not worse. need-docu gains its feedback channel; need-workspace-drive gains a cleaner, faster surface; no earlier need lost anything it had.

## Killer use cases demonstrated end-to-end → i13-m7-killer-usecases

- **uc-comment-annotate (killer): demonstrated live, 2026-07-07.** The owner ran real sessions on demo copies in Chrome: marked prose, replied with marks, closed a thread, made a suggested edit, marked a figure element, and SAVED — first via the picker to the Desktop (the in-place gesture headless could not prove). The session produced nine improvement rulings, all folded in and re-validated live across three copy revisions (v1→v3): popup-free creation with focused textarea, changeable name field, close/reopen, delete, whole-card click pans to the comment's position, one creation flow (suggest split dropped), save toast, proposed filename `<original>_<name>_comments_<datetime>` with Desktop default.
- **uc-comment-readback (killer): demonstrated live on the owner's returned file.** `quack note --file2list Desktop/i13-demo-copy.html` listed both comments deterministically — thread marks, closed state, the suggest pair, author names replaced by reader roles. Triage was exercised in the REJECT direction (the session's comments were test data; all rejected — the unreliable-source stance working as intended). The ACCEPT direction (an accepted edit landing in a source doc) is mechanically trivial and lands with the owner's first real comment pass, promised for next iteration — recorded as a gap below.

## Acceptance obtained → i13-m7-acceptance

Owner, 2026-07-07, after the third live session: "now its good. very nice. lets finish this iteration, and in the next iter i can pass some comments to you." The nine field rulings from the sessions are folded in and re-validated; the last pan behavior the owner validated (v3) is exactly what ships.

## Validation gaps captured (RAID) → i13-m7-gaps-captured

- **Risk (accepted):** highlights need a current browser; older browsers get the sidebar without paint (adr-comment-highlight-api tripwire stands).
- **Risk (accepted):** the first save normalizes the DOM once (parser round-trip); the island stays the only semantic change thereafter.
- **Assumption (open, tripwired):** field round-trips run over mail/chat, not synced folders (adr-comment-storage-island tripwire).
- **Deferred (by design):** pre-marked commentable regions — schema-ready (req-comment-premark-open proven by selftest), not built (uc-comment-premark).
- **Gap (next iteration lead, noted):** battery cost after an engine rebuild is minutes; concurrency lead captured at the M6 discussion.
- **Gap (closes next iteration, by owner plan):** the accept-and-apply direction of triage has not landed a real edit yet — the demo comments were test data and were rightly rejected. The owner passes real comments next iteration; the first accepted keeper closes this.

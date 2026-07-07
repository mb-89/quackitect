# M6 — build & verify (i0013_comments)

## Build planned → i13-m6-build-planned

Twenty resumable steps seeded as children of [i13-m6-build](tasks/i13-m6-build.md), zero-padded so the walk serves the engine family first (owner ruling: it cheapens the remaining build and repairs the book path the comment system lands on).

**Engine workshop family (bs01–bs11):**

- [bs01 build fast-path](tasks/i13-bs01-build-fast.md) — first: every later build call gets cheaper.
- [bs02 surgical verdicts](tasks/i13-bs02-verdict-surgical.md) — chains on bs01 (same build/re-baseline code region).
- [bs03 launcher probe](tasks/i13-bs03-launcher-probe.md)
- [bs04 note collision](tasks/i13-bs04-note-collision.md)
- [bs05 calls --summary + log cap](tasks/i13-bs05-calls-summary.md)
- [bs06 observe-red --refresh](tasks/i13-bs06-observe-refresh.md)
- [bs07 mint edge-mode](tasks/i13-bs07-mint-edges.md)
- [bs08 connection guard: code designs](tasks/i13-bs08-conn-code.md)
- [bs09 prose-mark comment interiors](tasks/i13-bs09-prose-comments.md)
- [bs10 orphan lint: view refs](tasks/i13-bs10-orphan-views.md)
- [bs11 selftest home sweep](tasks/i13-bs11-home-sweep.md)

**Comment system family (bs12–bs20):**

- [bs12 island schema + serializer](tasks/i13-bs12-island-schema.md) — the foundation; carries the script-escape spike finding.
- [bs13 figure sub-element ids](tasks/i13-bs13-fig-ids.md) — the emitter half of the spike's P3 failure.
- [bs14 annotator core](tasks/i13-bs14-annotator-core.md) — on bs12 + bs13.
- [bs15 sidebar + threads](tasks/i13-bs15-sidebar.md) — on bs14.
- [bs16 save path](tasks/i13-bs16-save.md) — on bs14.
- [bs17 suggested edits](tasks/i13-bs17-suggest.md) — on bs15.
- [bs18 note --file2list](tasks/i13-bs18-file2list.md) — on bs12 (Go side only).
- [bs19 retro method line](tasks/i13-bs19-retro-method.md)
- [bs20 end-to-end dogfood](tasks/i13-bs20-dogfood.md) — on bs15 + bs16 + bs17 + bs18.

Wiring states real prerequisites only; parallel steps hang flat off the RED observation. Every step carries a single design or verification concern and is worth resuming on its own.

Test-first sequence ahead: the 19 executed tests get their selftest hooks authored and observed RED (`quack observe-red`), then the steps build to GREEN with inline `design:` markers.

## Build record → i13-m6-build

Sequence held: 19 selftest hooks authored (`i13_red.go`), 17 observed RED, 2 honestly exempt (view-orphan lint and the launcher probe — both behaviors pre-existed; markers carry the reasons), then all 20 steps built to green, engine family first (owner ruling).

Highlights and deviations, for the record:

- **bs01/bs02/bs03 landed the build-question answer live**: content-only `quack build` now prints `compile skipped (source unchanged)`, re-baselines sub-second, keeps green verdicts, and spawns no child process. The i12 "root storm" (291 argless calls) was buildRebaseline's self-exec, NOT the launcher — the requirement was re-aimed at the observable (req-launcher-single-dispatch reworded at bs03).
- **bs04** collision-proofs the capture lane (`-2` suffixes; the id follows the file).
- **bs05** `quack calls --summary` prints the retro aggregate and deletes the log; a size cap (8 MB) guards the never-retro case. The summary call does not re-seed the log it deleted.
- **bs07** made mint atomic in connections mode: edge into the lane, no frontmatter key, and a failed edge write UNDOES the node — no silent edge loss. The mode follows the TARGET workspace's project.toml.
- **bs09/bs10** were pre-landed in late i12 (stripFillComments; view-aware orphan lint) — realized-design markers extended, exempt markers on their tests, regression guards kept.
- **bs13** stamps ids on figure sub-elements (345 in a fresh render) — the M5 spike's P3 failure closed.
- **bs14–bs17** the annotator: core (anchor/paint/island), sidebar (threads, marks, close-keeps-history, prompt-once author), save (in-place + download fallback, layer-stripping serializer), suggest. The i12 shell law was SCOPED, not weakened: the shell script still never creates; the comment layer's own law is selftest:comment-dom-static.
- **bs18** `quack note --file2list` — pure lister, reader roles replace names at the boundary.
- **bs20 dogfood, end-to-end on a real copy**: headless reader session made a prose comment, an agree reply, a closed thread, a suggested edit, and a figure-element comment (`fig1-quack`); the returned copy listed deterministically; one keeper note minted (origin: field), two comments rejected — the unreliable-source stance exercised for real.

One encoding incident during bs07: a PowerShell regex rewrite mojibaked `i10_red.go`; caught immediately via git diff, reverted, redone with the Edit tool. No damage shipped.

## Internal quality → i13-m6-internal-quality

- Zero-dep held: no library entered; the annotator is emitted vanilla JS; Go stdlib only.
- Selftest seams held: overrides used (verdictPathOverride), no test writes the real ledger or notes; fixture homes now sweep themselves.
- Escape rule held: no innerHTML/document.write anywhere in the layer (machine-checked); island serialization HTML-escapes.
- Voice held in all emitted text and statements.
- Scope guard held: one annotator, one island, one lane flag on `note` — no new top-level command.

## Implementation risks → i13-m6-impl-risks

- The in-place save needs a real user gesture — headless could not exercise it; it is the M7 live demo, with the download fallback as the safety net. Accepted.
- DOM-serialize save normalizes the document on the first save (parser round-trip); subsequent saves are stable. Accepted: copies are cheap and the island is the only semantic content that changes.
- localStorage author names never leave the reader's browser except inside the copy they annotate; the file2list boundary strips them. Accepted.

## Review rounds & verdict

1. **Verify.** All 20 steps carry blessed evidence; the derived checks compute live: coverage clean (every requirement traced, tested, designed), tests-red satisfied (17 observed + 2 reasoned exemptions), verification green across all iterations. The dogfood record is a real artifact trail (spike dir: dogfood copy, returned copy, file2list output, keeper note).
2. **Validate.** The build realizes every owner decision: island, unit+quote anchoring, Highlight-API paint, in-place save with fallback, prompt-once author, file2list under the note family, suggest in scope, opinionated triage exercised. The engine batch closed all ten items plus the two pre-landed ones honestly.
3. **Red-team.** Weakest point: the browser-interaction tests (9 review-class) have only headless-driver evidence so far, not a human session — that is precisely M7's killer-use-case demo, not a M6 gap. Second: the i12 shell-law rescope could hide layer bloat in later scripts; held: the layer's own machine check (comment-dom-static) covers every script after the shell.

**Verdict: pass.** The gate goes to the adjudicator.

## Post-review defect, caught by this gate's own verification

The first cold-cache evaluation of the M6 board hung: `selftest:comment-dom-static` self-recursed (its book render computes StatusMap, whose coverage evaluation re-runs the not-yet-recorded test — one book render per lap, 10 GB RSS before the kill). Diagnosed by process sampling + a one-run instrumented dispatcher (294 nested runs in 90 s); fixed with the engine's existing busy-guard pattern (the i10 status-fast precedent); defect + three retro leads recorded as a note. The battery is green end-to-end after the fix — the verdict above stands, now with this repair on the record.


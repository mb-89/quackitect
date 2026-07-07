# M2 — requirements (i0013_comments)

## Inputs captured → i13-m2-inputs-captured

Context — who touches what:

```
                    sends copy               returns copy
  owner ──────────────────────▶  reader  ─────────────────▶  owner
    │                              │                            │
    │ quack ship                   │ marks, comments,           │ quack <read-back>
    ▼                              │ saves (browser only)       ▼
  book.html  ──── copy ────▶  copy.html ◀── JSON island ──  driving agent
  (live, untouched)           (the commented artifact)      (extracts, triages,
                                                             applies accepted edits)
```
What to see: comments live only in travelling copies; the live book and report never change.

Use cases (trace nodes, this iteration): [uc-comment-annotate](uc-comment-annotate.md) (killer), [uc-comment-discuss](uc-comment-discuss.md), [uc-comment-readback](uc-comment-readback.md) (killer), [uc-comment-premark](uc-comment-premark.md) (future), [uc-workshop-smooth](uc-workshop-smooth.md).

Environment assumptions, probed on the real channel:

- **Book DOM probed** (spec/book.html, 2026-07-07): 370 KB, stable unit anchors (`man-ch4-design-output-u3` pattern), 225 inline SVGs, exactly one script block, zero JSON islands today. Anchoring to unit ids is viable; the island slot is free.
- **Connections lanes probed:** edge lines are `{"src","dst"}` JSONL per kind; the strict referee refuses frontmatter edges — hand-authored for now (req-mint-edge-mode fixes the mint).
- **Browser APIs (File System Access, CSS Custom Highlight) recorded as assumptions** — they are the M5 spike's job to settle; no requirement builds on an unprobed claim beyond that gate.

## Stakeholder coverage → i13-m2-stakeholder-coverage

- **reader** — annotates a copy; needs zero install, zero account (uc-comment-annotate, uc-comment-discuss).
- **owner / project-owner** — sends copies, triages feedback, owns the doc (uc-comment-readback).
- **adjudicator** — blesses the gates; this plan.
- **agent** — deterministic read-back; never scrapes the DOM (req-comment-readback).
- **developer-maintainer** — the engine workshop family keeps the surface clean (uc-workshop-smooth).
- Not served, on purpose: anonymous web publics (no server, no moderation surface).

## Prior art checked → i13-m2-prior-art-checked

The requirement set held against the feature checklists of the prior art (M1 sources):

- Word/Acrobat checklist coverage: mark, thread, reply, assess, resolve/close, author identity, sidebar, save — all present.
- W3C model coverage: bodies, targets, motivations (commenting, replying, assessing, editing) — present via req-comment-island and req-comment-suggest.
- Deliberate misses, recorded: @mentions and notifications (need a server — out), cross-version re-anchoring (owner: fdf-style loss accepted), free-rectangle area marks (reflowing HTML — element targets instead), print rendering of comments (not asked).
- Adopted from prior art beyond the ask: close-keeps-history (Word), escape-at-render (every web annotator), orphan honesty is NOT adopted (no re-anchoring means no orphans by construction).

## Requirements verifiable → i13-m2-req-has-test

28 requirements, 28 tests wired in the verifies lane. 19 executed (selftest-backed), 9 review (live browser sessions — the irreducible residue per the doc-tests rule). The coverage check computes live.

## Requirements traced → i13-m2-req-traced

Every requirement refines a use case; every use case refines a need (need-docu for the comment family, need-workspace-drive for the workshop family). The coverage check computes live.

## Review rounds & verdict

1. **Verify.** Node files exist for 5 use cases, 28 requirements (EARS-shaped, faceted), 28 tests; 61 edges appended. The two derived checks adjudicate the wiring deterministically.
2. **Validate.** The set covers every owner decision from 2026-07-07 (island, anchoring, save, author, privacy, suggest, hand-roll, unreliable-source stance) and all ten engine-batch items. The premark future is held open by req-comment-premark-open without building it.
3. **Red-team.** Sharpest attack: "9 review-class tests is a lot of user time." Held: each is one observable browser action at M7; the mechanizable core (island, read-back, escape, DOM-static) is executed. Second attack: "req-orphan-render-refs bakes a ruling the owner has not spoken." Correct — it is flagged in the node's rationale and named at this gate for explicit adoption or rejection.

**Verdict: pass**, with one named decision for the adjudicator at the gate: adopt the orphan-lint ruling (views count as references — pull law) or reopen req-orphan-render-refs with the curation alternative.

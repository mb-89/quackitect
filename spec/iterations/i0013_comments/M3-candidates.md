# M3 — candidate architectures (i0013_comments)

## Alternatives elaborated → i13-m3-alternatives

Twelve candidates across the five open axes. Each candidate node carries its pro/con and ratings.

| Axis | Candidates |
|---|---|
| comment-storage | [island](cand-store-island.md) · [hidden DOM](cand-store-dom.md) · [sidecar](cand-store-sidecar.md) |
| anchoring | [unit + quote](cand-anchor-unit-quote.md) · [offsets](cand-anchor-offsets.md) · [xpath](cand-anchor-xpath.md) |
| highlight-rendering | [CSS Highlight API](cand-hl-css-api.md) · [span wrapping](cand-hl-span-wrap.md) |
| save-path | [FS API + fallback](cand-save-fsapi.md) · [download only](cand-save-download-only.md) |
| read-back-surface | [pure lister](cand-read-lister.md) · [notes importer](cand-read-notes-import.md) |

The engine workshop family has no open architecture axis — each item is a diagnosed fix inside an existing design. It is deliberately absent here.

## Criteria weighted → i13-m3-criteria-weighted

Derived from the M2 requirements, weights 0–1:

- **single-file** (0.9) — from req-comment-island, the i12 book law.
- **agent-readability** (0.9) — from req-comment-readback; the whole point of the loop.
- **dom-static** (0.8) — from req-comment-dom-static; protects idempotent save and the i12 rule.
- **buildability / zero-dep** (0.7) — hand-roll ruling; small surface the engine can emit.
- **reader-ux** (0.7) — from the usability requirements; the Acrobat feel.
- **robustness-in-file** (0.6) — anchors hold within one copy (no cross-version claim).
- **separation-of-concerns** (0.5) — extraction mechanical, triage opinionated (owner stance).
- **future-premark** (0.4) — from req-comment-premark-open; door stays open.

## Feasibility rough-checked → i13-m3-feasibility

- **CSS Custom Highlight API**: shipping in current Chromium, Firefox, and Safari; the M2 probe scoped the target to current browsers. Legacy browsers lose highlights only — the sidebar still works. Viable.
- **File System Access API**: Chromium-only; fallback download is standard DOM API. Viable.
- **Island size**: the book is 370 KB; a hundred comments at ~0.5 KB each add ~5% — no budget concern. Viable.
- **Hidden-DOM storage**: feasible but collides with two standing rules (dom-static, byte-idempotent save) — carried as datum material, not preferred.
- **Sidecar**: feasible, breaks the single-file law — carried for the Pugh datum, not preferred.
- **Zero-dep hold**: every candidate is emitter-embeddable vanilla JS + Go; no candidate needs a vendored library. Viable across the board.

## Review rounds & verdict

1. **Verify.** Twelve candidate nodes exist, each with axis, ratings, statement, and pro/con. Every M2 decision axis with a genuine choice has ≥2 candidates.
2. **Validate.** The axes cover all open design surface: storage, anchoring, rendering, save, read-back. Nothing the requirements demand lacks a candidate; nothing outside the requirements sneaked in.
3. **Red-team.** Attack: "the owner already decided island + highlight API + FS API — M3 is theater." Held: the owner's picks entered as *candidates with real rivals*, and M4's Pugh run uses the strongest rival as datum, per method. If the matrix flips a pick, the M4 gate is where the owner sees it. The rivals here are genuinely viable (sidecar IS Acrobat's model; span-wrap ran a decade of annotator.js) — this is controlled convergence, not decoration.

**Verdict: pass.** The killer (alternatives) and the gate go to the adjudicator.

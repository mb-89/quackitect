# M4 — decide the architecture (i0013_comments)

## Chosen architecture stated → i13-m4-architecture-stated

One sentence: **a hand-rolled annotator script in the book shell renders highlights through the CSS Custom Highlight API, keeps every comment in one W3C-vocabulary JSON island anchored by unit-id + quote/position, saves in place via the File System Access API (download fallback), and a pure lister — `quack note --file2list <file>`, no new top-level command — turns the island into a list of note candidates for opinionated triage.**

```
 book copy (single HTML)
 ┌──────────────────────────────────────────────┐
 │ content DOM (static, never mutated)          │
 │   unit anchors ◀── selectors ──┐             │
 │ ::highlight() paint            │             │
 │ ┌─────────────┐   ┌────────────┴───────────┐ │
 │ │ annotator JS│──▶│ JSON island (W3C shape)│ │──save──▶ same file
 │ │ + sidebar   │   │ threads·marks·suggests │ │          (or download)
 │ └─────────────┘   └────────────┬───────────┘ │
 └────────────────────────────────┼─────────────┘
                                  ▼
              quack note --file2list <file>  (pure lister, roles not names)
                                  ▼
        agent reads the list, mints the keepers as ordinary notes
                     (opinionated triage, rejection normal)
```
What to see: the island is the single moving part — the DOM is paint-only, the save rewrites one block, the lister reads the same block.

Pugh run (datum = strongest rival per axis; + better, 0 same, − worse against the weighted criteria of M3):

| axis | datum (strongest rival) | winner | decisive criteria |
|---|---|---|---|
| storage | sidecar (Acrobat's own model) | **island** | single-file 0.9, agent-readability tie, dom-static near-tie |
| anchoring | xpath | **unit + quote** | agent-readability 0.9, robustness 0.6 |
| highlights | span-wrap (decade of precedent) | **CSS Highlight API** | dom-static 0.8, buildability 0.7 |
| save | download-only | **FS API + fallback** | reader-ux 0.7; portability equal (fallback) |
| read-back | notes importer | **pure lister** (as `note --file2list`, owner surface ruling) | separation-of-concerns 0.5, owner stance |

Second run against the status quo (no comment system) confirms worth-doing: every criterion the requirements weight scores zero at the datum.

Sensitivity check, REVERSED — the first plausible world where a winner loses:

- **Island loses to sidecar** if single-file drops below ~0.3 — a world where copies live in a synced folder, not mail. Credibility today: low; the field round-trip is mail/chat. Recorded as the tripwire on adr-comment-storage-island.
- **CSS Highlight API loses to span-wrap** if legacy-browser support becomes a requirement. Credibility: low — the audience is the owner's circle on current browsers. Tripwire on adr-comment-highlight-api: a real reader without the API → revisit degrade, never span-wrap.
- No plausible weight set flips anchoring, save, or read-back (the rivals lose on multiple heavyweight criteria at once).

## Choice traced → i13-m4-choice-traced

Every pick traces M3 criteria → candidate ratings → chosen/rejected edges: five [ADRs](../../decisions/) carry `chosen` edges to their winner and `rejected` edges to every rival; each ADR `addresses` its driving requirements. The decisions are the owner's 2026-07-07 rulings, now Pugh-confirmed against the strongest rivals.

## ADRs recorded and traced → i13-m4-adr-traced

Five ADRs in spec/decisions/: [storage-island](../../decisions/adr-comment-storage-island.md), [anchoring](../../decisions/adr-comment-anchoring.md), [highlight-api](../../decisions/adr-comment-highlight-api.md), [save-path](../../decisions/adr-comment-save-path.md), [readback-lister](../../decisions/adr-comment-readback-lister.md). The coverage check computes live.

## Review rounds & verdict

1. **Verify.** Five ADRs exist, 21 decision edges wired, every M3 axis closed with an explicit winner and explicit rejections.
2. **Validate.** The architecture satisfies every M2 requirement family; no requirement is left without a home (comment-layer JS, island schema, save path, lister, engine batch).
3. **Red-team.** Attack: "the sensitivity check is soft — both flips were dismissed." Held: both dismissals carry recorded tripwires with named observables (synced-folder round-trips; a reader without the API), not silent judgment. Attack: "one ADR per axis is ceremony." Held: the axes fail independently and their tripwires differ; merging them would blur the audit trail.

**Verdict: pass.** The gate goes to the adjudicator.

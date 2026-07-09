# M5 — Validation & handover (i0014_doc_review, lean L5)

## Docs match the surface  → i14-m5-docs-match

Checked 2026-07-09, after the M4 bless:

- Template↔spec parity on every unit this iteration changed:
  - ch3 context unit: both carry `fig: context-star` + `![[neighbours.base]]`; the fill comments compare byte-equal.
  - ch1 criteria unit: the folded-into-needs wording identical on both sides; the spec embeds `criteria.base`.
  - `neighbours.base` ships identically in the template pool and `spec/queries/`.
- Template layer agrees with what shipped:
  - [items/neighbour.md](../../../product/quackitect/method/templates/items/neighbour.md) documents the `direction` flanks the star renders.
  - [items/criterion.md](../../../product/quackitect/method/templates/items/criterion.md) reframed to the decision-scoring axis; the ex-criterion seed matches.
  - The onion rulings live in [req-figure-drilldown](req-figure-drilldown.md); the method laws in `engage.md`.
- README: renders as the book's home chapter; it carries no feature claims the i14 rework could have staled (one report screenshot with a live-board pointer).
- The committed `spec/book.html` still differs from a fresh render — regenerates at ship, by design (req-book-drift).

## Packaged  → i14-m5-packaged

- `quack ship` ran clean: `out/quack-i0014_doc_review.zip`, 237 entries.
- Verified in the archive: `book.html` and `report.html` sit at the ZIP ROOT.
- The committed `spec/book.html` refreshed in the same move — the drift finding is gone.

## Comment coverage sweep (owner concern at the M4 bless: "i feel we dropped some comments")

Every field comment c1–c46 accounted for against the BUILT book:

- c1–c45 minus the below: mapped to requirements in [M2-inputs.md](M2-inputs.md), all built and green.
- Three notes from the original listing never entered the M2 set — their content is nonetheless BUILT, verified today:
  - c9 (drop the ch0 orientation diagram): no `fig:` in ch0, no figure in the rendered chapter.
  - c13/c38 (tables cluster residue): name+brief columns, empty-query tables, the `(none)` row and zero-count color, all covered by green tests; the reader-facing word "unit" left the surface entirely (0 occurrences).
  - c5+c46 (comment UX): draft persistence + auto-post green (test-comment-persist); the sidebar sorts by document position since i13.
  - The three notes stay in the inbox for the next triage to close with this referent.
- c28 (context diagram): M2 recorded it "rejected — text-less artifact"; the owner un-rejected it 2026-07-08 and it BUILT 2026-07-09 (req-context-diagram, derived star from nbr- notes). M2's rejection line is superseded.
- c16, c45 stay rejected (text-less artifacts).

**Sweep verdict: no comment dropped.** The feeling traced to the three never-triaged notes, whose content shipped anyway.

## Validation — the book meets need-docu

- The proof-of-concept stands: a full documentation iteration ran field-review → requirements → build → verification on the book itself, and the book regenerated from truth at every step.
- All 25 M-checks green; the battery passes across all iterations; coverage computes clean (designs, tests, traces).
- Known-open, recorded and parked with owner consent: the onion LAYER STRUCTURE (notes inbox), the crit-/battery leads from i13, the gofmt sweep.

## M5 verdict

Round 1 (existence): every M5 subtask filled with evidence; ship verified at the zip root. Round 2 (spot-scrutiny): the comment sweep checked the owner's concern comment-by-comment against the rendered book, not against the records. Round 3 (adversarial): the riskiest claim is "nothing dropped" — it survives because the three suspect notes were read in full and each ask was located in the built surface. Recommended: bless; the retro should close the three inbox notes and correct M2's c28 line.

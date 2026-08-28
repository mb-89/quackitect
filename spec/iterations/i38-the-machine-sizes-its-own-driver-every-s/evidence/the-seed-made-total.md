---
form: the-seed-made-total
by: agent
signed_off: 2026-08-20T12:49:03.231Z
authors: agent
files: null
---

# Evidence form / the-seed-made-total

## current_situation

cand-the-seed-made-total was drawn at build_chart with all four sections written: Why this one, How it works, What it costs, What it leans on. This state adds what build_chart could not — the seams between the chosen cells, and a rough feasibility number.

IT IS THE BASELINE, SO ITS COMPOSE IS THE ONE THE OTHER THREE ARE READ AGAINST. Every requirement in this record was written assuming this shape.

## built

cand-the-seed-made-total.md now carries five sections: Why this one, How it works, The seams, What it costs, What it leans on.

THE SEAMS SECTION IS NEW AND IT FOUND A DEPENDENCY THE CHART DID NOT SHOW. Splitting the rung ladder from the model roster creates a way to be incomplete that one file did not have — a rung the mapping names and the roster does not fill. The compile-time totality check is what closes it. So the two cells are not independent choices: taking the split without the check is strictly worse than taking neither, and evaluate-set must not score them apart.

IT ALSO FOUND A CADENCE CONFLICT. Publishing on change and recording both drivers on every call are two writes of one fact at different rates. A later reader comparing the stream against the log finds them disagreeing at every boundary unless the log is named as the authority. That is a design decision this candidate now makes explicitly.

THE FEASIBILITY NUMBER IS 154 CELLS, measured at probe 1 from the rows active per column — 19 at patch, 29 at minor, 53 at major, 53 at product. Every one needs a difficulty typed by hand. The engine change is three edits; the corpus change is the work, and it is the largest of the four candidates.

## follow_up

ONE SEAM GOES TO gate-design RATHER THAN TO evaluate-set. The complexity riding the compiled state means it is pinned, and req-the-complexity-value-is-read-live-and-never-pinned forbids that in its first half for a reason that does not apply — raid-iss-the-live-read-rule-forbids-more-than-its-own-reason-needs. This candidate is not buildable as described until that is ruled on, and the same applies to cand-the-derived-ladder, which picks the same cell.

AND ONE PAIR SHOULD REACH evaluate-set AS A PAIR. The two-record split and the totality check are coupled by the seam above. Scoring them independently would let a line take the split alone, which is worse than the incumbent.

## anything_else


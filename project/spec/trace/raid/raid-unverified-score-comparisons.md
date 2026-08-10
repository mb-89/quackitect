---
id: raid-unverified-score-comparisons
type: "[[raid]]"
kind: risk
statement: Four of the surviving 4-scores rest on external comparisons nobody in this project verified — rustup, GitHub template repositories, GitHub's merge queue, and a spreadsheet comparison.
owner: the driving agent
trigger: before M5 convergence reads the scores
status: open
breaks_how_badly: corrosive
how_likely: plausible
impact: A 4 needs its named comparison to hold; the anchor rule drops an unverified 4 to 3, and the front can shift when a score moves.
source_refs:
  - iterations/i1 evidence gate-candidates, round_2_red_team and verdict
  - meth-scoring-anchors
---

The scoring anchors say a 4 means prior-art par against a NAMED comparison.
Four surviving scores carry names that were never checked here: nobody read
those tools' own documentation during the sitting that scored them.

Probably fair; probably is not evidence.

THE REMEDY IS CHEAP: cite each tool's own documentation, or drop the score
to 3. It belongs to the second-hand re-score, which re-reads every score
anyway.

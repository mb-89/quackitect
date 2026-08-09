---
kind: matrix-row
name: evaluate-set
statement: "Evaluate the candidate set: multi-objective scores, the Pareto front, eliminations recorded."
state_kind: work
filled_by: agent
depends_on:
  - cut-criteria
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
evidence:
  - name: scores
    template: table
    columns:
      - candidate
      - axis
      - score
      - anchor
      - prior_art
    column_help:
      - which candidate is being scored
      - which surviving criterion it is scored on
      - 0 to 5, on the anchors below
      - the anchor line it matched, in its own words
      - the named external comparison - required for 4 or 5
    picks:
      candidate: $candidates
      axis: $criterion_axes
      score: ["0", "1", "2", "3", "4", "5"]
    description: every surviving candidate against every surviving axis, on the 0-5 anchors
    guidance: |
      Score against the anchors, not against effort or intent.

      - 0 absent. Not addressed at all.
      - 1 gesture. Prose only, nothing checkable.
      - 2 partial. Works for the demo path, holes unrecorded.
      - 3 solid baseline. Meets the requirement, holes recorded.
      - 4 prior-art par. Matches the best comparable tool.
      - 5 beyond prior art. Better than a NAMED comparison.

      4 and 5 need that name. No name, no score above 3.

      A research agent scores, never the builder. See
      [[meth-scoring-anchors]].
  - name: front
    template: pareto-plot
    reads: scores
    description: the candidates nothing else beats, drawn from the scores
    guidance: |
      A candidate is on the front when no other beats it everywhere. Those
      are the survivors, and they are all kept.

      One axis per criterion, one line per candidate. Crossing lines are a
      trade. A line below another the whole way is beaten.

      See [[meth-set-based-pareto]].
  - name: reading
    template: free-form
    description: the judgments the arithmetic cannot make
    guidance: |
      Write three things.

      - Any elimination you do not accept, and why.
      - Any axis every candidate scored alike, and which it is: the
        decision does not turn on it, or a criterion is missing.
      - How far the front sits from utopia, if that is far on every axis.

      Do not pick a winner. That is M5's.

      The method is [[meth-set-based-pareto]].
major: full
minor: none
patch: none
product: full
specification: full
major_note: |
  Applies in full: scores on the weighted criteria and matrix metrics,
  the Pareto front, every elimination reasoned, examples exercised
  through each candidate. No winner here.
minor_note: |
  Does not apply. No candidate set at this size. STRIKE PROPOSAL - owner
  adjudicates.
patch_note: |
  Does not apply. No candidate set exists at this size. STRIKE PROPOSAL -
  owner adjudicates.
product_note: |
  STANDING ARTIFACT: the score table and the Pareto front with every
  elimination reasoned. History, kept: it is what makes the next major's
  "why not X" answerable without re-arguing.
specification_note: |
  DOCUMENT FORM: the score table (candidates x criteria) derived, the
  front named, eliminations as one-line reasons under it.
---

## Guidance

Per [[meth-set-based-pareto]]:

- Score on the weighted criteria and the matrix metrics.
- Keep the non-dominated front.
- Record every elimination with its reason.

The formulated examples are walked through each candidate (exercised). No
winner is picked here.

NOBODY TYPES THE FRONT (owner report 2026-08-08). Domination is one line of
arithmetic: at least as good on every axis, and better on one.

So the front, every elimination and both corners are a FUNCTION of the score
table.

This state used to ask for the front and the eliminations as free text. That
asks a person to hand-compute an answer the scores already contain, and lets
the typed answer disagree with the scores in the same form.

THE TWO CORNERS ARE DRAWN.

The UTOPIA point is the best value any candidate reaches on each axis,
assembled. Usually nothing is there.

The NADIR point is the worst on each axis AMONG THE FRONT, never among
everything. Over the whole set it would be the worst of the losers, and that
says nothing about the choice.

Between them is the region the decision actually lives in. A narrow box is the
all-options-equal signal arriving as a number.

A DISTANCE IS NOT A WINNER. Ranking the front by nearness to utopia is the early collapse into one number this method exists to prevent, wearing a geometric disguise.

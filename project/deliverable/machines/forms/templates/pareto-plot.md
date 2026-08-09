---
id: template-pareto-plot
statement: The Pareto front drawn from the scores — one axis per criterion, one line per candidate, with the utopia and nadir corners over them.
editor: pareto-plot
line_pattern: "^- \\[\\["
line_help: "the front, written by the arithmetic — nothing here is typed"
---

# pareto-plot

A READING, not a question. It takes no input.

## What the field declares

```
- name: front
  template: pareto-plot
  reads: scores
```

- `reads` — the field holding the score table this is computed from.

Nothing else. There is nothing to configure, because there is nothing to
decide here.

## Why it is a picture and not a list

Domination is one line of arithmetic, so the front could be printed as text.
What text cannot show is the SHAPE: where the trades are, how far the
survivors sit from ideal, and whether the whole set is bunched or spread.

## Why parallel coordinates and not a scatter

The classic Pareto drawing is two axes with the front as a curve, and it is
the picture everybody pictures. It works for exactly two objectives.

A real criteria set is five or fifteen, and there is no third dimension to put
them in. So the axes stand SIDE BY SIDE and each candidate is a line across
them.

- A trade shows as a CROSSING — one line goes up where another goes down.
- Domination shows as one line sitting weakly below another the whole way.
- A bunched set shows as lines that never cross, which means the ranking was
  never really multi-objective.

## The scale is fixed at 0 to 5

Not fitted to the data. The anchors are absolute, so a set of poor scores must
LOOK poor — a fitted axis would stretch three bad candidates across the full
height and make them look like a healthy spread.

## The two corners

Neither is a candidate. Both are drawn as dashed reference lines.

- UTOPIA, along the top: the best value ANY candidate reached on each axis.
  Usually nothing is there, because the best on speed and the best on cost are
  rarely the same design.
- NADIR, along the bottom: the worst value on each axis AMONG THE FRONT. Over
  the whole set it would be the worst of the losers, which says nothing about
  the decision.

The band between them is how much the decision is worth. A narrow band is the
all-options-equal signal arriving as a picture instead of an impression.

## An eliminated candidate still shows

Faint, thin, and still there. The front means nothing without the shape of
what it beat, and a drawing that hid the losers would make every front look
equally convincing.

## What it says out loud

Three things the arithmetic can see and a reader might not:

- Candidates not fully scored. A hole is not a zero, so they are judged
  against nothing and the drawing says so rather than quietly ranking them.
- Axes every candidate scores alike. Either the decision does not turn on it,
  or a discriminating criterion is missing — [[meth-set-based-pareto]] says to
  ask which, out loud.
- Nothing eliminated at all. Every candidate trading against every other is a
  real result, and worth saying rather than reading as an empty list.

## It stores nothing

No section content, ever. A derived field is a READING, so there is nothing
to fill and nothing is written down.

The first cut of this template DID store the front, so the gate could read it
without recomputing. That is the second copy this whole design exists to
avoid: it drifts from the scores the moment one number changes, and nothing
reports the disagreement.

The gate recomputes. It costs a pass over a few dozen rows and it cannot be
wrong.

A field that declares `reads` is never required, for the same reason. Nobody
can fill it, so nobody is asked to.

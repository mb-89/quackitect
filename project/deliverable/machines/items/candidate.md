---
template: item-candidate
artifact: node
id_prefix: cand-
folder: project/spec/trace/candidate
applies_rigor:
  - systematic
applies_type:
  - default
checks:
  - field: name
    ban_markers:
      - TBD
      - TBC
      - TBR
      - "???"
    hint: a candidate nobody can name is a line nobody can argue with
  - field: statement
    ban_markers:
      - TBD
      - TBC
      - TBR
      - "???"
    hint: one line saying what this whole architecture is, not what one part does
  - field: picks
    ban_markers:
      - TBD
      - TBC
      - TBR
      - "???"
    hint: the options it visits, one per cluster — an empty pick list is not a candidate
sections:
  - Why this one
  - How it works
  - What it costs
  - What it leans on
---

# candidate — one option per cluster, combined into a whole architecture

Lives in `project/spec/trace/candidate/`. Written at M4 build-chart, by drawing
a line across the morphological box.

## IT IS A LINE ACROSS THE CHART, AND THAT IS THE WHOLE DEFINITION

The chart's rows are the function [[cluster]]s. Each row's cells are the
[[option]]s that serve that cluster. A candidate visits ONE cell per row.

Nothing else about it is stored, because nothing else about it is decided
yet. What it costs, what it risks and whether it wins are later states' work.

## AN OPTION IS NOT A CANDIDATE

Five options across three clusters is 125 possible candidates. That gap IS
the design space, and it exists only because the two are different things.

[[option]] carries the same distinction from the other side. Losing it
collapses the chart into a list.

## A CANDIDATE VISITS EVERY ROW

A cluster is a job the system has to do. A combination that skips one has not
said how that job gets done, so it is not yet a whole architecture.

A LINE MID-DRAWING IS NOT A DEFECT. The editor shows an incomplete line as
unfinished rather than refusing it — a person part-way through a thought is
the normal case, and refusing it would lose the part already drawn.

## IT NEVER PASSES THROUGH A PRUNED OPTION

An option carrying `pruned_because` is out of the chart. It still SHOWS, so
the reader can see what was considered, and no line may visit it.

## THE COLOUR IS NOT STORED

Each line is drawn in its own colour, and the palette re-spaces every time a
line is added or removed — the first of one, then the first and second of two.
So the colour is a function of position among the candidates, and writing it
into the node would make it wrong the moment anybody added another.

## Fields

- `id` — `cand-<slug>`.
- `type` — `"[[candidate]]"`.
- `name` — two or three words. It labels the line on the chart.
- `statement` — one line: what this architecture is, as a whole.
- `picks` — the [[option]] ids it visits, one per [[cluster]].

## The note is written TWICE, by two different states

Drawing the line writes the frontmatter and the first section. Composing it
writes the other three. Nothing else ever creates a candidate.

- AT build-chart, drawing the line: `name`, `statement`, `picks`, and **Why
  this one**. That is all anybody can honestly say at the moment a line is
  drawn.
- AT run-candidates, composing it: **How it works**, **What it costs**, **What
  it leans on**. Same note, three more sections.

THERE IS NO SECOND ARTIFACT. run-candidates does not mint a one-pager beside
the candidate; it fills the candidate in. A composed record living somewhere
else would be a second copy of the same thing, and the two would disagree the
first time anybody edited one.

## The Why this one section

Written when the line is drawn. One short paragraph: what this combination is
for, and what it trades away.

A chart holds more combinations than anybody composes, so a candidate that
cannot say why it was drawn is a line somebody dragged by accident.

## The How it works section

Written at composition. The whole architecture in a few paragraphs, not one
cluster at a time — the options are already named in `picks`, and repeating
them here says nothing new.

WHAT IS WORTH WRITING IS THE SEAMS. How the chosen options meet, what crosses
between them, and what the combination makes possible or impossible that no
single option does.

THE UNCHANGED BASELINE IS PART OF IT. A candidate is the existing system with
these options substituted in, not a design from nothing. Say what stays.

## The What it costs section

Written at composition, and it is the rough checks rather than a study.
[[meth-feasibility-checks]] owns the list; the short version:

- Resource estimation, early and rough.
- A worst-case number where one decides viability.
- The failure modes, where a mode decides.
- Make, reuse or buy per major element.

PROPORTIONAL, AND NO MORE. Prove what the decision needs. The deep checks are
M6's spikes, on the winner alone, and doing them here for every candidate
spends the budget before anything has been chosen.

AN HONEST "NOT KNOWN" IS AN ANSWER. A number nobody can produce yet is a risk
with a trigger, not a blank.

## The What it leans on section

Written at composition. What has to be true for this candidate to work.

It is the candidate's own assumptions, and they are what the gate reads when
two candidates score alike. One resting on three untested beliefs is not the
equal of one resting on none.

## NOTHING HERE IS SCORED

No comparison, no ranking, no "better than" anywhere in this note.

Composing and judging never share a state, and the reason is not tidiness: an
agent that knows the score while it writes the description writes a
description that earns the score. Scoring is evaluate-set's, against criteria
that were fixed before any candidate existed.

## Skeleton

```
---
id: cand-{{slug}}
type: "[[candidate]]"
name: {{two or three words}}
statement: {{what this whole architecture is, in one line}}
picks:
  - "[[opt-{{one per cluster}}]]"
---

## Why this one

{{what it is for, and what it trades away}}
```

## Sources

- Zwicky's morphological box, via [[meth-morphological-analysis]]. The line
  across the box is the variant, and this is the line.
- [[option]] for the cell, [[cluster]] for the row.

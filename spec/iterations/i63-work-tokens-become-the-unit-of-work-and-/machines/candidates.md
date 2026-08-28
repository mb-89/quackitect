---
steps:
  - id: the-round-as-written
    statement: compose cand-the-round-as-written - the seams, the rough costs, and what it leans on
    depends_on: []
    realization: document
  - id: files-while-open-evidence-once-closed
    statement: compose cand-files-while-open-evidence-once-closed - the seams, the rough costs, and what it leans on
    depends_on: []
    realization: document
  - id: nothing-new-the-form-keeps-doing-it
    statement: compose cand-nothing-new-the-form-keeps-doing-it - the seams, the rough costs, and what it leans on
    depends_on: []
    realization: document
  - id: the-work-holds-the-position
    statement: compose cand-the-work-holds-the-position - the seams, the rough costs, and what it leans on
    depends_on: []
    realization: document
---

# The candidate drawing

One compose state per line drawn on the chart at build_chart. Four lines were
drawn, sampled along the axis that reorganises everything else: how much of a
piece of work the system keeps, and for how long.

- AS PROPOSED keeps everything, forever. One file per work token for the life
  of the repository, minted whole on entry, listed by its position, and every
  one of them blocking. It is the kickoff's own design, and a comparison that
  omits it says nothing.
- FOLD AT CLOSE keeps everything while the record is open and nothing
  afterwards. Derived when asked rather than on entry, counted from an index,
  held open by an authorisation a hand must carry, and folded into the evidence
  when the record closes.
- THE NULL keeps nothing new at all. The evidence form goes on being the
  derived list a position cannot be left without finishing, and the four things
  a form field cannot do stay impossible.
- INVERTED keeps the work but moves the relation. Each piece names the
  positions it holds open, points at its guidance rather than copying it,
  declares whether it blocks at all, and is offered unless it waits on
  something it named.

They are independent and all four hang off start; the join waits for every one.

## What each state writes

It writes back into the candidate note its line already created, and mints
nothing:

- How it works - the whole architecture, and especially the seams between the
  chosen options.
- What it costs - rough feasibility checks, proportional and no more.
- What it leans on - what has to be true for it to work.

Nothing here is scored. Judging stays at evaluate-set, because an agent that
knows the score while it writes the description writes a description that earns
the score.

## The four lines were sampled against a measurement rather than a taste

The probe at find_by_probing counted what one record's work tokens would come
to and what the vault would hold: 320 to 402 files per record, and 22,080 to
27,738 across the 69 records already on trunk, against 1,821 trace nodes
standing today.

THE OWNER BOUNDED THE LARGER FIGURE ON 2026-08-26. An archived iteration
leaves trunk, a finished work token is deleted, and one iteration is open at a
time. Trunk therefore never holds 69 records' work tokens.

SO THE CEILING FOR THIS DESIGN IS 320 TO 402, and the ruling is
raid-dec-the-volume-is-bounded-by-one-open-iteration. It reverses a standing
must requirement and is not buildable until the owner reopens it.

AS PROPOSED sits at one end of that number and THE NULL at the other. FOLD AT
CLOSE exists because the measurement said the live population and the dead one
are different problems. INVERTED is on the list because it is the only line
whose cost does not turn on the count at all.

## Every line names more choices than the chart can hold

The chart's row is a cluster, and this round put thirteen options into one. A
line may visit one cell per row, so each candidate's `picks` names a single
option and its prose names the rest.

That is a limit of the chart rather than of the candidates, and it is captured
as a note for the retro. A compose state should read the candidate's own prose
as part of the line, not only its picks.

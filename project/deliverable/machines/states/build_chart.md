---
state: build_chart
state_kind: work
busbar: true
priority: operational
tags: finders
entry_read:
  - project/deliverable/machines/methods/meth-morphological-analysis.md
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
  - name: chart
    template: morph-box
    description: the morphological box — every option the finders found, and the candidates drawn across it
    guidance: |
      The chart builds itself from the option nodes. Nothing here is typed
      in; an option is changed in its own note.

      Draw a candidate by holding shift and clicking one cell per row. A
      line that has not visited every cluster is not yet a candidate, and
      says so.

      Two is the floor. One combination is not a choice.

      The method is [[meth-morphological-analysis]].
  - name: why_these
    template: free-form
    description: what the drawn candidates are a sample OF, and what the space holds that they do not
    guidance: |
      The chart holds far more combinations than anybody composes. Five
      options across three clusters is 125 possible candidates.

      Say what the shortlist is a sample of, so a reader can tell a
      deliberate cut from an accidental one.
  - name: dropped_finders
    template: free-form
    description: any cluster only one finder reached, and why the other six found nothing there
    guidance: |
      A chart where every option came from one finder means six searches
      did not happen, and the chart shows it.

      Say `none` where every cluster was reached from several directions.
guidance: THE BAR IS HERE. All seven finders must have submitted before this opens, so the chart is built over the whole search rather than over whichever finder finished first. The grid is DERIVED from the option nodes - there is no table to fill. Draw candidates across it, one option per cluster, and say what the space holds that they do not. The method rides in from meth-morphological-analysis.md by tag.
---

# Build the chart

The seven finders each minted option nodes. This is where they become one
chart, and where the candidates are drawn across it.

## IT USED TO BE TWO STATES, AND THAT WAS WRONG

`pick_shortlist` stood after this one until 2026-08-08. The owner asked why,
and there was no good answer: the chart is the space and the lines are the
sample, but they are ONE interaction. Splitting them split a person's hand in
half between two sittings.

The method's distinction survives — it just stops pretending to be two visits.

## WHY THE BAR STANDS HERE AND NOT ON THE END

A bar belongs over the WORK that joins the legs. The chart is that work: it
cannot be built over a partial search, because an option the trimming finder
would have struck is an option still standing.

The end pill closes the machine. It joins nothing.

## THE GRID IS DERIVED, SO THERE IS NOTHING TO FILL

Every option node already carries the cluster it serves, its statement, which
finder found it and whether it was pruned.

This state used to hold a flat table repeating all of that. That is a second
copy of the truth, and the two copies drift the first time somebody edits an
option in its own note. The table is gone.

## AN OPTION IS NOT A CANDIDATE

- An OPTION is one way of serving ONE cluster. It fills a cell.
- A CANDIDATE is one option per cluster, combined. It is a line across the box.

Five options across three clusters is 125 possible candidates. That gap is the
design space, and it exists only because the two are different things.

## DEDUPE, THEN PRUNE

Two finders reaching the same mechanism is a GOOD sign, not a duplicate to be
embarrassed about. Prior art and analogy overlap by design — one holds a
description, the other a transfer.

Keep one option. Name both sources on it.

## A STRIKE CARRIES ITS REASON

An option removed without one gets reinvented next iteration by somebody who
had no way to know it was considered.

A pruned option still SHOWS on the chart, struck through. The chart is the
whole space, including what was ruled out.

## TWO IS THE FLOOR

One line is not a choice, and every state after this one exists to compare
things. A single candidate means the space collapsed somewhere upstream, and
that is a finding rather than an answer.

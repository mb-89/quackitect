---
state: find_contradiction
state_kind: work
priority: operational
tags: finders
entry_read:
  - deliverable/machines/methods/meth-triz.md
legal_tools: se_file_read, se_file_write, se_file_patch, se_file_search, se_file_glob, se_file_list, se_log_query, se_answer
evidence:
  - name: applies
    template: choice-with-rationale
    options:
      - yes
      - no
    passing:
      - yes
      - no
    rationale_for:
      - no
    description: whether this finder applies here
    guidance: |
      Pick `yes` where this finder ran. It needs no essay.

      Pick `no` and the engine demands the reason on the same line. A
      cluster where no two demands genuinely fight is a real skip.

      A SKIP WITH NO REASON IS NOT A SKIP. It is a search nobody did,
      wearing a search's clothes, and the engine refuses it.
  - name: contradictions
    template: table
    columns:
      - cluster
      - contradiction
      - improving
      - degrading
      - separation
    column_help:
      - which function cluster it sits in
      - one line, naming the MOVE that makes one thing better and another worse
      - the standard parameter that gets BETTER
      - the standard parameter that gets WORSE
      - which of the four separations dissolved it, or NONE for the matrix
    picks:
      cluster: $clusters
      improving: $triz_parameters
      degrading: $triz_parameters
      separation: $triz_separations
    description: one row per contradiction, stated plainly and then restated in the standard parameters
    guidance: |
      ONE ROW IS ONE CONTRADICTION. Its five columns are the method's four
      steps, in order.

      The `contradiction` column names a MOVE. "Making the check exhaustive
      makes the form slow to open" is a contradiction. "Thorough versus
      fast" is two nouns beside each other.

      The two parameter columns are step 2, and they offer the 39 standard
      names because the matrix is indexed by those and no others.

      The `separation` column is step 3, which comes BEFORE the grid. The
      four separations dissolve more conflicts than the matrix does.

      [[meth-triz]] carries a worked example of exactly one row.
  - name: options
    template: refs
    of: option
    description: one option node per idea that breaks a contradiction rather than trading it
    guidance: |
      Each option names the separation or the principle number that
      produced it. An idea with no lineage is not a TRIZ finding.
guidance: |
  FINDER 3 of 7 - what nobody built because it looked impossible.

  - State the contradiction as a MOVE, in one line.
  - Restate it in the standard parameters.
  - Try the four separations first.
  - Then look up the principles.

  Runs in parallel with the other six.

  The grid is vendored at
  `deliverable/vendor/triz/triz-matrix.json`. Its 39 parameter names
  fill the two selectors.

  The method rides in from meth-triz.md by tag.
---

# Find the contradiction

The third finder, and the only one that starts from a conflict rather than
from a search.

Every other finder asks what exists. This one asks what does not exist
because two demands were assumed to be in tension.

## WHERE THE CONTRADICTION ITSELF IS WRITTEN

In the `contradiction` column, in project words, as one line.

The table used to hold only the two parameters, and that was a defect the
owner caught on 2026-08-08: a row saying `speed` against `reliability`
records the LOOKUP KEY and never records the problem. Somebody reading it
back a month later cannot tell what was being decided.

The line names the move. Doing X makes A better and B worse. Without the
move there is nothing to separate and nothing to look up.

## THE STEP PEOPLE SKIP IS THE SECOND ONE

Stating the conflict in your own words feels like progress and buys nothing
on its own. The matrix is indexed by 39 standard parameters, so a
contradiction left in project vocabulary cannot be looked up at all.

Both parameter columns offer those 39 names, read live from the vendored
file, each with its software equivalent. Type `latency` and the list finds
the parameter whose name never says it.

## SEPARATIONS BEFORE THE GRID

The four separations resolve more conflicts than the matrix does, and they
need no lookup.

Ask whether the two demands really apply at the same moment, in the same
place, to the same observer, at the same level. Often one of those four is
an assumption nobody made on purpose.

The column offers the four plus `NONE`. `NONE` is the honest answer that
sends the row to the grid, and it is not the same as a blank.

## A CLUSTER WITH NO CONTRADICTION IS A RESULT

This finder can come back nearly empty and still have worked.

Say which clusters were examined and found free of conflict. That is what
makes the empty rows readable rather than suspicious.

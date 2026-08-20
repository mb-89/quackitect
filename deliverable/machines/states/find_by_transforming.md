---
state: find_by_transforming
state_kind: work
priority: operational
tags: finders
entry_read:
  - deliverable/machines/methods/meth-scamper.md
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
      genuine green field with no incumbent to transform is the honest
      skip here, and it is rarer than it looks.

      A SKIP WITH NO REASON IS NOT A SKIP. It is a search nobody did,
      wearing a search's clothes, and the engine refuses it.
  - name: sweep
    template: table
    columns:
      - operator
      - subject
      - what_it_produced
    column_help:
      - one SCAMPER letter or one SIT pattern, picked from the catalogues
      - what it was applied to — a cluster, an option, or the incumbent
      - the idea it produced, or `nothing`
    picks:
      operator: $transform_operators
      subject:
        - $clusters
        - $options
        - the incumbent
    description: every operator against every subject, including the pairs that produced nothing
    guidance: |
      TWO CATALOGUES, and both run whole. The `operator` column offers
      every one of them, read live from [[meth-scamper]] — so the card is
      the only place either catalogue is written.

      Write `nothing` where an operator produces nothing. A blank row and
      an unasked question look identical afterwards.
  - name: options
    template: refs
    of: option
    description: one option node per transformation that produced something, each naming its operator
    guidance: |
      The `source` is the operator and the subject it was applied to. An
      idea with no lineage is not a finding from this method.
guidance: FINDER 6 of 7 - forced transformations on something that already exists. Two catalogues run whole, SCAMPER's seven letters and SIT's five patterns, against every subject worth transforming. Mechanical creativity, no muse required. It OVERLAPS find_without on one operator, Eliminate, and that is fine - the null option is worth reaching twice. Runs in parallel with the other six. The catalogues ride in from meth-scamper.md by tag.
---

# Find by transforming

Every other finder looks somewhere else. This one looks at what is already
on the table and changes it.

## THE ONLY FINDER THAT MUTATES

The other finders leave the subject alone.

- Prior art finds what exists elsewhere.
- Analogy finds it solved in another field.
- Contradiction finds what nobody built.
- Trimming removes.
- Heuristics apply general rules.

None of those takes an existing option and turns it into a different one.
That is this state, and it is why the SyA corpus lists the Osborn Checklist
and SIT among the methods with a high innovation guarantee, beside TRIZ and
morphological analysis.

AutoTRIZ (2025) names SCAMPER first among the knowledge-based ideation
methods worth automating.

## WEAK ON GREEN FIELDS, STRONG ON REDESIGN

The card says so, and it is honest. If nothing exists yet, this finder has
little to bite on and its sweep will be mostly `nothing`.

That is a legitimate result. Pahl/Beitz distinguishes new design from
adaptation and variant design, and most work is not new design.

## THE SWEEP IS EXHAUSTIVE, AND THAT IS THE AI-ERA PART

Twelve operators against every subject. The SCAMPER card says "one honest
minute each", which was an attention budget written for a person, and the
budget is gone.

A person tried three letters. Running all twelve costs minutes and the
misses are as informative as the hits.

## IT OVERLAPS TRIMMING, DELIBERATELY

SCAMPER's Eliminate, SIT's Subtraction and TRIZ's Trimming are the same
move, and [[find_without]] runs it exhaustively over every cluster.

Reaching the null option twice is not waste. It is the option with the
highest value and the lowest proposal rate, and the chart dedupes.

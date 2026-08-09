---
state: find_by_heuristic
state_kind: work
priority: 0.2
tags: finders
entry_read:
  - project/deliverable/machines/methods/meth-heuristics-catalog.md
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

      Pick `no` and the engine demands the reason on the same line. The
      catalogue is eight rules and the sweep is mechanical, so a skip here
      wants a strong one.

      A SKIP WITH NO REASON IS NOT A SKIP. It is a search nobody did,
      wearing a search's clothes, and the engine refuses it.
  - name: sweep
    template: table
    columns:
      - heuristic
      - cluster
      - what_it_suggests
    column_help:
      - the rule, picked from the catalogue
      - which function cluster it was held against
      - what it implies here, or `nothing` where it does not bite
    picks:
      heuristic: $heuristics
      cluster: $clusters
    description: every heuristic held against every cluster, including the pairs where it suggested nothing
    guidance: |
      EVERY heuristic against EVERY cluster. The catalogue is short and
      the pass is mechanical, so a partial sweep is a choice nobody made
      on purpose.

      Write `nothing` where a rule does not bite. A blank row and an
      unasked question look identical afterwards.

      The catalogue is [[meth-heuristics-catalog]].
  - name: options
    template: refs
    of: option
    description: one option node per heuristic that bit, each naming the rule it came from
    guidance: |
      The `source` is the rule itself. An option from this finder is
      traceable to one line of the catalogue.
guidance: FINDER 5 of 7 - the old engineering rules, held against the problem on purpose. Deduction dressed as creativity, and none the worse for it. Run the WHOLE catalogue against EVERY cluster. Record where each rule suggested nothing. A partial sweep and a thorough one look the same once the table is written. Runs in parallel with the other six. The catalogue rides in from meth-heuristics-catalog.md by tag.
---

# Find by heuristic

The accumulated rules of thumb, applied deliberately rather than remembered
by luck.

## WHY THIS IS A FINDER AND NOT A REVIEW

FRAME names its References group, and says that group FEEDS ENUMERATION
([[meth-frame-tactics]]). The group is:

- heuristics
- patterns
- catalogs
- standards
- benchmarking
- reference architectures
- TRIZ

Every other item on that list already had a finder. Heuristics did not.

The SyA corpus says the same thing from the other side. Its "using available
knowledge" list opens with heuristics, quoting one — "group strongly-related
elements, separate unrelated" — and that rule alone changes a partition.

AutoTRIZ (2025) names Design Heuristics as one of three knowledge-based
ideation methods worth automating, beside SCAMPER and Design-by-Analogy. We
had the third and neither of the first two.

## THE SWEEP IS EXHAUSTIVE, AND THAT IS THE AI-ERA PART

The catalogue is eight rules. The clusters are however many
partition-functions found. Eight times that is a small number, and running
all of it is minutes.

A person applied the two or three rules they happened to remember. Nothing
about the method wanted that; it was an attention budget, and the budget is
gone.

## A RULE THAT DOES NOT BITE IS A ROW, NOT A GAP

Write `nothing`. The table is evidence that the question was asked, and a
missing row cannot be told apart from a question nobody put.

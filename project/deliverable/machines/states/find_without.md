---
state: find_without
state_kind: work
priority: operational
tags: finders
entry_read:
  - project/deliverable/machines/methods/meth-trimming.md
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

      Pick `no` and the engine demands the reason on the same line. This
      one is the hardest to skip honestly — every cluster can be asked
      whether it could go.

      A SKIP WITH NO REASON IS NOT A SKIP. It is a search nobody did,
      wearing a search's clothes, and the engine refuses it.
  - name: trims
    template: table
    columns:
      - cluster
      - who_takes_over
      - what_breaks
    column_help:
      - which function cluster is being asked whether it can go
      - another cluster, the environment, the user, or nobody
      - what stops working if it goes, in one line
    picks:
      cluster: $clusters
      # COMPLETE WITHOUT BEING FREE. The job goes to another cluster or it
      # leaves the system, and those are the only three places it can go.
      who_takes_over:
        - $clusters
        - the environment
        - the user
        - nobody
    description: every cluster asked whether it can go, and what happens if it does
    guidance: |
      One row per cluster. EVERY cluster, including the ones that
      obviously stay — a cluster that survived the question is better
      justified than one nobody asked about.

      The method is [[meth-trimming]].
  - name: options
    template: refs
    of: option
    description: one option node per cluster that can genuinely go, or absorb another
    guidance: |
      The null option is a real option and it goes on the chart like any
      other. It is regularly the best one there.
guidance: FINDER 5 of 5 - what if the cluster does not exist. Ask it of every cluster. Then ask who does its job instead. The answer is another cluster, or something outside the system, or nobody at all. Runs in parallel with the other four. Trim what is expensive, not what is cheap. The method rides in from meth-trimming.md by tag.
---

# Find what can go

The fifth finder, and the only one that removes.

Every other finder adds options. This one takes a cluster away, and the
removal IS the option.

## IT HAS TO BE ITS OWN STATE

Nobody proposes it otherwise. Asked for options, an agent and a person both
produce things to BUILD, because that is what an option sounds like.

The null option arrives only when something asks for it by name.

## ASK IT OF EVERY CLUSTER

Including the obvious keepers. A cluster that survived the question carries
a reason afterwards; one nobody asked about carries only its own existence.

That is why the table has a row per cluster rather than a row per trim.

## TRIM WHAT IS EXPENSIVE

The interesting question is always the biggest cluster, the one that looks
structural.

Removing a small support function saves nothing and feels productive, which
is exactly why it is what people do.

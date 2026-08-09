---
state: find_prior_art
state_kind: work
priority: 0.2
tags: finders
entry_read:
  - project/deliverable/machines/methods/meth-prior-art.md
  - project/deliverable/machines/methods/meth-benchmarking.md
exit_script:
  - project/deliverable/engine/bin/outward-search.ts
legal_tools: se_file_read, se_file_write, se_file_patch, se_file_search, se_file_glob, se_file_list, se_log_query, se_answer, se_web_search, se_web_fetch
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
      physical build nobody can execute, a cluster with no incumbent to
      transform, a domain with no literature — these are real, and
      skipping one is legitimate.

      A SKIP WITH NO REASON IS NOT A SKIP. It is a search nobody did,
      wearing a search's clothes, and the engine refuses it.
  - name: options
    template: refs
    of: option
    description: one option node per idea found, each citing where it came from
    guidance: |
      Search before inventing. Cite everything — an idea with a source is
      checkable, one without is a rumour.

      The methods are [[meth-prior-art]] and [[meth-benchmarking]].
  - name: literature
    template: free-form
    description: what was found WRITTEN DOWN, wherever it was written
    guidance: |
      Naming the problem in the field's vocabulary is half the search.

      Say `none` where the literature turned up nothing, and mean it.
  - name: shipped
    template: free-form
    description: what was found RUNNING — competitors, our own predecessor, what reverse engineering reads off the artifact
    guidance: |
      Three sources, and the last two are the ones people skip.

      - Competitors. What does the nearest product do for this cluster?
      - Our own predecessor. What did the last version do, and why did it
        change?
      - Reverse engineering. The file format, the wire protocol, the error
        messages, the shape of the config.

      Describe the mechanism, never the marketing. Say `none` and mean it.
  - name: dry_wells
    template: list
    description: clusters where the search found nothing, one line each
    guidance: |
      A cluster nobody has published about and nobody ships is a finding.
      Say so rather than leaving a gap that reads like laziness.
guidance: FINDER 1 of 4 - what is ALREADY KNOWN outside this project, written down or running. Prior art covers both — a shipped product is prior art, and so is the paper about it. The two fields exist for a reason. A search that only reads papers stops before the predecessor and the reverse engineering. Those are the richest sources, and the ones people skip. Runs in parallel with the other three. Mint one option node per idea, each naming its cluster and its source. The methods ride in from meth-prior-art.md and meth-benchmarking.md by tag.
---

# Find prior art

Somebody already solved some of this. Find out how, before inventing.

## PRIOR ART IS EVERYTHING ALREADY PUBLICLY KNOWN

Written down or running. A shipped product is prior art. So is the paper
about it, the standard that governs it, and the post-mortem of the time it
failed.

THIS USED TO BE TWO STATES (owner ruling 2026-08-08). One was told to find
what was written and the other what shipped, which needed a rule to decide
which one a shipped-product-with-a-paper belonged to. A split whose main job
is adjudicating its own overlap is not a split.

## TWO FIELDS, BECAUSE THE SECOND SEARCH IS THE ONE THAT GOES MISSING

An agent given one box does one web search, finds three papers, and stops.
The predecessor and the reverse engineering never happen — and they are the
richest sources there are, because their failures are recorded and nobody has
to guess at the context.

So the angles are separate REQUIRED fields rather than separate states. A
field saying `none` is a claim somebody made. An angle nobody was asked about
is a search nobody did.

## THE TWO FAILURE MODES ARE OPPOSITE

- THE LITERATURE FAILS BY BEING ASPIRATIONAL. A paper describes a design
  nobody ever ran, whose costs nobody ever paid.
- WHAT SHIPPED FAILS BY BEING OPAQUE. You see behaviour and guess the
  mechanism, and a vendor's page is a claim rather than a quality judgment.

Each one's blind spot is the other's evidence. That is why one person answers
both of them in the same state, at the same time.

## A DRY WELL IS A RESULT

A cluster with no literature and nothing shipped is worth knowing about. It
means either the problem is genuinely new, or it is being described in the
wrong words.

Both are findings. Neither is an empty row.

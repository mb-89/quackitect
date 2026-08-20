---
state: find_by_probing
state_kind: work
priority: operational
tags: finders
entry_read:
  - deliverable/machines/methods/meth-spike-tracer.md
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_run
  - se_test
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
      commonest honest skip is a PHYSICAL build — a probe that needs a
      machine shop is not a probe an agent runs.

      A SKIP WITH NO REASON IS NOT A SKIP. It is a search nobody did,
      wearing a search's clothes, and the engine refuses it.
  - name: probes
    template: table
    columns:
      - question
      - timebox
      - what_was_faked
      - verdict
    column_help:
      - the one question, written BEFORE the probe ran
      - the budget, and running out is a verdict
      - every stub the probe leaned on — the unnamed one hides a false positive
      - what the run actually showed
    description: every probe run, with the one question it asked and what it stubbed
    guidance: |
      One row per probe. The question is written BEFORE the probe runs — a
      probe that finds its question afterwards found a rationalisation.

      `what_was_faked` is the load-bearing column. Every probe stubs
      something, and an unnamed stub is where a false positive lives.

      Running out of timebox is a verdict, not a failure.

      The method is [[meth-spike-tracer]].
  - name: options
    template: refs
    of: option
    description: one option node per probe that worked, each citing its probe
    guidance: |
      The `source` is the probe. This is the only finder whose source is
      something we ran rather than something we read.
  - name: dead_ends
    template: list
    description: what was tried and did not work, one line each, with what killed it
    guidance: |
      A probe that failed is evidence nobody has to pay for twice, and it
      is worth more than an option nobody tried.

      Say `none` where every probe produced an option.
guidance: FINDER 7 of 7 - build the cheapest runnable version and find out. Every other finder REASONS about options; this one RUNS them. It is the one generator that could not exist before, and the reason is boring. A spike used to cost days. So it was rationed to the riskiest unknown, and never spent on whether something is an option at all. Throwaway means throwaway; what survives is the finding, never the code. Runs in parallel with the other six. The method rides in from meth-spike-tracer.md by tag, shared with M6's spikes.
---

# Find by probing

Build it and see.

## THE ONE GENERATOR THAT IS NEW

Owner ruling 2026-08-08, and it is the answer to a question worth asking:
which finding methods does the current era enable that could not exist
before?

Not many. Every other method in this drawing predates the machine and works
the same way it always did — what changed is that the catalogues can now be
run to completion instead of sampled.

This one is different. A spike used to cost days, so it was rationed to the
riskiest unknown and never spent on "is this even an option". The cheapest
runnable version of an idea is now an hour, which turns building into a way
of FINDING.

## IT SHARES ITS CARD WITH M6's SPIKES

One card, two uses ([[meth-spike-tracer]]). A probe and a spike are the same
act with different questions — discover here, derisk there — so an
improvement to either improves both.

## THE THREE THINGS THAT MAKE A PROBE HONEST

- ONE QUESTION, WRITTEN FIRST. A probe that discovers its question afterwards
  discovered a rationalisation.
- A TIMEBOX, where running out is a verdict.
- A NAMED FAKE. Every probe stubs something, and the unnamed stub is where a
  false positive lives.

## THROWAWAY MEANS THROWAWAY

A probe's code is not a head start on the build. Treating it as one is how a
prototype ships by accident, and what survives from here is the finding.

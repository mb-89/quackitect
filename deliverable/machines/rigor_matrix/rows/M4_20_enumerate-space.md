---
kind: matrix-row
name: enumerate-space
statement: "Enumerate the design space: the morphological chart over the partitioned functions; the shortlist seeds the parallel candidates."
state_kind: work
filled_by: agent
busbar: true
depends_on:
  - partition-functions
  - derive-criteria
runs: enumerate-space.canvas
seeds: candidates
major: full
minor: none
patch: none
product: full
specification: full
major_note: |
  Applies in full: the morphological chart over the re-partitioned
  functions, options from catalogs, patterns and reference architectures.
  SEEDS the candidate machine - one parallel compose state per
  shortlisted combination, exactly as the row draws it. The unchanged
  part of the baseline enters every candidate as a fixed block.
minor_note: |
  Does not apply. No design space opens while the architecture holds; no
  candidate machine is seeded. STRIKE PROPOSAL - owner adjudicates.
patch_note: |
  Does not apply. No design space opens for a behavior fix; no candidate
  machine is seeded. STRIKE PROPOSAL - owner adjudicates.
product_note: |
  STANDING ARTIFACT: the morphological chart with its pruned cells and
  reasons, and the candidate one-pagers. The design space CONSIDERED is
  part of the product's record - the rejected roads explain the taken
  one.
specification_note: |
  DOCUMENT FORM: the morphological chart as a table (rows, options,
  pruned cells greyed with reasons); each shortlisted candidate as a
  one-pager with its matrices. The design-output chapter links the
  candidates; only the chart inlines.
---

## Guidance

THE BUSBAR SITS HERE, AND IT IS WHY (owner ruling 2026-08-08). This is an AND-join: the design space does not open until BOTH the partitioning and the criteria stand. Criteria written with the options already on the table can be chosen to suit a favourite. Options generated with no criteria fixed drift toward whatever is easy to score. The sources put weights at step 3 and variants at step 4 for the same reason ([[meth-eight-step-decision]]).

MORPHOLOGICAL ANALYSIS IS THE FRAME, NOT ONE METHOD AMONG THE OTHERS. The chart's rows are the function clusters and its cells are options, so every finder below is a way of FILLING CELLS ([[meth-morphological-analysis]]).

THIS ROW IS A SUB-MACHINE STATE, AND CARRIES NO EVIDENCE OF ITS OWN (owner ruling 2026-08-08). A sub-machine IS a canvas. So the row names the drawing and takes its name from it. The work lives in the drawing's states, and each of those carries its own form.

IT USED TO CARRY A CHART AND A SHORTLIST FIELD. Neither could ever be filled. The walk descends into the sub-machine on the way in, and completes this state on the way out. Its form is never served in either direction.

SEVEN FINDERS, EACH A DIFFERENT SEARCH. They are separate states because they hold different evidence, and one agent asked for "options" converges on the obvious ones.

- [[meth-prior-art]] finds what is already known outside this project, written down or running. [[meth-benchmarking]] is its shipped half.
- [[meth-triz]] finds what nobody built because it looked impossible.
- [[meth-analogy-transfer]] finds it solved in another field.
- [[meth-trimming]] finds the option of not doing it at all.
- [[meth-heuristics-catalog]] holds the old engineering rules against every cluster.
- [[meth-scamper]] mutates what already exists, through SCAMPER and SIT.
- [[meth-spike-tracer]] builds the cheapest runnable version and finds out.

WHERE THE LIST CAME FROM, so it is not relitigated. Three sources name the same set.

- [[meth-frame-tactics]] puts them in its References group, and says that group FEEDS ENUMERATION.
- The SyA corpus at @ai/sya_kb chapter 01 lists them under "using available knowledge". It ranks TRIZ, SIT and morphological analysis at the HIGH end of innovation guarantee.
- AutoTRIZ (2025) names SCAMPER, Design Heuristics and Design-by-Analogy as the ones worth automating.

WHAT IS DELIBERATELY ABSENT. Brainstorming, brainwriting and lotus blossom are group-dynamics devices. Mind mapping shapes a problem rather than finding options.

The corpus ranks all of them low on innovation guarantee. An agent has no crowd and no loudest voice, so the thing they exist to fix does not exist here. They belong to ideation, not to this state.

Biomimetic design is missing for a different reason. It is analogy transfer with nature as the source domain, so it lives in that finder.

SIX OF THE SEVEN PREDATE THE MACHINE. What changed is that their catalogues can now be run to COMPLETION rather than sampled.

- Forty TRIZ principles against every cluster.
- Twelve transformation operators against every subject.
- Eight heuristics against every cluster.

The old cards budget one human minute per operator. That budget is the only part of them that aged.

PROBING IS THE ONE THAT IS NEW. A spike used to cost days, so it was rationed to the riskiest unknown and never spent on whether something is an option at all. It shares its card with M6's spikes, so improving either improves both.

A FINDER MAY BE SKIPPED, WITH A NAMED REASON. Each carries an `applies` field. A physical build nobody can execute from the lane is an honest skip; a blank one is a search nobody did wearing a search's clothes.

IT WAS FIVE UNTIL 2026-08-08, then four, now seven. Prior art and benchmarking merged because a shipped product IS prior art.

AN AGENT CAN AFFORD ALL SEVEN, and that is the change from the hand-drawn era. Fire them in parallel and consolidate; breadth is cheap here and expensive later.

THE CHART IS THE JOIN, and the AND bar stands over it rather than over the end. A chart built from a partial search still holds options the trimming finder would have struck. Dedupe across the five, prune loudly with reasons, then shortlist. Sixty options and no pruning is the failure mode.

This state SEEDS the iteration's candidate machine: one parallel compose state per shortlisted combination. Each candidate elaborates:

- its static partitioning
- its allocation DMM
- its element DSM
- its interfaces, which are the inter-cluster edges
- its structure metrics
- rough feasibility ([[meth-feasibility-checks]])
- its rationale

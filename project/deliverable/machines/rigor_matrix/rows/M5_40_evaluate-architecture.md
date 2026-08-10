---
kind: matrix-row
name: evaluate-architecture
statement: "Evaluate the architecture: the ATAM walk of the quality scenarios, with the structure numbers computed beside it."
state_kind: work
busbar: true
filled_by: agent
depends_on:
  - decompose-structure
  - record-adrs
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
  - name: walk
    template: scenario-deck
    description: the quality scenarios walked worst grade first, each ruled addressed, at risk or unaddressed — at-risk and unaddressed mint their register entry on the click
  - name: metrics
    template: structure-metrics
    description: the structure numbers computed off the element matrix, one typed line per number saying what it moved
  - name: fitness_candidates
    template: list
    of: requirement
    description: the measurable scenarios that could automate at M7 — filed by the deck's fitness button, or typed as references
major: full
minor: tailored
patch: none
product: full
specification: full
major_note: |
  Applies in full: every quality scenario dealt and ruled, the structure
  numbers computed and interpreted, fitness candidates named for M7.
minor_note: |
  Walk ONLY the quality scenarios the delta touches through the standing
  structure. Record each one as addressed, at risk or unaddressed. The
  full walk is not repeated.
patch_note: |
  Does not apply. The quality-scenario walk holds as evaluated. STRIKE
  PROPOSAL - owner adjudicates.
product_note: |
  STANDING ARTIFACT: the quality-scenario walk - every scenario with its
  verdict and carrying decision. The at-risk list is a standing input to
  rank-unknowns, and the fitness candidates to author-tests.
specification_note: |
  DOCUMENT FORM: the quality-scenario walk as a derived table - scenario,
  verdict, carrying decision - in the architecture chapter, after the
  figures it judges.
---

## Guidance

Walk per [[meth-atam-lite]]. The card explains ATAM itself: the nine
steps, the utility tree, and the four outputs.

- The DECK deals the quality scenarios, worst damage grade first. Rule
  every card:
  - addressed — the structure delivers the measure, and the path is the
    evidence. Name a decision only where a recorded choice is why it
    holds; not every quality needs one.
  - at risk — name the hinge and the tradeoff. The register risk mints
    on the click.
  - unaddressed — the register issue mints on the click. A standing
    finding for the gate.
- The walk READS the register's decisions, so they are recorded first.
  That is why this state depends on record-adrs (owner ruling
  2026-08-10).
- THE METRICS BELONG HERE, not at the decomposition (owner ruling
  2026-08-10; the corpus files DSM analysis under quantitative review).
  One typed line per number: what it moved. "Moved nothing" is a
  complete answer.
- FITNESS CANDIDATES: mark the scenarios whose response measure could
  run as an automated check. The list feeds M7's author-tests.
- A scenario found during the walk becomes a quality requirement — a
  ripple to M3, never a side list.

Evaluation, never verification. Findings that shake the choice reopen
converge-pugh; findings that shake requirements ripple to M3.

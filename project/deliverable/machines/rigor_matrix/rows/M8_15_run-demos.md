---
kind: matrix-row
name: run-demos
statement: "Run the demonstrations: the seeded demo machine - one demo per must story, performed for real, each minting its report."
state_kind: work
filled_by: agent
depends_on:
  - fill-story-evidence
runs: demos
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_run
  - se_test
major: full
minor: tailored
patch: none
product: full
specification: tailored
major_note: |
  Applies in full: every must story's demonstration performed against
  the shipped system, every run minting its report.
minor_note: |
  The NEW must stories demonstrate; resident reports stand unless the
  delta's behavior touched what they show - those re-run.
patch_note: |
  Does not apply. No musts enter at patch grain; the resident
  demonstrations are product cadence.
product_note: |
  Standing obligation: the demonstrations are repeatable - the reports
  are on file and the procedures re-run, never one-time theater.
specification_note: |
  DOCUMENT FORM: the reports, one per demonstrated story, in the
  record's reports folder. The gate cites them per must story.
---

## Guidance

The placeholder the seeded demo machine fills. fill-story-evidence authors the drawing; entering this state runs it, one state per must story, parallel where independent.

Each demo state does three things:

- PERFORM the demonstration spec's Procedure against the shipped system. A demonstration is OBSERVED WORKING end to end - in any discipline: a bench run, a walkthrough, a pilot session.
- WRITE THE REPORT: reports/rpt-<story>.md in the record - the spec, the date, who performed it, what was observed, references to what the observation left behind. The shape is in [[meth-validation-container]].
- FILL the story's evidence slides with the report reference and what it shows.

An unreplaced placeholder FAILS MECHANICALLY. The compiled machine refuses to serve this state plain when no drawing was seeded. Author the drawing at fill-story-evidence, always.

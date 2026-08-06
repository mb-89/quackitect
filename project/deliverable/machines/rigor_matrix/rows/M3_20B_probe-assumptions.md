---
kind: matrix-row
name: probe-assumptions
statement: Field-probe every environment assumption a requirement builds on.
state_kind: work
filled_by: agent
depends_on:
  - write-requirements
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_web_search
  - se_web_fetch
evidence:
  - name: probes
    description: each assumption, its probe, its result
major: full
minor: tailored
patch: tailored
product: full
specification: tailored
major_note: |
  Applies in full: every environment assumption the change's requirements
  build on gets its probe. An architectural move on an unprobed
  assumption is the expensive way to find out.
minor_note: |
  Applies for the delta's NEW environment assumptions: one probe each,
  real channel, results into RAID. Standing probed assumptions are not
  re-probed.
patch_note: |
  One narrow duty: when the patch exists BECAUSE an environment assumption
  proved wrong, record that probe result and correct the assumption where
  it is written. Otherwise nothing here.
product_note: |
  STANDING ARTIFACT: the probed-assumption record inside RAID. At rest
  every environment assumption a requirement builds on is probed or
  scheduled with a reason - and a probe that aged past its trigger is
  re-run, not trusted.
specification_note: |
  DOCUMENT FORM: probe results as EVIDENCE DOCUMENTS, one per probe,
  linked from the RAID entry they settle. The book links, never inlines.
---

## Guidance

Assumptions are REQUIREMENT METADATA: each requirement carries the environment assumptions it builds on, and the RAID register surfaces them ([[meth-raid]]). One probe settles what a datasheet claims: check the real channel - what a harness actually loads, what an API actually returns, what the material actually measures. A probe's result updates the metadata and the register.

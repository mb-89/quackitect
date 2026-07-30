---
kind: matrix-row
name: probe-assumptions
statement: Field-probe every environment assumption a requirement builds on.
state_kind: work
filled_by: agent
depends_on:
  - write-requirements
COMMENT: "state: probably means assumptions should be requriement metadata and be displayed in the raid"
---

## Guidance

One probe settles what a datasheet claims: check the real channel - what a harness actually loads, what an API actually returns, what the material actually measures. Probed assumptions update the RAID register ([[meth-raid]]).

## Evidence form

- probes | each assumption, its probe, its result | required

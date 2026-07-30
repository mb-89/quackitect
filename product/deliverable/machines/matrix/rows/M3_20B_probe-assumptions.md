---
kind: matrix-row
name: probe-assumptions
statement: Field-probe every environment assumption a requirement builds on.
state_kind: work
filled_by: agent
depends_on:
  - write-requirements
evidence:
  - name: probes
    description: "each assumption, its probe, its result"
---

## Guidance

Assumptions are REQUIREMENT METADATA: each requirement carries the environment assumptions it builds on, and the RAID register surfaces them ([[meth-raid]]). One probe settles what a datasheet claims: check the real channel - what a harness actually loads, what an API actually returns, what the material actually measures. A probe's result updates the metadata and the register.

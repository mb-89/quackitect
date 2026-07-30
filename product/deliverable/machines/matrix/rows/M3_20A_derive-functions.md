---
kind: matrix-row
name: derive-functions
statement: Derive the solution-neutral function structure from the requirements.
state_kind: work
filled_by: agent
depends_on:
  - write-requirements
---

## Guidance

Per [[meth-function-structures]]: requirements first, functions from them - the entry into concepting. Verb + noun, no technology named. Every requirement maps to at least one function (requires edge); every use-case step covered. The function structure is the feedstock of M4's partitioning.

## Evidence form

- function_structure | overall function and sub-functions, solution-neutral | required
- coverage | every requirement mapped, every use-case step covered - the matrix filters show no holes | required

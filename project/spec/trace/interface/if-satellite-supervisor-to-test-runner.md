---
minted_in: i27
id: if-satellite-supervisor-to-test-runner
type: "[[interface]]"
statement: A test run is started inside the satellite that owns the record, in that record's tree.
source: el-satellite-supervisor
destination: el-test-runner
carries:
  - flow-worktree
form: process control
source_refs:
  - decompose-structure, the element matrix's owed cell
  - req-test-run-carries-its-question
---

The runner is a child of the satellite, so it inherits the working directory
and cannot be pointed at a different record by accident.

## Why it matters more here

A test proves a claim about a
record. A run that read shared code from trunk while the record overrides it
would prove the claim about a composition nobody is running.

## What crosses

The tree, and nothing else. The question, the scope and the
verdict all belong to the runner's existing interfaces.

## A run never outlives its satellite

Reaping a satellite reaps its
runs, because a verdict arriving after the machine that asked for it is gone
has nowhere to land.

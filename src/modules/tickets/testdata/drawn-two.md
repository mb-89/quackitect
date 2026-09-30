---
kind: [[ticket]]
state: open
step: review
steps:
  - name: build
    does: makes the change
    checklist:
      - the change touches no file the ask leaves out
    evidence:
      - name: lint
        form: command
        says: the tree builds and lints
  - name: review
    does: reads the change against the ask
    on_fail: build
    input: build
    evidence:
      - name: verdict
        form: verdict
        says: accept, or reject with findings
record:
  - step: build
    hand: box one
    skipped: true
    why: nothing to build
---

# Ask

A ticket whose build stands skipped.

# build

## lint

- ./RUNME.sh check

## checked

- the change touches one file

# review

## verdict

# Discussion

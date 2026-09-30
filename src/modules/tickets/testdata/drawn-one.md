---
kind: [[ticket]]
state: open
step: design/draft
steps:
  - name: design
    steps:
      - name: draft
        does: writes the approach the ask calls for
        by: anyone
        checklist: ["every file the approach names stands opened", "the callers list names every caller"]
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes
          - name: tests
            form: list
            says: every test the change adds, one a line
      - name: tests-red
        does: writes the tests the ask calls for
        input: draft
        evidence:
          - name: red
            form: list
            says: every test file standing red
  - name: view
    does: reads the change in the view the ask names
    by: person
    when: view
    on_fail: design
    input: ["design/tests-red"]
    evidence:
      - name: seen
        form: verdict
        says: pass where the view shows the number
record:
  - step: design/draft
    hand: box one
---

# Ask

A drawing of one ticket.

# design

## draft

### approach

<!-- the form is text -->

The index draws the ticket.

### tests

<!-- the form is list -->

## tests-red

### red

# view

## seen

# Discussion

---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: tsp-bound-surface
type: "[[test-spec]]"
statement: A surface showing one record's work resolves its own links to that record, while the walk stands in another.
method: "demonstration"
verifies:
  - "req-a-surface-resolves-to-what-it-shows"
files:
  - none — the procedure is the whole definition, because the pass is a person opening a link and landing in the right place
---

## Scope

The panel and the evidence forms it renders, while two records are open at
once.

WHY DEMONSTRATION AND NOT TEST. The failure this guards is a person clicking a
link and landing in the wrong tree. A test can assert a URL; only a person can
see that the page they reached is the page the form was about.

## Approach

Observed working, without instrumented capture. One session, two records, one
watcher.

The pass is stated per step below, so the watcher is not left to judge.

## Procedure

- OPEN TWO RECORDS. One is walked; the other stands open and idle.
  - OBSERVE: the panel lists both, and each shows its own position.
- OPEN THE IDLE RECORD'S EVIDENCE FORM while the walk stands in the other.
  - OBSERVE: the form shows the idle record's content, not the walked one's.
- FOLLOW A LINK INSIDE THAT FORM to one of its own findings.
  - OBSERVE: the finding that opens belongs to the record the form is about.
  - THIS IS THE RECORDED FAILURE. note-81c6cc77171e and note-b086cd36f9a0
    record a record's worktree sitting outside the folder the owner had open,
    with the form's links refusing to open its own findings.
- ASK THE PANEL WHICH RECORD IT IS SHOWING.
  - OBSERVE: the answer names the record, and it is the one on screen.

## What makes this pass or fail

PASS when every link opened from a form about record A lands in record A,
while the walk stands in record B, and the surface says which record it is
showing.

FAIL on any link that lands in the walked record, or in trunk, or nowhere.

## What it leans on

That two records can be open at once with satellites serving both. Until the
build stands, this procedure cannot run, and saying so is the honest state
rather than a blank.

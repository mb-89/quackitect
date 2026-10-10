---
kind: [[ticket]]
state: open
step: decide
steps:
  - name: design
    steps:
      - name: owner-read
        does: reads the ask a handover carries, before any draft
        by: person
        when: handed
        input: ask
        evidence:
          - name: read
            form: verdict
            says: pass where the ask says what the owner said, or fail with the owner's words
      - name: draft
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it", "every config key the approach adds names each default file it lands in"]
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
          - name: callers
            form: list
            says: every caller of what the approach changes, one a line, as a file and a function
          - name: tests
            form: list
            says: every test the change adds, one a line, as a file and a test name
          - name: answers
            form: list
            says: every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft
          - name: size
            form: list
            says: every file the approach touches, one a line
  - name: decide
    does: records why the unwatched path stays, and closes the ticket on that reason
    by: anyone
    to: retro
    input: design/draft
    evidence:
      - name: reason
        form: text
        says: why the code stays, and where the work it waits on stands
process: [[spec/processes/standard]]
process_hash: c671f20a6ae2a4a6
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box b0a22705166b · claude-code-remote
    hash_before: e05211083f4957042659b79497d301884cf20b3a
    hash_after: e05211083f4957042659b79497d301884cf20b3a
    inputs:
      - name: ask
        hash: 43208b7915326773
        size: 580
    def: c01ae0f2ace0cecb
group: the-tui-keeps-its-place
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: the scheduler's unwatched and pending path either meets a caller outside its test, or leaves the code, so no test proves a state no index reaches.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `Scheduler.unwatched` in `src/q/scheduler.go` takes a write only in `scheduler_test.go`, so `TestWhyNamesAPendingValue` passes on private state and every wave pays for a check that always answers watched.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/q/` passes, with no test writing `unwatched` by hand, or this ticket closes dropped naming the reason the code stays
- `./RUNME.sh check` answers 0 on this box

<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
view: none

<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->
from: none

# design

## owner-read

<!-- reads the ask a handover carries, before any draft -->

### read

<!-- pass where the ask says what the owner said, or fail with the owner's words -->

<!-- the form is verdict -->

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

No code changes. The demand row of [[spec/design_output/model#one-wave-settles-a-change]] names the unwatched path as design: a name stands unwatched with no subscriber, view or watched reader. Deleting it cuts a designed feature, and building the public road is a feature past this group's list. Its cost on a wave is one lock a provider.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/q/scheduler.go Scheduler.settle, through watched and hold
- src/q/why.go Store.Why, through the pending hook

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- none, since no code changes

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- spec/tickets/unwatched-providers-meet-a-caller.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened watched, hold, pendingAt, the pending hook in why.go and the demand row of the model note
- the callers list names the wave and Why, the two readers of the path
- the done_when line allows a close naming why the code stays, and the decide leaf names it
- the approach adds no config key

# decide

<!-- records why the unwatched path stays, and closes the ticket on that reason -->

## reason

<!-- why the code stays, and where the work it waits on stands -->

<!-- the form is text -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

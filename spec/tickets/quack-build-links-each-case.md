---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    tags: ["code", "testing"]
    needs: ["branch test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: tests
        form: command
        expects: green
        says: the tests that cover the change, or the check where it touches no code
      - name: check
        form: command
        expects: 0
        says: the check is green on the commit
      - name: says
        form: text
        says: what changes and why, for a reader who was not there
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: tests-meet-the-doors-once
step: do
record:
  - step: do
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: bf5d0a1069f33ac32cd9dcd6c38f09afb4cc874f
    hash_after: bf5d0a1069f33ac32cd9dcd6c38f09afb4cc874f
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "  113.4  in all"
    inputs:
      - name: ask
        hash: c81e984569f81f3d
        size: 462
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The quack cases run beside each other on one build of the binary, and each exec of it starts.

<!-- breaks, as text: what breaks if it is never done -->
Each case copies the shared build with a write handle, and a fork another case makes inherits that handle for an instant. Exec of the copy then answers text file busy, and two cases turn red under a loaded check.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `built` in `src/quack/manager_test.go` links the shared build into each folder, and opens no write handle
- `./RUNME.sh check` stands green

<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
none

<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->
none

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/manager_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Each quack case copied the shared build through a write handle. A fork from a parallel case inherited that handle for an instant, and exec of the copy answered text file busy under a loaded check. built in src/quack/manager_test.go now links the shared build into each folder, so no write handle stands open. The change landed at ea5f38b39.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: built links the build with os.Link and opens no write handle
the cleanup the change reveals is in the change: the copy goes
the build path stands once, in quackBinary, and each case links to it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

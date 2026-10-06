---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-index-outlives-the-check/gate
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
point: gate
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: level-zero-smoke
parent: the-index-outlives-the-check
record:
  - step: do
    hand: box a694567529c5 · claude-code-remote
    hash_before: c85c93a96989388093d16ba09ee2bb2ef3593a5e
    hash_after: bf8d8b290a67e7e87cd5c37b6893ee7431d877e4
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes; green, src/quack passes
      - name: check
        exit: 0
        said: "   92.3  in all"
    inputs:
      - name: ask
        hash: cbdf1802dd8c454b
        size: 457
    def: 991a202a44e4218c
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

ending_windows.go ends a child with taskkill /T /F, which walks the parent-child tree by parent pid; a new process group with no console leaves the door in that tree while the quack verb that spawned it still runs, so on Windows the check's kill still ends the door. The Windows half wants a road that breaks the parent link, such as a short-lived starter that spawns the door and exits, and a windows-tagged case, since both red tests stand under !windows.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/index/detach_test.go src/quack/ending_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A door now stands apart from whatever starts it. On unix Detached gives it a session of its own, so the group kill the check sends its child leaves the door standing. On Windows Detached hands back a starter: cmd start /b launches the door and exits, so the door parent has ended and taskkill /T over the check child walks past the door. spawns in src/index/door.go runs every door through Detached. A Windows case starts a door through a caller, kills the caller tree, and reads the door exit code as still running. That case runs on the windows-latest runner, since no box here runs Windows. Here it vets and compiles under GOOS=windows.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: a starter that exits breaks the parent link, and a windows-tagged case proves it
the cleanup: the os import names why it reads the shell variable
the role variable and the still-running code stand once, in the Windows case

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The Windows case covering the starter runs on the `windows-latest` runner of the check:

    grep -n TestADoorOutlivesATreeKillOverWhatStartedIt src/index/detach_windows_test.go

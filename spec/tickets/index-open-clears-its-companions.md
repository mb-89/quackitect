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
group: checks-and-index-read-right
step: do
record:
  - step: do
    hand: box f689bbb375f6 · claude-code-remote
    hash_before: d5c9306e951d19b07a70cd3dac2f1908c6260d03
    hash_after: f3009466f33f79186383ad298eba0d51216f6d3b
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes
      - name: check
        exit: 0
        said: "   68.9  in all"
    inputs:
      - name: ask
        hash: 76ff7650b454a773
        size: 444
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: a rebuilt index starts from a clean set of files, and a corrupt file rebuilds in place of failing every start.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `Open` in `src/index/index.go` removes the database and leaves its `-wal` and `-shm` beside the new file, and a file that is no database fails every start until a hand deletes it.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/index/ -run 'TestOpenClearsTheWalAndShm|TestOpenRebuildsACorruptFile'` passes
- `./RUNME.sh check` answers 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/index

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`Open` in `src/index/index.go` rebuilds any file the shape cannot take, so a file that is no database rebuilds where it failed every start. The rebuild removes the `-wal` and `-shm` beside the file. `TestOpenRebuildsACorruptFile` failed red and passes now. `TestOpenClearsTheWalAndShm` pins that a rebuild under an open old handle replays no row, though the replay did not reproduce on this sqlite build, so the case passed on the old code too. The wait on the old door exit stays out, since nothing here reproduced the harm it guards.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the fix sketch for the companions and the corrupt file
- the wait on the old door is left out, and the says field gives the reason
- the rebuild path stands in `Open` alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

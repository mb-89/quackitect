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
    hash_before: bba869d34b0bb6935b04dc90a6aaff7f09c663d4
    hash_after: 87aed8acabb6299d4027809c1943a9663457d7b3
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes
      - name: check
        exit: 0
        said: "   59.9  in all"
    inputs:
      - name: ask
        hash: e3c40eb4d15daf4c
        size: 350
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: a glob holding a letter past ASCII matches its path, and a bracket opening on `!` negates.

<!-- breaks, as text: what breaks if it is never done -->
breaks: the translation in `src/index/glob.go` writes each byte as a rune of its own, so `**/café.md` matches nothing, and `[!x]` matches the `!`.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/index/ -run TestAGlobReadsWholeRunes` passes
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

The glob translation in `src/index/glob.go` quotes a whole UTF-8 character at a time, so `**/café.md` matches its path. A bracket class opening on `!` turns into `^`, so `[!x]` matches any character but `x`. `TestAGlobReadsWholeRunes` failed red on both and passes now.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the fix sketch
- the class rule and the character rule each stand in `globOf` alone
- a case of mine wrongly wanted `[!x]` to refuse `!`, and it goes

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

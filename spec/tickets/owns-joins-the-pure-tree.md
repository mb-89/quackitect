---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: a-guard-reads-door-declarations/gate
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: doors-declare-what-they-own
parent: a-guard-reads-door-declarations
record:
  - step: do
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: 5fb0ce0d2050244da90ae27a12336c02882a645f
    hash_after: a1cf0178e041425c75d6663b082c77eeda625f1d
    answered:
      - name: tests
        exit: 0
        said: green, src/imports passes
      - name: check
        exit: 0
        said: "   90.5  in all"
    inputs:
      - name: ask
        hash: 689f8887ac4174d5
        size: 173
    def: ce98b9e976552e83
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

src/modules/check importing quackitect/src/owns falls to onlyq unless pureTree in src/imports/imports.go names src/owns, and the draft's callers list misses pastQ's pureTree

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/imports

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`pureTree` in `src/imports/imports.go` names `src/owns` since 8de84c5c4, so `src/modules/check` imports the declaration reader and passes `onlyq`. `TestAModuleImportsTheDeclarationReader` pins that, as the other readers stand pinned, and goes red with `src/owns` out of `pureTree`. The guard ticket's Discussion adds `pureTree` to its draft's callers.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: `src/owns` stands in `pureTree`, a test pins it, and the callers list takes `pureTree`
the cleanup: none further; `TestEveryPureReaderImportsThePureLibraryAlone` already holds `src/owns` to the pure library
one place: `pureTree` stands once, and the test reads the analyzer

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

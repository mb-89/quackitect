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
    hand: box 86086f797ef7 · claude-code-remote
    hash_before: be85a4940d9ee23819b7cb42875db13443b59cff
    hash_after: 8de84c5c4d70c5f60ac2964d96c35d6c16308b06
    returns: 1
    why: The change stands in 8de84c5c4, and its tests need src/owns live. The owns draft lands under the parent's implement leaf, whose ticket names src/owns/owns_test.go. Pass this leaf after that.
    answered:
      - name: tests
        exit: 1
        said: FAIL
      - name: check
        exit: 1
        said: "    2.4  test/contract/vale.test.js a shouted lead is refused and an acronym inside a sentence passes"
  - step: do
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: 09ecaebbe6b7db1a1a324a5f7b95c273bb2ba769
    hash_after: b7d3d23bc22616dad2ff82bcb26445f45d0a1d0e
    answered:
      - name: tests
        exit: 0
        said: green, src/imports passes; green, src/owns passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: ask
        hash: d807f67a4d8a5703
        size: 369
    def: ce98b9e976552e83
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

ioonly's outside and onlyq's impure must derive from owns.Whole, never owns.Packages, since clock owns time and context by member and two dozen core and module files import them for time.Duration; impure's non-door floor (io/fs, syscall, unsafe, plugin, runtime/cgo, database/sql, log/syslog, io/ioutil) stays refused or a declaration names it, so nothing falls through

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/imports src/owns

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The module rule and the core rule in `src/imports` read the packages a door owns whole, through `Owned` and `owns.Whole`, since 8de84c5c4. A door owning `time` by member, as the clock does, leaves `time.Duration` free to the core and the modules. The floor list in `src/imports/imports.go` keeps the impure standard library refused where no declaration names it. b7d3d23bc adds three analyzer tests: the core and a module importing a package owned by member pass, and a module importing `syscall` with no declaration is named. The two member tests go red with `Owned` pointed at `owns.Packages`, and green on `owns.Whole`.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: both rules derive from `owns.Whole`, and the floor holds every package the ask lists
the cleanup: none revealed; the warnings the check prints stand in files this leaf leaves alone
one place: the floor stands once in `src/imports/imports.go`, and the tests point at the analyzers, not a copy of the list

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

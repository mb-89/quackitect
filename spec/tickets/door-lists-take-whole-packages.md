---
kind: [[ticket]]
state: open
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

go test ./src/imports -run 'TestTheCoresListComesOffTheDeclarations|TestAModulesListComesOffTheDeclarations|TestAModuleImportingOsIsNamed|TestFaultsNameAModuleImportingOs|TestAnIOModuleImportingOsPassesOnlyQ|TestTheCoreImportingOsIsNamed|TestARendererReachingOutBesideItsDoorIsNamed|TestEveryPureReaderImportsThePureLibraryAlone|TestTheTreeHoldsTheImportRules'

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

ioonly and onlyq read the packages a door owns whole off the owns.yaml declarations under the module root, through owns.Whole, read once a root. ioonly refuses an owned package, matched exactly. onlyq refuses an owned package, or a floor package no door owns (io/fs, io/ioutil, database/sql, syscall, unsafe, plugin, log/syslog, runtime/cgo), matched by prefix. A door owning a member, as the clock owns time.Sleep, leaves the package open, so time.Duration imports pass. Faults and FaultsIn take the owned list, and the fixtures declare os. Commit 8de84c5c4 lands against the owns stub, so the mailed cases go green once the parent's implement leaf lands src/owns. The check stands red on the group's planned red tests and the level0 clear probe, and the push waits on that green.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: both lists derive from owns.Whole, and the floor stays refused under onlyq. ioonly keeps no floor, since src/tui/log/read.go imports io/fs as a renderer
the cleanup the change reveals: size.golden.json takes the new line count of model.md. The owns draft waits for the parent's implement leaf
every fact stands in one place: the rows of model.md point at the declarations and the doors note, and the floor stands once, in imports.go

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

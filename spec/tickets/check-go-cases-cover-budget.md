---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: check-verbs-port-to-go/gate
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
group: check-verbs-run-in-go
parent: check-verbs-port-to-go
record:
  - step: do
    hand: box 233780cb27f2 · claude-code-remote
    hash_before: 5a2d1e69377605cb9f50acb9cbda6de13030267d
    hash_after: 4fc9823b878794a9602642b76513225bb73ef9ac
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes; green, src/modules/tickets passes
      - name: check
        exit: 0
        said: "   63.9  in all"
    inputs:
      - name: ask
        hash: e3b3434205cb1085
        size: 514
    def: 758db3e91dbc96cf
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the first done_when line asks a Go case for every road the JavaScript tests cover, and no red Go case reads battery.budget off the config (check-verb.test.js budgetOf), the warn line the log takes past the budget, the CGO_ENABLED=0 environment goGate runs under (goEnvOf), the port off the vehicle pointer (portHere), the level0 red line the check shouts, or the test verb with words handing its names to branch test under a fresh tally (cli-verbs.test.js namedTests); add a case for each before tests-green closes

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/check_test.go src/modules/tickets/red_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

src/quack/check_test.go gains a case for each road the gate names. TestCheckVerb reads the budget off the config and the warn row the log takes past it, the stamp off a whole run, the quiet rows under --errors, and the warnings the lint leaves. TestCheckReads covers the environment with no C compiler that the Go gate runs under, the port off the vehicle pointer, and the line level zero says when it goes red. TestTestVerb hands named files to branch test under a fresh tally, and runs the test part where no word names one. red_test.go reads a text with no front as naming no red file.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: each road it names meets a Go case
- the cleanup it reveals rides in it: one runtime folder names its owner, so PrivateFolderOwned holds
- each fact stands once: the paths build off runtimeDir, and the keys stand as named constants

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

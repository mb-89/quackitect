---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: quack-spawns-all-take-the-runner/gate
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
group: unfaked-doors-take-fakes
parent: quack-spawns-all-take-the-runner
record:
  - step: do
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: af4e81f782bd5576bcadab5cecb921a58a8abff9
    hash_after: af4e81f782bd5576bcadab5cecb921a58a8abff9
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   94.2  in all"
    inputs:
      - name: ask
        hash: 43b082fb19792e03
        size: 298
    def: 10d1e4d8ece57c93
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the tests-red stubs `toolRunsOver(proc.Runner, io.Reader)` and `tuiLaunchOver(proc.Runner, io.Reader)` take an input reader, and the approach names `toolRunsOver(run)` with `Streams{In: os.Stdin}`. The builder settles one shape and keeps the two cases in src/quack/spawns_runner_test.go driving it.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/voice_verb_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

toolRunsOver and tuiLaunchOver keep the reader argument the tests-red stubs take, in place of the draft line naming Streams{In: os.Stdin} inside them. A case hands its input in that way, and the binding in verb_fix.go init and tuiReal passes os.Stdin. The Over forms set Streams.In to the reader they take. The implement step of quack-spawns-all-take-the-runner builds that shape, and the two cases in spawns_runner_test.go drive it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change settles the one shape the ask asks for, and touches no file
- no cleanup shows
- the shape stands once, in the Over signatures

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

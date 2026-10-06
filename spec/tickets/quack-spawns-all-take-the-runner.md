---
kind: [[ticket]]
state: closed
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
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it"]
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
      - name: tests-red
        does: writes the tests the ask calls for
        tags: ["code", "testing"]
        needs: ["branch test"]
        input: draft
        checklist: ["every done_when line meets a test that fails, or a checkpoint the hand answers where no command decides", "every door the tests reach has a fake"]
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: red
            form: list
            says: every test file standing red until tests-green closes, one a line, which the check leaves out
          - name: seen
            form: text
            says: what you see, and what surprises you
  - name: gate
    gate: does the approach answer the ask, and does a red test decide every done_when line
    does: reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points
    not: design/draft
    tags: ["review"]
    input: ["design/draft", "design/tests-red"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: implement
    tags: ["code", "testing"]
    needs: ["branch test"]
    input: ["design/draft", "gate"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    steps:
      - name: change
        does: makes the change
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: design/tests-red
        to: retro
        evidence:
          - name: tests
            form: command
            expects: green
            says: the same tests pass
          - name: check
            form: command
            expects: 0
            says: the check is green on the commit
          - name: says
            form: text
            says: what changes and why, for a reader who was not there
  - name: accept
    gate: does the whole work answer the ask, and does every command of the route pass
    final: true
    when: backlog
    does: reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points
    not: implement/change
    tags: ["review", "accept"]
    input: ["ask", "implement"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: view
    does: reads the change in the view the ask names
    by: person
    when: view
    on_fail: implement
    to: retro
    input: ["ask", "implement/tests-green"]
    evidence:
      - name: seen
        form: verdict
        says: pass where the view shows the ask's number, or fail with what it shows
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: unfaked-doors-take-fakes
parent: quack-spawns-meet-fake-process
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 3eb63c1c412889c10a4cd30ec30c8376cab301b3
    hash_after: 3eb63c1c412889c10a4cd30ec30c8376cab301b3
    inputs:
      - name: ask
        hash: f8a2aeaa9f01731c
        size: 860
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 72ea7aacdd39c404cab0836028b13fc1ea315124
    hash_after: 72ea7aacdd39c404cab0836028b13fc1ea315124
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: ae92722ea762d1ae
        size: 5304
    def: 08e16d07b0de477c
  - step: gate
    hand: box e97c7a20bbd2 · claude-code-remote · helper-4
    hash_before: 4dd19bed531604110764f2e441a355d82b9eabc8
    hash_after: 4dd19bed531604110764f2e441a355d82b9eabc8
    inputs:
      - name: design/draft
        hash: ae92722ea762d1ae
        size: 5304
      - name: design/tests-red
        hash: 15db91747755d405
        size: 842
    def: dc4904ab364efa10
  - step: implement/change
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 7374946aa91a11945b59ed1c14810e793aaee89f
    hash_after: 896637b3c17d161b2bd62df79376fd7a53b07c8c
    answered:
      - name: lint
        exit: 0
        said: "test/level0/work-stands.test.js:16:1: correctness/noUnusedImports: Several of these imports are unused."
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: c18cc43dd43f8e57dad45ac5bb96b5815e71efa0
    hash_after: c18cc43dd43f8e57dad45ac5bb96b5815e71efa0
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   99.5  in all"
    inputs:
      - name: design/tests-red
        hash: 15db91747755d405
        size: 842
    def: ec253787263043a7
  - step: accept
    skipped: true
    why: the delivery's acceptance reads this ticket
  - step: view
    skipped: true
    why: the ask names no view the owner reads
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
Every spawn in the quack verbs goes through the process door, so a case reaching one runs on `FakeRunner` and the real-wait guard needs to see no direct call.

<!-- breaks, as text: what breaks if it is never done -->
`toolRuns`, `takesBranch`, `retroMintRunme`, `roadVerb`, `heardIn`, `reviewOver`, `serveRuns` and `tuiLaunch` spawn through `exec.Command` in place, so a later case reaching one spawns a real process, and the guard in `src/imports/clock.go` sees a direct call in a test alone.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- each spawn named above takes a `proc.Runner`, and its init binds `proc.Real`, which a grep for `exec.Command` under `src/quack` outside `_test.go` decides
- `tuiLaunch` and `toolRuns`, which hand the terminal's input straight through, take a shape the draft argues, and a case on `FakeRunner` drives each
- the header of `src/quack/spawndoors.go` names no follow-up as owner
- `./RUNME.sh check` stands green

<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
none

<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->
none

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

Each of the eight spawns keeps its name and signature as a thin binding over `proc.Real`, and its body moves to an `Over` form taking a `proc.Runner`, as `nodeAccept` and `nodeAcceptOver` stand in `src/quack/twins.go`. A case hands the `Over` form a `FakeRunner`.

The door gains two things, each with a contract case run on both runners.

1. `Streams` on `proc.Command`: an `In` reader and `Out` and `Err` writers. Where a command carries them, the real runner wires them to the run in place of its buffers, and answers `Out` and `Err` empty. The fake reads `In` into the command's `Stdin` before the program runs, writes the program's `Out` and `Err` to the writers after, and answers them empty. So `tuiLaunch`, `toolRuns` and `takesBranch` hand the terminal and the caller's streams straight through, and a case reads what the fake wrote.
2. `Signalled` beside `NotStarted`: the real runner answers it where a signal ends the run, in place of the `-1` that `exec` reports and `NotStarted` shares. `serveRuns` and `tuiLaunch` read it as exit 1, as their comments say the JavaScript door does, and read `NotStarted` as the fault they answer today.

Each spawn over the door:
- `toolRuns` becomes `toolRunsOver(run)`, a `fixRunner`: `Streams{In: os.Stdin, Out: out, Err: errs}`, and `NotStarted` prints the fault and answers `exitFailed`
- `roadVerb(root)` stands as `roadVerbOver(proc.Real, os.Executable, root)`: both writers name one buffer, so the two streams stay one text as `CombinedOutput` keeps them
- `takesBranch` takes the runner and the binary from `pullHere`: `Streams{Out: it.Out, Err: it.Err}`
- `retroMintRunme` becomes `retroMintRunmeOver(run)`: `Env` carries the map's pairs in sorted order, and `NotStarted` appends the fault to `errs` and answers `exitFailed`
- `heardIn` stands as `heardInOver(proc.Real, ...)`: `Stdin` the text, `Wait` `valeSpan`. `unreadWhy` reads `Said.Err` and `Said.Code` in place of an `exec.ExitError`
- `reviewOver(method)` stands as `reviewRunOver(proc.Real, method)`: `Env` the two pairs, `Wait` `reviewGathering`
- `serveRuns` becomes `serveRunsOver(run)`, and `tuiLaunch` becomes `tuiLaunchOver(run)` with `Streams{In: os.Stdin, Out: out, Err: errs}`. `serveReal` and `tuiReal` bind `proc.Real`

The header of `src/quack/spawndoors.go` points at the process door section of `spec/design_output/doors.md`, and that section names the quack spawns as moved.

The git reads in `command.go`, `vehicle_verb.go`, `retro_chapters.go`, `verb_lint.go` and `retro_collect.go` belong to the git door. `boxdoors.go` and `checkdoors.go` are the box and check doors the table names. So done_when 1 reads the eight functions, not every `exec.Command` in the folder, and a private note carries the git reads to the retro.

I refuse to buffer the streams through `Said`. A viewer run buffered shows nothing until it ends, which breaks the viewer. The cost of `Streams`: the door holds two shapes of output, and a caller choosing streams reads no `Out`.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/verb_fix.go init
- src/quack/verb_fix_test.go TestTheCalmCalmsTheShoutRealValeNames
- src/quack/commit.go landingHere
- src/quack/ticket_doors.go pullHere
- src/quack/ticket_doors.go pullVoice
- src/quack/command.go heardOver
- src/quack/retro_mint.go init
- src/quack/retro_new.go init
- src/quack/main.go listensHooks
- src/quack/serve_verb.go serveReal
- src/quack/tui_verb.go tuiReal
- src/pull/door.go ShellOver, which reads Signalled past NotStarted
- src/proc/proc.go runUnder
- src/proc/proc.go FakeRunner.Run

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/proc/proc_contract_test.go TestARunWithStreamsHandsThemItsInputAndOutput
- src/proc/proc_contract_test.go TestARunASignalEndsAnswersSignalled
- src/quack/spawns_runner_test.go TestToolRunsHandsTheStreamsThrough
- src/quack/spawns_runner_test.go TestARoadVerbAnswersItsStreamsAsOneText
- src/quack/spawns_runner_test.go TestTheBranchTakeRunsTheRoadOnTheCallersStreams
- src/quack/spawns_runner_test.go TestARetroMintRunReadsRunmeUnderTheRootAndItsEnv
- src/quack/spawns_runner_test.go TestValeHeardOverTheDoorReadsTheTextAsTheFile
- src/quack/spawns_runner_test.go TestAReviewGathersOffTheBranchVerbUnderTheWorkRoot
- src/quack/spawns_runner_test.go TestServeRunsReadsASignalAsOne
- src/quack/spawns_runner_test.go TestTheViewerLaunchHandsTheTerminalThrough
- done_when 1: a grep for exec.Command in the eight functions, which the gate reads, and the spawns_runner_test.go cases
- done_when 2: TestToolRunsHandsTheStreamsThrough and TestTheViewerLaunchHandsTheTerminalThrough
- done_when 3: the header of src/quack/spawndoors.go, which the gate reads
- done_when 4: ./RUNME.sh check

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/proc/proc.go
- src/proc/proc_contract_test.go
- src/quack/verb_fix.go
- src/quack/spawndoors.go
- src/quack/ticket_doors.go
- src/quack/retro_mint.go
- src/quack/command.go
- src/quack/review.go
- src/quack/serve_verb.go
- src/quack/tui_verb.go
- src/quack/spawns_runner_test.go
- spec/design_output/doors.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- Opened all eight functions, their callers by grep, proc.go and its contract suite, and ShellOver, the one reader of NotStarted past the voice verb
- The callers list names each binding site and each reader of the door's codes
- Each done_when line names its test or the read the gate makes

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/spawns_runner_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/proc/proc_contract_test.go
- src/quack/spawns_runner_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Ten new cases fail on their own assertions. The two contract cases fail on both runners, since no runner reads Streams yet and the real one answers a signal as NotStarted. The eight quack cases meet stubs that spawn nothing, so each fails on what the fake should have met. The surprise: reviewOver reached os.Executable through selfRoad, so a stub spawning in place would have run the test binary itself, and the Over form takes the binary as an argument.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- done_when 1 and 2 meet the eight cases in spawns_runner_test.go, and done_when 3 and the grep fall to the gate read
- the one door the tests reach is the process door, and FakeRunner stands beside the real runner

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- signalled-meets-notstarted-readers: `Signalled` moves a run a signal ends off `NotStarted`, so `voiceRunsValeOver` in src/quack/voice_verb.go and `ShellOver` in src/pull/door.go answer code -2 with no fault where they answered the fault before. Neither file stands in size, and voice_verb.go stands in no callers line. The builder decides each reader at its spot.
- spawn-stubs-match-the-draft: the tests-red stubs `toolRunsOver(proc.Runner, io.Reader)` and `tuiLaunchOver(proc.Runner, io.Reader)` take an input reader, and the approach names `toolRunsOver(run)` with `Streams{In: os.Stdin}`. The builder settles one shape and keeps the two cases in src/quack/spawns_runner_test.go driving it.
- quack-git-reads-take-door: done_when 1 names a grep for `exec.Command` under src/quack, and that grep still finds the git reads in command.go, vehicle_verb.go, retro_chapters.go, verb_lint.go and retro_collect.go, and the spawns in checkdoors.go and boxdoors.go. The draft narrows the line to the eight functions and parks the rest as a private note. Mint the git reads as a follow-up in the group, so the grep comes clean.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the draft size list, with branch.go for selfRoadOver, vale_why_test.go for the unreadWhy cases, and the contract row the commit door asked for
- the one door the change reaches is the process door, and FakeRunner holds Streams and Signalled as the contract suite proves
- each Over form points at this ticket, and the process door section of the doors chapter names the approach
- Streams and Signalled stand once, in proc.go, and the doors chapter points at them

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/spawns_runner_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The eight quack spawns past the node module and Vale ran exec in place: toolRuns, roadVerb, takesBranch, retroMintRunme, heardIn, reviewOver, serveRuns and tuiLaunch. Each now runs through the process door. Its old name stays as a binding over proc.Real, beside an Over form a case hands a FakeRunner, so the cases in spawns_runner_test.go spawn nothing. The door gains Streams, which hand a run the caller input and output in place of the buffers, so the viewer and the fix tools keep the terminal. It also gains Signalled, which parts a run a signal ends from one that never starts, so serve and the viewer read a signal as exit 1. unreadWhy reads the door answer in place of an exec error. Under src/quack, exec.Command now stands in the box and check doors alone.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the draft size list, branch.go and vale_why_test.go
- the process door has FakeRunner, and its contract suite holds the streams and the signal on both runners
- each Over form points at this ticket, and the process door section names the approach
- Streams and Signalled stand once, in proc.go

# accept

<!-- reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->

<!-- the form is verdict -->

# view

<!-- reads the change in the view the ask names -->

## seen

<!-- pass where the view shows the ask's number, or fail with what it shows -->

<!-- the form is verdict -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

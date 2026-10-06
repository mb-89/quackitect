---
kind: [[ticket]]
state: open
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
depends_on: git-and-process-doors-designed
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: a02393caec8b931ea22d5222262e2fd6a691b620
    hash_after: a02393caec8b931ea22d5222262e2fd6a691b620
    inputs:
      - name: ask
        hash: cb034706036a0d50
        size: 568
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 10de6c7dd169691a67635a18070435d81e1682c4
    hash_after: 10de6c7dd169691a67635a18070435d81e1682c4
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 7f13a4b6bdd9ca88
        size: 6809
    def: 08e16d07b0de477c
  - step: gate
    hand: box e97c7a20bbd2 · claude-code-remote · helper-4
    hash_before: 2beb0f59e569e3ff53d63252c993e07b5ecb176c
    hash_after: 2beb0f59e569e3ff53d63252c993e07b5ecb176c
    inputs:
      - name: design/draft
        hash: 7f13a4b6bdd9ca88
        size: 6809
      - name: design/tests-red
        hash: 2dbc33b2321c853d
        size: 942
    def: dc4904ab364efa10
  - step: implement/change
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 4fa441365ff6314dbaf96110386a12bc309e2aaf
    hash_after: 35c71ba2cfd395bb23868b72853e558ae69079b6
    answered:
      - name: lint
        exit: 0
        said: "test/level0/work-stands.test.js:16:1: correctness/noUnusedImports: Several of these imports are unused."
    def: f150b8c0dc20fe45
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The quack verbs test in memory, beside every other case, and a slow box slows the process door test alone.

<!-- breaks, as text: what breaks if it is never done -->
Each quack verb case reaching `exec.Command` or `os.Args[0]` spawns a real process, so a loaded box turns the cases red, and each case costs the battery real seconds.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- the cases in `src/quack/*_test.go` reaching `exec.Command` or `os.Args[0]` outside the door tests the family table names run on the process door fake
- the quack verbs row of the family table in `spec/design_output/doors.md` names them as moved
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

Of the six files the family row names, two spawn a process. `main_test.go` runs `go list -deps`, and `split_test.go` re-runs the test binary through `ioProcesses`. The other four sleep on the wall clock and spawn nothing. So the row splits by what each file waits on, and the process door's fake takes the spawns a quack case reaches.

The quack cases reaching a spawn through a verb sit outside the row, because the guard in `src/imports/clock.go` sees a direct call alone. They are `TestVerbRegistry` and `TestAPersonRunCarriesNoHarness` through `nodeAccept`, and `TestVoiceRunsValeKeepsTheOutputOfAFailedExit` through `voiceRunsVale`.

`nodeAccept(root)` stays as `nodeAcceptOver(proc.Real, os.Executable, root)`, and the package var `selfPath` goes. `nodeAcceptOver(run proc.Runner, self func() (string, error), root string)` builds one `proc.Command`: argv `self verb <root>/src/scripts <words>`, `Dir` the root, and for a person's call `Env` naming `SE_WORK_ROOT`. A nonzero `Code` answers an error carrying `Out` and `Err`, and `NotStarted` answers one too.

`personEnv` takes harness variables out of the box's env, and `Command.Env` only adds pairs past the box's own. So `proc.Command` gains `Drop []string`. `Real` removes those names from `cmd.Environ()` before it appends `Env`. `FakeRunner.Run` strips them from `Env` before the program reads it. A person's call drops the `harness` names, as `HARNESS` in `src/extension/lib/lens.js` deletes them.

`voiceRunsVale` becomes `voiceRunsValeOver(run proc.Runner)`, and the `init` in `voice_verb.go` registers `voiceRunsValeOver(proc.Real)`. A nonzero `Code` still answers `Out`, and `NotStarted` answers an error.

Each rewritten case teaches a `FakeRunner` the program its command names. The person's case asserts the command the child road takes: its argv, its folder, the harness names in `Drop`, and `SE_WORK_ROOT` in `Env`. The contract case proves `Drop` on the real runner, so the quack case needs no shell script standing in for quack.

`TestTheIndexImportsNoModule` leaves `main_test.go` for `src/imports/tree_test.go` as `TestTheIndexReachesNoModuleNorTheTickets`. It walks the in-module imports of `quackitect/src/index` over the `packages.Load` result that `TestTheTreeHoldsTheImportRules` already takes. One load serves both tests. A package outside the module imports nothing inside it, so the walk stays inside the module.

I refuse to teach the fake `go` the answer to `go list`. A fake answering a planted list proves nothing about the tree. The cost: the claim moves to a package the ask leaves unnamed.

The sleepers go to the family each one belongs to:
- `split_test.go` joins the placements over real processes, because its spawn goes through `index.Placed` and its cases kill a pid, which no `Runner` holds. Its `git init` stays, because the io process's git module reads that repository.
- `dump_test.go`, `cli_test.go` and the served-index cases of `main_test.go` serve the index over a real listener, so they join the index door's row.
- `check_test.go` loses its sleep. The beside part closes a channel once it starts, and the `go` part waits on that channel, not on a spin.
- `waits_test.go` polls `served.Of` on the wall clock. It takes a row of its own, under a follow-up ticket minted in the group.

The row then names `registry_test.go`, `person_run_test.go` and `voice_verb_test.go` as moved onto the process door's fake.

The doors.md line asking every `exec.Command` in the quack verbs to take the `Runner` narrows. It names the spawns a quack case reaches as moved, and every other spawn waits under a second follow-up ticket: `toolRuns`, `takesBranch`, `retroMintRunme`, `roadVerb`, `heardIn`, `reviewOver`, `serveRuns` and `tuiLaunch`. No quack case reaches those spawns, so converting them now changes files the ask leaves out, and no red test comes first. The cost: a later case reaching one of them spawns, and the guard sees nothing. `tuiLaunch` and `toolRuns` pass the terminal's input straight through, which a `Said` buffer cannot carry, so the follow-up decides their shape.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/accepts.go accepts
- src/quack/twins.go nodeAccept
- src/quack/no_program_test.go TestTheNodeModuleRefusesAWordNothingRegisters
- src/quack/registry_test.go TestVerbRegistry
- src/quack/person_run_test.go TestAPersonRunCarriesNoHarness
- src/quack/voice_verb.go init
- src/quack/voice_verb_test.go TestVoiceRunsValeKeepsTheOutputOfAFailedExit
- src/proc/proc.go Real
- src/proc/proc.go FakeRunner.Run
- src/modules/git/repo.go NewRepo
- src/pull/door.go ShellOver
- src/modules/lsp/tools_test.go throughTheDoor
- src/imports/tree_test.go TestTheTreeHoldsTheImportRules
- src/imports/clock_test.go TestEveryTestWaitingOnTheBoxStandsInTheDoorAudit

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/proc/proc_contract_test.go TestARunDropsTheVariablesItNames
- src/quack/person_run_test.go TestAPersonRunDropsTheHarnessAndNamesItsRoot
- src/quack/registry_test.go TestVerbRegistry/a_person's_call_to_a_registered_verb_runs_the_road_in_a_child,_under_the_person's_environment
- src/quack/registry_test.go TestVerbRegistry/a_person's_call_whose_road_never_starts_answers_its_fault
- src/quack/voice_verb_test.go TestVoiceRunsValeKeepsTheOutputOfAFailedExit
- src/quack/voice_verb_test.go TestVoiceRunsValeAnswersTheFaultOfAValeThatNeverStarts
- src/imports/tree_test.go TestTheIndexReachesNoModuleNorTheTickets
- src/quack/check_test.go TestBatteryRun
- done_when 1, direct spawns: src/imports/clock_test.go TestEveryTestWaitingOnTheBoxStandsInTheDoorAudit
- done_when 1, spawns through a verb: the quack tests above on FakeRunner, since the guard sees a direct call alone
- done_when 2: src/imports/clock_test.go TestEveryTestWaitingOnTheBoxStandsInTheDoorAudit decides each re-filed file. No command reads the word moved, so the gate reads it
- done_when 3: ./RUNME.sh check

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/proc/proc.go
- src/proc/proc_contract_test.go
- src/quack/twins.go
- src/quack/voice_verb.go
- src/quack/voice_verb_test.go
- src/quack/person_run_test.go
- src/quack/registry_test.go
- src/quack/main_test.go
- src/quack/check_test.go
- src/imports/tree_test.go
- spec/design_output/doors.md
- spec/tickets/<follow-up for waits_test.go, minted in the group>.md
- spec/tickets/<follow-up for the quack spawns no case reaches, minted in the group>.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- Opened proc.go and its contract suite, doors.md, clock.go and its test, tree_test.go, imports.go, the six family files, and twins.go, voice_verb.go and their tests. Each spawn function was traced to its callers by grep
- Callers list the users of nodeAccept, selfPath, voiceRunsVale and proc.Command, and the tests sharing the packages load
- Each done_when line names its test above, and done_when 2's word moved falls to the gate's read

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/registry_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/proc/proc_contract_test.go
- src/quack/person_run_test.go
- src/quack/registry_test.go
- src/quack/voice_verb_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Six new cases fail on their own assertions. The process contract case for Drop fails on the real runner, which still reads the box variable. The quack cases run the person call and the Vale run on a FakeRunner taught paths no box holds, so the stubs spawn nothing real. The draft gave Drop two meanings, so the contract case pins the real one: a pair in Env stands after the drop, and the fake must not strip it.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

done_when one meets the person-run, registry and voice cases now, and the moved index import case at implement; done_when two meets TestEveryTestWaitingOnTheBoxStandsInTheDoorAudit; done_when three is the check
the one door the tests reach is the process door, and FakeRunner stands beside the real runner

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass
- the approach answers the ask: nodeAcceptOver and voiceRunsValeOver over proc.Runner, Command.Drop, and the family row re-filed by what each file waits on. The red cases fail on their own assertions, as the run shows
- spawndoors.go: quack-repos-meet-fake-git moved roadVerb, claudeAt and takesBranch there and links this ticket as their owner. No quack case reaches the three, so they join the follow-up for spawns no case reaches, which already names roadVerb and takesBranch. Implement repoints the spawndoors.go header at that follow-up and adds the file to size. claudeAt calls exec.LookPath and spawns nothing
- Drop: tests-red pins one meaning, where Drop strips the box's variables and a pair in Env stands past the drop. Implement follows tests-red, and leaves out the draft's line on FakeRunner stripping Env. The fake already passes the Drop contract, and the real runner alone fails it
- tests: the person's case stands as the TestVerbRegistry subtest aPersonRunDropsTheHarnessAndNamesItsRoot, since the registry map is unguarded, and not as a top-level TestAPersonRunDropsTheHarnessAndNamesItsRoot. Implement deletes TestAPersonRunCarriesNoHarness and childSays, which still spawn a shell script
- the Halting, Command.Wait and fake halt landed by lsp-tools-take-the-runner leave this approach unchanged

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

- the change touches the draft's size list and the gate's spawndoors.go header, and src/proc/proc_contract_test.go closes the commit door's ask for a test beside proc.go
- the one door the change reaches is the process door, and FakeRunner stands beside proc.Real
- nodeAcceptOver and voiceRunsValeOver each point at this ticket, and the process door section of spec/design_output/doors.md names the approach
- the harness names stand once, in harness in src/quack/twins.go, and Command.Drop carries them, so personEnv leaves

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

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

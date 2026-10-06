---
kind: [[ticket]]
state: closed
step: implement/tests-green
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
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it", "every config key the approach adds names each default file it lands in"]
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
process_hash: c671f20a6ae2a4a6
group: retro-and-coordinator
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 2e87e70adc83 · claude-code-remote
    hash_before: eb99382434f10c05f844f1771bf896b50cf60668
    hash_after: eb99382434f10c05f844f1771bf896b50cf60668
    inputs:
      - name: ask
        hash: da7b88681a0c5ede
        size: 487
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box 2e87e70adc83 · claude-code-remote
    hash_before: 7f09a32007f9cb1df9a6924a8e449360c15cc373
    hash_after: 7f09a32007f9cb1df9a6924a8e449360c15cc373
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/hooks fails
    inputs:
      - name: design/draft
        hash: 78b69127c29d82cc
        size: 3117
    def: 08e16d07b0de477c
  - step: gate
    hand: box 2e87e70adc83 · claude-code-remote · helper-4
    hash_before: c7f7d85b92c16efc7ccc77e93586c913b6a87bcd
    hash_after: c7f7d85b92c16efc7ccc77e93586c913b6a87bcd
    inputs:
      - name: design/draft
        hash: 78b69127c29d82cc
        size: 3117
      - name: design/tests-red
        hash: 77f21a5dc041a8f5
        size: 921
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 2e87e70adc83 · claude-code-remote
    hash_before: 700be6a95e040207b6d9c3522c474cc425f0429d
    hash_after: 700be6a95e040207b6d9c3522c474cc425f0429d
    answered:
      - name: lint
        exit: 0
        said: "src/voice/voice_test.go:1:1: FileCeiling: A file holds 600 lines, and the file holds 618. Split it by topic."
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 2e87e70adc83 · claude-code-remote
    hash_before: dc205034cc7c66d94c6a4ce202ab3b2560eeef45
    hash_after: dc205034cc7c66d94c6a4ce202ab3b2560eeef45
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks passes; green, src/voice passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: design/tests-red
        hash: 77f21a5dc041a8f5
        size: 921
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

The coordinator opens in the repo folder, so its turns meet the answer gate and the stop door as every box's turns do.

The coordinator writes past the doors and answers past the ceiling, and nothing in the tree refuses it.

- `go test ./src/modules/hooks/` passes a case where the start road refuses a writing session that loads no level-zero plugin.
- `go test ./src/voice/` passes a case where `voice measure` exits 1 when an answer runs past the ceiling.
- `./RUNME.sh check` exits 0

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

The start road today is startsOnce in .claude/skills/level0/hooks/level0.js, inside the plugin. A session that loads no plugin never reaches it or the Go door. The one road such a session meets is the SessionStart command hook, src/scripts/boot.js, which runs for every session opened in the repo folder. A new pure function, StartRefusal in src/modules/hooks/start.go, takes the cwd, the root, the plugin standing (manifest present and CLAUDE_CODE_ENABLE_FUNCTION_HOOKS set), the cloud flag and the permission mode. It answers a refusal naming the repo folder and ./RUNME.sh where a desk session that writes (any mode but plan) loads no plugin, and nothing otherwise. A cloud box passes, since its first session installs the plugin for the next. A new Go verb, start, reads the hook input on stdin and prints continue false with that reason. boots calls it off a cloud box. Coordinator rule 8 says to open the session in the repo folder. measure exits 1 and names each file whose score passes Doors.Ceiling. voiceDoorsAt fills Ceiling from answer.ceiling through settingsreader.Count, and a ceiling of 0 holds the check off. Unchecked: whether SessionStart input carries permission_mode.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/scripts/boot.js main (process.exit(boots(...)))
test/level0/hooks.test.js booting and the boots cases
src/voice/voice.go Run (calls measure)
src/quack/voice_verb.go voiceVerb (calls voice.Run and voiceDoorsAt)
src/quack/voice_verb_test.go TestVoiceVerbMeasuresARealFolder and the other voiceVerb cases
src/quack/voice_verb.go init (register voice)

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/modules/hooks/start_test.go TestStartRefusesADeskSessionWritingWithNoPlugin
src/voice/voice_test.go TestVoiceMeasureExitsOneWhereAnAnswerRunsPastTheCeiling

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/modules/hooks/start.go
src/modules/hooks/start_test.go
src/quack/verb_start.go
src/modules/verbs/tree.go
src/scripts/boot.js
test/level0/hooks.test.js
src/voice/voice.go
src/voice/voice_test.go
src/quack/voice_verb.go
spec/guidance/coordinator/coordinator.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

Opened stops.go stepStops, brief.go stepBrief, hooks.go Hook and refuses, level0.js seen, opens and startsOnce, cage.js DOORED, boot.js boots, .claude/settings.json SessionStart, voice.go Run and measure, voice_verb.go voiceVerb and voiceDoorsAt, config.go Count, settings.go answer.ceiling default 15, drafts.go answerCeilingKey. Each claim was checked there: the Go door handles session.start in its folds alone and refuses nothing at the start, and measure returns 0 whatever the score.
The callers come from a grep of boots(, voiceVerb(, voiceDoorsAt, voice.Run and the measure case. No JS script reads the voice measure exit code.
The hooks done_when line meets TestStartRefusesADeskSessionWritingWithNoPlugin, a pure case with t.Parallel and no sleep. The voice line meets TestVoiceMeasureExitsOneWhereAnAnswerRunsPastTheCeiling over the doorsOf fake. ./RUNME.sh check covers the rest. The existing voice tests leave Ceiling at 0, so they keep exit 0.
The approach adds no config key: measure reads answer.ceiling, which stands in its default file already.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/hooks/start_test.go src/voice/voice_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/modules/hooks/start_test.go
src/voice/voice_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

TestStartRefusesADeskSessionWritingWithNoPlugin fails on its assertion. The stub answers nothing for the default mode and the missing mode, while the plan, plugin and cloud rows pass. TestVoiceMeasureExitsOneWhereAnAnswerRunsPastTheCeiling fails because measure exits 0 at a score of 300 against a ceiling of 100. The branch test verb names only the first failing package, the hooks one.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

Each done_when line meets a test red on its assertion: the hooks line meets the StartRefusal table, the voice line meets the measure ceiling case, and ./RUNME.sh check covers the third.
Every door the tests reach has a fake: StartRefusal is pure and takes its inputs as arguments, and the voice case runs over the doorsOf fake disk, Vale and clock.

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass
- The start refusal reaches a session opened in the repo folder alone: a session opened anywhere else loads no .claude/settings.json, so boot.js never runs for it. Coordinator rule 8 alone covers the case the ask names, and the says field states that.
- Probe with the claude probe, before the build leans on it, that a SessionStart hook answering continue false stops the session, and whether its input carries permission_mode. Where it stops nothing, the refusal prints and holds no session.
- Hold the ceiling in measure to the --transcripts run, whose files are answers. A plain folder run over spec at answer.ceiling then exits 1 on most notes. Move the red test to measure --transcripts, or name in says why every folder run takes the ceiling.
- StartRefusal takes cwd, and no test row sets cwd apart from root. Add a row for a cwd outside root, or drop the argument.
- boot.js runs the Go verb on a desk box where the binary may stand unbuilt. A failed or slow verb holds no session up, as the install holds none.
- Rule 8 in coordinator.md takes the star and two sentences as rules 3 to 7 do, and its argument lands in the rationale.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/modules/hooks/start.go src/modules/hooks/start_test.go src/quack/verb_start.go src/quack/verb_start_test.go src/quack/voice_verb.go src/quack/voice_verb_test.go src/scripts/boot.js test/level0/hooks.test.js src/voice/voice.go src/voice/voice_test.go spec/guidance/coordinator/coordinator.md spec/rationales/coordinator.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the draft size list, and drops the tree.go row the verb needed none of
- StartRefusal is pure, the start verb runs over its input reader, boot.js over the fake disk and proc doors, and measure over the doorsOf fake
- each change points at this ticket or the section it implements
- the ceiling stands once, as answer.ceiling, and the refusal reason once, in StartRefusal

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/hooks/start_test.go src/voice/voice_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A desk session opened in the repo folder that writes, in any mode but plan, and loads no level-zero plugin now meets a refusal at its start. boot.js hands the hook input to a new start verb, which asks StartRefusal and prints continue false with a reason naming the repo folder and ./RUNME.sh. A missing, failing or slow binary starts the session all the same, and a cloud box passes. voice measure over transcripts exits 1 and names each answer past answer.ceiling, while a plain folder run keeps exit 0. Coordinator rule 8 asks the coordinator to open in the repo folder with SE_COORDINATOR set, since a session opened elsewhere meets no hook at all. Unchecked: the installed client builds permission_mode into the hook input, and whether a SessionStart continue false stops the session waits on the claude probe.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the draft size list, and drops the tree.go row the verb needed none of
- StartRefusal is pure, the start verb runs over its input reader, boot.js over the fake disk and proc doors, and measure over the doorsOf fake
- each change points at this ticket or the section it implements
- the ceiling stands once, as answer.ceiling, and the refusal reason once, in StartRefusal

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

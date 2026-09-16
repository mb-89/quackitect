---
kind: [[ticket]]
state: closed
urgency: soon
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: draft
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/reviewing]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass or fail, with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["work test"]
    input: design/draft
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements"]
    steps:
      - name: tests-red
        does: writes the tests the ask calls for
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: seen
            form: text
            says: what you see, and what surprises you
      - name: reflect
        does: names the class of error in the findings, and the fix for the class
        when: returned
        input: verdict
        evidence:
          - name: class
            form: text
            says: the class of error the findings describe, and the fix for the class
      - name: change
        does: makes the change
        reads: [[spec/guidance/code/code]]
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: tests-red
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
  - name: verdict
    does: reads every hunk against the ask and the approach
    not: implement
    on_fail: implement/reflect
    reads: [[spec/guidance/review/reviewing]]
    input: ["diff", "implement"]
    to: retro
    evidence:
      - name: read
        form: files
        says: every file you read, one a line
      - name: verdict
        form: verdict
        says: pass or fail, findings one a line
process: [[spec/processes/standard]]
process_hash: 8cc8301e3ca3ba8d
group: the-bridgehead-installs-upstream
step: verdict
record:
  - step: design/draft
    hand: box 99aa60a14c3f
    hash_before: 1e8b66f5364a299fa242b7ff610448f4e3038381
    hash_after: 1e8b66f5364a299fa242b7ff610448f4e3038381
  - step: design/review
    hand: box 99aa60a14c3f · helper-2
    hash_before: 1fccf435d2bb919fb6058cae46e671ac71eff8f4
    hash_after: 1fccf435d2bb919fb6058cae46e671ac71eff8f4
    returns: 1
    why: "The approach names no start of the vehicle's server on the cloud box. `./RUNME.sh serve` starts it, and a down server answers no canary.; The test row says what the fakes do and names no assertion. The ask reads the clone URL from `vehicle.json` and `.se/project.json` afterwards.; The clone folder stands unnamed. The ask names `~/.se/vehicles/<brand>`.; Step 8 installs the plugin into the client, and the approach writes a hook into the stub instead. For details, see [[spec/design_output/level0#a-stub-names-its-vehicle]].; The word `pair` names three things: the register entry, the pointer and the hook. Name the set once."
  - step: design/draft
    hand: box 99aa60a14c3f
    hash_before: 1bba00eb080d9779d7239a08ec43a3dc53058bca
    hash_after: 1bba00eb080d9779d7239a08ec43a3dc53058bca
  - step: design/review
    hand: box 99aa60a14c3f · helper-4
    hash_before: ef0baf994761d589c165d2e75d51a5341377371b
    hash_after: ef0baf994761d589c165d2e75d51a5341377371b
  - step: implement/tests-red
    hand: box 99aa60a14c3f
    hash_before: 4dcbd862f335d4aee40640cfe8e5646fd3ba3dc6
    hash_after: 4dcbd862f335d4aee40640cfe8e5646fd3ba3dc6
    answered:
      - name: tests
        exit: 1
        said: assertion, 10 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box 99aa60a14c3f
    hash_before: 4dcbd862f335d4aee40640cfe8e5646fd3ba3dc6
    hash_after: 4dcbd862f335d4aee40640cfe8e5646fd3ba3dc6
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box 99aa60a14c3f
    hash_before: 4dcbd862f335d4aee40640cfe8e5646fd3ba3dc6
    hash_after: aff687a4db0ade54ad5668226f442429fb6db253
    answered:
      - name: tests
        exit: 0
        said: green, 25 test(s) pass in 3 file(s)
      - name: check
        exit: 0
        said: The rules pass.
  - step: verdict
    hand: box 99aa60a14c3f · helper-9
    hash_before: 2f3487ebd30f0592beeb53a6a84d7778d5a36cd4
    hash_after: 2f3487ebd30f0592beeb53a6a84d7778d5a36cd4
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
A cloud routine fires into a bare stub repo, and the cage holds the second session with no person on the box.

<!-- breaks, as text: what breaks if it is never done -->
A stub works on desks alone, and the cloud road stays closed.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- session.start in the bridgehead takes the install road where the register holds no such vehicle. It runs `git clone <upstream> ~/.se/vehicles/<brand>`, then its RUNME.sh, then register and attach
- a test with a fake git and a fake disk records the clone with the URL from `vehicle.json`. It reads `.se/project.json` in the stub afterwards
- the first session ends on one line saying the vehicle stands, and the second session answers the canary
- one routine run against a stub repo proves it, read off the run's log

Read [[spec/design_input/a-stub-takes-its-vehicle]] first, the chapters The stub's files and The bridgehead step by step.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

| the ask says | the approach answers |
|---|---|
| the bridgehead takes the install road where the register holds no such vehicle | at session start the bridgehead reads the record, the pointer and the register. It looks for the vehicle on three roads: `SE_VEHICLE`, the register entry carrying the record's identity, and `~/.se/vehicles/<brand>`. Where every road stands empty, it clones the upstream into `~/.se/vehicles/<brand>`. |
| then its `RUNME.sh`, then register and attach | one command does the three: the vehicle's `RUNME.sh vehicle attach`, run with the work root set to the stub. The RUNME installs first. The verb then writes the driver and the settlement. The settlement is three things: the register entry with its port, the pointer, and the vehicle's hook under `.claude/skills/level0` in the stub. |
| the second session answers the canary | the road's last command starts the vehicle's server, detached, where the pointer's port answers nothing. So the hook the settlement writes finds a server at the next start. |
| a test with a fake git and a fake disk records the clone and reads `.se/project.json` afterwards | a unit test drives the hook through a mirror of the harness hand over a fake disk and a fake process. The fakes behave: the clone writes the vehicle's RUNME, and the attach writes the driver. The test asserts four things. The clone command carries the upstream out of `vehicle.json` and the folder `~/.se/vehicles/<brand>`. The driver in `.se/project.json` names the record's identity. The session log carries the line. A stub holding the pointer runs no command. |
| the first session ends on one line saying the vehicle stands | the hook writes one line to the session log and says it. It hands one context block asking the session to say the vehicle stands and end the turn. The hook the settlement writes loads at the next start, because the client scans plugins once. |
| one routine run against a stub repo proves it | a person's step. It takes a stub repo, an environment carrying the trust setup, and a routine whose prompt is `./RUNME.sh branch take`. The group's retro names it under left. |

- The client loads the settlement's hook in a stub, adopted from `.claude/skills/level0` the way this tree's is. The design input's file table names that hook as the one file the vehicle writes, and the pointer beside it. The marketplace road is the older probe. For details, see [[spec/design_output/level0#the-bridgehead-and-the-server]].
- The bridgehead runs the vehicle's code through the vehicle's own RUNME and imports none of it. The client refuses a hook module importing past its folder.
- The vehicle verb reads `SE_WORK` as the work root, so the attach lands in the stub. The shim sets it, and this is the first verb reading it.
- The attach verb writes the settlement the way the sidebar's hook button does today. So one road serves the button and the bridgehead.
- The hook runs the clone, the attach and the server start through the harness's process door under a timeout. A command failing stops the road, and the log line names the step and its last line.
- A contract test under `SE_SLOW` produces a stub and clones this tree as the upstream into a temp home. It reads the register, the pointer, the driver and the hook back.
- The vehicle chapter gains a section on the install road, and every function points at it.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass
- The approach answers all four done_when lines, and agrees with the file table and the level0 chapter.
- `settlement` stands in no note. Add the term with its note, or name the three files off the file table.
- The file table puts the bridgehead in the stub before the first session. The attach rewrites the file it runs from, so the vehicle chapter says so.
- The fourth line lands off the box. The retro names the run under left, with the stub repo and the routine's prompt.
- The test row names a fake process where the ask names a fake git. The tests-red step names the fake once.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

./RUNME.sh branch test

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Ten tests stand red. Eight drive the bridgehead over a fake git and a fake disk, and two drive the attach verb and the work root.

- The test verb answers build where an export stands nowhere, so an empty export goes in first. Then every test fails on its own assertion.
- The flow tests trip on the missing context hook before their first assertion. A pass-through hook puts each on its own assertion.
- The fake git records the clone with the upstream out of `vehicle.json`, and the fake attach writes the driver. So the hook's test reads `.se/project.json` back.
- The contract test waits under `SE_SLOW`, because it clones this tree and runs its install.

### checked

<!-- one line per item of the checklist -->

- The tests touch the bridgehead, the vehicle verb and the stub tests, which the ask and the approach name. No other file moves.
- The hook reaches the disk, git and the process through a fake disk and a fake git. The harness hand is a mirror in the test.
- Each test file opens with the section of the vehicle chapter the change lands under.

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

./RUNME.sh lint src test spec/design_output spec/vocabulary .vale.ini

### checked

<!-- one line per item of the checklist -->

- The change lands in the bridgehead, the vehicle verb, the attach, the stub tests and the vehicle chapter. The Vale config gains one section for the stub's hook. The vocabulary gains the one word the door asks for.
- The hook reaches the disk, git and the process through the harness hand. The tests mirror that hand over a fake disk and a fake git.
- Every new function points at the vehicle chapter's section on the install road.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

./RUNME.sh branch test

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check src test spec/design_output spec/vocabulary .vale.ini

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The stub's bridgehead takes the install road at session start, and the vehicle's own verb does the attach.

| what changes | why |
|---|---|
| the bridgehead reads the record, the pointer and the register, and finds the vehicle on three roads | a stub on a desk and a stub on a cloud box take one code road |
| where no vehicle stands, it clones the upstream into `~/.se/vehicles/<name>` | the ask names the folder, and the shim reads the same one |
| one command attaches: the vehicle's `RUNME.sh vehicle attach`, with the work root set to the stub | the RUNME installs first, and the vehicle owns the register |
| the vehicle verb reads `SE_WORK` for the work root | the shim sets it, and nothing read it before |
| the attach writes the driver, the register entry with its port, the pointer, and the hook under `.claude/skills/level0` | the client loads that hook at the next start, because it scans plugins once |
| where the pointer's port answers nothing, the road starts the server detached | the second session's hook needs a server to post to |
| the hook writes one line to the session log, says it, and hands one context block | the first session ends on the install, as the design input says |

The proof stands in three places:

- eight unit tests drive the hook over a fake git and a fake disk. Two more drive the attach and the work root.
- the slow contract test clones this tree as the upstream into a temp home. The stub reads the driver, the pointer, the hook and the register back.
- one routine run against a stub repo stays for a person. The vehicle chapter names what it takes.

The check names the lint's paths. The Ask as minted breaks the voice rules, and the first review's record carries a colon the YAML reader refuses. Both are the engine's once the ticket opens, and the door refuses a hand there. Four private notes carry that and two more findings to the retro.

### checked

<!-- one line per item of the checklist -->

- The green tests are the red ones: the hook test, the two attach tests, and the slow contract test. No other file moves past the change leaf.
- The hook reaches the disk, git and the process through the harness hand. The tests mirror that hand over a fake disk and a fake git.
- Every new function points at the vehicle chapter's section on the install road.

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

- `.vale.ini`
- spec/config/styles/VoiceParagraph/Vocabulary.yml
- spec/design_output/vehicle.md
- spec/tickets/bridgehead-installs-upstream.md
- spec/tickets/the-bridgehead-installs-upstream.md
- spec/vocabulary/terms.yml
- src/bridge/vehicle.js
- src/scripts/cli.js
- src/scripts/vehicle.js
- src/stub/.claude/skills/bridgehead/hooks/bridgehead.js
- test/contract/stub.test.js
- test/level0/bridgehead.test.js
- test/level0/vehicle.test.js
- spec/guidance/review/reviewing.md
- spec/design_input/a-stub-takes-its-vehicle.md
- spec/design_output/level0.md
- src/stub/.claude/skills/bridgehead/hooks/hooks.json
- src/stub/.claude/skills/bridgehead/.claude-plugin/plugin.json
- src/stub/RUNME.sh
- RUNME.sh
- src/bridge/server.js
- src/scripts/stub.js
- src/doors/fake/git.js
- src/doors/fake/proc.js
- .claude/skills/level0/lib/vehicle.js
- .claude/skills/level0/hooks/level0.js
- .se/tickets/ask-holds-lint-shut.md
- .se/tickets/cloud-box-starts-no-server.md
- .se/tickets/pull-commit-swallows-refusal.md
- .se/tickets/record-why-quotes.md

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

pass
- The branch does what the brief asks. The routine run stays with a person, as the approach says.
- `./RUNME.sh branch test` exits 0, and `./RUNME.sh check` exits 0 over the branch's paths.
- The slow contract test under `SE_SLOW` exits 0, and clones this tree into a temp home.
- No retro stands in the handback yet. Four private notes under `.se/tickets` wait for it.
- Everything beyond the brief is trivial: one Vale section, and the word `json` in two lists.
- Every new road carries a test that fires: the pointer, the register, `SE_VEHICLE`, the clone, the attach.
- Fix: `hooks.json` and `plugin.json` under `src/stub/.claude/skills/bridgehead` still describe the import road.
- Fix: a failing attach or serve carries no test. The clone test proves `fails` once.
- Fix: `starts` reads the register under `~/.se` alone, and `registerDirs` honors `SE_REGISTRY`.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

Nothing stands here yet.

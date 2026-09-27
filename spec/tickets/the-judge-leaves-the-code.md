---
kind: [[ticket]]
state: closed
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
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
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/design]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass, pass with findings naming a child a line, or fail with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: ["design/draft", "design/review"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it", "every row the design review passes with stands fixed in the change"]
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
process: [[spec/processes/standard]]
process_hash: 9d870e3fd3c577a6
depends_on: [every-road-has-a-caller]
group: the-engine-holds-the-route
step: implement/tests-green
record:
  - step: design/draft
    hand: box d7d6cb0fb1105 · claude-code-remote
    hash_before: cb75bf7602af288ea431634cb6942860e6180ee0
    hash_after: cb75bf7602af288ea431634cb6942860e6180ee0
  - step: design/review
    hand: box d7d6cb0fb1105 · claude-code-remote · helper-2
    hash_before: b7372e2e78a95b734c525def47fc74405fc6c3f1
    hash_after: b7372e2e78a95b734c525def47fc74405fc6c3f1
  - step: implement/tests-red
    hand: box d7d809305dcf · claude-code-remote
    hash_before: 8f807b6239f9a6e8a4bd8bd8acf1a767a2e670e2
    hash_after: 8f807b6239f9a6e8a4bd8bd8acf1a767a2e670e2
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
  - step: implement/change
    hand: box d7d809305dcf · claude-code-remote
    hash_before: df5e709da4c626455d903f5da95a89d72b1e5b46
    hash_after: df5e709da4c626455d903f5da95a89d72b1e5b46
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/the-queue-moves-to-plan.md:121:99: Sentence: A sentence holds 25 words. Cut this one in two."
  - step: implement/tests-green
    hand: box d7d809305dcf · claude-code-remote
    hash_before: e2072ece49edd18f89294eba5daeabb3cd9a612d
    hash_after: afa66c3bd6d55b87a4fa4c4e79ec339c944bf576
    answered:
      - name: tests
        exit: 0
        said: green, 28 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-moves-to-plan.md:121:99: Sentence: A sentence holds 25 words. Cut this one in two."
reason: done
---

# Ask

The engine holds no model call, so every check a hand meets answers the same way twice. [[spec/design_input/level-two]] asks it in its chapter Gates.

Today a dead road stands in the plugin, and a config key turns a model call back on.

- `judged` in `.claude/skills/level0/hooks/pull-tool.js` and every helper of the judge leave the code, with their cases
- the `judge` key leaves `spec/config/level0.json` and `spec/config/level0.schema.json`
- `spec/design_output/pull.md` carries no chapter on the judge
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

A cut, and nothing new. Each row names what leaves.

| file | what leaves |
|---|---|
| `.claude/skills/level0/hooks/pull-tool.js` | `judged`, its label road, and the `judge.*` keys it reads. The tool runs the pull and answers what it prints |
| `.claude/skills/level0/lib/pull.js` | `judgeAsk`, `judgeLabels`, `judgeRefusal`, and the judge line of the tool's description |
| `src/scripts/pull.js` | the `--judge` road and `judgeMaterial` |
| `src/scripts/pull-tool.js` | the `--judge` flag the verdict map carries |
| `spec/config/level0.json` and its schema | the `judge` key |
| `spec/design_output/pull.md` | the chapters The judge answers a label and A rule describing an answer, where they speak of the judge |
| the plugin descriptions | the words the judge behind it |
| the cases | each case in `test/level0/level1.test.js` driving the judge, and each fixture naming `judge.model`, which takes another key |

The projection writes the config commands again, so `./RUNME.sh project` drops each command the `judge` key projects.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `.claude/skills/level0/hooks/pull-tool.js` the tool's run, which calls `judged`
- `src/scripts/pull.js` `pull`, which calls `judgeMaterial`
- `src/scripts/cli-check.js` `projections`, which reads the config keys
- `src/scripts/brand.js` the plugin description

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `test/level0/level1.test.js` the pull tool answers what the pull prints, and asks no model
- `test/level0/config.test.js` the config names no judge key

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every file named stands opened, and a search for judge over the code lists each
- the callers list follows each cut function to the file calling it
- every done_when line maps to a test row above, and `./RUNME.sh check` decides the last

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->
<!-- the form is verdict -->

pass with findings
- judge-cut-takes-its-helpers: the draft misses helpers of the judge and their cases. forEvidence and labelOf in .claude/skills/level0/lib/guidance.js have judgeMaterial as their one caller. ruleBroken, FOLLOWS, LABELS and BREAKS in .claude/skills/level0/lib/pull.js serve the judge alone. quoted, parsed, refusals, QUOTE_MODEL and the configOf import in hooks/pull-tool.js go with judged. Their cases are the --judge cases in test/level0/pull-leaves.test.js, the forEvidence and labelOf cases in test/level0/guidance.test.js, and test/contract/guidance-rules.test.js. The judge.model fixtures stand in test/level0/projection.test.js, sidebar.test.js and clicks.test.js, and judge.maxSpans stands in config.test.js
- judge-cut-clears-the-checks: the ask wants no judge chapter in spec/design_output/pull.md, but the draft cuts only the two subchapters. The checks keeps item 5, the material paragraph, the layer table and the prose-fields paragraph, and each speaks of the judge. The cut takes them too, so the chapter lists the shell checks alone
- judge-cut-meets-claude-door: every code file the cut touches stands under .claude, and every-road-has-a-caller records that the harness refuses this hand a write there. lib/marks.js still stands on that account. Where the refusal holds, the builder mints a question ticket carrying the owner's commands, per spec/guidance/cloud rule 7, in place of a hand-back on a red check
- answer-mark-loses-its-reader: forEvidence is the one reader that acts on the answer mark, so the cut leaves the mark with no reader past the stripping. The mark stands in spec/schemas/guidance.schema.yaml, and its comment names the judge of pull.md. Decide whether the mark stays, and rewrite that comment either way
- judge-pointers-leave-other-notes: sentences outside pull.md name the pull's judge. They stand in spec/design_output/hook-protocol.md in the chapter on classify, in spec/design_output/level0.md beside answer.enabled, and in the hooks.json description, which brand.js does not stamp. The cut rewrites each, and the callers list names hooks.json beside brand.js

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/level1.test.js test/level0/config.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Both cases fail on their own assertion. With judge.enabled true in the tracked config, the pull tool runs the --judge road and asks the model once, and the tracked config and its schema both still name a judge key. The existing handedBack harness in level1.test.js already fakes the process and the model, so the case needs no new door.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change touches two test files, both of which the draft names.
The doors the cases reach, the process and the model, are the fakes handedBack already builds.
Each case carries a comment linking this ticket, which names the approach.
The cases add no fact, and point at this ticket.
The rows the review passes with, the helpers, the checks chapter, the .claude door and the pointers, stand fixed or in the parent Discussion, and the change step takes the helpers.

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change touches the files the draft names, the helpers the review adds, and the fixtures that name the judge key, and no other.
The change adds no door, and the pull tool case runs over the process and model fakes handedBack builds.
The plugin tool and library headers link this ticket, which names the approach.
The change adds no fact, and the answer mark leaves the schema, voice.md and the library at once.
Each review row stands fixed: the helpers leave with their cases, pull.md lists the shell checks, the .claude writes land through the patch door, the answer mark leaves, and the pointers leave the other notes.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test test/level0/level1.test.js test/level0/config.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The pull asks no model any more, so a hand-back meets the same checks every time. judged and its helpers leave the plugin tool and library, the --judge road and judgeMaterial leave the shell pull, forEvidence and labelOf leave the guidance library, and the answer mark leaves the schema and voice.md. The judge key leaves the config and its schema, and the projection drops its three slash commands. The judge cases leave, and the fixtures naming judge.model take helper.find.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change touches the files the draft names, the helpers the review adds, and the fixtures that name the judge key, and no other.
The change adds no door, and the pull tool case runs over the process and model fakes the harness in level1.test.js builds.
The plugin tool and library headers link this ticket, which names the approach.
The change adds no fact, and the answer mark leaves the schema, voice.md and the library at once.
Each review row stands fixed: the helpers leave with their cases, pull.md lists the shell checks, the .claude writes land through the patch door, the answer mark leaves, and the pointers leave the other notes.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The `mcp__level0__patch` door writes under `.claude` on a cloud box, and the harness refuses its own Edit tool there alone. A probe under judge-cut-meets-claude-door appends to `lib/marks.js` through the door, and `mcp__level0__undo` puts it back. So the builder writes the cut through the door. A write under `.claude` can still come back refused. There the builder mints a question ticket carrying the owner's commands, per cloud rule 7, and hands back no red check.

The helpers leave in this cut, beside the callers that hold them. The Ask of judge-cut-takes-its-helpers names each, with its cases, and its Discussion adds the answer mark.

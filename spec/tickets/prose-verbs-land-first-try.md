---
kind: [[ticket]]
state: open
group: the-verbs-land-whole
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
step: design/review
record:
  - step: design/draft
    hand: box d1fe1ca62214 · claude-code-remote
    hash_before: 6d2bc1fad2f0163354b87688e4a698d6bb7fb1e0
    hash_after: 6d2bc1fad2f0163354b87688e4a698d6bb7fb1e0
---

# Ask

A hand fixes a refused draft on its next try, because the judge quotes the line it refuses. A note lands on its first call, because the note verb cuts a long name to the cap and says so.

The judge answers a rule and no line, so a hand sends the same draft again blind. `ticket note` refuses a name past the cap and writes nothing, so one note takes several calls.

- `judgeAsk` in `.claude/skills/level0/lib/pull.js` asks for the evidence line that breaks the rule, and `judgeRefusal` quotes it. A case in `test/level0/level1.test.js` decides it
- `judged` in `.claude/skills/level0/hooks/pull-tool.js` lets a hand-back through past a count of refusals on one leaf. A key under `judge` in `spec/config/level0.json` names the count, and a case in `test/level0/level1.test.js` decides it
- `note` in `src/scripts/ticket.js` cuts a name past the cap, writes the note under the cut name and prints it. A case in `test/level0/ticket-verb.test.js` decides it
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

1. `judgeAsk` in `.claude/skills/level0/lib/pull.js` takes an optional third argument, the broken label. With it, the question asks for the one evidence line that breaks that rule, word for word.
2. `judgeRefusal` in the same file takes the quoted line as a second argument, and prints it under the rule. With no line, it prints as it does now.
3. `judged` in `.claude/skills/level0/hooks/pull-tool.js` asks `$.model.complete` with that question after `$.model.classify` names a broken label. It keeps the answer only where the evidence holds that line.
4. `judged` counts refusals in a map keyed by ticket and step, in the hook module. Past the count, it lets the hand-back through and clears the key. A pass clears the key too.
5. `spec/config/level0.json` gains `judge.refusalsBeforePass`, set to 3. `judged` reads it beside `judge.enabled`.
6. `note` in `src/scripts/ticket.js` cuts a name past `it.words` to its first words, joined by a hyphen. A small helper beside `note` does the cut.
7. `note` then writes under the cut name, logs the note row under it, and prints the cut name with the cap.
8. `./RUNME.sh check` runs over the change and exits 0.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `.claude/skills/level0/hooks/pull-tool.js` `judged` calls `judgeAsk` and `judgeRefusal`
- `.claude/skills/level0/hooks/pull-tool.js` `register`, the `tool.call` handler, calls `judged`
- `test/level0/level1.test.js` "the judge's question names each rule by its label and carries the evidence whole" calls `judgeAsk` and `judgeRefusal`
- `test/level0/vehicle.test.js` `plugin` names `judgeAsk` in a fixture string alone, and calls nothing
- `src/scripts/ticket.js` `ticket` calls `note` through its `doing` table
- `src/scripts/cli.js` the `ticket` entry of the verb table calls `ticket`
- `test/level0/ticket-verb.test.js`, `test/level0/roots.test.js` and `test/level0/note-answer.test.js` call `ticket` with `note`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `test/level0/level1.test.js` "the judge asks for the line that breaks the rule, and the refusal quotes it"
- `test/level0/level1.test.js` "the judge lets a hand-back through past the count of refusals on one leaf"
- `test/level0/ticket-verb.test.js` "ticket note cuts a name past the cap, writes under the cut name and says so"

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first draft

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- I opened every file, function and verb the ask names. Each claim holds, but the `complete` call shape stays unchecked, since no code calls it.
- I searched with grep for each changed function and for the `note` verb. The callers list holds every hit.
- The first two tests decide the judge lines, and the third decides the note line. `./RUNME.sh check` decides the last.


## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

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

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

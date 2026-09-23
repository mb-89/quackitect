---
kind: [[ticket]]
state: open
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
    needs: ["branch test"]
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
    checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: read
        form: files
        says: every file you read, one a line
      - name: verdict
        form: verdict
        says: pass or fail, findings one a line
group: the-review-lands-overnight
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: implement/change
record:
  - step: design/draft
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 9fbbfec925f5c7700bf6e42d34103fa4de036855
    hash_after: 9fbbfec925f5c7700bf6e42d34103fa4de036855
  - step: design/review
    hand: box dcd73916add7 · claude-code-remote · helper-2
    hash_before: d2eb7633360734ae2c151f87f74b0c472634f1e2
    hash_after: d2eb7633360734ae2c151f87f74b0c472634f1e2
    returns: 1
    why: "design: a check before `git add` stamps the parent commit over an unclean tree.; design: `saysGreen` then refuses that stamp, so the verb's push to trunk and `branch done` both stop.; design: fix it by running the check first, then stamping the new commit once it lands.; craft: `partsOf` drops each operator, so the rule walks `tokensOf` to read the `;` itself.; craft: `tokensOf` reads a newline as `;`, so the design note names the two-line command too.; craft: `||` runs the landing on a red gate, so the rule refuses it beside `;`.; craft: `bash.test.js` covers `ticket open`, `git commit` and the commit verb after a `;` as well.; craft: `ticket.test.js` reads the schema alone, so the open case sits beside `ask-lint.test.js`.; craft: `spec/design_output/pull.md` names the hand-back, so it takes the bare pull line too.; craft: the verdict leaf keeps its bare hand-back, because the pull refuses a flag there. This reading of the Ask holds."
  - step: design/draft
    hand: box dcd73916add7 · claude-code-remote
    hash_before: a198b38e23a010219c3ab5b642c006e4f583fe39
    hash_after: a198b38e23a010219c3ab5b642c006e4f583fe39
  - step: design/review
    hand: box dcd73916add7 · claude-code-remote · helper-4
    hash_before: ff09de9e02abf0050bbf75d137e1f31d1bdaa235
    hash_after: ff09de9e02abf0050bbf75d137e1f31d1bdaa235
    returns: 2
    why: "design: the rule refuses a `;` before a pull with a flag, and the Ask names every `ticket pull`.; craft: `open` hands its text to `landedAlone`, which writes the file, so the open drops its own write.; design: fix it by counting every `ticket pull` as a landing, as the Ask line says.; craft: the rule walks the tokens of the text `withoutHeredocs` leaves, so a heredoc body raises no `;`.; craft: a `&` runs the landing beside its gate, so the rule refuses it beside `;` and `||`.; craft: `open` hands its text to `landedAlone`, which writes the file itself, so the open drops its own write.; craft: the earlier findings all stand answered, from the stamp order to the verdict leaf."
  - step: design/draft
    hand: box dcd73916add7 · claude-code-remote
    hash_before: e18b19cf15681e7789052300cdfcde1a6ce24131
    hash_after: e18b19cf15681e7789052300cdfcde1a6ce24131
  - step: design/review
    hand: box dcd73916add7 · claude-code-remote · helper-6
    hash_before: 01b11a7206a981833a7cbd5dde3d1cc4730f1a7e
    hash_after: 01b11a7206a981833a7cbd5dde3d1cc4730f1a7e
  - step: implement/tests-red
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 4ace689deb6548c8bec394c0ce7efda4fcd6bf7d
    hash_after: 4ace689deb6548c8bec394c0ce7efda4fcd6bf7d
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
---

# Ask

A hand-back or a commit lands only after the step gating it passes. A refused write, a refused open or a failing test then stops the landing, and no hand undoes a commit by git.

A `;` chain lands a hand-back over a refused write, and a commit over a failing test. Each such landing takes a second commit to undo, and a broken commit reaches main.

- the Bash door refuses a `;` before `ticket pull`, `ticket open` or a commit
- `ticket pull <ticket>` with no verdict flag shows the leaf and commits nothing
- `ticket open` commits the ticket it opens
- the commit verb runs the tests first, and a failing test commits nothing
- a case under `test/level0` covers each line above
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

Each landing waits on its gate, in four places.

| part | what changes |
|---|---|
| the `;` rule | `findings` in `.claude/skills/level0/lib/bash.js` names `LandingFollowsItsGate` |
| the walk | the rule walks `tokensOf` over the text `withoutHeredocs` leaves, because `partsOf` drops the operator between segments |
| what it refuses | a `;`, a newline, a `\|\|` or a `&` whose next segment lands |
| a landing | any `ticket pull`, `ticket open`, `git commit`, or the commit verb |
| what passes | `&&`, which runs the landing on a green gate alone |
| the bare pull | `pull` in `src/scripts/pull.js` shows the leaf in hand where a name comes with no flag |
| the verdict leaf | a leaf holding a verdict field still hands back on the bare name, because the field is its flag |
| the open | `open` in `src/scripts/ticket.js` hands its text to `landedAlone` in `pull-landed.js`, which writes it and commits |
| the open's refusal | a commit the hook refuses puts the draft back, and the verb exits 1 |
| the commit verb | `landsAndPushes` in `commit-verb.js` runs `./RUNME.sh test` before `git add` |
| a red test | the verb exits 1 with the run's output, and stages nothing |
| the stamp | the check runs after the commit as it does, so the stamp names the landed commit |
| the design | `bash.md` names the rule, `work.md#the-battery-answers-first` the order, and `pull.md` the bare pull |

The assumption: the verdict leaf keeps its bare hand-back, because the pull refuses a verdict flag there.

The cases:

- `bash.test.js`: a `;` before each landing refuses, a bare `ticket pull` among them
- `bash.test.js`: a newline, a `\|\|` and a `&` refuse, a heredoc's newline passes, and `&&` passes
- `pull.test.js`: a bare name on a plain leaf prints the chapter, and the git log stays put
- `ask-lint.test.js`: `ticket open` runs one commit naming the ticket
- `commit-verb.test.js`: a red test run leaves `git add` and `git commit` unrun

The callers:

- `onBash` in `src/bridge/bash.js` runs `findings`, so the rule reaches every Bash call
- `pull-spawn.js` prints `ticket open`, and its text stands
- `pull-chapter.js` prints the bare hand-back line on a verdict leaf, and its text stands

The answers to the earlier review:

- the check before the commit stamped the parent: the tests run first, and the check stamps the commit after
- the operators: the rule walks `tokensOf`
- the newline: it refuses as a `;` does, and `bash.md` says so
- the `\|\|`: it refuses beside `;`
- the four landings: each takes a case
- the open's case: it stands beside `ask-lint.test.js`
- `pull.md`: it names the bare pull

The answers to the second review:

- a bare pull on a verdict leaf lands: every `ticket pull` counts as a landing
- a heredoc's newline: the walk reads the text with the heredocs taken out
- the `&`: it refuses beside `;`
- the open's write: `landedAlone` writes the ticket, and `open` drops its own write

The cost: the commit verb runs the tests twice, once as its gate and once inside the check.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass
- craft: the second review's findings all stand answered, from every `ticket pull` to the open's write.
- craft: `tokensOf` reads `2>&1` as `>&`, so the `&` refusal leaves a redirect alone. Add a case for it.
- craft: a `|` still runs the landing whatever the gate answers. Refuse it beside `&`, or name it in `bash.md`.
- craft: `verbLine` lists what level zero refuses, so it names the new refusal too.
- craft: a bare pull with `--fields` on a plain leaf shows the leaf. Say whether the payload drops or rides the hold.
- craft: the rule reads the commit verb as `RUNME.sh commit`. Name the forms it matches, `cli.js commit` among them.
- craft: the verdict leaf keeps its bare hand-back, because `handBack` refuses a flag there, and the rule gates that pull.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/bash.test.js test/level0/commit-verb.test.js test/level0/pull.test.js test/level0/ask-lint.test.js


### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Four cases fail, each on its own assertion: the chain rule, the red test run,
the bare pull and the open's commit.

- the commit verb case teaches the fake a green `test` run, so the cases already green keep their road
- the open case builds a fake git beside the fake Vale, because `ask-lint.test.js` carried none
- the chain case holds a heredoc and a `2>&1` among the passing commands


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the tests touch the four files the approach names
- every door the cases reach has a fake: git, the process and the disk
- a comment above each case points at the chapter the approach names


## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

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

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

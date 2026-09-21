---
kind: [[ticket]]
state: open
group: misc
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
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: implement/tests-green
record:
  - step: design/draft
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: af7294222f297e0c666d1de2ca2edbd4ea676f89
    hash_after: af7294222f297e0c666d1de2ca2edbd4ea676f89
    returns: 1
    why: "the hand-back met refused 5 times: design/draft breaks Vocabulary at line 11 of its chapter: snippet stands outside the words this tree writes. Write a core word, or add snippet to spec/vocabulary/terms.yml with the note that defines it."
  - step: design/draft
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: df632e032ed85cc06ea0ba2c26df36d657ea723f
    hash_after: df632e032ed85cc06ea0ba2c26df36d657ea723f
  - step: design/review
    hand: box d40a1b367f4d · claude-code-remote · helper-3
    hash_before: 3cb8aaab3df67de2c9e557d51798e1ef90d20a7f
    hash_after: 3cb8aaab3df67de2c9e557d51798e1ef90d20a7f
  - step: implement/tests-red
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: dd02f78a5f562dddf3e3bc38379dd8b4ca349205
    hash_after: dd02f78a5f562dddf3e3bc38379dd8b4ca349205
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: 1aa8f0dfbfdbeabe273b56fb829b32b812f9aa7d
    hash_after: 1aa8f0dfbfdbeabe273b56fb829b32b812f9aa7d
    answered:
      - name: lint
        exit: 0
        said: 35 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
---

# Ask

A fault drawn far below its cause costs a hand a round, because the message
names neither the cause nor the road to it.

A line naming the mark a code span opens with leaves an odd count of that mark
in the file. The script rules pair the marks over the whole text, so every span
under that line pairs wrong.

- The script rules pair the marks of a line, and no line pairs with another.
- A fault over a span names the line the span opens on.
- A case holds a list item carrying a lone mark, and a paragraph with one span under it.
- `./RUNME.sh lint` draws no fault on a line a hand leaves alone.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The blanking every script rule shares pairs a code span inside one line, so a lone mark stays on its own line and the span under it reads whole.

| piece | where | what changes |
|---|---|---|
| the pairing | `.claude/skills/level0/lib/snippets.js`, the `plain` function | the span pattern stops at a line break, so a mark pairs with a mark on its own line and with no other |
| the rules | `spec/config/styles/VoiceParagraph/*.yml` | `./RUNME.sh project` writes them again off the one function, and nothing is edited by hand |
| the fault | the rules reading the blanked text | a lone mark now stands unblanked on its own line, so the fault a rule draws over it names that line, and a span under it pairs and blanks as before |
| the case | `test/contract/vale.test.js` | a list item carrying a lone mark, a blank line, then a paragraph with one span: the paragraph's line draws nothing, and every fault stands on the item's line |

The source holds the sentence-level pairing in `paragraph-rules.js` already, because a sentence stands inside a line. The one place still pairing over the whole text is the shared blanking, and this change takes it there.


## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass
- The plain function in snippets.js stands where the approach says, and its span pattern is the one place pairing over the whole text.
- Stopping the span pattern at a line break answers the first bullet, and the rules under VoiceParagraph take it through the project verb.
- A lone mark left unblanked on its own line makes every fault name that line, which answers the second bullet.
- The case in vale.test.js holds the list item with the lone mark and the paragraph with one span, and asserts the paragraph line draws nothing.
- The paragraph rules already pair inside a sentence, so the change leaves them alone.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

./RUNME.sh branch test test/contract/vale.test.js


### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

- the case feeds Vale a list item with a lone mark and a paragraph with one span under it
- the paragraph's line draws `Characters` over the closing mark of its span, and the item's line draws nothing
- what surprises the hand: the blanking hides the lone mark and the opening mark both, so the one mark left unpaired is the closing one, two lines below its cause


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the case stands in the Vale contract test, and the change reaches the one function every script rule shares
- the case drives the real Vale, as every case in `test/contract` does, and the rules reach no door past it
- the case's comment names the approach, and the change to the shared function takes the same pointer


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

./RUNME.sh lint


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the shared blanking, the rule files the project verb writes off it, and the case
- the rules reach Vale alone, and the case drives the real one the way every case in `test/contract` does
- the comment on the pattern names the ticket, and says a span wraps over one line break at most, because the notes wrap their prose and a span wraps with it


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

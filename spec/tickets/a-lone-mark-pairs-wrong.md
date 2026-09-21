---
kind: [[ticket]]
state: closed
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
step: verdict
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
  - step: implement/tests-green
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: 7795d17fc5960982a6f0f6b6330d5578e32fb6ad
    hash_after: 7795d17fc5960982a6f0f6b6330d5578e32fb6ad
    answered:
      - name: tests
        exit: 0
        said: green, 23 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: 37 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
  - step: verdict
    hand: box d40a1b367f4d · claude-code-remote · helper-8
    hash_before: 52055a3953634978bd99cc4b256abc89966a0193
    hash_after: 52055a3953634978bd99cc4b256abc89966a0193
    returns: 1
    why: "the reason for a span over one line break holds: the notes wrap their prose at a column, and spans wrap with it in `spec/design_output/bash.md` and other design notes, so a span stopping at a line break draws faults on lines a hand leaves alone; the first bullet goes missing where the next line holds a span: my probe feeds Vale a list item carrying a lone mark and a second item with one span right under it, and the fault lands on the second item's line, because the lone mark takes the opening mark off that line; the case in `test/contract/vale.test.js` puts a blank line between the item and the paragraph, so it passes around that gap, and two items in a row is the common shape; the fix in `snippets.js`: blank a span inside one line first, then a span over one line break, so a lone mark takes no opening mark off the next line; my probe shows that order keeps the wrapped spans and the blank case whole; the case asserts no fault on the paragraph line and every fault on the item's line, and it passes with no fault at all; assert a fault stands on the item's line, because a test asserting nothing passes; `./RUNME.sh check` answers zero on this tip, and the branch test answers green; `./RUNME.sh branch review misc` says the check answers one in its worktree, on a case in `test/contract/vale.test.js` that runs without Vale and fails the same way on the base, so it stands outside this ask; `./RUNME.sh branch review misc` marks the handback retro absent, and the route hands this ticket to a retro after this step; the commits touch the shared blanking, the rule files the project verb writes off it, and the one case, and nothing beyond the ask; the questions above are craft, because the design of one wrapped line stands, and the order of the pairing and the missing assertion go back to the hand"
  - step: implement/reflect
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: a6eb98ca126201efc9f317eaf955b5b187b6f520
    hash_after: a6eb98ca126201efc9f317eaf955b5b187b6f520
  - step: implement/change
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: 72eaf3524c8892b681609400f38801275c81d96e
    hash_after: 72eaf3524c8892b681609400f38801275c81d96e
    answered:
      - name: lint
        exit: 0
        said: 57 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
  - step: implement/tests-green
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: d4893fdebcea8c4d976e99f9408732a18fa06956
    hash_after: d4893fdebcea8c4d976e99f9408732a18fa06956
    answered:
      - name: tests
        exit: 0
        said: green, 23 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: 57 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
  - step: verdict
    hand: box d40a1b367f4d · claude-code-remote · helper-12
    hash_before: a15703c2f38e5e18410d88353dc800fad610482d
    hash_after: a15703c2f38e5e18410d88353dc800fad610482d
    returns: 2
    why: "the reason for a span over one line break holds: the notes wrap their prose at a column, and spans wrap with it in `spec/design_output/bash.md` and other design notes, so a span stopping at a line break draws faults on lines a hand leaves alone; the first bullet goes missing where the next line holds a span: my probe feeds Vale a list item carrying a lone mark and a second item with one span right under it, and the fault lands on the second item's line, because the lone mark takes the opening mark off that line; the case in `test/contract/vale.test.js` puts a blank line between the item and the paragraph, so it passes around that gap, and two items in a row is the common shape; the fix in `snippets.js`: blank a span inside one line first, then a span over one line break, so a lone mark takes no opening mark off the next line; my probe shows that order keeps the wrapped spans and the blank case whole; the case asserts no fault on the paragraph line and every fault on the item's line, and it passes with no fault at all; assert a fault stands on the item's line, because a test asserting nothing passes; `./RUNME.sh check` answers zero on this tip, and the branch test answers green; `./RUNME.sh branch review misc` says the check answers one in its worktree, on a case in `test/contract/vale.test.js` that runs without Vale and fails the same way on the base, so it stands outside this ask; `./RUNME.sh branch review misc` marks the handback retro absent, and the route hands this ticket to a retro after this step; the commits touch the shared blanking, the rule files the project verb writes off it, and the one case, and nothing beyond the ask; the questions above are craft, because the design of one wrapped line stands, and the order of the pairing and the missing assertion go back to the hand; pass; the blanking pairs a span inside one line first, so a lone mark takes no opening mark off the line under it; my probe feeds Vale an item with a lone mark, a blank line and a paragraph with one span, and the one fault names the item's line; my probe feeds Vale two items in a row, and the one fault names the item's line again; my probe feeds Vale a span wrapping over one line break, and no fault stands on either line; a lone mark above a wrapped span draws one fault on its own line, and the wrapped span stays whole; the case in `test/contract/vale.test.js` holds both shapes, and asserts a fault names the item's line and none stands off it; the branch test answers green, and `./RUNME.sh check` answers zero on this tip; `./RUNME.sh branch review misc` says the check answers one in its worktree, on a stub case that fails the same way on the base; `./RUNME.sh branch review misc` marks the handback retro absent, and the route hands this ticket to a retro after this step; the commits touch the shared blanking, the rule files the project verb writes off it, and the one case, and nothing beyond the ask; both findings of the first round are craft, and both land: the order of the passes and the assertion on the item's line"
  - step: implement/reflect
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: 3b25ba2fc795885540047c8a5104c0a9a9260d44
    hash_after: 3b25ba2fc795885540047c8a5104c0a9a9260d44
  - step: implement/change
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: 0c61e0f750d034c2531137af1a8610b4ff3be5ed
    hash_after: 0c61e0f750d034c2531137af1a8610b4ff3be5ed
    answered:
      - name: lint
        exit: 0
        said: 35 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
  - step: implement/tests-green
    hand: box d40a1b367f4d · claude-code-remote
    hash_before: cf82db27ed40f2af2f3ce0e4b56f0f35925bdb28
    hash_after: cf82db27ed40f2af2f3ce0e4b56f0f35925bdb28
    answered:
      - name: tests
        exit: 0
        said: green, 23 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: 35 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
  - step: verdict
    hand: box d40a1b367f4d · claude-code-remote · helper-13
    hash_before: e94777c0d9703e7bc95618e37529c0f7d8693551
    hash_after: e94777c0d9703e7bc95618e37529c0f7d8693551
reason: done
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

The class: a record written in the wrong place. The second round's verdict stood under the first round's lines in the same chapter, so the field's first line still read fail, and the pull took the old word. The fix for the class: a chapter holds one round's fields, and a new round clears the old ones first, because the record in the frontmatter carries them already. The code stands as the second round found it, and no change to it rides this round.


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change stays in the shared blanking, the projected rule files, and the one case
- the case drives Vale itself, and no fake stands in for it
- the comment on the pattern names the order of the two passes and the ticket


## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

./RUNME.sh lint


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change stays in the shared blanking, the projected rule files, and the one case
- the case drives Vale itself, and no fake stands in for it
- the comment on the pattern names the order of the two passes and the ticket


## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

./RUNME.sh branch test test/contract/vale.test.js


### check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check


### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The blanking runs two passes. The first blanks a span inside one line, so a lone mark finds no opening mark on the line under it. The second blanks a span wrapping over one line break, because the notes wrap their prose at a column and a span wraps with it. A lone mark stays unblanked on its own line, and the fault over it names that line. The case feeds both shapes: an item and a paragraph with a blank line between, and two items in a row. It asserts a fault stands on the item's line, and none on the line under it.


### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change stays in the shared blanking, the projected rule files, and the one case
- the case drives Vale itself, and no fake stands in for it
- the comment on the pattern names the order of the two passes and the ticket


# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

- spec/tickets/a-lone-mark-pairs-wrong.md
- spec/guidance/review/reviewing.md
- .claude/skills/level0/lib/snippets.js
- spec/config/styles/VoiceParagraph/Characters.yml
- spec/config/styles/VoiceParagraph/CodeSpans.yml
- spec/config/styles/VoiceParagraph/ListItem.yml
- spec/config/styles/VoiceParagraph/Markup.yml
- spec/config/styles/VoiceParagraph/RestatedTable.yml
- spec/config/styles/VoiceParagraph/Shape.yml
- spec/config/styles/VoiceParagraph/ShapeAnswer.yml
- spec/config/styles/VoiceParagraph/Vocabulary.yml
- test/contract/vale.test.js
- .se/scripts/probe-lone-mark.mjs


## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

pass
- The blanking pairs a span inside one line first, then a span over one line break, so a lone mark takes no opening mark off the line under it.
- The probe feeds Vale an item with a lone mark, a blank line and a paragraph with one span, and the one fault names the item's line.
- The probe feeds Vale two items in a row, and the one fault names the item's line again.
- The probe feeds Vale a span wrapping over one line break, and no fault stands on either line.
- The case in `test/contract/vale.test.js` holds both shapes, asserts a fault names the item's line, and asserts none stands off it.
- The eight rule files under `spec/config/styles/VoiceParagraph` carry the same two lines the shared function writes, and nothing beyond.
- The branch test answers green, and `./RUNME.sh check` answers zero on this tip.
- `./RUNME.sh branch review misc` says the check answers one in its worktree, on a case that runs without Vale and stands outside this ask.
- `./RUNME.sh branch review misc` marks the handback retro absent, and the route hands this ticket to a retro after this step.
- The commits touch the shared blanking, the projected rule files and the one case, and nothing beyond the ask.
- Both craft findings of the first round land, and no design question stands.


## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the two patterns stand once in the shared function in `snippets.js`, the rule files take them off it through the project verb, and the comment on the pattern and the case both point at the ticket instead of repeating the approach


# Discussion

<!-- what anybody adds, at any time, on this ticket -->

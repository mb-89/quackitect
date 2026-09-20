---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
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
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
group: the-battery-earns-its-time
step: do
record:
  - step: do
    hand: box 14d41de46d55 · claude-code-remote
    hash_before: 74c92d02c9168c37b61907e21011a808e6b1aef3
    hash_after: 74c92d02c9168c37b61907e21011a808e6b1aef3
    answered:
      - name: tests
        exit: 0
        said: green, 34 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: The rules pass.
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
A case that proves a rule over one line spawns once over a text of many lines, and asserts the rule a line. A helper the Vale files share holds that shape, so five files write it once.

<!-- breaks, as text: what breaks if it is never done -->
The five Vale files spawn the binary a case a line, and the twins between `vale.test.js` and `paragraph.test.js` prove one rule twice.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- one helper under `test/contract` runs Vale once over a text and answers the findings a line
- the twins the battery reading names in `spec/rationales/effect.md` stand once, which `node --test test/contract/vale.test.js test/contract/paragraph.test.js` decides
- `./RUNME.sh check` is green

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test test/contract/vale.test.js test/contract/paragraph.test.js

## check

    ./RUNME.sh check

## says

The helper `test/contract/ruled.js` is the one place a rule test reaches Vale. A file declares each case with its texts at the top. The first case runs Vale once over every text, and each case reads its findings by key. The chapter A rule test spawns once, under `spec/design_output/doors.md`, says how. The change landed under the sibling ticket on the doors, because its third line needed the whole battery under the bound. This record says what the twins were and where each went.

| rule proven twice | where it stands now |
|---|---|
| Paragraph | `paragraph.test.js`, beside ParagraphAnswer |
| Sentence | `paragraph.test.js`, beside ListItem |
| PastTense | `paragraph.test.js`, with the tense reader over the words this tree means |
| Contraction, Latin | `paragraph.test.js`, beside EtCetera |
| ShapeAnswer, the heading's fresh budget | `paragraph.test.js`, beside the answer's opening |

`vale.test.js` keeps the door case, the VoiceVale rules, the registers a path picks, and the vocabulary. The pair runs in about a second on this box, where each case spawned once a text before.

## checked

- the change follows the ask: one helper, one run a file, and the twins stand once
- the cleanup it reveals, the door case beside the rules, is in the change
- the doors note holds the helper's shape, and both files point at it

# Discussion

The rationale names no twin by rule. This record lists the rules the two files proved twice, read off the files themselves.

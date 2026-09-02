---
id: wk-24be1c06ae
seq: "-28"
type: work
title: a line holds one
status: imp_done
assignee: main
scope: single-step
traced: true
disposition: done
rounds: 10
minted_by: reviewer6
submitted_by: main
evidence:
  - outcome
---

## detail

A string field written to the note as one line loses a newline silently on save. Sweep every written field with a shape table. SaveToken refuses a newline in a one-line field, a delimiter in a heading value, and a section opener in a block, naming the field. Blocks read to the next lead or heading. The walk reflects from Token and the table answers for every field, exclusions included. Related: wk-7f0b46d99f.

## done when

- The walk reflects from Token, and a field the table does not answer for is red by name.
  `rg -q func.TestEveryFieldTheNoteWritesIsRead src/engine && go test -C src/engine -count=1 -run TestEveryFieldTheNoteWritesIsRead$ .`
- A one-line field or map key carrying a newline is refused at save, naming the field.
  `rg -q func.TestALineHoldsOneLine src/engine && go test -C src/engine -count=1 -run TestALineHoldsOneLine$ .`
- A block, Token.Detail and Token.Guidance included, comes back whole.
  `rg -q func.TestABlockComesBackWhole src/engine && go test -C src/engine -count=1 -run TestABlockComesBackWhole$ .`
- Every heading value in the table is refused for the middle dot or a newline.
  `rg -q func.TestAHeadingHoldsNoDelimiter src/engine && go test -C src/engine -count=1 -run TestAHeadingHoldsNoDelimiter$ .`
- Every field is fed the lead, list marker, backtick, section opener, separator and empty.
  `rg -q func.TestTheNoteSurvivesAwkwardValues src/engine && go test -C src/engine -count=1 -run TestTheNoteSurvivesAwkwardValues$ .`
- Truncated findings on disk are not rewritten, only counted.
- The walk count and the table count are derived and equal.
  `rg -q func.TestTheTableAnswersForEveryFieldTheWalkReaches src/engine && go test -C src/engine -count=1 -run TestTheTableAnswersForEveryFieldTheWalkReaches$ .`
- Every block in the table carrying a section opener is refused at save.
  `rg -q func.TestABlockOpensNoSection src/engine && go test -C src/engine -count=1 -run TestABlockOpensNoSection$ .`
- Every test above was watched red with the change absent.

## evidence: outcome

SaveToken refuses through linesThatFit and blocksHoldNoHeading, readFinding reads whole blocks, and shapes_test.go holds theShapes with 38 rows. Each test was watched red by disarming a refusal or shortening the table.

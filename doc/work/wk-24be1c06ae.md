---
id: wk-24be1c06ae
seq: "78"
type: work
title: a line holds one
status: spec_in_review
assignee: main
scope: single-step
traced: true
holder: reviewer6
minted_by: reviewer6
---

## detail

CLASS: A VALUE WHOSE TYPE HOLDS MORE THAN ITS LINE IN THE RECORD, AND A CHECK
THAT ONLY EVER STORES THE EASY VALUE.

A field is added to a struct and given a place in the note: one lead, one line.
The Go type is a string, so it holds anything, including a newline. The line
holds one line. Nothing refuses the mismatch, nothing reports it, and the writer
finds out later or never. The round-trip check is written at the same sitting as
the format, from the same idea of what the value looks like, so it feeds the
format exactly the shape the format survives. It is a true check of a false
assumption.

WHAT MAKES IT WORSE THAN AN ORDINARY BUG. The loss is silent and it happens on
a SAVE, not on the write, so the value is right in memory, right in the answer
the tool prints back, and wrong the next time anybody reads the note. And the
overflow does not vanish quietly: it falls through to whatever else the parser
matches on a bare line.

FOUND ON wk-7f0b46d99f, which exists to stop exactly this. Its own detail says
prose in the done when section is dropped on the next save and that three drafts
lost the sentence that way, so the observation was made a field. The field is
written as one line, src/engine/store.go, and read back by a line prefix,
readCriteria in the same file. Measured against the tree:

  a Red of two lines reads back as its first line, the second silently gone;
  a Red whose second line begins with "- " becomes a NEW criterion -- one
    criterion carrying a three-line observation reads back as three;
  a Says of two lines is truncated the same way;
  a Runs of two lines is lost ENTIRELY, because the closing backtick is on a
    later line, and a criterion whose command is gone is a prose criterion,
    which Watched() answers true for -- so a multi-line command silently turns
    off both gates this token built.

And what a check says when it goes red is multi-line by nature, which is why
every observation written in this project so far is squashed by hand into one
long line with "; and" in the middle of it. The workaround is already in the
record; nothing told anybody it was needed.

WHAT TO DO INSTEAD. When a field goes into a line-oriented record, decide what
happens to a value that does not fit before writing the check, and write the
decision down: fold it onto continuation lines and read them back, or refuse the
value at the gate with a message saying why. Silence is not one of the choices.
Then feed the round-trip check a value the format does NOT obviously survive --
a newline, the lead itself, the delimiter, an empty string -- rather than the
value you had in mind when you designed the line. A round trip fed only what the
writer normally produces is green over a corruption a person can reproduce by
hand; that is the sibling class in doc/guidance/behaviour.md, "A fix in the
caller leaves the defect where it is", and this is the same lesson one step
earlier, at the moment the format is invented.

THE CHECK, RED TODAY: give TestTheObservationSurvivesTheNote a criterion whose
Red is two lines, one of them beginning with "- ", and require it back as one
criterion with both lines. Against the tree as it stands that reads back three
criteria and one line. Do the same for Says and for Runs.


THE DECISION, AND IT IS REFUSE RATHER THAN FOLD.

A folded value invents a continuation syntax. The note is a file a person opens
and edits, and a syntax nobody typed is a syntax somebody gets wrong. It would
also need reading back, which is a second place to be wrong about the same
thing.

SO THE RECORD REFUSES TO HOLD WHAT IT CANNOT READ BACK. Saving a token whose
criterion carries a newline in a one-line field is refused, and the refusal
names the field, the criterion and the line that will not fit. That is the same
shape as every other gate here: the queue refuses rather than reminds.

WHERE IT GOES. SaveToken, because that is the moment the value stops being a
value and becomes a line. A refusal in the caller is a refusal the next caller
does not have, and there are several callers.

WHICH FIELDS. Says, Runs, Without and Red. All four are one lead and one line,
and all four are strings that hold anything. Every other field on a criterion is
a bool or is not written to the note.

WHAT A WORKER DOES INSTEAD. Writes the observation on one line. Where several
lines were seen, they are joined with a separator, which is what carry-red.py
already does. Where that is not enough, the observation names a file and the
evidence carries the whole of it, which is what the token's evidence section is
for.

## done when

- A criterion carrying a newline in a field the note writes on one line is refused when the token is saved, and the refusal names the field and says which criterion
  `rg -q func.TestALineHoldsOneLine src/engine && go test -C src/engine -count=1 -run TestALineHoldsOneLine$ .`
- All four one-line fields are refused, not only the two the lesson was found on, and the check walks a list rather than naming one
  `rg -q func.TestEveryOneLineFieldRefusesASecondLine src/engine && go test -C src/engine -count=1 -run TestEveryOneLineFieldRefusesASecondLine$ .`
- The round trip is fed what the format does not obviously survive rather than what the writer normally produces: the lead itself, the list marker, a backtick, and an empty value, and each reads back as it was written
  `rg -q func.TestTheNoteSurvivesAwkwardValues src/engine && go test -C src/engine -count=1 -run TestTheNoteSurvivesAwkwardValues$ .`
- Every test named above was watched failing on its own assertion, with the change absent, before it was watched passing. The evidence says what was seen and what was taken away each time.


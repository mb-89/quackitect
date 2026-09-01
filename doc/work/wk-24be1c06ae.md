---
id: wk-24be1c06ae
seq: 78
type: work
title: a line holds one
status: spec_in_work
assignee: main
scope: single-step
traced: true
holder: main
rounds: 2
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


THREE SHAPES, AND THE FIELD SAYS WHICH ONE IT IS. Refuse was the right answer
for the shape the lesson was found on and the wrong answer for the shape the
record is actually losing. The boundary is the parser and not the Criterion
struct, so the sweep is over every field the note writes and reads back.

ONE LINE BY DESIGN: Criterion.Says, Criterion.Runs, Criterion.Without,
Criterion.Red. Each is one lead and one line on the page and a person types it
there. A folded continuation syntax nobody typed is a syntax somebody gets
wrong, and it would need reading back, which is a second place to be wrong about
the same thing. So the record refuses to hold what it cannot read back, and the
refusal names the field and which criterion.

A BLOCK BY DESIGN: Rejection.Wrong, Rejection.Satisfies, Lesson.Class,
Lesson.Avoid. These are paragraphs by design and the writer already writes them
whole: body() writes a finding's wrong as its lead followed by the value and a
blank line, and nothing about that write stops it holding several paragraphs.
Only the reader is line-based. So there is no format to invent: readFinding
reads from its lead to the next lead or the next heading rather than to the next
newline, which is what readLesson already does one degree better by splitting on
a blank line. Refusing a newline here would make every review written in this
queue this session illegal.

A VALUE THAT GOES INTO A HEADING: Rejection.Clause. It is joined into a heading
line with the round and the author, split on the middle dot, so it cannot hold
that character or a newline whatever else is decided. That one really is a line,
and it is refused with a message saying which character.

WHAT IS BEING LOST RIGHT NOW, MEASURED ON THE RECORD RATHER THAN PREDICTED. Of
the fourteen findings on the four tokens in this queue, the six written as one
long paragraph survive whole, 939 to 2844 characters. Every one written in
paragraphs is cut to its first. One finding is 85 characters in the record and
was about 1900 when it was sent: the body, the measurements and the reproduction
are gone, and the worker reads one sentence. Another is 196 of about 3900, and
another 528 of about 5000.

SO THE ONE-PARAGRAPH HOUSE STYLE IS NOT A STYLE. It is the same silent
workaround this token was minted about, and nobody using it has been told they
are using it. A truncated observation costs a sentence. A truncated finding
costs the round, because the worker answers the paragraph that survived and the
reviewer re-runs a reproduction the worker never saw.

WHERE EACH HALF GOES. The refusals go in SaveToken, because that is the moment
the value becomes a line and a refusal in one caller is a refusal the next caller
does not have. The block reading goes in readFinding and stays where readLesson
already is, because nothing is being refused there and the writer is already
right.

AND THE NEXT FIELD IS TOLD WHICH SHAPE IT IS CHOOSING. The list above lives in
the detail beside the sweep, so somebody adding a field to this note picks one of
three rather than guessing.

## done when

- One check walks every field the note writes and reads back, names each one and the shape it is, and refuses if it finds none to walk, so it cannot pass by the list having gone
  `rg -q func.TestEveryFieldTheNoteWritesIsRead src/engine && go test -C src/engine -count=1 -run TestEveryFieldTheNoteWritesIsRead$ .`
- A field that is one line by design carrying a newline is refused when the token is saved, and the refusal names the field and which criterion it is on
  `rg -q func.TestALineHoldsOneLine src/engine && go test -C src/engine -count=1 -run TestALineHoldsOneLine$ .`
- A field that is a block by design comes back byte-identical from two paragraphs, from a value carrying a blank line, and from one whose second paragraph begins with a lead this parser reads
  `rg -q func.TestABlockComesBackWhole src/engine && go test -C src/engine -count=1 -run TestABlockComesBackWhole$ .`
- A clause carrying the character its heading is split on, or a newline, is refused, and the refusal says which character
  `rg -q func.TestAHeadingHoldsNoDelimiter src/engine && go test -C src/engine -count=1 -run TestAHeadingHoldsNoDelimiter$ .`
- Every field is fed what the format does not obviously survive rather than what the writer normally produces: the lead itself, the list marker, a backtick, the heading delimiter, and an empty value
  `rg -q func.TestTheNoteSurvivesAwkwardValues src/engine && go test -C src/engine -count=1 -run TestTheNoteSurvivesAwkwardValues$ .`
- The findings already on disk that were truncated are not rewritten, because a finding says what a reviewer sent on the day and the engine cannot invent what it dropped. The evidence says how many were counted and what a reader of one of them sees
- Every test named above was watched failing on its own assertion, with the change absent, before it was watched passing. The evidence says what was seen and what was taken away each time.

## finding 1 · round 1 · done when: All four one-line fields are refused, not only the two the lesson was found on, and the check walks a list rather than naming one / detail: WHICH FIELDS. Says, Runs, Without and Red · by reviewer6

**wrong:** THE EXTENT IS THE REVIEWER'S SAMPLE, NOT A SWEEP, AND THE FIELDS IT MISSES ARE LOSING DATA TODAY. Criterion 2 says "All four one-line fields are refused, not only the two the lesson was found on, and the check walks a list rather than naming one", and the detail's WHICH FIELDS says "Says, Runs, Without and Red. All four are one lead and one line, and all four are strings that hold anything. Every other field on a criterion is a bool or is not written to the note." That last sentence is true and it is the wrong boundary: the boundary is the parser, not the Criterion struct. The same file, src/engine/store.go, reads a finding's Wrong and Satisfies in readFinding at :296 by splitting on a single newline and matching a line prefix, so each is truncated at its FIRST newline; reads a finding's Clause out of the heading at :284 by splitting on the middle dot, so a clause carrying that character or a newline corrupts the heading; and reads a lesson's Class and Avoid in readLesson at :243 by splitting on a blank line, so each is truncated at its first blank line. MEASURED ON THE RECORD, NOT PREDICTED. I read all fourteen findings on the four tokens in this queue and counted what survives in the note: the six reviewer4 and reviewer5 wrote as one long paragraph survive whole, 939 to 2844 characters; every one written in paragraphs is cut to its first. My own finding 2 on wk-7f0b46d99f is 85 characters in the record and was about 1900 when it was sent -- the entire body, the measurements and the reproduction are gone and the worker will read one sentence. Finding 1 on wk-c22f29af7b is 196 characters of about 3900. Finding 4 on wk-c6247665a3, written an hour ago, is 528 of about 5000. The one-paragraph house style the other reviewers use is not a style, it is the same silent workaround this token's own detail describes for observations -- "squashed by hand into one long line" -- and nobody has been told they are using it. SO THE SEVERE HALF OF THE CLASS IS OUTSIDE THE DRAFT. A truncated observation costs a sentence; a truncated finding costs the round, because the worker answers the one paragraph that survived and the reviewer re-runs a reproduction the worker never saw. This is not a new defect I am introducing to the draft: it is the same parser, the same file and the same class the token was minted for, and the draft's own word is all four.

**satisfies:** SWEEP THE PARSER AND SAY WHAT THE SWEEP ANSWERED. Before agreeing this draft, walk every field readBody and its helpers put back -- readCriteria, readFinding, readLesson -- and list them in the detail with the shape each one has and the count you got, the way the criteria already name four. The list I got in one pass is seven: Criterion.Says, Criterion.Runs, Criterion.Without, Criterion.Red, Rejection.Wrong, Rejection.Satisfies and Rejection.Clause, plus Lesson.Class and Lesson.Avoid which are block-read and lose only at a blank line. Then widen criterion 2 to that list rather than to four, and widen criterion 3's awkward values to include the delimiter the heading is split on, because Clause goes into a heading and the others do not. THE CHECK, RED TODAY, AND IT CATCHES THE CLASS RATHER THAN THE FOUR FIELDS: one test that walks every field the note writes and reads back, writes an awkward value into it -- a newline, a blank line, the lead itself, the heading delimiter, a backtick, an empty string -- saves, loads, and requires it back byte-identical or refused with a message naming the field. Against the tree as it stands that is red on Wrong, on Satisfies and on Clause as well as on the four the draft names, which is the difference between the sweep and the sample, and it stays red for a field added next month that nobody remembered to list.

## finding 2 · round 1 · detail: THE DECISION, AND IT IS REFUSE RATHER THAN FOLD / WHERE IT GOES. SaveToken, because that is the moment the value stops being a value and becomes a line · by reviewer6

**wrong:** ONE REMEDY IS CHOSEN AGAINST ONE SHAPE AND WRITTEN AS THE RULE FOR ALL OF THEM. The detail's THE DECISION, AND IT IS REFUSE RATHER THAN FOLD is a good decision for a field that is one line by design: a criterion's Says and Runs are one line on the page, a person types them there, and a folded continuation syntax nobody typed is a syntax somebody gets wrong. I agree it for those four. It is the wrong answer for a finding's Wrong and Satisfies, and that matters because those are where the loss is worst. They are not one-line fields that happen to hold a newline; they are paragraphs by design, and body() already writes them as a block, "**wrong:** " + f.Wrong + "\n\n", with nothing about that write that cannot hold several paragraphs. Only the reader is line-based. So there is no format to invent and nothing for a person to get wrong: readFinding has to read to the next lead or the next heading instead of to the next newline, which is what readLesson at :243 already does one degree better by splitting on a blank line. A rule that refused a newline in Wrong would make every review written in this queue this session illegal, mine and reviewer4's alike, and would push reviewers further into the one-paragraph workaround rather than out of it. AND WHERE IT GOES IS WRONG FOR THE SAME REASON. The detail says SaveToken, because that is the moment the value becomes a line. For a criterion that is right. For a finding it would mean a reviewer's whole verdict is refused at the record layer, surfacing through Pull's SaveToken error path as clause "the record" and satisfies "a writable .se/work", which names neither the field nor what to do -- and the reviewer has no way to know which of two long fields carried the newline.

**satisfies:** DECIDE PER SHAPE, AND WRITE THE THREE SHAPES INTO THE DETAIL. One line by design -- Says, Runs, Without, Red: refuse a newline, as drafted, with the refusal naming the field and the criterion. I agree that half as it stands and it does not need re-arguing. A block by design -- Wrong, Satisfies, and Class and Avoid: read them back whole rather than refusing them, because the writer already writes them whole and the reader is the only half that is wrong. Concretely, readFinding reads from its lead to the next lead or the next heading instead of one line, and criterion 3 then requires a two-paragraph Wrong back byte-identical. A value that goes into a heading -- Clause: it is split on the middle dot and joined into a line with the round and the author, so it cannot hold that character or a newline whatever else is decided; refuse it there, and say so, because that one really is a line. SAY WHICH SHAPE EACH FIELD IS IN THE DETAIL, beside the sweep, so the next person adding a field to this note is told which of the three they are choosing rather than guessing. AND WATCH THE BLOCK HALF FAIL BEFORE FIXING IT: write a finding whose wrong is two paragraphs, save, load, and it comes back as the first paragraph today. That is the red, and it is the one the record is losing rounds to.

## finding 3 · round 2 · done when: One check walks every field the note writes and reads back, names each one and the shape it is, and refuses if it finds none to walk, so it cannot pass by the list having gone · by reviewer6

**wrong:** THE WALK IS OVER A LIST, AND THE LIST IS A PHOTOGRAPH OF THE SET. Criterion 1 says "One check walks every field the note writes and reads back, names each one and the shape it is, and refuses if it finds none to walk, so it cannot pass by the list having gone", and the detail's three-shape sweep names nine: Says, Runs, Without, Red, Wrong, Satisfies, Class, Avoid, Clause. Nine is right today and I checked it rather than taking it. The anti-vacuity guard catches the list being emptied and says nothing about the list being short, and short is the only way this list ever goes wrong. THE NEXT FIELD IS THE WHOLE POINT OF THIS TOKEN. It exists because somebody added Without and Red to a struct, gave them a line on the page, and nobody asked what a value that does not fit does. With a hand list of nine, the tenth field is added, is not walked, is not fed an awkward value, and is not asked which of the three shapes it is -- and nothing goes red, which is the same silence the token was minted about. The token would fail at its own purpose one field later. AND THE STRUCTS ALREADY CARRY ONE THE LIST DOES NOT NAME. Criterion has Ran, a string, and Met, a bool; neither is written to the note and neither is read back, and rg over src/engine finds no writer or reader for either, so they are dead rather than lossy. That is the right answer for them and it is not the point: the point is that a reader of the list cannot tell an exclusion from an oversight, because a hand list has no way to record either. EXTENT, one pass over what the note writes and reads: three structs, Criterion, Rejection and Lesson, all three declared in src/engine/token.go and src/engine/spec.go and all three walked by src/engine/store.go. Go can enumerate every one of their string fields with reflect, so the set is not merely knowable, it is already written down in the language, and the check is being asked to keep a second copy of it by hand. This is wk-10d3cf13cd's class one step out -- a command about a sample rather than a set -- which is why the criterion reads as though it had already answered it: it does iterate, and it fails on the first miss, but it iterates the list and the sentence is about the fields.

**satisfies:** MAKE THE WALK ASK THE STRUCTS. TestEveryFieldTheNoteWritesIsRead takes every exported string field of Criterion, Rejection and Lesson with reflect, requires each to appear in the shape table -- one line by design, a block by design, into a heading -- and fails naming any field the table does not answer for. Put the deliberate exclusions in the table with their answer written down, so Ran and Met read as decided rather than missed, and so does whatever is added next. THE CHECK, RED TODAY, AND IT IS THE SAME TEST: with the table as drafted and the walk reflective, Ran and Met are unnamed and it goes red now; name them as not written to the note and it goes green. Then it goes red again on the commit that adds an eleventh field, which is the moment the whole token exists for, and the message tells that author which of three shapes they are choosing rather than leaving them to find out from a truncated record. ONE WORD IN THE CRITERION FOLLOWS FROM IT: say that the walk is taken from the structs rather than from a list, so the sentence and the command are about the same set and a later reader cannot satisfy it with nine strings in a slice. WHAT IS CLOSED AND MUST NOT BE REOPENED, because this round did it properly and I checked all of it. The sweep is real and its boundary is now the parser: three shapes, nine fields, with which reader does what to each. The measurement of what is being lost is in the detail and it matches what I counted independently -- six one-paragraph findings surviving at 939 to 2844 characters, and every paragraphed one cut to its first, 85 of about 1900 in the worst case. The decision to read a block whole rather than refuse a newline in it is right and is the half I asked for, and the reasoning that the writer is already correct and only the reader is line-based is exactly right. Refusing the heading delimiter on Clause is right. And criterion 6, that truncated findings already on disk are not rewritten because the engine cannot invent what it dropped, is a good call nobody asked for. All five commands are red today, which is what a draft before its work looks like: I ran run-criteria.py and got 5 red, 0 green.

## lesson 1 · round 1 · by reviewer6

**the class:** AN EXTENT INHERITED FROM THE FINDING THAT REPORTED IT, RATHER THAN MEASURED AGAINST THE FILE. A reviewer's finding names the places it happened to look. The drafter reads the finding, writes those places into the criteria, and the criteria then say all of them about a set the reviewer drew and nobody re-swept. The sample becomes the extent silently, because the draft now carries the word every and a list, which reads exactly like a measurement. The tell is that the list stops at a struct boundary or a package boundary rather than at the boundary of the thing that has the defect: ask what draws the line, and if the answer is the finding rather than the parser, it is a quotation and not an extent. And the remedy inherits it too -- a rule chosen for the shape of the instance is applied to the whole set, and the set turns out to hold things of another shape for which the rule is wrong. On wk-24be1c06ae the draft names four one-line fields on a criterion; the parser those four live under also truncates a finding's wrong and satisfies at the first newline and splits a clause into a heading, and of fourteen findings in the record every one written in paragraphs is cut to its first, 85 characters of 1900 in one case.

**instead:** When a draft turns a finding into criteria, re-sweep the file the defect lives in before writing the word every, and put the sweep in the draft: which function, which file, how many, and the list. One pass over the parser, not over the finding. Then group what the sweep found by shape before choosing a remedy, because one answer rarely fits all of them -- here, one line by design, a block by design, and a value that goes into a delimited heading are three problems wanting three answers, and the rule that is right for the first would have outlawed every review in the queue if applied to the second. The method already tells a reviewer that a finding is a sample of the defect and never its extent; the same sentence belongs to whoever drafts from it, because the drafter is the one whose criteria will say all.

**minted as:** wk-ce5d6865e4

## lesson 2 · round 2 · by reviewer6

**the class:** A HAND-WRITTEN LIST STANDING IN FOR A SET THE LANGUAGE CAN ENUMERATE. A check is written over every member of a set and the members are typed into the check. It is complete on the day it is written, it iterates, it fails on the first miss, and it looks exactly like the remedy for wk-10d3cf13cd, a command about one member of a set. It is that mistake one step out: the command walks a set, but not the set the sentence is about. It walks the list, and the list is a photograph of the set taken once. It stays green when a member is added, which is the only moment it was ever needed, and an anti-vacuity guard does not help, because refusing an empty list catches deletion and never shortness. The tell is where the set is defined: if that is a struct, an enum, a directory or a JSON file, the language or the tree can hand you the members and the check should ask for them; if the answer is "in the check", the check is the only place that knows and it will go on being right about a world that has moved. On wk-24be1c06ae the set is every string field of three structs, Go can enumerate it with reflect, and the draft asks a test to keep a second copy of it by hand -- in a token whose entire subject is a field added to a record with nobody asking what happens to it.

**instead:** Before writing a list into a check, ask where the set is really defined and whether the language or the tree can hand it to you. If it can, take it from there -- reflect over the struct, read the directory, parse the JSON -- so the check goes red on the commit that adds a member rather than on the incident that follows, and so its message tells that author what they now have to decide. Keep deliberate exclusions in the same table with their reason written beside them, because a hand list cannot tell an exclusion from an oversight and the next reader will have to guess. And when a criterion says every, ask not only whether the command iterates but whether it iterates the same set the sentence names: iterating a list you wrote is still a sample if the set can grow.

**minted as:** wk-02e17b9eb4


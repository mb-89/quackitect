---
id: wk-24be1c06ae
seq: "-28"
type: work
title: a line holds one
status: spec_in_work
assignee: main
scope: single-step
traced: true
holder: main
rounds: 6
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


THE WALK ASKS THE STRUCTS, WHICH IS ROUND TWO'S FINDING AND IT IS RIGHT. A hand
list of nine is a photograph of the set. The anti-vacuity guard catches the list
being emptied and says nothing about it being short, and short is the only way
this list ever goes wrong.

THE NEXT FIELD IS THE WHOLE POINT OF THIS TOKEN. It exists because somebody
added two fields to a struct, gave them a line on the page, and nobody asked
what a value that does not fit does. With a hand list, the tenth field is added,
is not walked, is not fed an awkward value, and nothing goes red. The token
would fail at its own purpose one field later.

SO THE TABLE ANSWERS FOR EVERY FIELD, INCLUDING THE ONES IT EXCLUDES.
Criterion.Ran and Criterion.Met are written to the note by nothing and read back
by nothing, so they are dead rather than lossy. That is the right answer for
them, and a reader of a hand list cannot tell that answer from an oversight. In
the table it is written down.

THE FIVE SHAPES, AND WHICH FIELD IS WHICH. DERIVED BY RUNNING THE WALK AT
96d9404e RATHER THAN BY ADDING THE NAMES THE LAST FINDINGS USED. Reflecting over
Token and following exported string fields, exported struct fields, exported
slice-of-struct fields and exported map-of-string values arrives at 32, and the
table below answers for 32. The two numbers are a criterion, so the next
reviewer holds the size of the derived set against the size of the declared one
instead of reading the word every.

    one line by design   Criterion.Says, Criterion.Runs, Criterion.Without,
                         Criterion.Red, Token.GuidanceRef
    a block by design    Rejection.Wrong, Rejection.Satisfies, Lesson.Class,
                         Lesson.Avoid, Lesson.Learned, Token.Detail,
                         Token.Guidance, and every map of string the note writes
                         as a body section, which is Token.Submission and
                         Token.Rewatched today
    into a heading       Rejection.Clause, Rejection.By, Lesson.By
    in the frontmatter   Token.ID, Token.Title, Token.Status, Token.Assignee,
                         Token.Scope, Token.Disposition, Token.Reason,
                         Token.AbortedFrom, Token.Holder, Token.Bucket,
                         Token.Parent, Token.MintedBy, Token.Evidence.Script
    not on the page      Criterion.Ran, Lesson.Token

A ROW FOR THE KIND AND NOT FOR THE MEMBER, where there is a kind. Every map of
string the note writes as a body section is one row, because the last round
answered the member a finding named and never asked what kind it was, and the
second member of that kind, Token.Rewatched, joined the record two hours later
without joining the table. A third one is covered before it exists.

THE FOURTH SHAPE IS THE FRONTMATTER, AND NOTHING IS REFUSED THERE. front() in
store.go hands thirteen strings to the frontmatter writer, which holds a value
whole and quotes what needs quoting, so a newline in one of them is written and
read back rather than cut. They are named here because a table that answered for
nineteen fields and left thirteen out would leave a reader unable to tell an
answer from an omission, which is this token's whole subject.

Criterion.Met is a bool on Criterion and the walk never reaches it, so it has no
row. That is said here so a reader can tell it from an oversight.

WHERE THE WALK STOPS, AND THE BOUNDARY IS CLOSED RATHER THAN LEFT TO GUESS. It
follows exported string fields, exported struct fields, exported slice-of-struct
fields and exported map-of-string values, because those are the four things
store.go writes to the note. It does not follow unexported fields, integers,
booleans or times, because none of those is written as prose a parser reads
back. A reviewer who disagrees with that boundary can say so about a list rather
than about an omission.

TWO MORE BLOCKS, AND THEY ARE LOSING DATA TODAY. Token.Detail and Token.Guidance
are body sections read by the same parser, headDetail and headGuidance in
store.go beside headFinding, and a detail whose second paragraph opens a section
reads back as the first paragraph alone. A detail quoting one of this note's own
section names is what a lesson token is made of, so this is the ordinary case
rather than an odd one.

AND THE WALK STARTS FROM Token AND FOLLOWS THE GRAPH. Three struct names typed
into the check is a hand list of types where round 2 removed a hand list of
fields. Reflect over Token and recurse into its exported struct and
slice-of-struct fields, so Criterion, Rejection and Lesson are reached because
the record reaches them, and a fourth type given a section is reached the same
way.

A LINE THAT OPENS A SECTION INSIDE A BLOCK IS REFUSED, and this is the decision
the last round left unmade. A block reads to the next lead or the next heading,
so a value carrying a line that begins a section still truncates, by design and
in silence, which is the one outcome this token forbids. Three answers were
open: refuse it, escape it on the way out and undo that on the way in, or accept
the loss and say so. IT IS REFUSED, AT SaveToken, the way a one-line field is,
with a message naming the field and saying a block cannot carry a line that
opens a section. Escaping was the other candidate and it loses on the same
ground the block decision was taken on: a person reads and edits these notes in
an editor, and a value that is written differently from how it was typed is a
value somebody re-types wrongly. Accepting was never open, because silence is
what this token exists to end. THE COST IS SMALL AND IT IS SAID HERE SO NOBODY
HAS TO REDISCOVER IT: a reviewer quoting a section name has to indent that line
or run it into the sentence, and the refusal tells them so at the moment they
save rather than after the record has eaten it.

TWO CHARACTERS, NAMED SEPARATELY, because one word for both was ambiguous. THE
SECTION OPENER is the two hashes and a space that begin a heading line, and it
is what truncates a block. THE HEADING SEPARATOR is the middle dot that joins a
clause to its round and its author, and it is what a clause cannot carry.

## done when

- The walk starts from Token and follows what the record writes: exported string fields, and into exported struct fields, exported slice-of-struct fields and exported map-of-string values, so Criterion, Rejection, Lesson, Token.Submission and Token.Rewatched are all reached because the record reaches them. Every string field the walk arrives at must appear in the shape table, and one the table does not answer for makes it red by name. A deliberate exclusion is written into the table with its answer, so a reader can tell one from an oversight
  `rg -q func.TestEveryFieldTheNoteWritesIsRead src/engine && go test -C src/engine -count=1 -run TestEveryFieldTheNoteWritesIsRead$ .`
- A field that is one line by design carrying a newline is refused when the token is saved, and the refusal names the field and which criterion it is on
  `rg -q func.TestALineHoldsOneLine src/engine && go test -C src/engine -count=1 -run TestALineHoldsOneLine$ .`
  **red without** the linesThatFit refusal taken out of SaveToken, and separately runs left out of the fields it walks
  **red said** TestALineHoldsOneLine: a criterion whose says is two lines was written, and three more, one per field
- A field that is a block by design comes back byte-identical from two paragraphs, from a value carrying a blank line, and from one whose second paragraph begins with a lead this parser reads. Token.Detail and Token.Guidance are among the blocks the check feeds, because the same parser writes and reads them
  `rg -q func.TestABlockComesBackWhole src/engine && go test -C src/engine -count=1 -run TestABlockComesBackWhole$ .`
- EVERY value the note joins into a heading is refused when it carries the heading separator, which is the middle dot, or a newline, and the refusal names the field and the character. The set is the one the table names under into a heading, and the check takes it from there rather than asserting it of the clause alone
  `rg -q func.TestAHeadingHoldsNoDelimiter src/engine && go test -C src/engine -count=1 -run TestAHeadingHoldsNoDelimiter$ .`
- Every field is fed what the format does not obviously survive rather than what the writer normally produces: the lead itself, the list marker, a backtick, the section opener, the heading separator, and an empty value
  `rg -q func.TestTheNoteSurvivesAwkwardValues src/engine && go test -C src/engine -count=1 -run TestTheNoteSurvivesAwkwardValues$ .`
- The findings already on disk that were truncated are not rewritten, because a finding says what a reviewer sent on the day and the engine cannot invent what it dropped. The evidence says how many were counted and what a reader of one of them sees
- The number the walk arrives at and the number the table answers for are the same number, derived at check time rather than read off the detail, and the check refuses when the walk arrives at none. It is 32 at 96d9404e and the detail says so beside the table
  `rg -q func.TestTheTableAnswersForEveryFieldTheWalkReaches src/engine && go test -C src/engine -count=1 -run TestTheTableAnswersForEveryFieldTheWalkReaches$ .`
- A block carrying a line that opens a section is refused when the token is saved, and the refusal names the field and says a block cannot carry a line that opens a section. It is refused on every block the table names, and the check takes that set from the table rather than from the two the finding was found on, so Token.Rewatched and Lesson.Learned are covered by the same run
  `rg -q func.TestABlockOpensNoSection src/engine && go test -C src/engine -count=1 -run TestABlockOpensNoSection$ .`
- Every test named above was watched failing on its own assertion, with the change absent, before it was watched passing. For the walk the red is taken once per answer rather than once for the criterion: the Token.Rewatched row deleted and the walk naming Token.Rewatched, a Rewatched value whose second paragraph opens a section coming back as its first, a Lesson.Learned of two paragraphs coming back as one, and one exported string field added to Token with the table left alone. For the heading refusal the red is taken once per member, a middle dot put into Rejection.Clause, Rejection.By and Lesson.By in turn, and each red names that field. The evidence says what was seen and what was taken away each time

## finding 1 · round 1 · done when: All four one-line fields are refused, not only the two the lesson was found on, and the check walks a list rather than naming one / detail: WHICH FIELDS. Says, Runs, Without and Red · by reviewer6

**wrong:** THE EXTENT IS THE REVIEWER'S SAMPLE, NOT A SWEEP, AND THE FIELDS IT MISSES ARE LOSING DATA TODAY. Criterion 2 says "All four one-line fields are refused, not only the two the lesson was found on, and the check walks a list rather than naming one", and the detail's WHICH FIELDS says "Says, Runs, Without and Red. All four are one lead and one line, and all four are strings that hold anything. Every other field on a criterion is a bool or is not written to the note." That last sentence is true and it is the wrong boundary: the boundary is the parser, not the Criterion struct. The same file, src/engine/store.go, reads a finding's Wrong and Satisfies in readFinding at :294 by splitting on a single newline and matching a line prefix, so each is truncated at its FIRST newline; reads a finding's Clause out of the heading at :297 by splitting on the middle dot, so a clause carrying that character or a newline corrupts the heading; and reads a lesson's Class and Avoid in readLesson at :244 by splitting on a blank line, so each is truncated at its first blank line. MEASURED ON THE RECORD, NOT PREDICTED. I read all fourteen findings on the four tokens in this queue and counted what survives in the note: the six reviewer4 and reviewer5 wrote as one long paragraph survive whole, 939 to 2844 characters; every one written in paragraphs is cut to its first. My own finding 2 on wk-7f0b46d99f is 85 characters in the record and was about 1900 when it was sent -- the entire body, the measurements and the reproduction are gone and the worker will read one sentence. Finding 1 on wk-c22f29af7b is 196 characters of about 3900. Finding 4 on wk-c6247665a3, written an hour ago, is 528 of about 5000. The one-paragraph house style the other reviewers use is not a style, it is the same silent workaround this token's own detail describes for observations -- "squashed by hand into one long line" -- and nobody has been told they are using it. SO THE SEVERE HALF OF THE CLASS IS OUTSIDE THE DRAFT. A truncated observation costs a sentence; a truncated finding costs the round, because the worker answers the one paragraph that survived and the reviewer re-runs a reproduction the worker never saw. This is not a new defect I am introducing to the draft: it is the same parser, the same file and the same class the token was minted for, and the draft's own word is all four.

**satisfies:** SWEEP THE PARSER AND SAY WHAT THE SWEEP ANSWERED. Before agreeing this draft, walk every field readBody and its helpers put back -- readCriteria, readFinding, readLesson -- and list them in the detail with the shape each one has and the count you got, the way the criteria already name four. The list I got in one pass is seven: Criterion.Says, Criterion.Runs, Criterion.Without, Criterion.Red, Rejection.Wrong, Rejection.Satisfies and Rejection.Clause, plus Lesson.Class and Lesson.Avoid which are block-read and lose only at a blank line. Then widen criterion 2 to that list rather than to four, and widen criterion 3's awkward values to include the delimiter the heading is split on, because Clause goes into a heading and the others do not. THE CHECK, RED TODAY, AND IT CATCHES THE CLASS RATHER THAN THE FOUR FIELDS: one test that walks every field the note writes and reads back, writes an awkward value into it -- a newline, a blank line, the lead itself, the heading delimiter, a backtick, an empty string -- saves, loads, and requires it back byte-identical or refused with a message naming the field. Against the tree as it stands that is red on Wrong, on Satisfies and on Clause as well as on the four the draft names, which is the difference between the sweep and the sample, and it stays red for a field added next month that nobody remembered to list.

## finding 2 · round 1 · detail: THE DECISION, AND IT IS REFUSE RATHER THAN FOLD / WHERE IT GOES. SaveToken, because that is the moment the value stops being a value and becomes a line · by reviewer6

**wrong:** ONE REMEDY IS CHOSEN AGAINST ONE SHAPE AND WRITTEN AS THE RULE FOR ALL OF THEM. The detail's THE DECISION, AND IT IS REFUSE RATHER THAN FOLD is a good decision for a field that is one line by design: a criterion's Says and Runs are one line on the page, a person types them there, and a folded continuation syntax nobody typed is a syntax somebody gets wrong. I agree it for those four. It is the wrong answer for a finding's Wrong and Satisfies, and that matters because those are where the loss is worst. They are not one-line fields that happen to hold a newline; they are paragraphs by design, and body() already writes them as a block, "**wrong:** " + f.Wrong + "\n\n", with nothing about that write that cannot hold several paragraphs. Only the reader is line-based. So there is no format to invent and nothing for a person to get wrong: readFinding has to read to the next lead or the next heading instead of to the next newline, which is what readLesson at :244 already does one degree better by splitting on a blank line. A rule that refused a newline in Wrong would make every review written in this queue this session illegal, mine and reviewer4's alike, and would push reviewers further into the one-paragraph workaround rather than out of it. AND WHERE IT GOES IS WRONG FOR THE SAME REASON. The detail says SaveToken, because that is the moment the value becomes a line. For a criterion that is right. For a finding it would mean a reviewer's whole verdict is refused at the record layer, surfacing through Pull's SaveToken error path as clause "the record" and satisfies "a writable .se/work", which names neither the field nor what to do -- and the reviewer has no way to know which of two long fields carried the newline.

**satisfies:** DECIDE PER SHAPE, AND WRITE THE THREE SHAPES INTO THE DETAIL. One line by design -- Says, Runs, Without, Red: refuse a newline, as drafted, with the refusal naming the field and the criterion. I agree that half as it stands and it does not need re-arguing. A block by design -- Wrong, Satisfies, and Class and Avoid: read them back whole rather than refusing them, because the writer already writes them whole and the reader is the only half that is wrong. Concretely, readFinding reads from its lead to the next lead or the next heading instead of one line, and criterion 3 then requires a two-paragraph Wrong back byte-identical. A value that goes into a heading -- Clause: it is split on the middle dot and joined into a line with the round and the author, so it cannot hold that character or a newline whatever else is decided; refuse it there, and say so, because that one really is a line. SAY WHICH SHAPE EACH FIELD IS IN THE DETAIL, beside the sweep, so the next person adding a field to this note is told which of the three they are choosing rather than guessing. AND WATCH THE BLOCK HALF FAIL BEFORE FIXING IT: write a finding whose wrong is two paragraphs, save, load, and it comes back as the first paragraph today. That is the red, and it is the one the record is losing rounds to.

## finding 3 · round 2 · done when: One check walks every field the note writes and reads back, names each one and the shape it is, and refuses if it finds none to walk, so it cannot pass by the list having gone · by reviewer6

**wrong:** THE WALK IS OVER A LIST, AND THE LIST IS A PHOTOGRAPH OF THE SET. Criterion 1 says "One check walks every field the note writes and reads back, names each one and the shape it is, and refuses if it finds none to walk, so it cannot pass by the list having gone", and the detail's three-shape sweep names nine: Says, Runs, Without, Red, Wrong, Satisfies, Class, Avoid, Clause. Nine is right today and I checked it rather than taking it. The anti-vacuity guard catches the list being emptied and says nothing about the list being short, and short is the only way this list ever goes wrong. THE NEXT FIELD IS THE WHOLE POINT OF THIS TOKEN. It exists because somebody added Without and Red to a struct, gave them a line on the page, and nobody asked what a value that does not fit does. With a hand list of nine, the tenth field is added, is not walked, is not fed an awkward value, and is not asked which of the three shapes it is -- and nothing goes red, which is the same silence the token was minted about. The token would fail at its own purpose one field later. AND THE STRUCTS ALREADY CARRY ONE THE LIST DOES NOT NAME. Criterion has Ran, a string, and Met, a bool; neither is written to the note and neither is read back, and rg over src/engine finds no writer or reader for either, so they are dead rather than lossy. That is the right answer for them and it is not the point: the point is that a reader of the list cannot tell an exclusion from an oversight, because a hand list has no way to record either. EXTENT, one pass over what the note writes and reads: three structs, Criterion, Rejection and Lesson, all three declared in src/engine/token.go and src/engine/spec.go and all three walked by src/engine/store.go. Go can enumerate every one of their string fields with reflect, so the set is not merely knowable, it is already written down in the language, and the check is being asked to keep a second copy of it by hand. This is wk-10d3cf13cd's class one step out -- a command about a sample rather than a set -- which is why the criterion reads as though it had already answered it: it does iterate, and it fails on the first miss, but it iterates the list and the sentence is about the fields.

**satisfies:** MAKE THE WALK ASK THE STRUCTS. TestEveryFieldTheNoteWritesIsRead takes every exported string field of Criterion, Rejection and Lesson with reflect, requires each to appear in the shape table -- one line by design, a block by design, into a heading -- and fails naming any field the table does not answer for. Put the deliberate exclusions in the table with their answer written down, so Ran and Met read as decided rather than missed, and so does whatever is added next. THE CHECK, RED TODAY, AND IT IS THE SAME TEST: with the table as drafted and the walk reflective, Ran and Met are unnamed and it goes red now; name them as not written to the note and it goes green. Then it goes red again on the commit that adds an eleventh field, which is the moment the whole token exists for, and the message tells that author which of three shapes they are choosing rather than leaving them to find out from a truncated record. ONE WORD IN THE CRITERION FOLLOWS FROM IT: say that the walk is taken from the structs rather than from a list, so the sentence and the command are about the same set and a later reader cannot satisfy it with nine strings in a slice. WHAT IS CLOSED AND MUST NOT BE REOPENED, because this round did it properly and I checked all of it. The sweep is real and its boundary is now the parser: three shapes, nine fields, with which reader does what to each. The measurement of what is being lost is in the detail and it matches what I counted independently -- six one-paragraph findings surviving at 939 to 2844 characters, and every paragraphed one cut to its first, 85 of about 1900 in the worst case. The decision to read a block whole rather than refuse a newline in it is right and is the half I asked for, and the reasoning that the writer is already correct and only the reader is line-based is exactly right. Refusing the heading delimiter on Clause is right. And criterion 6, that truncated findings already on disk are not rewritten because the engine cannot invent what it dropped, is a good call nobody asked for. All five commands are red today, which is what a draft before its work looks like: I ran run-criteria.py and got 5 red, 0 green.

## finding 4 · round 3 · done when, criterion 1: The walk is taken from the structs rather than from a list: every exported string field of Criterion, Rejection and Lesson is read with reflect · by reviewer8

**wrong:** The walk is narrower than the boundary the detail draws, and the two fields it leaves out are losing data today. The detail says "The boundary is the parser and not the Criterion struct, so the sweep is over every field the note writes and reads back", and criterion 1 walks "every exported string field of Criterion, Rejection and Lesson". Token's own body fields are written to the note and read back from it by the same parser and are in neither list: store.go declares headDetail and headGuidance beside headFinding and headLesson, so Token.Detail and Token.Guidance are body sections exactly as a finding is. I measured them rather than reasoning about them, in a copy of src/engine so this tree was not touched: a token whose Detail is "the token says", a blank line, a line beginning with two hashes and the words done when, a blank line, and "and then more" is saved without complaint and reads back as "the token says" alone. The same with a line naming a finding heading, the same with a lesson heading, and the same for Guidance. Everything after that line is gone on the save, which is this token's own sentence -- the loss is silent and it happens on a SAVE, not on the write. That is not a hypothetical shape: a detail quoting one of this note's own section names is what every lesson token in this queue is made of, and my own rejections quote them. The narrowing is also the round 2 finding one rung up: three struct names typed into the check is a hand list of types where there was a hand list of fields, so a fourth type given a section in the note, or a new string field on Token, joins the note without joining the walk and nothing goes red -- which the detail itself calls the whole point, "the token would fail at its own purpose one field later".

**satisfies:** Make the walk start from the type the record is written from and follow the graph, rather than from three names. Reflect over Token's exported string fields and recurse into its exported struct and slice-of-struct fields, so Criterion, Rejection and Lesson are reached because the record reaches them and a fourth type added later is reached the same way; require every string field the walk arrives at to appear in the shape table and fail by name on one that does not. Then give Token.Detail and Token.Guidance their answer in the table: they are blocks by design and the reader stops at the next heading, so either say they are refused when they carry a heading line, or say the loss is accepted and why, but write the decision down, because the detail's own rule is that silence is not one of the choices. And run it against the case that decides it before agreeing the criterion: add a string field to Token, or a fourth struct with a section in the note, and watch the walk name it. If it stays green, the walk is over three names and not over the record.

## finding 5 · round 3 · done when, criterion 3: A field that is a block by design comes back byte-identical from two paragraphs, from a value carrying a blank line, and from one whose second paragraph begins with a lead this parser reads · by reviewer8

**wrong:** The block half leaves one value undecided, and it is the value this queue actually writes. The detail's fix is that "readFinding reads from its lead to the next lead or the next heading rather than to the next newline", so a block field carrying a heading line will still be cut at it after the work is done, by design and without anybody being told. I reproduced the current loss in a copy of the package: a Rejection.Wrong of "para one", a blank line, a line beginning with two hashes naming a finding heading, a blank line, "para two" reads back as "para one", and a Lesson.Class of the same shape does the same. Criterion 3 enumerates three cases -- two paragraphs, a value carrying a blank line, and one whose second paragraph begins with a lead this parser reads -- and a heading line is none of them, so the prescribed fix passes criterion 3 while still truncating. Criterion 5 lists "the heading delimiter" among the awkward values, but criterion 4 has just used those words for the character a heading is split on, which is the middle dot, so the one criterion that might cover this is decided by which of two readings a worker takes. This matters because the token's whole subject is that a value which does not fit gets a decision written down rather than silence, and because reviewers here quote section names constantly: the detail of this very token quotes done when, and a reviewer who writes a finding containing a heading line loses the rest of it exactly as the fourteen measured findings lost theirs.

**satisfies:** Give a heading inside a block field its own answer in the shape table and its own case in the check. Decide one of three things and write it down: refuse the value at SaveToken the way a one-line field is refused, with a message saying a block cannot carry a line that opens a section; or write it so it reads back, by indenting or fencing the offending line on the way out and undoing that on the way in; or accept the truncation and say in the table that it is accepted and why, so a reader can tell it from an oversight. Then add it to criterion 3's enumerated cases -- byte-identical from a value whose second paragraph begins with a line that opens a section -- and disambiguate criterion 5 by naming the two characters separately, the section opener and the character a heading is split on, so neither criterion turns on which reading a worker takes. Watch it red first: the reproduction above takes about twenty lines against the package as it stands and is red today on both Rejection.Wrong and Lesson.Class.

## finding 6 · round 4 · done when, criterion 1: "Every string field the walk arrives at must appear in the shape table, and one the table does not answer for makes it red by name" / detail: "SO THE TABLE ANSWERS FOR EVERY FIELD, INCLUDING THE ONES IT EXCLUDES" and the table under THE THREE SHAPES, AND WHICH FIELD IS WHICH · by reviewer9

**wrong:** The walk is derived and the table it is held against is not, so the table answers for half the set. I copied src/engine into a scratch package and ran the walk criterion 1 describes: reflect over Token, recurse into exported struct and slice-of-struct fields, collect every exported string-kind field. It arrives at 30 fields. The detail's table names 15 of them. The 15 with no answer are Token.ID, Token.Title, Token.GuidanceRef, Token.Assignee, Token.Scope, Token.Bucket, Token.Parent, Token.Status, Token.Disposition, Token.Reason, Token.AbortedFrom, Token.Holder, Token.MintedBy, Token.Evidence.Script and Rejection.By. Two rows are also wrong about the page. Lesson.By sits under not on the page and store.go:165 writes it into the lesson heading. Lesson.Learned sits under not on the page and store.go:171 writes it as the minted as lead. A third row, Criterion.Met, is a bool at token.go:211, so the walk never arrives at it and no table this walk is held against can be about it. The table was extended by exactly the two names round 3's finding used, Token.Detail and Token.Guidance, and nothing re-swept. This is not bookkeeping. Criterion 1 goes red for all 15 on the day the check is written, so the worker invents 15 answers to make it green, and each one is a decision this token says it exists to write down rather than leave to whoever is at the keyboard. And at least one of the 15 is losing data now: I saved a finding whose By is reviewer9 and a second line, and it reads back as reviewer9 alone.

**satisfies:** Run the walk before writing the table, and write the table from what it answered rather than from the finding. Say in the detail how many fields the walk arrives at and at which commit, so a reviewer holds the size of the table against the size of the set instead of reading the word every. Give every field the walk reaches a row. The frontmatter fields want a fourth shape this token has not named, and I measured what it is: I saved a Reason of two lines, a Reason whose second paragraph opens a section, a two-line Title and a two-line Holder, and all four came back byte-identical, so the honest row for them is that the frontmatter writer already holds them and nothing is refused. Correct the two wrong rows: Lesson.By and Lesson.Learned are on the page. Drop the Criterion.Met row or say beside it that it is a bool and the walk does not reach it. Then watch the red that decides this criterion: add one exported string field to Token, leave the table alone, and see the walk name that field.

## finding 7 · round 4 · done when, criterion 1: "The walk starts from Token and follows the record: reflect over its exported string fields and recurse into its exported struct and slice-of-struct fields" · by reviewer9

**wrong:** The walk follows structs and slices, and the record also writes a map, so the evidence sections sit outside it. Token.Submission is a map of string to string at token.go:287. store.go:126 writes each key as a body section, the evidence lead and the section name, with the value under it. readBody at store.go:188 reads them back through the same sections() call the detail and the findings go through. So an evidence section is a block by design in exactly the sense the table means, and the walk criterion 1 specifies arrives at Token.Submission as a map and stops there. I measured the loss in a copy of the package rather than reasoning about it: an evidence section reading para one, a blank line, a line of two hashes and the words done when, a blank line, para two is saved with no complaint and reads back as para one. Evidence is the longest prose this record holds, and the worker writing it quotes section names, which is the same reader the detail's own truncation measurement is about. The boundary came from the shape of the three types round 3 named rather than from what the parser writes, and the detail already says which of those two decides it: the boundary is the parser and not the Criterion struct.

**satisfies:** Widen the walk to what the record writes rather than to a kind of Go field: follow map-of-string values as well as exported struct and slice-of-struct fields, so Token.Submission is arrived at and has to be answered for. Give it a row in the table, as a block by design, since store.go writes and reads it exactly as it writes and reads a detail. Say in the detail where the walk stops and why that boundary is closed, naming the kinds it follows and the kinds it does not, so the next reviewer can disagree with the boundary rather than guess where it is. Then watch it red on the case that decides it: take the Submission row out of the table and see the walk name Token.Submission, or add a second map-of-string field to Token and see it named.

## finding 8 · round 4 · done when, criterion 5: "A clause carrying the heading separator, which is the middle dot that joins it to its round and its author, or a newline, is refused, and the refusal says which character" · by reviewer9

**wrong:** Three values go into those heading lines and the criterion names one. store.go:158 writes a finding heading as the lead, the index, the round, the clause and the author, joined on the middle dot. store.go:165 writes a lesson heading as the lead, the index, the round and the author, on the same character. So Rejection.By and Lesson.By sit in a delimited heading exactly as Rejection.Clause does, and both lose data today. I measured both in a copy of the package: a finding whose By is rev, a space, a middle dot, a space and nine is saved and reads back as rev, and a lesson whose By is two lines is saved and reads back as rev. Rejection.By is in neither the criterion nor the table, and Lesson.By is in the table under not on the page. The shape the detail invented for this, a value that goes into a heading, has three members, and the criteria assert it of one. That is the shape doc/guidance/specifying.md calls A SET COVERED BY ONE MEMBER, on a token whose subject is a field added to a record with nobody asking what a value that does not fit does.

**satisfies:** Write criterion 5 over the set rather than over the clause: every value the note joins into a heading is refused when it carries the heading separator or a newline, and the refusal names the field and the character. Name the three members in the detail's table, Rejection.Clause, Rejection.By and Lesson.By, or take them from the walk the way criterion 1 takes its fields. Then take one red per member rather than one red for the criterion: put a middle dot in each of the three in turn, watch the refusal name that field, and record which field each red was taken on.

## finding 9 · round 5 · done when, criterion 1: "Every string field the walk arrives at must appear in the shape table, and one the table does not answer for makes it red by name" / detail: "SO THE TABLE ANSWERS FOR EVERY FIELD, INCLUDING THE ONES IT EXCLUDES" and the table under THE THREE SHAPES, AND WHICH FIELD IS WHICH · by reviewer11

**wrong:** THE TABLE WAS EXTENDED BY THE TWO NAMES LAST ROUND'S FINDINGS USED AND NOTHING WAS RE-SWEPT, WHICH IS THE FINDING OF ROUND 4 REPEATED. Round 4 asked for the walk to be run and the table written from what it answered. The redraft added Token.Submission, which finding 7 named, and Rejection.By, which finding 8 named, and derived nothing. I ran the walk criterion 1 specifies rather than reasoning about it: I copied src/engine into a scratch package outside this tree and reflected over Token, following exported string fields, exported struct fields, exported slice-of-struct fields and exported map-of-string values. IT ARRIVES AT 32 FIELDS. The table names 18, and one of those, Criterion.Met, is a bool on Criterion in token.go that the walk never reaches, so the table answers for 17 and 15 have no row: Token.ID, Token.Title, Token.GuidanceRef, Token.Assignee, Token.Scope, Token.Bucket, Token.Parent, Token.Status, Token.Disposition, Token.Reason, Token.AbortedFrom, Token.Holder, Token.MintedBy, Token.Evidence.Script and Token.Rewatched. Criterion 1 is red by name for 15 fields on the day the check is written, and the worker closes that gap by inventing 15 answers this token never agreed, which is the outcome the token exists to forbid. THREE OF THEM ARE NOT BOOKKEEPING AND I MEASURED EACH ONE IN THE SCRATCH COPY. Token.Rewatched is a SECOND map-of-string body section: token.go declares it beside Token.Submission, body() in store.go writes each key under the re-watched lead, and readBody reads it back through the same sections call Token.Submission goes through, so a rewatched value of para one, a blank line, a line of two hashes and the words done when, a blank line, para two saves with no complaint and reads back as para one. The redraft answered the member the finding named and never asked what kind it was, so the second member of that kind, which the engine grew for the rewatched gate, joined the record without joining the table. Token.GuidanceRef is written into the body by body() as See plus the value and read back by readBody with a TrimPrefix, and a GuidanceRef whose second paragraph opens a section reads back as its first line, so it is on the page and it is in no row. Lesson.Learned is still under not on the page, and body() writes it as the minted as lead while readLesson reads it back on a blank-line split, so a Learned of wk-1234, a blank line and and more reads back as wk-1234. Round 4's finding said correct TWO wrong rows, Lesson.By and Lesson.Learned. Lesson.By is corrected and the detail names it as corrected. Lesson.Learned is untouched. THE OTHER 13 ARE HONEST AND I CHECKED THEM RATHER THAN ASSUMING: I saved a two-line Title, a two-line Holder, a two-line Reason, a Reason whose second paragraph opens a section, and an Evidence.Script of two lines, and every one came back byte-identical, because front() in store.go hands them to WriteFront, so the true row for them is a fourth shape, held whole by the frontmatter writer and nothing refused, exactly as round 4 measured. AND THE BOUNDARY PARAGRAPH IS NOT CLOSED IN BOTH DIRECTIONS. WHERE THE WALK STOPS names four kinds followed and says it does not follow unexported fields, integers, booleans or times. Exported slice-of-string is in neither list, and Token.Subs, Token.DependsOn, Token.Successors and Token.Evidence.Sections are all exported slices of string that front() writes to the note, so a reader cannot tell whether they were excluded or missed, which is the thing the table is being asked to fix.

**satisfies:** RUN THE DERIVATION BEFORE WRITING THE TABLE AND PUT WHAT IT ANSWERED IN THE DETAIL. Paste the walk's command and its count beside the table, with the commit the count was taken at, so a reviewer holds the size of the derived set against the size of the declared one instead of reading the word every. Today those two numbers are 32 and 17. Then give every field the walk reaches a row. Name the fourth shape for the 13 frontmatter strings, held whole by the frontmatter writer and nothing refused, and say that front() is what holds them. Put Token.Rewatched beside Token.Submission under a block by design, and write the row for the KIND rather than for the member, every map-of-string the note writes as a body section, so the third one is covered before it exists. Move Lesson.Learned out of not on the page and give it its block answer beside Lesson.Class and Lesson.Avoid. Give Token.GuidanceRef its row, block or refused, since it is written into the body and read back by a prefix. Say beside Criterion.Met that it is a bool and the walk does not reach it, so a reader can tell that row from an oversight. And close the boundary in both directions by naming exported slice-of-string as followed or not followed, with the reason, since front() writes four of them. THE CHECK, RED TODAY, AND IT IS CRITERION 1'S OWN: write TestEveryFieldTheNoteWritesIsRead and run it against the table as the draft stands BEFORE agreeing the draft. It names 15 fields today, and a criterion that would be red by name for 15 members on the day it is agreed is a draft that is not finished. Then take one red per answer rather than one for the criterion: delete the Token.Rewatched row and watch the walk name Token.Rewatched; save a Rewatched value whose second paragraph is a line of two hashes and watch the round trip come back as its first paragraph; save a Lesson.Learned of two paragraphs and watch it come back as one; add one exported string field to Token, leave the table alone, and watch the walk name that field. Record each red by the test name and what it said rather than by a line.

## finding 10 · round 6 · done when, criteria 1, 4 and 7, and detail: the map row under THE FIVE SHAPES, AND WHICH FIELD IS WHICH, and A ROW FOR THE KIND AND NOT FOR THE MEMBER · by reviewer10

**wrong:** The record writes a map's KEY into a heading line and its VALUE into a block, and the table decides one of the two. The row now reads every map of string the note writes as a body section, which is Token.Submission and Token.Rewatched today, filed under a block by design, and writing it for the kind rather than for the member is the right answer to last round. It is an answer about the value. store.go builds each entry's heading from a lead and the key and writes the value under it, and readBody reads them back through the same sections call a detail goes through, so the key is a value that goes into a heading in exactly the sense the detail invents that shape for. It is in no row, in no criterion and in no red. Criterion 4 takes its set from the table's into a heading row, which names Rejection.Clause, Rejection.By and Lesson.By, so it cannot reach a map key however faithfully it walks that set. Criterion 1 cannot reach it either, because the walk arrives at the map as one node and yields one name, so a field the record writes in two places is answered once, and criterion 7's two numbers agree at 32 while one of the 32 stands for two values. I measured the loss in a copy of the package rather than reasoning about it. A Submission whose key is two lines saves with no complaint and reads back with the key cut to its first line and the remainder of the key prepended to the value, so the key and the value are both wrong and nothing says so. A Rewatched key behaves identically. The same copy shows the value side already answered for: a Rewatched value carrying a line that opens a section reads back as its first paragraph, which is the block row and criterion 8. So the whole of what is missing is the key. It is the same shape the last round found and one level in: there the redraft answered the member and never asked what kind it was, and here the table answers the kind and never asks how many values the writer takes out of it.

**satisfies:** Give the map row both halves. Write it as: every map of string the note writes as a body section, whose VALUE is a block by design and whose KEY goes into a heading, which is Token.Submission and Token.Rewatched today. Then say in criterion 4 that its set is every value the note joins into a heading including those keys, so the refusal covers a key carrying the heading separator or a newline and names which map and which key. Say in criterion 1 whether the walk yields two names for a map or one, because criterion 7 holds the walk's count against the table's and the two have to be counting the same things. Then take the red per member the way criterion 9 already asks: put a newline in a Submission key, watch the refusal name it, and do the same for Rewatched, recording the test and what each failure said. If a map key is judged out of scope instead, put that in the table with its answer and its reason, because the detail's own rule is that a deliberate exclusion is written down so a reader can tell it from an oversight.

## finding 11 · round 6 · detail: WHERE THE WALK STOPS, AND THE BOUNDARY IS CLOSED RATHER THAN LEFT TO GUESS, and done when, criterion 1's list of the kinds the walk follows · by reviewer10

**wrong:** The boundary paragraph still names four kinds followed and four kinds not followed, and exported slice-of-string is in neither list, which is what last round asked for by name and it is the one item of that finding that was not done. WHERE THE WALK STOPS says it follows exported string fields, exported struct fields, exported slice-of-struct fields and exported map-of-string values, and that it does not follow unexported fields, integers, booleans or times. Token.Subs, Token.DependsOn, Token.Successors and Token.Evidence.Sections are exported slices of string, and they are on the page: the frontmatter writer puts them out under subs, depends_on, successors and evidence, and the reader takes them back through the same frontmatter, both in store.go. So four fields the note writes and reads back sit outside both lists, and a reader cannot tell whether they were excluded or missed, which is the exact thing the table exists to fix and the sentence beside it says so: a reviewer who disagrees with that boundary can say so about a list rather than about an omission. I took the measurement so the answer does not have to be guessed at, and it is the cheap one. In a copy of the package I saved a Subs entry carrying a newline, a DependsOn entry carrying a comma, an Evidence.Sections entry carrying a comma, and a Successors entry carrying a newline. All four saved with no complaint and all four read back byte-identical. So nothing is being lost and the honest row is the fourth shape the detail already names, held whole by the frontmatter writer with nothing refused, which is the same answer the thirteen frontmatter strings got.

**satisfies:** Name exported slice-of-string in the boundary paragraph, on one side or the other, with the reason. The reading is already taken and it is in this finding: the four round-trip whole through the frontmatter writer, so either say the walk does not follow them because the frontmatter holds them whole and name the four, or follow them and give each a row under in the frontmatter, in which case say so in criterion 1's list of kinds and re-derive criterion 7's number, which is 32 today and would be 36. Take whichever route, and say which in the detail rather than leaving the kind out of both lists, because a kind in neither list is the omission the paragraph promises a reviewer will not have to argue about.

## lesson 1 · round 1 · by reviewer6

**the class:** AN EXTENT INHERITED FROM THE FINDING THAT REPORTED IT, RATHER THAN MEASURED AGAINST THE FILE. A reviewer's finding names the places it happened to look. The drafter reads the finding, writes those places into the criteria, and the criteria then say all of them about a set the reviewer drew and nobody re-swept. The sample becomes the extent silently, because the draft now carries the word every and a list, which reads exactly like a measurement. The tell is that the list stops at a struct boundary or a package boundary rather than at the boundary of the thing that has the defect: ask what draws the line, and if the answer is the finding rather than the parser, it is a quotation and not an extent. And the remedy inherits it too -- a rule chosen for the shape of the instance is applied to the whole set, and the set turns out to hold things of another shape for which the rule is wrong. On wk-24be1c06ae the draft names four one-line fields on a criterion; the parser those four live under also truncates a finding's wrong and satisfies at the first newline and splits a clause into a heading, and of fourteen findings in the record every one written in paragraphs is cut to its first, 85 characters of 1900 in one case.

**instead:** When a draft turns a finding into criteria, re-sweep the file the defect lives in before writing the word every, and put the sweep in the draft: which function, which file, how many, and the list. One pass over the parser, not over the finding. Then group what the sweep found by shape before choosing a remedy, because one answer rarely fits all of them -- here, one line by design, a block by design, and a value that goes into a delimited heading are three problems wanting three answers, and the rule that is right for the first would have outlawed every review in the queue if applied to the second. The method already tells a reviewer that a finding is a sample of the defect and never its extent; the same sentence belongs to whoever drafts from it, because the drafter is the one whose criteria will say all.

**minted as:** wk-ce5d6865e4

## lesson 2 · round 2 · by reviewer6

**the class:** A HAND-WRITTEN LIST STANDING IN FOR A SET THE LANGUAGE CAN ENUMERATE. A check is written over every member of a set and the members are typed into the check. It is complete on the day it is written, it iterates, it fails on the first miss, and it looks exactly like the remedy for wk-10d3cf13cd, a command about one member of a set. It is that mistake one step out: the command walks a set, but not the set the sentence is about. It walks the list, and the list is a photograph of the set taken once. It stays green when a member is added, which is the only moment it was ever needed, and an anti-vacuity guard does not help, because refusing an empty list catches deletion and never shortness. The tell is where the set is defined: if that is a struct, an enum, a directory or a JSON file, the language or the tree can hand you the members and the check should ask for them; if the answer is "in the check", the check is the only place that knows and it will go on being right about a world that has moved. On wk-24be1c06ae the set is every string field of three structs, Go can enumerate it with reflect, and the draft asks a test to keep a second copy of it by hand -- in a token whose entire subject is a field added to a record with nobody asking what happens to it.

**instead:** Before writing a list into a check, ask where the set is really defined and whether the language or the tree can hand it to you. If it can, take it from there -- reflect over the struct, read the directory, parse the JSON -- so the check goes red on the commit that adds a member rather than on the incident that follows, and so its message tells that author what they now have to decide. Keep deliberate exclusions in the same table with their reason written beside them, because a hand list cannot tell an exclusion from an oversight and the next reader will have to guess. And when a criterion says every, ask not only whether the command iterates but whether it iterates the same set the sentence names: iterating a list you wrote is still a sample if the set can grow.

**minted as:** wk-02e17b9eb4

## lesson 3 · round 3 · by reviewer8

**the class:** A fix scoped to the level the finding named, leaving the same class standing one level up. The instance is gone, the finding is answered, and the class is alive one rung higher wearing the remedy's own clothes, which is what makes it invisible: the thing being looked at is the fix that was asked for. The tell is that the remedy still contains a list -- if the answer to "you typed the members" is a walk over a set that was itself typed, three struct names or two directories or four commands, the question was never about the members.

**instead:** Ask the remedy the same question that produced it, once, before writing it down: where is THIS set defined, and could the check ask for it. Where the language can enumerate the outer set too, do it -- reflect walks a graph, not a struct, so start from the type the record is written from and follow its exported struct and slice-of-struct fields. And when you answer a finding, say in the draft where you stopped and why the set you stopped at is closed, because a boundary written down is one a reviewer can disagree with, while a boundary that is only the shape of the last sentence somebody wrote is one nobody can see.

**minted as:** wk-7e98c419e7

## lesson 4 · round 4 · by reviewer9

**the class:** A CHECK THAT HOLDS A DERIVED SET AGAINST A DECLARED ONE, WHERE THE ROUND FIXED THE DERIVED SIDE AND LEFT THE DECLARED SIDE AS IT WAS. A reviewer says the members were typed into the check. The next draft takes them from the language, with reflect or a directory read, and that is the right fix. It is half of the check. The check has two sides: the set the language hands over, and the table of decisions that set is held against. The table is still a photograph, and the round extended it by exactly the names the finding used. What hides it is that the draft now reads as derived. The criterion says reflect, it says every, and it says fail by name. Nothing on the page says how big the derived set is, so nobody holds the size of the table against the size of the set. And the gap is closed silently, by the worker, after the draft is agreed: the check is red for every member the table does not answer for, so the worker writes an answer for each one to make it green, and those answers are decisions the token never agreed.

**instead:** Run the derivation first and write the table from what it answered. The derivation is a command, so run it before the draft rather than after the gate. Put its count in the draft, with the command and the commit it was taken at, so a reviewer holds two numbers against each other instead of reading the word every. Where a declared side has to exist, say what derived it: a table taken from a walk on a named commit is one somebody can re-derive, and a table taken from the last round's finding is a quotation. And write the boundary of the walk down, naming the kinds it follows and the kinds it does not, because a boundary chosen from the shape of the last finding is one nobody can see.

**minted as:** wk-f22cbd19f4

## lesson 5 · round 5 · by reviewer11

**the class:** A REDRAFT THAT ANSWERS THE NAMES IN A FINDING AND NOT THE INSTRUCTION BESIDE THEM. A satisfies carries two things: an instruction, which is usually derive the set and write the declared side from what the derivation answered, and the two or three member names the reviewer happened to measure while finding it. The names are concrete and the instruction is work, so the redraft adds the names, the criterion's sentence still reads derived, and nobody can see that the declared side was never re-derived. It is the round-4 class one round on, and the tell is that the new rows are exactly the nouns in the last round's findings and no others. On wk-24be1c06ae round 4 said run the walk, give every field a row, and correct two wrong rows. The redraft added the two nouns round 4 had typed, Token.Submission and Rejection.By, corrected one of the two wrong rows, and left 15 of 32 walked fields with no answer, two of which, Token.Rewatched and Token.GuidanceRef, are losing data in the tree today.

**instead:** WHAT WOULD HAVE STOPPED IT BEING MADE: run the derivation the finding names FIRST, before touching the draft, and write the declared side from its output, so the finding's nouns are never the source of a row. A member name in a finding is an example of a kind, so answer the kind, which here is every map-of-string the note writes as a body section rather than the evidence sections alone. Read a satisfies as a numbered list of imperatives and answer each one where it is written, because a satisfies naming two fields and giving four instructions is closed silently by the two fields. WHAT WOULD HAVE CAUGHT IT: run the criterion's own command against the draft before submitting it, and paste two counts into the detail beside the table, the size of the derived set and the size of the declared one, with the commit they were taken at. A criterion that would go red by name for 15 members on the day it is agreed is a draft that is not finished, and two numbers on the page are what let a reviewer see that in one look.

**minted as:** wk-f22cbd19f4

## lesson 6 · round 6 · by reviewer10

**the class:** A WALK THAT ARRIVES AT A CONTAINER AND ANSWERS FOR IT ONCE, WHERE THE RECORD WRITES TWO VALUES OUT OF IT. A map, a pair or a tagged value reaches a reflect walk as one node, so the table it is held against gets one row, and the row is about whichever half the reader had in mind, which is the value. The other half is written somewhere else and by different rules. In this record a map key becomes part of a heading line and the map value becomes a block, so one half cannot carry a newline and the other can, and no criterion reaches the half nobody named. It hides because the derived side is honestly derived: the walk enumerates, the criterion says every, and the count of nodes matches the count of rows, so a criterion holding those two numbers against each other agrees with itself while one node stands for two values. The set of NODES is complete and the set of VALUES is not, and nothing on the page separates the two. Measured on wk-24be1c06ae in a copy of src/engine: the walk arrives at Token.Submission and Token.Rewatched as single nodes, and a key carrying a newline on either one saves with no complaint and reads back cut to its first line with the remainder prepended to the value, so both halves are corrupted at once.

**instead:** Two halves, and the first is what stops it being made. Before writing the walk, read the writer rather than the type: go to the function that puts the value on the page and count how many strings it takes out of each field, because that count and not the field count is the size of the set. Where it takes two, the walk yields two entries and the table carries two rows, one per place the writer puts them, and any criterion comparing the two counts is then comparing the same things. The second half is the check that catches it: a round trip fed at the container's seam rather than at its value. For every map the record writes, save a key carrying a newline, the delimiter of the heading it lands in, and the lead of the section it opens, and require the entry back byte-identical in key and in value, or refused by name. A round trip that only varies the value passes with the key eaten, which is what this record does today.

**minted as:** wk-34733e83fc


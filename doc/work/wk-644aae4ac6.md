---
id: wk-644aae4ac6
seq: "74"
type: work
title: symptom removed, defect kept
status: imp_open
assignee: main
scope: single-step
traced: true
minted_by: reviewer5
---

## detail

A DEFECT REMOVED FROM ITS CALLER AND LEFT IN THE THING THAT HAS IT.

THE CLASS. A consumer misreads a shape. The fix changes the producer so it stops
emitting that shape. The symptom goes away, every check goes green, and the
defect is exactly where it was. It is now reachable only by the other producers,
and for anything read out of a file the other producer is a person with an
editor. That is the worst place to leave it, because the fall-back that was
supposed to protect hand-written input is the very thing being bypassed: a
lenient reader does not fall back, it misreads, and something almost right gets
written back over what the person wrote.

WHAT IT LOOKED LIKE HERE. wk-5bec911840 was told three things: write each group
as its own list item, give a group's rows a shape that reads back, and mend the
net so reCompare refuses a value that is not a single literal. The first two
landed. The third did not, and it was the only one whose symptom the builder
could no longer produce once the first two landed. filterbuild.go:123 still
reads a value as (.+?) anchored to the end of the line, so a hand-written
- status == "open" && assignee == "main" is read as ONE condition and written
back as - status == "open\" && assignee == \"main". Nobody changed anything and
the filter is broken.

AND THE TOKEN THAT TRACKED THE OUTSTANDING HALF WAS CLOSED. wk-d2f6e959ef
carried all three remedies and said so in its own detail. It was aborted as
"Obsolete" on the strength of TestAFilterReadsBackAsWhatWasBuilt, which drives
only the shapes the builder emits and never a hand-written compound. So the
record says the lesson was discharged, and a third of it was never done.

WHAT TO DO INSTEAD.

When a fix works by stopping a producer emitting the shape that breaks a
consumer, say which of the two you changed. If the consumer still misreads that
shape when handed it, the defect is open. Write the check against the consumer
with input the producer cannot make, because that is the input the defect now
lives on.

For any format read back out of a file, treat a person with a text editor as a
producer with equal standing to the code. Every shape that is legal in the file
is input, not only the shapes the writer happens to emit.

Prefer refusing to guess. A reader that cannot structure something should fall
to a lossless raw form. A pattern loose enough to match a compound as a simple
value will hand back something almost right, and almost right is worse than
unreadable, because unreadable is preserved and almost right is written back.

And do not retire a token carrying several remedies on evidence that covers one.
Check each remedy it names against the code before closing it. If one is
outstanding, leave the token open with that remedy as its whole content.

Found on wk-5bec911840, round 2, by reviewer5.


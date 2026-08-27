---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-how-a-record-was-worked-survives-its-closing
type: "[[requirement]]"
statement: When a record closes, the engine shall keep an answer to how its work was done, not only to what the work concluded.
kind: functional
verify_method: test
breaks_if_removed: A closed record keeps its conclusions and loses its working. Nobody can ask afterwards which pieces of work were closed as duplicates, which were moved, or how long any of it took, so the record cannot teach anything about the method that produced it.
breaks_how_badly: corrosive
refines:
  - uc-close-a-record
  - uc-browse-the-archive
source_refs:
  - req-work-records-when-it-opened-and-when-it-closed
  - cand-files-while-open-evidence-once-closed
  - cand-files-while-open-one-file-in-version-control-once-closed
  - "scoring 2026-08-26: the sharpest single difference between the two folding candidates, and no axis measured it"
priority: should
---

## Detail

TWO THINGS A CLOSED RECORD HOLDS, and this row is about the second.

- WHAT THE WORK CONCLUDED. The evidence, the verdicts, the decisions. Every
  candidate keeps this.
- HOW THE WORK WAS DONE. Which pieces of work existed, which were settled,
  which were moved, which were closed as duplicates, and when each opened and
  closed.

## Why the narrow row does not cover it

`req-work-records-when-it-opened-and-when-it-closed` asks for two timestamps
ON A PIECE OF WORK. It says nothing about whether that piece of work still
exists once its record closes.

A DESIGN CAN SATISFY THE TIMESTAMPS AND FAIL THIS. Folding a work token into
the evidence and deleting the file keeps the conclusion and loses the token,
timestamps and all.

## Why it is a should rather than a must

AN ITERATION SHIPS WITHOUT IT. The conclusions are what the next record reads,
and losing the working is debt rather than a purge.

WHAT IT COSTS IS THE RETRO'S RAW MATERIAL. A retro that cannot see how a record
was worked can only read what it produced, and half of what a retro is for is
the working.

## Where it came from

MINTED AFTER THE FACT, and that is worth recording. The scoring agent at
i63's candidates milestone named this as a dimension on which the candidates
genuinely differ and nothing measured. It was carried as a gate override and
then written as a requirement, which is the only way a criterion can exist.

## Version control counts as kept

CONTENT RECOVERABLE AT A COMMIT IS HELD. History is never rewritten here, so a
file deleted from the working tree still stands at the commit before its
deletion, and three lane verbs read at a ref.

THE OWNER RULED IT DIRECTLY, 2026-08-26, twice. On deleting a requirement: "We
can still find the old stuff in Git." On the archive: "if somebody reads an
iteration that is in the archive, this is a Git operation."

IT COUNTS ONLY WHERE IT CAN BE REACHED. The owner's condition, same day: it has
to be clear what the commit is, so somebody can get at it. A design that
deletes a file and records nowhere which commit still holds it has lost the
file, whatever version control keeps.

SO A DESIGN THAT DELETES A FILE HAS NOT NECESSARILY LOST IT. What it loses is
whatever it never wrote down, whatever it wrote down only in a shape nothing
can read back, and whatever it left at a commit nothing names.

WHAT THAT DEMANDS OF A DESIGN THAT DELETES. It records the address. A commit,
a tag, a ref — one of them, written where a reader will find it, at the moment
of deletion. "It is in the history somewhere" is not an address.

THIS LINE EXISTS BECAUSE THE ROW COULD NOT BE SCORED WITHOUT IT. The scoring
agent named it on 2026-08-26: two cells swung by two points on a question the
requirement did not answer.

## What is verified

A CLOSED RECORD IS ASKED THREE QUESTIONS, and the pass line is how many it can
answer.

- Which of its pieces of work were settled.
- Which were moved elsewhere, and where they went.
- Which were closed without being done, and why.

THE MEASURE IS THE COUNT, out of three, and the record may answer from the
working tree or from version control.

THREE IS A PASS. Fewer is a partial, and each missing answer names what the
design gave up. Zero fails.

THE EARLIER MEASURE WAS "AN ANSWER OF ANY SHAPE PASSES", and it could not rank
anything: every design keeping one file passed it identically.

## Who is asking, and what counts as an answer

THE READER IS A PERSON USING THE ORDINARY VERBS. The lane's read, search and
glob all take a commit, so digging an answer out of history is a legitimate
way to answer. It is more expensive than reading it off a file, and a design
that makes it cheap has done better — but expensive is not absent.

THIS ROW DOES NOT DEMAND THAT THE ENGINE SERVE THE ANSWER. Naming which
mechanism produces it would freeze the design milestone's choice, which this
register does not do.

A CATEGORY THAT CANNOT ARISE IS ANSWERED BY SAYING SO, and the saying has to be
recorded. A design where nothing can move has answered "which moved" with none,
and a design that refuses an undone close has answered the third question the
same way. Making a case impossible is a better answer than reporting it, not a
dodge.

WHAT IS NOT AN ANSWER is silence. A category nobody thought about looks
identical to one that cannot occur, and the difference is whether the design
says which.

BOTH RULINGS WERE MADE AFTER THE SCORING RAN, and which way each cuts was known
when they were made. The scoring agent asked for them on 2026-08-26 and said
what each would move: the reader ruling holds four candidates at two of three
rather than dropping them to one, and the impossible-category ruling holds the
null at three of three rather than dropping it to one. Both are stated here so
a reader can judge the timing rather than discover it.

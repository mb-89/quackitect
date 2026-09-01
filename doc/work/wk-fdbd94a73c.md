---
id: wk-fdbd94a73c
seq: 1000052
type: work
title: "learned: default refuses"
status: backlogged
assignee: main
scope: single-step
traced: true
minted_by: reviewer11
---

## detail

CLASS: AN ALLOW LIST WHOSE DEFAULT IS STILL PASS.

A reviewer says a check hunts the forbidden and will need a round per shape,
and asks for it to be turned round: name what is permitted and refuse the rest.
The next draft rewrites the matching, writes the permitted set into the file's
comment, and leaves the loop's default where it was. An element the code does
not recognise still falls off the end and counts as fine.

WHAT MAKES IT INVISIBLE. The forms the last finding named all fail now, and
they fail properly, so every case anybody has written down is red and the
change reads as done. The comment says the permitted set, not the forbidden
one. Only somebody who invents a form nobody has written yet can tell the
difference, and inventing one is the thing a redraft never does, because the
finding handed it a list.

THE TELL IS EVERY continue AND EVERY EARLY RETURN IN THE LOOP. Each one is a
permitted form. If they are not named in the file with a reason beside them,
the permitted set is not the one the comment describes: it is everything the
matching failed to recognise.

MEASURED ON wk-1412093cd8, round 5. The check refuses a flag literal written
with double quotes, single quotes, a backtick, a local variable and a
concatenation, which is the five the finding named, and the clean tree is
green. It passes three forms nobody had written: a spread of a name given an
array of flags on the line above, a spread of an inline array of flags, and a
property read off an object of flags. Its own comment says a fifth shape nobody
has thought of is refused before anybody writes it.

WHAT TO DO INSTEAD.

WHAT WOULD HAVE STOPPED IT BEING MADE. Turning a check round is a change to the
DEFAULT and not to the matching. Write the refusal first: make every element
fail with what it found, run it on the clean tree, watch everything go red, and
then add one permitted form at a time until the clean tree is green. The forms
you had to add are the permitted set, they are short, and each one gets its
name and its reason in the file. A rewrite that starts from the matching keeps
the old default and cannot be told from the thing it replaced.

WHAT WOULD HAVE CAUGHT IT. Before submitting, write down every shape the loop
does not recognise and drive each one, rather than driving the list the finding
gave you. Three minutes of inventing shapes is the only test of an allow list,
because the forms in the finding are the ones already known to fail. And count
the permitted forms in the code against the permitted forms in the comment: if
the code has more, the extra ones are holes.


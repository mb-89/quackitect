---
minted_in: i51
id: opt-a-state-word-marks-what-is-listed-but-not-yet-usable
type: "[[option]]"
statement: a thing with work still running on it stays in every listing and carries a word saying it is not usable yet, rather than being hidden or shown as ready
cluster: cluster-the-standing
found_by: prior-art
source: "Google AIP-151, Standard methods section, read at https://google.aip.dev/151 on 2026-08-21"
---

## Mechanism

When a resource is being created or removed by work that is still running, the
standard says the resource SHOULD still appear in list and fetch calls, and
SHOULD indicate that it is not usable, generally with a state enum.

TWO DECISIONS IN ONE SENTENCE, and they pull opposite ways.

- It is VISIBLE. Hiding it would make a caller believe nothing is happening.
- It is MARKED. Showing it plainly would make a caller believe it is ready.

## What it says about our open question

`flow-step-standing` needs a third value beside passed and not-passed, and
`raid-risk-a-hop-that-finishes-later-makes-green-ambiguous` is graded crippling
because every reader of green inherits it.

THIS IS AN ANSWER TO THAT QUESTION, from somebody who met it first. The third
value is not a new listing and not a hidden row. It is a word on the row that
was always there.

## What adopting it would look like here

A state with a leaving check still running appears in the route, in the panel
and to a gate exactly where it always did, carrying a word that says it is
deciding.

A reader that does not know the word sees a row it does not recognise, which is
loud. A reader that flattens the word into passed lets a gate through, which is
silent. So the shape pushes the failure toward the loud side.

## What our context breaks

THE STANDARD IS ABOUT A RESOURCE, and a state is not a resource. It has no
lifecycle of creation and deletion, so the analogy holds for the marking and
not for the rest of the section.

OUR READERS ARE INSIDE ONE PROCESS. There is no client library to break on an
unknown enum value, which removes the compatibility cost that makes this rule
expensive elsewhere.

## What it would cost

Every reader of a step's standing learns a third case. That is the change this
iteration is sized `major` for, and this option does not make it smaller.

What it does is make the third case ORDINARY rather than special.

---
id: wk-789ff2ba2e
seq: "75"
type: work
title: the check ran dry
status: imp_open
assignee: main
scope: single-step
traced: true
minted_by: reviewer5
---

## detail

A CHECK WHOSE RED DEPENDS ON DATA THE SYSTEM CONSUMES GOES QUIET AS THE SYSTEM SUCCEEDS.

THE CLASS. A check is written against whatever happens to be lying in the
repository at the moment it is written. It is watched failing, the evidence is
filed, and it is true evidence. Then ordinary use eats the data it stood on. The
check keeps passing, reports nothing, and nobody is told it has stopped being
able to fail. It is worse than a check that was never written, because the
record says this was proved.

THE TELL. Ask what the check would need in the tree to go red, then ask whether
the system removes that thing in the course of working. If the answer is yes,
the check has a half-life. A migration check is the sharpest case: it is fed by
exactly the old data the migration is there to eliminate, so it is strongest on
the day it is least needed and dead on the day the last old record is converted.

WHAT IT LOOKED LIKE HERE. wk-20c6c329fd renames the engine's states and keeps a
map of old spellings, wasCalled in src/engine/token.go, so that about fifty
notes already on disk still read. Its check,
TestTheTokensThatExistReadUnderTheNewNames, walks the tokens in the tree and
requires each to read back as a state the engine knows. Its power is entirely a
function of which old spellings survive on disk.

It has already decayed twice, and I watched the second one happen.

Removing the in_work entry from wasCalled leaves the check GREEN. The worker's
own evidence file records it RED on exactly that defect, citing
wk-20c6c329fd reads back as "in_work" -- the token's own frontmatter. Submitting
the token moved it to imp_submitted, and it had been the only token in the tree
spelling in_work. The act of submitting the work destroyed the evidence for the
work.

Then, during the review, removing the submitted entry went from RED to GREEN.
wk-908639bd2b was the last token spelling submitted; pulling it for review
rewrote it as imp_in_review. An ordinary review pull, changing nothing about the
code, took a second alias out of the check's reach.

Two of five aliases are now unguarded. spec hangs on one token.

WHAT TO DO INSTEAD.

Separate the sweep from the guarantee. A sweep over real data is worth having --
it catches what nobody thought to enumerate -- but it can only ever be a bonus,
never the guarantee, because its inputs are not yours.

For every rule that must hold, build the input the rule is about, in a fixture
you control, and assert on that. Enumerate from the code rather than from the
tree: iterate the keys of the map, the members of the list, the cases of the
enum, and construct one case per entry. Then the check's coverage is a function
of the code it guards, and adding a twelfth entry adds a twelfth case rather
than a silent hole.

When a sweep over live data is kept, make it refuse an empty population. A check
that finds nothing to judge must fail loudly, not pass. This token already knew
the pattern -- its own criterion says the check refuses unless it found at least
one done and one became -- and the same guard was simply not applied per alias.

And when evidence is filed as an artefact, ask whether a reviewer can reproduce
it tomorrow. If reproducing it depends on the tree being in the state it was in
that afternoon, it is a screenshot, not a check.

Found on wk-20c6c329fd, round 5, by reviewer5.


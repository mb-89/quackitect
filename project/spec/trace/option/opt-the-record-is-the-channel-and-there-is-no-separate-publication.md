---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: opt-the-record-is-the-channel-and-there-is-no-separate-publication
type: "[[option]]"
cluster: the-account
question: where the publication lands
statement: "the call record carries the named driver and that is the whole publication, so a receiver learns the recommendation by reading the log rather than by being told"
found_by: transform
source: "SIT Task Unification applied to cluster-the-account — give the record a second job"
---

## Mechanism

A COMPONENT THAT ALREADY EXISTS AND ALREADY RUNS. Every call is written to the
log. This iteration is already adding two fields to it — the model that answered
and the state it was made in. Adding the named driver makes three, and at three
the record holds the entire decision.

SO PUBLICATION IS A READ, NOT A SEND. publish-the-driver-outward stops being a
function that emits and becomes a fact about where the log lives. A receiver
tails the record; a later reader queries it; both get the same answer from the
same place, and there is no second channel to keep consistent with the first.

IT REMOVES THE FRESHNESS QUESTION ENTIRELY. opt-publish-the-driver-only-when-it-changes
exists because a stream that repeats itself is noise and a late receiver has no
standing value. A log has neither problem: it is already append-only, already
carries every value with its moment, and a late reader reads backwards to the
last one.

AND IT CLOSES THE COMPARISON BY CONSTRUCTION. opt-the-record-carries-both-the-named-driver-and-the-one-that-answered
argues both belong on the record. If the record is also the channel, they are on
the same line by definition and no join is needed to compare them.

WHAT IT COSTS: a receiver must be able to read our log, which is a coupling to a
file format rather than to a message. It also makes the recommendation as slow as
the log — anything wanting the driver before the call is made cannot have it,
because the record does not exist until the call does. That is fatal for a
receiver deciding what to spawn, and harmless for one auditing afterwards.

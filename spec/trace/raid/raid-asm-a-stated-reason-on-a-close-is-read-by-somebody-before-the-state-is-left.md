---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-asm-a-stated-reason-on-a-close-is-read-by-somebody-before-the-state-is-left
type: "[[raid]]"
kind: assumption
statement: Two guarantees rest on a short written reason carried by every close, and the design assumes somebody reads it before the state is left.
owner: the driving agent
trigger: the first observed case of a hand writing a close reason that says nothing, which is the owner's own trigger for tightening the field
status: open
probe: scheduled. The probe walks a position where an work token is closed as skipped and names every reader of that reason before the position is left. Nothing closes an work token yet, so there is no walk to observe. It is a cheap check the moment settling exists.
probed: 2026-08-26
impact: The claim that nothing is skipped in silence, and the claim that a withdrawn token is legible to a later reader, both rest on this. If nothing reads the reason in time, both degrade to an audit trail somebody may consult afterwards.
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - i63-work-tokens-become-the-unit-of-work-and-
---

## Probe

WALK ONE STATE WHERE A TOKEN IS CLOSED AS SKIPPED. Then name every reader of
that stated reason between the close and the state being left.

IF THE LIST IS EMPTY THE ASSUMPTION IS FALSE. The reason is then an audit trail
somebody may consult afterwards, which is a weaker thing than the claim resting
on it.

RUN IT BEFORE THE GATE THAT READS CLOSES IS DESIGNED, because the answer decides
whether that gate needs a field for non-done closes or not.

## OWNER RULING — free text stands until it is seen to fail

THE OWNER'S COUNTER-QUESTION IS THE STRONGEST ARGUMENT HERE: how else would you
do it? A fixed list of allowed reasons still needs a free-text field behind it
for the reason that is not on the list. So the enum buys sorting, not honesty.

THE RULING: leave it as free text. If hands are seen to misuse it, tighten it
then.

SO THIS ENTRY IS A WATCH RATHER THAN AN OBJECTION. Its trigger is the first
observed misuse, and its probe below is what to run when that happens.

## Why the doubt is reasonable

A FREE-TEXT FIELD IS THE THING THIS ROUND SAYS WEAK HANDS FILL IN WRONG. That
is problem five in the actual, in the owner's own words. Using one as the
mechanism for two guarantees asks the same hand to do reliably the thing it was
just shown to do unreliably.

THE SYSTEM HAS MEASURED WHAT A PROSE TOLL BUYS. Narration ran at 199 of 1233
calls in one window and produced 59 consecutive refusals naming the same two
items. Filler is the ordinary response to a prose work token, not the exception.

## What would make it true

A NAMED READER AT A NAMED MOMENT. A gate that reads non-done closes as
questions rather than as passes is the cheapest candidate, and the surface
keeping such closes countable rather than hiding them with the dones is the
other half.

## What follows if it is false

THE WORDING IN THE VISION HAS TO CHANGE, from nothing being skipped in silence
to nothing being skipped without a sentence nobody reads before the fact. That
is a weaker claim and it is still worth something, but it is not what is
currently written.

A FALSIFIED ASSUMPTION BECOMES AN ISSUE, keeps this id, and says so here.

---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-risk-ownership-and-receiving-pull-against-each-other
type: "[[raid]]"
kind: risk
statement: We build a bespoke way for a descendant to take updates onto files it has changed, when standard vendoring mechanisms already do exactly that.
owner: the owner
trigger: the first candidate at M4 that describes a mechanism of our own rather than naming an existing one
status: open
breaks_how_badly: crippling
how_likely: plausible
impact: "A home-made channel costs the time it takes to build and keeps costing it. It also fails the way home-made merge logic always fails - on the case nobody thought of - and the descendant's owner pays that, not us. If it fails badly enough to be abandoned, a descendant gets exactly what a fork gets: it works, it is theirs, and the channel silently stops being usable."
source_refs:
  - vp-vendoring
  - raid-dec-an-import-is-read-only-and-a-vendored-copy-is-yours
  - "i16 define-actual as_is — the git-subtree witness"
---

## What this entry used to say, and why it was wrong

IT CALLED THIS AN UNSOLVED PROBLEM. Its first version graded the collision
between owning a copy and receiving updates as crippling and certain, and said
"every existing tool picks one end and calls it a design".

THAT SENTENCE HAD NO EVIDENCE AND IS FALSE. It was written from reasoning
rather than from reading, which is the failure the owner has now corrected
three times in one day.

THE OWNER RULED IT PLAINLY, 2026-08-18: "If I vendor or import, then I don't
have automatic throughput on the thing that's upstream. That's normal. And
then if I wanna push something back, I do it via PR or, in our case, via a
note. We are just doing what everybody already does."

## The existence proof, primary and fetched

git-subtree's own manual page, in git's tree at
`contrib/subtree/git-subtree.adoc`, describes every half of what this
iteration wants. Its words, not ours.

- OWNERSHIP: "A subtree is just a subdirectory that can be committed to,
  branched, and merged along with your project in any way you want."
- RECEIVING WITHOUT LOSING LOCAL CHANGES: `merge` "doesn't remove your own
  local changes; it just merges those changes into the latest
  <local-commit>".
- COLLISIONS: "If your merge introduces a conflict, you can resolve it in the
  usual ways." A person decides. That is the whole answer, and it is enough.
- SENDING BACK, ONLY ON PURPOSE: "changes made in your local repository remain
  intact and can be later split and send upstream to the subproject." It takes
  two explicit commands. Nothing travels on its own.
- INVISIBLE TO THE RECEIVER: subtrees "do not force end-users of your
  repository to do anything special or to understand how subtrees work".

## And our own prior art answers it better, in this record's own inputs

v1 SOLVED THIS WITHOUT MERGING ANYTHING. From `product/engine-go/module.go` at
ref main, summarised in i16's own rough vision at record.md line 36:

- `modules/<dotted.id>/import` is a MIRROR of upstream and is never
  hand-edited. An update replaces it whole, so there is nothing to merge.
- `modules/<dotted.id>/overlay` is YOURS, and import NEVER touches it.
- `module.toml` records provenance.
- Import plans deterministic file operations, REPORTS deletes for files no
  longer upstream, and DRY RUN IS THE DEFAULT review surface.

WHY THAT IS STRONGER THAN A TEXT MERGE. The two halves never share a file, so
the collision case mostly does not arise. What a text merge answers with a
conflict, this answers by construction.

AND IT IS NOT A SEAL. Nothing stops a descendant editing the mirror. The
consequence is the ordinary one - the next import overwrites it - which is
exactly how every vendored tree behaves, and is not a prohibition.

SO THE CANDIDATE FIELD IS AT LEAST TWO WIDE before M4 opens: vendoring with
history, and v1's mirror-plus-overlay. Both are read. Neither is ours to
invent.

## So the risk is the opposite of what was written

THE HAZARD IS INVENTION, NOT IGNORANCE. The mechanisms exist, ship widely, and
one of them ships inside git. The way this goes wrong now is that M4 designs
something instead of choosing something.

WHAT IS GENUINELY OURS TO ANSWER is smaller and sits on top of whichever
mechanism is chosen.

- WHICH MECHANISM, and what it costs the descendant's owner to run. Their time
  is the currency.
- WHAT THE METHOD LAYER NEEDS BESIDE IT. Merging text is solved; knowing that
  a card the descendant overrode has been renamed upstream is not, and that is
  what the drift report is for.
- HOW MUCH MUST EXIST TOMORROW. The owner's constraint is that a vehicle and a
  foreign project start tomorrow. A first version that receives nothing yet may
  be honest; a first version that pretends to receive is not.

## What it is not

NOT THE ISOLATION RULE. raid-dec-an-import-is-read-only-and-a-vendored-copy-is-yours
settles that nothing a descendant does may reach the parent AUTOMATICALLY, and
that anything travelling up goes as a proposal somebody reviews. This entry is
about what comes DOWN.

NOT THE PRIVACY QUESTION. What travels up is the descendant owner's choice, and
draft-vision ruled that privacy wins there.

NOT A REASON TO DROP THE COLUMN. major was argued on a certain interface tell
and on three candidate overlay locations. Neither moves. What changes is that
M4 compares known options rather than inventing one, which is what M4 is for.

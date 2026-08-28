---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: raid-iss-the-refusal-hands-the-author-a-placeholder-where-the-reason-goes
type: "[[raid]]"
kind: issue
statement: The one rule in this tree that refuses an ungoverned reach hands the refused author a ready-made patch whose reason slot is literal placeholder text, and nothing checks that the placeholder was replaced.
owner: the driving agent
status: open
impact: The mechanism that was supposed to produce evidence that authors write usable reasons instead invites a non-answer. Every departure recorded through the remedy can carry the placeholder and pass.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - "deliverable/engine/widgets.ts line 166: the remedy's new_string writes the reason slot as the literal placeholder text"
  - "deliverable/machines/widget-exemptions.md line 30: a bullet with no reason is ignored, by design"
  - "measured 2026-08-26: the whole tree carries one declared widget exemption"
place: i40-every-write-path-is-guarded-the-pool-s-b
---

## What was found

`guardNoUnregisteredEmitter` refuses a write that would add an ungoverned
emitter. The refusal carries an executable remedy, which is correct and is what
every refusal in this lane owes.

The remedy is an `se_file_patch` that appends a bullet to the departure list.
Its `new_string` ends with a placeholder standing where the author's reason
belongs.

An author who follows the remedy verbatim writes the placeholder into the file.

## Why it matters more than it looks

THE REASON IS THE WHOLE POINT OF A DECLARED DEPARTURE. A departure with no
reason is a list of files somebody was allowed past, which is the thing a rule
exists to stop being invisible.

NOTHING READS IT. The exemption reader ignores a bullet carrying no reason, on
purpose. So a placeholder and a blank are the same to the machine, and a
placeholder LOOKS filled to a person.

## What it does to a standing assumption

`raid-asm-an-author-refused-at-write-time-states-a-usable-reason` is the named
kill criterion of the design this record chose. Its supporting sample is one
line, because the tree holds one departure.

THIS IS EVIDENCE AGAINST IT, and it is the only evidence the tree can offer.
The one mechanism that would show whether refused authors write usable reasons
is built so that the easiest path produces a non-answer.

## Why it is an issue and not a risk

Nothing here is uncertain. The line is in the file and the reader's own
documentation concedes the blank case.

## What would close it

Two changes, and the first is cheap.

- The remedy stops pre-filling the slot, so an author who follows it verbatim
  produces an obviously incomplete bullet rather than a plausible one.
- The reader refuses a bullet whose reason is empty, rather than ignoring it.

WHAT NEITHER OF THEM BUYS is a reason worth reading. That cannot be checked by
a machine, and no candidate in this record claimed otherwise.

---
minted_in: i44-the-corpus-resolves-duplicate-headings-a
id: raid-risk-arming-the-reference-sweep-turns-every-boot-red
type: "[[raid]]"
kind: risk
statement: "The corpus-wide dangling-reference sweep fails the boot on the very references it was armed to find, so no session can start until every one of them is repaired."
owner: the maintainer of the machine
trigger: the first boot after the sweep is armed
status: open
impact: "Boot's exit check already refuses on a single unparseable node. A sweep with a wider reach inherits that power over the whole corpus, and a session that cannot boot cannot fix what is blocking it."
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - i44-the-corpus-resolves-duplicate-headings-a
weighs_with: none
weighs_against: none
---

## Why it is graded plausible rather than conceivable

IT HAPPENED THIS MORNING, in the narrower form. One raid entry carried the
frontmatter key `probed` twice. Preflight exited 1, the conformance sweep
reported the file unparseable, and boot would not complete until it was fixed.

That was ONE file and ONE key. The sweep this iteration arms reaches every
reference key in the corpus, over about 2,549 nodes.

THE PLAN ALREADY COUNTS ABOUT FORTY-SIX unresolvable path-shaped references
standing today. Arming the sweep before repairing them turns a known backlog
into a stopped machine.

## What is being done about it

THE ORDER IS THE MITIGATION. Every sweep in this iteration repairs its class
BEFORE its lint is armed, and the lint is armed in the same milestone that
leaves the class empty.

A CLASS THAT CANNOT BE EMPTIED gets its marker instead, and the lint accepts
the marker. That is what the `primary not reachable` marking is for.

## What would close it

A green boot with every lint armed, on a corpus with no unmarked dangling
reference left. Anything less and the arming waits.

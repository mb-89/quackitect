---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: raid-asm-a-break-made-outside-the-lane-is-caught-by-the-sweep
type: "[[raid]]"
kind: assumption
statement: A person editing the corpus in their own editor introduces breaks rarely enough, and the sweep finds them soon enough, that no write-time check is owed to that path.
owner: the owner
trigger: the first corpus break a person made by hand, and any change to how often the sweep runs
status: probed
probe: Introduce a malformed node by hand, outside the lane. Measure how many calls and how much wall-clock pass before anything names it. Compare against the four calls the same break cost inside the lane on 2026-08-16.
probed: "2026-08-28, and it HOLDS. A hand break was named by the boot sweep at the very next boot, with the file, the line and the cause, before any work was done."
impact: If a hand break survives long, the corpus is only as sound as the last person to open it in an editor, and every write-time refusal is guarding a door beside an open window.
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - raid-asm-the-cage-holds-so-every-write-passes-the-lane
  - raid-iss-se-lint-has-no-whole-repo-sweep
  - req-a-standing-break-reports-and-lands
  - req-every-artifact-is-readable-text
---

## The assumption

THE CORPUS IS DELIBERATELY EDITABLE BY HAND. Every artifact is readable
text, the nodes are Obsidian-compatible markdown, and
`req-every-artifact-is-readable-text` makes that a promise rather than an
accident.

SO A PERSON WITH AN EDITOR IS AN EXPECTED WRITER, and no cage applies to
them. That is by design and is not the thing in question.

WHAT IS ASSUMED is that this path needs no guard of its own — that hand
breaks are rare, and that the sweep names them before they cost
anything.

## Why it is likely to be wrong in one direction

THE SWEEP DOES NOT EXIST YET. `se_lint` takes one file per call, and the
whole-repo pass its own description promises is unbuilt. Until it lands,
the honest answer to "how soon is a hand break found" is "when something
throws".

THAT IS EXACTLY THE COST THIS ITERATION MEASURED. Four calls, a thrown
pull, and an error naming a line in no particular file.

SO THE ASSUMPTION IS NOT YET TRUE, and it is graded likely for that
reason rather than pessimism. It becomes checkable when the sweep lands.

## Why it is an assumption rather than a requirement

BOTH HALVES ARE OUTSIDE OUR CONTROL. How often a person edits by hand is
theirs. Whether they run a sweep afterwards is theirs.

WHAT IS OURS is making the sweep exist and cheap. That is in scope and
carried by `raid-iss-se-lint-has-no-whole-repo-sweep`.

## What would change the answer

IF HAND BREAKS TURN OUT COMMON, the sweep is not enough and something
has to watch the corpus rather than wait to be asked. That is a bigger
design and it is not this iteration's.

Naming it here means the next iteration inherits a measured question
rather than a hunch.

## Falsification

One hand-made break that survives longer than the sweep's interval, or a
count of hand breaks high enough that reporting after the fact is not
good enough.

## Probe

INTRODUCE A MALFORMED NODE BY HAND, outside the lane, the way a person
with an editor would.

MEASURE HOW LONG IT SURVIVES. Count the calls and the wall-clock before
anything names it, and record WHAT named it — the sweep, a thrown
reader, or a person noticing.

COMPARE AGAINST THE MEASURED BASELINE. The same class of break cost four
calls inside the lane on 2026-08-16, and it was found by a pull throwing
rather than by anything looking.

WHAT THE ANSWER DECIDES.

- FOUND BY THE SWEEP, SOON. The assumption holds and the hand-edit path
  needs no guard of its own.
- FOUND BY A THROWN READER, LATE. The assumption fails. Something has to
  watch the corpus rather than wait to be asked, and that is a bigger
  design than this iteration's.

THE PROBE CANNOT RUN YET, and that is stated rather than skipped. It
measures against a sweep that does not exist —
`raid-iss-se-lint-has-no-whole-repo-sweep`. It becomes runnable the day
the sweep lands, which is inside this iteration's own scope.

## PROBED 2026-08-28 — IT HOLDS, AND THE SWEEP NOW EXISTS

THE TRIGGER FIRED ON ITS OWN. i44's session opened on a corpus carrying a hand
break: one raid entry held the frontmatter key `probed` twice, which YAML
refuses.

THE BREAK WAS NOT MADE THROUGH THE LANE. A lane write of that shape is refused
by SE-C-138 before anything lands, so the doubled key reached the file by
another path.

WHAT NAMED IT, AND HOW FAST. Boot's own exit check, at the first boot after the
break. Two of its five scripts reported it independently: preflight exited 1
naming the file and the line, and the conformance sweep reported the same file
as unparseable inside a 2,549-node pass taking 892 to 1,178 milliseconds.

ZERO CALLS WERE SPENT HUNTING IT. The comparison the probe asked for is against
four calls inside the lane on 2026-08-16. The walk had not started, and the
refusal carried the path.

THE REASON THIS SAID "not yet" IS STALE. The whole-repo sweep exists:
`deliverable/engine/bin/sweep.ts`, fired by boot's own exit condition.

WHAT IS STILL UNMEASURED is the other half of the statement, whether hand
breaks are RARE. One occurrence measures speed, not frequency. The trigger
stays live for that half.

---
minted_in: i27
id: req-a-read-comes-from-where-it-is-meant
type: "[[requirement]]"
statement: When the lane reads a file, the engine shall serve it from the tree the caller meant, and shall name the tree it resolved to whenever the path admits more than one.
kind: functional
verify_method: test
breaks_if_removed: A reading taken in the wrong tree answers confidently and wrongly, and it manufactures findings that are not real.
breaks_how_badly: fatal
refines:
  - uc-take-a-step
source_refs:
  - uc-resume-after-an-absence
  - raid-risk-a-write-lands-in-the-wrong-tree-silently
  - "owner ruling 2026-08-13: a read comes from the place where we want to read, and the resolving just works"
  - "observed 2026-08-13: a stop-hook check read the bound tree, found no log, and reported a defect that did not exist"
priority: must
---

## Detail

THE READ CASE IS THE ONE NOBODY ARGUED, and it is why this row stands
separately from its write sibling.

A rule about where a write LANDS says nothing about where a read COMES
FROM. Every candidate mechanism satisfies the write row. THE READ ROW IS
WHAT MAKES THEM DIFFER, so it is the architecture milestone's deciding
question rather than a detail of it.

## Observed, and it cost a wrong diagnosis

A check asking whether the stop hook was wired ran in the bound tree,
found no session log there, and reported the hook silently allowing
every stop. The hook was fine. The reading was taken in the wrong tree
and looked exactly like a real finding.

A SECOND TIME THE SAME HOUR: a write to another record's seed was
refused as not-found, for a file that existed. The path had been
rewritten into the bound tree and the refusal named the wrong absence.

A WRONG READ IS WORSE THAN A WRONG WRITE in one specific way. A write
leaves a trace somebody can find later. A read leaves nothing but the
conclusion it produced, and the conclusion looks exactly like a
conclusion drawn correctly.

## Where the path admits more than one tree

The alternative clause is deliberate and it is not a weakening. Some
reads legitimately cross: a committed ref, a declared root, another
record's seed. THE OWNER HAS RULED THAT REACHING ACROSS IS NORMAL WORK.

What must never happen is a read crossing SILENTLY, so the caller
believes it read one tree and read another.

## Behaviour

No model wanted. Same shape as the write row: one predicate, one call.

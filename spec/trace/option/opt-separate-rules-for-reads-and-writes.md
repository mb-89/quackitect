---
minted_in: i27
id: opt-separate-rules-for-reads-and-writes
type: "[[option]]"
statement: resolve a read and a write by two different rules, so a write is confined to the record while a read may reach anywhere it can name and says where it came from
cluster: cluster-the-walk
question: what the resolution rule covers
found_by: transform
source: SIT Multiplication, applied to the incumbent — copy the resolver and change the copy
---

## Mechanism

One resolver becomes two. A WRITE resolves into the bound record and nowhere
else. A READ resolves wherever the caller names, and the answer carries the
tree it came from.

WHY THE ASYMMETRY IS DEFENSIBLE. The two acts fail differently. A write in
the wrong tree corrupts and is found at a merge. A read from the wrong tree
misinforms and is found when somebody checks - if anybody does.

Confining reads would also break real work: i27's own record says plainly
that one record reaching into another is normal work, not a leak to be
sealed. What is wrong is being CONFUSED about which tree a call reached.

IT ANSWERS THE OPEN QUESTION DIRECTLY. raid-iss-cheaper-alternative-never-
compared names the deciding question as whether a path judgment covers READS,
and treats that as the argument for the expensive answer. This says the two
cases were never one question, so neither answer has to cover both.

WHAT IT COSTS. Two rules where there was one, and a reader has to know which
applies. That is the standard objection to Multiplication and it is real: a
copy that diverges is a second thing to maintain.

WHAT MAKES IT SAFE ANYWAY. The write rule is the strict one. A rule that is
wrong in the permissive direction on reads costs a wrong reading; the same
mistake on writes costs work.

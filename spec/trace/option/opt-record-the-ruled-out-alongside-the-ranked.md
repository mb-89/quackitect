---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: opt-record-the-ruled-out-alongside-the-ranked
type: "[[option]]"
statement: record why each non-chosen candidate was excluded, not only the disposition given to the top-ranked one
cluster: cluster-the-disposition
question: how does a ranked candidate coupling get its disposition
found_by: analogy
source: differential diagnosis in clinical medicine — a ranked list of candidate conditions, where the clinician records why each excluded candidate was ruled out, not only the working diagnosis
---

## Mechanism

Abstracted one level: rank plausible candidates against a description, then
commit to a bounded decision on each. Medicine has run this since long
before software did — a differential diagnosis is not just a top pick, it
is a ranked list with a reason recorded against every candidate that was
set aside.

Transferred here: record-a-coupling-disposition would carry not just the
verdict on the winning candidate but a short reason for every other
candidate rank-candidate-couplings returned above the noise floor. A wrong
top rank becomes visible on the record instead of silently absent from it.

What did NOT transfer: a differential diagnosis converges toward ONE
condition being true. A candidate coupling has no such constraint — a node
can genuinely be coupled to several others at once, so "exactly one true
answer, the rest excluded" does not carry over. The recorded reasons must
allow more than one candidate to be disposed as real.

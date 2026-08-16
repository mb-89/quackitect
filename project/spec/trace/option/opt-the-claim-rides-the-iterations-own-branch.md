---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: opt-the-claim-rides-the-iterations-own-branch
type: "[[option]]"
statement: The claim lives on the iteration's own branch rather than on a separate claims branch, so one ref answers both whether an iteration exists and who is holding it.
cluster: the-record-life
found_by: transform
source: "SIT Task Unification, applied to the incumbent: give the iteration branch a second job"
---

## Mechanism

THE BRANCH ALREADY CARRIES THE RECORD. Give it the claim too.

- Seeding pushes `it/<id>` with the record on it, as today.
- Entering pushes a claim file onto that same branch.
- Reading the list and reading the holders become one traversal rather than
  two.
- The race is unchanged: the remote accepts one push and refuses the other as
  non-fast-forward.

## What it sheds

ONE WHOLE REF AND ITS FETCH. Today the claim ledger is its own branch, so
answering "what exists and who holds it" reads two places that can disagree
about how fresh they are.

IT ALSO SHEDS A CONSISTENCY QUESTION NOBODY HAS ASKED YET. Two refs fetched at
different moments can show an iteration that exists with no holder, or a
holder for an iteration the list does not have. One ref cannot.

AND IT HELPS THE MEASURED COST. The probe showed a batched read of 33 branches
at 58.7 ms. Folding the holder into the same read keeps it one batch rather
than two.

## What it costs

THE CLAIM RACE MOVES ONTO THE WORK BRANCH. Today a lost claim race touches
only the claims ledger. Here it is a rejected push on the branch the loser may
also want to read, so the loser's recovery is slightly more entangled with its
own work.

IT ALSO MIXES TWO LIFETIMES. The record is permanent and the claim is
transient, and putting them on one ref means the branch's history carries
claim churn forever. That is the strongest objection: an add-only ledger of
who-held-what is fine on its own branch and is noise in a record's history.

A SEPARATE REF PER ITERATION would answer that, at the cost of the ref count
this option set out to reduce.

## Where it sits against the others

IT IS INDEPENDENT OF [[opt-a-claim-is-a-lease-not-a-lock]] and composes with
it: a lease can live on either ref. It is also independent of whether a folder
exists at all, so it survives [[opt-no-worktrees-at-all-every-record-walks-on-trunk]].

THAT INDEPENDENCE IS WHY IT BELONGS ON THE CHART separately rather than inside
another option. It is a placement decision, not a lifecycle one.

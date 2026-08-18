---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-a-clone-that-keeps-its-history
type: "[[option]]"
cluster: the-bootstrap
question: how a copy is produced
statement: the copy is an ordinary clone carrying the source's history, renamed and with this project's own records removed, so an update later has a commit to merge from
found_by: contradiction
source: TRIZ separation IN LEVEL, on the contradiction that stripping the history so the copy runs standalone removes the merge base an update needs
---

## Mechanism

CLONE, THEN REMOVE WHAT IS NOISE. The copy carries the source's commits. This
project's own expedition and iteration records are deleted, and the name is
written once into the one file that holds it.

THE HISTORY IS NEVER CONSULTED AT RUN TIME. It sits there so that a later update
has a common commit to merge from, which is the only thing a three-way merge
needs and the only thing the incumbent lacks.

## What it costs

A LARGER COPY, and a receiver who can see every commit the source ever made. For
a copy handed to a colleague that is provenance; for one handed to a customer it
may be exposure, and nothing here decides which.

## How it differs from the incumbent

[[opt-a-fresh-single-commit-repository]] IS WHAT SHIPS TODAY, and it is out on
one property only. A repository sharing no commit with its source has no merge
base, so no update can be taken.

THE OWNER REQUIREMENT BEHIND IT SURVIVES EITHER WAY. It says the copy must run
WITHOUT NEEDING the source's history. A history the copy never consults
satisfies that as fully as no history at all, and only one of the two leaves a
channel open.

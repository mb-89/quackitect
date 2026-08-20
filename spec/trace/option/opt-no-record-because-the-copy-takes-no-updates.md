---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-no-record-because-the-copy-takes-no-updates
type: "[[option]]"
cluster: the-bootstrap
question: how a copy's own changes are represented
statement: nothing records what a copy changed, because a copy that never takes an update never needs to know
found_by: without
source: trimming — what if the whole authorship-accounting apparatus does not exist, and who does its job then; the answer is NOBODY, and this product already ships it
---

## Mechanism

THERE IS NOTHING TO BUILD. A copy is produced, it is complete, it is owned, and
that is the end of the relationship. The copy edits whatever it likes and
nobody ever compares it to anything.

THIS IS NOT HYPOTHETICAL. It is what this product does TODAY. Its export makes a
fresh single-commit repository with no shared history, and a repository sharing
no commit with its source has no merge base, so no update can be taken. The
accounting question never arises because the event it accounts for cannot
happen.

AND THE TRIM IS AIMED AT THE EXPENSIVE THING, which is what the method asks. The
deviation register, the declared reason, the re-declaration clock, the stale
mark, the patch series, the derived delta, the per-file manifest — every one of
them exists only because the copy wants upstream's later work. Cut the update
and all of them go together.

## Who does its job instead

NOBODY, and that is one of the four sanctioned answers. The need disappears with
the mechanism rather than moving somewhere else.

THE COPY'S OWNER ABSORBS WHAT IS LEFT. Wanting an upstream improvement, they
read it and re-implement it by hand, as the owner of any hard fork does. The
prior-art sweep found this outcome shipped and named: a fork of an AI
methodology framework carries its own command prefix and its own package, and
its update command fetches the latest fork rather than anything upstream.

## What it costs, and what actually rules it out

IT SCORES BOTTOM ON `req-overlay-drift-reported`. That requirement asks the
system to state what a copy changed, and here nothing does.

THAT ROW IS A CRITERION, NOT A DEMAND. It is `priority: should`, minted in i1.
An option scores badly against it; nothing is gated out by it.

WHAT DOES RULE THIS OPTION OUT IS AN OWNER RULING. The copy is to be able to
pull engine updates from its source, and this option deletes that outright.
A ruling binds the same way a demand does, and it is the one thing here that
is not weighed against anything.

CORRECTED 2026-08-18, at i16's candidates gate, after a demand check read every
`must` this iteration minted against every candidate. This section had called a
`should` a demand and eliminated the option on it. The elimination stands; the
reason given for it did not.

WHY THE SLIP IS WORTH KEEPING ON THE PAGE. It is the same fault as reading a
requirement by its name instead of its statement, which cost this iteration
three mis-scored axes. Here the handle was `priority` and nobody opened the
node to look. See [[raid-iss-criteria-and-demands-were-judged-from-labels-not-statements]].

## Why it is on the chart anyway

BECAUSE IT IS THE INCUMBENT. This is the behaviour shipping right now, and a
chart that omits what the system already does compares every candidate against
nothing.

BECAUSE IT IS THE CHEAPEST THING ON THE CHART BY A LARGE MARGIN, and the
distance between it and every other cell is the honest price of the update
channel. Nobody can say what the channel costs without a zero to measure from.

AND BECAUSE THE OWNER RULING IT FAILS IS RECENT AND REVERSIBLE. If taking
updates turned out not to matter, this cell is where the design would land, and
it would land there immediately rather than after building the apparatus.

## The one thing it keeps that the others lose

A COPY WITH NO CHANNEL HAS NO WAY TO BE HARMED THROUGH ONE. Every option that
opens an update path also opens a path for a bad update, a wrong merge, or a
silently clobbered edit. This one cannot fail that way, and that is worth
stating rather than treating simplicity as the only argument.

---
form: the-entry-points-are-counted-from-the-source
by: agent
signed_off: 2026-08-26T14:03:47.473Z
authors: agent
files: null
---

# Evidence form / the-entry-points-are-counted-from-the-source

## current_situation

The entry points are counted from the tree, and the hand-written list is gone.

### The numbers

The tree holds 29 entry points. The list that was the answer held six, at `deliverable/tests/help.test.ts:24`.

Of the 29, four are invoked by nothing: `backfill-minted.ts`, `brand.ts`, `package.ts` and `render-decisions.ts`.

### Reached means invoked, and getting there took two corrections

The first predicate counted any MENTION of a name and reported 15 unreached. It read only `.ts` files, so a state naming its exit script in markdown was invisible; three entry points read as unreached while being invoked every boot.

Reading markdown too gave 12. But a page of guidance naming a script still counted, so `reached` meant `written about`.

The sharpened rule requires an actual `bin/<name>` invocation, and it reads only invocation sites: the package manifest, engine source, the machine files, the cage configs and the host settings. That gave 4.

THE LIST WENT 15, THEN 12, THEN 4. That is the same collapse the widget list showed when its predicate was sharpened from what the registry names to what the panel reaches, and it fell from 21 entries to 1.

### The host configs are read because nothing here invokes a hook

Four of the twelve were `se-hook-*.ts`. Nothing in this tree runs them; the editor does, from its own settings file. A scan that read only this tree would call every hook unreachable.

### The guard cannot collapse silently

A new case asserts the enumeration finds more than the six the old list held. Without it a broken walk returns nothing and every case below passes for the wrong reason.

## built

`entryPoints()` and `unreachedEntryPoints()` in `deliverable/engine/doors.ts`.

`deliverable/tests/help.test.ts` no longer carries a list. It derives its entry points from the tree and keeps the ones that parse a switch, filtered by what the extractor actually finds rather than by a second list.

It also gains one case asserting the enumeration did not collapse.

The machine commits.

## follow_up

- The sweep is next and reports every undeclared reach across the tree. The four unreached entry points are what it will say about goal two.
- The four unreached entry points need an answer each: a door, a deletion, or an invocation somebody forgot. That is the owner's call rather than this chunk's.
- `unreachedEntryPoints` reads invocation sites only, and that definition has not been probed. It will be judged the first time the sweep reports and somebody disagrees with a name on the list.

## anything_else

Sharpening this predicate is now the second time in one record that a list shrank because the rule got better rather than because somebody wrote reasons.

The widget list fell from 21 to 1 when its predicate changed. This one fell from 15 to 4 across two corrections in the same afternoon.

That is worth carrying into the design: a departure list growing long is first evidence about the predicate, and only then about the authors. `exp-can-a-reader-act-on-the-departures-the-tree-holds` records the first instance and this is the second.

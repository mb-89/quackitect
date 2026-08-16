---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: raid-iss-a-write-can-leave-the-corpus-unparseable
type: "[[raid]]"
kind: issue
statement: se_file_write accepts a node whose frontmatter does not parse, and the break surfaces later at an unrelated call that reads the whole corpus.
owner: the driving agent
trigger: it has already fired; revisit when the first bound check ships
status: open
impact: The author is gone by the time the break is found. The error names a line and a column in a file nobody is currently editing, and every corpus reader is down until somebody works out which write caused it.
breaks_how_badly: crippling
how_likely: certain
source_refs:
  - "observed live 2026-08-16, at i6/log-risks"
  - i6 record vision — conformance moves to the WRITE path
  - raid-dec-a-check-refuses-a-wrong-write-and-reports-a-wrong-corpus
---

## What happened, in full

FOUR RAID NODES WERE WRITTEN AT THIS STATE. Each write returned `created:
true` and a hash. Nothing complained.

ONE OF THEM CARRIED THIS LINE:

```
impact: Without the seam every check is either too soft to matter or aims its refusal at whoever happened to edit next. The second is worse: it taxes an unrelated edit with somebody else's debt, which is exactly how a check becomes the thing everybody dreads.
```

`worse: it` is a colon followed by a space inside an unquoted YAML
scalar. That is a nested mapping, and the document does not parse.

THE NEXT PULL THREW, whole:

```
Nested mappings are not allowed in compact mappings at line 9, column 9
```

The pull could not serve the form. The walk stopped, and the error named
neither the file nor the write that caused it.

## Why this is the iteration's own thesis with a live case

THIS IS THE FAILURE THE GOAL DESCRIBES, exactly. A rule exists — YAML
scalars containing a colon must be quoted. It was read, or could have
been. It was broken anyway, and nothing said so at the moment it was
cheap to fix.

THE COST OF THE DELAY, measured on this instance. The write cost one
call. Finding it afterwards cost a thrown pull, a scan of four new files
for the same shape, and a patch — four calls to fix a missing pair of
quotes.

AT THE WRITE it would have cost one refusal carrying the line and the
remedy.

## The seam this sits on

IT IS UNAMBIGUOUSLY A REFUSE, not a report, under
`raid-dec-a-check-refuses-a-wrong-write-and-reports-a-wrong-corpus`.

The write itself is wrong. The author is present. The break arrived with
this edit and nobody else's debt is involved.

## Why it is the first check to build

NO BINDING IS NEEDED. It reads the bytes being written and nothing else
— no trace corpus, no element lookup, no graph walk.

SO IT ANSWERS THE WRITE-BUDGET QUESTION FROM THE CHEAP END. If a check
that parses only the incoming string cannot fit in a write, nothing can,
and `raid-asm-a-bound-check-runs-inside-the-write-budget` is settled the
hard way on the first try.

## What it does not cover

A NODE THAT PARSES AND SAYS THE WRONG THING. A missing `minted_in`, an
`id` that disagrees with the filename, a `type` naming no template.
Those need the corpus and they are the checks this iteration is actually
about. This one is the floor beneath them.

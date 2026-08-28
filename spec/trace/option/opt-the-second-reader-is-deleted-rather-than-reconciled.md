---
minted_in: i9-se-and-the-corpus-move-the-machine-state
id: opt-the-second-reader-is-deleted-rather-than-reconciled
type: "[[option]]"
statement: Delete the second corpus reader instead of making it agree, having the one place that walks trace folders itself call the canonical loader and filter its result.
cluster: the-query
question: how callers come to agree about the corpus
found_by: probe
source: probe P4 at M4, 2026-08-19 — one loadTrace definition, twenty callers through it, and one live function that walks the corpus itself
---

## What the probe measured

ONE CANONICAL READER EXISTS AND MOST CALLERS USE IT. `loadTrace` is defined once
in `engine/trace.ts` line 490, and twenty call sites across the engine go
through it.

SEVEN PLACES WALK THE TRACE TREE THEMSELVES. Five are one-off scripts under
`engine/bin/`. One is the reader's own walk. ONE IS IN THE LIVE ENGINE:
`traceFolder` at `engine/stateform.ts` line 716, which builds every form's node
lists.

ITS COMMENT SAYS IT READS THROUGH THE DOOR. It does not. It calls `readdirSync`
and `noteOf` itself.

## The two readers disagree, and the disagreement is the whole problem

THEY ANSWER DIFFERENTLY FOR A NODE THAT WILL NOT PARSE, and both answers are in
the source.

- `engine/trace.ts` line 515 DROPS IT. The comment says a node that will not
  parse is the lint's problem, and the corpus comes back without it.
- `engine/stateform.ts` line 722 KEEPS IT, as an entry whose frontmatter is an
  empty mapping and whose id is the filename.

SO A MALFORMED NODE IS INVISIBLE TO A COVERAGE CHECK AND BLANK-BUT-PRESENT IN A
FORM. That is exactly what `req-what-the-corpus-is-has-one-answer` was written
about, now with the two lines that cause it.

A THIRD PLACE ASSUMES ONE OF THE TWO. `engine/bin/preflight.ts` line 206 says
every corpus reader takes a missing frontmatter block for an empty mapping.
That describes the second reader and is false of the first.

## Mechanism

`traceFolder` CALLS `loadTrace` AND FILTERS BY TYPE. The folder-per-type layout
it walks is already what the loader records, so the filter is a property test
rather than a directory read.

## Why deleting beats reconciling

RECONCILING MEANS TWO IMPLEMENTATIONS AGREEING FOREVER. That agreement has no
enforcement, and it has already been broken once without anybody noticing.

IT ALSO INHERITS THE CACHE FOR FREE. The second reader re-reads its folder on
every form; the canonical one is stamped and served from a pass-scoped map.

## What it costs

THE FORM PATH TAKES THE WHOLE CORPUS TO USE ONE FOLDER. Probe P2 measured that
at 359 ms cold and about 12 ms once the pass has it, against 1097 nodes.

THAT NUMBER IS WHY THIS IS AN OPTION RATHER THAN OBVIOUS. A form that wanted
one folder of eleven nodes now depends on all of them being readable.

## It is not the same as the two standing options

[[opt-one-reader-answering-from-a-stamped-cache]] MAKES ONE READER FAST. This
removes the reader that is not it.

[[opt-define-the-ambiguous-case-rather-than-the-reader]] PICKS THE ANSWER for a
malformed node. This makes there be one place that can give an answer at all.
They compose, and neither implies the other.

---
form: deletion-names-dependents
by: agent
signed_off: 2026-08-16T12:25:57.991Z
authors: agent
files:
---

# Evidence form / deletion-names-dependents

## current_situation

THE DELETION HOLE IS CLOSED AT THE LANE, which is where every deletion passes.

WHAT IT CATCHES that i34 missed, measured against the four failures the row records: a deleted function orphaning two requirements, a register naming three deleted requirements, an orphaned MUST story, and seventeen dangling prose citations. All four are inbound references to a deleted id, and all four now arrive in the delete's own answer.

WHAT IT DOES NOT CATCH. A reference that never spells the id — a wikilink to a renamed alias, or a path citation with no id in it. Those were not among the four and are not claimed.

THE COST IS ONE ripgrep PASS PER DELETE of a trace node. A file with no `id:` costs nothing at all, because the sweep has nothing to search for.

## built

A DELETE NOW NAMES WHO POINTED AT THE NODE, and it names the prose citations the trace graph cannot see.

### What landed

`fileDelete` in `engine/files.ts` reads the file it is about to remove, takes the `id:` from its frontmatter, and sweeps the corpus for that id before the removal happens. The answer gains two fields.

- `cited_by` — one entry per citing file: the citing node's own id, its path, and the line numbers.
- `cited_by_total` — present only when the list was capped at 40, carrying the UNCAPPED count.

THE SECOND FIELD EXISTS BECAUSE A CAPPED LIST REPORTING ITS OWN LENGTH WOULD LIE at exactly the moment it mattered most. A deletion touching two hundred files would read as touching forty. That is the silent truncation the lane refuses everywhere else.

### Why a text sweep and not the graph

raid-asm-the-trace-graph-holds-every-reference PROBED FALSE IN PART. The frontmatter edges found i34's orphaned requirements and missed seventeen citations living in prose.

SO THE SWEEP IS OVER THE TEXT, which catches both halves at once. A `refines:` entry and a sentence are the same thing: the id, written down. A graph-only implementation would pass the coverage laws and still fail the case that was authored against it.

### It never refuses

THE ROW SAYS SO IN AS MANY WORDS: "IT DOES NOT REFUSE THE DELETE... NAMING IS THE WHOLE DEMAND. What happens next is a judgment, and it stays one."

SO A FAILING SEARCH DOES NOT BLOCK A DELETE EITHER. If ripgrep cannot run, the list comes back empty and the removal proceeds. The row asks for a list beside the deletion, never for the deletion to depend on one.

### The reds

THE AUTHORED RED WENT GREEN. `deleting a node names what points at it, including a mention in prose` — the case writes two nodes where the second cites the first ONLY in its body, deletes the first, and asserts the answer names the second.

ONE OLDER CASE NEEDED UPDATING, and the update is the row's own demand. `delete is hash-guarded` deep-equalled the whole answer as `{ deleted }`. It now expects `{ deleted, cited_by: [] }`, because the row asks for an empty list rather than silence: "nothing cites this" and "nobody asked" must not look alike.

40 of 40 green across `files.test.ts` and `lanecost.test.ts`, run `test-msvs2sxd-4`.

### The tool says so now

`se_file_delete`'s description carries the new behaviour, including that it does not refuse. A field nobody is told about is a field nobody reads.

## follow_up

NOTHING IS OWED BY THIS CHUNK.

ONE THING IS WORTH KNOWING FOR `audit-the-twenty`, which reads the fourteen unchecked defects later. The graph-versus-prose gap this chunk works around is recorded as an assumption probed false in part, and the assumption's own text still reads as though the graph were complete. Whoever walks the audit should decide whether the assumption is corrected or retired.

NEXT: the stop-at dial, which is `mirror-buttons`. Its spec half is written — the four notches and the row — and the hook and the engine hold are owed.

## anything_else


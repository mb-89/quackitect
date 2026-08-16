---
form: lane-shape
by: agent
signed_off: 2026-08-16T12:37:33.792Z
authors: agent
files:
---

# Evidence form / lane-shape

## current_situation

A CALLER WHO GUESSES A REASONABLE WORD IS UNDERSTOOD, and a caller who guesses an ambiguous one is told what the choices were.

ONE CASE WAS REWRITTEN RATHER THAN DELETED. `unknown arg NAME refused` asserted that `se_file_search {pattern}` refuses — the exact behaviour this chunk removes. Its underlying claim survives intact and is now asserted directly: the repair must appear on the result.

WHAT IS NOT COVERED. The synonym table holds four groups. A word outside them still refuses, and the refusal says so plainly rather than pretending to a completeness it does not have.

## built

TWO SHAPES FIXED, and both were costing round trips rather than breaking anything.

### se_amend patches instead of rewriting

IT ONLY TOOK `fills`: rewrite a field WHOLE. To correct a renamed reference you resent two thousand characters to change eleven, and every resend is a chance to lose a paragraph nobody meant to touch.

IT NOW TAKES `ops`, the same shape `se_file_patch` takes: `[{field, old_string, new_string, all?}]`.

- `old_string` must match the field EXACTLY ONCE, or the op refuses.
- `all: true` replaces every occurrence, said out loud rather than assumed.
- Several ops on one field CHAIN, each seeing the last one's result.
- A `fills` entry for the same field WINS, because a whole rewrite is unambiguous.

OPS BECOME FILLS BEFORE ANYTHING IS WRITTEN, so every existing guard covers both shapes without knowing which was used: the check re-run, the restore on failure, and the refusal that names `se_reopen` when the change is too big for an amend.

`fills` IS NO LONGER REQUIRED on the schema. One of the two is, and the emptiness check enforces it.

A new reader, `fieldContent` in `engine/forms.ts`, is the mirror of `withFieldContent`. It returns undefined for a missing section, which is a different answer from an empty one.

### The verbs understand each other's words

THE LANE'S VERBS DISAGREE ABOUT WHAT TO CALL THEIR SUBJECT. Search takes `query`. Glob takes `glob`. List takes `dir`. The readers and writers take `path`. Run takes `command`. Every one is defensible alone and the set is not learnable, so a caller pays a round trip for a word.

MEASURED ON THIS WALK: `pattern` cost two refusals in one call pair, once meaning `query` and once meaning `glob`.

NOTHING WAS RENAMED. A synonym table groups words by MEANING, and an unknown argument resolves against the verb's OWN declared names. The same word lands differently per verb, which is the point.

- `se_file_search {pattern}` becomes `query`
- `se_file_glob {pattern}` becomes `glob`
- `se_file_list {path}` becomes `dir`

All three verified live after a reload.

### What still refuses, and why

TWO CASES, and both are one rule: the lane does not guess at its boundary.

- The canonical name was ALREADY SENT. Then the extra word is a second thing, and rewriting one over the other would lose it.
- The word could mean two of the verb's own arguments.

The refusal now names the candidates it considered, instead of listing every accepted argument and leaving the reader to match them.

THE REPAIR IS NEVER SILENT. It rides back as `arg_repaired` on the result. The case this replaces was written after a `String(undefined)` incident, and its real claim was that a wrong name is never silently ignored. Silence was the defect; the round trip was only the remedy.

`project/guidance/refusals.md` section SE-C-101 carries all of it, because the contract says every clause's rule stands there ahead of time.

### Green

29 of 29 across `mcp.test.ts`, `refusals.test.ts`, `claimops.test.ts`, `search.test.ts` and `cage.test.ts` — run `test-msvsg4e9-3`.

## follow_up

NOTHING BLOCKS.

ONE THING FOR `audit-the-twenty`. The table is the kind of thing that rots: a verb added later with a fifth name for the same subject will not be in it, and nothing checks that. A lint over the tool schemas could catch a new argument name that duplicates an existing meaning without joining its group.

NEXT: `mirror-buttons` — the stop-at dial the owner specified, whose spec half is already written.

## anything_else


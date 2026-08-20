---
form: an-empty-source-says-so
by: agent
signed_off: 2026-08-19T12:05:03.451Z
authors: agent
files:
---

# Evidence form / an-empty-source-says-so

## current_situation

The second chunk. It shares no file with the first, and the plan says either could have been built by a second builder with no coordination.

Three cases were red before it and are green after it, with no assertion changed.

## built

`project/deliverable/engine/stateform.ts` — three edits.

- `FieldArgs` gains `empty_sources: string[]`, pointing at the design section that says why.
- `NO_ARGS` gains the empty default, so a test can spread it as before.
- `fieldArgsFor` resolves each declared source ON ITS OWN and then flattens, instead of flattening as it goes. Which source came back empty cannot be recovered from a flattened list, so the shape of the loop is the fix.

A LITERAL IS NOT A LIVE SOURCE. Only a `$name` can be empty in the sense this field means, and `$` is already reserved for the sources the corpus answers.

OBSERVED: `tests/empty-source.test.ts`, 3 cases, 3 pass, 0 fail.

## follow_up

The next chunk is `the-actor-is-stamped`, in `calllog.ts` and `render.ts`. It is the first of the three that share `render.ts` and are chained for that reason alone.

WHAT THIS CHUNK DOES NOT DO, and the design section says so: the same silence runs wider. A dependency matrix over no functions draws an empty grid and a comparison over an empty pool reports every pair settled. Those are the same rule one class up and they stay out of this record.

## anything_else

THE TWO CASES THAT WERE SUPPOSED TO BE GREEN AT observe-red went green here, and their assertions are untouched. That was the thing to watch: a case that had to be rewritten to pass would have been measuring the fix rather than the demand.

THE FIELD IS COMPUTED AND NEVER STORED. It is derived from the same resolution that produces the items, on every look, so it cannot disagree with them.

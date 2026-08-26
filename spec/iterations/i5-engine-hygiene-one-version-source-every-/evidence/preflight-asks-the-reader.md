---
form: preflight-asks-the-reader
by: agent
signed_off: 2026-08-19T12:08:25.828Z
authors: agent
files: null
---

# Evidence form / preflight-asks-the-reader

## current_situation

The fourth chunk, and the second of the three sharing `engine/render.ts`.

It removes a duplicated string, which sounds like tidying and is not: the duplicate is what let a moved file pass its own check and then surface two layers away as a missing variable.

## built

Two files.

- `render.ts` — `lookPath(root, name)` is the one place that knows where a look file lives, and `palettePath(root)` is built from it and the look list. `palette()` and `look()` both read through it, so the palette is named once in the reader rather than twice.
- `bin/preflight.ts` — imports `brandPath` and `palettePath` and asks them. The failure messages are built from the returned path with `relative`, so the file names are not spelled a third time in the prose either.

THE SILENT FALLBACK IS UNTOUCHED, which is the point of the guard case. A missing palette must not take every surface down over a colour, and a fix that removed the catch would have traded a quiet boot for a dead panel.

OBSERVED: `tests/one-config-path.test.ts`, `tests/preflight.test.ts` and `tests/palette.test.ts` — 15 cases, 15 pass, 0 fail.

## follow_up

The last chunk is `the-paint-has-one-decider`, the third file-sharer and the only one whose demand is not met today.

WHAT THIS CHUNK REVEALED AND DID NOT FIX: the same duplication exists wherever a check spells a path a reader owns. This one had a name — the palette and the brand file — and nobody has counted the rest.

## anything_else

THE MESSAGES WERE THE LAST COPY, and they are easy to miss. Preflight said `project/deliverable/brand/palette.css is missing` as a literal string, so a moved file would have produced a correct-sounding message naming the old place. The message now comes from the path the reader handed back, which means it says where the check ACTUALLY looked.

THAT IS THE WHOLE ROW IN ONE LINE. A check that names its own path can be wrong about where it looked, and a reader has no way to tell.

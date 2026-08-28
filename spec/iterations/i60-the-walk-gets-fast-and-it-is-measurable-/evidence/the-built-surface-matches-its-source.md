---
form: the-built-surface-matches-its-source
by: agent
signed_off: 2026-08-24T16:32:39.729Z
authors: agent
files: null
---

# Evidence form / the-built-surface-matches-its-source

## current_situation

The editor extension is esbuild output. Its own banner says so, and the build script says you only ever edit the source.

Nothing checked it. A hand edit to the generated file passed every test and was thrown away by the next build. A fix made in the source alone never reached the running surface at all.

Both drifts happened. The second is the expensive one, because the report says done.

## built

THE BUILD WAS ALREADY THERE. The error was not running it.

[deliverable/esbuild.mjs](deliverable/esbuild.mjs) bundles `vscode/src/extension.ts` into `vscode/extension.js` and renders the installable tree. It runs as `npm run build` from `deliverable/`.

The stop-at fix had been applied by hand to both the source and the generated file. That is two edits where one belongs, and nothing guaranteed they agreed.

The build has now been run. The generated file is what the source produces, and the locked-rung handler survives in it.

### The guard

[deliverable/tests/built-surface.test.ts](deliverable/tests/built-surface.test.ts) rebuilds from source in memory and compares against the committed file.

It reproduces the real build exactly — same working directory, same options as the build script — so a difference means the committed file is stale rather than that the test drifted.

ITS FAILURE MESSAGE CARRIES THE REMEDY. Whoever trips this does not yet know the file is generated, so the message says which file to edit and which command to run. A message that only says the bytes differ would leave them to guess.

Green in the run just taken.

## follow_up

THE SAME QUESTION IS OWED OF EVERY OTHER GENERATED ARTIFACT IN THE TREE. This guard covers one file because one file caused the failure.

Nothing here surveyed what else is generated and unchecked. That survey is worth a note rather than a guess, and it belongs with the surface work rather than with this round.

## anything_else


---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: nothing typechecks the extension
# where the token stands. The process owns these values.
status: open
---

## detail

The extension is built by src/extension/build.mjs, which calls esbuild. esbuild bundles and strips types; it never typechecks. So no command the tree runs on its own reads src/extension/tsconfig.json, and a TypeScript error in src/extension can sit in the tree with every check green.

wk-7fd604e757 fixed one such error (TS2307 on lsp.ts, a moduleResolution that could not read vscode-languageclient/node). It was found by hand, not by a check, and the same class of error can return the moment someone edits a .ts file.

The smallest case: break a type in any file under src/extension, run whatever the tree runs, and see it stay green.

## done when

- a check the tree already runs invokes node node_modules/typescript/bin/tsc --noEmit from src/extension and fails when it exits non-zero
- with a deliberate type error introduced in src/extension/lsp.ts, that check reports the error and exits non-zero; with the error removed it exits 0

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | what is gained by doing it, and not only what it does |  |  |
| [ ] | what breaks if it is never done, and not only that it stays undone |  |  |
| [ ] | the ask is small enough to review whole, or it is split first | — |  |
| [ ] | every done-when line is decidable, and names the command where one decides it |  |  |
| [ ] | the basics it stands on exist, or are minted first | — |  |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the guidance this token names was read and applied | — |  |
| [ ] | one test was written first and seen red for the reason expected |  |  |
| [ ] | the same test was seen green after the change, and named |  |  |
| [ ] | the change is git diff began..ended, the two hashes the engine wrote on this token | — |  |
| [ ] | the cleanup the change revealed is in the change, or is a token of its own | — |  |


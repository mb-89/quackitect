---
form: mark-a-card
by: agent
signed_off: 2026-08-26T15:08:35.958Z
authors: agent
files: null
---

# Evidence form / mark-a-card

## current_situation

The compiler that turns one card into the set of work it owes did not exist. Nothing read a mark, and nothing could, because no mark was defined.

The test file the test spec names did not exist either. `author-tests` wrote specifications into the trace, not code, so every chunk of this build writes its own test first and watches it fail.

### What the red looked like

The test was written against `deliverable/engine/cardwork.ts` before that file existed. The typechecker refused it by name, and the run finished `red` over 184 cases.

That is the red for this chunk, observed rather than asserted.

### A second red surfaced, and it was mine

The same run reported five trace nodes whose frontmatter would not parse. Each carried `status:` twice: `closed` near the top and a stale `open` lower down. YAML keeps the last one, so all five read as OPEN while their bodies said they were closed by an owner ruling.

I made that break earlier in this iteration, in five places. A script over the whole of `spec/` found all five rather than the two the error happened to name, and one atomic patch removed the stale line from each.

## built

TWO FILES, both new, neither touching anything that already stood.

### The compiler

`deliverable/engine/cardwork.ts`, 137 lines. One exported function, `cardWork(text)`, returning one record per marked part of one card.

Each part carries six things: the card's own id off its frontmatter, a slug unique within the card, the title with the mark taken out, the body, the line it opens on, and whether it is a heading or a list item.

Five small named functions do the reading. The fence map, the frontmatter read, what a line opens, what closes a part, and the slug. The complexity ceiling is a lint error here, so the split is structural rather than stylistic.

### The test

`deliverable/tests/card-marks-its-work.test.ts`, 16 cases, all passing. The test spec named this path and it is the path used.

The cases are split positive from negative on purpose, because the failure this guards is silent in both directions. A compiler that infers from shape either mints work nobody owes or folds several acts into one, and the card looks identical either way.

### The mark

`#work`, matched as a whole Obsidian tag. `#workshop` and `#working` are not marks, and a case holds that line.

IT IS NOT `#token`. The word `token` already names the walk's own marker in 41 places across the engine and its tests, against 743 uses naming a piece of work. Adding a 42nd would break the corpus inspection's own pass line. The reasoning is written into the decision node and the design spec, with the counts.

### What the compiler does NOT do

IT NEVER INFERS. A card with no marks returns an empty array, and a case measures that against every real method card in the tree, none of which is marked yet.

That is the safety property rather than a degenerate case. An unconverted card reports zero work; it never falls back to guessing from heading depth.

### The red, and the order it was taken in

The test was written first, against a module that did not exist. The typechecker refused it by name and the run finished `red` over 184 cases. Then the compiler was written and the run went to 185 files with the new cases passing.

### What is NOT green, and it is not this chunk

The battery stands at 1875 pass, 2 fail. Neither failure is this chunk's.

- `comment-rule.test.ts` — the tests tree holds 207 comment lines carrying a date or an owner attribution, above its ceiling of 204. The file added here carries 0, checked by re-running the guard's own two patterns over it.
- `drift.test.ts` — 898 door accesses against a ceiling of 800. The assertion above it passed, so the corpus is still read exactly once. The ceiling scales with the filler count while the cost scales with the claimful state count, which grew from 25 to 35.

BOTH ARE COMMITTED AT HEAD. `git status deliverable` shows no committed test file changed by this build. They are recorded with their measurements and belong to `fix-findings`.

### One thing fixed on the way, because it blocked the run

Five trace nodes carried `status:` twice, `closed` above and a stale `open` below. YAML keeps the last, so all five read as open while their bodies said an owner ruling closed them. The corpus would not parse.

A script over the whole of `spec/` found all five rather than the two the error named, and one atomic patch removed the stale line from each.

## follow_up

Three things carry forward, and two of them are the next chunk.

### Straight into prove-the-format

The compiler is built and nothing is marked. The next chunk marks a FEW cards and checks the format holds, which is the owner's own ruling on the order of work.

The two cards to mark are the ones that disagree. One whose steps are headings, and the retro whose steps are a numbered list. If the format holds on both, it holds.

### The corpus pass stays last

Marking all the cards is the seventh chunk, not this one. Marking them against an unproven format would be a guess repeated many times over.

### The word collision is now a build task, not a note

41 uses of `token` name the walk's own marker. The mark deliberately does not add a 42nd, so the rename is still owed and it belongs to the corpus pass.

It is recorded in the decision node with the counts, so the chunk that does it has the evidence rather than the assertion.

## anything_else


---
form: complexity-stays-out-of-the-ledger
by: agent
signed_off: 2026-08-20T20:25:19.322Z
authors: agent
files: null
---

# Evidence form / complexity-stays-out-of-the-ledger

## current_situation

The account chain is built. This is the sizing chain's first chunk and the one `gate-prototype` named as owed before anything else: `req-the-complexity-value-is-read-live-and-never-pinned` is graded fatal, wants one assertion, and guards three records that are open right now.

ITS TEST COULD NOT MEAN ANYTHING WHILE NO CELL COULD CARRY A COMPLEXITY. Three of its four cases assert that changing one moves no digest, and with nothing to change they passed on a digest that never moved. So the loader half rides here rather than in the next chunk.

## built

A CELL CARRIES A DIFFICULTY AND THE LOADER READS IT. `<column>_complexity: C3/R1` on the row's frontmatter, beside `<column>` and `<column>_note`.

IT IS A SCALAR AND THE DESIGN SPEC SAID A NESTED MAP. `dsp-the-sizing-block` proposed a `complexity:` block keyed by column. The loader's own comment says why that cannot work: "Both are scalars, because a Bases table edits a cell inline and cannot edit a nested map." A shape the surface cannot edit puts the rating out of reach of the person who does the rating. The spec is corrected.

AN UNREADABLE VALUE REFUSES NAMING BOTH VOCABULARIES. `C9/R9` says what the shape is and which words each half may take, rather than failing somewhere downstream.

A ROW THAT SEEDS A SUB-MACHINE MAY NOT CARRY ONE, and that is `exp-two-hands-rating-the-same-six-cells`'s promotion arriving early. Two readers rated six cells, agreed on five, and disagreed on exactly the one row of that shape — both naming it their least-sure, for the same reason.

### The load-time refusal is off until the matrix says it is rated

`req-every-matrix-row-declares-its-complexity` asks for a refusal WHEN THE MATRIX IS LOADED. Turning that on today makes the product unloadable, because none of the 154 active cells carries a value and rating them is the matrix owner's judgement rather than this build's — `specify-build` says so on its own face.

RESOLVED SO BOTH HALVES STAY TRUE. A missing rating refuses at the POINT OF USE: `difficultyOf` throws for a step that has none, so nothing ever proceeds without one. The load-time refusal turns on when the matrix folder's own README carries the line saying every active cell is rated.

THE CHECK READS THE FILE RATHER THAN A FLAG IN CODE, so saying it and making it binding are one act instead of two that can disagree.

### The four guards, and the one that keeps them honest

`tests/sizing-live-read.test.ts` is green. A complexity change moves neither the demand digest nor the step shape, and a change the ledger IS about still moves it.

THE LAST CASE IS THE NEGATIVE CONTROL and it is not decoration: without it the three guards pass on a digest that never moves at all.

NOTHING IN `demandsFor` OR `shapeOf` WAS TOUCHED. The guard holds because the difficulty reaches neither, which was already true and is now checked rather than assumed.

## follow_up

THE SEAM IS A DEBT AND IT SHOULD BE VISIBLE AS ONE. Until the README line exists, `req-every-matrix-row-declares-its-complexity` is satisfied at the point of use and not at load, which is narrower than what it asks for. A register entry is owed and `trace-design` is the next state that can write one.

THE SPEC WAS CORRECTED WITHOUT RE-SIGNING `specify-build` YET. The claim that state signed — that the design below the line is specified — still stands; what changed is a shape inside it. Re-signing is owed and is cheaper once the sizing chain is finished, so it happens at the end of the build rather than four times during it.

THE NEXT CHUNK NEEDS THE README MARK IN ITS FIXTURES. `tests/sizing-block.test.ts` asserts the load-time refusal, which cannot fire while the seam is closed, so its fixture has to write the line before it can mean anything.

## anything_else


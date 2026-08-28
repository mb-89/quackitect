---
form: fix-findings
by: agent
signed_off: 2026-08-19T12:49:37.834Z
authors: agent
files: null
---

# Evidence form / fix-findings

## current_situation

All eleven findings are dispositioned in one pass. Nine were fixed, one was repaired outside the repository, and one is recorded rather than built.

The typechecker is green, the code linter is green over 307 files, and the files every finding touched pass 101 cases.

The battery is this state's own exit and fires on this submit.

## follow_up

gate-implementation is next. It rules on the internal-quality checklist, the debt taken, and the risks — including the three engine repairs that landed outside the blessed scope.

ONE FINDING IS DELIBERATELY NOT BUILT. The panel draws the third kind of green with a dashed stroke, and nothing on screen says what a dash means. The row's measure asks for three distinguishable paints and gets them; a colour legend is a different demand and this record does not invent one.

THE FIVE REQUIREMENTS NOW STAND. Two of them did not when the tester looked: the empty-source row had no renderer, and the configuration-path row was counted in one file instead of across the engine. Both are built and both are measured the way the row asks.

## anything_else

THE ELEVEN, EACH WITH ITS DISPOSITION AND HOW IT WAS OBSERVED.

F1, THE TYPECHECK — FIXED. `empty_sources` was added as a required member of `FieldArgs` and filled at two of three construction sites. The third is the literal inside `claimProblems`, which is what decides whether a standing claim still passes. It now fills it with an empty list, because a re-check resolves no live source and can name none as empty. `tsc -p . --noEmit` exits 0.

F2, THE BOOT — FIXED, AND THE FIX WAS THE WRONG SHAPE FIRST. Reaching the palette's path through `render.ts` dragged the whole drawing graph into preflight, and with it a package a test root does not install. The paths now live in `brand.ts`, which imports nothing but node builtins — one module owns the brand folder, which is what the requirement always meant. Preflight runs in 721 ms and exits 0, against 944 to 1029 ms before. A new case asserts preflight imports no renderer, so the shape cannot come back.

F3, THE EMPTY-SOURCE RENDERER — FIXED. The field now draws a line naming the source that came back empty. The test gained a SEAM case: one half asserts the payload carries the fact, the other that the surface reads it. A payload with no surface is what the finding was.

F4, THE HOLLOW ACTOR CASE — FIXED. The `as` assertion suppressed excess-property checking, so the case passed against no design at all. The casts are gone and the file says why in its header.

F5, THE HOLLOW GUARD CASE — FIXED. `catch` was matched anywhere in a file with three of them. It is now anchored to the palette reader's own body and also asserts the fallback it returns.

F6, THE PATH COUNT — FIXED, AND IT FOUND MORE THAN THE TESTER DID. The row demands one occurrence per configuration path across the reader and every check. The ratchet now counts the WHOLE engine rather than preflight alone, which turned up two further namings after the first three were folded in: a fallback comparing a literal file name, and a help line spelling the path for a person. Both build from the one place now. The count reads 1 for each file.

F7, THE UNPINNED REPAIRS — FIXED. `tests/bound-table-refs.test.ts` pins all three, and a fifth case guards the relaxation: an empty register is an answer, and a row naming no node is still a defect.

F8, THE CONTAMINATED CACHE — REPAIRED. The template directory is deleted; helpers rebuilds it from the sources' fingerprint. It was already stale, because the fingerprint moved when preflight changed.

F9, THE OPTIONAL STAMP — FIXED as a ratchet. A case walks every `.append({` in the engine and refuses one without an actor. Optional is right for the record — history carries none — so the count is held where a type cannot hold it.

F10, THE BRITTLE CLASS MATCHES — FIXED. Two assertions matched `class="state done"` with the closing quote, which a law-proven green would have broken. They now match the prefix, and say why.

F11, THE MISSING LEGEND — RECORDED, NOT BUILT. Outside the row's measure, and named in follow_up rather than folded in.

WHAT THE TESTER GOT RIGHT THAT I WOULD NOT HAVE. F4 and F5 are cases I wrote, ran, and watched go red and then green. Both were hollow, and both looked like evidence. That is exactly what the fresh-eyes rule is for, and it is the strongest argument in this record for spawning a tester at all.

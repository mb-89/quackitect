---
form: define-actual
amended: 2026-08-26T13:05:41.430Z by agent — an importer count is not an adherence figure, and the probe measured the other side at 81
by: agent
signed_off: 2026-08-26T11:09:27.501Z
authors: agent
files: null
---

# Evidence form / define-actual

## current_situation

THE VISION IS SIGNED and the falsifier assumption has been probed. This state writes down what actually stands, with a witness for every number.

EVERY FIGURE BELOW IS EITHER FROM THE SEEDED SURVEY OF 2026-08-26 OR FROM THE PROBE RUN IN THIS MILESTONE. Nothing here is estimated.

## as_is

### What is good

THE PATH JAIL IS USED, WHICH IS NOT THE SAME AS ADHERED. `deliverable/engine/paths.ts` has 20 importers, and an internal door can hold here on that evidence.

MEASURED AGAINST THE OTHER SIDE, 2026-08-26: 81 modules reach the filesystem directly, 15 of them in both sets. So 66 modules reach the disk with the resolver having nothing to say, and 15 take an address and then reach anyway.

THIS SENTENCE ORIGINALLY CALLED IT THE ONE WELL-ADHERED INTERNAL SEAM, on a one-sided count. An importer count is not an adherence figure, and find_by_probing named that as the second time this record made the same mistake.

THE PATTERN IS ALREADY BUILT ONCE, FOR WIDGETS. `deliverable/machines/widget-exemptions.md` plus the SE-C-146 section of `guidance/refusals.md` give one rule, one registry, one declared hatch with a reason per line, and two callers with no second copy. Witness: those two files.

`run.ts` IS ALREADY WELL FACTORED FOR ITS JOB. Three module-local path helpers — `jobDir` at `deliverable/engine/run.ts` line 438, `jobPath` at line 442, `estimateLog` at line 1403 — jail every one of its ten writes under `.se/jobs`. Nothing about it needs fixing.

THE LANE ITSELF IS A WORKING ONE-DOOR SYSTEM. `files.ts` and `web.ts` face the agent, and the cage list in `.claude/settings.json` refuses the native tools. The principle is proven in the direction that faces outward.

### What is bad

THE ENGINE HAS NO DOOR FOR ITSELF. 79 engine modules import `node:fs` directly. Witness: the seeded survey of 2026-08-26, recorded in `spec/iterations/i54-everything-exported-has-a-door-a-sweep-o/record.md`.

THE SCALE, MEASURED OVER 180 SOURCE FILES. 93 reach disk or the network directly. 398 disk sites. 52 network sites. Engine core: 50 files, 117 writes, 272 reads.

THIRTY WRITES SHARE ONE UNSAFE SHAPE. 23 of the 64 sites in the seven heaviest modules are a read-modify-write of a claim, record or form file, and 7 more are the `mkdirSync(dirname(...))` that precedes one.

NONE OF THE THIRTY REPLACES ITS FILE ATOMICALLY, and none checks a hash before overwriting. `deliverable/engine/sessionclaims.ts` writes `h.instanceAbs` from eight separate call sites — lines 929, 1016, 1022, 1037, 1083, 1135, 1196 and 1361 — and a signature lives in that file.

THE CONTAINMENT PREDICATE IS WRITTEN FIVE TIMES OUTSIDE THE JAIL THAT OWNS IT. Witnesses: `benchmark.ts` line 195 (`ownTree`), `produce.ts` line 77 (`travels`), plus one each in `tables.ts`, `bases.ts` and `machines/compile.ts`. `paths.ts` uses it four times itself.

THE TWO COPIES GUARDING A RECURSIVE DELETE DISAGREE. `ownTree` returns `rel !== "" && !rel.startsWith("..") && !isAbsolute(rel)`. `travels` returns `rel === ""` for the root and omits the absolute-path test. They guard `rmSync` at `benchmark.ts` line 393 and `cpSync` at `produce.ts` line 188, and `produce.ts` line 219 runs `rmSync(dest, { recursive: true, force: true })`.

THERE IS NO WARM MODEL AND SIX PRIVATE CACHES. `vault.ts`, `trace.ts`, `vocabulary.ts`, `rigor-matrix.ts`, `machines/compile.ts` and `iterations-draw.ts`.

THE INTERNET DOOR IS UNMEASURED IN THE SAME WAY. 52 network sites were counted and none has been read.

### What is neither

THE 42-TO-22 SPLIT IS THE HONEST MIDDLE. A door improves 42 of the 64 writes examined and lengthens 22. The assumption survives, and it survives narrower than it was written.

THE IMPORTER COUNTS ON `files.ts` AND `web.ts` ARE NOT ADHERENCE FIGURES. Those two face the agent, not the engine. That reading was made once and retracted, and it must not be made again.

### Where the evidence stops

THREE THINGS ARE ASSERTED IN THIS ITERATION AND NOT YET MEASURED.

- Whether the internet door pays. 52 sites counted, none read.
- Whether the warm model pays. Six caches named, none read.
- Whether the remaining 53 engine-core writes, outside the seven modules, look like the 42 or like the 22.

NONE OF THE THREE SHOULD INHERIT THE DISK RESULT, in either direction. A verdict carried from one thing to another because they share a part is not a verdict.

## follow_up

1. READ THE 52 NETWORK SITES BEFORE SIZING THE INTERNET DOOR. The disk half now has a measurement and this half has a count. They are not the same evidence.

2. SPOT-CHECK THE OTHER 53 ENGINE-CORE WRITES. The seven modules were chosen because they are the heaviest, which is a biased sample by construction. A short pass over a random ten says whether 42-to-22 generalises.

3. EXPORT THE CONTAINMENT PREDICATE FROM `paths.ts` AND DELETE THE FIVE COPIES. This is the smallest change in the iteration with the clearest evidence behind it, and it closes a live disagreement between two guards on two recursive deletes.

4. CARRY THE `run.ts` DISMISSAL FORWARD WITH ITS REASON. 10 of 10 in the lengthen pile. The owner asked for dismissals to be recorded, and this is the one the evidence supports.

5. THE PRIOR-ART GAPS STAY OPEN AND NAMED. Capability-based security was not reached at a primary source. Ports and adapters, the anti-corruption layer and fitness functions have no exception mechanism to compare against.

## anything_else

TWO METHOD OBSERVATIONS FROM WALKING THIS STATE, recorded because they are about the work rather than the process.

THE SEVEN MODULES ARE A BIASED SAMPLE AND THE PROBE SAID SO NOWHERE. They were picked for carrying the most writes, and modules that carry many writes are more likely to repeat a shape. The 42-to-22 figure is therefore an upper bound on how well a door does across all 117, not an estimate of it. This is written into the follow-up as item 2.

THE PROBE FOUND SOMETHING IT WAS NOT LOOKING FOR, and it is the better finding. The assumption asked whether a disk door pays. The answer is a qualified yes. The unasked question — how many times has the engine re-implemented a check that `paths.ts` already owns — has a sharper answer: five times, with two of the copies disagreeing while guarding destructive writes.

THAT SECOND FINDING NEEDED NO NEW DOOR. It needs an export from a seam that already has 20 importers.

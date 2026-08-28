---
form: verification
amended: 2026-08-24T20:01:20.031Z by agent — the suite count this form recorded is superseded, and the pugh case it called pre-existing has since been joined by the one that was owed
by: agent
signed_off: 2026-08-24T18:11:13.731Z
reopened: 2026-08-24T18:03:14.375Z — Its claims list was signed against four chunks and eight now stand. The four added ones repaid the route-drawer debt, gave the pinned run its per-hop timings, and stopped the datum pick charging a candidate for axes nobody scored; a fourth is deliberately unbuilt. Three of them landed with no observed red, and a claims table that does not say so would read as verified work that nothing watched fail.
judgment: passed at 2026-08-24T17:09:30.063Z
authors: agent
files: null
---

# Evidence form / verification

## current_situation

A second fix pass, larger than the first, and a second round with the same cold gatekeeper. It found a defect I had introduced and I fixed it.

### What the gatekeeper caught this time

MY SCORE-CELL FIX HAD THE OPPOSITE BIAS. Averaging over scored axes meant a candidate scored ONCE at 5 outranked one scored five times at 4. The old bug punished silence; mine rewarded it.

The comparison now runs on the axes EVERY candidate has scored. Nobody is charged for a hole and nobody profits from one, because the axes where holes live are not in the comparison at all.

### Three more it raised, all real

- The reading flag was not re-entrant. It is saved and restored now rather than cleared, because the mirror shares the session.
- A back hop never asserts its reading at all, which is older than this change and would have made the safety argument read as covering more than it does. Written into the design spec.
- A lookup failure in the drawer's question answers `not passed`, which is the same collapse the function exists to undo. It is safe because the only reader tests for `deciding`, and the comment now says exactly that rather than leaving it to be inferred.

### And one correction to my own claim

I had written that the route-drawer repayment was verified by observation. THAT IS EVIDENCE THE PATH RAN, NOT THAT IT IS RIGHT. The chunk's form is amended and the standing is now built, unreddened and untested.

## claims

- [x] every route hop carries `ms` and every search reports `visited` — inspected at deliverable/engine/route.ts:34, and all four return paths of the search set `visited`
- [x] the stop-at notch rides every pull — inspected in `head()` at deliverable/engine/session.ts, and counted live on the call log
- [x] the stop hook records all three of its outcomes — eight exit points, eight lifecycle lines
- [x] the stop hook sees a target set through EITHER aiming door — the agent's `se_aim` and the person's own route on the mirror
- [x] pointing draws its route and skips only the walking — no caller anywhere passes a second argument to `setTarget`
- [x] the built-surface guard runs the SAME build as the build script — both import deliverable/engine/vscodebuild.ts, so a copy cannot drift
- [x] a sweep records what each hop cost to WALK, not to draw — it times the actual advance, and one exit point carries it to all four sweep endings
- [x] a hop the sweep walks OVER does not owe its reading, and the landing still does — the route is redrawn every hop, so the flag is false exactly on the hop the walk lands on
- [x] the rigor matrix reports the rows it has — the stray project copy is excluded
- [x] the suite is green — 465 of 465 at the validation gate, up from 442 when this line was first written, and the datum pick now carries the hole case that was owed rather than only the pre-existing ones
- [owed] three chunks are built and UNREDDENED — each carries a guard, and none was watched failing — spec/trace/raid/raid-iss-three-chunks-landed-with-no-check-and-no-observed-red.md
- [owed] re-signing an answer knocks down what rests on it EVERY time — spec/trace/raid/raid-iss-the-knock-down-has-no-reproduction-of-the-case-that-fails.md
- [owed] a slow answer does not freeze the surface beside it — spec/trace/raid/raid-iss-the-surface-row-has-no-harness-that-could-fail-it.md
- [owed] the failed-route row is checked under load — spec/trace/raid/raid-iss-the-loaded-half-of-the-failed-route-row-is-not-implemented.md

## follow_up

### The gatekeeper ruled on the open question and I accept it

IT SAID THREE CHUNKS WITHOUT AN OBSERVED RED DOES NOT HOLD THE GATE. The four requirement rows kept their reds, and none of the three is a requirement's own measure — they are repairs to existing behaviour.

BUT IT REFUSED THE WORD VERIFIED for them, and a second reviewer refused the word UNTESTED. Each of the three carries a guard; what none carries is proof the guard can fail. The claims table says built and unreddened, which is the standing that calls for the right work.

### One question it left for the gate

WHETHER THE PUGH CHANGE IS CORRECT, not merely better. It called the mean-versus-evidence-count question a ruling somebody has to make. The common-axis form answers it: candidates are compared only where all of them were measured.

THE EXISTING PUGH CASES PASS AGAINST IT, which is validation from a test nobody wrote for this round.

### What is still unproven

NO TEST STOPS A SWEEP MID-ROUTE AND THEN ASSERTS THE NEXT PULL ANSWERS `read`. The fallback half of the reading-skip's safety argument rests on that, and the gatekeeper named it as unproven in the suite. It is honest to say so rather than to call the argument closed.

## anything_else

WHAT THE TESTER COULD NOT CHECK, said plainly rather than left blank.

- Whether the built-surface guard passes right now. It read the guard and judged it sound; only running it compares the bytes.
- Which case in `files.test.ts` crashes. The walker it inspected skips `scratchpad` correctly, so that crash is elsewhere in the file.
- Whether per-hop times survive the call log's response cap on a long route.

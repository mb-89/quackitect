---
kind: method
catalog: triz_separations
catalog_sections: THE FOUR SEPARATIONS
statement: "TRIZ: state the contradiction, then refuse the compromise — somebody already solved a problem shaped like yours, and the principles that worked are written down."
source: "@ai/sya_kb/digest/sya/01_Architecting.md; Altshuller"
---

## Situation

Two things you want are fighting. Making one better makes the other worse.

The ordinary move is to pick a point on the curve between them. TRIZ says
that curve is an assumption, and somebody has probably already broken it.

Reach for it at M4 enumerate-space, on a function cluster where two
requirements genuinely conflict. It is the finder that turns up options
nobody proposed because they looked impossible.

## THE CLAIM UNDERNEATH IT #work

Somebody already solved your problem, or one shaped like it, in a field you
have never read.

Altshuller read a few hundred thousand patents to test that, and found the
same handful of moves recurring across every industry. The 40 principles are
those moves, and the matrix is which ones worked on which conflict.

So this is not creativity. It is a lookup, and that is its whole appeal.

## THE PROCEDURE

Four steps, and the second is the one people skip.

1. STATE THE CONTRADICTION IN ONE LINE — improving X degrades Y. #work
   - Root Conflict Analysis where the real conflict hides under a symptom.
2. RESTATE IT IN THE STANDARD PARAMETERS. #work
   - Not "faster but less safe". Speed against reliability.
   - The matrix is indexed by those words and no others, so a conflict left
     in your own vocabulary cannot be looked up at all.
3. TRY THE FOUR SEPARATIONS FIRST #work

   They are cheaper than the matrix and they dissolve more conflicts than it
   does.
4. LOOK UP THE PRINCIPLES, then reformulate so BOTH sides win. #work

## THE FOUR SEPARATIONS #work

The foundational idea, and the one to reach for before anything else.

A contradiction often exists only because two demands were assumed to apply
at once. Question the assumption on any of four axes.

- IN TIME — both, at different moments.
- IN SPACE — both, in different places.
- IN RELATION — both, for different observers.
- IN LEVEL — one at the part, the other at the whole.
- NONE — no separation dissolved it, so the matrix was consulted.

The fifth line is not Altshuller's. It is the honest answer when the four
fail, and a row that cannot say it would have to leave the column blank —
which reads exactly like a question nobody asked.

## THE 40 INVENTIVE PRINCIPLES

The reference, so nobody looks it up again.

1. Segmentation
2. Extraction
3. Local quality
4. Asymmetry
5. Combining
6. Universality
7. Nesting
8. Counterweight
9. Prior counter-action
10. Prior action
11. Cushion in advance
12. Equipotentiality
13. Inversion
14. Spheroidality
15. Dynamicity
16. Partial or overdone action
17. New dimension
18. Mechanical vibration
19. Periodic action
20. Continuity of useful action
21. Rushing through
22. Convert harm to benefit
23. Feedback
24. Mediator
25. Self-service
26. Copying
27. Cheap short-lived object
28. Replace a mechanical system
29. Pneumatic or hydraulic construction
30. Flexible membranes or thin film
31. Porous material
32. Changing colour
33. Homogeneity
34. Rejecting and regenerating parts
35. Transforming physical or chemical state
36. Phase transformation
37. Thermal expansion
38. Strong oxidizers
39. Inert environment
40. Composite materials

## WHICH ONES ACTUALLY BITE ON SOFTWARE #work

Most of the list is physical, and pretending otherwise wastes the pass. These
are the ones that transfer, with what they look like here.

- SEGMENTATION. Split the thing that is too big to change safely.
- EXTRACTION. Pull the one troublesome part out rather than redesigning
  around it.
- LOCAL QUALITY. Stop making every part uniform; let one part be different.
- PRIOR ACTION. Do the expensive work before it is asked for.
- CUSHION IN ADVANCE. Add the fallback before the failure.
- INVERSION. Do it backwards, so the caller becomes the callee.
- DYNAMICITY. What is fixed becomes adjustable at run time.
- PARTIAL OR OVERDONE ACTION. Do slightly too much and trim, where exactly
  enough is hard.
- CONVERT HARM TO BENEFIT. The failure becomes the signal.
- FEEDBACK. Measure the output and feed it back into the control.
- MEDIATOR. Put a third thing between two that cannot agree.
- SELF-SERVICE. The thing maintains itself.
- COPYING. Work on a cheap replica instead of the expensive original.
- CHEAP SHORT-LIVED OBJECT. Many disposable instead of one durable.
- REJECTING AND REGENERATING. Throw the part away and rebuild it.

## THE CONTRADICTION MATRIX #work

Rows are the parameter that DEGRADES, columns the one that IMPROVES. The cell
holds the principle numbers that historically resolved that pair.

39 parameters each way, so 1,521 cells. Most hold between one and four
numbers, and many are empty.

THE GRID IS IN THE REPOSITORY, vendored under MIT at
`deliverable/vendor/triz/triz-matrix.json`. All 39 parameters and
1,254 filled cells, with provenance and the licence beside it.

A `software_equivalent` rides every parameter, which is exactly what step 2
needs. "Speed against reliability" becomes parameter 9 against parameter 27
without guessing.

IT IS NOT A MARKDOWN TABLE, and never will be. 1,521 cells of prose is
unreadable and unmaintainable, and the matrix is DATA rather than writing.

THE SEPARATIONS STILL COME FIRST. They resolve more conflicts than the matrix
does and they need no lookup at all. The grid is the fallback, not the entry
point.

## WHAT TRIZ IS ALSO FOR #work

Beyond contradictions, three uses the corpus names.

- ELIMINATING A HARMFUL FUNCTION. Trimming asks whether the part can go
  entirely.
- EVOLUTIONARY POTENTIAL. Where a technical system is on its S-curve, and
  what usually comes next.
- FINDING IDEAS OUTSIDE YOUR OWN SKILL. The whole point of a lookup table.

## A WORKED EXAMPLE

This engine, mid-2026. The lane checks every claim against the whole trace
corpus on submit.

STEP 1 — THE CONTRADICTION, IN ONE LINE. Making the check exhaustive makes
the form slow to open. Note the shape: a MOVE ("making the check
exhaustive"), then what it improves, then what it degrades. A line naming no
move is not a contradiction, it is two nouns beside each other.

STEP 2 — IN THE STANDARD PARAMETERS. Improving is 29, Manufacturing
precision — its software equivalent is correctness of the produced artifact.
Degrading is 9, Speed. Now the pair is lookup-able. "Thorough but slow" is
not.

STEP 3 — THE SEPARATIONS, FIRST. In time: the exhaustive check does not have
to run when the form OPENS. It has to run when the form SUBMITS. Both demands
were assumed to apply at one moment, and they never did.

STEP 4 — the separation dissolved it, so no principle lookup was needed. Had
it failed, row 9 against column 29 in the vendored grid would name the
principles that historically worked.

THE ROW THAT RECORDS THIS:

| cluster | contradiction | improving | degrading | separation |
| --- | --- | --- | --- | --- |
| claim checking | making the check exhaustive makes the form slow to open | 29 Manufacturing precision | 9 Speed | IN TIME |

The option node that came out of it names the separation as its source. An
idea with no lineage is not a TRIZ finding.

## THE FAILURE MODE #work

Reaching for the principles before stating the contradiction properly.

A vague conflict maps to every principle and therefore to none. The work is
in step 2, and a pass that skips it produces a list of forty words and no
ideas.

## Sources

- The SyA corpus at @ai/sya_kb, chapter 01. The 40 principles, the 39 and
  revised 48 parameters, the four separations, and the tool list.
- Altshuller, via that corpus. The patent study the claim rests on.
- triz40.com, named there as the online matrix.
- [[meth-morphological-analysis]] for the chart these options fill.

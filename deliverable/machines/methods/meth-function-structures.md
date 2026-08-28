---
kind: method
statement: "Deriving the function structure: from the requirement set to a solution-neutral tree of what the system does — verb plus noun, every requirement served, every function asked for."
---

## Situation

Guidance for M3 derive-functions. This is the one card the step draws from.
What a function NODE looks like is [[function]]. Partitioning the structure
into clusters is M4's work, in [[meth-function-dsm]].

Requirements come first, then functions. That order is the method's, not a
preference: task clarification before concepting (Pahl & Beitz, VDI 2221),
and logical decomposition after the requirements baseline (NASA, INCOSE).

## WHAT THIS STEP PRODUCES #work

A tree of function nodes, and nothing else.

- The root is the OVERALL FUNCTION. One sentence saying what the whole
  system does.
- Beneath it hang sub-functions, nested through the dotted id.
- Every function names the requirements it serves.
- Every function names what goes in and what comes out.

The tree is the feedstock of M4. Candidates are enumerated from these
functions, so a function that named a technology has already chosen the
winner.

## THE PROCEDURE

Work top-down and bottom-up, then reconcile. Neither direction finds
everything.

1. State the overall function #work

   Abstract until the statement holds for every design you would consider.
2. Break it into sub-functions #work

   Verb plus noun. Stop when a child would name a solution.
3. Walk the requirement register #work

   Assign each requirement to the function
   that serves it.
4. Walk the use-case steps. Every step must land on a function. #work
5. Write the flows. What each function consumes and produces. #work
6. Reconcile. Fix what the two walks disagree about. #work

## THE FOUR HOLES, AND WHERE EACH ONE SHOWS #work

Each has its own tell, and each is found by a different walk.

- A REQUIREMENT NO FUNCTION SERVES — a demand nothing does. The coverage
  check finds it mechanically, at the submit.
- A FUNCTION NO REQUIREMENT ASKED FOR — work somebody invented. The same
  check finds it, from the other side.
- A USE-CASE STEP NO FUNCTION COVERS. Found by walking the steps, never by
  the requirement walk. This is why both walks run.
- AN OUTPUT NOBODY CONSUMES — found only by writing the flows. It means
  either a missing function, or a function doing work nobody needs.

## SOLUTION-NEUTRAL IS THE HARD PART #work

The test is one question. Could two honestly different designs both do this?

Three tells that a solution slipped in:

- A NOUN THAT IS A PRODUCT. A database, a queue, a file format, a vendor.
- A VERB THAT IS AN IMPLEMENTATION — "cache", "index", "poll". Each of those
  names how, not what.
- A FUNCTION THAT ONLY MAKES SENSE GIVEN ONE DESIGN. The subtlest, and the
  one no word list catches. Ask what it would be called in a design you
  rejected.

Where the solution is genuinely forced, it is a CONSTRAINT and belongs in the
requirement register with the norm or decision that binds it. It is not a
function.

## HOW DEEP TO GO #work

Stop when the next split would name a solution, or when the child would be
allocated to the same element as its parent.

AND STOP WHERE THE CHILD SERVES NOBODY. Name the person or the hand this
function is for, and say what they hold once it has run. A function whose only
beneficiary is the function above it is an internal act, not a function.

THAT TEST IS WHAT THE OTHER TWO MISS. Both of them ask about the SHAPE of the
split. This one asks who it is for, and it is the one that catches a tree
drifting into the steps a mechanism takes internally.

Three levels is usually enough. A deeper tree is normally a partition that
arrived early, and partitioning is M4's.

Depth is not rigor. A tree with forty leaves and no flows is worth less than
one with twelve leaves that say what crosses each boundary.

## THE STRUCTURE WILL MOVE, AND THAT IS NORMAL #work

Deriving functions exposes requirements that were vague, missing or wrong.
Go back and fix them. The two peaks are worked together, not in one pass
each ([[meth-twin-peaks]]).

A function you cannot trace to a requirement is one of two things. Either it
is unnecessary, or the requirement was never written. Both are findings, and
neither is fixed by deleting the function quietly.

## Sources

- Pahl & Beitz, Konstruktionslehre. Overall function, sub-functions, and the
  solution-neutral rule.
- VDI 2221. The stage order: clarify, then function, then concept.
- NASA Systems Engineering Handbook. Logical decomposition.
- INCOSE Systems Engineering Handbook, 4th edition. Logical architecture
  definition, with allocation as a separate act.
- FAST diagramming. How-down and why-up, the cross-check that catches a
  function with no why.
- IDEF0. Inputs, outputs and controls.
- The SyA corpus at @ai/sya_kb, chapter 01: functional partitioning and the
  assignment of qualities sit before element structure, and allocation is
  its own step.
- v1's design-input chapter, at ref main.

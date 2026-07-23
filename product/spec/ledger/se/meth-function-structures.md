---
id: se.meth-function-structures
kind: method
statement: "Functional decomposition: from the requirement set to a solution-neutral function structure - verb plus noun, overall function to sub-functions."
provenance:
  iteration: i2g-tutorial-machine
  ai_involvement: agent-drafted
---

## Situation
M3, after the requirements (task clarification first, then functions - Pahl & Beitz, VDI 2221, NASA logical decomposition). The function structure is the last artifact of design input and the feedstock of candidate generation.

## Procedure
- Abstract to the essential problems; state the overall function; decompose into sub-functions - verb + noun, solution-neutral (never naming a technology).
- Cross-check top-down against bottom-up: FAST (how-down / why-up) catches functions without a why; use-case steps catch functions nobody asked for.
- Every requirement maps to at least one function (`requires` edge); every use-case step is covered - both are matrix filters at the gate.
- Functions carry inputs, outputs and controls where they matter (IDEF0 discipline, lightly).
- Expect iteration with the requirements ([[meth-twin-peaks]]).

## Sources
Pahl & Beitz function structures; NASA SE handbook logical decomposition; FAST; IDEF0.
